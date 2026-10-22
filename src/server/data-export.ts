import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { hasPassword } from "./account";
import { db } from "./db/client";
import {
  availability,
  pollOption,
  pollVote,
  session,
  trip,
  tripInfo,
  tripMember,
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
  }[];
}

const iso = (date: Date | null) => (date ? date.toISOString() : null);

export async function exportUserData(userId: string, now = new Date()): Promise<DataExport | null> {
  const [account] = await db().select().from(user).where(eq(user.id, userId));
  if (!account) return null;
  const [sessions, memberships, days, votes, passwordSet, infoEdits] = await Promise.all([
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
    trips: memberships.map(({ trip: t, member }) => ({
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
    })),
  };
}

/** File name of the download, e.g. «wir-wollen-weg-daten-2026-10-11.json». */
export function exportFileName(locale: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return locale === "de" ? `wir-wollen-weg-daten-${date}.json` : `when-do-we-go-data-${date}.json`;
}
