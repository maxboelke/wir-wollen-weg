import "server-only";
import { and, asc, count, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { cleanDisplayName, firstName, isNameTaken, suggestName } from "@/lib/display-name";
import type { TripValues } from "@/lib/trip-input";
import {
  generateInviteToken,
  generatePublicId,
  isInviteTokenShape,
  isPublicIdShape,
} from "@/lib/tokens";
import { db } from "./db/client";
import { MAX_TRIP_MEMBERS, trip, tripMember, tripPlaceholder, type MemberRole } from "./db/schema";

/**
 * Trip data access (F-001 ff.). Every read or write by trip id goes through a membership
 * check here – there is no query that loads a trip by id alone (no IDOR, sitemap §4).
 * Authorisation by role happens in the Server Actions (src/features/trips/actions.ts).
 */

export type TripRow = typeof trip.$inferSelect;
export type MemberRow = typeof tripMember.$inferSelect;

export interface Membership {
  trip: TripRow;
  member: MemberRow;
}

/** Trip + own membership, or null when the trip does not exist OR the user is no member. */
export async function findMembership(publicId: string, userId: string): Promise<Membership | null> {
  if (!isPublicIdShape(publicId)) return null;
  const [row] = await db()
    .select({ trip, member: tripMember })
    .from(trip)
    .innerJoin(tripMember, and(eq(tripMember.tripId, trip.id), eq(tripMember.userId, userId)))
    .where(eq(trip.publicId, publicId))
    .limit(1);
  return row ?? null;
}

export interface MemberView {
  userId: string;
  displayName: string;
  role: MemberRole;
  joinedAt: Date;
  submittedAt: Date | null;
  votedAt: Date | null;
  /** Last change of days/comment (F-007 «abgegeben · zuletzt geändert …»). */
  availabilityUpdatedAt: Date | null;
  comment: string | null;
}

/** Members of a trip in joining order – only call after `findMembership` succeeded. */
export async function listMembers(tripId: string): Promise<MemberView[]> {
  return db()
    .select({
      userId: tripMember.userId,
      displayName: tripMember.displayName,
      role: tripMember.role,
      joinedAt: tripMember.joinedAt,
      submittedAt: tripMember.submittedAt,
      votedAt: tripMember.votedAt,
      availabilityUpdatedAt: tripMember.availabilityUpdatedAt,
      comment: tripMember.comment,
    })
    .from(tripMember)
    .where(eq(tripMember.tripId, tripId))
    .orderBy(asc(tripMember.joinedAt), asc(tripMember.displayName));
}

export interface PlaceholderView {
  id: string;
  displayName: string;
  createdAt: Date;
  /** Personal invite token – only ever handed to the organiser's views (F-007). */
  inviteToken: string;
}

/** Open (not yet claimed) placeholders of a trip – only call after `findMembership`. */
export async function listPlaceholders(tripId: string): Promise<PlaceholderView[]> {
  return db()
    .select({
      id: tripPlaceholder.id,
      displayName: tripPlaceholder.displayName,
      createdAt: tripPlaceholder.createdAt,
      inviteToken: tripPlaceholder.inviteToken,
    })
    .from(tripPlaceholder)
    .where(and(eq(tripPlaceholder.tripId, tripId), isNull(tripPlaceholder.claimedAt)))
    .orderBy(asc(tripPlaceholder.createdAt), asc(tripPlaceholder.displayName));
}

export interface TripListItem {
  trip: TripRow;
  me: MemberRow;
  memberCount: number;
  submittedCount: number;
  votedCount: number;
}

/** «Meine Reisen» (F-044): every trip the user is a member of, with progress counters. */
export async function listTripsForUser(userId: string): Promise<TripListItem[]> {
  const mine = await db()
    .select({ trip, me: tripMember })
    .from(tripMember)
    .innerJoin(trip, eq(trip.id, tripMember.tripId))
    .where(eq(tripMember.userId, userId));
  if (mine.length === 0) return [];
  const counts = await db()
    .select({
      tripId: tripMember.tripId,
      members: count(),
      submitted: count(tripMember.submittedAt),
      voted: count(tripMember.votedAt),
    })
    .from(tripMember)
    .where(
      inArray(
        tripMember.tripId,
        mine.map((row) => row.trip.id),
      ),
    )
    .groupBy(tripMember.tripId);
  const byTrip = new Map(counts.map((row) => [row.tripId, row]));
  return mine.map((row) => {
    const c = byTrip.get(row.trip.id);
    return {
      trip: row.trip,
      me: row.me,
      memberCount: c?.members ?? 1,
      submittedCount: c?.submitted ?? 0,
      votedCount: c?.voted ?? 0,
    };
  });
}

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

/** PostgreSQL unique violation (23505), optionally of one constraint/index – also when wrapped. */
function isUniqueViolation(error: unknown, constraint?: string): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    const pgError = current as Error & { code?: unknown; constraint?: unknown };
    if (pgError.code === "23505") return !constraint || pgError.constraint === constraint;
  }
  return false;
}

/** Unique index on (trip_id, lower(display_name)) – migration 0003 (R-039). */
const NAME_INDEX = "trip_member_trip_name_idx";

async function insertWithUniqueIds(tx: Tx, values: TripValues & { locale: string }) {
  // The public id has 50 bit – a collision is practically impossible, retry anyway. Each
  // attempt runs in a savepoint, so a collision does not abort the surrounding transaction.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const row = await tx.transaction(async (sp) => {
        const [inserted] = await sp
          .insert(trip)
          .values({ ...values, publicId: generatePublicId(), inviteToken: generateInviteToken() })
          .returning();
        return inserted;
      });
      if (row) return row;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("trip: could not allocate a unique id");
}

/**
 * F-001: creates the trip; the creator is its organiser and first member. One transaction –
 * a trip never exists without its organiser (R-039).
 */
export async function createTrip(
  values: TripValues,
  creator: { userId: string; displayName: string; locale: string },
): Promise<TripRow> {
  return db().transaction(async (tx) => {
    const row = await insertWithUniqueIds(tx, { ...values, locale: creator.locale });
    await tx.insert(tripMember).values({
      tripId: row.id,
      userId: creator.userId,
      displayName: cleanDisplayName(creator.displayName),
      role: "organizer",
    });
    return row;
  });
}

/** F-001: edit trip data (organiser only – checked by the caller). */
export async function updateTrip(tripId: string, values: TripValues): Promise<void> {
  await db().update(trip).set(values).where(eq(trip.id, tripId));
}

/**
 * New invite link (F-002/F-004). The personal placeholder links are renewed too – the dialog
 * promises «Der bisherige Link funktioniert dann nicht mehr – auch für Platzhalter» (W06).
 */
export async function regenerateInviteToken(tripId: string): Promise<string> {
  const token = generateInviteToken();
  await db().transaction(async (tx) => {
    await tx.update(trip).set({ inviteToken: token }).where(eq(trip.id, tripId));
    const placeholders = await tx
      .select({ id: tripPlaceholder.id })
      .from(tripPlaceholder)
      .where(eq(tripPlaceholder.tripId, tripId));
    for (const placeholder of placeholders) {
      await tx
        .update(tripPlaceholder)
        .set({ inviteToken: generateInviteToken() })
        .where(eq(tripPlaceholder.id, placeholder.id));
    }
  });
  return token;
}

export async function setJoinOpen(tripId: string, open: boolean): Promise<void> {
  await db().update(trip).set({ joinOpen: open }).where(eq(trip.id, tripId));
}

export async function deleteTrip(tripId: string): Promise<void> {
  // Memberships (and later availability/votes) cascade.
  await db().delete(trip).where(eq(trip.id, tripId));
}

/** Leaves a trip (F-013) – never for the organiser (caller checks). */
export async function removeMember(tripId: string, userId: string): Promise<boolean> {
  const removed = await db()
    .delete(tripMember)
    .where(
      and(
        eq(tripMember.tripId, tripId),
        eq(tripMember.userId, userId),
        eq(tripMember.role, "member"),
      ),
    )
    .returning({ userId: tripMember.userId });
  if (removed.length > 0) await touch(tripId);
  return removed.length > 0;
}

/** Hands the organiser role to another member; the previous organiser stays a member. */
export async function transferOrganizer(
  tripId: string,
  fromUserId: string,
  toUserId: string,
): Promise<boolean> {
  return db().transaction(async (tx) => {
    const [target] = await tx
      .select({ userId: tripMember.userId })
      .from(tripMember)
      .where(
        and(
          eq(tripMember.tripId, tripId),
          eq(tripMember.userId, toUserId),
          eq(tripMember.role, "member"),
        ),
      )
      .for("update");
    if (!target) return false;
    // Demote first – the partial unique index allows only one organiser at a time.
    const demoted = await tx
      .update(tripMember)
      .set({ role: "member" })
      .where(
        and(
          eq(tripMember.tripId, tripId),
          eq(tripMember.userId, fromUserId),
          eq(tripMember.role, "organizer"),
        ),
      )
      .returning({ userId: tripMember.userId });
    if (demoted.length === 0) return false;
    await tx
      .update(tripMember)
      .set({ role: "organizer" })
      .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, toUserId)));
    return true;
  });
}

export type RenameResult = { ok: true } | { ok: false; suggestion: string };

/**
 * «Mein Name in dieser Reise» – unique per trip (F-003/F-004). Runs with the trip row locked
 * (like `joinByToken`), so parallel renames and joins are serialised; the unique index
 * (trip_id, lower(display_name)) is the final guarantee – a violation there is reported as
 * «name taken» with a suggestion, never as an error (R-039).
 */
export async function renameMember(
  tripId: string,
  userId: string,
  name: string,
): Promise<RenameResult> {
  const clean = cleanDisplayName(name);
  try {
    return await db().transaction(async (tx) => {
      await tx.select({ id: trip.id }).from(trip).where(eq(trip.id, tripId)).for("update");
      const taken = await namesOfOthers(tx, tripId, userId);
      if (isNameTaken(clean, taken)) {
        return { ok: false, suggestion: suggestName(clean, taken) } as const;
      }
      await tx
        .update(tripMember)
        .set({ displayName: clean })
        .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)));
      return { ok: true } as const;
    });
  } catch (error) {
    if (!isUniqueViolation(error, NAME_INDEX)) throw error;
    const taken = await namesOfOthers(db(), tripId, userId);
    return { ok: false, suggestion: suggestName(clean, [...taken, clean]) };
  }
}

/** Names of the other members plus the open placeholders (names are unique across both, F-007). */
async function namesOfOthers(
  executor: Tx | ReturnType<typeof db>,
  tripId: string,
  userId: string,
): Promise<string[]> {
  const rows = await executor
    .select({ displayName: tripMember.displayName })
    .from(tripMember)
    .where(and(eq(tripMember.tripId, tripId), ne(tripMember.userId, userId)));
  return [...rows.map((row) => row.displayName), ...(await openPlaceholderNames(executor, tripId))];
}

async function openPlaceholderNames(
  executor: Tx | ReturnType<typeof db>,
  tripId: string,
  exceptId?: string,
): Promise<string[]> {
  const rows = await executor
    .select({ id: tripPlaceholder.id, displayName: tripPlaceholder.displayName })
    .from(tripPlaceholder)
    .where(and(eq(tripPlaceholder.tripId, tripId), isNull(tripPlaceholder.claimedAt)));
  return rows.filter((row) => row.id !== exceptId).map((row) => row.displayName);
}

// ---------------------------------------------------------------------------
// Placeholders (F-007) – organiser only (checked by the caller). All name writes lock the
// trip row like joins and renames, so names stay unique across members and placeholders.
// ---------------------------------------------------------------------------

/** Unique index on (trip_id, lower(display_name)) of open placeholders – migration 0004. */
const PLACEHOLDER_NAME_INDEX = "trip_placeholder_trip_name_idx";

export type PlaceholderResult =
  | { ok: true }
  | { ok: false; reason: "full" | "notFound" }
  | { ok: false; reason: "nameTaken"; suggestion: string };

async function lockTrip(tx: Tx, tripId: string): Promise<void> {
  await tx.select({ id: trip.id }).from(trip).where(eq(trip.id, tripId)).for("update");
}

async function allNames(tx: Tx, tripId: string, exceptPlaceholder?: string): Promise<string[]> {
  const members = await tx
    .select({ displayName: tripMember.displayName })
    .from(tripMember)
    .where(eq(tripMember.tripId, tripId));
  return [
    ...members.map((row) => row.displayName),
    ...(await openPlaceholderNames(tx, tripId, exceptPlaceholder)),
  ];
}

async function nameTakenFallback(
  error: unknown,
  tripId: string,
  clean: string,
): Promise<PlaceholderResult> {
  if (!isUniqueViolation(error, PLACEHOLDER_NAME_INDEX)) throw error;
  const taken = await db().transaction(async (tx) => allNames(tx, tripId));
  return { ok: false, reason: "nameTaken", suggestion: suggestName(clean, [...taken, clean]) };
}

/** Adds a placeholder (name) with its own 256-bit invite link; counts towards the 30 (Q6). */
export async function createPlaceholder(tripId: string, name: string): Promise<PlaceholderResult> {
  const clean = cleanDisplayName(name);
  try {
    return await db().transaction(async (tx) => {
      await lockTrip(tx, tripId);
      const taken = await allNames(tx, tripId);
      if (taken.length >= MAX_TRIP_MEMBERS) return { ok: false, reason: "full" } as const;
      if (isNameTaken(clean, taken)) {
        return { ok: false, reason: "nameTaken", suggestion: suggestName(clean, taken) } as const;
      }
      await tx
        .insert(tripPlaceholder)
        .values({ tripId, displayName: clean, inviteToken: generateInviteToken() });
      await tx.update(trip).set({ updatedAt: new Date() }).where(eq(trip.id, tripId));
      return { ok: true } as const;
    });
  } catch (error) {
    return nameTakenFallback(error, tripId, clean);
  }
}

export async function renamePlaceholder(
  tripId: string,
  placeholderId: string,
  name: string,
): Promise<PlaceholderResult> {
  const clean = cleanDisplayName(name);
  try {
    return await db().transaction(async (tx) => {
      await lockTrip(tx, tripId);
      const taken = await allNames(tx, tripId, placeholderId);
      if (isNameTaken(clean, taken)) {
        return { ok: false, reason: "nameTaken", suggestion: suggestName(clean, taken) } as const;
      }
      const updated = await tx
        .update(tripPlaceholder)
        .set({ displayName: clean })
        .where(
          and(
            eq(tripPlaceholder.id, placeholderId),
            eq(tripPlaceholder.tripId, tripId),
            isNull(tripPlaceholder.claimedAt),
          ),
        )
        .returning({ id: tripPlaceholder.id });
      return updated.length > 0
        ? ({ ok: true } as const)
        : ({ ok: false, reason: "notFound" } as const);
    });
  } catch (error) {
    return nameTakenFallback(error, tripId, clean);
  }
}

/** Removes an open placeholder – its personal link stops working at once (Flow J). */
export async function removePlaceholder(tripId: string, placeholderId: string): Promise<boolean> {
  const removed = await db()
    .delete(tripPlaceholder)
    .where(
      and(
        eq(tripPlaceholder.id, placeholderId),
        eq(tripPlaceholder.tripId, tripId),
        isNull(tripPlaceholder.claimedAt),
      ),
    )
    .returning({ id: tripPlaceholder.id });
  if (removed.length > 0) await touch(tripId);
  return removed.length > 0;
}

async function touch(tripId: string): Promise<void> {
  await db().update(trip).set({ updatedAt: new Date() }).where(eq(trip.id, tripId));
}

// ---------------------------------------------------------------------------
// Invite (F-002, F-003)
// ---------------------------------------------------------------------------

export interface InvitePreview {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  rangeStart: string;
  rangeEnd: string;
  minNights: number;
  preferredNights: number | null;
  phase: TripRow["phase"];
  fixedStart: string | null;
  fixedEnd: string | null;
  locale: string;
  joinOpen: boolean;
  memberCount: number;
  /** Open placeholders – they count towards the limit of 30 (F-007). */
  placeholderCount: number;
  /** Only the organiser's FIRST name – never other names (F-003 privacy). */
  organizerFirstName: string;
  /**
   * Set when the token is a personal placeholder link (F-007): its name (shown only to the
   * holder of that link) and whether someone already took it over (Flow A.3).
   */
  placeholder: { name: string; claimed: boolean } | null;
}

/** Trip id behind a trip or placeholder token (same route /i/<token>, sitemap §4). */
function tripIdForToken(token: string) {
  return or(
    eq(trip.inviteToken, token),
    eq(
      trip.id,
      sql`(select ${tripPlaceholder.tripId} from ${tripPlaceholder} where ${tripPlaceholder.inviteToken} = ${token})`,
    ),
  );
}

async function placeholderByToken(executor: Tx | ReturnType<typeof db>, token: string) {
  const [row] = await executor
    .select({
      id: tripPlaceholder.id,
      displayName: tripPlaceholder.displayName,
      claimedAt: tripPlaceholder.claimedAt,
    })
    .from(tripPlaceholder)
    .where(eq(tripPlaceholder.inviteToken, token))
    .limit(1);
  return row;
}

/**
 * Preview behind an invite token: only what F-003 allows before joining (name, range,
 * duration, description, organiser's first name, number of members) – plus, for a personal
 * placeholder link, that placeholder's name. Unknown, renewed and deleted tokens all return
 * null (one shared message, Flow A.3).
 */
export async function findInvite(token: string): Promise<InvitePreview | null> {
  if (!isInviteTokenShape(token)) return null;
  const [row] = await db()
    .select({
      id: trip.id,
      publicId: trip.publicId,
      name: trip.name,
      description: trip.description,
      rangeStart: trip.rangeStart,
      rangeEnd: trip.rangeEnd,
      minNights: trip.minNights,
      preferredNights: trip.preferredNights,
      phase: trip.phase,
      fixedStart: trip.fixedStart,
      fixedEnd: trip.fixedEnd,
      locale: trip.locale,
      joinOpen: trip.joinOpen,
      inviteToken: trip.inviteToken,
      memberCount: sql<number>`(select count(*)::int from ${tripMember} where ${tripMember.tripId} = ${trip.id})`,
      placeholderCount: sql<number>`(select count(*)::int from ${tripPlaceholder} where ${tripPlaceholder.tripId} = ${trip.id} and ${tripPlaceholder.claimedAt} is null)`,
      organizerName: sql<
        string | null
      >`(select ${tripMember.displayName} from ${tripMember} where ${tripMember.tripId} = ${trip.id} and ${tripMember.role} = 'organizer' limit 1)`,
    })
    .from(trip)
    .where(tripIdForToken(token))
    .limit(1);
  if (!row) return null;
  const { organizerName, inviteToken, ...rest } = row;
  const placeholder = inviteToken === token ? undefined : await placeholderByToken(db(), token);
  return {
    ...rest,
    organizerFirstName: firstName(organizerName ?? ""),
    placeholder: placeholder
      ? { name: placeholder.displayName, claimed: placeholder.claimedAt !== null }
      : null,
  };
}

/** Trip name behind an invite token (mail context «Du trittst „…“ bei», magic-link page). */
export async function findTripByInviteToken(
  token: string,
): Promise<{ id: string; name: string } | undefined> {
  if (!isInviteTokenShape(token)) return undefined;
  const [row] = await db()
    .select({ id: trip.id, name: trip.name })
    .from(trip)
    .where(tripIdForToken(token))
    .limit(1);
  return row;
}

export async function isMember(tripId: string, userId: string): Promise<boolean> {
  const [row] = await db()
    .select({ tripId: tripMember.tripId })
    .from(tripMember)
    .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)))
    .limit(1);
  return row !== undefined;
}

export type JoinOutcome =
  | { ok: true; publicId: string; alreadyMember: boolean }
  | { ok: false; reason: "invalid" | "closed" | "full" }
  | { ok: false; reason: "nameTaken"; suggestion: string };

/**
 * Joins via invite token (F-003) or a personal placeholder link (F-007: whoever joins through
 * it takes the placeholder over). One transaction with the trip row locked, so the limit of
 * 30 incl. open placeholders (Q6) and the name check hold under parallel joins.
 */
export async function joinByToken(
  token: string,
  userId: string,
  name: string,
  accountName?: string,
): Promise<JoinOutcome> {
  if (!isInviteTokenShape(token)) return { ok: false, reason: "invalid" };
  const clean = cleanDisplayName(name);
  try {
    return await joinLocked(token, userId, clean, accountName);
  } catch (error) {
    // The app check and the index can disagree on rare case foldings (JS vs. PostgreSQL
    // lower()) – the index wins, the person gets a suggestion (R-039).
    if (!isUniqueViolation(error, NAME_INDEX)) throw error;
    const [row] = await db().select({ id: trip.id }).from(trip).where(tripIdForToken(token));
    const taken = row ? await db().transaction(async (tx) => allNames(tx, row.id)) : [];
    return {
      ok: false,
      reason: "nameTaken",
      suggestion: suggestName(clean, [...taken, clean], accountName),
    };
  }
}

async function joinLocked(
  token: string,
  userId: string,
  clean: string,
  accountName?: string,
): Promise<JoinOutcome> {
  return db().transaction(async (tx) => {
    const [row] = await tx
      .select({ id: trip.id, publicId: trip.publicId, joinOpen: trip.joinOpen })
      .from(trip)
      .where(tripIdForToken(token))
      .for("update");
    if (!row) return { ok: false, reason: "invalid" } as const;
    // Read after the lock: a parallel join may just have claimed the placeholder.
    const placeholder = await placeholderByToken(tx, token);
    const claiming = placeholder && placeholder.claimedAt === null ? placeholder : undefined;
    const members = await tx
      .select({ userId: tripMember.userId, displayName: tripMember.displayName })
      .from(tripMember)
      .where(eq(tripMember.tripId, row.id));
    if (members.some((m) => m.userId === userId)) {
      return { ok: true, publicId: row.publicId, alreadyMember: true } as const;
    }
    if (!row.joinOpen) return { ok: false, reason: "closed" } as const;
    const others = await openPlaceholderNames(tx, row.id, claiming?.id);
    // Taking over a placeholder does not need a free spot – it already counts.
    const occupied = members.length + others.length + (claiming ? 1 : 0);
    if (!claiming && occupied >= MAX_TRIP_MEMBERS) return { ok: false, reason: "full" } as const;
    const taken = [...members.map((m) => m.displayName), ...others];
    if (isNameTaken(clean, taken)) {
      return {
        ok: false,
        reason: "nameTaken",
        suggestion: suggestName(clean, taken, accountName),
      } as const;
    }
    const now = new Date();
    if (claiming) {
      // Free the name first – the partial unique index only covers open placeholders.
      await tx
        .update(tripPlaceholder)
        .set({ claimedAt: now, claimedBy: userId })
        .where(eq(tripPlaceholder.id, claiming.id));
    }
    await tx.insert(tripMember).values({ tripId: row.id, userId, displayName: clean });
    await tx.update(trip).set({ updatedAt: now }).where(eq(trip.id, row.id));
    return { ok: true, publicId: row.publicId, alreadyMember: false } as const;
  });
}
