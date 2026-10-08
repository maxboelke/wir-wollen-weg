import { AsyncLocalStorage } from "node:async_hooks";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint, createAuthMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { z } from "zod";
import { toSafeInternalPath } from "@/lib/safe-path";

/**
 * "email-access" – one request, ONE mail with a 6-digit code AND a magic link
 * (spike T1, docs/ops/spike-auth.md).
 *
 * Better Auth's `emailOTP` and `magicLink` plugins each send their own mail.
 * This plugin calls both endpoints in-process inside an AsyncLocalStorage scope;
 * their `send*` callbacks only *collect* the code and the link, then a single
 * combined mail is sent. Verification stays 100 % Better Auth
 * (`/sign-in/email-otp`, `/magic-link/verify`) – no custom crypto.
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

export interface EmailAccessOptions {
  sendAccessEmail: (payload: AccessEmailPayload) => Promise<void>;
  /** Path of the page that turns the magic-link token into a session on click. */
  magicLandingPath?: string;
  /** Code + link validity in seconds (F-040: 15 min). */
  expiresIn?: number;
}

interface Collected {
  otp?: string;
  token?: string;
}

/**
 * Better Auth endpoints that would send (or try to send) a mail outside the combined flow.
 * The password-reset/email-change senders stay blocked until Increment 1 gives them their
 * own mails – otherwise they create verification rows and error logs only for existing
 * accounts (side channel, log spam).
 */
const BLOCKED_PATHS = new Set([
  "/email-otp/send-verification-otp",
  "/sign-in/magic-link",
  "/email-otp/request-password-reset",
  "/forget-password/email-otp",
  "/email-otp/request-email-change",
]);

const requestBody = z.object({
  email: z.email(),
  /** Internal path to return to after sign-in; anything else falls back to "/". */
  callbackURL: z.string().max(512).optional(),
  locale: z.enum(["de", "en"]).optional(),
});

export function emailAccess(options: EmailAccessOptions) {
  const expiresIn = options.expiresIn ?? 900;
  const landingPath = options.magicLandingPath ?? "/auth/magic";
  const collector = new AsyncLocalStorage<Collected>();

  const otpPlugin = emailOTP({
    otpLength: 6,
    expiresIn,
    allowedAttempts: 5,
    storeOTP: "hashed",
    resendStrategy: "rotate",
    disableSignUp: false,
    sendVerificationOTP({ otp }) {
      const store = collector.getStore();
      if (!store) {
        // Only the combined flow may issue codes. Other OTP types
        // (email change, password reset) get their own mails in Increment 1.
        return Promise.reject(new Error("email-otp: use /email-access/request"));
      }
      store.otp = otp;
      return Promise.resolve();
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

  const accessPlugin = {
    id: "email-access",
    endpoints: {
      requestEmailAccess: createAuthEndpoint(
        "/email-access/request",
        { method: "POST", body: requestBody, requireHeaders: true },
        async (ctx) => {
          const email = ctx.body.email.toLowerCase();
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
          // The single-purpose senders would bypass the combined mail – hide them.
          matcher: (context) =>
            context.path !== undefined &&
            (BLOCKED_PATHS.has(context.path) ||
              // Magic links are redeemed by POST only (Server Action redeemMagicLink, Flow
              // H.5, R-006): over HTTP the GET verify endpoint would let link scanners burn
              // the token. Server-side calls (no request object) stay allowed.
              (context.path === "/magic-link/verify" && context.request !== undefined)),
          handler: createAuthMiddleware(() => {
            throw new APIError("NOT_FOUND");
          }),
        },
      ],
      after: [
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
