/**
 * Closed friends beta «Stufe B» (APP_ENV=beta, Gate G0 – deployment.md §0.12): configuration
 * parsing and the start rules of §0.12.4. Free of Node APIs and of `server-only` – used by the
 * start guard (`app-env.ts` → instrumentation.ts), the proxy, server code and unit tests.
 * Messages name only variables and rules, never values (beta codes are secrets).
 */

type Env = Record<string, string | undefined>;

const value = (env: Env, name: string): string | undefined => env[name]?.trim() || undefined;

/** Version of the beta privacy notice the sign-up consent refers to (compliance §13.4). */
export const BETA_CONSENT_VERSION = "beta-1";

/** `BETA_ACCESS_CODES`: 1–5 entries, the first is the current one (rotation, §0.12.5 Nr. 8). */
export const BETA_CODES_MAX = 5;
/** Minimum length of a beta code after normalisation (§0.12.4 Nr. 3). */
export const BETA_CODE_MIN_LENGTH = 12;
/** Default and bounds of `BETA_MAX_ACCOUNTS` (§0.12.3, §0.12.4 Nr. 16). */
export const BETA_MAX_ACCOUNTS_DEFAULT = 50;
export const BETA_MAX_ACCOUNTS_LIMIT = 500;

/** Mail hosts that only exist on a developer machine or in CI (§0.12.4 Nr. 2). */
const LOCAL_SMTP_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "mailpit"]);
/** Sender/contact domains that are placeholders, never real mailboxes. */
const PLACEHOLDER_MAIL_DOMAIN =
  /@(?:[^@]*\.)?(?:example\.(?:org|com|net)|[^@]+\.test|[^@]+\.invalid)$/i;
const MAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalisation of a typed beta code (§0.12.5 Nr. 6): NFKC → trim → lower case → without
 * spaces and hyphens. «Sonne-Koffer 27», «SONNE KOFFER-27» and «sonnekoffer27» are the same.
 */
export function normalizeBetaCode(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");
}

export type BetaCodesResult = { ok: true; codes: string[] } | { ok: false; problem: string };

/** Parses `BETA_ACCESS_CODES` (comma separated) into normalised codes – first = current. */
export function parseBetaCodes(raw: string | undefined): BetaCodesResult {
  const entries = (raw ?? "")
    .split(",")
    .map((entry) => normalizeBetaCode(entry))
    .filter(Boolean);
  if (entries.length === 0) {
    return { ok: false, problem: "BETA_ACCESS_CODES is missing (deployment.md §0.12.3)" };
  }
  if (entries.length > BETA_CODES_MAX) {
    return {
      ok: false,
      problem: `BETA_ACCESS_CODES has more than ${String(BETA_CODES_MAX)} entries (deployment.md §0.12.5)`,
    };
  }
  if (entries.some((code) => code.length < BETA_CODE_MIN_LENGTH)) {
    return {
      ok: false,
      problem: `BETA_ACCESS_CODES: every code needs at least ${String(BETA_CODE_MIN_LENGTH)} letters/digits (deployment.md §0.12.4)`,
    };
  }
  if (new Set(entries).size !== entries.length) {
    return { ok: false, problem: "BETA_ACCESS_CODES: the same code appears twice" };
  }
  return { ok: true, codes: entries };
}

export type MaxAccountsResult = { ok: true; max: number } | { ok: false; problem: string };

/** `BETA_MAX_ACCOUNTS`: empty = 50; otherwise a whole number 1–500 (§0.12.4 Nr. 16). */
export function parseBetaMaxAccounts(raw: string | undefined): MaxAccountsResult {
  const text = raw?.trim();
  if (!text) return { ok: true, max: BETA_MAX_ACCOUNTS_DEFAULT };
  if (!/^\d+$/.test(text)) {
    return { ok: false, problem: "BETA_MAX_ACCOUNTS must be a whole number from 1 to 500" };
  }
  const max = Number(text);
  if (max < 1 || max > BETA_MAX_ACCOUNTS_LIMIT) {
    return { ok: false, problem: "BETA_MAX_ACCOUNTS must be a whole number from 1 to 500" };
  }
  return { ok: true, max };
}

/** Effective account limit (invalid values never start – the default is only a fallback). */
export function betaMaxAccounts(env: Env): number {
  const parsed = parseBetaMaxAccounts(value(env, "BETA_MAX_ACCOUNTS"));
  return parsed.ok ? parsed.max : BETA_MAX_ACCOUNTS_DEFAULT;
}

/**
 * Variant B of E-G0-2 (decided 2026-10-23): a valid trip invitation replaces the beta code.
 * `BETA_INVITE_SIGNUP=false` is the kill switch – then invited people need the beta code too
 * (= variant A without the inline code field, W23 A.5).
 */
export function betaInviteSignupEnabled(env: Env): boolean {
  return value(env, "BETA_INVITE_SIGNUP")?.toLowerCase() !== "false";
}

export function validMailAddress(address: string | undefined): address is string {
  return typeof address === "string" && MAIL_PATTERN.test(address);
}

function placeholderMail(address: string): boolean {
  return PLACEHOLDER_MAIL_DOMAIN.test(address.replace(/^.*</, "").replace(/>.*$/, ""));
}

/** Feedback channels (W23 D.2) – invalid values only hide the button (§0.12.4 Nr. 15). */
export interface FeedbackConfig {
  /** Digits only, international format without «+» (wa.me). */
  whatsapp: string | null;
  email: string | null;
}

export function feedbackConfig(env: Env): FeedbackConfig {
  const number = value(env, "FEEDBACK_WHATSAPP_NUMBER");
  const email = value(env, "FEEDBACK_EMAIL");
  return {
    whatsapp: number && /^\d{8,15}$/.test(number) ? number : null,
    email: validMailAddress(email) ? email : null,
  };
}

/** Warnings for the start log – never a reason to refuse the start (§0.12.4 Nr. 13, 15). */
export function betaStartupWarnings(env: Env): string[] {
  const warnings: string[] = [];
  const number = value(env, "FEEDBACK_WHATSAPP_NUMBER");
  if (number && !/^\d{8,15}$/.test(number)) {
    warnings.push("FEEDBACK_WHATSAPP_NUMBER must be 8–15 digits – WhatsApp feedback is hidden");
  }
  const email = value(env, "FEEDBACK_EMAIL");
  if (email && !validMailAddress(email)) {
    warnings.push("FEEDBACK_EMAIL is not a valid address – mail feedback is hidden");
  }
  if (value(env, "PREVIEW_ACCESS_PASSWORD")) {
    warnings.push("PREVIEW_ACCESS_PASSWORD is ignored in beta (no Basic Auth)");
  }
  return warnings;
}

/**
 * Test-only exception (deployment.md §0.12.4 «Tests»): the E2E project `beta-chromium` sends
 * mails to Mailpit. Only effective together with `CI` – a stray `E2E_ALLOW_LOCAL_SMTP` on a
 * real deployment changes nothing.
 */
export function localSmtpAllowedForTests(env: Env): boolean {
  const ci = value(env, "CI")?.toLowerCase();
  return value(env, "E2E_ALLOW_LOCAL_SMTP") === "1" && (ci === "true" || ci === "1");
}

/**
 * Start rules of APP_ENV=beta that are specific to the beta (§0.12.4 Nr. 2–7, 16). The rules
 * shared with other modes (https base URL, no inbox, travel details, placeholders) live in
 * `startupProblems` (app-env.ts). Empty list = fine.
 */
export function betaStartupProblems(env: Env): string[] {
  const problems: string[] = [];
  const testSmtp = localSmtpAllowedForTests(env);

  // Nr. 2 – real mails only.
  if (value(env, "MAIL_TRANSPORT") !== "smtp") {
    problems.push("APP_ENV=beta needs MAIL_TRANSPORT=smtp (deployment.md §0.12.4)");
  }
  const host = value(env, "SMTP_HOST")?.toLowerCase();
  if (!host || (LOCAL_SMTP_HOSTS.has(host) && !testSmtp)) {
    problems.push("APP_ENV=beta needs a real SMTP_HOST (deployment.md §0.12.4)");
  }
  if (!testSmtp && (!value(env, "SMTP_USER") || !value(env, "SMTP_PASSWORD"))) {
    problems.push("APP_ENV=beta needs SMTP_USER and SMTP_PASSWORD (deployment.md §0.12.4)");
  }
  const from = value(env, "MAIL_FROM");
  if (!from || (placeholderMail(from) && !testSmtp)) {
    problems.push("APP_ENV=beta needs a real MAIL_FROM sender (deployment.md §0.12.4)");
  }

  // Nr. 3 – beta codes.
  const codes = parseBetaCodes(value(env, "BETA_ACCESS_CODES"));
  if (!codes.ok) problems.push(codes.problem);

  // Nr. 4 – controller of the beta privacy notice.
  const name = value(env, "LEGAL_OPERATOR_NAME");
  if (!name || name.length < 2 || name.length > 100) {
    problems.push(
      "APP_ENV=beta needs LEGAL_OPERATOR_NAME (2–100 characters, deployment.md §0.12.4)",
    );
  }
  const contact = value(env, "CONTACT_EMAIL");
  if (!validMailAddress(contact) || placeholderMail(contact)) {
    problems.push("APP_ENV=beta needs a real CONTACT_EMAIL (deployment.md §0.12.4)");
  }

  // Nr. 5 – the retention job must be able to run.
  if (!value(env, "CRON_SECRET") && !value(env, "RETENTION_TOKEN")) {
    problems.push("APP_ENV=beta needs CRON_SECRET or RETENTION_TOKEN (deployment.md §0.12.4)");
  }

  // Nr. 6 – personal travel details stay off until G1b.
  if (value(env, "TRAVEL_DATA_ENABLED")?.toLowerCase() === "true") {
    problems.push(
      "APP_ENV=beta refuses TRAVEL_DATA_ENABLED=true – travel details stay off until G1b (deployment.md §0.12.4)",
    );
  }

  // Nr. 7 – rate limits stay on.
  if (value(env, "RATE_LIMIT_ENABLED")?.toLowerCase() === "false") {
    problems.push("APP_ENV=beta refuses RATE_LIMIT_ENABLED=false (deployment.md §0.12.4)");
  }

  // Nr. 16 – account limit.
  const max = parseBetaMaxAccounts(value(env, "BETA_MAX_ACCOUNTS"));
  if (!max.ok) problems.push(`${max.problem} (deployment.md §0.12.4)`);

  return problems;
}

/**
 * Service worker (deployment.md §0.12.6): only in beta and production, kill switch
 * `PWA_SW_ENABLED=false` – then `/sw.js` unregisters itself.
 */
export function serviceWorkerEnabled(appEnv: string, env: Env): boolean {
  return (
    (appEnv === "beta" || appEnv === "production") &&
    value(env, "PWA_SW_ENABLED")?.toLowerCase() !== "false"
  );
}
