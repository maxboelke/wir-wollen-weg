import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { isLocale, LOCALE_CHOSEN_COOKIE, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { negotiateLocale } from "@/i18n/negotiate";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { regionFromAcceptLanguage } from "@/lib/region";
import { readCookie } from "@/lib/cookies";
import { inviteTokenFromPath } from "@/lib/safe-path";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { serverEnv } from "../env";
import {
  renderAccessEmail,
  renderChangeEmailEmail,
  renderPasswordResetEmail,
} from "../mail/templates";
import { sendLocalizedMail } from "../mail/transport";
import { findTripByInviteToken } from "../trips";
import { validateNewPassword } from "./breach-check";
import { CLIENT_IP_HEADER, parseTrustedProxies, resolveClientIp } from "./client-ip";
import { emailAccess, type AccessEmailPayload, type CodeMailPayload } from "./email-access-plugin";
import * as emailLimits from "./email-limit-store";
import { hashPassword, verifyPassword } from "./password-hash";
import { MAILBOX_SIGN_IN_PATHS, markReauthenticatedIn } from "./reauth";

const SESSION_DAYS = 90;

/** Language of the UI that triggered a request (signed out): cookie → Accept-Language. */
function requestLocale(headers: Headers | undefined): Locale {
  return negotiateLocale({
    cookie: readCookie(headers?.get("cookie"), LOCALE_COOKIE),
    acceptLanguage: headers?.get("accept-language"),
  });
}

/** Account language of an address, if an account exists (mails "danach in Kontosprache", F.3). */
async function accountLocale(
  where: { email: string } | { id: string },
): Promise<Locale | undefined> {
  const [row] = await db()
    .select({ locale: schema.user.locale })
    .from(schema.user)
    .where("email" in where ? eq(schema.user.email, where.email) : eq(schema.user.id, where.id))
    .limit(1);
  return isLocale(row?.locale) ? row.locale : undefined;
}

async function sendAccessEmail(payload: AccessEmailPayload): Promise<void> {
  // New address: language of the UI that asked for the code; existing account: its language.
  const locale =
    (await accountLocale({ email: payload.email })) ??
    (isLocale(payload.locale) ? payload.locale : requestLocale(payload.headers));
  const inviteToken = inviteTokenFromPath(payload.returnTo);
  const trip = inviteToken ? await findTripByInviteToken(inviteToken) : undefined;
  await sendLocalizedMail(
    payload.email,
    locale,
    renderAccessEmail({
      locale,
      code: payload.code,
      magicLinkUrl: payload.magicLinkUrl,
      tripName: trip?.name,
    }),
  );
}

async function sendPasswordResetEmail({ email, code }: CodeMailPayload): Promise<void> {
  const locale = (await accountLocale({ email })) ?? "en";
  await sendLocalizedMail(email, locale, renderPasswordResetEmail({ locale, code }));
}

async function sendChangeEmailEmail({ email, code, userId }: CodeMailPayload): Promise<void> {
  const locale = (userId ? await accountLocale({ id: userId }) : undefined) ?? "en";
  await sendLocalizedMail(email, locale, renderChangeEmailEmail({ locale, code, newEmail: email }));
}

/** Explicit language choice made in this browser (cookie pair, Flow F.3). */
function browserLanguageChoice(headers: Headers | undefined) {
  const cookie = headers?.get("cookie");
  const locale = readCookie(cookie, LOCALE_COOKIE);
  const at = Number(readCookie(cookie, LOCALE_CHOSEN_COOKIE));
  // The cookie is client-controlled: a time in the future (or beyond the Date range) would
  // win every later choice or crash the account update – only accept past timestamps.
  const valid = Number.isFinite(at) && at > 0 && at <= Date.now() + 60_000;
  return isLocale(locale) && valid ? { locale, at: new Date(at) } : null;
}

function createAuth() {
  const env = serverEnv();
  const baseURL = env.BETTER_AUTH_URL ?? env.APP_URL;

  return betterAuth({
    appName: "wir-wollen-weg",
    baseURL,
    // Build without real secret (CI build job sets a random one); runtime requires it.
    ...(env.BETTER_AUTH_SECRET ? { secret: env.BETTER_AUTH_SECRET } : {}),
    trustedOrigins: [
      baseURL,
      ...(env.AUTH_TRUSTED_ORIGINS?.split(",")
        .map((o) => o.trim())
        .filter(Boolean) ?? []),
    ],
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        rateLimit: schema.rateLimit,
      },
    }),
    user: {
      // Account settings (F-043, F-046, F-052) – changed only via Server Actions (input: false).
      additionalFields: {
        locale: { type: "string", required: false, defaultValue: "en", input: false },
        localeChosenAt: { type: "date", required: false, input: false },
        country: { type: "string", required: false, defaultValue: "GB", input: false },
        subdivision: { type: "string", required: false, input: false },
        weekStart: { type: "string", required: false, defaultValue: "auto", input: false },
        reduceMotion: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },
    // Optional password (F-040/F-042). Never a sign-up path of its own: accounts are created
    // by code (e-mail verified first); /sign-up/email is disabled and not reachable over HTTP.
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      revokeSessionsOnPasswordReset: true, // F-042: reset ends all other sessions
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => verifyPassword(hash, password),
      },
    },
    databaseHooks: {
      user: {
        create: {
          // New accounts take the language currently shown and a region guessed from the
          // browser (F-040, Flow F.1/F.3) – silently, changeable in the account.
          before: (user, context) => {
            const headers = context?.headers;
            const choice = browserLanguageChoice(headers);
            const locale = choice?.locale ?? requestLocale(headers);
            return Promise.resolve({
              data: {
                ...user,
                locale,
                localeChosenAt: choice?.at ?? null,
                country: regionFromAcceptLanguage(headers?.get("accept-language"), locale),
              },
            });
          },
        },
      },
      session: {
        create: {
          // "The latest explicit choice wins" (Flow F.3): a language picked in this browser
          // after the account's last choice updates the account at sign-in.
          after: async (session, context) => {
            // A code or magic-link sign-in just proved the mailbox: counts as confirmation
            // for changing sign-in methods for 10 minutes (R-023, e.g. the optional
            // password in the sign-up name step).
            if (context?.path && MAILBOX_SIGN_IN_PATHS.has(context.path)) {
              await markReauthenticatedIn(context.context.internalAdapter, session.id);
            }
            const choice = browserLanguageChoice(context?.headers);
            if (!choice) return;
            const [account] = await db()
              .select({ locale: schema.user.locale, chosenAt: schema.user.localeChosenAt })
              .from(schema.user)
              .where(eq(schema.user.id, session.userId))
              .limit(1);
            if (!account || account.locale === choice.locale) return;
            if (account.chosenAt && account.chosenAt >= choice.at) return;
            await db()
              .update(schema.user)
              .set({ locale: choice.locale, localeChosenAt: choice.at })
              .where(eq(schema.user.id, session.userId));
          },
        },
      },
    },
    session: {
      // "Keep me signed in": 90 days, rolling (PRD §8, tech-stack.md §3.2).
      expiresIn: 60 * 60 * 24 * SESSION_DAYS,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: env.RATE_LIMIT_ENABLED,
      storage: "database",
      // Key = IP resolved by handleAuthRequest (R-005); see client-ip.ts.
      // Per e-mail address: email-limit-store.ts (always on).
      customRules: {
        "/sign-in/email-otp": { window: 60, max: 10 },
        "/sign-in/email": { window: 60, max: 10 },
      },
    },
    advanced: {
      cookiePrefix: "ww",
      // Only the header written by handleAuthRequest – never a client-supplied one (R-005).
      // IPv6 limits per /64 network, like the app limits (R-036; also Better Auth's default).
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER], ipv6Subnet: 64 },
      database: { generateId: false }, // PostgreSQL generates UUIDv7 (schema.ts)
      // First-party cookies only, SameSite=Lax – NOT Strict: links from WhatsApp/mail are
      // cross-site navigations and must still carry the session (tech-stack.md §3.3).
      defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
    },
    telemetry: { enabled: false },
    plugins: [
      ...emailAccess({
        sendAccessEmail,
        sendPasswordResetEmail,
        sendChangeEmailEmail,
        limits: emailLimits,
        validatePassword: validateNewPassword,
        magicLandingPath: "/auth/magic",
        expiresIn: 900,
      }),
      nextCookies(), // must stay last: applies Set-Cookie inside Server Actions
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { __wwwAuth?: Auth };

const LOOPBACK = "127.0.0.1";
let ipConfig: Parameters<typeof resolveClientIp>[1] | undefined;

/**
 * Entry point for /api/auth/*: resolves the client IP from the trusted proxy header
 * (AUTH_IP_HEADER, AUTH_TRUSTED_PROXIES) and hands it to Better Auth in an internal header,
 * overwriting any value the client sent. Requests without a resolvable IP are rejected
 * outside development/CI instead of sharing one rate-limit bucket (R-005).
 */
export async function handleAuthRequest(request: Request): Promise<Response> {
  const headers = withTrustedClientIp(request.headers);
  if (!headers.has(CLIENT_IP_HEADER)) {
    console.warn(`auth: no client IP in header "${ipConfig?.header}" – check the proxy setup`);
    return Response.json({ message: "Client address could not be determined." }, { status: 400 });
  }
  // Rebuild from parts: `new Request(request, …)` throws on Node 24 ("Cannot read private
  // member #state"), because Next's incoming request is not an instance of the global class.
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    signal: request.signal,
  };
  if (request.body) {
    init.body = request.body;
    init.duplex = "half"; // required by undici for stream bodies
  }
  return auth().handler(new Request(request.url, init));
}

/**
 * Copy of `source` in which the internal client-IP header holds only the IP resolved from
 * the trusted proxy header – a client-sent value is always dropped. Without a resolvable IP
 * the header is absent. Use it for every `auth().api.*` call that creates sessions from a
 * request (e.g. Server Actions), so Better Auth never stores a client-chosen address (R-010).
 */
export function withTrustedClientIp(source: Headers): Headers {
  const env = serverEnv();
  ipConfig ??= {
    header: env.AUTH_IP_HEADER,
    trustedProxies: parseTrustedProxies(env.AUTH_TRUSTED_PROXIES),
  };
  const ip =
    resolveClientIp(source, ipConfig) ??
    (env.APP_ENV === "development" || env.APP_ENV === "ci" ? LOOPBACK : undefined);
  const headers = new Headers(source);
  headers.delete(CLIENT_IP_HEADER);
  if (ip) headers.set(CLIENT_IP_HEADER, ip);
  return headers;
}

/** Lazily created Better Auth instance (env is read at request time, not at build time). */
export function auth(): Auth {
  globalForAuth.__wwwAuth ??= createAuth();
  return globalForAuth.__wwwAuth;
}
