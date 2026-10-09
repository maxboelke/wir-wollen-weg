"use server";

import { isAPIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  isLocale,
  LOCALE_CHOSEN_COOKIE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from "@/i18n/config";
import { retryAfterMinutes } from "@/lib/email-limits";
import { MOTION_COOKIE } from "@/lib/motion";
import { isCountry, isSubdivisionOf, isWeekStart } from "@/lib/region";
import {
  checkPassword,
  clearReauthentication,
  isReauthenticated,
  markReauthenticated,
  removePassword,
  storePassword,
} from "@/server/account";
import { auth } from "@/server/auth";
import { validateNewPassword } from "@/server/auth/breach-check";
import { CODE_ATTEMPTS } from "@/server/auth/email-access-plugin";
import {
  assertVerificationAllowed,
  releaseVerificationAttempt,
  reserveVerificationAttempt,
  takeCodeRequest,
} from "@/server/auth/email-limit-store";
import { db } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { serverEnv } from "@/server/env";
import { renderEmailChangedEmail, renderReauthEmail } from "@/server/mail/templates";
import { sendLocalizedMail } from "@/server/mail/transport";
import { getSession, type Session } from "@/server/session";

export type AccountError =
  | "generic"
  | "nameRequired"
  | "invalidEmail"
  | "sameEmail"
  | "wrongCode"
  | "codeLength"
  | "tooManyAttempts"
  | "expired"
  | "rateLimited"
  | "locked"
  | "passwordWrong"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordCommon"
  | "reauthExpired";

export interface AccountResult {
  ok?: boolean;
  error?: AccountError;
  /** Wrong code: attempts left for this code (Flow A.2). */
  remainingAttempts?: number;
  /** Rate limit / lock: wait time in whole minutes. */
  minutes?: number;
}

const emailSchema = z.email().max(254);
const codeSchema = z.string().regex(/^\d{6}$/);
const nameSchema = z.string().trim().min(1).max(40);

async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return session;
}

function localeOf(session: Session) {
  return isLocale(session.user.locale) ? session.user.locale : "en";
}

/** Better Auth / limit errors → message keys. */
function fromAuthError(error: unknown): AccountResult {
  if (!isAPIError(error)) throw error;
  const body = (error.body ?? {}) as {
    code?: string;
    retryAfter?: number;
    remainingAttempts?: number;
  };
  if (error.statusCode === 429) {
    return {
      error: body.code === "EMAIL_LOCKED" ? "locked" : "rateLimited",
      minutes: retryAfterMinutes(body.retryAfter ?? 60),
    };
  }
  switch (body.code) {
    case "INVALID_OTP":
      return body.remainingAttempts === undefined
        ? { error: "wrongCode" }
        : { error: "wrongCode", remainingAttempts: body.remainingAttempts };
    case "OTP_EXPIRED":
      return { error: "expired" };
    case "TOO_MANY_ATTEMPTS":
      return { error: "tooManyAttempts" };
    case "INVALID_EMAIL":
      return { error: "invalidEmail" };
    default:
      return { error: "generic" };
  }
}

// ---------------------------------------------------------------------------
// Profile, language & region, appearance (W13, F-043/F-046/F-052)
// ---------------------------------------------------------------------------

export async function updateName(
  _previous: AccountResult,
  formData: FormData,
): Promise<AccountResult> {
  await requireSession();
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: "nameRequired" };
  await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  return { ok: true };
}

const regionSchema = z.object({
  country: z.string(),
  subdivision: z.string().nullable(),
  weekStart: z.string(),
});

/** Region, holiday region and week start – saved immediately (Flow I.1 #2). */
export async function updateRegion(input: z.infer<typeof regionSchema>): Promise<AccountResult> {
  const session = await requireSession();
  const parsed = regionSchema.safeParse(input);
  if (!parsed.success) return { error: "generic" };
  const { country, subdivision, weekStart } = parsed.data;
  if (!isCountry(country) || !isWeekStart(weekStart)) return { error: "generic" };
  // A subdivision of another country is dropped (country changed → nationwide).
  const validSubdivision = isSubdivisionOf(country, subdivision) ? subdivision : null;
  await db()
    .update(user)
    .set({ country, subdivision: validSubdivision, weekStart })
    .where(eq(user.id, session.user.id));
  return { ok: true };
}

/**
 * "Reduce motion" (Q17 a, ux-spec §7.5): stored in the account; the client also sets the
 * `ww-motion` cookie so the very first frame after loading is right on this device.
 */
export async function updateReduceMotion(reduce: boolean): Promise<AccountResult> {
  const session = await requireSession();
  await db().update(user).set({ reduceMotion: reduce }).where(eq(user.id, session.user.id));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sign out (Flow H.2)
// ---------------------------------------------------------------------------

/**
 * After signing out, the landing page keeps the account language and shows the snackbar
 * «Du bist abgemeldet.» (one-shot cookie read by the client).
 */
async function afterSignOut(session: Session | null): Promise<never> {
  const store = await cookies();
  const locale = session && isLocale(session.user.locale) ? session.user.locale : undefined;
  if (locale) {
    const options = {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    } as const;
    store.set(LOCALE_COOKIE, locale, options);
    const chosenAt = session?.user.localeChosenAt;
    if (chosenAt) store.set(LOCALE_CHOSEN_COOKIE, String(new Date(chosenAt).getTime()), options);
  }
  // Same for motion: the account choice stays on this device (ux-spec §7.5).
  if (session?.user.reduceMotion) {
    store.set(MOTION_COOKIE, "reduce", {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }
  store.set("ww-flash", "signed-out", { maxAge: 60, sameSite: "lax", path: "/" });
  redirect(`/${locale ?? "en"}`);
}

export async function signOut(): Promise<void> {
  const session = await getSession();
  await auth().api.signOut({ headers: await headers() });
  await afterSignOut(session);
}

/** «Auf allen Geräten abmelden» – ends every session including this one → /login. */
export async function signOutEverywhere(): Promise<void> {
  await requireSession();
  const requestHeaders = await headers();
  await auth().api.revokeSessions({ headers: requestHeaders });
  await auth().api.signOut({ headers: requestHeaders });
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Password (F-042, /account/password and the optional field on sign-up)
// ---------------------------------------------------------------------------

/**
 * Setting, changing or removing the password changes how the account signs in – like the
 * e-mail change it needs a fresh confirmation (R-023): code or current password within the
 * last 10 minutes, or a code/magic-link sign-in within the last 10 minutes (sign-up name
 * step). Otherwise a stolen session could set a password and use it to confirm an e-mail
 * change (account takeover).
 */
export async function savePassword(password: string): Promise<AccountResult> {
  const session = await requireSession();
  if (!(await isReauthenticated(session.session.id))) return { error: "reauthExpired" };
  const problem = await validateNewPassword(password, session.user.email);
  if (problem === "tooShort") return { error: "passwordTooShort" };
  if (problem === "tooLong") return { error: "passwordTooLong" };
  if (problem === "common") return { error: "passwordCommon" };
  await storePassword(session.user.id, password);
  return { ok: true };
}

export async function deletePassword(): Promise<AccountResult> {
  const session = await requireSession();
  if (!(await isReauthenticated(session.session.id))) return { error: "reauthExpired" };
  await removePassword(session.user.id);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Re-authentication + e-mail change (Flow I.2, W13)
// ---------------------------------------------------------------------------

/** Step 1: code to the CURRENT address. */
export async function sendReauthCode(): Promise<AccountResult> {
  const session = await requireSession();
  const email = session.user.email;
  try {
    await takeCodeRequest(email);
    const otp = await auth().api.createVerificationOTP({
      body: { email, type: "email-verification" },
    });
    const locale = localeOf(session);
    await sendLocalizedMail(email, locale, renderReauthEmail({ locale, code: otp }));
    return { ok: true };
  } catch (error) {
    return fromAuthError(error);
  }
}

/** Step 1: confirm with the code (or the password, below). */
export async function verifyReauthCode(code: string): Promise<AccountResult> {
  const session = await requireSession();
  if (!codeSchema.safeParse(code).success) return { error: "codeLength" };
  const email = session.user.email;
  const identifier = `email-verification-otp-${email}`;
  const context = await auth().$context;
  // A wrong code only counts while one is pending (R-021); the failure is reserved before
  // the check so parallel guesses can't exceed the limit (R-022).
  let reservation: Awaited<ReturnType<typeof reserveVerificationAttempt>> | undefined;
  try {
    const pending = await context.internalAdapter.findVerificationValue(identifier);
    if (pending && pending.expiresAt > new Date()) {
      reservation = await reserveVerificationAttempt(email);
    } else await assertVerificationAllowed(email);
    await auth().api.checkVerificationOTP({
      body: { email, type: "email-verification", otp: code },
    });
  } catch (error) {
    const result = fromAuthError(error);
    if (!reservation) return result;
    if (result.error !== "wrongCode") {
      await releaseVerificationAttempt(reservation.id);
      return result;
    }
    if (!reservation.ifFailed.allowed) {
      return {
        error: "locked",
        minutes: retryAfterMinutes(reservation.ifFailed.retryAfterSeconds),
      };
    }
    const row = await context.internalAdapter.findVerificationValue(identifier);
    const used = row
      ? Number.parseInt(row.value.slice(row.value.lastIndexOf(":") + 1), 10) || 0
      : 0;
    const remainingAttempts = Math.max(0, CODE_ATTEMPTS - used);
    if (row && remainingAttempts === 0) {
      await context.internalAdapter.deleteVerificationByIdentifier(identifier);
      return { error: "tooManyAttempts" };
    }
    return { error: "wrongCode", remainingAttempts };
  }
  if (reservation) await releaseVerificationAttempt(reservation.id);
  // Single use: the code is spent once it confirmed the person.
  await context.internalAdapter.deleteVerificationByIdentifier(identifier);
  await markReauthenticated(session.session.id);
  return { ok: true };
}

export async function verifyReauthPassword(password: string): Promise<AccountResult> {
  const session = await requireSession();
  const email = session.user.email;
  let reservation: Awaited<ReturnType<typeof reserveVerificationAttempt>>;
  try {
    reservation = await reserveVerificationAttempt(email);
  } catch (error) {
    return fromAuthError(error);
  }
  if (!(await checkPassword(session.user.id, password))) {
    if (!reservation.ifFailed.allowed) {
      return {
        error: "locked",
        minutes: retryAfterMinutes(reservation.ifFailed.retryAfterSeconds),
      };
    }
    return { error: "passwordWrong" };
  }
  await releaseVerificationAttempt(reservation.id);
  await markReauthenticated(session.session.id);
  return { ok: true };
}

/** Step 2: code to the NEW address (neutral if it belongs to another account). */
export async function requestEmailChange(newEmail: string): Promise<AccountResult> {
  const session = await requireSession();
  const parsed = emailSchema.safeParse(newEmail.trim().toLowerCase());
  if (!parsed.success) return { error: "invalidEmail" };
  if (parsed.data === session.user.email.toLowerCase()) return { error: "sameEmail" };
  if (!(await isReauthenticated(session.session.id))) return { error: "reauthExpired" };
  try {
    await auth().api.requestEmailChangeEmailOTP({
      body: { newEmail: parsed.data },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return fromAuthError(error);
  }
}

/** Step 3: confirm the new address; the old one gets an info mail (F-042). */
export async function confirmEmailChange(newEmail: string, code: string): Promise<AccountResult> {
  const session = await requireSession();
  if (!codeSchema.safeParse(code).success) return { error: "codeLength" };
  if (!(await isReauthenticated(session.session.id))) return { error: "reauthExpired" };
  const oldEmail = session.user.email;
  try {
    await auth().api.changeEmailEmailOTP({
      body: { newEmail: newEmail.trim().toLowerCase(), otp: code },
      headers: await headers(),
    });
  } catch (error) {
    return fromAuthError(error);
  }
  await clearReauthentication(session.session.id);
  const locale = localeOf(session);
  await sendLocalizedMail(
    oldEmail,
    locale,
    renderEmailChangedEmail({ locale, newEmail, contact: serverEnv().CONTACT_EMAIL }),
  ).catch((error: unknown) => {
    console.error(
      "account: info mail to old address failed",
      error instanceof Error ? error.message : "",
    );
  });
  return { ok: true };
}
