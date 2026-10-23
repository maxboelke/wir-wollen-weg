import { execFileSync } from "node:child_process";
import type { LookupAddress } from "node:dns";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:https";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createSafeFetcher, EgressError, pinnedLookup, type SafeRequest } from "./safe-fetch";

// SSRF protection (features.md R.7 «Sicherheit», deployment.md §0.8 Nr. 9): no internet – a
// local TLS server with a throw-away certificate for «stays.example.com», a fake resolver and
// the dial port of the local server. Only the «good» cases allow 127.0.0.1 (address policy
// injected); every blocking case runs with the production address policy.

const HOST = "stays.example.com";
let server: Server;
let port = 0;
let cert = "";
let connections = 0;
let lastHeaders: Record<string, string | string[] | undefined> = {};
let dir = "";

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "ww-egress-"));
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-days",
      "2",
      "-subj",
      `/CN=${HOST}`,
      "-addext",
      `subjectAltName=DNS:${HOST},DNS:other.example.com`,
      "-keyout",
      join(dir, "key.pem"),
      "-out",
      join(dir, "cert.pem"),
    ],
    { stdio: "ignore" },
  );
  cert = readFileSync(join(dir, "cert.pem"), "utf8");
  server = createServer({ key: readFileSync(join(dir, "key.pem")), cert }, (request, response) => {
    lastHeaders = request.headers;
    const path = request.url ?? "/";
    if (path === "/ok") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end("<html><head><title>Villa</title></head></html>");
    } else if (path === "/redirect-ok") {
      response.writeHead(301, { location: "/ok", "set-cookie": "a=b" });
      response.end();
    } else if (path === "/redirect-http") {
      response.writeHead(302, { location: `http://${HOST}/ok` });
      response.end();
    } else if (path === "/redirect-private") {
      response.writeHead(302, { location: "https://evil.example.com/ok" });
      response.end();
    } else if (path === "/redirect-port") {
      response.writeHead(302, { location: `https://${HOST}:8443/ok` });
      response.end();
    } else if (path.startsWith("/loop")) {
      response.writeHead(302, { location: `/loop${String(path.length)}` });
      response.end();
    } else if (path === "/big") {
      response.writeHead(200, { "content-type": "text/html" });
      const chunk = "x".repeat(64 * 1024);
      let sent = 0;
      const write = () => {
        while (sent < 40) {
          sent++;
          if (!response.write(chunk)) {
            response.once("drain", write);
            return;
          }
        }
        response.end();
      };
      write();
    } else if (path === "/bomb") {
      response.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
      response.end(gzipSync(Buffer.alloc(20 * 1024 * 1024)));
    } else if (path === "/gzip") {
      response.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
      response.end(gzipSync("<title>Gzip</title>"));
    } else if (path === "/weird-encoding") {
      response.writeHead(200, { "content-type": "text/html", "content-encoding": "zstd-x" });
      response.end("x");
    } else if (path === "/declared-big") {
      response.writeHead(200, { "content-type": "text/html", "content-length": "5000000" });
      response.end();
    } else if (path === "/json") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end("{}");
    } else if (path === "/slow-gzip") {
      // Headers and the first compressed bytes, then the body stalls (timeout while decompressing).
      response.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
      const packed = gzipSync("<title>Slow</title>".repeat(200));
      response.write(packed.subarray(0, 20));
    } else if (path === "/broken-gzip") {
      response.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
      response.end(Buffer.from("this is not gzip at all"));
    } else if (path === "/slow") {
      // Never answers – the total time limit must end it.
    } else {
      response.writeHead(404, { "content-type": "text/html" });
      response.end("nope");
    }
  });
  server.on("secureConnection", () => {
    connections++;
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  port = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((done) =>
    server.close(() => {
      done();
    }),
  );
  rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
  connections = 0;
  lastHeaders = {};
});

const v4 = (address: string): LookupAddress => ({ address, family: 4 });

/** Resolver of the tests: «stays.example.com» → 127.0.0.1, «evil.example.com» → 10.0.0.1. */
function fakeResolver(map: Record<string, LookupAddress[]>) {
  const calls: string[] = [];
  const resolve = (hostname: string) => {
    calls.push(hostname);
    return Promise.resolve(map[hostname] ?? []);
  };
  return { resolve, calls };
}

const html: Omit<SafeRequest, "url"> = {
  maxBytes: 1024 * 1024,
  accept: "text/html",
  contentTypes: ["text/html"],
};

/** Good case: only the local test server's loopback address is allowed. */
function localFetcher(extra: Record<string, LookupAddress[]> = {}, timeoutMs = 2000) {
  const resolver = fakeResolver({
    [HOST]: [v4("127.0.0.1")],
    "evil.example.com": [v4("10.0.0.1")],
    ...extra,
  });
  const fetcher = createSafeFetcher({
    resolve: resolver.resolve,
    ca: cert,
    dialPort: port,
    timeoutMs,
    isBlocked: (address) => address !== "127.0.0.1",
  });
  return { fetcher, resolver };
}

async function category(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return "ok";
  } catch (error) {
    return error instanceof EgressError ? error.category : `unexpected: ${String(error)}`;
  }
}

describe("safe fetch – good case against the local TLS server", () => {
  it("fetches HTML with our User-Agent and nothing of the user's request", async () => {
    const { fetcher } = localFetcher();
    const result = await fetcher.fetch({
      url: `https://${HOST}/ok`,
      ...html,
      acceptLanguage: "de",
    });
    expect(result.body.toString()).toContain("<title>Villa</title>");
    expect(result.contentType).toBe("text/html");
    expect(result.charset).toBe("utf-8");
    expect(lastHeaders["user-agent"]).toBe("WirWollenWeg-LinkPreview/1.0");
    expect(lastHeaders["accept-language"]).toBe("de");
    expect(lastHeaders["accept-encoding"]).toBe("identity");
    for (const name of ["cookie", "authorization", "referer", "x-forwarded-for", "origin"]) {
      expect(lastHeaders[name]).toBeUndefined();
    }
  });

  it("follows a redirect within the limits, sends no cookie it was given", async () => {
    const { fetcher } = localFetcher();
    const result = await fetcher.fetch({ url: `https://${HOST}/redirect-ok`, ...html });
    expect(result.url).toBe(`https://${HOST}/ok`);
    expect(lastHeaders.cookie).toBeUndefined();
  });

  it("decompresses gzip and counts the decompressed size", async () => {
    const { fetcher } = localFetcher();
    const result = await fetcher.fetch({ url: `https://${HOST}/gzip`, ...html });
    expect(result.body.toString()).toBe("<title>Gzip</title>");
  });
});

describe("safe fetch – blocked targets (production address policy)", () => {
  function productionPolicy(map: Record<string, LookupAddress[]>) {
    const resolver = fakeResolver(map);
    const fetcher = createSafeFetcher({
      resolve: resolver.resolve,
      ca: cert,
      dialPort: port,
      timeoutMs: 2000,
    });
    return { fetcher, resolver };
  }

  it.each([
    ["loopback", [v4("127.0.0.1")]],
    ["private 10/8", [v4("10.0.0.1")]],
    ["cloud metadata", [v4("169.254.169.254")]],
    ["IPv4-mapped IPv6", [{ address: "::ffff:10.0.0.1", family: 6 }]],
    ["IPv6 loopback", [{ address: "::1", family: 6 }]],
    [
      "one public, one private (no filtering – everything is blocked)",
      [v4("93.184.216.34"), v4("192.168.1.1")],
    ],
    ["no address at all", []],
  ])("%s → unsafe, no connection", async (_label, addresses) => {
    const { fetcher } = productionPolicy({ [HOST]: addresses });
    expect(await category(fetcher.fetch({ url: `https://${HOST}/ok`, ...html }))).toBe("unsafe");
    expect(connections).toBe(0);
  });

  it.each([
    ["http://stays.example.com/ok"],
    ["https://stays.example.com:8443/ok"],
    ["https://user:pw@stays.example.com/ok"],
    ["https://127.0.0.1/ok"],
    ["https://[::1]/ok"],
    ["https://localhost/ok"],
    ["https://db/ok"],
    ["https://router.local/ok"],
    ["https://host.docker.internal/ok"],
    ["not a url"],
  ])("%s → unsafe before any DNS lookup", async (url) => {
    const { fetcher, resolver } = productionPolicy({ [HOST]: [v4("93.184.216.34")] });
    expect(await category(fetcher.fetch({ url, ...html }))).toBe("unsafe");
    expect(resolver.calls).toEqual([]);
  });
});

describe("safe fetch – redirects are checked again", () => {
  it("redirect to a host resolving to a private address → unsafe", async () => {
    const { fetcher, resolver } = localFetcher();
    expect(
      await category(fetcher.fetch({ url: `https://${HOST}/redirect-private`, ...html })),
    ).toBe("unsafe");
    expect(resolver.calls).toContain("evil.example.com");
  });
  it("https → http → unsafe", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/redirect-http`, ...html }))).toBe(
      "unsafe",
    );
  });
  it("redirect to another port → unsafe", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/redirect-port`, ...html }))).toBe(
      "unsafe",
    );
  });
  it("more than 3 redirects → error", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/loop`, ...html }))).toBe(
      "http_error",
    );
  });
});

describe("safe fetch – limits", () => {
  it("aborts a too large body while streaming", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/big`, ...html }))).toBe(
      "too_large",
    );
  });
  it("rejects a declared length above the limit", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/declared-big`, ...html }))).toBe(
      "too_large",
    );
  });
  it("counts after decompression (compression bomb)", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/bomb`, ...html }))).toBe(
      "too_large",
    );
  });
  it("unknown content encoding → bad type", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/weird-encoding`, ...html }))).toBe(
      "bad_type",
    );
  });
  it("wrong content type → bad type", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/json`, ...html }))).toBe(
      "bad_type",
    );
  });
  it("4xx → http error", async () => {
    const { fetcher } = localFetcher();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/missing`, ...html }))).toBe(
      "http_error",
    );
  });
  it("total time limit", async () => {
    const { fetcher } = localFetcher({}, 400);
    const started = Date.now();
    expect(await category(fetcher.fetch({ url: `https://${HOST}/slow`, ...html }))).toBe("timeout");
    expect(Date.now() - started).toBeLessThan(2000);
  });
  it("timeout while decompressing stays «timeout», a broken stream is «bad_type»", async () => {
    const { fetcher } = localFetcher({}, 400);
    expect(await category(fetcher.fetch({ url: `https://${HOST}/slow-gzip`, ...html }))).toBe(
      "timeout",
    );
    expect(await category(fetcher.fetch({ url: `https://${HOST}/broken-gzip`, ...html }))).toBe(
      "bad_type",
    );
  });
});

describe("pinnedLookup (DNS pinning)", () => {
  it("resolves once and hands back exactly the checked addresses", async () => {
    let call = 0;
    // Rebinding attempt: public first, private on every later resolution.
    const resolve = () => Promise.resolve(call++ === 0 ? [v4("93.184.216.34")] : [v4("10.0.0.1")]);
    const lookup = pinnedLookup(resolve, (address) => address.startsWith("10."));
    const all = await new Promise<unknown>((done) => {
      lookup(HOST, { all: true }, (error, address) => {
        done(error ?? address);
      });
    });
    expect(all).toEqual([v4("93.184.216.34")]);
    const second = await new Promise<unknown>((done) => {
      lookup(HOST, 0, (error, address) => {
        done(error ? "blocked" : address);
      });
    });
    expect(second).toBe("blocked");
  });

  it("the connection goes to the address our lookup returned", async () => {
    const { fetcher, resolver } = localFetcher();
    await fetcher.fetch({ url: `https://${HOST}/ok`, ...html });
    expect(resolver.calls).toEqual([HOST]);
    expect(connections).toBe(1);
  });
});
