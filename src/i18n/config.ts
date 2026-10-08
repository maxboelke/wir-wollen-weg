export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

/** Fallback when neither cookie nor Accept-Language decide (docs/ux/sitemap.md §4). */
export const fallbackLocale: Locale = "en";

/** Cookie set on an explicit language choice (docs/ux/user-flows.md Flow F, 12 months). */
export const LOCALE_COOKIE = "lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
