/**
 * App-side rate limits around invites (F-003, Increment 2 security requirements).
 * Pure decision logic; storage: src/server/rate-limit.ts.
 */

export interface LimitRule {
  /** Event kind in `rate_limit_event`. */
  kind: string;
  limit: number;
  windowMs: number;
}

const MINUTE_MS = 60_000;

/** F-003: max. 20 joins per trip and hour per IP. */
export const JOIN_LIMIT: LimitRule = { kind: "join", limit: 20, windowMs: 60 * MINUTE_MS };

/**
 * Lookups with an unknown invite token per IP (IPv6: per /64). Tokens have 256 bit, so
 * guessing is hopeless anyway – this limit only protects the database (R-036, CEO decision
 * (a)): after 20 misses in 15 minutes further misses from that address are no longer
 * recorded (no more writes, one log line). It applies to misses only: a valid invite link is
 * ALWAYS delivered, also from a shared address (CGNAT, campus or hotel Wi-Fi) that has hit
 * the limit – one person scanning must never lock their neighbours out of joining.
 */
export const INVITE_MISS_LIMIT: LimitRule = {
  kind: "invite-miss",
  limit: 20,
  windowMs: 15 * MINUTE_MS,
};

/** True when `count` earlier events in the window already reach the limit. */
export function isOverLimit(count: number, rule: LimitRule): boolean {
  return count >= rule.limit;
}

/** Minutes until the oldest event in the window expires (≥ 1) – for «try again in …». */
export function minutesUntilFree(oldest: number | undefined, rule: LimitRule, now: number): number {
  if (oldest === undefined) return 1;
  return Math.max(1, Math.ceil((oldest + rule.windowMs - now) / MINUTE_MS));
}
