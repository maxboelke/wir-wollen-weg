import { createHmac, hkdfSync } from "node:crypto";

/**
 * Key for the HMACs that stand in for e-mail addresses in `auth_attempt` (R-028).
 *
 * Derived from BETTER_AUTH_SECRET with HKDF and its own label (domain separation – the
 * secret also signs sessions). Only development and CI may run without a secret (fixed
 * local key); everywhere else a missing secret is a start error instead of a silently
 * known key that would make the stored HMACs recomputable for known addresses.
 *
 * Kept free of `server-only` so `instrumentation.ts` and unit tests can use it.
 */
const INFO = "ww:email-limit:v1";
const LOCAL_ONLY_SECRET = "dev-only-email-limit-secret";
const LOCAL_ENVS = new Set(["development", "ci"]);

export function deriveEmailLimitKey({
  appEnv,
  secret,
}: {
  appEnv: string | undefined;
  secret: string | undefined;
}): Buffer {
  if (!secret) {
    if (!LOCAL_ENVS.has(appEnv ?? "development")) {
      throw new Error(
        `BETTER_AUTH_SECRET is required for APP_ENV=${appEnv ?? "?"} (rate-limit key, R-028)`,
      );
    }
    secret = LOCAL_ONLY_SECRET;
  }
  return Buffer.from(hkdfSync("sha256", secret, "", INFO, 32));
}

/** HMAC-SHA-256 (hex) of an already normalised value. */
export function hmacHex(key: Buffer, value: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}
