import { describe, expect, it } from "vitest";
import { readCookie } from "./cookies";
import { countInRange, isPwnedOnline } from "./hibp";

describe("readCookie", () => {
  it("reads exact names only and decodes values", () => {
    const header = "other-lang=en; lang=de; ww-lang-at=1800000000000; x=a%20b";
    expect(readCookie(header, "lang")).toBe("de");
    expect(readCookie(header, "ww-lang-at")).toBe("1800000000000");
    expect(readCookie(header, "x")).toBe("a b");
    expect(readCookie(header, "missing")).toBeUndefined();
    expect(readCookie(undefined, "lang")).toBeUndefined();
  });
});

describe("Have I Been Pwned range lookup (optional, PASSWORD_BREACH_CHECK=hibp)", () => {
  it("finds the suffix in a range response", () => {
    expect(
      countInRange(
        "0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493",
        "1E4C9B93F3F0682250B6CF8331B7EE68FD8",
      ),
    ).toBe(3861493);
    expect(countInRange("AAAA:1", "BBBB")).toBe(0);
  });

  it("sends only the 5-char prefix and fails open", async () => {
    const calls: string[] = [];
    // SHA-1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    const fetcher = (url: string) => {
      calls.push(url);
      return Promise.resolve(new Response("1E4C9B93F3F0682250B6CF8331B7EE68FD8:42\r\n"));
    };
    expect(await isPwnedOnline("password", fetcher as unknown as typeof fetch)).toBe(true);
    expect(calls).toEqual(["https://api.pwnedpasswords.com/range/5BAA6"]);
    const failing: typeof fetch = () => Promise.reject(new Error("offline"));
    expect(await isPwnedOnline("password", failing)).toBe(false);
  });
});
