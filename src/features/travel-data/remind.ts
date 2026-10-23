import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import type { TravelRaw } from "@/server/travel-data/db";
import type { TripView } from "../trips/load";
import { travelDataPath } from "../trips/paths";
import { inviteLink, tripLink } from "../trips/share-texts";
import { countsOf, memberName } from "./status";
import type { TravelRemindData } from "./types";

async function perLocale(render: (locale: Locale) => Promise<string>) {
  const entries = await Promise.all(
    locales.map(async (locale) => [locale, await render(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/**
 * Reminders `travel-data` / `travel-data-join` (W16 v2.16, R.9 I11-09) – only the viewer's OWN
 * open requests: open members (WhatsApp each + «Alle erinnern»), «klärt es direkt» without a
 * button (the decision is respected), open placeholders with their personal link. Texts contain
 * name, purpose and the link to `/travel-data` – never fields or values.
 */
export async function travelRemindData(
  view: TripView,
  raw: TravelRaw,
): Promise<TravelRemindData | null> {
  const { trip, me, format, placeholders } = view;
  if (me.bookerSince === null) return null;
  const link = tripLink(travelDataPath(trip.publicId));
  const own = raw.requests.filter((r) => r.requesterId === me.userId && r.closedAt === null);
  const requests = await Promise.all(
    own.map(async (request) => {
      const counts = countsOf(raw, request.id);
      const open = await Promise.all(
        counts.open.map(async (r) => {
          const name = memberName(view, r.userId) ?? "";
          return {
            key: r.userId ?? r.id,
            name,
            texts: await perLocale(async (locale) => {
              const t = await getTranslations({ locale, namespace: "share.remind" });
              return t("travelData", { name, purpose: request.purpose, link });
            }),
          };
        }),
      );
      const declined = raw.recipients
        .filter((r) => r.requestId === request.id && r.userId && r.state === "declined")
        .map((r) => ({ key: r.userId ?? r.id, name: memberName(view, r.userId) ?? "" }));
      const pending = await Promise.all(
        counts.placeholders.flatMap((r) => {
          const placeholder = placeholders.find((p) => p.id === r.placeholderId);
          if (!placeholder || placeholder.withoutApp) return [];
          return [
            (async () => ({
              key: placeholder.id,
              name: placeholder.displayName,
              texts: await perLocale(async (locale) => {
                const t = await getTranslations({ locale, namespace: "share.remind" });
                return t("travelDataJoin", {
                  name: placeholder.displayName,
                  trip: trip.name,
                  purpose: request.purpose,
                  link: inviteLink(placeholder.inviteToken),
                });
              }),
            }))(),
          ];
        }),
      );
      return {
        requestId: request.id,
        purpose: request.purpose,
        open,
        declined,
        pending,
        allTexts:
          open.length > 0
            ? await perLocale(async (locale) => {
                const t = await getTranslations({ locale, namespace: "share.remind" });
                return t("travelDataAll", { purpose: request.purpose, link });
              })
            : null,
      };
    }),
  );
  const relevant = requests.filter((r) => r.open.length + r.declined.length + r.pending.length > 0);
  if (relevant.length === 0) return null;
  return { defaultLocale: format.locale, requests: relevant };
}
