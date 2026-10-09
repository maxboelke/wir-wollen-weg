import "server-only";
import { createHmac } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { APIError } from "better-auth/api";
import {
  DAY_MS,
  decideCodeRequest,
  decideVerification,
  HOUR_MS,
  type LimitDecision,
} from "@/lib/email-limits";
import { db } from "../db/client";
import { authAttempt } from "../db/schema";
import { serverEnv } from "../env";

type Kind = "request" | "failure";

/** HMAC of the normalised address – the address itself is never stored (data minimisation). */
export function emailLimitKey(email: string): string {
  const secret = serverEnv().BETTER_AUTH_SECRET ?? "dev-only-email-limit-key";
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

async function times(key: string, kind: Kind, windowMs: number): Promise<number[]> {
  const rows = await db()
    .select({ createdAt: authAttempt.createdAt })
    .from(authAttempt)
    .where(
      and(
        eq(authAttempt.key, key),
        eq(authAttempt.kind, kind),
        gt(authAttempt.createdAt, new Date(Date.now() - windowMs)),
      ),
    );
  return rows.map((row) => row.createdAt.getTime());
}

async function record(key: string, kind: Kind): Promise<void> {
  await db().insert(authAttempt).values({ key, kind });
  // Housekeeping: nothing older than the longest window (1 day) is needed.
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
 * Before sending a code mail: throws 429 when the address is locked or over budget,
 * otherwise counts the request.
 */
export async function takeCodeRequest(email: string): Promise<void> {
  const key = emailLimitKey(email);
  const [requests, failures] = await Promise.all([
    times(key, "request", DAY_MS),
    times(key, "failure", HOUR_MS),
  ]);
  const decision = decideCodeRequest(requests, failures, Date.now());
  if (!decision.allowed) throw rateLimitError(decision);
  await record(key, "request");
}

/** Before verifying a code or password: throws 429 while the address is locked. */
export async function assertVerificationAllowed(email: string): Promise<void> {
  const decision = decideVerification(
    await times(emailLimitKey(email), "failure", HOUR_MS),
    Date.now(),
  );
  if (!decision.allowed) throw rateLimitError(decision);
}

/** Counts a failed verification; returns the lock decision after it. */
export async function recordVerificationFailure(email: string): Promise<LimitDecision> {
  const key = emailLimitKey(email);
  await record(key, "failure");
  return decideVerification(await times(key, "failure", HOUR_MS), Date.now());
}

/** A successful sign-in clears the failure count of the address. */
export async function clearVerificationFailures(email: string): Promise<void> {
  await db()
    .delete(authAttempt)
    .where(and(eq(authAttempt.key, emailLimitKey(email)), eq(authAttempt.kind, "failure")));
}
