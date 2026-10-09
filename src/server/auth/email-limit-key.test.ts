import { createHmac, hkdfSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { deriveEmailLimitKey, hmacHex } from "./email-limit-key";

const SECRET = "x".repeat(32);

describe("rate-limit HMAC key (R-028)", () => {
  it("is derived with HKDF and differs from the raw secret", () => {
    const key = deriveEmailLimitKey({ appEnv: "production", secret: SECRET });
    expect(key).toHaveLength(32);
    expect(key.equals(Buffer.from(hkdfSync("sha256", SECRET, "", "ww:email-limit:v1", 32)))).toBe(
      true,
    );
    // Not the old scheme (secret used directly as HMAC key).
    expect(hmacHex(key, "anna@example.org")).not.toBe(
      createHmac("sha256", SECRET).update("anna@example.org").digest("hex"),
    );
  });

  it("depends on the secret", () => {
    const a = deriveEmailLimitKey({ appEnv: "production", secret: SECRET });
    const b = deriveEmailLimitKey({ appEnv: "production", secret: "y".repeat(32) });
    expect(a.equals(b)).toBe(false);
  });

  it("refuses to run without a secret outside development and CI", () => {
    for (const appEnv of ["production", "staging", "demo"]) {
      expect(() => deriveEmailLimitKey({ appEnv, secret: undefined })).toThrow(
        /BETTER_AUTH_SECRET is required/,
      );
    }
    expect(deriveEmailLimitKey({ appEnv: "development", secret: undefined })).toHaveLength(32);
    expect(deriveEmailLimitKey({ appEnv: "ci", secret: undefined })).toHaveLength(32);
    // Unset APP_ENV defaults to development (env.ts).
    expect(deriveEmailLimitKey({ appEnv: undefined, secret: undefined })).toHaveLength(32);
  });
});
