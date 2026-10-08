import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "./db/client";
import { trip, tripMember } from "./db/schema";

// Placeholder trip queries for the auth spike (P1-0a). Replaced by
// src/features/trips in Increment 2 (F-001 ff.).

export async function findTripByInviteToken(token: string) {
  const [row] = await db()
    .select({ id: trip.id, name: trip.name })
    .from(trip)
    .where(eq(trip.inviteToken, token))
    .limit(1);
  return row;
}

export async function countMembers(tripId: string): Promise<number> {
  const [row] = await db()
    .select({ value: count() })
    .from(tripMember)
    .where(eq(tripMember.tripId, tripId));
  return row?.value ?? 0;
}

export async function isMember(tripId: string, userId: string): Promise<boolean> {
  const [row] = await db()
    .select({ tripId: tripMember.tripId })
    .from(tripMember)
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)))
    .limit(1);
  return row !== undefined;
}

export async function addMember(tripId: string, userId: string, displayName: string) {
  await db().insert(tripMember).values({ tripId, userId, displayName }).onConflictDoNothing();
}

export async function listTripsForUser(userId: string) {
  return db()
    .select({ id: trip.id, name: trip.name, displayName: tripMember.displayName })
    .from(tripMember)
    .innerJoin(trip, eq(trip.id, tripMember.tripId))
    .where(eq(tripMember.userId, userId))
    .orderBy(trip.name);
}
