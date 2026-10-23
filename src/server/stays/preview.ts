import "server-only";
import { hostOf } from "@/lib/stays";
import { serverEnv } from "../env";
import { defaultSafeFetcher, EgressError, type SafeFetcher } from "../egress/safe-fetch";
import { decodeHtml, parsePageMeta, type PageMeta } from "./html-meta";
import { sniffImageType, type StayImageType } from "./image-type";
import { previewTokenKey } from "./preview-token";

/**
 * Link preview and preview images (R.7 I9-03/I9-04, Q34) on top of the SSRF-safe fetcher.
 * Every failure is the same neutral «no preview» (null) – no details leave the server. Logs
 * carry at most host name + category, never path, query, title or image URL (I9-10).
 */

export const HTML_MAX_BYTES = 1024 * 1024;
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

function log(kind: "page" | "image", url: string, result: string): void {
  console.info(`link-preview ${kind} host=${hostOf(url) || "?"} result=${result}`);
}

function categoryOf(error: unknown): string {
  return error instanceof EgressError ? error.category : "error";
}

export async function fetchLinkPreview(
  url: string,
  language: string,
  fetcher: SafeFetcher = defaultSafeFetcher(),
): Promise<PageMeta | null> {
  try {
    const page = await fetcher.fetch({
      url,
      maxBytes: HTML_MAX_BYTES,
      accept: "text/html,application/xhtml+xml;q=0.9",
      acceptLanguage: language,
      contentTypes: ["text/html", "application/xhtml+xml"],
    });
    const meta = parsePageMeta(decodeHtml(page.body, page.charset), page.url);
    if (!meta.title && !meta.imageUrl) {
      log("page", url, "no_meta");
      return null;
    }
    log("page", url, "ok");
    return meta;
  } catch (error) {
    log("page", url, categoryOf(error));
    return null;
  }
}

export interface StayImage {
  type: StayImageType;
  body: Buffer;
}

export async function fetchStayImage(
  url: string,
  fetcher: SafeFetcher = defaultSafeFetcher(),
): Promise<StayImage | null> {
  try {
    const image = await fetcher.fetch({
      url,
      maxBytes: IMAGE_MAX_BYTES,
      accept: "image/avif,image/webp,image/png,image/jpeg,image/gif;q=0.9",
    });
    const type = sniffImageType(image.body);
    if (!type) {
      log("image", url, "bad_type");
      return null;
    }
    return { type, body: image.body };
  } catch (error) {
    log("image", url, categoryOf(error));
    return null;
  }
}

let key: Buffer | undefined;

/** HMAC key of the preview tokens – derived from BETTER_AUTH_SECRET (no new secret). */
export function previewKey(): Buffer {
  if (key) return key;
  const env = serverEnv();
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret && env.APP_ENV !== "development" && env.APP_ENV !== "ci") {
    throw new Error("BETTER_AUTH_SECRET is required (preview token key, R.7 I9-03)");
  }
  key = previewTokenKey(secret ?? "dev-only-preview-token-secret");
  return key;
}
