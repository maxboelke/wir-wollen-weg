import type { Locale } from "@/i18n/config";

/** Help page routes (F-051, sitemap): /de/hilfe · /en/help. */
export const HELP_PATHS: Record<Locale, string> = { de: "/de/hilfe", en: "/en/help" };

export const HELP_TOPICS = [
  "code",
  "link",
  "inApp",
  "dates",
  "vote",
  "visibility",
  "delete",
  "motion",
  "noEmail",
] as const;
export type HelpTopic = (typeof HELP_TOPICS)[number];

/** Jump anchors per language (W15: `/de/hilfe#code`, `#bewegung`). */
export const HELP_ANCHORS: Record<HelpTopic, Record<Locale, string>> = {
  code: { de: "code", en: "code" },
  link: { de: "einladungslink", en: "invite-link" },
  inApp: { de: "in-app-browser", en: "in-app-browser" },
  dates: { de: "tage-aendern", en: "change-dates" },
  vote: { de: "abstimmen", en: "vote" },
  visibility: { de: "wer-sieht-was", en: "who-sees-what" },
  delete: { de: "daten-loeschen", en: "delete-data" },
  motion: { de: "bewegung", en: "motion" },
  noEmail: { de: "kein-zugriff", en: "no-email-access" },
};

export function helpHref(locale: Locale, topic?: HelpTopic): string {
  return topic ? `${HELP_PATHS[locale]}#${HELP_ANCHORS[topic][locale]}` : HELP_PATHS[locale];
}
