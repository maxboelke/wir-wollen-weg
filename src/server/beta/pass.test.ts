import { describe, expect, it } from "vitest";
import {
  PASS_MAX_AGE_SECONDS,
  codeKid,
  inviteTokenHash,
  matchBetaCode,
  readBetaPass,
  readInvitePass,
  signBetaPass,
  signInvitePass,
} from "./pass";

const SECRET = "test-only-secret-0123456789abcdefghijklmnop";
const CODES = ["sonnekoffer27", "neuercode2027"];
const now = Date.UTC(2026, 9, 30, 12);

describe("matchBetaCode (§0.12.5 Nr. 6)", () => {
  it("matches any configured code after normalisation and returns its key id", () => {
    expect(matchBetaCode("Sonne-Koffer 27", CODES)).toBe(codeKid("sonnekoffer27"));
    expect(matchBetaCode("NEUER code-2027", CODES)).toBe(codeKid("neuercode2027"));
    expect(matchBetaCode("falsch-falsch-1", CODES)).toBeNull();
    expect(matchBetaCode("", CODES)).toBeNull();
    expect(codeKid("sonnekoffer27")).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("beta pass (§0.12.5 Nr. 2)", () => {
  const pass = {
    v: 1 as const,
    iat: now,
    kid: codeKid("sonnekoffer27"),
    consent: null,
    consentAt: null,
  };

  it("round-trips and never contains the code", () => {
    const raw = signBetaPass(pass, SECRET);
    expect(raw).not.toContain("sonne");
    expect(Buffer.from(raw.split(".")[0] ?? "", "base64url").toString()).not.toContain("sonne");
    expect(readBetaPass(raw, SECRET, CODES, now + 1000)).toEqual(pass);
  });

  it("rejects tampering, another secret and age ≥ 24 h", () => {
    const raw = signBetaPass(pass, SECRET);
    const [body, mac] = raw.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...pass, consent: "beta-1", consentAt: now }),
    ).toString("base64url");
    expect(readBetaPass(`${forged}.${mac ?? ""}`, SECRET, CODES, now)).toBeNull();
    expect(readBetaPass(`${body ?? ""}.x`, SECRET, CODES, now)).toBeNull();
    expect(readBetaPass(raw, `${SECRET}-other`, CODES, now)).toBeNull();
    expect(readBetaPass(raw, SECRET, CODES, now + PASS_MAX_AGE_SECONDS * 1000)).toBeNull();
    expect(readBetaPass(undefined, SECRET, CODES, now)).toBeNull();
    expect(readBetaPass("garbage", SECRET, CODES, now)).toBeNull();
  });

  it("rotation: removing the code ends its open passes (kid)", () => {
    const raw = signBetaPass(pass, SECRET);
    expect(readBetaPass(raw, SECRET, ["neuercode2027"], now)).toBeNull();
  });
});

describe("invite pass (§0.12.5 Nr. 9)", () => {
  it("holds only the token hash and is signed with its own key", () => {
    const token = "abcdefghijklmnopqrstuvwxyz012345";
    const invite = {
      v: 1 as const,
      iat: now,
      tokenHash: inviteTokenHash(token),
      tripId: "0199-trip",
      consent: "beta-1",
      consentAt: now,
    };
    const raw = signInvitePass(invite, SECRET);
    expect(Buffer.from(raw.split(".")[0] ?? "", "base64url").toString()).not.toContain(token);
    expect(readInvitePass(raw, SECRET, now)).toEqual(invite);
    // Different HKDF info: a beta-pass signature is no invite-pass signature.
    const asBeta = signBetaPass(
      { v: 1, iat: now, kid: codeKid("sonnekoffer27"), consent: "beta-1", consentAt: now },
      SECRET,
    );
    expect(readInvitePass(asBeta, SECRET, now)).toBeNull();
    expect(readInvitePass(raw, SECRET, now + PASS_MAX_AGE_SECONDS * 1000)).toBeNull();
  });
});
