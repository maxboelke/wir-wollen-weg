import { describe, expect, it } from "vitest";
import { authErrorFromResponse } from "./auth-errors";

describe("authErrorFromResponse (Flow A.2 texts)", () => {
  it("shows remaining attempts from the 2nd wrong code on", () => {
    expect(authErrorFromResponse(400, { code: "INVALID_OTP", remainingAttempts: 4 }, null)).toEqual(
      {
        key: "wrongCode",
      },
    );
    expect(authErrorFromResponse(400, { code: "INVALID_OTP", remainingAttempts: 3 }, null)).toEqual(
      {
        key: "wrongCodeRemaining",
        count: 3,
      },
    );
    expect(authErrorFromResponse(400, { code: "INVALID_OTP" }, null)).toEqual({ key: "wrongCode" });
  });

  it("maps lock, expiry and per-address limits", () => {
    expect(authErrorFromResponse(403, { code: "TOO_MANY_ATTEMPTS" }, null).key).toBe(
      "tooManyAttempts",
    );
    expect(authErrorFromResponse(400, { code: "OTP_EXPIRED" }, null).key).toBe("expired");
    expect(authErrorFromResponse(429, { code: "EMAIL_LOCKED", retryAfter: 1800 }, null)).toEqual({
      key: "locked",
      minutes: 30,
    });
    expect(
      authErrorFromResponse(429, { code: "EMAIL_RATE_LIMITED", retryAfter: 90 }, null),
    ).toEqual({
      key: "rateLimited",
      minutes: 2,
    });
    // Better Auth's IP limiter: wait time only in the header
    expect(authErrorFromResponse(429, {}, "45")).toEqual({ key: "rateLimited", minutes: 1 });
  });

  it("maps password errors and falls back to the generic text", () => {
    expect(authErrorFromResponse(401, { code: "INVALID_EMAIL_OR_PASSWORD" }, null).key).toBe(
      "passwordWrong",
    );
    expect(authErrorFromResponse(400, { code: "PASSWORD_COMMON" }, null).key).toBe(
      "passwordCommon",
    );
    expect(authErrorFromResponse(500, {}, null).key).toBe("generic");
  });
});
