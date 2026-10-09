export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

/** Fallback when neither cookie nor Accept-Language decide (docs/ux/sitemap.md §4). */
export const fallbackLocale: Locale = "en";

/** Cookie set on an explicit language choice (docs/ux/user-flows.md Flow F, 12 months). */
export const LOCALE_COOKIE = "lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
/**
 * Time (epoch ms) of the last explicit language choice in this browser. At sign-in the
 * newer of browser choice and account language wins (Flow F.3).
 */
export const LOCALE_CHOSEN_COOKIE = "ww-lang-at";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
