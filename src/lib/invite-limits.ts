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
 * Lookups with an unknown invite token per IP. Tokens have 256 bit, so guessing is hopeless
 * anyway; the limit stops scanning early and keeps the database quiet. After 20 misses in
 * 15 minutes every invite lookup from that IP pauses until the window has passed.
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
