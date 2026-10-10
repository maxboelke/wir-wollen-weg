import "server-only";
import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import type { Period, PollOptionData, VoteChoice, VoteRow } from "@/lib/poll";
import { MAX_OPTIONS, periodKey } from "@/lib/poll";
import { db } from "./db/client";
import { pollOption, pollVote, trip, tripMember } from "./db/schema";

/**
 * Vote data access (F-010, F-011, F-012). Like src/server/trips.ts every function takes the
 * trip id (and user id) of a membership the caller resolved through `findMembership` with the
 * session user – role checks happen in the Server Actions. Writes lock the trip row, so phase
 * changes and votes are serialised: a vote never lands after the dates were fixed, two
 * organisers' tabs cannot fix twice, a vote cannot be started twice (Flow D, review lessons
 * R-022/R-039).
 */

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

/** PostgreSQL unique violation (23505) – also when wrapped by drizzle. */
function isUniqueViolation(error: unknown): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    if ((current as Error & { code?: unknown }).code === "23505") return true;
  }
  return false;
}

async function lockedPhase(tx: Tx, tripId: string, mode: "update" | "share") {
  const [row] = await tx
    .select({ phase: trip.phase })
    .from(trip)
    .where(eq(trip.id, tripId))
    .for(mode);
  return row?.phase ?? null;
}

/** Options in creation order (F-010; the order of the cards before everyone voted, W10-08). */
export async function listOptions(tripId: string): Promise<PollOptionData[]> {
  const rows = await db()
    .select({ id: pollOption.id, start: pollOption.startDate, end: pollOption.endDate })
    .from(pollOption)
    .where(eq(pollOption.tripId, tripId))
    .orderBy(asc(pollOption.createdAt), asc(pollOption.startDate), asc(pollOption.id));
  return rows;
}

/**
 * All votes of a trip. Never send these to the browser directly – they go through
 * `pollForViewer` (Q13 a), which removes results the viewer may not see yet.
 */
export async function listVotes(tripId: string): Promise<VoteRow[]> {
  return db()
    .select({ optionId: pollVote.optionId, userId: pollVote.userId, choice: pollVote.choice })
    .from(pollVote)
    .where(eq(pollVote.tripId, tripId));
}

export type StartResult = { ok: true } | { ok: false; reason: "phase" | "duplicate" };

/**
 * F-010 «Abstimmung starten»: phase «Tage sammeln» → «Abstimmung läuft» with 2–6 options
 * (validated by the caller) and the optional deadline (F-017). One transaction with the trip
 * row locked: a second start (double click, second tab, replay) finds the phase changed.
 */
export async function startPoll(
  tripId: string,
  options: readonly Period[],
  deadline: string | null,
): Promise<StartResult> {
  try {
    return await db().transaction(async (tx) => {
      if ((await lockedPhase(tx, tripId, "update")) !== "collecting") {
        return { ok: false, reason: "phase" } as const;
      }
      // One vote per trip in the MVP: there are no options in phase 1 – clear leftovers anyway.
      await tx.delete(pollOption).where(eq(pollOption.tripId, tripId));
      const now = new Date();
      // Distinct creation times keep the order of the list (Postgres now() is per transaction).
      await tx.insert(pollOption).values(
        options.map((option, index) => ({
          tripId,
          startDate: option.start,
          endDate: option.end,
          createdAt: new Date(now.getTime() + index),
        })),
      );
      await tx
        .update(trip)
        .set({ phase: "voting", pollDeadline: deadline, pollStartedAt: now, updatedAt: now })
        .where(eq(trip.id, tripId));
      await tx.update(tripMember).set({ votedAt: null }).where(eq(tripMember.tripId, tripId));
      return { ok: true } as const;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "duplicate" };
    throw error;
  }
}

export type AddOptionResult =
  { ok: true; id: string } | { ok: false; reason: "phase" | "full" | "duplicate" };

/**
 * «+ Option hinzufügen» after the start (F-010: only adding, never changing – existing votes
 * stay valid). Nobody has answered the new option yet, so the status «abgestimmt» is reset for
 * everyone (Flow D.2 #4: «abgestimmt» = an answer on every option).
 */
export async function addOption(tripId: string, period: Period): Promise<AddOptionResult> {
  try {
    return await db().transaction(async (tx) => {
      if ((await lockedPhase(tx, tripId, "update")) !== "voting") {
        return { ok: false, reason: "phase" } as const;
      }
      const [existing] = await tx
        .select({ n: count() })
        .from(pollOption)
        .where(eq(pollOption.tripId, tripId));
      if ((existing?.n ?? 0) >= MAX_OPTIONS) return { ok: false, reason: "full" } as const;
      const [row] = await tx
        .insert(pollOption)
        .values({ tripId, startDate: period.start, endDate: period.end })
        .returning({ id: pollOption.id });
      await tx.update(tripMember).set({ votedAt: null }).where(eq(tripMember.tripId, tripId));
      await tx.update(trip).set({ updatedAt: new Date() }).where(eq(trip.id, tripId));
      return { ok: true, id: row?.id ?? "" } as const;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "duplicate" };
    throw error;
  }
}

export type VoteResult =
  { ok: true; votedAll: boolean } | { ok: false; reason: "phase" | "unknownOption" };

/**
 * F-011: one answer per member and option (primary key → upsert; a replay or a double tap
 * just writes the same answer again). Only while the vote is open – the trip row is locked
 * shared, so fixing the dates (exclusive lock) waits for running votes and vice versa.
 * Updates the status «abgestimmt» (all options answered).
 */
export async function castVotes(
  tripId: string,
  userId: string,
  votes: readonly { optionId: string; choice: VoteChoice }[],
): Promise<VoteResult> {
  return db().transaction(async (tx) => {
    if ((await lockedPhase(tx, tripId, "share")) !== "voting") {
      return { ok: false, reason: "phase" } as const;
    }
    const ids = [...new Set(votes.map((vote) => vote.optionId))];
    const known = await tx
      .select({ id: pollOption.id })
      .from(pollOption)
      .where(and(eq(pollOption.tripId, tripId), inArray(pollOption.id, ids)));
    if (known.length !== ids.length) return { ok: false, reason: "unknownOption" } as const;
    // Last answer per option wins inside one request.
    const latest = new Map(votes.map((vote) => [vote.optionId, vote.choice]));
    const now = new Date();
    await tx
      .insert(pollVote)
      .values([...latest].map(([optionId, choice]) => ({ optionId, tripId, userId, choice })))
      .onConflictDoUpdate({
        target: [pollVote.optionId, pollVote.userId],
        set: { choice: sql`excluded.choice`, updatedAt: now },
      });
    const [totals] = await tx
      .select({
        options: sql<number>`(select count(*)::int from ${pollOption} where ${pollOption.tripId} = ${tripId})`,
        answered: sql<number>`(select count(*)::int from ${pollVote} where ${pollVote.tripId} = ${tripId} and ${pollVote.userId} = ${userId})`,
      })
      .from(trip)
      .where(eq(trip.id, tripId));
    const votedAll = (totals?.options ?? 0) > 0 && totals?.answered === totals?.options;
    await tx
      .update(tripMember)
      .set({ votedAt: votedAll ? sql`coalesce(${tripMember.votedAt}, now())` : null })
      .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
    return { ok: true, votedAll } as const;
  });
}

export type FixResult =
  { ok: true; period: Period } | { ok: false; reason: "phase" | "unknownOption" };

/**
 * F-012 «Termin festlegen»: closes the vote with the chosen option (organiser – checked by
 * the caller). Exclusive lock on the trip row: two parallel fixings → the second finds phase
 * «fixed» and reports a conflict (ux-spec §6 «Lena hat den Termin inzwischen festgelegt»).
 */
export async function fixDates(tripId: string, optionId: string): Promise<FixResult> {
  return db().transaction(async (tx) => {
    if ((await lockedPhase(tx, tripId, "update")) !== "voting") {
      return { ok: false, reason: "phase" } as const;
    }
    const [option] = await tx
      .select({ start: pollOption.startDate, end: pollOption.endDate })
      .from(pollOption)
      .where(and(eq(pollOption.tripId, tripId), eq(pollOption.id, optionId)));
    if (!option) return { ok: false, reason: "unknownOption" } as const;
    const now = new Date();
    await tx
      .update(trip)
      .set({
        phase: "fixed",
        fixedStart: option.start,
        fixedEnd: option.end,
        fixedAt: now,
        updatedAt: now,
      })
      .where(eq(trip.id, tripId));
    return { ok: true, period: option } as const;
  });
}

/**
 * «Festlegung aufheben» (F-012, W11-07): back to «Abstimmung läuft»; all votes stay. The
 * members' celebration markers stay too – fixing the SAME range again does not celebrate twice.
 */
export async function unfixDates(tripId: string): Promise<{ ok: boolean }> {
  return db().transaction(async (tx) => {
    if ((await lockedPhase(tx, tripId, "update")) !== "fixed") return { ok: false };
    await tx
      .update(trip)
      .set({
        phase: "voting",
        fixedStart: null,
        fixedEnd: null,
        fixedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(trip.id, tripId));
    return { ok: true };
  });
}

/**
 * Remembers that this member has seen the celebration for the current fixed range (F-012,
 * Q17 b: once per person and fixing, across devices). Only for the range that is fixed right
 * now – a stale tab cannot mark a different range.
 */
export async function markCelebrated(
  tripId: string,
  userId: string,
  period: Period,
): Promise<boolean> {
  const updated = await db()
    .update(tripMember)
    .set({ celebratedFor: periodKey(period) })
    .where(
      and(
        eq(tripMember.tripId, tripId),
        eq(tripMember.userId, userId),
        sql`exists (select 1 from ${trip} where ${trip.id} = ${tripId} and ${trip.phase} = 'fixed'
              and ${trip.fixedStart} = ${period.start} and ${trip.fixedEnd} = ${period.end})`,
      ),
    )
    .returning({ userId: tripMember.userId });
  return updated.length > 0;
}
