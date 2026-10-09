import * as nodeCrypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { ARGON2_PARAMS, deriveArgon2id, hashPassword, verifyPassword } from "./password-hash";

describe("Argon2id password hashing (F-042)", () => {
  it("produces a PHC string with the OWASP parameters and verifies it", async () => {
    const hash = await hashPassword("Lisbon by night 2027");
    expect(hash).toMatch(
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]{22}\$[A-Za-z0-9+/]{43}$/,
    );
    expect(await verifyPassword(hash, "Lisbon by night 2027")).toBe(true);
    expect(await verifyPassword(hash, "Lisbon by night 2028")).toBe(false);
  }, 20_000);

  it("uses a fresh salt per hash", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same password!"),
      hashPassword("same password!"),
    ]);
    expect(a).not.toBe(b);
  }, 20_000);

  it("treats Unicode compositions alike (NFKC)", async () => {
    const hash = await hashPassword("Café au lait 2027"); // é precomposed
    expect(await verifyPassword(hash, "Café au lait 2027")).toBe(true); // e + combining accent
  }, 20_000);

  it("never verifies unknown formats or absurd parameters", async () => {
    expect(await verifyPassword("plain", "plain")).toBe(false);
    expect(await verifyPassword("$scrypt$abc", "x")).toBe(false);
    const huge =
      "$argon2id$v=19$m=9999999,t=2,p=1$c2FsdHNhbHRzYWx0c2FsdA$aGFzaGhhc2hoYXNoaGFzaGhhc2hoYXNoaGFzaGhhc2g";
    expect(await verifyPassword(huge, "x")).toBe(false);
  });

  it("matches a known answer and Node's native argon2 where available", async () => {
    const salt = new Uint8Array(16).fill(7);
    const js = await deriveArgon2id("password", salt, { ...ARGON2_PARAMS }, "js");
    // Known answer (computed with Node's native crypto.argon2, Node 24.21) – pins the JS path
    // also on Node 22, where no native cross-check is possible.
    expect(Buffer.from(js).toString("hex")).toBe(
      "b95b1097ae2e8cb169c28302867b5192f0372672e9b9fee4099ea37b6746a97c",
    );
    const native = (nodeCrypto as unknown as { argon2?: unknown }).argon2;
    if (typeof native === "function") {
      // Node ≥ 24.7 (CI, production): both implementations must agree byte for byte.
      const auto = await deriveArgon2id("password", salt, { ...ARGON2_PARAMS }, "auto");
      expect(Buffer.from(auto)).toEqual(Buffer.from(js));
    }
  }, 20_000);
});
