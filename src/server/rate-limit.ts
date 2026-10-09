import "server-only";
import { and, asc, eq, gt, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { isOverLimit, minutesUntilFree, type LimitRule } from "@/lib/invite-limits";
import { CLIENT_IP_HEADER, rateLimitSubject } from "./auth/client-ip";
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
 * Rate-limit subject of the current request: the client IP from the trusted proxy header
 * (same resolution as the auth limits, R-005), IPv6 collapsed to its /64 network (R-036).
 *
 * Returns `undefined` when no address can be resolved – this only happens outside
 * development/CI (there the loopback address is used) and means the proxy setup is broken.
 * Callers must then NOT fall back to a shared bucket such as "unknown": one bucket for all
 * visitors would let a single person lock everyone out (R-036). Instead they reject the
 * request (joins, like the 400 of the auth route) or skip counting (invite misses).
 */
export async function requestLimitSubject(): Promise<string | undefined> {
  const ip = withTrustedClientIp(await headers()).get(CLIENT_IP_HEADER);
  if (!ip) {
    console.warn("rate-limit: no client IP – check AUTH_IP_HEADER and the proxy setup");
    return undefined;
  }
  return rateLimitSubject(ip);
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

/** Read-only check (e.g. after an invite lookup missed). */
export async function checkLimit(rule: LimitRule, subject: string): Promise<LimitState> {
  return state(await eventTimes(hashKey(subject), rule), rule);
}

/** Records one event (e.g. a lookup with an unknown token). */
export async function recordEvent(rule: LimitRule, subject: string): Promise<void> {
  await db()
    .insert(rateLimitEvent)
    .values({ key: hashKey(subject), kind: rule.kind });
  await housekeeping();
}

/**
 * Nothing older than the longest window (1 h) is needed; keys are pseudonymous IP data, so
 * old rows must not pile up (runs after both recordEvent and takeLimit).
 */
async function housekeeping(): Promise<void> {
  if (Math.random() >= 0.05) return;
  await db()
    .delete(rateLimitEvent)
    .where(lt(rateLimitEvent.createdAt, new Date(Date.now() - 2 * 60 * 60 * 1000)));
}

/** Atomically: still allowed? then count this event. */
export async function takeLimit(rule: LimitRule, subject: string): Promise<LimitState> {
  const key = hashKey(subject);
  const result = await db().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
    const times = await eventTimes(key, rule, tx);
    const current = state(times, rule);
    if (!current.limited) await tx.insert(rateLimitEvent).values({ key, kind: rule.kind });
    return current;
  });
  await housekeeping();
  return result;
}
