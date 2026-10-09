import "server-only";
import { and, asc, eq, gt, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { isOverLimit, minutesUntilFree, type LimitRule } from "@/lib/invite-limits";
import { CLIENT_IP_HEADER } from "./auth/client-ip";
import { deriveEmailLimitKey, hmacHex } from "./auth/email-limit-key";
import { withTrustedClientIp } from "./auth";
import { db } from "./db/client";
import { rateLimitEvent } from "./db/schema";
import { serverEnv } from "./env";

/**
 * Store for app rate limits (src/lib/invite-limits.ts) in `rate_limit_event`. Keys are
 * HMACs (IP addresses are personal data and never stored in clear). Check and count run in
 * one transaction behind an advisory lock on the key – parallel requests cannot all slip
 * under the limit (same pattern as R-022).
 */

let hmacKey: Buffer | undefined;

function hashKey(value: string): string {
  const env = serverEnv();
  hmacKey ??= deriveEmailLimitKey({ appEnv: env.APP_ENV, secret: env.BETTER_AUTH_SECRET });
  return hmacHex(hmacKey, `app-limit:${value}`);
}

/**
 * Client IP from the trusted proxy header (same resolution as the auth limits, R-005).
 * Without a resolvable address all such requests share one bucket ("unknown").
 */
export async function requestIp(): Promise<string> {
  return withTrustedClientIp(await headers()).get(CLIENT_IP_HEADER) ?? "unknown";
}

export interface LimitState {
  limited: boolean;
  retryMinutes: number;
}

async function eventTimes(key: string, rule: LimitRule, executor = db()): Promise<number[]> {
  const rows = await executor
    .select({ createdAt: rateLimitEvent.createdAt })
    .from(rateLimitEvent)
    .where(
      and(
        eq(rateLimitEvent.key, key),
        eq(rateLimitEvent.kind, rule.kind),
        gt(rateLimitEvent.createdAt, new Date(Date.now() - rule.windowMs)),
      ),
    )
    .orderBy(asc(rateLimitEvent.createdAt));
  return rows.map((row) => row.createdAt.getTime());
}

function state(times: number[], rule: LimitRule): LimitState {
  return {
    limited: isOverLimit(times.length, rule),
    retryMinutes: minutesUntilFree(times[0], rule, Date.now()),
  };
}

/** Read-only check (e.g. before looking up an invite token). */
export async function checkLimit(rule: LimitRule, subject: string): Promise<LimitState> {
  return state(await eventTimes(hashKey(subject), rule), rule);
}

/** Records one event (e.g. a lookup with an unknown token). */
export async function recordEvent(rule: LimitRule, subject: string): Promise<void> {
  await db()
    .insert(rateLimitEvent)
    .values({ key: hashKey(subject), kind: rule.kind });
  // Housekeeping: nothing older than the longest window (1 h) is needed.
  if (Math.random() < 0.05) {
    await db()
      .delete(rateLimitEvent)
      .where(lt(rateLimitEvent.createdAt, new Date(Date.now() - 2 * 60 * 60 * 1000)));
  }
}

/** Atomically: still allowed? then count this event. */
export async function takeLimit(rule: LimitRule, subject: string): Promise<LimitState> {
  const key = hashKey(subject);
  return db().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
    const times = await eventTimes(key, rule, tx);
    const current = state(times, rule);
    if (!current.limited) await tx.insert(rateLimitEvent).values({ key, kind: rule.kind });
    return current;
  });
}
