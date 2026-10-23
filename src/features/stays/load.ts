import "server-only";
import {
  favouriteOf,
  formatMoney,
  hostOf,
  isDoneRating,
  newSince,
  perPersonCents,
  rankingVisible,
  rankStays,
  safeHref,
  travellerCount,
  type StayRatingValue,
} from "@/lib/stays";
import { formatDate, isoDateInZone } from "@/lib/dates";
import type { StayStatus } from "@/lib/trip-route";
import {
  listRatings,
  listStays,
  stationMark,
  type RatingRow,
  type StayData,
} from "@/server/stays/db";
import { bookersOf, canBook } from "../trips/bookers";
import { orList } from "../trips/format";
import type { TripView } from "../trips/load";

/**
 * Viewer-safe data of the places to stay (F-031, Q33). EVERYTHING that reaches a page, the RSC
 * payload or an API answer goes through here: for a member whose ranking is locked, no counts,
 * names or order of other people's ratings are computed into the result – only the own ratings
 * and the progress number («x von n haben bewertet», R.7 I9-06).
 */

export interface StaysRaw {
  stays: StayData[];
  ratings: RatingRow[];
  mark: { setAt: Date; name: string | null } | null;
}

export async function loadStaysRaw(tripId: string): Promise<StaysRaw> {
  const [stays, ratings, mark] = await Promise.all([
    listStays(tripId),
    listRatings(tripId),
    stationMark(tripId),
  ]);
  return { stays, ratings, mark };
}

/** Image of a suggestion: own demo image, our proxy, or null (placeholder). */
export function stayImageSrc(stay: Pick<StayData, "id" | "previewImageUrl">): string | null {
  const url = stay.previewImageUrl;
  if (!url) return null;
  if (/^\/demo\/stays\/[a-z0-9-]+\.svg$/.test(url)) return url;
  return url.startsWith("https://") ? `/api/stays/image?s=${encodeURIComponent(stay.id)}` : null;
}

export interface StayItem {
  id: string;
  title: string;
  /** Portal link (https only, checked again) – null for broken data. */
  href: string | null;
  /** Domain shown on every card. */
  host: string;
  /** Site name of the preview or the domain. */
  site: string;
  hasPreview: boolean;
  /** Author's name in this trip; null → «ehemaliges Mitglied». */
  author: string | null;
  mine: boolean;
  /** «2.050 €» – null without a price. */
  price: string | null;
  /** «342 €» (the page adds «≈ … p. P.»). */
  perPerson: string | null;
  note: string | null;
  image: string | null;
  myRating: StayRatingValue | null;
  isNew: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RankedItem extends StayItem {
  rank: number;
  tied: boolean;
  first: boolean;
  likes: number;
  nopes: number;
  /** Names of the people who liked it (the viewer as «you» – the page translates). */
  likedBy: { names: string[]; me: boolean };
}

export interface ChosenStay extends StayItem {
  likes: number;
  /** «am 3. Mai von Lena» – date already formatted for the viewer. */
  booked: { on: string; by: string | null } | null;
}

export interface StaysModel {
  isOrganizer: boolean;
  orgaName: string;
  /** May mark «gebucht ✓» (W18 E.16): organiser or «Bucht». */
  canBook: boolean;
  /**
   * «Sara oder Kemal» – the «Bucher» (W16 v2.16): the «Bucht» people, else the organiser.
   * Already formatted for the viewer.
   */
  bookers: string;
  /** The organiser has no marking while others book – hint «… du kannst es auch selbst». */
  orgaNotBooking: boolean;
  currency: string;
  total: number;
  myRated: number;
  myUnrated: number;
  myNew: number;
  /** Members without placeholders who rated everything / all members. */
  membersDone: number;
  membersTotal: number;
  travellers: number;
  /** Travellers come from the organiser's override. */
  partyOverride: number | null;
  /** Placeholder names counted in «pro Person» (W17 F.6 «inkl. Mia»), unless overridden. */
  placeholderNames: string[];
  limitReached: boolean;
  /** Q33 – ranking with numbers and names may be shown to this viewer. */
  rankingFree: boolean;
  /** Free ranking only (null when locked – nothing about others is computed). */
  ranking: RankedItem[] | null;
  /** Locked: all suggestions in arrival order with the own rating only. */
  all: StayItem[] | null;
  /** Names of members who have not rated everything – only when the ranking is free. */
  openNames: string[] | null;
  meOpen: boolean;
  chosen: ChosenStay | null;
  withoutApp: { name: string | null } | null;
  /** «Euer Termin hat sich geändert» (W18 E.8) – null when not shown. */
  datesChanged: { rebook: boolean } | null;
  /** Open suggestions for the swipe stack (own unrated, oldest first). */
  stack: StayItem[];
}

function perPersonOf(stay: StayData, travellers: number, intl: string): string | null {
  return stay.priceCents === null
    ? null
    : formatMoney(perPersonCents(stay.priceCents, travellers), stay.currency, intl);
}

/** Viewer-safe model of `/stays` and `/stays/swipe` (W18 E). */
export function staysModel(view: TripView, raw: StaysRaw): StaysModel {
  const { trip, me, members, placeholders, isOrganizer, format } = view;
  const intl = format.intl;
  const { stays, ratings } = raw;
  const stayIds = stays.map((s) => s.id);
  const memberIds = new Set(members.map((m) => m.userId));
  const mine = ratings.filter((r) => r.userId === me.userId);
  const myRatings = new Map(mine.map((r) => [r.stayId, r.value]));
  const myRatedIds = new Set(myRatings.keys());
  const lastRated = mine.reduce<number | null>(
    (latest, r) => Math.max(latest ?? 0, r.ratedAt.getTime()),
    null,
  );
  const newIds = new Set(
    newSince(
      stays.map((s) => ({ id: s.id, createdAt: s.createdAt.getTime() })),
      myRatedIds,
      lastRated,
    ),
  );
  const chosenRow = stays.find((s) => s.chosenAt !== null) ?? null;
  const meDone = isDoneRating(stayIds, myRatedIds);
  const free = rankingVisible({ organizer: isOrganizer, done: meDone, chosen: chosenRow !== null });

  const byUser = new Map<string, Set<string>>();
  for (const r of ratings) {
    if (!memberIds.has(r.userId)) continue;
    const set = byUser.get(r.userId) ?? new Set<string>();
    set.add(r.stayId);
    byUser.set(r.userId, set);
  }
  const doneMembers = members.filter((m) =>
    isDoneRating(stayIds, byUser.get(m.userId) ?? new Set()),
  );
  const travellers = travellerCount(members.length, placeholders.length, trip.partySizeOverride);
  const canWrite = chosenRow === null;

  const item = (stay: StayData): StayItem => {
    const host = hostOf(stay.url);
    return {
      id: stay.id,
      title: stay.title,
      href: safeHref(stay.url),
      host,
      site: stay.previewSiteName ?? host,
      hasPreview: stay.previewStatus === "ok",
      author: stay.authorName,
      mine: stay.createdBy === me.userId,
      price: stay.priceCents === null ? null : formatMoney(stay.priceCents, stay.currency, intl),
      perPerson: perPersonOf(stay, travellers, intl),
      note: stay.note,
      image: stayImageSrc(stay),
      myRating: myRatings.get(stay.id) ?? null,
      isNew: newIds.has(stay.id),
      canEdit:
        (isOrganizer || stay.createdBy === me.userId) &&
        !(stay.chosenAt !== null && stay.bookedAt !== null),
      canDelete: (isOrganizer || stay.createdBy === me.userId) && stay.chosenAt === null,
    };
  };

  let ranking: RankedItem[] | null = null;
  let chosen: ChosenStay | null = null;
  if (free) {
    const nameOf = new Map(members.map((m) => [m.userId, m.displayName]));
    const counts = new Map<string, { likes: string[]; nopes: number }>();
    for (const r of ratings) {
      if (!memberIds.has(r.userId)) continue;
      const entry = counts.get(r.stayId) ?? { likes: [], nopes: 0 };
      if (r.value === "like") entry.likes.push(r.userId);
      else entry.nopes++;
      counts.set(r.stayId, entry);
    }
    const ranked = rankStays(
      stays.map((s) => ({
        id: s.id,
        likes: counts.get(s.id)?.likes.length ?? 0,
        nopes: counts.get(s.id)?.nopes ?? 0,
        perPerson: s.priceCents === null ? null : perPersonCents(s.priceCents, travellers),
        createdAt: s.createdAt.getTime(),
      })),
    );
    const order = members.map((m) => m.userId);
    ranking = ranked.map((r) => {
      const stay = stays.find((s) => s.id === r.id) as StayData;
      const entry = counts.get(r.id) ?? { likes: [], nopes: 0 };
      const likers = [...entry.likes].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return {
        ...item(stay),
        rank: r.rank,
        tied: r.tied,
        first: r.first,
        likes: entry.likes.length,
        nopes: entry.nopes,
        likedBy: {
          names: likers.filter((id) => id !== me.userId).map((id) => nameOf.get(id) ?? ""),
          me: likers.includes(me.userId),
        },
      };
    });
    if (chosenRow) {
      const likes = counts.get(chosenRow.id)?.likes.length ?? 0;
      chosen = {
        ...item(chosenRow),
        likes,
        booked: chosenRow.bookedAt
          ? {
              on: formatDate(isoDateInZone(chosenRow.bookedAt), intl, {
                weekday: false,
                year: false,
              }),
              by: chosenRow.bookedByName,
            }
          : null,
      };
    }
  }

  const noticeOpen =
    trip.stayDatesChangedAt !== null &&
    (trip.stayDateNoticeDismissedAt === null ||
      trip.stayDateNoticeDismissedAt < trip.stayDatesChangedAt) &&
    trip.fixedAt !== null &&
    stays.some((s) => trip.fixedAt !== null && s.createdAt < trip.fixedAt);

  const bookerNames = bookersOf(members).map((m) => m.displayName);
  const orgaName = members.find((m) => m.role === "organizer")?.displayName ?? "";
  return {
    isOrganizer,
    orgaName,
    canBook: canBook(me),
    bookers: orList(bookerNames.length > 0 ? bookerNames : [orgaName], format.locale),
    orgaNotBooking: isOrganizer && bookerNames.length > 0 && me.bookerSince === null,
    currency: trip.currency,
    total: stays.length,
    myRated: stays.length - stays.filter((s) => !myRatedIds.has(s.id)).length,
    myUnrated: stays.filter((s) => !myRatedIds.has(s.id)).length,
    myNew: canWrite ? newIds.size : 0,
    membersDone: doneMembers.length,
    membersTotal: members.length,
    travellers,
    partyOverride: trip.partySizeOverride,
    placeholderNames: trip.partySizeOverride === null ? placeholders.map((p) => p.displayName) : [],
    limitReached: stays.length >= 30,
    rankingFree: free,
    ranking,
    all: free ? null : stays.map(item),
    openNames: free
      ? members
          .filter((m) => !doneMembers.includes(m) && m.userId !== me.userId)
          .map((m) => m.displayName)
      : null,
    meOpen: !meDone,
    chosen,
    withoutApp: raw.mark && !chosenRow ? { name: raw.mark.name } : null,
    datesChanged: noticeOpen ? { rebook: trip.stayBookingReset } : null,
    stack: canWrite ? stays.filter((s) => !myRatedIds.has(s.id)).map(item) : [],
  };
}

/**
 * Adapter `stayStatus()` for the way (W16 v2.14). `favourite` only for the organiser or when the
 * viewer's ranking is free (Q33).
 */
export function stayStatus(view: TripView, raw: StaysRaw): StayStatus {
  const { me, members, isOrganizer } = view;
  const { stays, ratings } = raw;
  const stayIds = stays.map((s) => s.id);
  const memberIds = new Set(members.map((m) => m.userId));
  const mine = ratings.filter((r) => r.userId === me.userId);
  const myRatedIds = new Set(mine.map((r) => r.stayId));
  const lastRated = mine.reduce<number | null>(
    (latest, r) => Math.max(latest ?? 0, r.ratedAt.getTime()),
    null,
  );
  const chosenRow = stays.find((s) => s.chosenAt !== null) ?? null;
  const meDone = isDoneRating(stayIds, myRatedIds);
  const byUser = new Map<string, Set<string>>();
  for (const r of ratings) {
    if (!memberIds.has(r.userId)) continue;
    const set = byUser.get(r.userId) ?? new Set<string>();
    set.add(r.stayId);
    byUser.set(r.userId, set);
  }
  const membersDone = members.filter((m) =>
    isDoneRating(stayIds, byUser.get(m.userId) ?? new Set()),
  ).length;
  let favourite: StayStatus["favourite"] = null;
  if (rankingVisible({ organizer: isOrganizer, done: meDone, chosen: chosenRow !== null })) {
    const likes = new Map<string, number>();
    const nopes = new Map<string, number>();
    for (const r of ratings) {
      if (!memberIds.has(r.userId)) continue;
      const target = r.value === "like" ? likes : nopes;
      target.set(r.stayId, (target.get(r.stayId) ?? 0) + 1);
    }
    const travellers = travellerCount(
      members.length,
      view.placeholders.length,
      view.trip.partySizeOverride,
    );
    const ranked = rankStays(
      stays.map((s) => ({
        id: s.id,
        likes: likes.get(s.id) ?? 0,
        nopes: nopes.get(s.id) ?? 0,
        perPerson: s.priceCents === null ? null : perPersonCents(s.priceCents, travellers),
        createdAt: s.createdAt.getTime(),
      })),
    );
    favourite = favouriteOf(ranked, new Map(stays.map((s) => [s.id, s.title])), likes);
  }
  const trip = view.trip;
  const noticeOpen =
    trip.stayDatesChangedAt !== null &&
    (trip.stayDateNoticeDismissedAt === null ||
      trip.stayDateNoticeDismissedAt < trip.stayDatesChangedAt);
  return {
    total: stays.length,
    myUnrated: stays.filter((s) => !myRatedIds.has(s.id)).length,
    myNew: newSince(
      stays.map((s) => ({ id: s.id, createdAt: s.createdAt.getTime() })),
      myRatedIds,
      lastRated,
    ).length,
    membersDone,
    membersTotal: members.length,
    favourite,
    chosen: chosenRow ? { title: chosenRow.title } : null,
    booked: chosenRow?.bookedAt != null,
    rebook: noticeOpen && trip.stayBookingReset,
    withoutApp: raw.mark !== null && chosenRow === null,
  };
}
