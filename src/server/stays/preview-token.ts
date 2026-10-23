import { createHmac, hkdfSync, timingSafeEqual } from "node:crypto";

/**
 * Signed preview token (R.7 I9-03): the result of a link preview travels to the browser and
 * back ONLY inside this token – the server takes the image URL and site name for a new
 * suggestion exclusively from a valid token (never from the client). HMAC-SHA-256 over trip,
 * normalised URL, image URL, site name and expiry (≤ 30 min). The key is derived per HKDF from
 * BETTER_AUTH_SECRET with its own label (deployment.md §0.8 – no new secret; rotating the
 * secret invalidates open tokens, harmless).
 *
 * Kept free of `server-only` for the unit tests.
 */

export const PREVIEW_TOKEN_TTL_MS = 30 * 60_000;
const INFO = "ww:stay-preview-token:v1";

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

const mac = (key: Buffer, payload: string) =>
  createHmac("sha256", key).update(payload).digest("base64url");

export function signPreviewToken(key: Buffer, claims: PreviewClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${mac(key, payload)}`;
}

/** Claims of a valid, unexpired token – null for anything else (no details why). */
export function verifyPreviewToken(
  key: Buffer,
  token: unknown,
  now = Date.now(),
): PreviewClaims | null {
  if (typeof token !== "string" || token.length > 8192) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(mac(key, payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as PreviewClaims;
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
