import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aadOf,
  currentKeyRing,
  keyRingFrom,
  openRecord,
  resealRecord,
  sealRecord,
  TravelCryptoError,
  type AadParts,
} from "./crypto";

const key = () => randomBytes(32).toString("base64");
const ring = (...ids: string[]) => {
  const result = keyRingFrom({ kind: "ring", keys: ids.map((kid) => ({ kid, base64: key() })) });
  if (!result) throw new Error("no ring");
  return result;
};

const AAD: AadParts = {
  tripId: "0192c5b4-0000-7000-8000-000000000001",
  requestId: "0192c5b4-0000-7000-8000-000000000002",
  userId: "0192c5b4-0000-7000-8000-000000000003",
  schemaVersion: 1,
};
const RECORD = { givenNames: "Erika Maria", familyNames: "Musterfrau", birthDate: "1990-08-12" };

function errorReason(work: () => unknown): string {
  try {
    work();
  } catch (error) {
    return error instanceof TravelCryptoError ? error.reason : "other";
  }
  return "none";
}

describe("travel-data crypto (R.9 Verschlüsselung)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("round-trips a record and never stores plain text", () => {
    const keys = ring("t202701");
    const sealed = sealRecord(keys, RECORD, AAD);
    expect(sealed.keyId).toBe("t202701");
    expect(sealed.nonce).toHaveLength(12);
    expect(sealed.ciphertext.toString("utf8")).not.toContain("Musterfrau");
    expect(sealed.ciphertext.toString("latin1")).not.toContain("1990");
    expect(openRecord(keys, sealed, AAD)).toEqual(RECORD);
  });

  it("uses a fresh nonce for every encryption, also for the same record", () => {
    const keys = ring("t202701");
    const a = sealRecord(keys, RECORD, AAD);
    const b = sealRecord(keys, RECORD, AAD);
    expect(a.nonce.equals(b.nonce)).toBe(false);
    expect(a.ciphertext.equals(b.ciphertext)).toBe(false);
  });

  it("binds the ciphertext to trip, request, person and schema version (copied row fails)", () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const keys = ring("t202701");
    const sealed = sealRecord(keys, RECORD, AAD);
    for (const other of [
      { ...AAD, tripId: "0192c5b4-0000-7000-8000-0000000000ff" },
      { ...AAD, requestId: "0192c5b4-0000-7000-8000-0000000000ff" },
      { ...AAD, userId: "0192c5b4-0000-7000-8000-0000000000ff" },
      { ...AAD, schemaVersion: 2 },
    ]) {
      expect(errorReason(() => openRecord(keys, sealed, other))).toBe("failed");
    }
    // Swapping two people's rows: neither decrypts with the other's binding.
    const otherPerson = { ...AAD, userId: "0192c5b4-0000-7000-8000-000000000004" };
    const theirs = sealRecord(keys, { ...RECORD, givenNames: "Max" }, otherPerson);
    expect(errorReason(() => openRecord(keys, theirs, AAD))).toBe("failed");
    expect(errorReason(() => openRecord(keys, sealed, otherPerson))).toBe("failed");
  });

  it("detects manipulation of ciphertext, tag and nonce", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const keys = ring("t202701");
    const sealed = sealRecord(keys, RECORD, AAD);
    const flipped = Buffer.from(sealed.ciphertext);
    flipped[0] = (flipped[0] ?? 0) ^ 1;
    expect(errorReason(() => openRecord(keys, { ...sealed, ciphertext: flipped }, AAD))).toBe(
      "failed",
    );
    const tag = Buffer.from(sealed.ciphertext);
    tag[tag.length - 1] = (tag[tag.length - 1] ?? 0) ^ 1;
    expect(errorReason(() => openRecord(keys, { ...sealed, ciphertext: tag }, AAD))).toBe("failed");
    const nonce = Buffer.from(sealed.nonce);
    nonce[0] = (nonce[0] ?? 0) ^ 1;
    expect(errorReason(() => openRecord(keys, { ...sealed, nonce }, AAD))).toBe("failed");
    expect(
      errorReason(() =>
        openRecord(keys, { ...sealed, ciphertext: sealed.ciphertext.subarray(0, 10) }, AAD),
      ),
    ).toBe("failed");
    // Only the fixed counter name is logged – no ids, no values.
    expect(info).toHaveBeenCalledWith("travel_data.decrypt_failed");
    for (const call of info.mock.calls) {
      expect(JSON.stringify(call)).not.toContain(AAD.userId);
      expect(JSON.stringify(call)).not.toContain("Musterfrau");
    }
  });

  it("rejects an unknown key id and another key with the same id", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const keys = ring("t202701");
    const sealed = sealRecord(keys, RECORD, AAD);
    expect(errorReason(() => openRecord(ring("t209901"), sealed, AAD))).toBe("unknownKey");
    expect(info).toHaveBeenCalledWith("travel_data.decrypt_unknown_key");
    expect(errorReason(() => openRecord(ring("t202701"), sealed, AAD))).toBe("failed");
  });

  it("rotation: old rows stay readable, re-sealing moves them to the active key", () => {
    const old = ring("t202606");
    const sealed = sealRecord(old, RECORD, AAD);
    const oldKey = old.byId.get("t202606")?.toString("base64") ?? "";
    const rotated = keyRingFrom({
      kind: "ring",
      keys: [
        { kid: "t202701", base64: key() },
        { kid: "t202606", base64: oldKey },
      ],
    });
    if (!rotated) throw new Error("no ring");
    expect(openRecord(rotated, sealed, AAD)).toEqual(RECORD);
    const moved = resealRecord(rotated, sealed, AAD);
    expect(moved.keyId).toBe("t202701");
    expect(moved.nonce.equals(sealed.nonce)).toBe(false);
    expect(openRecord(rotated, moved, AAD)).toEqual(RECORD);
    // Once the old key is removed, only the re-sealed row is readable.
    const newOnly = keyRingFrom({
      kind: "ring",
      keys: [{ kid: "t202701", base64: rotated.active.key.toString("base64") }],
    });
    if (!newOnly) throw new Error("no ring");
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    expect(openRecord(newOnly, moved, AAD)).toEqual(RECORD);
    expect(errorReason(() => openRecord(newOnly, sealed, AAD))).toBe("unknownKey");
  });

  it("derives the demo key from BETTER_AUTH_SECRET only in demo-like modes (kid «demo»)", () => {
    const secret = "x".repeat(44);
    const dev = currentKeyRing({ APP_ENV: "development", BETTER_AUTH_SECRET: secret });
    expect(dev?.active.kid).toBe("demo");
    const preview = currentKeyRing({ APP_ENV: "preview", BETTER_AUTH_SECRET: secret });
    expect(preview?.active.key.equals(dev?.active.key ?? Buffer.alloc(0))).toBe(true);
    // Derived key ≠ the secret itself (domain separation).
    expect(dev?.active.key.toString("base64")).not.toBe(secret);
    expect(currentKeyRing({ APP_ENV: "production", BETTER_AUTH_SECRET: secret })).toBeNull();
    expect(currentKeyRing({ APP_ENV: "staging", BETTER_AUTH_SECRET: secret })).toBeNull();
    expect(currentKeyRing({ APP_ENV: "development" })).toBeNull();
    const explicit = currentKeyRing({
      APP_ENV: "production",
      BETTER_AUTH_SECRET: secret,
      TRAVEL_DATA_KEYS: `t202701:${key()}`,
    });
    expect(explicit?.active.kid).toBe("t202701");
  });

  it("the AAD names the schema version and all three ids", () => {
    expect(aadOf(AAD).toString("utf8")).toBe(
      `ww-travel-data|v1|${AAD.tripId}|${AAD.requestId}|${AAD.userId}`,
    );
  });
});
