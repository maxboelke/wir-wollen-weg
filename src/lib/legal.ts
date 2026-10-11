import type { Locale } from "@/i18n/config";

/** Legal pages (sitemap §3): /de/datenschutz · /en/privacy, /de/impressum · /en/imprint. */
export const PRIVACY_PATHS: Record<Locale, string> = { de: "/de/datenschutz", en: "/en/privacy" };
export const IMPRINT_PATHS: Record<Locale, string> = { de: "/de/impressum", en: "/en/imprint" };

/** Anchor of the licences section on the imprint page (date-holidays CC BY 3.0, fonts). */
export const LICENSES_ANCHOR = "licenses";

/** Section order of the privacy policy – follows compliance-checklist §2. */
export const PRIVACY_SECTIONS = [
  "controller",
  "account",
  "trips",
  "signIn",
  "mails",
  "recipients",
  "device",
  "retention",
  "rights",
  "automated",
] as const;

/**
 * Placeholder markers of the offline demo (compliance-checklist §0a). With
 * APP_ENV=production the app refuses to start while any of them is left in the texts.
 */
export const PLACEHOLDER_MARKERS = ["[PLATZHALTER", "[PLACEHOLDER"] as const;

/** Paths (dot notation) of all message strings that still contain a placeholder marker. */
export function findPlaceholderMarkers(tree: unknown, prefix = ""): string[] {
  if (typeof tree === "string") {
    return PLACEHOLDER_MARKERS.some((marker) => tree.includes(marker)) ? [prefix] : [];
  }
  if (typeof tree !== "object" || tree === null) return [];
  return Object.entries(tree).flatMap(([key, value]) =>
    findPlaceholderMarkers(value, prefix ? `${prefix}.${key}` : key),
  );
}
