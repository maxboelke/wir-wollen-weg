/**
 * Operating modes (APP_ENV) and the start rules that go with them (deployment.md §0, §0.7).
 *
 * Kept free of `server-only` and of Node APIs: used by `instrumentation.ts`, `proxy.ts`
 * (may run outside the Node.js runtime on a CDN), `src/server/env.ts`, scripts and unit tests.
 */

import { travelDataEnabled, travelDataStartupProblems } from "./travel-data-keys";

export const APP_ENVS = ["development", "demo", "ci", "staging", "preview", "production"] as const;
export type AppEnv = (typeof APP_ENVS)[number];

type Env = Record<string, string | undefined>;

const value = (env: Env, name: string): string | undefined => env[name] || undefined;

/** Running on Vercel (system variable, set at build and runtime). */
export function onVercel(env: Env = process.env): boolean {
  return value(env, "VERCEL") === "1";
}

/**
 * Effective APP_ENV. Without a value the app runs as `development` – except on Vercel, where a
 * forgotten variable must not open an unprotected development app on the internet: there the
 * default is `preview` (password protection, fail closed without PREVIEW_ACCESS_PASSWORD).
 */
export function resolveAppEnv(env: Env = process.env): string {
  return value(env, "APP_ENV") ?? (onVercel(env) ? "preview" : "development");
}

/**
 * Public base URL without trailing slash. Without APP_URL on Vercel the production domain of
 * the project is used (`VERCEL_PROJECT_PRODUCTION_URL`, e.g. `wir-wollen-weg.vercel.app`).
 */
export function resolveAppUrl(env: Env = process.env): string {
  const explicit = value(env, "APP_URL");
  const vercelHost = value(env, "VERCEL_PROJECT_PRODUCTION_URL");
  const url = explicit ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

/** Base URL Better Auth works with (cookies get `Secure` exactly when it starts with https). */
export function resolveAuthUrl(env: Env = process.env): string {
  return (value(env, "BETTER_AUTH_URL") ?? resolveAppUrl(env)).replace(/\/+$/, "");
}

/** Modes that face the internet and therefore need HTTPS (R-064). */
const HTTPS_ENVS = new Set(["staging", "preview", "production"]);
/** Modes that must never run on Vercel (no password protection, local shortcuts). */
const LOCAL_ONLY_ENVS = new Set(["development", "ci", "demo"]);
/**
 * Modes in which the demo inbox may exist: local modes and the password-protected preview.
 * Never `production` and never `staging` (internet-facing without Basic Auth – the inbox would
 * publish every login code), nor an unknown/misspelt APP_ENV (allowlist, fail closed).
 */
const INBOX_ENVS = new Set(["development", "ci", "demo", "preview"]);

/** Minimum length of the preview password (HTTP Basic Auth, deployment.md §0.7). */
export const PREVIEW_PASSWORD_MIN_LENGTH = 10;

export interface StartupInput {
  appEnv: string;
  /** Effective Better Auth base URL. */
  authUrl: string;
  previewPassword: string | undefined;
  mailTransport: string | undefined;
  onVercel: boolean;
  /** `[PLATZHALTER` markers left in the legal texts (only evaluated for production). */
  placeholders: readonly string[];
  /**
   * Environment for the travel-data rules (TRAVEL_DATA_ENABLED, TRAVEL_DATA_KEYS,
   * BETTER_AUTH_SECRET – deployment.md §0.11.3). Omitted = nothing set.
   */
  env?: Env | undefined;
}

/**
 * Configuration errors that must stop the start (instrumentation.ts) – empty list = fine.
 * Each message names the variable and the documentation section.
 */
export function startupProblems(input: StartupInput): string[] {
  const problems: string[] = [];
  const { appEnv } = input;
  if (!(APP_ENVS as readonly string[]).includes(appEnv)) {
    problems.push(`APP_ENV=${appEnv} is unknown (allowed: ${APP_ENVS.join(", ")})`);
    return problems;
  }
  if (input.onVercel && LOCAL_ONLY_ENVS.has(appEnv)) {
    problems.push(`APP_ENV=${appEnv} must not run on Vercel – use APP_ENV=preview (§0.7)`);
  }
  // R-064: without https Better Auth sets session cookies without `Secure`.
  if (HTTPS_ENVS.has(appEnv) && !input.authUrl.startsWith("https://")) {
    problems.push(
      `APP_ENV=${appEnv} needs an https:// base URL (APP_URL/BETTER_AUTH_URL, R-064, deployment.md §4)`,
    );
  }
  if (appEnv === "preview" && !previewPasswordOk(input.previewPassword)) {
    problems.push(
      `APP_ENV=preview needs PREVIEW_ACCESS_PASSWORD with at least ${String(PREVIEW_PASSWORD_MIN_LENGTH)} characters (deployment.md §0.7)`,
    );
  }
  if (input.mailTransport === "inbox" && !INBOX_ENVS.has(appEnv)) {
    problems.push(
      `APP_ENV=${appEnv} must send real mails – MAIL_TRANSPORT=inbox is only for the local demo and the password-protected preview`,
    );
  }
  problems.push(...travelDataStartupProblems(appEnv, input.env ?? {}));
  if (appEnv === "production" && input.placeholders.length > 0) {
    const shown = input.placeholders.slice(0, 5).join(", ");
    problems.push(
      `APP_ENV=production: placeholder texts left (${shown}${input.placeholders.length > 5 ? ", …" : ""}) – compliance-checklist §0a`,
    );
  }
  return problems;
}

export function previewPasswordOk(password: string | undefined): password is string {
  return typeof password === "string" && password.length >= PREVIEW_PASSWORD_MIN_LENGTH;
}

/** The demo inbox (`MAIL_TRANSPORT=inbox`, /demo/postfach) – never in production or staging. */
export function inboxEnabled(env: Env = process.env): boolean {
  return value(env, "MAIL_TRANSPORT") === "inbox" && INBOX_ENVS.has(resolveAppEnv(env));
}

/** Demo banner «keine echten Daten» (deployment.md §0.1): local demo and online preview. */
export function showsDemoBanner(env: Env = process.env): boolean {
  const appEnv = resolveAppEnv(env);
  return appEnv === "demo" || appEnv === "preview";
}

/** «Demo zurücksetzen» on /demo/postfach – only in the online preview with the demo inbox. */
export function demoResetAvailable(env: Env = process.env): boolean {
  return resolveAppEnv(env) === "preview" && inboxEnabled(env);
}

/**
 * Extra origins Better Auth trusts for the online preview on Vercel (PRD Q25). One project has
 * several hosts there – production alias, branch alias and one per deployment – and the
 * configured base URL names only one of them, so sign-in from any other failed with "Invalid
 * origin" (403). Trusted are the Vercel-provided hosts of this deployment and, for the request
 * at hand, its own host if it is a `*.vercel.app` host: the origin check only has to keep
 * other sites out, and a cross-site attacker's Origin never equals the host it posts to.
 * Everywhere else (local, staging, production) nothing is added.
 */
export function previewTrustedOrigins(
  env: Env = process.env,
  requestHost?: string | null,
): string[] {
  if (!onVercel(env) || resolveAppEnv(env) !== "preview") return [];
  const hosts = [
    value(env, "VERCEL_PROJECT_PRODUCTION_URL"),
    value(env, "VERCEL_BRANCH_URL"),
    value(env, "VERCEL_URL"),
  ];
  const own = requestHost?.trim().toLowerCase();
  if (own && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(own)) hosts.push(own);
  return [...new Set(hosts.filter((h): h is string => Boolean(h)).map((h) => `https://${h}`))];
}

/**
 * Personal travel details (F-054, R.9 I11-12): switched on (TRAVEL_DATA_ENABLED, default by
 * mode) AND a key is available – otherwise the area does not exist (404, no station, no tile).
 */
export function travelDataOn(env: Env = process.env): boolean {
  return travelDataEnabled(resolveAppEnv(env), env);
}
