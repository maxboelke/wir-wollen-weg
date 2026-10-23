import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

/**
 * Encrypted preview token (R.7 I9-03, R-076): the result of a link preview travels to the
 * browser and back ONLY inside this token – the server takes the image URL and site name for a
 * new suggestion exclusively from a valid token (never from the client). The claims (trip,
 * normalised URL, image URL, site name, expiry ≤ 30 min) are sealed with AES-256-GCM: the token
 * also appears in `/api/stays/image?t=…` and therefore in access logs, so it must not reveal
 * link or image URL (R.7 I9-10). GCM authenticates as well – any manipulation fails.
 *
 * Format: base64url(iv[12] ‖ ciphertext ‖ tag[16]), random IV per token. The key is derived
 * per HKDF from BETTER_AUTH_SECRET with its own info string (deployment.md §0.8 – no new
 * secret; rotating the secret invalidates open tokens, harmless).
 *
 * Kept free of `server-only` for the unit tests.
 */

export const PREVIEW_TOKEN_TTL_MS = 30 * 60_000;
const INFO = "ww:stay-preview-token:v2:aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const AAD = Buffer.from(INFO);

export interface PreviewClaims {
  /** Internal trip id. */
  trip: string;
  /** Normalised link (`normalizeStayUrl`). */
  url: string;
  image: string | null;
  site: string | null;
  /** Expiry, ms since epoch. */
  exp: number;
}

export function previewTokenKey(secret: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "", INFO, 32));
}

export function signPreviewToken(key: Buffer, claims: PreviewClaims): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(AAD);
  const body = Buffer.concat([cipher.update(JSON.stringify(claims), "utf8"), cipher.final()]);
  return Buffer.concat([iv, body, cipher.getAuthTag()]).toString("base64url");
}

/** Claims of a valid, unexpired token – null for anything else (no details why). */
export function verifyPreviewToken(
  key: Buffer,
  token: unknown,
  now = Date.now(),
): PreviewClaims | null {
  if (typeof token !== "string" || token.length > 8192) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
  const raw = Buffer.from(token, "base64url");
  if (raw.length <= IV_BYTES + TAG_BYTES) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, IV_BYTES), {
      authTagLength: TAG_BYTES,
    });
    decipher.setAAD(AAD);
    decipher.setAuthTag(raw.subarray(raw.length - TAG_BYTES));
    const plain = Buffer.concat([
      decipher.update(raw.subarray(IV_BYTES, raw.length - TAG_BYTES)),
      decipher.final(),
    ]).toString("utf8");
    const claims = JSON.parse(plain) as PreviewClaims;
    if (typeof claims.trip !== "string" || typeof claims.url !== "string") return null;
    if (typeof claims.exp !== "number" || claims.exp < now) return null;
    if (claims.exp > now + PREVIEW_TOKEN_TTL_MS + 60_000) return null;
    const image = typeof claims.image === "string" ? claims.image : null;
    const site = typeof claims.site === "string" ? claims.site : null;
    return { trip: claims.trip, url: claims.url, image, site, exp: claims.exp };
  } catch {
    return null;
  }
}
