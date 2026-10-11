import "server-only";
import { and, asc, eq, inArray, ne, or, sql } from "drizzle-orm";
import {
  resolveDeletionPlan,
  type DeletionChoice,
  type DeletionStep,
  type DeletionTripState,
} from "@/lib/account-deletion";
import { emailLimitKey } from "./auth/email-limit-store";
import { reauthIdentifier } from "./auth/reauth";
import { db } from "./db/client";
import {
  authAttempt,
  session,
  trip,
  tripMember,
  tripPlaceholder,
  user,
  verification,
} from "./db/schema";

/**
 * Account deletion (F-043, Flow I.3) – shared by «Konto löschen» and the inactivity job.
 *
 * Everything runs in ONE transaction:
 * 1. lock the rows of all trips the person is in (ordered by id – no deadlock between two
 *    deletions), so joins, role hand-overs, removals and phase changes wait;
 * 2. read the current state and resolve the plan again – a stale choice (someone joined a
 *    solo trip, the role was handed to this person meanwhile) aborts with `planOutdated`;
 * 3. hand over / delete trips, remove claimed placeholder rows (they still carry the name),
 *    pending codes and magic links, the re-auth markers and the per-address rate-limit
 *    entries;
 * 4. delete the user – sessions, credential, memberships, days and votes cascade.
 * A failure anywhere rolls everything back («nichts gelöscht», Flow I.3 ⚠).
 */

type Tx = Parameters<Parameters<ReturnType<typeof db>["transaction"]>[0]>[0];

export interface DeletionOverviewTrip extends DeletionTripState {
  memberCount: number;
}

/** Current trips of a person with the other members (for the page and the transaction). */
async function tripStates(executor: Tx | ReturnType<typeof db>, userId: string) {
  const mine = await executor
    .select({
      tripId: trip.id,
      publicId: trip.publicId,
      name: trip.name,
      role: tripMember.role,
    })
    .from(tripMember)
    .innerJoin(trip, eq(trip.id, tripMember.tripId))
    .where(eq(tripMember.userId, userId))
    .orderBy(asc(trip.name), asc(trip.id));
  if (mine.length === 0) return [];
  const others = await executor
    .select({
      tripId: tripMember.tripId,
      userId: tripMember.userId,
      displayName: tripMember.displayName,
      joinedAt: tripMember.joinedAt,
    })
    .from(tripMember)
    .where(
      and(
        inArray(
          tripMember.tripId,
          mine.map((row) => row.tripId),
        ),
        ne(tripMember.userId, userId),
      ),
    );
  return mine.map((row): DeletionOverviewTrip => {
    const list = others
      .filter((other) => other.tripId === row.tripId)
      .map(({ userId: id, displayName, joinedAt }) => ({ userId: id, displayName, joinedAt }));
    return { ...row, others: list, memberCount: list.length + 1 };
  });
}

/** W13 «Konto löschen»: the person's trips – which need a decision, which go with the account. */
export async function deletionOverview(userId: string): Promise<DeletionOverviewTrip[]> {
  return tripStates(db(), userId);
}

export type DeleteAccountResult =
  | {
      ok: true;
      email: string;
      name: string;
      locale: string;
      /** Trips deleted for everybody (solo trips and «Reise für alle löschen»). */
      deletedTrips: string[];
    }
  | { ok: false; reason: "planOutdated" | "notFound" };

async function applyStep(tx: Tx, userId: string, step: DeletionStep): Promise<void> {
  switch (step.kind) {
    case "leave":
      // The membership cascades with the user; nothing else to do.
      return;
    case "deleteTrip":
      await tx.delete(trip).where(eq(trip.id, step.tripId));
      return;
    case "transfer": {
      // Demote first – the partial unique index allows only one organiser at a time.
      await tx
        .update(tripMember)
        .set({ role: "member" })
        .where(and(eq(tripMember.tripId, step.tripId), eq(tripMember.userId, userId)));
      await tx
        .update(tripMember)
        .set({ role: "organizer" })
        .where(and(eq(tripMember.tripId, step.tripId), eq(tripMember.userId, step.to)));
      await tx.update(trip).set({ updatedAt: new Date() }).where(eq(trip.id, step.tripId));
      return;
    }
  }
}

/**
 * Deletes the account with all personal data. `choices` by public trip id (from the page) or
 * `"auto"` (inactivity: the role goes to the longest member).
 */
export async function deleteAccount(
  userId: string,
  choices: Readonly<Record<string, DeletionChoice>> | "auto",
): Promise<DeleteAccountResult> {
  return db().transaction(async (tx) => {
    const [account] = await tx
      .select({ email: user.email, name: user.name, locale: user.locale })
      .from(user)
      .where(eq(user.id, userId));
    if (!account) return { ok: false, reason: "notFound" } as const;

    // 1. Lock all trips of the person (fixed order), then read the state under the locks.
    const tripIds = await tx
      .select({ id: tripMember.tripId })
      .from(tripMember)
      .where(eq(tripMember.userId, userId))
      .orderBy(asc(tripMember.tripId));
    if (tripIds.length > 0) {
      await tx
        .select({ id: trip.id })
        .from(trip)
        .where(
          inArray(
            trip.id,
            tripIds.map((row) => row.id),
          ),
        )
        .orderBy(asc(trip.id))
        .for("update");
    }
    const states = await tripStates(tx, userId);

    // 2. Plan against the locked state.
    const plan = resolveDeletionPlan(states, choices);
    if (!plan.ok) return { ok: false, reason: plan.reason } as const;

    // 3. Trips, then data that is not tied to the user row by a foreign key.
    for (const step of plan.steps) await applyStep(tx, userId, step);
    await tx.delete(tripPlaceholder).where(eq(tripPlaceholder.claimedBy, userId));
    const sessions = await tx
      .select({ id: session.id })
      .from(session)
      .where(eq(session.userId, userId));
    const email = account.email.toLowerCase();
    await tx.delete(verification).where(
      or(
        // Codes: «<type>-otp-<email>» and «change-email-otp-<old>-<new>».
        sql`strpos(${verification.identifier}, ${`-otp-${email}`}) > 0`,
        // Magic links: identifier = token, value = JSON with the address.
        sql`strpos(${verification.value}, ${JSON.stringify(email)}) > 0`,
        ...(sessions.length > 0
          ? [
              inArray(
                verification.identifier,
                sessions.map((row) => reauthIdentifier(row.id)),
              ),
            ]
          : []),
      ),
    );
    await tx.delete(authAttempt).where(eq(authAttempt.key, emailLimitKey(email)));

    // 4. The account – sessions, credential, memberships, days and votes cascade.
    await tx.delete(user).where(eq(user.id, userId));

    // A trip created in the very same moment (waited for the user row) would now have no
    // members at all – remove such orphans instead of leaving them behind.
    await tx.execute(
      sql`delete from ${trip} where ${trip.updatedAt} > now() - interval '1 hour'
            and not exists (select 1 from ${tripMember} where ${tripMember.tripId} = ${trip.id})`,
    );

    return {
      ok: true,
      email: account.email,
      name: account.name,
      locale: account.locale,
      deletedTrips: plan.steps.flatMap((step) => (step.kind === "deleteTrip" ? [step.name] : [])),
    } as const;
  });
}
