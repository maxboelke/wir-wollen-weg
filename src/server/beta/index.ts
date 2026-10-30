import "server-only";
import { APIError } from "better-auth/api";
import { and, count, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { isBeta, resolveAppUrl } from "@/lib/app-env";
import {
  BETA_CONSENT_VERSION,
  betaInviteSignupEnabled,
  betaMaxAccounts,
  normalizeBetaCode,
  parseBetaCodes,
} from "@/lib/beta-config";
import { readCookie } from "@/lib/cookies";
import {
  BETA_CODE_GLOBAL_LIMIT,
  BETA_CODE_IP_DAY_LIMIT,
  BETA_CODE_IP_LIMIT,
  BETA_LOCK,
  BETA_SIGNUP_MAIL_LIMIT,
} from "@/lib/invite-limits";
import { isInviteTokenShape } from "@/lib/tokens";
import { db } from "../db/client";
import { MAX_TRIP_MEMBERS, trip, tripMember, tripPlaceholder, user } from "../db/schema";
import { serverEnv } from "../env";
import { checkLimit, recordEvent, takeLimit } from "../rate-limit";
import {
  BETA_PASS_COOKIE,
  INVITE_PASS_COOKIE,
  PASS_MAX_AGE_SECONDS,
  inviteTokenHash,
  matchBetaCode,
  readBetaPass,
  readInvitePass,
  signBetaPass,
  signInvitePass,
  type BetaPass,
  type InvitePass,
} from "./pass";

/**
 * Friends beta «Stufe B» (Gate G0, deployment.md §0.12.5): beta code on /beta, beta pass and
 * invite pass, and the ONE place where accounts are allowed to come into existence
 * (`enforceBetaSignup`, called from Better Auth's `databaseHooks.user.create.before`).
 * Logs only counters (`beta_code.*`, `beta_signup.*`) – never IPs, addresses or codes.
 */

/** Error codes of the sign-up hook – the UI shows W23 A.5 resp. «Die Beta ist gerade voll». */
export const BETA_SIGNUP_REQUIRED = "BETA_SIGNUP_REQUIRED";
export const BETA_FULL = "BETA_FULL";

const GLOBAL = "global";

function secret(): string {
  // In beta the start guard requires BETTER_AUTH_SECRET (deriveEmailLimitKey, R-028).
  return serverEnv().BETTER_AUTH_SECRET ?? "dev-only-beta-pass-secret-0123456789";
}

function configuredCodes(): string[] {
  const parsed = parseBetaCodes(process.env.BETA_ACCESS_CODES);
  return parsed.ok ? parsed.codes : [];
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: resolveAppUrl().startsWith("https://"),
    sameSite: "lax" as const,
    path: "/",
    maxAge: PASS_MAX_AGE_SECONDS,
  };
}

/** Number of accounts (all ways in count – §0.12.3 `BETA_MAX_ACCOUNTS`). */
export async function accountCount(): Promise<number> {
  const [row] = await db().select({ value: count() }).from(user);
  return row?.value ?? 0;
}

export async function betaIsFull(): Promise<boolean> {
  return (await accountCount()) >= betaMaxAccounts(process.env);
}

export type BetaCodeOutcome =
  | { ok: true }
  | { ok: false; error: "empty" | "wrong" | "full" }
  | { ok: false; error: "rate"; minutes: number };

/**
 * /beta step 1 (§0.12.5 Nr. 1, 6, 7): checks the code BEFORE any mail is sent. Limits per IP
 * (5 / 15 min, 20 / day) and globally (200 wrong codes a day → closed for an hour); only wrong
 * codes count. Valid → beta pass (without consent yet).
 */
export async function checkBetaCode(typed: string, subject: string): Promise<BetaCodeOutcome> {
  if (!normalizeBetaCode(typed)) return { ok: false, error: "empty" };
  const [ipShort, ipDay, lock] = await Promise.all([
    checkLimit(BETA_CODE_IP_LIMIT, subject),
    checkLimit(BETA_CODE_IP_DAY_LIMIT, subject),
    checkLimit(BETA_LOCK, GLOBAL),
  ]);
  const blocked = [ipShort, ipDay, lock].filter((state) => state.limited);
  if (blocked.length > 0) {
    console.warn("beta_code.locked");
    return {
      ok: false,
      error: "rate",
      minutes: Math.max(...blocked.map((state) => state.retryMinutes)),
    };
  }
  const kid = matchBetaCode(typed, configuredCodes());
  if (!kid) {
    console.warn("beta_code.invalid");
    await Promise.all([
      recordEvent(BETA_CODE_IP_LIMIT, subject),
      recordEvent(BETA_CODE_IP_DAY_LIMIT, subject),
    ]);
    const global = await takeLimit(BETA_CODE_GLOBAL_LIMIT, GLOBAL);
    if (global.limited) await takeLimit(BETA_LOCK, GLOBAL);
    return { ok: false, error: "wrong" };
  }
  if (await betaIsFull()) return { ok: false, error: "full" };
  console.info("beta_code.ok");
  await writeBetaPass({ v: 1, iat: Date.now(), kid, consent: null, consentAt: null });
  return { ok: true };
}

async function writeBetaPass(pass: BetaPass): Promise<void> {
  (await cookies()).set(BETA_PASS_COOKIE, signBetaPass(pass, secret()), cookieOptions());
}

/** The current request's valid beta pass (any step), or null. */
export async function currentBetaPass(): Promise<BetaPass | null> {
  const raw = (await cookies()).get(BETA_PASS_COOKIE)?.value;
  return readBetaPass(raw, secret(), configuredCodes());
}

/** /beta step 2 (§0.12.5 Nr. 3): consent goes into the pass – false = no valid pass. */
export async function confirmBetaConsent(): Promise<boolean> {
  const pass = await currentBetaPass();
  if (!pass) return false;
  await writeBetaPass({ ...pass, consent: BETA_CONSENT_VERSION, consentAt: Date.now() });
  return true;
}

/** Invite whose token hashes to `tokenHash` is still usable for joining trip `tripId`. */
async function inviteStillValid(pass: InvitePass): Promise<boolean> {
  const [row] = await db()
    .select({
      inviteToken: trip.inviteToken,
      joinOpen: trip.joinOpen,
      members: db().$count(tripMember, eq(tripMember.tripId, trip.id)),
      placeholders: db().$count(
        tripPlaceholder,
        and(eq(tripPlaceholder.tripId, trip.id), isNull(tripPlaceholder.claimedAt)),
      ),
    })
    .from(trip)
    .where(eq(trip.id, pass.tripId))
    .limit(1);
  if (!row?.joinOpen) return false;
  if (inviteTokenHash(row.inviteToken) === pass.tokenHash) {
    return row.members + row.placeholders < MAX_TRIP_MEMBERS;
  }
  // Personal placeholder link (F-007): only while nobody took the placeholder over.
  const open = await db()
    .select({ token: tripPlaceholder.inviteToken })
    .from(tripPlaceholder)
    .where(and(eq(tripPlaceholder.tripId, pass.tripId), isNull(tripPlaceholder.claimedAt)));
  return open.some((placeholder) => inviteTokenHash(placeholder.token) === pass.tokenHash);
}

/**
 * Invite way of variant B (§0.12.5 Nr. 9): the signed-out person on /i/<token> agreed to the
 * short privacy notice and asks for a code – the invite pass remembers the invitation (hash of
 * the token, trip id) and the consent until the account is created.
 */
export async function writeInvitePass(token: string, tripId: string): Promise<void> {
  if (!isInviteTokenShape(token)) return;
  const pass: InvitePass = {
    v: 1,
    iat: Date.now(),
    tokenHash: inviteTokenHash(token),
    tripId,
    consent: BETA_CONSENT_VERSION,
    consentAt: Date.now(),
  };
  (await cookies()).set(INVITE_PASS_COOKIE, signInvitePass(pass, secret()), cookieOptions());
}

export interface BetaAccountFields {
  betaConsentVersion: string;
  betaConsentAt: Date;
  betaSignupVia: "code" | "invite";
}

/**
 * The only gate for new accounts in beta (§0.12.5 Nr. 5) – Better Auth's
 * `databaseHooks.user.create.before`, so it covers every way in (code, magic link, invite,
 * placeholder link, future ways). Fail closed: without (a) a beta pass with consent or (b) –
 * variant B, kill switch `BETA_INVITE_SIGNUP` – an invite pass with consent for an invitation
 * that is still valid, no account. Under the account limit only.
 *
 * Known limit: the account count is not serialised with the insert – two sign-ups in the same
 * instant can pass at 49 (accepted for a 50-person beta).
 */
export async function enforceBetaSignup(
  headers: Headers | undefined,
): Promise<BetaAccountFields | null> {
  if (!isBeta()) return null;
  const cookie = headers?.get("cookie");
  const betaPass = readBetaPass(readCookie(cookie, BETA_PASS_COOKIE), secret(), configuredCodes());
  let via: "code" | "invite" | null = null;
  let consentAt: number | null = null;
  if (betaPass?.consent === BETA_CONSENT_VERSION) {
    via = "code";
    consentAt = betaPass.consentAt;
  } else if (betaInviteSignupEnabled(process.env)) {
    const invitePass = readInvitePass(readCookie(cookie, INVITE_PASS_COOKIE), secret());
    if (invitePass?.consent === BETA_CONSENT_VERSION && (await inviteStillValid(invitePass))) {
      via = "invite";
      consentAt = invitePass.consentAt;
    }
  }
  if (!via) {
    console.warn("beta_signup.denied");
    throw new APIError("FORBIDDEN", {
      code: BETA_SIGNUP_REQUIRED,
      message: "A beta code is needed to create an account",
    });
  }
  if (await betaIsFull()) {
    console.warn("beta_signup.denied");
    throw new APIError("FORBIDDEN", { code: BETA_FULL, message: "The beta is full" });
  }
  console.info(`beta_signup.${via}`);
  return {
    betaConsentVersion: BETA_CONSENT_VERSION,
    betaConsentAt: new Date(consentAt ?? Date.now()),
    betaSignupVia: via,
  };
}

/** Pass cookies are spent once the account exists (Max-Age=0). */
export const PASS_COOKIES = [BETA_PASS_COOKIE, INVITE_PASS_COOKIE] as const;

/**
 * Quota guard for code mails (§0.12.5 Nr. 4): in beta, mails to addresses WITHOUT an account
 * and WITHOUT a beta/invite pass are capped at 30 a day for the whole beta. Returns false when
 * the mail must be skipped silently (same answer to the client – no enumeration).
 */
export async function signupMailAllowed(
  email: string,
  headers: Headers | undefined,
): Promise<boolean> {
  if (!isBeta()) return true;
  const [existing] = await db()
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing) return true;
  const cookie = headers?.get("cookie");
  if (readBetaPass(readCookie(cookie, BETA_PASS_COOKIE), secret(), configuredCodes())) return true;
  if (readInvitePass(readCookie(cookie, INVITE_PASS_COOKIE), secret())) return true;
  const state = await takeLimit(BETA_SIGNUP_MAIL_LIMIT, GLOBAL);
  if (state.limited) {
    console.warn("mail.signup_capped");
    return false;
  }
  return true;
}

/**
 * Where a NEW account goes after its name/join step (W23 B.5): in beta once to the install
 * step `/install?next=…` (unless already seen), otherwise straight to `target`.
 */
export async function afterSignupTarget(userId: string, target: string): Promise<string> {
  if (!isBeta()) return target;
  const [row] = await db()
    .select({ seen: user.installHintSeenAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row || row.seen) return target;
  const params = new URLSearchParams({ next: target, first: "1" });
  return `/install?${params.toString()}`;
}
