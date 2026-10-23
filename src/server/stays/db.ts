import "server-only";
import { and, asc, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { STAY_LIMITS, type StayRatingValue } from "@/lib/stays";
import { db } from "../db/client";
import {
  trip,
  tripMember,
  tripStationMark,
  tripStay,
  tripStayRating,
  type StayPreviewState,
} from "../db/schema";

/**
 * Data access of the places to stay (F-031, features.md R.7). Like src/server/trips.ts every
 * function takes the INTERNAL trip id – callers resolve it through the viewer's membership
 * first (no IDOR); every statement is bound to that trip id, so a suggestion of another trip is
 * never found. Role checks happen in the Server Actions; the rules that depend on concurrent
 * changes (30 limit, «nichts festgelegt», picked place not deletable) are checked here under
 * the trip row lock.
 */

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

export type StayRow = typeof tripStay.$inferSelect;

export interface StayData extends StayRow {
  /** Display name of the author in this trip – null once they left or deleted the account. */
  authorName: string | null;
  bookedByName: string | null;
}

/**
 * Display name of a person in the row's trip – null once they left or deleted the account.
 * Column references are written out (fully qualified): inside a sub-select drizzle would
 * render them unqualified and PostgreSQL would bind them to `trip_member`.
 */
function memberName(table: "trip_stay" | "trip_station_marks", column: string) {
  return sql<string | null>`(select m.display_name from trip_member m
    where m.trip_id = ${sql.raw(`"${table}"."trip_id"`)} and m.user_id = ${sql.raw(`"${table}"."${column}"`)})`;
}

export interface RatingRow {
  stayId: string;
  userId: string;
  value: StayRatingValue;
  ratedAt: Date;
}

/** Suggestions in neutral order (arrival, oldest first – R.7 I9-01). */
export async function listStays(tripId: string): Promise<StayData[]> {
  const author = memberName("trip_stay", "created_by");
  const booker = memberName("trip_stay", "booked_by");
  const rows = await db()
    .select({ stay: tripStay, authorName: author, bookedByName: booker })
    .from(tripStay)
    .where(eq(tripStay.tripId, tripId))
    .orderBy(asc(tripStay.createdAt), asc(tripStay.id));
  return rows.map((row) => ({
    ...row.stay,
    authorName: row.authorName,
    bookedByName: row.bookedByName,
  }));
}

/** All ratings of a trip – filter for the viewer BEFORE anything reaches a client (Q33). */
export async function listRatings(tripId: string): Promise<RatingRow[]> {
  return db()
    .select({
      stayId: tripStayRating.stayId,
      userId: tripStayRating.userId,
      value: tripStayRating.value,
      ratedAt: tripStayRating.ratedAt,
    })
    .from(tripStayRating)
    .where(eq(tripStayRating.tripId, tripId))
    .orderBy(asc(tripStayRating.ratedAt));
}

/**
 * Stored image URL of a suggestion – only when the user is a member of its trip (image proxy,
 * R.7 I9-04). The phase does not matter: the area stays reachable via the tile afterwards.
 */
export async function stayImageForMember(stayId: string, userId: string): Promise<string | null> {
  const [row] = await db()
    .select({ imageUrl: tripStay.previewImageUrl })
    .from(tripStay)
    .innerJoin(
      tripMember,
      and(eq(tripMember.tripId, tripStay.tripId), eq(tripMember.userId, userId)),
    )
    .where(eq(tripStay.id, stayId));
  return row?.imageUrl ?? null;
}

/** UX-9 mark of station V3 (who and when) – null when not set. */
export async function stationMark(tripId: string) {
  const [row] = await db()
    .select({
      setAt: tripStationMark.setAt,
      name: memberName("trip_station_marks", "set_by"),
    })
    .from(tripStationMark)
    .where(and(eq(tripStationMark.tripId, tripId), eq(tripStationMark.station, "V3")));
  return row ?? null;
}

/** Locks the trip row and returns what the stay rules need. */
async function lockedTrip(tx: Tx, tripId: string, mode: "update" | "share") {
  const [row] = await tx
    .select({ phase: trip.phase, currency: trip.currency })
    .from(trip)
    .where(eq(trip.id, tripId))
    .for(mode);
  return row ?? null;
}

async function chosenStayId(tx: Tx, tripId: string): Promise<string | null> {
  const [row] = await tx
    .select({ id: tripStay.id })
    .from(tripStay)
    .where(and(eq(tripStay.tripId, tripId), isNotNull(tripStay.chosenAt)));
  return row?.id ?? null;
}

export interface DuplicateInfo {
  stayId: string;
  authorId: string | null;
  authorName: string | null;
}

/** An existing suggestion with the same normalised link (W17 F.2 «Doppelter Link»). */
export async function findDuplicate(
  tripId: string,
  urlNormalized: string,
): Promise<DuplicateInfo | null> {
  const [row] = await db()
    .select({
      stayId: tripStay.id,
      authorId: tripStay.createdBy,
      authorName: memberName("trip_stay", "created_by"),
    })
    .from(tripStay)
    .where(and(eq(tripStay.tripId, tripId), eq(tripStay.urlNormalized, urlNormalized)));
  return row ?? null;
}

export interface NewStay {
  url: string;
  urlNormalized: string;
  title: string;
  priceCents: number | null;
  note: string | null;
  previewImageUrl: string | null;
  previewSiteName: string | null;
  previewStatus: StayPreviewState;
}

export type CreateStayResult =
  | { ok: true; id: string }
  | { ok: false; reason: "phase" | "chosen" | "limit" }
  | { ok: false; reason: "duplicate"; duplicate: DuplicateInfo };

/**
 * New suggestion (R.7 I9-02): under the trip lock – phase «fixed», nothing picked yet, fewer
 * than 30 suggestions, link not suggested yet (the unique index decides under concurrency).
 * The currency is the trip's at this moment.
 */
export async function createStay(
  tripId: string,
  userId: string,
  values: NewStay,
): Promise<CreateStayResult> {
  const result = await db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return { ok: false, reason: "phase" } as const;
    if (await chosenStayId(tx, tripId)) return { ok: false, reason: "chosen" } as const;
    const [counted] = await tx
      .select({ n: count() })
      .from(tripStay)
      .where(eq(tripStay.tripId, tripId));
    if ((counted?.n ?? 0) >= STAY_LIMITS.perTrip) return { ok: false, reason: "limit" } as const;
    const inserted = await tx
      .insert(tripStay)
      .values({ tripId, createdBy: userId, currency: locked.currency, ...values })
      .onConflictDoNothing({ target: [tripStay.tripId, tripStay.urlNormalized] })
      .returning({ id: tripStay.id });
    const row = inserted[0];
    if (!row) return { ok: false, reason: "duplicateLater" } as const;
    return { ok: true, id: row.id } as const;
  });
  if (!result.ok && result.reason === "duplicateLater") {
    const duplicate = await findDuplicate(tripId, values.urlNormalized);
    return duplicate
      ? { ok: false, reason: "duplicate", duplicate }
      : { ok: false, reason: "limit" };
  }
  return result;
}

/** Background preview after saving (R.7 I9-02): only while the suggestion is still «pending». */
export async function setStayPreview(
  tripId: string,
  stayId: string,
  preview: { imageUrl: string | null; siteName: string | null; ok: boolean },
): Promise<void> {
  await db()
    .update(tripStay)
    .set({
      previewImageUrl: preview.imageUrl,
      previewSiteName: preview.siteName,
      previewStatus: preview.ok ? "ok" : "none",
    })
    .where(
      and(
        eq(tripStay.id, stayId),
        eq(tripStay.tripId, tripId),
        eq(tripStay.previewStatus, "pending"),
      ),
    );
}

/** One suggestion of THIS trip (null for unknown ids or ids of other trips). */
export async function findStay(tripId: string, stayId: string): Promise<StayRow | null> {
  const [row] = await db()
    .select()
    .from(tripStay)
    .where(and(eq(tripStay.id, stayId), eq(tripStay.tripId, tripId)));
  return row ?? null;
}

export interface Actor {
  userId: string;
  organizer: boolean;
}

/** Edit title, price, note (W17 F.4): author or organiser; not the picked place once booked. */
export async function updateStay(
  tripId: string,
  stayId: string,
  actor: Actor,
  values: { title: string; priceCents: number | null; note: string | null },
): Promise<boolean> {
  const rows = await db()
    .update(tripStay)
    .set(values)
    .where(
      and(
        eq(tripStay.id, stayId),
        eq(tripStay.tripId, tripId),
        isNull(tripStay.bookedAt),
        actor.organizer ? sql`true` : eq(tripStay.createdBy, actor.userId),
        sql`exists (select 1 from ${trip} where ${trip.id} = ${tripId} and ${trip.phase} = 'fixed')`,
      ),
    )
    .returning({ id: tripStay.id });
  return rows.length > 0;
}

/** Delete (W18 E.4): author or organiser; never the picked place (unpick first). */
export async function deleteStay(tripId: string, stayId: string, actor: Actor): Promise<boolean> {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return false;
    const rows = await tx
      .delete(tripStay)
      .where(
        and(
          eq(tripStay.id, stayId),
          eq(tripStay.tripId, tripId),
          isNull(tripStay.chosenAt),
          actor.organizer ? sql`true` : eq(tripStay.createdBy, actor.userId),
        ),
      )
      .returning({ id: tripStay.id });
    return rows.length > 0;
  });
}

export type RateResult =
  { ok: true; openIds: string[] } | { ok: false; reason: "phase" | "chosen" | "gone" };

/**
 * Rate (♥/✕) or take back (null) – R.7 I9-05. Under a SHARE lock of the trip row, so it cannot
 * slip past a parallel «Das wird's» (which takes the exclusive lock). Answers with the ids the
 * person has still open (W18 E.5.6: new suggestions are appended to the stack).
 */
export async function rateStay(
  tripId: string,
  stayId: string,
  userId: string,
  value: StayRatingValue | null,
): Promise<RateResult> {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "share");
    if (locked?.phase !== "fixed") return { ok: false, reason: "phase" } as const;
    if (await chosenStayId(tx, tripId)) return { ok: false, reason: "chosen" } as const;
    const [stay] = await tx
      .select({ id: tripStay.id })
      .from(tripStay)
      .where(and(eq(tripStay.id, stayId), eq(tripStay.tripId, tripId)));
    if (!stay) return { ok: false, reason: "gone" } as const;
    if (value === null) {
      await tx
        .delete(tripStayRating)
        .where(and(eq(tripStayRating.stayId, stayId), eq(tripStayRating.userId, userId)));
    } else {
      const now = new Date();
      await tx
        .insert(tripStayRating)
        .values({ stayId, tripId, userId, value, ratedAt: now })
        .onConflictDoUpdate({
          target: [tripStayRating.stayId, tripStayRating.userId],
          set: { value, ratedAt: now },
        });
    }
    const open = await tx
      .select({ id: tripStay.id })
      .from(tripStay)
      .where(
        and(
          eq(tripStay.tripId, tripId),
          sql`not exists (select 1 from trip_stay_rating r where r.stay_id = "trip_stay"."id"
            and r.user_id = ${userId})`,
        ),
      )
      .orderBy(asc(tripStay.createdAt), asc(tripStay.id));
    return { ok: true, openIds: open.map((row) => row.id) } as const;
  });
}

/**
 * «Das wird's» (organiser – checked by the caller): exactly one picked place per trip (partial
 * unique index). Picking makes a UX-9 mark obsolete (R.7: «dann zählt die Festlegung»).
 */
export async function chooseStay(tripId: string, stayId: string, userId: string) {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return { ok: false, reason: "phase" } as const;
    if (await chosenStayId(tx, tripId)) return { ok: false, reason: "chosen" } as const;
    const rows = await tx
      .update(tripStay)
      .set({ chosenAt: new Date(), chosenBy: userId, bookedAt: null, bookedBy: null })
      .where(and(eq(tripStay.id, stayId), eq(tripStay.tripId, tripId)))
      .returning({ id: tripStay.id });
    if (rows.length === 0) return { ok: false, reason: "gone" } as const;
    await tx
      .delete(tripStationMark)
      .where(and(eq(tripStationMark.tripId, tripId), eq(tripStationMark.station, "V3")));
    await tx.update(trip).set({ stayBookingReset: false }).where(eq(trip.id, tripId));
    return { ok: true } as const;
  });
}

/** «Festlegung aufheben»: picked AND booked are reset; ratings stay (R.7 I9-07). */
export async function unchooseStay(tripId: string): Promise<boolean> {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return false;
    const rows = await tx
      .update(tripStay)
      .set({ chosenAt: null, chosenBy: null, bookedAt: null, bookedBy: null })
      .where(and(eq(tripStay.tripId, tripId), isNotNull(tripStay.chosenAt)))
      .returning({ id: tripStay.id });
    await tx.update(trip).set({ stayBookingReset: false }).where(eq(trip.id, tripId));
    return rows.length > 0;
  });
}

/** «Als gebucht markieren» / «Doch nicht gebucht» – only the picked place (R.7 I9-07). */
export async function setBooked(tripId: string, by: string | null): Promise<boolean> {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return false;
    const rows = await tx
      .update(tripStay)
      .set(by ? { bookedAt: new Date(), bookedBy: by } : { bookedAt: null, bookedBy: null })
      .where(and(eq(tripStay.tripId, tripId), isNotNull(tripStay.chosenAt)))
      .returning({ id: tripStay.id });
    if (rows.length > 0 && by) {
      await tx.update(trip).set({ stayBookingReset: false }).where(eq(trip.id, tripId));
    }
    return rows.length > 0;
  });
}

/** UX-9 «Haben wir schon / brauchen wir nicht» on/off – only while nothing is picked. */
export async function setStayWithoutApp(tripId: string, by: string | null): Promise<boolean> {
  return db().transaction(async (tx) => {
    const locked = await lockedTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return false;
    if (!by) {
      await tx
        .delete(tripStationMark)
        .where(and(eq(tripStationMark.tripId, tripId), eq(tripStationMark.station, "V3")));
      return true;
    }
    if (await chosenStayId(tx, tripId)) return false;
    await tx
      .insert(tripStationMark)
      .values({ tripId, station: "V3", setBy: by, setAt: new Date() })
      .onConflictDoUpdate({
        target: [tripStationMark.tripId, tripStationMark.station],
        set: { setBy: by, setAt: new Date() },
      });
    return true;
  });
}

/** «Für wie viele rechnet ihr?» – 1–50 or null (automatic). */
export async function setPartySize(tripId: string, size: number | null): Promise<void> {
  await db().update(trip).set({ partySizeOverride: size }).where(eq(trip.id, tripId));
}

/** Organiser closes «Euer Termin hat sich geändert» for everyone (W18 E.8). */
export async function dismissDateNotice(tripId: string): Promise<void> {
  await db()
    .update(trip)
    .set({ stayDateNoticeDismissedAt: new Date(), stayBookingReset: false })
    .where(eq(trip.id, tripId));
}
