"use server";

import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AuthErrorKey } from "./auth-errors";
import { inviteTokenFromPath, toSafeInternalPath } from "@/lib/safe-path";
import { auth, withTrustedClientIp } from "@/server/auth";
import { getSession } from "@/server/session";
import { afterSignupTarget } from "@/server/beta";
import { startTargetFor } from "@/server/start";

export interface ActionResult {
  error?: Extract<
    AuthErrorKey,
    | "nameRequired"
    | "generic"
    | "joinFull"
    | "joinClosed"
    | "joinInvalid"
    | "joinRateLimited"
    | "nameTaken"
    | "tripInvalid"
  >;
  /** Free alternative when the name is taken in the trip (F-003: «Kemal B.»). */
  suggestion?: string;
  /** Wait time for `joinRateLimited`. */
  minutes?: number;
}

const nameSchema = z.string().trim().min(1).max(40);

/** Name step for new accounts on /login (Flow H.1). */
export async function saveName(returnTo: string, name: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };

  const isNew = !session.user.name;
  await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  const target = toSafeInternalPath(returnTo, "/");
  // The app start (W16 v2.18) – resolved here, so the browser follows ONE redirect.
  const resolved = target === "/" ? await startTargetFor(session.user.id) : target;
  // Friends beta: a new account sees the install step once (W23 B.5).
  redirect(isNew ? await afterSignupTarget(session.user.id, resolved) : resolved);
}

/** Form variant of saveName for the server-rendered name step on /login. */
export async function saveNameFormAction(
  returnTo: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name");
  return saveName(returnTo, typeof name === "string" ? name : "");
}

export interface MagicLinkResult {
  /**
   * "invalid": expired, used or unknown token (H.5 3b) · "generic": server error (3e) ·
   * "betaMissing"/"betaFull": friends beta refused the new account (W23 A.5).
   */
  error?: "invalid" | "generic" | "betaMissing" | "betaFull";
}

/** Error code Better Auth put into the redirect of a failed magic-link verification. */
function redirectErrorCode(error: unknown): string | null {
  if (!isAPIError(error)) return null;
  const headers: unknown = error.headers;
  const location = headers instanceof Headers ? headers.get("location") : null;
  if (!location) return null;
  try {
    return new URL(location, "http://internal.invalid").searchParams.get("error");
  } catch {
    return null;
  }
}

const magicTokenSchema = z.string().min(1).max(256);

/**
 * "Sign in now" on /auth/magic (Flow H.5, R-006): redeems the magic-link token by POST only,
 * so link scanners that prefetch the GET page can't burn it. Better Auth verifies and
 * consumes the token and sets the session cookie (nextCookies plugin); the HTTP GET
 * endpoint /api/auth/magic-link/verify is blocked (email-access-plugin.ts).
 */
export async function redeemMagicLink(
  _previous: MagicLinkResult,
  formData: FormData,
): Promise<MagicLinkResult> {
  const token = magicTokenSchema.safeParse(formData.get("token"));
  const rawNext = formData.get("next");
  const next = toSafeInternalPath(typeof rawNext === "string" ? rawNext : undefined, "/");
  if (!token.success) return { error: "invalid" };

  // Session IP only from the trusted proxy header, never a client-sent one (R-010).
  const requestHeaders = withTrustedClientIp(await headers());
  let user: { id: string; name: string };
  try {
    const previous = await auth().api.getSession({ headers: requestHeaders });
    const result = await auth().api.magicLinkVerify({
      query: { token: token.data },
      headers: requestHeaders,
    });
    user = result.user;
    // The new session replaces the previous one in this browser (H.5 3c/3d) – end the old one.
    if (previous && previous.session.token !== result.token) {
      const context = await auth().$context;
      await context.internalAdapter.deleteSession(previous.session.token);
    }
  } catch (error) {
    // Better Auth answers invalid/expired/used tokens with a redirect carrying ?error=…
    if (isAPIError(error) && error.status === "FOUND") {
      const code = redirectErrorCode(error);
      if (code === "BETA_SIGNUP_REQUIRED") return { error: "betaMissing" };
      if (code === "BETA_FULL") return { error: "betaFull" };
      return { error: "invalid" };
    }
    console.error("magic link: verification failed", error instanceof Error ? error.message : "");
    return { error: "generic" };
  }

  // New account without a name: name step first (H.5 3a). On invites it is the join step.
  if (!user.name && !inviteTokenFromPath(next)) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  redirect(next === "/" ? await startTargetFor(user.id) : next);
}
