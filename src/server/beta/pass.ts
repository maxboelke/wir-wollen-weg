import { createHash, createHmac, hkdfSync, timingSafeEqual } from "node:crypto";
import { normalizeBetaCode } from "@/lib/beta-config";

/**
 * Beta pass and invite pass (deployment.md §0.12.5 Nr. 2, 6, 9): small signed cookies that hold
 * «beta code checked» resp. «valid invitation» plus the consent to the beta privacy notice until
 * the account is created. HMAC-SHA-256 with a key derived from BETTER_AUTH_SECRET via HKDF
 * (own `info` per cookie – no new secret). They never contain the code, an e-mail address or
 * the invite token (only its SHA-256).
 *
 * Kept free of `server-only` so unit tests can use it.
 */

export const BETA_PASS_COOKIE = "ww_beta_pass";
export const INVITE_PASS_COOKIE = "ww_invite_pass";
/** Lifetime of both passes (24 h). */
export const PASS_MAX_AGE_SECONDS = 24 * 60 * 60;

const BETA_INFO = "ww-beta-pass";
const INVITE_INFO = "ww-invite-pass";

export interface BetaPass {
  v: 1;
  /** Issued at (ms). */
  iat: number;
  /** Key id of the matching code: first 8 hex chars of SHA-256(normalised code). */
  kid: string;
  /** Consent version (`beta-1`) once the privacy step is done, else null. */
  consent: string | null;
  consentAt: number | null;
}

export interface InvitePass {
  v: 1;
  iat: number;
  /** SHA-256 (hex) of the invite token – the token itself is never stored. */
  tokenHash: string;
  /** Internal trip id behind the token. */
  tripId: string;
  consent: string | null;
  consentAt: number | null;
}

function key(secret: string, info: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "", info, 32));
}

function sign(payload: object, secret: string, info: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", key(secret, info)).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(raw: string | undefined, secret: string, info: string): unknown {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0 || raw.length > 2048) return null;
  const body = raw.slice(0, dot);
  const mac = Buffer.from(raw.slice(dot + 1), "base64url");
  const expected = createHmac("sha256", key(secret, info)).update(body).digest();
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function fresh(iat: unknown, now: number): boolean {
  return typeof iat === "number" && iat <= now + 60_000 && now - iat < PASS_MAX_AGE_SECONDS * 1000;
}

function consentFields(value: Record<string, unknown>) {
  const consent = typeof value.consent === "string" ? value.consent : null;
  const consentAt = typeof value.consentAt === "number" ? value.consentAt : null;
  return { consent, consentAt };
}

/** SHA-256 (hex) of a normalised code; its first 8 chars are the key id. */
function codeDigest(normalized: string): Buffer {
  return createHash("sha256").update(normalized).digest();
}

export function codeKid(normalized: string): string {
  return codeDigest(normalized).toString("hex").slice(0, 8);
}

/**
 * Checks a typed code against ALL configured (normalised) codes with constant-time compares and
 * without an early return (§0.12.5 Nr. 6). Returns the key id of the match, or null.
 */
export function matchBetaCode(typed: string, configured: readonly string[]): string | null {
  const digest = codeDigest(normalizeBetaCode(typed));
  let match: string | null = null;
  for (const code of configured) {
    const candidate = codeDigest(code);
    if (timingSafeEqual(digest, candidate) && match === null) match = codeKid(code);
  }
  return match;
}

export function signBetaPass(pass: BetaPass, secret: string): string {
  return sign(pass, secret, BETA_INFO);
}

/**
 * A beta pass is valid while its signature holds, it is younger than 24 h and a configured code
 * still has its key id – removing a code from BETA_ACCESS_CODES ends its open passes (rotation).
 */
export function readBetaPass(
  raw: string | undefined,
  secret: string,
  configured: readonly string[],
  now = Date.now(),
): BetaPass | null {
  const value = verify(raw, secret, BETA_INFO);
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.v !== 1 || !fresh(record.iat, now) || typeof record.kid !== "string") return null;
  const kid = record.kid;
  if (!configured.some((code) => codeKid(code) === kid)) return null;
  return { v: 1, iat: record.iat as number, kid, ...consentFields(record) };
}

export function inviteTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signInvitePass(pass: InvitePass, secret: string): string {
  return sign(pass, secret, INVITE_INFO);
}

/** Signature + age only – whether the invitation is still valid is checked against the DB. */
export function readInvitePass(
  raw: string | undefined,
  secret: string,
  now = Date.now(),
): InvitePass | null {
  const value = verify(raw, secret, INVITE_INFO);
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (record.v !== 1 || !fresh(record.iat, now)) return null;
  if (typeof record.tokenHash !== "string" || typeof record.tripId !== "string") return null;
  return {
    v: 1,
    iat: record.iat as number,
    tokenHash: record.tokenHash,
    tripId: record.tripId,
    ...consentFields(record),
  };
}
