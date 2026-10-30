/**
 * Feature switch and key ring of the personal travel details (F-054, features.md R.9 I11-12,
 * deployment.md §0.11). Free of Node APIs and of `server-only` – used by the start guard
 * (`app-env.ts` → instrumentation.ts), the crypto module and unit tests. Messages name only
 * variables, never values.
 */

type Env = Record<string, string | undefined>;

const value = (env: Env, name: string): string | undefined => env[name] || undefined;

/** Modes in which the area is on by default and the key may be derived (§0.11.1). */
const DEMO_LIKE_ENVS: ReadonlySet<string> = new Set(["development", "ci", "demo", "preview"]);
/** Modes that need their own key when the area is on (no derivation). */
const STRICT_ENVS: ReadonlySet<string> = new Set(["staging", "production"]);

/** Key id of the key derived from BETTER_AUTH_SECRET – reserved, never in TRAVEL_DATA_KEYS. */
export const DERIVED_KEY_ID = "demo";
/** HKDF info label of the derived key (domain separation, deployment.md §0.11.2). */
export const DERIVED_KEY_INFO = "travel-data-demo-v1";

const KID = /^[a-z0-9-]{1,16}$/;

export interface ParsedKey {
  kid: string;
  /** Standard base64 of exactly 32 bytes. */
  base64: string;
}

export type KeyRingResult =
  { ok: true; keys: ParsedKey[]; warning: string | null } | { ok: false; problem: string };

/** Decoded length of a standard base64 string, or -1 when it is not valid base64. */
function base64Length(text: string): number {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(text) || text.length % 4 !== 0) return -1;
  try {
    return atob(text).length;
  } catch {
    return -1;
  }
}

/**
 * `TRAVEL_DATA_KEYS=<kid>:<base64-32-byte>[,…]` (deployment.md §0.11.2): 1–3 entries, the first
 * is the active key. Problems name the rule, never the values.
 */
export function parseKeyRing(raw: string): KeyRingResult {
  const entries = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (entries.length === 0) return { ok: false, problem: "TRAVEL_DATA_KEYS is empty" };
  const keys: ParsedKey[] = [];
  for (const entry of entries) {
    const colon = entry.indexOf(":");
    if (colon <= 0) {
      return { ok: false, problem: "TRAVEL_DATA_KEYS: every entry must be <kid>:<base64>" };
    }
    const kid = entry.slice(0, colon).trim();
    const base64 = entry.slice(colon + 1).trim();
    if (!KID.test(kid)) {
      return { ok: false, problem: "TRAVEL_DATA_KEYS: key ids must match ^[a-z0-9-]{1,16}$" };
    }
    if (kid === DERIVED_KEY_ID) {
      return { ok: false, problem: `TRAVEL_DATA_KEYS: the key id "${DERIVED_KEY_ID}" is reserved` };
    }
    if (base64Length(base64) !== 32) {
      return {
        ok: false,
        problem: "TRAVEL_DATA_KEYS: every key must be base64 of exactly 32 bytes",
      };
    }
    if (keys.some((key) => key.kid === kid)) {
      return { ok: false, problem: "TRAVEL_DATA_KEYS: key ids must be unique" };
    }
    if (keys.some((key) => key.base64 === base64)) {
      return { ok: false, problem: "TRAVEL_DATA_KEYS: the same key appears twice" };
    }
    keys.push({ kid, base64 });
  }
  return {
    ok: true,
    keys,
    warning:
      keys.length > 3
        ? `TRAVEL_DATA_KEYS has ${String(keys.length)} entries – remove retired keys (§0.11.6)`
        : null,
  };
}

export type SwitchValue = "on" | "off" | "default" | "invalid";

function switchValue(env: Env): SwitchValue {
  const raw = value(env, "TRAVEL_DATA_ENABLED");
  if (raw === undefined) return "default";
  if (raw === "true") return "on";
  if (raw === "false") return "off";
  return "invalid";
}

/** Effective feature switch: explicit value, else on in demo-like modes, off in staging/prod. */
export function travelDataSwitchOn(appEnv: string, env: Env): boolean {
  const switched = switchValue(env);
  if (switched === "on") return true;
  if (switched === "off" || switched === "invalid") return false;
  return DEMO_LIKE_ENVS.has(appEnv);
}

export type KeySource =
  { kind: "ring"; keys: ParsedKey[] } | { kind: "derived"; secret: string } | { kind: "none" };

/**
 * Where the key comes from: an explicit ring (always wins), else – only in demo-like modes – the
 * derivation from BETTER_AUTH_SECRET, else nothing (area off, fail closed).
 */
export function keySource(appEnv: string, env: Env): KeySource {
  const raw = value(env, "TRAVEL_DATA_KEYS");
  if (raw !== undefined) {
    const parsed = parseKeyRing(raw);
    return parsed.ok ? { kind: "ring", keys: parsed.keys } : { kind: "none" };
  }
  const secret = value(env, "BETTER_AUTH_SECRET");
  if (DEMO_LIKE_ENVS.has(appEnv) && secret) return { kind: "derived", secret };
  return { kind: "none" };
}

/**
 * The area is usable: switched on AND a key is available (R.9 I11-12, fail closed). Never in the
 * friends beta (real people, US hosting – off until G1b, deployment.md §0.12.4 Nr. 6; the start
 * guard refuses TRAVEL_DATA_ENABLED=true there as well).
 */
export function travelDataEnabled(appEnv: string, env: Env): boolean {
  if (appEnv === "beta") return false;
  return travelDataSwitchOn(appEnv, env) && keySource(appEnv, env).kind !== "none";
}

/** Base64 of the UTF-8 bytes of a string (edge-safe). */
function utf8Base64(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Start guard rows of deployment.md §0.11.3 – an empty list means fine. Messages name only the
 * variable and the section.
 */
export function travelDataStartupProblems(appEnv: string, env: Env): string[] {
  const problems: string[] = [];
  if (switchValue(env) === "invalid") {
    problems.push("TRAVEL_DATA_ENABLED must be true, false or empty (deployment.md §0.11.1)");
  }
  const raw = value(env, "TRAVEL_DATA_KEYS");
  if (raw !== undefined) {
    const parsed = parseKeyRing(raw);
    if (!parsed.ok) problems.push(`${parsed.problem} (deployment.md §0.11.2)`);
    else if (STRICT_ENVS.has(appEnv)) {
      const secret = value(env, "BETTER_AUTH_SECRET");
      if (
        secret &&
        parsed.keys.some((key) => key.base64 === secret || key.base64 === utf8Base64(secret))
      ) {
        problems.push(
          `APP_ENV=${appEnv}: TRAVEL_DATA_KEYS must not reuse BETTER_AUTH_SECRET (deployment.md §0.11.3)`,
        );
      }
    }
  }
  if (STRICT_ENVS.has(appEnv) && travelDataSwitchOn(appEnv, env) && raw === undefined) {
    problems.push(
      `APP_ENV=${appEnv} with TRAVEL_DATA_ENABLED=true needs its own TRAVEL_DATA_KEYS – no derivation (deployment.md §0.11.3)`,
    );
  }
  return problems;
}
