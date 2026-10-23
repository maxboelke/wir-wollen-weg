import "server-only";
import { and, asc, count, eq, gt, inArray, isNotNull, isNull, ne, or, sql } from "drizzle-orm";
import { todayIso, type IsoDate } from "@/lib/dates";
import {
  CONSENT_VERSION,
  maskValue,
  parseStoredValues,
  TRAVEL_LIMITS,
  TRAVEL_SCHEMA_VERSION,
  travelDataExpired,
  unfixedTooLong,
  validateTravelValues,
  copyFieldsOf,
  valueOf,
  type CopyField,
  type TravelField,
  type TravelInput,
  type TravelValues,
  type ValueErrors,
} from "@/lib/travel-data";
import { travelReauthIdentifier } from "../auth/reauth";
import { db } from "../db/client";
import {
  travelDataAccess,
  travelDataRecipient,
  travelDataRelease,
  travelDataRequest,
  trip,
  tripMember,
  tripPlaceholder,
  verification,
  type TravelClosedReason,
  type TravelRecipientState,
} from "../db/schema";
import { currentKeyRing, openRecord, sealRecord, TravelCryptoError, type KeyRing } from "./crypto";
import { logCounter } from "./log";

/**
 * Data access of the personal travel details (F-054 + F-056, features.md R.9). Every function
 * takes the internal trip id of a membership the caller resolved with the SESSION user
 * (`findMembership`) and checks the rights of R.9 «Rechte» again here, in the same transaction
 * as the write or the decryption. Values are decrypted in exactly two places:
 *
 * 1. `readOwnRelease` – the person's own release for themself;
 * 2. `bookerAccess` – the asking «Bucht» person (masks for the page; «Anzeigen»/«Kopieren» with
 *    an access-log row).
 *
 * Both check membership, the marking, the state of the request, the deletion date and – for
 * document numbers – the 12-hour re-authentication before they decrypt. Writes that DELETE
 * releases lock the trip row exclusively; writes that CREATE releases lock it shared – so a
 * release can never land in a request that is being closed at the same moment.
 */

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];
type Executor = Tx | ReturnType<typeof db>;

export type TravelError =
  | "notAllowed"
  | "phase"
  | "closed"
  | "expired"
  | "notBooker"
  | "max"
  | "limit"
  | "invalid"
  | "consent"
  | "reauth"
  | "gone"
  | "confirm"
  | "unavailable";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: TravelError };

interface LockedTrip {
  id: string;
  phase: "collecting" | "voting" | "fixed";
  fixedEnd: IsoDate | null;
  unfixedAt: Date | null;
}

async function lockTrip(tx: Tx, tripId: string, mode: "update" | "share") {
  const [row] = await tx
    .select({ id: trip.id, phase: trip.phase, fixedEnd: trip.fixedEnd, unfixedAt: trip.unfixedAt })
    .from(trip)
    .where(eq(trip.id, tripId))
    .for(mode);
  return (row ?? null) as LockedTrip | null;
}

async function memberOf(executor: Executor, tripId: string, userId: string) {
  const [row] = await executor
    .select({
      role: tripMember.role,
      bookerSince: tripMember.bookerSince,
      displayName: tripMember.displayName,
    })
    .from(tripMember)
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
  return row ?? null;
}

/** Phase «fixed» and the deletion date not reached (R.9 I11-10: no values after it). */
function usable(locked: LockedTrip | null, today: IsoDate): locked is LockedTrip & { fixedEnd: IsoDate } {
  return (
    locked !== null &&
    locked.phase === "fixed" &&
    locked.fixedEnd !== null &&
    !travelDataExpired(locked.fixedEnd, today)
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Deleting releases (hard) – shared by every trigger of R.9 I11-10                              */
/* ------------------------------------------------------------------------------------------ */

/**
 * Closes requests and HARD deletes their releases (values + access log via cascade). Released
 * answers become «erloschen» (the hull remembers it for the notices and D3); open/declined
 * answers keep their state – the closed request no longer asks anything.
 */
async function closeRequests(
  tx: Tx,
  requestIds: string[],
  reason: TravelClosedReason,
  now = new Date(),
): Promise<number> {
  if (requestIds.length === 0) return 0;
  const recipients = await tx
    .select({ id: travelDataRecipient.id })
    .from(travelDataRecipient)
    .where(inArray(travelDataRecipient.requestId, requestIds));
  let purged = 0;
  if (recipients.length > 0) {
    const ids = recipients.map((r) => r.id);
    const deleted = await tx
      .delete(travelDataRelease)
      .where(inArray(travelDataRelease.recipientId, ids))
      .returning({ id: travelDataRelease.recipientId });
    purged = deleted.length;
    await tx
      .update(travelDataRecipient)
      .set({ state: "expired", updatedAt: now })
      .where(and(inArray(travelDataRecipient.id, ids), eq(travelDataRecipient.state, "released")));
  }
  await tx
    .update(travelDataRequest)
    .set({ closedAt: now, closedReason: reason })
    .where(and(inArray(travelDataRequest.id, requestIds), isNull(travelDataRequest.closedAt)));
  return purged;
}

async function openRequestIds(tx: Tx, where: ReturnType<typeof and>) {
  const rows = await tx
    .select({ id: travelDataRequest.id })
    .from(travelDataRequest)
    .where(and(isNull(travelDataRequest.closedAt), where));
  return rows.map((row) => row.id);
}

/**
 * The asking person leaves / is removed / deletes the account (R.9 I11-10): all their open
 * requests are closed («ehemaliges Mitglied»), all releases to them are deleted. `tripId` null
 * = in every trip (account deletion). Call inside the transaction that ends the membership.
 */
export async function closeRequestsOfRequester(
  tx: Tx,
  tripId: string | null,
  userId: string,
  reason: TravelClosedReason = "requester_left",
): Promise<number> {
  const ids = await openRequestIds(
    tx,
    and(
      eq(travelDataRequest.requesterId, userId),
      tripId ? eq(travelDataRequest.tripId, tripId) : undefined,
    ),
  );
  return closeRequests(tx, ids, reason);
}

/** Every open request of a trip (deletion date reached, 30 days unfixed). */
async function closeTripRequests(tx: Tx, tripId: string, reason: TravelClosedReason) {
  const ids = await openRequestIds(tx, eq(travelDataRequest.tripId, tripId));
  const purged = await closeRequests(tx, ids, reason);
  // Safety net: releases of already closed requests (must not exist) go too.
  const stray = await tx
    .select({ id: travelDataRelease.recipientId })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .where(eq(travelDataRecipient.tripId, tripId));
  if (stray.length > 0) {
    await tx.delete(travelDataRelease).where(
      inArray(
        travelDataRelease.recipientId,
        stray.map((row) => row.id),
      ),
    );
  }
  return purged + stray.length;
}

/* ------------------------------------------------------------------------------------------ */
/* Marking «Bucht» (F-056, R.9 I11-01)                                                          */
/* ------------------------------------------------------------------------------------------ */

export type BookerResult =
  | { ok: true; deleted: number }
  | { ok: false; error: "notAllowed" | "phase" | "max" | "invalid" }
  | { ok: false; error: "confirm"; requests: number; released: number };

/**
 * Gives/takes the marking (organiser only, phase «fixed», target = member with an account –
 * placeholders have no membership row and are never found). At most 3 per trip, counted under
 * the exclusive trip lock. Taking it away from a person with open requests needs `confirmed`
 * and deletes all releases to them at once.
 */
export async function setBooker(
  tripId: string,
  actorId: string,
  targetId: string,
  on: boolean,
  confirmed: boolean,
): Promise<BookerResult> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "update");
    if (locked?.phase !== "fixed") return { ok: false, error: "phase" } as const;
    const actor = await memberOf(tx, tripId, actorId);
    if (actor?.role !== "organizer") return { ok: false, error: "notAllowed" } as const;
    const target = await memberOf(tx, tripId, targetId);
    if (!target) return { ok: false, error: "invalid" } as const;
    const now = new Date();
    if (on) {
      if (target.bookerSince) return { ok: true, deleted: 0 } as const;
      const [bookers] = await tx
        .select({ n: count() })
        .from(tripMember)
        .where(and(eq(tripMember.tripId, tripId), isNotNull(tripMember.bookerSince)));
      if ((bookers?.n ?? 0) >= TRAVEL_LIMITS.bookersPerTrip) {
        return { ok: false, error: "max" } as const;
      }
      await tx
        .update(tripMember)
        .set({ bookerSince: now, bookerSetBy: actorId, bookerRevokedAt: null, bookerHintSeenAt: null })
        .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, targetId)));
      logCounter("travel_data.booker changed");
      return { ok: true, deleted: 0 } as const;
    }
    if (!target.bookerSince) return { ok: true, deleted: 0 } as const;
    const open = await openRequestIds(
      tx,
      and(eq(travelDataRequest.tripId, tripId), eq(travelDataRequest.requesterId, targetId)),
    );
    if (open.length > 0 && !confirmed) {
      const [released] = await tx
        .select({ n: count() })
        .from(travelDataRecipient)
        .where(
          and(
            inArray(travelDataRecipient.requestId, open),
            eq(travelDataRecipient.state, "released"),
          ),
        );
      return {
        ok: false,
        error: "confirm",
        requests: open.length,
        released: released?.n ?? 0,
      } as const;
    }
    const deleted = await closeRequests(tx, open, "booker_revoked", now);
    await tx
      .update(tripMember)
      .set({
        bookerSince: null,
        bookerRevokedAt: open.length > 0 ? now : null,
        bookerHintSeenAt: null,
      })
      .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, targetId)));
    logCounter("travel_data.booker changed");
    return { ok: true, deleted } as const;
  });
}

/** One-off notices in /travel-data were closed (W20 H.2, H.6, H.11). */
export async function markTravelHintSeen(
  tripId: string,
  userId: string,
  hint: "booker" | "dates",
): Promise<void> {
  await db()
    .update(tripMember)
    .set(hint === "booker" ? { bookerHintSeenAt: new Date() } : { travelDatesHintSeenAt: new Date() })
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
}

/**
 * Effects of «Termin festlegen» on the area (call inside `fixDates` under its lock): default
 * marking at the FIRST fixing only, the 30-day rule (late job), the moved deletion date.
 */
export async function onDatesFixed(
  tx: Tx,
  tripId: string,
  state: { bookerDefaultedAt: Date | null; unfixedAt: Date | null; rangeChanged: boolean },
  now = new Date(),
): Promise<void> {
  if (state.unfixedAt && unfixedTooLong(state.unfixedAt, now)) {
    await closeTripRequests(tx, tripId, "unfixed");
  }
  if (!state.bookerDefaultedAt) {
    await tx
      .update(tripMember)
      .set({ bookerSince: now, bookerSetBy: sql`${tripMember.userId}` })
      .where(
        and(
          eq(tripMember.tripId, tripId),
          eq(tripMember.role, "organizer"),
          isNull(tripMember.bookerSince),
        ),
      );
  }
  let datesChanged = false;
  if (state.rangeChanged) {
    const [open] = await tx
      .select({ n: count() })
      .from(travelDataRequest)
      .where(and(eq(travelDataRequest.tripId, tripId), isNull(travelDataRequest.closedAt)));
    datesChanged = (open?.n ?? 0) > 0;
  }
  await tx
    .update(trip)
    .set({
      unfixedAt: null,
      ...(state.bookerDefaultedAt ? {} : { bookerDefaultedAt: now }),
      ...(datesChanged ? { travelDatesChangedAt: now } : {}),
    })
    .where(eq(trip.id, tripId));
}

/* ------------------------------------------------------------------------------------------ */
/* Requests (R.9 I11-04, I11-09)                                                                 */
/* ------------------------------------------------------------------------------------------ */

export interface RecipientChoice {
  users: string[];
  placeholders: string[];
}

/** Recipients must be members (not the asker) or OPEN placeholders not marked «ohne App». */
async function checkRecipients(
  tx: Tx,
  tripId: string,
  requesterId: string,
  choice: RecipientChoice,
): Promise<boolean> {
  const users = [...new Set(choice.users)];
  const placeholders = [...new Set(choice.placeholders)];
  if (users.includes(requesterId)) return false;
  if (users.length > 0) {
    const rows = await tx
      .select({ id: tripMember.userId })
      .from(tripMember)
      .where(and(eq(tripMember.tripId, tripId), inArray(tripMember.userId, users)));
    if (rows.length !== users.length) return false;
  }
  if (placeholders.length > 0) {
    const rows = await tx
      .select({ id: tripPlaceholder.id })
      .from(tripPlaceholder)
      .where(
        and(
          eq(tripPlaceholder.tripId, tripId),
          inArray(tripPlaceholder.id, placeholders),
          isNull(tripPlaceholder.claimedAt),
          isNull(tripPlaceholder.withoutAppAt),
        ),
      );
    if (rows.length !== placeholders.length) return false;
  }
  return true;
}

export async function createRequest(
  tripId: string,
  userId: string,
  input: { purpose: string; fields: TravelField[]; recipients: RecipientChoice; idempotencyKey: string | null },
  today: IsoDate = todayIso(),
): Promise<Result<{ id: string; count: number }>> {
  const users = [...new Set(input.recipients.users)];
  const placeholders = [...new Set(input.recipients.placeholders)];
  const total = users.length + placeholders.length;
  if (total === 0 || total > TRAVEL_LIMITS.recipientsPerRequest) {
    return { ok: false, error: "invalid" };
  }
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "update");
    if (!locked || locked.phase !== "fixed" || !locked.fixedEnd) return { ok: false, error: "phase" } as const;
    if (today > locked.fixedEnd) return { ok: false, error: "phase" } as const;
    const me = await memberOf(tx, tripId, userId);
    if (!me?.bookerSince) return { ok: false, error: "notBooker" } as const;
    if (input.idempotencyKey) {
      const [existing] = await tx
        .select({ id: travelDataRequest.id, requesterId: travelDataRequest.requesterId })
        .from(travelDataRequest)
        .where(
          and(
            eq(travelDataRequest.tripId, tripId),
            eq(travelDataRequest.idempotencyKey, input.idempotencyKey),
          ),
        );
      if (existing) {
        if (existing.requesterId !== userId) return { ok: false, error: "invalid" } as const;
        const [n] = await tx
          .select({ n: count() })
          .from(travelDataRecipient)
          .where(eq(travelDataRecipient.requestId, existing.id));
        return { ok: true, id: existing.id, count: n?.n ?? 0 } as const;
      }
    }
    const [open] = await tx
      .select({ n: count() })
      .from(travelDataRequest)
      .where(
        and(
          eq(travelDataRequest.tripId, tripId),
          eq(travelDataRequest.requesterId, userId),
          isNull(travelDataRequest.closedAt),
        ),
      );
    if ((open?.n ?? 0) >= TRAVEL_LIMITS.openRequestsPerBooker) {
      return { ok: false, error: "limit" } as const;
    }
    if (!(await checkRecipients(tx, tripId, userId, { users, placeholders }))) {
      return { ok: false, error: "invalid" } as const;
    }
    const [row] = await tx
      .insert(travelDataRequest)
      .values({
        tripId,
        requesterId: userId,
        purpose: input.purpose,
        fields: input.fields,
        idempotencyKey: input.idempotencyKey,
      })
      .returning({ id: travelDataRequest.id });
    if (!row) return { ok: false, error: "invalid" } as const;
    await tx.insert(travelDataRecipient).values([
      ...users.map((id) => ({ requestId: row.id, tripId, userId: id })),
      ...placeholders.map((id) => ({ requestId: row.id, tripId, placeholderId: id })),
    ]);
    logCounter("travel_data.request ok");
    return { ok: true, id: row.id, count: total } as const;
  });
}

/** The viewer's OWN open request in this trip, with an active marking (R.9 rights rows 6/7). */
async function ownOpenRequest(tx: Tx, tripId: string, userId: string, requestId: string) {
  const me = await memberOf(tx, tripId, userId);
  if (!me?.bookerSince) return null;
  const [request] = await tx
    .select({ id: travelDataRequest.id, fields: travelDataRequest.fields })
    .from(travelDataRequest)
    .where(
      and(
        eq(travelDataRequest.id, requestId),
        eq(travelDataRequest.tripId, tripId),
        eq(travelDataRequest.requesterId, userId),
        isNull(travelDataRequest.closedAt),
      ),
    );
  return request ?? null;
}

/** «Personen hinzufügen …» – new people see the request at once (R.9 I11-09). */
export async function addRecipients(
  tripId: string,
  userId: string,
  requestId: string,
  choice: RecipientChoice,
): Promise<Result<{ count: number }>> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "update");
    if (!usable(locked, todayIso())) return { ok: false, error: "phase" } as const;
    const request = await ownOpenRequest(tx, tripId, userId, requestId);
    if (!request) return { ok: false, error: "notAllowed" } as const;
    const existing = await tx
      .select({ userId: travelDataRecipient.userId, placeholderId: travelDataRecipient.placeholderId })
      .from(travelDataRecipient)
      .where(eq(travelDataRecipient.requestId, requestId));
    const users = [...new Set(choice.users)].filter((id) => !existing.some((e) => e.userId === id));
    const placeholders = [...new Set(choice.placeholders)].filter(
      (id) => !existing.some((e) => e.placeholderId === id),
    );
    if (users.length + placeholders.length === 0) return { ok: false, error: "invalid" } as const;
    if (existing.length + users.length + placeholders.length > TRAVEL_LIMITS.recipientsPerRequest) {
      return { ok: false, error: "invalid" } as const;
    }
    if (!(await checkRecipients(tx, tripId, userId, { users, placeholders }))) {
      return { ok: false, error: "invalid" } as const;
    }
    await tx.insert(travelDataRecipient).values([
      ...users.map((id) => ({ requestId, tripId, userId: id })),
      ...placeholders.map((id) => ({ requestId, tripId, placeholderId: id })),
    ]);
    // New people → not everybody has answered any more (V4 row 3 again).
    await tx.update(travelDataRequest).set({ usedAt: null }).where(eq(travelDataRequest.id, requestId));
    return { ok: true, count: users.length + placeholders.length } as const;
  });
}

/** «Person entfernen …» – deletes their release at once (R.9 I11-10 row 2). */
export async function removeRecipient(
  tripId: string,
  userId: string,
  requestId: string,
  recipientId: string,
): Promise<Result> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "update");
    if (!locked || locked.phase !== "fixed") return { ok: false, error: "phase" } as const;
    const request = await ownOpenRequest(tx, tripId, userId, requestId);
    if (!request) return { ok: false, error: "notAllowed" } as const;
    const removed = await tx
      .delete(travelDataRecipient)
      .where(
        and(
          eq(travelDataRecipient.id, recipientId),
          eq(travelDataRecipient.requestId, requestId),
          eq(travelDataRecipient.tripId, tripId),
        ),
      )
      .returning({ id: travelDataRecipient.id });
    if (removed.length === 0) return { ok: false, error: "gone" } as const;
    const [left] = await tx
      .select({ n: count() })
      .from(travelDataRecipient)
      .where(eq(travelDataRecipient.requestId, requestId));
    // A request without anybody asked is pointless – close it.
    if ((left?.n ?? 0) === 0) await closeRequests(tx, [requestId], "done");
    return { ok: true } as const;
  });
}

/** «Erledigt – Daten löschen» (R.9 I11-09): all releases of the request are deleted at once. */
export async function closeOwnRequest(
  tripId: string,
  userId: string,
  requestId: string,
): Promise<Result<{ deleted: number }>> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "update");
    if (!locked) return { ok: false, error: "notAllowed" } as const;
    const request = await ownOpenRequest(tx, tripId, userId, requestId);
    if (!request) return { ok: false, error: "notAllowed" } as const;
    const deleted = await closeRequests(tx, [requestId], "done");
    logCounter("travel_data.close ok");
    return { ok: true, deleted } as const;
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Answers (R.9 I11-05 – I11-07)                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** My answer row of an OPEN request of this trip whose asker still has the marking. */
async function myAnswer(tx: Tx, tripId: string, userId: string, requestId: string) {
  const [row] = await tx
    .select({
      recipientId: travelDataRecipient.id,
      state: travelDataRecipient.state,
      fields: travelDataRequest.fields,
      requesterId: travelDataRequest.requesterId,
      closedAt: travelDataRequest.closedAt,
      requesterBooker: tripMember.bookerSince,
    })
    .from(travelDataRecipient)
    .innerJoin(
      travelDataRequest,
      and(
        eq(travelDataRequest.id, travelDataRecipient.requestId),
        eq(travelDataRequest.tripId, travelDataRecipient.tripId),
      ),
    )
    .leftJoin(
      tripMember,
      and(
        eq(tripMember.tripId, travelDataRequest.tripId),
        eq(tripMember.userId, travelDataRequest.requesterId),
      ),
    )
    .where(
      and(
        eq(travelDataRecipient.tripId, tripId),
        eq(travelDataRecipient.requestId, requestId),
        eq(travelDataRecipient.userId, userId),
      ),
    )
    .for("update", { of: travelDataRecipient });
  return row ?? null;
}

export type ReleaseResult =
  | { ok: true }
  | { ok: false; error: TravelError }
  | { ok: false; error: "values"; errors: ValueErrors };

/**
 * «An Lena freigeben» (R.9 I11-06): stores ONLY with the consent box ticked (checked here, not
 * only in the browser), validates against the fields of the request in the database (a tampered
 * client cannot add fields), encrypts with a new nonce and stores consent time, version and
 * language. Changing = the same with a new consent.
 */
export async function releaseAnswer(
  tripId: string,
  userId: string,
  requestId: string,
  input: TravelInput,
  consent: { given: boolean; locale: "de" | "en" },
  options: { demo: boolean; today?: IsoDate; ring?: KeyRing | null },
): Promise<ReleaseResult> {
  const ring = options.ring === undefined ? currentKeyRing() : options.ring;
  if (!ring) return { ok: false, error: "unavailable" };
  const today = options.today ?? todayIso();
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "share");
    if (!usable(locked, today)) return { ok: false, error: "phase" } as const;
    const answer = await myAnswer(tx, tripId, userId, requestId);
    if (!answer) return { ok: false, error: "notAllowed" } as const;
    if (answer.closedAt || !answer.requesterBooker || !answer.requesterId) {
      return { ok: false, error: "closed" } as const;
    }
    if (answer.state === "expired") return { ok: false, error: "closed" } as const;
    const checked = validateTravelValues(input, answer.fields as TravelField[], {
      today,
      demo: options.demo,
    });
    if (!checked.ok) return { ok: false, error: "values", errors: checked.errors } as const;
    if (!consent.given) return { ok: false, error: "consent" } as const;
    const sealed = sealRecord(ring, checked.values, {
      tripId,
      requestId,
      userId,
      schemaVersion: TRAVEL_SCHEMA_VERSION,
    });
    const now = new Date();
    await tx
      .insert(travelDataRelease)
      .values({
        recipientId: answer.recipientId,
        ciphertext: sealed.ciphertext,
        nonce: sealed.nonce,
        keyId: sealed.keyId,
        schemaVersion: TRAVEL_SCHEMA_VERSION,
        consentAt: now,
        consentVersion: CONSENT_VERSION,
        consentLocale: consent.locale,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: travelDataRelease.recipientId,
        set: {
          ciphertext: sealed.ciphertext,
          nonce: sealed.nonce,
          keyId: sealed.keyId,
          schemaVersion: TRAVEL_SCHEMA_VERSION,
          consentAt: now,
          consentVersion: CONSENT_VERSION,
          consentLocale: consent.locale,
          updatedAt: now,
        },
      });
    await tx
      .update(travelDataRecipient)
      .set({ state: "released", respondedAt: now, updatedAt: now, dismissedAt: null })
      .where(eq(travelDataRecipient.id, answer.recipientId));
    logCounter("travel_data.release ok");
    return { ok: true } as const;
  });
}

/**
 * «Ich kläre das direkt mit …» (decline, R.9 I11-06) and its undo («Rückgängig» → open). Only
 * from «open» / «declined»; nothing else is stored – no reason, no input.
 */
export async function setDeclined(
  tripId: string,
  userId: string,
  requestId: string,
  declined: boolean,
  today: IsoDate = todayIso(),
): Promise<Result> {
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "share");
    if (!usable(locked, today)) return { ok: false, error: "phase" } as const;
    const answer = await myAnswer(tx, tripId, userId, requestId);
    if (!answer) return { ok: false, error: "notAllowed" } as const;
    if (answer.closedAt || !answer.requesterBooker) return { ok: false, error: "closed" } as const;
    const from: TravelRecipientState = declined ? "open" : "declined";
    if (answer.state !== from) return { ok: false, error: "gone" } as const;
    const now = new Date();
    await tx
      .update(travelDataRecipient)
      .set({ state: declined ? "declined" : "open", respondedAt: declined ? now : null, updatedAt: now })
      .where(eq(travelDataRecipient.id, answer.recipientId));
    if (declined) logCounter("travel_data.decline ok");
    return { ok: true } as const;
  });
}

/**
 * «Freigabe zurückziehen» (R.9 I11-07): values AND access log are hard deleted at once, the
 * answer is open again. Works in every phase (also while the dates are reopened – withdrawal
 * from the account page, CEO 2026-10-23) and needs no key.
 */
export async function withdrawRelease(
  tripId: string,
  userId: string,
  requestId: string,
): Promise<Result> {
  return db().transaction(async (tx) => {
    await lockTrip(tx, tripId, "share");
    const answer = await myAnswer(tx, tripId, userId, requestId);
    if (!answer) return { ok: false, error: "notAllowed" } as const;
    const deleted = await tx
      .delete(travelDataRelease)
      .where(eq(travelDataRelease.recipientId, answer.recipientId))
      .returning({ id: travelDataRelease.recipientId });
    if (deleted.length === 0) return { ok: false, error: "gone" } as const;
    await tx
      .update(travelDataRecipient)
      .set({
        state: answer.closedAt ? "expired" : "open",
        respondedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(travelDataRecipient.id, answer.recipientId));
    logCounter("travel_data.withdraw ok");
    return { ok: true } as const;
  });
}

/** «Ausblenden» of an «erloschen» card (W20 H.6). */
export async function dismissExpired(tripId: string, userId: string, requestId: string) {
  await db()
    .update(travelDataRecipient)
    .set({ dismissedAt: new Date() })
    .where(
      and(
        eq(travelDataRecipient.tripId, tripId),
        eq(travelDataRecipient.requestId, requestId),
        eq(travelDataRecipient.userId, userId),
        eq(travelDataRecipient.state, "expired"),
      ),
    );
}

/* ------------------------------------------------------------------------------------------ */
/* Decryption 1: own release for the person themself                                            */
/* ------------------------------------------------------------------------------------------ */

/**
 * The person's own values (W20 H.6 D, «Ändern», «übernehmen», data export). Only for the row of
 * THIS user in THIS trip, only while the release exists and the deletion date has not passed.
 */
export async function readOwnRelease(
  tripId: string,
  userId: string,
  requestId: string,
  options: { today?: IsoDate; ring?: KeyRing | null } = {},
): Promise<TravelValues | null> {
  const ring = options.ring === undefined ? currentKeyRing() : options.ring;
  if (!ring) return null;
  const today = options.today ?? todayIso();
  const [row] = await db()
    .select({
      fixedEnd: trip.fixedEnd,
      phase: trip.phase,
      fields: travelDataRequest.fields,
      ciphertext: travelDataRelease.ciphertext,
      nonce: travelDataRelease.nonce,
      keyId: travelDataRelease.keyId,
      schemaVersion: travelDataRelease.schemaVersion,
    })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .innerJoin(
      travelDataRequest,
      and(
        eq(travelDataRequest.id, travelDataRecipient.requestId),
        eq(travelDataRequest.tripId, travelDataRecipient.tripId),
      ),
    )
    .innerJoin(trip, eq(trip.id, travelDataRecipient.tripId))
    .innerJoin(
      tripMember,
      and(eq(tripMember.tripId, trip.id), eq(tripMember.userId, travelDataRecipient.userId)),
    )
    .where(
      and(
        eq(travelDataRecipient.tripId, tripId),
        eq(travelDataRecipient.requestId, requestId),
        eq(travelDataRecipient.userId, userId),
        eq(travelDataRecipient.state, "released"),
        isNull(travelDataRequest.closedAt),
      ),
    );
  if (!row) return null;
  if (row.phase === "fixed" && travelDataExpired(row.fixedEnd, today)) return null;
  try {
    const record = openRecord(
      ring,
      { ciphertext: row.ciphertext, nonce: row.nonce, keyId: row.keyId },
      { tripId, requestId, userId, schemaVersion: row.schemaVersion },
    );
    return parseStoredValues(record, row.fields as TravelField[]);
  } catch (error) {
    if (error instanceof TravelCryptoError) return null;
    throw error;
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Decryption 2: the asking «Bucht» person (masks, «Anzeigen», «Kopieren»)                      */
/* ------------------------------------------------------------------------------------------ */

async function reauthValid(tx: Tx, sessionId: string): Promise<boolean> {
  const [row] = await tx
    .select({ id: verification.id })
    .from(verification)
    .where(
      and(
        eq(verification.identifier, travelReauthIdentifier(sessionId)),
        gt(verification.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row !== undefined;
}

export type MaskedValues = Partial<Record<CopyField, string>>;

export type BookerAccess =
  | { mode: "mask"; requestId: string }
  | { mode: "view"; requestId: string; recipientId: string }
  | { mode: "copy"; requestId: string; recipientId: string; field: CopyField };

export type BookerAccessResult =
  | { ok: true; mode: "mask"; masks: Record<string, MaskedValues> }
  | { ok: true; mode: "view"; values: Partial<Record<CopyField, string>> }
  | { ok: true; mode: "copy"; value: string }
  | { ok: false; error: TravelError };

/**
 * The only way for «Bucht» to get values (R.9 Verschlüsselung Nr. 6): in ONE transaction the
 * trip (phase «fixed», deletion date not reached), the viewer's membership + ACTIVE marking, the
 * request (the viewer's OWN, open), the answer («freigegeben», a member of this trip) and – for
 * requests with a document number – the 12-hour re-authentication of THIS session are checked;
 * only then the values are decrypted. «view»/«copy» write the access log row (who, when, field –
 * never the value); «mask» returns server-side masks only (no log: no content is disclosed).
 * Organisers without the marking, other «Bucht» people and members never pass.
 */
export async function bookerAccess(
  tripId: string,
  userId: string,
  sessionId: string,
  access: BookerAccess,
  options: { today?: IsoDate; ring?: KeyRing | null; now?: Date } = {},
): Promise<BookerAccessResult> {
  const ring = options.ring === undefined ? currentKeyRing() : options.ring;
  if (!ring) return { ok: false, error: "unavailable" };
  const today = options.today ?? todayIso();
  const now = options.now ?? new Date();
  return db().transaction(async (tx) => {
    const locked = await lockTrip(tx, tripId, "share");
    if (!usable(locked, today)) return { ok: false, error: "expired" } as const;
    const me = await memberOf(tx, tripId, userId);
    if (!me?.bookerSince) return { ok: false, error: "notBooker" } as const;
    const [request] = await tx
      .select({ id: travelDataRequest.id, fields: travelDataRequest.fields })
      .from(travelDataRequest)
      .where(
        and(
          eq(travelDataRequest.id, access.requestId),
          eq(travelDataRequest.tripId, tripId),
          eq(travelDataRequest.requesterId, userId),
          isNull(travelDataRequest.closedAt),
        ),
      );
    if (!request) return { ok: false, error: "notAllowed" } as const;
    const fields = request.fields as TravelField[];
    if (access.mode !== "mask" && fields.includes("document") && !(await reauthValid(tx, sessionId))) {
      logCounter("travel_data.reauth required");
      return { ok: false, error: "reauth" } as const;
    }
    if (access.mode === "copy" && !copyFieldsOf(fields).includes(access.field)) {
      return { ok: false, error: "invalid" } as const;
    }
    const rows = await tx
      .select({
        recipientId: travelDataRecipient.id,
        userId: travelDataRecipient.userId,
        ciphertext: travelDataRelease.ciphertext,
        nonce: travelDataRelease.nonce,
        keyId: travelDataRelease.keyId,
        schemaVersion: travelDataRelease.schemaVersion,
      })
      .from(travelDataRelease)
      .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
      .innerJoin(
        tripMember,
        and(
          eq(tripMember.tripId, travelDataRecipient.tripId),
          eq(tripMember.userId, travelDataRecipient.userId),
        ),
      )
      .where(
        and(
          eq(travelDataRecipient.tripId, tripId),
          eq(travelDataRecipient.requestId, request.id),
          eq(travelDataRecipient.state, "released"),
          access.mode === "mask" ? undefined : eq(travelDataRecipient.id, access.recipientId),
        ),
      );
    const open = (row: (typeof rows)[number]): TravelValues | null => {
      if (!row.userId) return null;
      const record = openRecord(
        ring,
        { ciphertext: row.ciphertext, nonce: row.nonce, keyId: row.keyId },
        { tripId, requestId: request.id, userId: row.userId, schemaVersion: row.schemaVersion },
      );
      return parseStoredValues(record, fields);
    };
    try {
      if (access.mode === "mask") {
        const masks: Record<string, MaskedValues> = {};
        for (const row of rows) {
          const values = open(row);
          if (!values) continue;
          const mask: MaskedValues = {};
          for (const field of copyFieldsOf(fields)) {
            const value = valueOf(values, field);
            if (value !== undefined) mask[field] = maskValue(field, value);
          }
          masks[row.recipientId] = mask;
        }
        return { ok: true, mode: "mask", masks } as const;
      }
      const row = rows[0];
      const values = row ? open(row) : null;
      if (!row || !values) {
        logCounter(access.mode === "view" ? "travel_data.reveal denied" : "travel_data.copy denied");
        return { ok: false, error: "gone" } as const;
      }
      await tx.insert(travelDataAccess).values({
        recipientId: row.recipientId,
        actorId: userId,
        action: access.mode,
        field: access.mode === "copy" ? access.field : null,
        at: now,
      });
      await trimAccessLog(tx, row.recipientId);
      // V4 row 2 «… Du kannst buchen» is done once «Bucht» used the answers (W16 v2.16).
      await tx.execute(sql`update ${travelDataRequest} set used_at = ${now.toISOString()}::timestamptz
        where ${travelDataRequest.id} = ${request.id}
          and not exists (select 1 from ${travelDataRecipient} where ${travelDataRecipient.requestId} = ${request.id}
            and ${travelDataRecipient.userId} is not null and ${travelDataRecipient.state} = 'open')`);
      if (access.mode === "view") {
        logCounter("travel_data.reveal ok");
        const out: Partial<Record<CopyField, string>> = {};
        for (const field of copyFieldsOf(fields)) {
          const value = valueOf(values, field);
          if (value !== undefined) out[field] = value;
        }
        return { ok: true, mode: "view", values: out } as const;
      }
      const value = valueOf(values, access.field);
      if (value === undefined) return { ok: false, error: "gone" } as const;
      logCounter("travel_data.copy ok");
      return { ok: true, mode: "copy", value } as const;
    } catch (error) {
      if (error instanceof TravelCryptoError) return { ok: false, error: "unavailable" } as const;
      throw error;
    }
  });
}

/** At most 1 000 log rows per release – the oldest go (R.9 technische Obergrenzen). */
async function trimAccessLog(tx: Tx, recipientId: string): Promise<void> {
  await tx.execute(sql`delete from ${travelDataAccess} where ${travelDataAccess.recipientId} = ${recipientId}
    and ${travelDataAccess.id} not in (select ${travelDataAccess.id} from ${travelDataAccess}
      where ${travelDataAccess.recipientId} = ${recipientId}
      order by ${travelDataAccess.at} desc, ${travelDataAccess.id} desc limit ${TRAVEL_LIMITS.accessLogPerRelease})`);
}

/* ------------------------------------------------------------------------------------------ */
/* Raw data for pages and the cockpit (no values, no ciphertext)                                */
/* ------------------------------------------------------------------------------------------ */

export interface RawRequest {
  id: string;
  requesterId: string | null;
  purpose: string;
  fields: TravelField[];
  createdAt: Date;
  closedAt: Date | null;
  closedReason: TravelClosedReason | null;
  usedAt: Date | null;
}

export interface RawRecipient {
  id: string;
  requestId: string;
  userId: string | null;
  placeholderId: string | null;
  state: TravelRecipientState;
  respondedAt: Date | null;
  dismissedAt: Date | null;
  /** Release meta – only the times, never values. */
  release: { createdAt: Date; updatedAt: Date; consentAt: Date } | null;
}

export interface RawAccess {
  recipientId: string;
  actorId: string | null;
  action: "view" | "copy";
  field: CopyField | null;
  at: Date;
}

export interface TravelRaw {
  requests: RawRequest[];
  recipients: RawRecipient[];
  /** Access log of the VIEWER's own releases only. */
  myAccess: RawAccess[];
}

/** Everything about requests of one trip without values – the caller filters by rights. */
export async function loadTravelRaw(tripId: string, viewerId: string): Promise<TravelRaw> {
  const [requests, recipients] = await Promise.all([
    db()
      .select({
        id: travelDataRequest.id,
        requesterId: travelDataRequest.requesterId,
        purpose: travelDataRequest.purpose,
        fields: travelDataRequest.fields,
        createdAt: travelDataRequest.createdAt,
        closedAt: travelDataRequest.closedAt,
        closedReason: travelDataRequest.closedReason,
        usedAt: travelDataRequest.usedAt,
      })
      .from(travelDataRequest)
      .where(eq(travelDataRequest.tripId, tripId))
      .orderBy(asc(travelDataRequest.createdAt), asc(travelDataRequest.id)),
    db()
      .select({
        id: travelDataRecipient.id,
        requestId: travelDataRecipient.requestId,
        userId: travelDataRecipient.userId,
        placeholderId: travelDataRecipient.placeholderId,
        state: travelDataRecipient.state,
        respondedAt: travelDataRecipient.respondedAt,
        dismissedAt: travelDataRecipient.dismissedAt,
        releaseCreatedAt: travelDataRelease.createdAt,
        releaseUpdatedAt: travelDataRelease.updatedAt,
        consentAt: travelDataRelease.consentAt,
      })
      .from(travelDataRecipient)
      .leftJoin(travelDataRelease, eq(travelDataRelease.recipientId, travelDataRecipient.id))
      .where(eq(travelDataRecipient.tripId, tripId)),
  ]);
  const mine = recipients.filter((r) => r.userId === viewerId && r.releaseCreatedAt).map((r) => r.id);
  const myAccess =
    mine.length > 0
      ? await db()
          .select({
            recipientId: travelDataAccess.recipientId,
            actorId: travelDataAccess.actorId,
            action: travelDataAccess.action,
            field: travelDataAccess.field,
            at: travelDataAccess.at,
          })
          .from(travelDataAccess)
          .where(inArray(travelDataAccess.recipientId, mine))
          .orderBy(sql`${travelDataAccess.at} desc`)
      : [];
  return {
    requests: requests.map((r) => ({ ...r, fields: r.fields as TravelField[] })),
    recipients: recipients.map((r) => ({
      id: r.id,
      requestId: r.requestId,
      userId: r.userId,
      placeholderId: r.placeholderId,
      state: r.state,
      respondedAt: r.respondedAt,
      dismissedAt: r.dismissedAt,
      release:
        r.releaseCreatedAt && r.releaseUpdatedAt && r.consentAt
          ? { createdAt: r.releaseCreatedAt, updatedAt: r.releaseUpdatedAt, consentAt: r.consentAt }
          : null,
    })),
    myAccess,
  };
}

/**
 * Own releases in trips that are NOT in phase «fixed» (dates reopened): the account page offers
 * «Freigabe zurückziehen …» there (CEO 2026-10-23, W20 H.17).
 */
export async function releasesOutsideFixed(userId: string) {
  return db()
    .select({
      publicId: trip.publicId,
      tripName: trip.name,
      requestId: travelDataRequest.id,
      purpose: travelDataRequest.purpose,
      requesterName: sql<string | null>`(select ${tripMember.displayName} from ${tripMember}
        where ${tripMember.tripId} = ${trip.id} and ${tripMember.userId} = ${travelDataRequest.requesterId})`,
    })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .innerJoin(travelDataRequest, eq(travelDataRequest.id, travelDataRecipient.requestId))
    .innerJoin(trip, eq(trip.id, travelDataRecipient.tripId))
    .where(and(eq(travelDataRecipient.userId, userId), ne(trip.phase, "fixed")))
    .orderBy(asc(trip.name), asc(travelDataRequest.createdAt));
}

/** Counts for the warnings in «Reise verlassen» / «Mitglied entfernen» / «Konto löschen». */
export async function travelFootprint(userId: string, tripId?: string) {
  const [released] = await db()
    .select({ n: count() })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .where(
      and(
        eq(travelDataRecipient.userId, userId),
        tripId ? eq(travelDataRecipient.tripId, tripId) : undefined,
      ),
    );
  const [requests] = await db()
    .select({ n: count() })
    .from(travelDataRequest)
    .where(
      and(
        eq(travelDataRequest.requesterId, userId),
        isNull(travelDataRequest.closedAt),
        tripId ? eq(travelDataRequest.tripId, tripId) : undefined,
      ),
    );
  return { released: released?.n ?? 0, requests: requests?.n ?? 0 };
}

/** Per member of a trip – for the organiser's «Mitglied entfernen» dialog. */
export async function travelFootprintByMember(tripId: string) {
  const released = await db()
    .select({ userId: travelDataRecipient.userId, n: count() })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .where(eq(travelDataRecipient.tripId, tripId))
    .groupBy(travelDataRecipient.userId);
  const requests = await db()
    .select({ userId: travelDataRequest.requesterId, n: count() })
    .from(travelDataRequest)
    .where(and(eq(travelDataRequest.tripId, tripId), isNull(travelDataRequest.closedAt)))
    .groupBy(travelDataRequest.requesterId);
  const out: Record<string, { released: number; requests: number }> = {};
  for (const row of released) {
    if (row.userId) out[row.userId] = { released: row.n, requests: 0 };
  }
  for (const row of requests) {
    if (!row.userId) continue;
    out[row.userId] = { released: out[row.userId]?.released ?? 0, requests: row.n };
  }
  return out;
}

/* ------------------------------------------------------------------------------------------ */
/* Placeholder claimed (F-007, R.9 I11-09)                                                      */
/* ------------------------------------------------------------------------------------------ */

/** Whoever claims a placeholder takes over its open requests (call after inserting the member). */
export async function claimPlaceholderRequests(
  tx: Tx,
  placeholderId: string,
  userId: string,
): Promise<void> {
  await tx
    .update(travelDataRecipient)
    .set({ userId, placeholderId: null, updatedAt: new Date() })
    .where(eq(travelDataRecipient.placeholderId, placeholderId));
}

/* ------------------------------------------------------------------------------------------ */
/* Retention job (R.9 I11-10 – deletion date, 30-day rule, safety net)                           */
/* ------------------------------------------------------------------------------------------ */

export async function purgeTravelData(now = new Date()): Promise<number> {
  const today = todayIso(now);
  let purged = 0;
  // Candidates only: trips with open requests or stored releases.
  const candidates = await db()
    .selectDistinct({ id: trip.id, phase: trip.phase, fixedEnd: trip.fixedEnd, unfixedAt: trip.unfixedAt })
    .from(trip)
    .innerJoin(travelDataRequest, eq(travelDataRequest.tripId, trip.id))
    .leftJoin(travelDataRecipient, eq(travelDataRecipient.requestId, travelDataRequest.id))
    .leftJoin(travelDataRelease, eq(travelDataRelease.recipientId, travelDataRecipient.id))
    .where(or(isNull(travelDataRequest.closedAt), isNotNull(travelDataRelease.recipientId)));
  for (const candidate of candidates) {
    const due =
      candidate.phase === "fixed"
        ? travelDataExpired(candidate.fixedEnd, today)
          ? ("expired" as const)
          : null
        : unfixedTooLong(candidate.unfixedAt, now)
          ? ("unfixed" as const)
          : null;
    if (!due) continue;
    purged += await db().transaction(async (tx) => {
      const locked = await lockTrip(tx, candidate.id, "update");
      if (!locked) return 0;
      // Re-check under the lock (dates may have changed since the read above).
      const still =
        locked.phase === "fixed"
          ? travelDataExpired(locked.fixedEnd, today)
          : unfixedTooLong(locked.unfixedAt, now);
      return still ? closeTripRequests(tx, candidate.id, due) : 0;
    });
  }
  // Safety net: open requests whose asker is no longer a member with the marking …
  const orphans = await db()
    .select({ id: travelDataRequest.id, tripId: travelDataRequest.tripId, member: tripMember.userId })
    .from(travelDataRequest)
    .leftJoin(
      tripMember,
      and(
        eq(tripMember.tripId, travelDataRequest.tripId),
        eq(tripMember.userId, travelDataRequest.requesterId),
        isNotNull(tripMember.bookerSince),
      ),
    )
    .where(and(isNull(travelDataRequest.closedAt), isNull(tripMember.userId)));
  for (const orphan of orphans) {
    purged += await db().transaction(async (tx) => {
      await lockTrip(tx, orphan.tripId, "update");
      return closeRequests(tx, [orphan.id], "booker_revoked");
    });
  }
  // … and releases that must not exist (closed request, answer not «freigegeben»).
  const stray = await db()
    .select({ id: travelDataRelease.recipientId })
    .from(travelDataRelease)
    .innerJoin(travelDataRecipient, eq(travelDataRecipient.id, travelDataRelease.recipientId))
    .innerJoin(travelDataRequest, eq(travelDataRequest.id, travelDataRecipient.requestId))
    .where(or(isNotNull(travelDataRequest.closedAt), ne(travelDataRecipient.state, "released")));
  if (stray.length > 0) {
    const deleted = await db()
      .delete(travelDataRelease)
      .where(
        inArray(
          travelDataRelease.recipientId,
          stray.map((row) => row.id),
        ),
      )
      .returning({ id: travelDataRelease.recipientId });
    purged += deleted.length;
  }
  return purged;
}

/** Release rows per key id (rotation script) – counts only. */
export async function releaseCountsByKey(): Promise<{ keyId: string; n: number }[]> {
  return db()
    .select({ keyId: travelDataRelease.keyId, n: count() })
    .from(travelDataRelease)
    .groupBy(travelDataRelease.keyId);
}


export { travelReauthIdentifier };
