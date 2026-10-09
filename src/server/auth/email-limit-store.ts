import "server-only";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { APIError } from "better-auth/api";
import {
  DAY_MS,
  decideCodeRequest,
  decideVerification,
  HOUR_MS,
  mailboxOf,
  type LimitDecision,
} from "@/lib/email-limits";
import { db, type Database } from "../db/client";
import { authAttempt } from "../db/schema";
import { serverEnv } from "../env";
import { deriveEmailLimitKey, hmacHex } from "./email-limit-key";

/**
 * Store for the per-address limits (src/lib/email-limits.ts) in `auth_attempt`.
 *
 * Atomic per key (R-022): checking and counting happen in ONE transaction that first takes
 * a transaction-scoped advisory lock on the key, so parallel requests are serialised and
 * cannot all see the same "still below the limit" state. Failed verifications are
 * reserved BEFORE the secret is checked (a `failure` row that is removed again when the
 * attempt turns out not to count) – so at most `failuresPerHour` checks can ever run.
 */

/** "request" = code mail (exact address) · "mailbox" = code mail (mailbox) · "failure". */
type Kind = "request" | "mailbox" | "failure";

type Executor = Pick<Database, "select" | "insert" | "delete" | "execute">;

let hmacKey: Buffer | undefined;

function key(value: string): string {
  const env = serverEnv();
  hmacKey ??= deriveEmailLimitKey({ appEnv: env.APP_ENV, secret: env.BETTER_AUTH_SECRET });
  return hmacHex(hmacKey, value);
}

/** HMAC of the normalised address – the address itself is never stored (data minimisation). */
export function emailLimitKey(email: string): string {
  return key(email.trim().toLowerCase());
}

/** HMAC of the mailbox (plus tag removed, R-027) – only for the mail budget. */
export function mailboxLimitKey(email: string): string {
  return key(`mailbox:${mailboxOf(email)}`);
}

async function times(ex: Executor, k: string, kind: Kind, windowMs: number): Promise<number[]> {
  const rows = await ex
    .select({ createdAt: authAttempt.createdAt })
    .from(authAttempt)
    .where(
      and(
        eq(authAttempt.key, k),
        eq(authAttempt.kind, kind),
        gt(authAttempt.createdAt, new Date(Date.now() - windowMs)),
      ),
    );
  return rows.map((row) => row.createdAt.getTime());
}

/** Serialises all transactions on the same lock name until commit (R-022). */
async function lock(ex: Executor, name: string): Promise<void> {
  await ex.execute(sql`select pg_advisory_xact_lock(hashtextextended(${name}, 0))`);
}

async function housekeeping(): Promise<void> {
  // Nothing older than the longest window (1 day) is needed.
  if (Math.random() < 0.05) {
    await db()
      .delete(authAttempt)
      .where(lt(authAttempt.createdAt, new Date(Date.now() - DAY_MS)));
  }
}

/** 429 in Better Auth's error format; the client shows the wait time in minutes. */
export function rateLimitError(decision: Extract<LimitDecision, { allowed: false }>): APIError {
  return new APIError(
    "TOO_MANY_REQUESTS",
    {
      code: decision.reason === "locked" ? "EMAIL_LOCKED" : "EMAIL_RATE_LIMITED",
      message: "Too many attempts for this address. Please try again later.",
      retryAfter: decision.retryAfterSeconds,
    },
    { "Retry-After": String(decision.retryAfterSeconds) },
  );
}

/**
 * Before sending a code mail: throws 429 when the mail budget of the address or of its
 * mailbox is used up, otherwise counts the request – atomically. A lock on the address
 * does NOT block the mail (R-021): it carries the magic link.
 */
export async function takeCodeRequest(email: string): Promise<void> {
  const exact = emailLimitKey(email);
  const mailbox = mailboxLimitKey(email);
  const decision = await db().transaction(async (tx) => {
    // One lock per mailbox covers every exact address that delivers to it.
    await lock(tx, `mail:${mailbox}`);
    const [requests, mailboxRequests] = await Promise.all([
      times(tx, exact, "request", DAY_MS),
      times(tx, mailbox, "mailbox", DAY_MS),
    ]);
    const result = decideCodeRequest(requests, mailboxRequests, Date.now());
    if (result.allowed) {
      await tx.insert(authAttempt).values([
        { key: exact, kind: "request" },
        { key: mailbox, kind: "mailbox" },
      ]);
    }
    return result;
  });
  if (!decision.allowed) throw rateLimitError(decision);
  await housekeeping();
}

/** Throws 429 while the address is locked for codes and passwords. */
export async function assertVerificationAllowed(email: string): Promise<void> {
  const decision = decideVerification(
    await times(db(), emailLimitKey(email), "failure", HOUR_MS),
    Date.now(),
  );
  if (!decision.allowed) throw rateLimitError(decision);
}

export interface VerificationReservation {
  /** Row of the reserved failure – release it if the attempt does not count. */
  id: string;
  /** The decision if this attempt fails: `locked` when it is the last one allowed. */
  ifFailed: LimitDecision;
}

/**
 * Before checking a code or password (R-022): throws 429 while the address is locked,
 * otherwise reserves one failure atomically. Keep it when the secret was wrong, release it
 * (`releaseVerificationAttempt`) when the attempt does not count, clear all on success.
 */
export async function reserveVerificationAttempt(email: string): Promise<VerificationReservation> {
  const k = emailLimitKey(email);
  const result = await db().transaction(
    async (tx): Promise<VerificationReservation | Extract<LimitDecision, { allowed: false }>> => {
      await lock(tx, `failure:${k}`);
      const failures = await times(tx, k, "failure", HOUR_MS);
      const now = Date.now();
      const decision = decideVerification(failures, now);
      if (!decision.allowed) return decision;
      const [row] = await tx
        .insert(authAttempt)
        .values({ key: k, kind: "failure" })
        .returning({ id: authAttempt.id });
      if (!row) throw new Error("auth_attempt: reservation not stored");
      return { id: row.id, ifFailed: decideVerification([...failures, now], now) };
    },
  );
  if ("allowed" in result) throw rateLimitError(result);
  return result;
}

/** The reserved attempt did not count (no secret checked, other error, success). */
export async function releaseVerificationAttempt(id: string): Promise<void> {
  await db().delete(authAttempt).where(eq(authAttempt.id, id));
}

/** A successful sign-in clears the failure count of the address. */
export async function clearVerificationFailures(email: string): Promise<void> {
  await db()
    .delete(authAttempt)
    .where(and(eq(authAttempt.key, emailLimitKey(email)), eq(authAttempt.kind, "failure")));
}
