import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/dates";
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
