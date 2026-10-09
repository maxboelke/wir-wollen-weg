/**
 * Rate limits per e-mail address (F-041, spike-auth §4, R-005 follow-up) – pure rules.
 *
 * Why per address in addition to the IP limits: IP limits do not protect ONE address
 * against requests spread over many IPs (mail bombing, guessing codes from a botnet) and
 * are only as good as the proxy setup.
 *
 * Values (all sliding windows):
 * - **5 code mails per hour** – a normal sign-in needs 1, an impatient one 2–3 ("send a new
 *   code" is possible after 30 s). 5 leaves room for typos in the mail app / spam folder
 *   while capping mail bombing at 5 mails/hour per victim.
 * - **20 code mails per day** – several sign-ins on different devices on the same day stay
 *   possible; a victim gets at most 20 unwanted mails a day (sender reputation, Lettermint
 *   quota).
 * - **10 failed verifications per hour → locked** (codes and passwords together) until the
 *   oldest of those failures is an hour old. Every code allows 5 attempts and a new code
 *   needs a new mail, so a person who mistypes repeatedly still gets 2 full codes; an
 *   attacker gets at most 10 guesses/hour = a 1-in-100,000 chance per hour for a 6-digit
 *   code (vs. 25 guesses/hour with only the per-code budget). For passwords, 10 guesses/hour
 *   make online guessing pointless.
 * - **Lockout is not a denial of service (R-021):** a wrong code only counts while a code
 *   is actually pending for the address (without one there is nothing to guess), and the
 *   lock only blocks ENTERING codes and passwords – code mails stay possible within the
 *   mail budget, and the magic link in them (proof of mailbox, not guessable) always signs
 *   in and clears the lock. Someone who only knows the address can delay, never prevent
 *   access. Wrong passwords count for every address alike (no enumeration).
 * - **Per mailbox (R-027):** `anna+1@…`, `anna+2@…` (and `a.nna@gmail.com`) land in one
 *   mailbox; the mail budget is also counted per mailbox: 10 per hour, 30 per day.
 *   Failures stay per exact address (a lock must not spill over to other accounts).
 *
 * The same rules apply to every address, whether an account exists or not (no enumeration).
 */
export const EMAIL_LIMITS = {
  requestsPerHour: 5,
  requestsPerDay: 20,
  failuresPerHour: 10,
  mailboxRequestsPerHour: 10,
  mailboxRequestsPerDay: 30,
} as const;

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export type LimitDecision =
  { allowed: true } | { allowed: false; reason: "requests" | "locked"; retryAfterSeconds: number };

/**
 * When does a window that holds `limit` events again accept one? `times` are epoch ms,
 * any order. Returns 0 when the window is not full.
 */
export function windowRetryAfter(
  times: readonly number[],
  limit: number,
  windowMs: number,
  now: number,
): number {
  const inWindow = times.filter((t) => t > now - windowMs).sort((a, b) => b - a);
  if (inWindow.length < limit) return 0;
  // The `limit`-th most recent event has to leave the window first.
  const blocking = inWindow[limit - 1] ?? now;
  return Math.max(1, Math.ceil((blocking + windowMs - now) / 1000));
}

/** Verifying a code/password: only blocked while the address is locked. */
export function decideVerification(failures: readonly number[], now: number): LimitDecision {
  const locked = windowRetryAfter(failures, EMAIL_LIMITS.failuresPerHour, HOUR_MS, now);
  return locked > 0
    ? { allowed: false, reason: "locked", retryAfterSeconds: locked }
    : { allowed: true };
}

/**
 * Asking for a code mail: blocked only when the mail budget of the address or its mailbox
 * is used up – NOT while the address is locked (R-021: the mail carries the magic link).
 */
export function decideCodeRequest(
  requests: readonly number[],
  mailboxRequests: readonly number[],
  now: number,
): LimitDecision {
  const wait = Math.max(
    windowRetryAfter(requests, EMAIL_LIMITS.requestsPerHour, HOUR_MS, now),
    windowRetryAfter(requests, EMAIL_LIMITS.requestsPerDay, DAY_MS, now),
    windowRetryAfter(mailboxRequests, EMAIL_LIMITS.mailboxRequestsPerHour, HOUR_MS, now),
    windowRetryAfter(mailboxRequests, EMAIL_LIMITS.mailboxRequestsPerDay, DAY_MS, now),
  );
  return wait > 0
    ? { allowed: false, reason: "requests", retryAfterSeconds: wait }
    : { allowed: true };
}

/**
 * The mailbox an address delivers to (R-027) – only for the mail budget, never for
 * accounts: lower case, without a `+tag`; for Gmail also without dots and with
 * googlemail.com folded into gmail.com.
 */
export function mailboxOf(email: string): string {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");
  if (at < 1) return address;
  let local = address.slice(0, at);
  let domain = address.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replaceAll(".", "");
  return `${local}@${domain}`;
}

/** Whole minutes for the message «Bitte warte kurz (2 Min.) …» – at least 1. */
export function retryAfterMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60));
}
