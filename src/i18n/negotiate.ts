import { fallbackLocale, isLocale, type Locale } from "./config";

interface NegotiationInput {
  /** Value of the `lang` cookie (explicit choice). */
  cookie?: string | undefined;
  /** Raw `Accept-Language` header. */
  acceptLanguage?: string | null | undefined;
}

/**
 * Picks the UI language for requests without a locale prefix
 * (priority per docs/ux/user-flows.md F.1: cookie → Accept-Language → fallback).
 * Account language (signed-in users) is applied on top of this in Increment 1.
 */
export function negotiateLocale({ cookie, acceptLanguage }: NegotiationInput): Locale {
  if (isLocale(cookie)) return cookie;

  const ranked = parseAcceptLanguage(acceptLanguage ?? "");
  for (const tag of ranked) {
    const primary = tag.split("-")[0]?.toLowerCase();
    // `de-*` → de; every other language → en (sitemap §4).
    if (primary === "de") return "de";
    if (primary === "en") return "en";
  }
  return ranked.length > 0 ? "en" : fallbackLocale;
}

/** Returns language tags ordered by q-value (highest first), ignoring `*` and q=0. */
export function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part, index) => {
      const [rawTag = "", ...params] = part.trim().split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { tag: rawTag.trim(), q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter(({ tag, q }) => tag !== "" && tag !== "*" && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ tag }) => tag);
}
