import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { formatDate, formatDateRange } from "@/lib/dates";
import type { Country } from "@/lib/region";
import { shareTextIntl } from "@/lib/share-text";
import { serverEnv } from "@/server/env";

/** Full invite link (F-002). APP_URL is the public address (LAN IP in phone tests). */
export function inviteLink(token: string): string {
  return `${serverEnv().APP_URL.replace(/\/$/, "")}/i/${token}`;
}

/**
 * Invite texts in both languages (ux-spec §10.3, W06): product name of the TEXT language
 * («Wir wollen weg: …» / «When do we go? …»), with or without deadline.
 */
export async function inviteShareTexts(input: {
  tripName: string;
  token: string;
  deadline: string | null;
  senderCountry: Country;
}): Promise<Record<Locale, string>> {
  const link = inviteLink(input.token);
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "share.text" });
      const text = input.deadline
        ? t("invite", {
            trip: input.tripName,
            link,
            deadline: formatDate(input.deadline, shareTextIntl(locale, input.senderCountry), {
              weekday: true,
              year: false,
            }),
          })
        : t("inviteNoDeadline", { trip: input.tripName, link });
      return [locale, text] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/**
 * Texts for a personal placeholder link (F-007): same product-name rules as the invite
 * (ux-spec §10.3/§10.6), addressed to the expected person.
 */
export async function placeholderShareTexts(input: {
  tripName: string;
  token: string;
  name: string;
}): Promise<Record<Locale, string>> {
  const link = inviteLink(input.token);
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "share.text" });
      return [locale, t("placeholder", { trip: input.tripName, name: input.name, link })] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/** Full link to a trip page – only useful for members (the page asks non-members to sign in). */
export function tripLink(path: string): string {
  return `${serverEnv().APP_URL.replace(/\/$/, "")}${path}`;
}

/**
 * «Abstimmung läuft» (F-010, ux-spec §10.3) in both languages – with or without the voting
 * deadline (F-017). No mail is sent (F-014 comes with v1).
 */
export async function pollShareTexts(input: {
  tripName: string;
  link: string;
  count: number;
  deadline: string | null;
  senderCountry: Country;
}): Promise<Record<Locale, string>> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "share.text" });
      const text = input.deadline
        ? t("poll", {
            trip: input.tripName,
            link: input.link,
            count: input.count,
            deadline: formatDate(input.deadline, shareTextIntl(locale, input.senderCountry), {
              weekday: true,
              year: false,
            }),
          })
        : t("pollNoDeadline", { trip: input.tripName, link: input.link, count: input.count });
      return [locale, text] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/** «Fix! {trip}: {range} ({nights} Nächte) …» (F-012, ux-spec §10.3) in both languages. */
export async function resultShareTexts(input: {
  tripName: string;
  link: string;
  start: string;
  end: string;
  nights: number;
  senderCountry: Country;
}): Promise<Record<Locale, string>> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "share.text" });
      const range = formatDateRange(
        input.start,
        input.end,
        shareTextIntl(locale, input.senderCountry),
        { weekday: true },
      );
      return [
        locale,
        t("result", { trip: input.tripName, link: input.link, range, nights: input.nights }),
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}
