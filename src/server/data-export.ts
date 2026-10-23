import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { todayIso } from "@/lib/dates";
import { hasPassword } from "./account";
import { exportRows, partiesOfUser } from "./costs/db";
import { exportTravelData, type TravelExport } from "./travel-data/db";
import { travelDeleteOn } from "@/lib/travel-data";
import { db } from "./db/client";
import {
  availability,
  pollOption,
  pollVote,
  session,
  trip,
  tripInfo,
  tripMember,
  tripStay,
  tripStayRating,
  user,
} from "./db/schema";

/**
 * «Meine Daten herunterladen» (Art. 15/20 DSGVO, F-013/F-043): everything stored about the
 * signed-in person – and ONLY about them. Every query is bound to the user id; from trips only
 * the trip's own facts (name, range, phase, fixed dates) and the person's own entries are
 * included – never names, days, comments or votes of other members (no data of third parties).
 */

export interface DataExport {
  format: "wir-wollen-weg/data-export";
  version: 1;
  exportedAt: string;
  account: {
    name: string;
    email: string;
    language: string;
    country: string;
    holidayRegion: string | null;
    weekStart: string;
    reduceMotion: boolean;
    passwordSet: boolean;
    createdAt: string;
    lastActiveAt: string;
  };
  sessions: {
    createdAt: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
  }[];
  trips: {
    name: string;
    searchRange: { start: string; end: string };
    phase: string;
    fixedDates: { start: string; end: string } | null;
    myRole: "organizer" | "member";
    myNameInTrip: string;
    joinedAt: string;
    submittedAt: string | null;
    comment: string | null;
    /** Only the days that are not «geht» (the default is never stored). */
    myDays: { day: string; state: "maybe" | "no" }[];
    myVotes: { start: string; end: string; answer: "yes" | "maybe" | "no" }[];
    /** UX-8: arrival day for which the small departure-day celebration was shown (Increment 8). */
    departureCelebratedOn: string | null;
    /**
     * F-033: when THIS person last changed the trip's infos (only the time – the infos are trip
     * content, not personal data of the exporting person, features.md R.6).
     */
    infoLastChangedByMeAt: string | null;
    /** F-031 (Increment 9): the places to stay THIS person suggested (R.7 I9-10). */
    myStaySuggestions: {
      link: string;
      title: string;
      price: { amount: number; currency: string } | null;
      note: string | null;
      createdAt: string;
    }[];
    /** Own ratings only (♥ «like» / ✕ «nope») – never ratings of other people. */
    myStayRatings: { title: string; rating: "like" | "nope"; ratedAt: string }[];
    /**
     * F-035/F-036 (Increment 10, R.8 I10-10): own payment details, expenses the person added or
     * paid, own shares, own settlements and the own balance – never names, payment details or
     * shares of other people (the other side is «andere Person» / «other person»).
     */
    costs: CostExport | null;
    /**
     * F-054/F-056 (Increment 11, R.9 I11-11): own releases with values, the access log about
     * them, own «klärt es direkt» answers and own requests as «Bucht» (counts only). Never
     * values, names or states of other people. Null when the trip never involved the person.
     */
    travelData: TravelExport | null;
  }[];
}

const iso = (date: Date | null) => (date ? date.toISOString() : null);

export interface CostExport {
  currency: string;
  myPaymentDetails: { iban: string | null; otherWay: string | null } | null;
  expensesAddedOrPaidByMe: {
    title: string;
    date: string;
    amount: number;
    currency: string;
    category: string | null;
    /** Optional note of the expense (W19 D.5.1) – entered by the person who added or paid it. */
    note: string | null;
    split: "equal" | "amounts";
    addedByMe: boolean;
    paidByMe: boolean;
  }[];
  myShares: { title: string; date: string; myShare: number; currency: string }[];
  mySettlements: {
    direction: "paid to other person" | "received from other person";
    amount: number;
    markedAt: string;
  }[];
  myBalance: number;
}

/** Cost data of ONE person in ONE trip (R.8 I10-10). */
async function costExport(
  tripId: string,
  userId: string,
  currency: string,
  payment: { iban: string | null; note: string | null },
): Promise<CostExport | null> {
  const parties = await partiesOfUser(userId);
  const party = parties.find((p) => p.tripId === tripId)?.partyId ?? null;
  const hasPayment = payment.iban !== null || payment.note !== null;
  if (!party && !hasPayment) return null;
  const raw = party ? await exportRows(tripId) : null;
  const unit = (cents: number) => cents / 100;
  // One pass over the shares (a lookup per expense is quadratic on large trips).
  const myShares = new Map(
    (raw?.shares ?? []).filter((s) => s.partyId === party).map((s) => [s.expenseId, s]),
  );
  return {
    currency,
    myPaymentDetails: hasPayment ? { iban: payment.iban, otherWay: payment.note } : null,
    expensesAddedOrPaidByMe: (raw?.expenses ?? [])
      .filter((e) => e.createdBy === userId || e.payerPartyId === party)
      .map((e) => ({
        title: e.title,
        date: e.spentOn,
        amount: unit(e.amountCents),
        currency: e.currency,
        category: e.category,
        note: e.note,
        split: e.splitMode,
        addedByMe: e.createdBy === userId,
        paidByMe: e.payerPartyId === party,
      })),
    myShares: (raw?.expenses ?? []).flatMap((e) => {
      const share = myShares.get(e.id);
      return share
        ? [
            {
              title: e.title,
              date: e.spentOn,
              myShare: unit(share.shareCents),
              currency: e.currency,
            },
          ]
        : [];
    }),
    mySettlements: (raw?.settlements ?? [])
      .filter((s) => s.from === party || s.to === party)
      .map((s) => ({
        direction: s.from === party ? "paid to other person" : "received from other person",
        amount: unit(s.amountCents),
        markedAt: s.markedAt.toISOString(),
      })),
    myBalance: unit(party && raw ? (raw.balances.get(party) ?? 0) : 0),
  };
}

export async function exportUserData(
  userId: string,
  now = new Date(),
  options: { travelReauthed?: boolean } = {},
): Promise<DataExport | null> {
  const [account] = await db().select().from(user).where(eq(user.id, userId));
  if (!account) return null;
  const [sessions, memberships, days, votes, passwordSet, infoEdits, stays, stayRatings] =
    await Promise.all([
      db()
        .select({
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        })
        .from(session)
        .where(eq(session.userId, userId))
        .orderBy(asc(session.createdAt)),
      db()
        .select({ trip, member: tripMember })
        .from(tripMember)
        .innerJoin(trip, eq(trip.id, tripMember.tripId))
        .where(eq(tripMember.userId, userId))
        .orderBy(asc(tripMember.joinedAt)),
      db()
        .select({ tripId: availability.tripId, day: availability.day, state: availability.state })
        .from(availability)
        .where(eq(availability.userId, userId))
        .orderBy(asc(availability.day)),
      db()
        .select({
          tripId: pollVote.tripId,
          start: pollOption.startDate,
          end: pollOption.endDate,
          choice: pollVote.choice,
        })
        .from(pollVote)
        .innerJoin(
          pollOption,
          and(eq(pollOption.id, pollVote.optionId), eq(pollOption.tripId, pollVote.tripId)),
        )
        .where(eq(pollVote.userId, userId))
        .orderBy(asc(pollOption.startDate)),
      hasPassword(userId),
      db()
        .select({ tripId: tripInfo.tripId, updatedAt: tripInfo.updatedAt })
        .from(tripInfo)
        .where(eq(tripInfo.updatedBy, userId)),
      db()
        .select({
          tripId: tripStay.tripId,
          url: tripStay.url,
          title: tripStay.title,
          priceCents: tripStay.priceCents,
          currency: tripStay.currency,
          note: tripStay.note,
          createdAt: tripStay.createdAt,
        })
        .from(tripStay)
        .where(eq(tripStay.createdBy, userId))
        .orderBy(asc(tripStay.createdAt)),
      db()
        .select({
          tripId: tripStayRating.tripId,
          title: tripStay.title,
          value: tripStayRating.value,
          ratedAt: tripStayRating.ratedAt,
        })
        .from(tripStayRating)
        .innerJoin(
          tripStay,
          and(eq(tripStay.id, tripStayRating.stayId), eq(tripStay.tripId, tripStayRating.tripId)),
        )
        .where(eq(tripStayRating.userId, userId))
        .orderBy(asc(tripStayRating.ratedAt)),
    ]);
  return {
    format: "wir-wollen-weg/data-export",
    version: 1,
    exportedAt: now.toISOString(),
    account: {
      name: account.name,
      email: account.email,
      language: account.locale,
      country: account.country,
      holidayRegion: account.subdivision,
      weekStart: account.weekStart,
      reduceMotion: account.reduceMotion,
      passwordSet,
      createdAt: account.createdAt.toISOString(),
      lastActiveAt: account.lastActiveAt.toISOString(),
    },
    sessions: sessions.map((row) => ({
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
    })),
    trips: await Promise.all(
      memberships.map(async ({ trip: t, member }) => ({
        name: t.name,
        searchRange: { start: t.rangeStart, end: t.rangeEnd },
        phase: t.phase,
        fixedDates: t.fixedStart && t.fixedEnd ? { start: t.fixedStart, end: t.fixedEnd } : null,
        myRole: member.role,
        myNameInTrip: member.displayName,
        joinedAt: member.joinedAt.toISOString(),
        submittedAt: iso(member.submittedAt),
        comment: member.comment,
        myDays: days
          .filter((row) => row.tripId === t.id)
          .map((row) => ({ day: row.day, state: row.state })),
        myVotes: votes
          .filter((row) => row.tripId === t.id)
          .map((row) => ({ start: row.start, end: row.end, answer: row.choice })),
        departureCelebratedOn: member.departureCelebratedOn,
        infoLastChangedByMeAt: iso(infoEdits.find((row) => row.tripId === t.id)?.updatedAt ?? null),
        myStaySuggestions: stays
          .filter((row) => row.tripId === t.id)
          .map((row) => ({
            link: row.url,
            title: row.title,
            price:
              row.priceCents === null
                ? null
                : { amount: row.priceCents / 100, currency: row.currency },
            note: row.note,
            createdAt: row.createdAt.toISOString(),
          })),
        myStayRatings: stayRatings
          .filter((row) => row.tripId === t.id)
          .map((row) => ({
            title: row.title,
            rating: row.value,
            ratedAt: row.ratedAt.toISOString(),
          })),
        costs: await costExport(t.id, userId, t.currency, {
          iban: member.paymentIban,
          note: member.paymentNote,
        }),
        travelData: await exportTravelData(t.id, userId, {
          reauthed: options.travelReauthed === true,
          formerName: "former member",
          deleteOn: t.fixedEnd ? travelDeleteOn(t.fixedEnd) : null,
        }),
      })),
    ),
  };
}

/** File name of the download, e.g. «wir-wollen-weg-daten-2026-10-11.json». */
export function exportFileName(locale: string, now = new Date()): string {
  const date = todayIso(now);
  return locale === "de" ? `wir-wollen-weg-daten-${date}.json` : `when-do-we-go-data-${date}.json`;
}
