import "server-only";
import { and, asc, between, eq, isNotNull } from "drizzle-orm";
import type { AvailabilityEntry, ImportFeedback } from "@/lib/availability";
import type { EditableWindow } from "@/lib/calendar";
import { db } from "./db/client";
import { availability, tripMember } from "./db/schema";

/**
 * Own availability (F-005) and the submission status (F-007). Every function takes the trip
 * id and user id of a membership that the caller resolved through `findMembership` with the
 * session user – there is no way to read or write someone else's days (no IDOR).
 */

/** Own marked days of a trip, sorted by date. */
export async function listOwnAvailability(
  tripId: string,
  userId: string,
): Promise<AvailabilityEntry[]> {
  const rows = await db()
    .select({ day: availability.day, state: availability.state })
    .from(availability)
    .where(and(eq(availability.tripId, tripId), eq(availability.userId, userId)))
    .orderBy(asc(availability.day));
  return rows.map((row) => [row.day, row.state]);
}

/**
 * Replaces the own days inside the editable window with `entries` (a full snapshot, so retries
 * are idempotent and the order of requests does not matter for the result). Days outside the
 * window – past days, or days outside a search range the organiser has since shortened (Flow
 * B.4: «Daten außerhalb bleiben gespeichert») – stay untouched. One transaction.
 */
export async function replaceAvailability(
  tripId: string,
  userId: string,
  window: EditableWindow,
  entries: readonly AvailabilityEntry[],
): Promise<Date> {
  const now = new Date();
  const inWindow = entries.filter(([day]) => day >= window.first && day <= window.last);
  await db().transaction(async (tx) => {
    await tx
      .delete(availability)
      .where(
        and(
          eq(availability.tripId, tripId),
          eq(availability.userId, userId),
          between(availability.day, window.first, window.last),
        ),
      );
    if (inWindow.length > 0) {
      await tx
        .insert(availability)
        .values(inWindow.map(([day, state]) => ({ tripId, userId, day, state })));
    }
    await tx
      .update(tripMember)
      .set({ availabilityUpdatedAt: now })
      .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
  });
  return now;
}

/** «Fertig – abgeben» (F-005/F-007): status «abgegeben» from now on; later changes count at once. */
export async function markSubmitted(tripId: string, userId: string): Promise<Date> {
  const now = new Date();
  const [row] = await db()
    .select({ submittedAt: tripMember.submittedAt })
    .from(tripMember)
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
  await db()
    .update(tripMember)
    .set({ submittedAt: row?.submittedAt ?? now, availabilityUpdatedAt: now })
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
  return now;
}

export async function saveComment(
  tripId: string,
  userId: string,
  comment: string | null,
): Promise<void> {
  await db()
    .update(tripMember)
    .set({ comment, availabilityUpdatedAt: new Date() })
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
}

export async function saveImportFeedback(
  tripId: string,
  userId: string,
  answer: ImportFeedback,
): Promise<void> {
  await db()
    .update(tripMember)
    .set({ importFeedback: answer })
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
}

/** The import question is asked once per person (F-005: «einmalig»), not once per trip. */
export async function hasAnsweredImportFeedback(userId: string): Promise<boolean> {
  const [row] = await db()
    .select({ tripId: tripMember.tripId })
    .from(tripMember)
    .where(and(eq(tripMember.userId, userId), isNotNull(tripMember.importFeedback)))
    .limit(1);
  return row !== undefined;
}

/**
 * Days of everyone who SUBMITTED (F-008 counting rule U-4) – drafts of members who have not
 * submitted yet never leave the server. Only call with the trip id of a membership resolved
 * through `findMembership` for the session user (the page guard), so only members see it.
 */
export async function listSubmittedAvailability(
  tripId: string,
): Promise<{ userId: string; day: string; state: "maybe" | "no" }[]> {
  return db()
    .select({ userId: availability.userId, day: availability.day, state: availability.state })
    .from(availability)
    .innerJoin(
      tripMember,
      and(eq(tripMember.tripId, availability.tripId), eq(tripMember.userId, availability.userId)),
    )
    .where(and(eq(availability.tripId, tripId), isNotNull(tripMember.submittedAt)))
    .orderBy(asc(availability.userId), asc(availability.day));
}
