import "server-only";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/config";
import { bookersOf } from "../trips/bookers";
import type { TripView } from "../trips/load";
import { tripPath } from "../trips/paths";
import { tripLink } from "../trips/share-texts";
import type { StaysRaw } from "./load";
import type { StayRemindData, StayRemindPerson } from "./remind-types";

async function perLocale(render: (locale: Locale) => Promise<string>) {
  const entries = await Promise.all(
    locales.map(async (locale) => [locale, await render(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, string>;
}

/**
 * Texts and lists of the stay reminders (W16 v2.14): who has rated (members only, numbers of
 * open suggestions – never ratings), «Alle erinnern», and the nudges to the organiser. The link
 * always points to `/trips/{id}/stays`. Texts never contain prices or notes.
 */
export async function stayRemindData(view: TripView, raw: StaysRaw): Promise<StayRemindData> {
  const { trip, members, me, isOrganizer, format } = view;
  const link = tripLink(`${tripPath(trip.publicId)}/stays`);
  const stayIds = raw.stays.map((s) => s.id);
  const rated = new Map<string, Set<string>>();
  for (const r of raw.ratings) {
    const set = rated.get(r.userId) ?? new Set<string>();
    set.add(r.stayId);
    rated.set(r.userId, set);
  }
  const people: StayRemindPerson[] = await Promise.all(
    members.map(async (m) => {
      const left = stayIds.filter((id) => !rated.get(m.userId)?.has(id)).length;
      const isMe = m.userId === me.userId;
      return {
        key: m.userId,
        name: m.displayName,
        me: isMe,
        organizer: m.role === "organizer",
        left,
        texts:
          left > 0 && !isMe
            ? await perLocale(async (locale) => {
                const t = await getTranslations({ locale, namespace: "share.remind" });
                return t("stayRate", { name: m.displayName, trip: trip.name, count: left, link });
              })
            : null,
      };
    }),
  );
  const open = [
    ...people.filter((p) => p.left > 0 && !p.me),
    ...people.filter((p) => p.left > 0 && p.me),
  ];
  const done = people.filter((p) => p.left === 0);
  const orga = members.find((m) => m.role === "organizer")?.displayName ?? "";
  const chosen = raw.stays.find((s) => s.chosenAt !== null) ?? null;
  // «Bucher» (W16 v2.16): the «Bucht» people, else the organiser. Who books gets no nudge.
  const bookers = bookersOf(members);
  const iBook = bookers.length > 0 ? me.bookerSince !== null : isOrganizer;
  return {
    tripName: trip.name,
    orgaName: orga,
    isOrganizer,
    defaultLocale: format.locale,
    swipeHref: `${tripPath(trip.publicId)}/stays/swipe`,
    progress: { done: done.length, total: people.length },
    open,
    done,
    allTexts: open.some((p) => !p.me)
      ? await perLocale(async (locale) => {
          const t = await getTranslations({ locale, namespace: "share.remind" });
          return t("stayRateAll", { trip: trip.name, link });
        })
      : null,
    fix: isOrganizer
      ? null
      : await perLocale(async (locale) => {
          const t = await getTranslations({ locale, namespace: "share.remind" });
          return t("stayFix", { orga, trip: trip.name, link });
        }),
    book:
      iBook || !chosen
        ? null
        : {
            title: chosen.title,
            bookers: await Promise.all(
              (bookers.length > 0 ? bookers : members.filter((m) => m.role === "organizer")).map(
                async (b) => ({
                  key: b.userId,
                  name: b.displayName,
                  texts: await perLocale(async (locale) => {
                    const t = await getTranslations({ locale, namespace: "share.remind" });
                    return t("stayBook", { booker: b.displayName, stay: chosen.title, link });
                  }),
                }),
              ),
            ),
          },
  };
}
