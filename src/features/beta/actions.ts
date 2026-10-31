"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isBeta } from "@/lib/app-env";
import { betaInviteSignupEnabled } from "@/lib/beta-config";
import { toSafeInternalPath } from "@/lib/safe-path";
import { isInviteTokenShape } from "@/lib/tokens";
import { checkBetaCode, confirmBetaConsent, writeInvitePass } from "@/server/beta";
import { db } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { requestLimitSubject } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findInvite } from "@/server/trips";
import { betaPath } from "./paths";

export interface BetaCodeState {
  error?: "empty" | "wrong" | "rate" | "full" | "generic";
  minutes?: number;
  /** The typed value stays in the field after an error (ux-spec §5.1). */
  value?: string;
}

function nextOf(formData: FormData): string | undefined {
  const raw = formData.get("next");
  return typeof raw === "string" && raw ? toSafeInternalPath(raw, "/") : undefined;
}

/**
 * /beta step 1 (W23 A.3, deployment.md §0.12.5 Nr. 1): the code is checked on the server BEFORE
 * any mail goes out; a clear message at the field (a beta code reveals nothing about accounts).
 * Valid → beta pass cookie → step 2.
 */
export async function submitBetaCode(
  _previous: BetaCodeState,
  formData: FormData,
): Promise<BetaCodeState> {
  if (!isBeta()) return { error: "generic" };
  const raw = formData.get("code");
  const code = typeof raw === "string" ? raw.slice(0, 200) : "";
  const subject = await requestLimitSubject();
  if (!subject) return { error: "generic", value: code };
  const outcome = await checkBetaCode(code, subject);
  if (!outcome.ok) {
    return {
      error: outcome.error,
      value: code,
      ...(outcome.error === "rate" ? { minutes: outcome.minutes } : {}),
    };
  }
  redirect(betaPath("privacy", nextOf(formData)));
}

export interface BetaConsentState {
  error?: "consent" | "expired";
}

/**
 * /beta step 2 (W23 A.4): consent (version + time) goes into the beta pass and is stored with the
 * account once it is created → e-mail step of /login.
 */
export async function submitBetaConsent(
  _previous: BetaConsentState,
  formData: FormData,
): Promise<BetaConsentState> {
  if (!isBeta()) return { error: "expired" };
  if (formData.get("consent") !== "on") return { error: "consent" };
  if (!(await confirmBetaConsent())) return { error: "expired" };
  const next = nextOf(formData);
  redirect(`/login?from=beta${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

/**
 * Invite way, variant B (W23 A.8, §0.12.5 Nr. 9): before the code is requested on /i/<token>, the
 * signed-out person agreed to the short privacy notice – the invite pass remembers invitation
 * and consent until the account is created. Returns false when the invitation is not usable.
 */
export async function startInviteSignup(token: string, consent: boolean): Promise<boolean> {
  if (!isBeta() || !betaInviteSignupEnabled(process.env)) return true;
  if (!consent || !isInviteTokenShape(token)) return false;
  const invite = await findInvite(token);
  if (!invite) return false;
  await writeInvitePass(token, invite.id);
  return true;
}

/**
 * «Fertig – ist drauf» / «Später» on /install (W23 B.5): the one-off hint is done for this
 * account (server-side, because Safari and the installed app have separate storage).
 */
export async function markInstallHintSeen(next: string): Promise<void> {
  const session = await getSession();
  if (session) {
    await db()
      .update(user)
      .set({ installHintSeenAt: new Date() })
      .where(eq(user.id, session.user.id));
  }
  redirect(toSafeInternalPath(next, "/trips"));
}
