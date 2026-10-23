import type { LookupAddress } from "node:dns";
import { lookup as dnsLookup } from "node:dns/promises";
import type { Readable } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { Agent, buildConnector, request } from "undici";
import { isBlockedAddress, targetProblem } from "./address";

/**
 * The ONE function for outgoing requests to third-party sites (features.md R.7 «Sicherheit»,
 * deployment.md §0.8): link preview pages and preview images.
 *
 * - `https:` only, port 443, GET, no credentials, host names only (`targetProblem`);
 * - DNS resolution by us; EVERY resolved address is checked and the socket connects to exactly
 *   the checked address (undici `Agent` with `connect.lookup` – DNS pinning, no second
 *   resolution → no DNS rebinding); one blocked address blocks the whole fetch;
 * - redirects followed manually (max. 3), every target checked again (also https → http);
 * - total time limit (default 5 s incl. connecting and redirects), size limit while streaming,
 *   compressed bodies are counted AFTER decompression (compression bombs);
 * - nothing of the user's request is passed on: no cookies, no Authorization, no Referer,
 *   no client IP – own User-Agent.
 *
 * Built as a factory so tests can inject a fake resolver and a local TLS test server (CA,
 * address policy) – production uses `defaultSafeFetcher()` without any test parameters and
 * there is NO environment variable that relaxes the protection.
 */

export type EgressCategory =
  | "unsafe" // URL or resolved address not allowed
  | "timeout"
  | "too_large"
  | "http_error" // 4xx/5xx or too many redirects
  | "bad_type" // wrong content type / unknown encoding
  | "error"; // anything else (TLS, DNS, connection)

export class EgressError extends Error {
  constructor(readonly category: EgressCategory) {
    super(`egress: ${category}`);
    this.name = "EgressError";
  }
}

const BLOCKED_CODE = "WW_EGRESS_BLOCKED";

export type Resolver = (hostname: string) => Promise<readonly LookupAddress[]>;

export interface SafeFetcherOptions {
  /** DNS resolver – default `dns.lookup(…, { all: true, order: "ipv4first" })`. */
  resolve?: Resolver;
  /** Extra trusted CA (tests: the local TLS server's certificate). */
  ca?: string | Buffer;
  /** Address policy – default `isBlockedAddress`. Tests only. */
  isBlocked?: (address: string) => boolean;
  /**
   * Port the socket really dials (tests only: a local TLS server cannot listen on 443 in CI).
   * URLs are still checked for port 443 – this does not widen what a URL may name.
   */
  dialPort?: number;
  timeoutMs?: number;
  maxRedirects?: number;
  userAgent?: string;
}

export interface SafeRequest {
  url: string;
  /** Hard limit of the (decompressed) body in bytes. */
  maxBytes: number;
  accept: string;
  acceptLanguage?: string | undefined;
  /** Content types that are accepted (lower case, without parameters); default: all. */
  contentTypes?: readonly string[];
}

export interface SafeResponse {
  /** URL after redirects. */
  url: string;
  contentType: string;
  /** `charset` parameter of the content type, if any. */
  charset: string | null;
  body: Buffer;
}

const DEFAULT_RESOLVE: Resolver = (hostname) =>
  dnsLookup(hostname, { all: true, order: "ipv4first" });

const USER_AGENT = "WirWollenWeg-LinkPreview/1.0";

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

function blockedError(): NodeJS.ErrnoException {
  const error: NodeJS.ErrnoException = new Error("egress: blocked address");
  error.code = BLOCKED_CODE;
  return error;
}

/** `lookup` for net/tls.connect: resolve, check every address, hand back only checked ones. */
export function pinnedLookup(resolve: Resolver, isBlocked: (address: string) => boolean) {
  return (hostname: string, options: { all?: boolean } | number, callback: LookupCallback) => {
    resolve(hostname).then(
      (addresses) => {
        if (addresses.length === 0 || addresses.some((a) => isBlocked(a.address))) {
          callback(blockedError(), "");
          return;
        }
        const all = typeof options === "object" && options.all === true;
        if (all) callback(null, [...addresses]);
        else {
          const first = addresses[0];
          callback(null, first?.address ?? "", first?.family ?? 4);
        }
      },
      (error: unknown) => {
        callback(error instanceof Error ? error : new Error("egress: dns"), "");
      },
    );
  };
}

function hasCode(error: unknown, code: string, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 5) return false;
  const record = error as { code?: unknown; cause?: unknown; errors?: unknown };
  if (record.code === code) return true;
  if (Array.isArray(record.errors) && record.errors.some((e) => hasCode(e, code, depth + 1))) {
    return true;
  }
  return hasCode(record.cause, code, depth + 1);
}

function header(headers: Record<string, string | string[] | undefined>, name: string): string {
  const value = headers[name];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Drops a body we do not read – its abort error must not become an unhandled rejection. */
function discard(body: Readable): void {
  body.on("error", () => undefined);
  body.destroy();
}

function decoderFor(encoding: string) {
  switch (encoding) {
    case "":
    case "identity":
      return null;
    case "gzip":
    case "x-gzip":
      return createGunzip();
    case "deflate":
      return createInflate();
    case "br":
      return createBrotliDecompress();
    default:
      throw new EgressError("bad_type");
  }
}

/** Reads a body up to `maxBytes` (after decompression) – aborts while streaming, not after. */
async function readLimited(body: Readable, encoding: string, maxBytes: number): Promise<Buffer> {
  const decoder = decoderFor(encoding);
  const source: Readable = decoder ? body.pipe(decoder) : body;
  if (decoder) {
    body.on("error", (error) => decoder.destroy(error));
  }
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of source) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
      size += buffer.length;
      if (size > maxBytes) throw new EgressError("too_large");
      chunks.push(buffer);
    }
  } catch (error) {
    discard(body);
    if (decoder) discard(decoder);
    if (error instanceof EgressError) throw error;
    throw decoder ? new EgressError("bad_type") : error;
  }
  return Buffer.concat(chunks);
}

export interface SafeFetcher {
  fetch(input: SafeRequest): Promise<SafeResponse>;
}

export function createSafeFetcher(options: SafeFetcherOptions = {}): SafeFetcher {
  const resolve = options.resolve ?? DEFAULT_RESOLVE;
  const isBlocked = options.isBlocked ?? isBlockedAddress;
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxRedirects = options.maxRedirects ?? 3;
  const connector = buildConnector({
    lookup: pinnedLookup(resolve, isBlocked),
    timeout: Math.min(3000, timeoutMs),
    ...(options.ca ? { ca: options.ca } : {}),
  } as buildConnector.BuildOptions);
  const dialPort = options.dialPort;
  const agent = new Agent({
    connect:
      dialPort === undefined
        ? connector
        : (connectOptions, callback) => {
            connector({ ...connectOptions, port: String(dialPort) }, callback);
          },
    allowH2: false,
    headersTimeout: timeoutMs,
    bodyTimeout: timeoutMs,
    keepAliveTimeout: 1000,
    connections: 4,
  });

  async function fetchOnce(input: SafeRequest, signal: AbortSignal): Promise<SafeResponse> {
    let current: URL;
    try {
      current = new URL(input.url);
    } catch {
      throw new EgressError("unsafe");
    }
    for (let hop = 0; ; hop++) {
      if (targetProblem(current)) throw new EgressError("unsafe");
      const response = await request(current, {
        dispatcher: agent,
        method: "GET",
        signal,
        headers: {
          "user-agent": options.userAgent ?? USER_AGENT,
          accept: input.accept,
          "accept-encoding": "identity",
          ...(input.acceptLanguage ? { "accept-language": input.acceptLanguage } : {}),
        },
      });
      const { statusCode, headers, body } = response;
      if (statusCode >= 300 && statusCode < 400 && statusCode !== 304) {
        discard(body);
        const location = header(headers, "location");
        if (!location || hop >= maxRedirects) throw new EgressError("http_error");
        try {
          current = new URL(location, current);
        } catch {
          throw new EgressError("unsafe");
        }
        continue;
      }
      if (statusCode !== 200) {
        discard(body);
        throw new EgressError("http_error");
      }
      const rawType = header(headers, "content-type").toLowerCase();
      const contentType = rawType.split(";")[0]?.trim() ?? "";
      if (input.contentTypes && !input.contentTypes.includes(contentType)) {
        discard(body);
        throw new EgressError("bad_type");
      }
      const length = Number(header(headers, "content-length"));
      if (Number.isFinite(length) && length > input.maxBytes) {
        discard(body);
        throw new EgressError("too_large");
      }
      const encoding = header(headers, "content-encoding").trim().toLowerCase();
      const buffer = await readLimited(body, encoding, input.maxBytes);
      const charset = /charset="?([\w.:-]+)"?/.exec(rawType)?.[1] ?? null;
      return { url: current.href, contentType, charset, body: buffer };
    }
  }

  return {
    async fetch(input) {
      const signal = AbortSignal.timeout(timeoutMs);
      try {
        return await fetchOnce(input, signal);
      } catch (error) {
        if (error instanceof EgressError) throw error;
        if (hasCode(error, BLOCKED_CODE)) throw new EgressError("unsafe");
        if (signal.aborted || hasCode(error, "UND_ERR_HEADERS_TIMEOUT")) {
          throw new EgressError("timeout");
        }
        if (hasCode(error, "UND_ERR_BODY_TIMEOUT") || hasCode(error, "UND_ERR_CONNECT_TIMEOUT")) {
          throw new EgressError("timeout");
        }
        throw new EgressError("error");
      }
    },
  };
}

let shared: SafeFetcher | undefined;

/** Production fetcher – default resolver and address policy, no test parameters. */
export function defaultSafeFetcher(): SafeFetcher {
  shared ??= createSafeFetcher();
  return shared;
}
