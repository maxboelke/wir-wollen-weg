import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { InfoValues } from "@/lib/trip-info";
import { db } from "./db/client";
import { trip, tripInfo, tripMember, tripPlaceholder } from "./db/schema";

/**
 * Data of the «Reiseverlauf» cockpit and the info page (F-053, F-033, Increment 8). Like
 * src/server/trips.ts every function takes the internal trip id – callers resolve it through
 * the viewer's membership first (no IDOR); role checks happen in the Server Actions.
 */

export interface TripInfoView extends InfoValues {
  version: number;
  updatedAt: Date;
  /** Current display name of the last editor in this trip – null once they left/were deleted. */
  editorName: string | null;
}

/** Infos of the trip (W22) or null when nothing was ever saved. */
export async function getTripInfo(tripId: string): Promise<TripInfoView | null> {
  const [row] = await db()
    .select({ info: tripInfo, editorName: tripMember.displayName })
    .from(tripInfo)
    .leftJoin(
      tripMember,
      and(eq(tripMember.tripId, tripInfo.tripId), eq(tripMember.userId, tripInfo.updatedBy)),
    )
    .where(eq(tripInfo.tripId, tripId));
  if (!row) return null;
  const { info } = row;
  return {
    stayName: info.stayName,
    address: info.address,
    checkIn: info.checkIn,
    checkOut: info.checkOut,
    meetingPoint: info.meetingPoint,
    emergencyName: info.emergencyName,
    emergencyPhone: info.emergencyPhone,
    notes: info.notes,
    version: info.version,
    updatedAt: info.updatedAt,
    editorName: row.editorName,
  };
}

export type SaveInfoResult =
  | { ok: true; version: number }
  | { ok: false; reason: "conflict"; version: number; editorName: string | null };

/**
 * Saves the infos (organiser – checked by the caller). Conflict detection by version
 * (W22 C): the form sends the version it was opened with; a newer version → «{Name} hat die
 * Infos inzwischen geändert» instead of silently overwriting. Saving again with the version
 * from the conflict answer overwrites («letzte Speicherung gewinnt»). The row is locked while
 * comparing, so two parallel saves cannot both pass the check.
 */
export async function saveTripInfo(
  tripId: string,
  userId: string,
  values: InfoValues,
  expectedVersion: number,
): Promise<SaveInfoResult> {
  return db().transaction(async (tx) => {
    const [current] = await tx
      .select({ version: tripInfo.version, updatedBy: tripInfo.updatedBy })
      .from(tripInfo)
      .where(eq(tripInfo.tripId, tripId))
      .for("update");
    const currentVersion = current?.version ?? 0;
    if (currentVersion !== expectedVersion) {
      const [editor] = current?.updatedBy
        ? await tx
            .select({ name: tripMember.displayName })
            .from(tripMember)
            .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, current.updatedBy)))
        : [];
      return {
        ok: false,
        reason: "conflict",
        version: currentVersion,
        editorName: editor?.name ?? null,
      } as const;
    }
    const version = currentVersion + 1;
    const now = new Date();
    await tx
      .insert(tripInfo)
      .values({ tripId, ...values, updatedBy: userId, updatedAt: now, version })
      .onConflictDoUpdate({
        target: tripInfo.tripId,
        set: { ...values, updatedBy: userId, updatedAt: now, version },
      });
    return { ok: true, version } as const;
  });
}

/** V1: the organiser told everyone (WhatsApp/share/copy in «Allen Bescheid geben»). */
export async function markAnnounced(tripId: string): Promise<boolean> {
  const rows = await db()
    .update(trip)
    .set({ fixedAnnouncedAt: new Date() })
    .where(and(eq(trip.id, tripId), eq(trip.phase, "fixed"), isNull(trip.fixedAnnouncedAt)))
    .returning({ id: trip.id });
  return rows.length > 0;
}

/**
 * UX-9: «{Name} macht ohne App mit» on (organiser id) or off (null) for an OPEN placeholder of
 * THIS trip – a placeholder of another trip or one that was claimed meanwhile is not found.
 */
export async function setPlaceholderWithoutApp(
  tripId: string,
  placeholderId: string,
  by: string | null,
): Promise<boolean> {
  const rows = await db()
    .update(tripPlaceholder)
    .set(
      by
        ? { withoutAppAt: new Date(), withoutAppBy: by }
        : { withoutAppAt: null, withoutAppBy: null },
    )
    .where(
      and(
        eq(tripPlaceholder.id, placeholderId),
        eq(tripPlaceholder.tripId, tripId),
        isNull(tripPlaceholder.claimedAt),
      ),
    )
    .returning({ id: tripPlaceholder.id });
  return rows.length > 0;
}

/**
 * UX-8: this member has seen the small departure-day celebration for this arrival day – only
 * while that day is still the fixed arrival (a stale tab cannot mark another date).
 */
export async function markDepartureCelebrated(
  tripId: string,
  userId: string,
  start: string,
): Promise<boolean> {
  const rows = await db()
    .update(tripMember)
    .set({ departureCelebratedOn: start })
    .where(
      and(
        eq(tripMember.tripId, tripId),
        eq(tripMember.userId, userId),
        sql`exists (select 1 from ${trip} where ${trip.id} = ${tripId} and ${trip.phase} = 'fixed'
              and ${trip.fixedStart} = ${start})`,
      ),
    )
    .returning({ userId: tripMember.userId });
  return rows.length > 0;
}
