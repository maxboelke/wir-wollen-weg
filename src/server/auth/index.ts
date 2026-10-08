import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { isLocale } from "@/i18n/config";
import { negotiateLocale } from "@/i18n/negotiate";
import { inviteTokenFromPath } from "@/lib/safe-path";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { serverEnv } from "../env";
import { CLIENT_IP_HEADER, parseTrustedProxies, resolveClientIp } from "./client-ip";
import { renderAccessEmail } from "../mail/access-email";
import { sendMail } from "../mail/transport";
import { findTripByInviteToken } from "../trips";
import { emailAccess, type AccessEmailPayload } from "./email-access-plugin";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";

const SESSION_DAYS = 90;

async function sendAccessEmail(payload: AccessEmailPayload): Promise<void> {
  const locale = isLocale(payload.locale)
    ? payload.locale
    : negotiateLocale({
        cookie: /(?:^|;\s*)lang=([^;]+)/.exec(payload.headers?.get("cookie") ?? "")?.[1],
        acceptLanguage: payload.headers?.get("accept-language"),
      });
  const inviteToken = inviteTokenFromPath(payload.returnTo);
  const trip = inviteToken ? await findTripByInviteToken(inviteToken) : undefined;

  const mail = renderAccessEmail({
    locale,
    code: payload.code,
    magicLinkUrl: payload.magicLinkUrl,
    tripName: trip?.name,
  });
  const env = serverEnv();
  const fromName =
    (locale === "de" ? env.MAIL_FROM_NAME_DE : env.MAIL_FROM_NAME_EN) ??
    (locale === "de" ? de : en).mail.fromName;
  await sendMail(payload.email, fromName, mail);
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
    session: {
      // "Keep me signed in": 90 days, rolling (PRD §8, tech-stack.md §3.2).
      expiresIn: 60 * 60 * 24 * SESSION_DAYS,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: env.RATE_LIMIT_ENABLED,
      storage: "database",
      // Key = IP resolved by handleAuthRequest (R-005); see client-ip.ts.
      customRules: {
        "/sign-in/email-otp": { window: 60, max: 10 },
      },
    },
    advanced: {
      cookiePrefix: "ww",
      // Only the header written by handleAuthRequest – never a client-supplied one (R-005).
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
      database: { generateId: false }, // PostgreSQL generates UUIDv7 (schema.ts)
      // First-party cookies only, SameSite=Lax – NOT Strict: links from WhatsApp/mail are
      // cross-site navigations and must still carry the session (tech-stack.md §3.3).
      defaultCookieAttributes: { sameSite: "lax", httpOnly: true },
    },
    telemetry: { enabled: false },
    plugins: [
      ...emailAccess({ sendAccessEmail, magicLandingPath: "/auth/magic", expiresIn: 900 }),
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
  const env = serverEnv();
  ipConfig ??= {
    header: env.AUTH_IP_HEADER,
    trustedProxies: parseTrustedProxies(env.AUTH_TRUSTED_PROXIES),
  };
  const ip =
    resolveClientIp(request.headers, ipConfig) ??
    (env.APP_ENV === "development" || env.APP_ENV === "ci" ? LOOPBACK : undefined);
  if (!ip) {
    console.warn(`auth: no client IP in header "${ipConfig.header}" – check the proxy setup`);
    return Response.json({ message: "Client address could not be determined." }, { status: 400 });
  }
  const headers = new Headers(request.headers);
  headers.set(CLIENT_IP_HEADER, ip);
  return auth().handler(new Request(request, { headers }));
}

/** Lazily created Better Auth instance (env is read at request time, not at build time). */
export function auth(): Auth {
  globalForAuth.__wwwAuth ??= createAuth();
  return globalForAuth.__wwwAuth;
}
