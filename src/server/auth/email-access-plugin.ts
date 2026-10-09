import { AsyncLocalStorage } from "node:async_hooks";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  createAuthMiddleware,
  getSessionFromCtx,
  isAPIError,
} from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { z } from "zod";
import { toSafeInternalPath } from "@/lib/safe-path";

/**
 * "email-access" – one request, ONE mail with a 6-digit code AND a magic link
 * (spike T1, docs/ops/spike-auth.md), plus the guards around all code/password flows:
 *
 * - **HTTP allow-list:** only the endpoints the browser really calls are reachable over
 *   `/api/auth/*`; everything else (sign-up by password, link-based reset, single-purpose
 *   senders, magic-link GET) answers 404. Server Actions call `auth().api.*` without a
 *   request object and are not affected.
 * - **Rate limits per e-mail address** (src/lib/email-limits.ts) for code mails and failed
 *   verifications, in addition to Better Auth's IP limits. A failure is reserved before the
 *   secret is checked (atomic, R-022) and only kept when a secret was really checked: a
 *   wrong password always, a wrong code only while a code was pending (R-021).
 * - **Remaining attempts** on a wrong code ("Noch 3 Versuche", Flow A.2) and the locked
 *   state right after the 5th wrong code.
 *
 * Verification itself stays 100 % Better Auth – no custom crypto.
 */

export interface AccessEmailPayload {
  email: string;
  code: string;
  /** Absolute URL of the scanner-safe landing page (`/auth/magic?token=…&next=…`). */
  magicLinkUrl: string;
  /** Validated internal path the user returns to after sign-in (e.g. `/i/<token>`). */
  returnTo: string;
  locale: string | undefined;
  headers: Headers | undefined;
}

export interface CodeMailPayload {
  email: string;
  code: string;
  /** Account of the signed-in user (e-mail change) – for the mail language. */
  userId: string | undefined;
}

type LimitDecision =
  { allowed: true } | { allowed: false; reason: "requests" | "locked"; retryAfterSeconds: number };

/** Per-address limits, injected so the plugin stays testable without a database. */
export interface EmailLimits {
  takeCodeRequest: (email: string) => Promise<void>;
  assertVerificationAllowed: (email: string) => Promise<void>;
  reserveVerificationAttempt: (email: string) => Promise<{ id: string; ifFailed: LimitDecision }>;
  releaseVerificationAttempt: (id: string) => Promise<void>;
  clearVerificationFailures: (email: string) => Promise<void>;
  rateLimitError: (decision: Extract<LimitDecision, { allowed: false }>) => APIError;
}

export interface EmailAccessOptions {
  sendAccessEmail: (payload: AccessEmailPayload) => Promise<void>;
  /** "Forgot password" code (Flow H.3). */
  sendPasswordResetEmail: (payload: CodeMailPayload) => Promise<void>;
  /** Code to the NEW address when changing the e-mail (Flow I.2). */
  sendChangeEmailEmail: (payload: CodeMailPayload) => Promise<void>;
  limits: EmailLimits;
  /** Server-side password rules for resets (length, leak list, optional HIBP). */
  validatePassword?: (
    password: string,
    email: string,
  ) => Promise<"tooShort" | "tooLong" | "common" | null>;
  /** Path of the page that turns the magic-link token into a session on click. */
  magicLandingPath?: string;
  /** Code + link validity in seconds (F-040: 15 min). */
  expiresIn?: number;
}

interface Collected {
  otp?: string;
  token?: string;
}

/** Code attempts per code (F-040: max. 5). */
export const CODE_ATTEMPTS = 5;

/**
 * The only Better Auth endpoints reachable over HTTP. Everything else is used server-side
 * from Server Actions (account settings, e-mail change) or not at all.
 */
export const HTTP_ALLOWED_PATHS = new Set([
  "/email-access/request", // code + magic link (sign-in / sign-up)
  "/sign-in/email-otp", // verify code
  "/sign-in/email", // password sign-in (F-041)
  "/email-otp/request-password-reset", // Flow H.3 step 1
  "/email-otp/reset-password", // Flow H.3 step 2
  "/get-session",
  "/sign-out",
  "/ok",
  "/error",
]);

/** Endpoints that check a secret for an address: per-address lock applies (body field). */
const VERIFY_PATHS: Record<string, "email" | "newEmail"> = {
  "/sign-in/email-otp": "email",
  "/sign-in/email": "email",
  "/email-otp/reset-password": "email",
  "/email-otp/change-email": "newEmail",
};

/** Endpoints that send a code mail to an address (body field). */
const SEND_PATHS: Record<string, "email" | "newEmail"> = {
  "/email-otp/request-password-reset": "email",
  "/email-otp/request-email-change": "newEmail",
};

/** Endpoints whose success signs in (clears the failure count of the address). */
const SIGN_IN_PATHS = new Set(["/sign-in/email-otp", "/sign-in/email"]);

/** OTP type per verification endpoint (for the remaining-attempts lookup). */
const OTP_TYPES: Record<string, string> = {
  "/sign-in/email-otp": "sign-in",
  "/email-otp/reset-password": "forget-password",
};

const requestBody = z.object({
  email: z.email(),
  /** Internal path to return to after sign-in; anything else falls back to "/". */
  callbackURL: z.string().max(512).optional(),
  locale: z.enum(["de", "en"]).optional(),
});

function bodyField(body: unknown, field: string): string | undefined {
  if (typeof body !== "object" || body === null || !(field in body)) return undefined;
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value.trim().toLowerCase() : undefined;
}

/**
 * Replaces the endpoint's error from an after-hook. Over HTTP a Response is returned:
 * Better Auth keeps the ORIGINAL status for errors thrown in after-hooks (e.g. 400 instead
 * of 429). Server-side calls get the APIError thrown (status and body intact). The hook
 * context has no `request`, so HTTP vs. server is decided by the matcher.
 */
function replaceError(http: boolean, error: APIError): Response {
  if (!http) throw error;
  const headers = new Headers(error.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(error.body), { status: error.statusCode, headers });
}

function errorCode(returned: unknown): string | undefined {
  if (!isAPIError(returned)) return undefined;
  const code = (returned.body as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}

export function emailAccess(options: EmailAccessOptions) {
  const expiresIn = options.expiresIn ?? 900;
  const landingPath = options.magicLandingPath ?? "/auth/magic";
  const collector = new AsyncLocalStorage<Collected>();
  const { limits } = options;

  const otpPlugin = emailOTP({
    otpLength: 6,
    expiresIn,
    allowedAttempts: CODE_ATTEMPTS,
    storeOTP: "hashed",
    resendStrategy: "rotate",
    disableSignUp: false,
    // Re-authentication happens before (Server Action, Flow I.2 step 1).
    changeEmail: { enabled: true, verifyCurrentEmail: false },
    sendVerificationOTP({ email, otp, type }, ctx) {
      const store = collector.getStore();
      if (store) {
        store.otp = otp;
        return Promise.resolve();
      }
      const userId = (ctx?.context as { session?: { user?: { id?: string } } } | undefined)?.session
        ?.user?.id;
      if (type === "forget-password" || type === "change-email") {
        // Not awaited: Better Auth only sends for existing accounts (reset) or free addresses
        // (e-mail change) and would otherwise await the SMTP round trip – a measurable
        // difference that reveals whether an account exists (F-041, no enumeration).
        const send =
          type === "forget-password"
            ? options.sendPasswordResetEmail({ email, code: otp, userId })
            : options.sendChangeEmailEmail({ email, code: otp, userId });
        send.catch((error: unknown) => {
          // Never log address or code.
          console.error(
            `email-otp: sending ${type} mail failed`,
            error instanceof Error ? error.message : "unknown",
          );
        });
        return Promise.resolve();
      }
      // Sign-in codes only through the combined flow (/email-access/request).
      return Promise.reject(new Error(`email-otp: no mail for type "${type}"`));
    },
  });

  const linkPlugin = magicLink({
    expiresIn,
    storeToken: "hashed",
    sendMagicLink({ token }) {
      const store = collector.getStore();
      if (!store) return Promise.reject(new Error("magic-link: use /email-access/request"));
      store.token = token;
      return Promise.resolve();
    },
  });

  /** Reserved failure per endpoint call (key: the call's auth context, same object in hooks). */
  const reservations = new WeakMap<object, { id: string; ifFailed: LimitDecision }>();

  /**
   * Before checking a secret: locked addresses are refused (429). Otherwise one failure is
   * reserved atomically (R-022) – for passwords always (every address alike, no
   * enumeration), for codes only while a code is pending (R-021: without one there is
   * nothing to guess, so such requests can't lock anybody out).
   */
  const beforeVerification = createAuthMiddleware(async (ctx) => {
    const field = VERIFY_PATHS[ctx.path];
    const email = field ? bodyField(ctx.body, field) : undefined;
    if (!email) return;
    // Identifier of the code this endpoint checks (Better Auth's `toOTPIdentifier`);
    // undefined = password, null = no code possible (e-mail change without session).
    let identifier: string | null | undefined;
    const type = OTP_TYPES[ctx.path];
    if (type) identifier = `${type}-otp-${email}`;
    else if (ctx.path === "/email-otp/change-email") {
      const session = await getSessionFromCtx(ctx);
      identifier = session ? `change-email-otp-${session.user.email.toLowerCase()}-${email}` : null;
    }
    if (identifier !== undefined) {
      const row = identifier
        ? await ctx.context.internalAdapter.findVerificationValue(identifier)
        : null;
      if (!row || row.expiresAt < new Date()) {
        await limits.assertVerificationAllowed(email);
        return;
      }
    }
    reservations.set(ctx.context, await limits.reserveVerificationAttempt(email));
  });

  /** Wrong code/password: keep the reserved failure, lock at the limit, add remaining attempts. */
  const afterVerification = (http: boolean) =>
    createAuthMiddleware(async (ctx) => {
      const path = ctx.path;
      const field = VERIFY_PATHS[path];
      const email = field ? bodyField(ctx.body, field) : undefined;
      const reservation = reservations.get(ctx.context);
      reservations.delete(ctx.context);
      if (!email) return;
      const returned = ctx.context.returned;
      const code = errorCode(returned);

      if (!isAPIError(returned)) {
        // Success: a correct secret clears the failure count of the address.
        if (SIGN_IN_PATHS.has(path)) await limits.clearVerificationFailures(email);
        else if (reservation) await limits.releaseVerificationAttempt(reservation.id);
        return;
      }
      if (!reservation) return;
      if (code !== "INVALID_OTP" && code !== "INVALID_EMAIL_OR_PASSWORD") {
        // Nothing was guessed (expired code, invalid input, …) – the attempt does not count.
        await limits.releaseVerificationAttempt(reservation.id);
        return;
      }
      if (!reservation.ifFailed.allowed) {
        return replaceError(http, limits.rateLimitError(reservation.ifFailed));
      }

      const type = OTP_TYPES[path];
      if (code === "INVALID_OTP" && type) {
        const identifier = `${type}-otp-${email}`;
        const row = await ctx.context.internalAdapter.findVerificationValue(identifier);
        if (!row) return; // code gone meanwhile (e.g. used in parallel) – plain "wrong code"
        const used = Number.parseInt(row.value.slice(row.value.lastIndexOf(":") + 1), 10) || 0;
        const remainingAttempts = Math.max(0, CODE_ATTEMPTS - used);
        if (remainingAttempts === 0) {
          // 5th wrong code: locked right away (Flow A.2) – the code is gone, a new one is needed.
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(identifier);
          return replaceError(
            http,
            new APIError("FORBIDDEN", { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" }),
          );
        }
        return replaceError(
          http,
          new APIError("BAD_REQUEST", {
            code: "INVALID_OTP",
            message: "Invalid OTP",
            remainingAttempts,
          }),
        );
      }
    });

  const accessPlugin = {
    id: "email-access",
    endpoints: {
      requestEmailAccess: createAuthEndpoint(
        "/email-access/request",
        { method: "POST", body: requestBody, requireHeaders: true },
        async (ctx) => {
          const email = ctx.body.email.toLowerCase();
          // Same budget for every address – known or not (no enumeration).
          await limits.takeCodeRequest(email);
          const returnTo = toSafeInternalPath(ctx.body.callbackURL, "/");
          const collected: Collected = {};
          // Same auth context + request headers as the incoming call (origin/CSRF checks).
          const inner = {
            context: ctx.context,
            headers: ctx.headers,
            ...(ctx.request ? { request: ctx.request } : {}),
          };

          await collector.run(collected, async () => {
            await otpPlugin.endpoints.sendVerificationOTP({
              ...inner,
              body: { email, type: "sign-in" },
            });
            await linkPlugin.endpoints.signInMagicLink({
              ...inner,
              body: { email, callbackURL: returnTo },
            });
          });

          if (collected.otp && collected.token) {
            const landing = new URL(landingPath, ctx.context.baseURL);
            landing.searchParams.set("token", collected.token);
            landing.searchParams.set("next", returnTo);
            // Do not await: identical response time for known/unknown addresses
            // (no account enumeration, tech-stack.md §3.2).
            ctx.context.runInBackground(
              options
                .sendAccessEmail({
                  email,
                  code: collected.otp,
                  magicLinkUrl: landing.toString(),
                  returnTo,
                  locale: ctx.body.locale,
                  headers: ctx.headers,
                })
                .catch((error: unknown) => {
                  // Never log address or code.
                  ctx.context.logger.error("email-access: sending mail failed", {
                    reason: error instanceof Error ? error.message : "unknown",
                  });
                }),
            );
          }
          return ctx.json({ success: true });
        },
      ),
    },
    hooks: {
      before: [
        {
          // HTTP allow-list (see HTTP_ALLOWED_PATHS). Server-side calls have no request.
          matcher: (context) =>
            context.request !== undefined &&
            context.path !== undefined &&
            !HTTP_ALLOWED_PATHS.has(context.path),
          handler: createAuthMiddleware(() => {
            throw new APIError("NOT_FOUND");
          }),
        },
        {
          // Same password rules as in the account (F-042) – also for "forgot password".
          matcher: (context) => context.path === "/email-otp/reset-password",
          handler: createAuthMiddleware(async (ctx) => {
            const password: unknown = (ctx.body as { password?: unknown } | undefined)?.password;
            const email = bodyField(ctx.body, "email");
            if (!options.validatePassword || typeof password !== "string" || !email) return;
            const problem = await options.validatePassword(password, email);
            if (problem) {
              throw new APIError("BAD_REQUEST", {
                code:
                  problem === "common"
                    ? "PASSWORD_COMMON"
                    : problem === "tooLong"
                      ? "PASSWORD_TOO_LONG"
                      : "PASSWORD_TOO_SHORT",
                message: "Password not accepted",
              });
            }
          }),
        },
        {
          // Code mails outside the combined flow (reset, e-mail change) share the budget.
          matcher: (context) => context.path !== undefined && context.path in SEND_PATHS,
          handler: createAuthMiddleware(async (ctx) => {
            const email = bodyField(ctx.body, SEND_PATHS[ctx.path] ?? "email");
            if (email) await limits.takeCodeRequest(email);
          }),
        },
        {
          // Last: lock check + reserved failure right before the secret is checked.
          matcher: (context) => context.path !== undefined && context.path in VERIFY_PATHS,
          handler: beforeVerification,
        },
      ],
      after: [
        {
          matcher: (context) =>
            context.request !== undefined &&
            context.path !== undefined &&
            context.path in VERIFY_PATHS,
          handler: afterVerification(true),
        },
        {
          matcher: (context) =>
            context.request === undefined &&
            context.path !== undefined &&
            context.path in VERIFY_PATHS,
          handler: afterVerification(false),
        },
        {
          // The magic link proves the mailbox: it always signs in, even while the address is
          // locked, and lifts the lock (R-021).
          matcher: (context) => context.path === "/magic-link/verify",
          handler: createAuthMiddleware(async (ctx) => {
            const email = ctx.context.newSession?.user.email;
            if (email) await limits.clearVerificationFailures(email.toLowerCase());
          }),
        },
        {
          // "Keep me signed in" is built into password login only. For code login
          // the client sends `rememberMe: false` to get a browser-session cookie
          // (no Max-Age). Default (field missing) = remember (ux-spec §4.4, CEO 2026-10-08).
          matcher: (context) => context.path === "/sign-in/email-otp",
          handler: createAuthMiddleware(async (ctx) => {
            const body: unknown = ctx.body;
            const rememberMe =
              typeof body === "object" && body !== null && "rememberMe" in body
                ? body.rememberMe
                : undefined;
            const newSession = ctx.context.newSession;
            if (rememberMe === false && newSession) {
              // Same semantics as Better Auth's password login with rememberMe=false:
              // 1-day server-side lifetime + cookie without Max-Age (ends with the browser).
              const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
              const updated = await ctx.context.internalAdapter.updateSession(
                newSession.session.token,
                { expiresAt },
              );
              await setSessionCookie(
                ctx,
                { user: newSession.user, session: updated ?? { ...newSession.session, expiresAt } },
                true,
              );
            }
          }),
        },
      ],
    },
    rateLimit: [
      {
        pathMatcher: (path: string) => path === "/email-access/request",
        window: 60,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;

  return [otpPlugin, linkPlugin, accessPlugin] as const;
}
