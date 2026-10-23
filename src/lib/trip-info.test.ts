import { describe, expect, it } from "vitest";
import {
  cleanInfoText,
  firstLine,
  INFO_LIMITS,
  isInfoEmpty,
  linkParts,
  mapsHref,
  telHref,
  validateInfo,
} from "./trip-info";

describe("cleanInfoText (W22 C: control characters removed, empty = null)", () => {
  it("single line: control characters and line breaks collapse to spaces", () => {
    expect(cleanInfoText("  Kamena\u0000 Kuća\n ", false)).toBe("Kamena Kuća");
    expect(cleanInfoText("   ", false)).toBeNull();
    expect(cleanInfoText(42, false)).toBeNull();
  });

  it("multi line: keeps line breaks, removes other control characters, max. one blank line", () => {
    expect(cleanInfoText("Fähre 9:30\r\n\r\n\r\nTickets\u0007 bei Lena  \n", true)).toBe(
      "Fähre 9:30\n\nTickets bei Lena",
    );
  });
});

describe("validateInfo (F-033, I8-10)", () => {
  it("everything optional – all empty is valid and «empty»", () => {
    const result = validateInfo({});
    expect(result.ok).toBe(true);
    expect(isInfoEmpty(result.values)).toBe(true);
  });

  it("limits per field (code points)", () => {
    const ok = validateInfo({ stayName: "x".repeat(INFO_LIMITS.stayName) });
    expect(ok.ok).toBe(true);
    const tooLong = validateInfo({
      stayName: "x".repeat(INFO_LIMITS.stayName + 1),
      notes: "😀".repeat(INFO_LIMITS.notes),
    });
    expect(tooLong.ok).toBe(false);
    if (!tooLong.ok) expect(tooLong.errors).toEqual({ stayName: "tooLong" });
  });

  it("check-in/-out only as HH:MM", () => {
    expect(validateInfo({ checkIn: "15:00", checkOut: "09:30" }).ok).toBe(true);
    const bad = validateInfo({ checkIn: "25:00", checkOut: "ab 10" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors).toEqual({ checkIn: "time", checkOut: "time" });
  });

  it("phone: only +, digits, spaces, / - ( )", () => {
    expect(validateInfo({ emergencyPhone: "+385 (21) 123-45/6" }).ok).toBe(true);
    const bad = validateInfo({ emergencyPhone: "call Ana" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors).toEqual({ emergencyPhone: "phone" });
  });
});

describe("display helpers", () => {
  it("first line of the meeting point", () => {
    expect(firstLine("\nTreffpunkt 6:15 · Flughafen T2\nBordkarten bei Lena")).toBe(
      "Treffpunkt 6:15 · Flughafen T2",
    );
    expect(firstLine(null)).toBeNull();
  });

  it("tel: link with + and digits only", () => {
    expect(telHref("+385 (21) 123-456")).toBe("tel:+38521123456");
    expect(telHref("0049+89")).toBe("tel:004989");
    expect(telHref("()")).toBeNull();
  });

  it("drops the «(0)» after a country code, nowhere else", () => {
    expect(telHref("+49 (0) 30 1234")).toBe("tel:+49301234");
    expect(telHref("+49(0)171 234567")).toBe("tel:+49171234567");
    expect(telHref("0049 (0) 89 123")).toBe("tel:004989123");
    expect(telHref("+41 ( 0 ) 44 123")).toBe("tel:+4144123");
    expect(telHref("030 (0) 1234")).toBe("tel:03001234"); // no country code – keep as typed
    expect(telHref("+385 (21) 123-456")).toBe("tel:+38521123456");
    expect(telHref("+49 (030) 1234")).toBe("tel:+490301234"); // not «(0)» – unchanged
  });

  it("maps link encodes the address, nothing else", () => {
    expect(mapsHref("Put Zlatnog rata 8,\n21420 Bol")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Put%20Zlatnog%20rata%208%2C%2021420%20Bol",
    );
  });

  it("links: https only, trailing punctuation stays text, no javascript:/http:", () => {
    expect(linkParts("Playlist: https://example.org/list?a=1. Danke")).toEqual([
      { kind: "text", text: "Playlist: " },
      { kind: "link", href: "https://example.org/list?a=1", text: "https://example.org/list?a=1" },
      { kind: "text", text: ". Danke" },
    ]);
    expect(linkParts("http://example.org javascript:alert(1) <b>x</b>")).toEqual([
      { kind: "text", text: "http://example.org javascript:alert(1) <b>x</b>" },
    ]);
    expect(linkParts("https://localhost")).toEqual([{ kind: "text", text: "https://localhost" }]);
  });
});

describe("formatTime", () => {
  it("formats HH:MM in the viewer's format", async () => {
    const { formatTime } = await import("./trip-info");
    expect(formatTime("15:00", "de-DE")).toBe("15:00");
    expect(formatTime("09:30", "en-US")).toMatch(/^9:30\s?AM$/);
    expect(formatTime("x", "de-DE")).toBe("x");
  });
});
