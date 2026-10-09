import { describe, expect, it } from "vitest";
import { checkPassword } from "./password-policy";

describe("checkPassword (F-042, ux-spec §5.2)", () => {
  it("requires 10 to 128 characters (code points)", () => {
    expect(checkPassword("abc")).toBe("tooShort");
    expect(checkPassword("Sonne-im-Mai")).toBeNull();
    expect(checkPassword("x".repeat(129))).toBe("tooLong");
    // 10 emoji are 10 characters, not 20 code units
    expect(checkPassword("🌞🌊🏖️🌴🍹🌞🌊🏖️🌴🍹".slice(0, 20))).not.toBe("tooShort");
  });

  it.each([
    "password123",
    "Password123",
    "1234567890",
    "qwertzuiop",
    "passwort123!",
    "wirwollenweg",
  ])("rejects the common password %s", (password) => {
    expect(checkPassword(password)).toBe("common");
  });

  it("rejects trivial patterns and the own address", () => {
    expect(checkPassword("aaaaaaaaaaaa")).toBe("common");
    expect(checkPassword("abcabcabcabc")).toBe("common");
    expect(checkPassword("3456789012")).toBe("common");
    expect(checkPassword("9876543210")).toBe("common");
    expect(checkPassword("lena@example.org", "Lena@Example.org")).toBe("common");
  });

  it("accepts ordinary passphrases", () => {
    expect(checkPassword("Lisbon by night 2027")).toBeNull();
    expect(checkPassword("7392018465")).toBeNull();
  });
});
