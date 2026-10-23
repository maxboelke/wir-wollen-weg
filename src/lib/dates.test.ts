import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  appTimeZone,
  DEFAULT_TIME_ZONE,
  diffDays,
  formatDate,
  formatDateRange,
  isIsoDate,
  isoDateInZone,
  isValidTimeZone,
  presetRange,
  summerYear,
  todayIso,
} from "./dates";

describe("ISO calendar days", () => {
  it("accepts only real dates", () => {
    expect(isIsoDate("2027-05-01")).toBe(true);
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2027-5-1")).toBe(false);
    expect(isIsoDate(20270501)).toBe(false);
  });

  it("adds days and months across boundaries (no DST shifts)", () => {
    expect(addDays("2027-03-27", 2)).toBe("2027-03-29");
    expect(addDays("2027-12-31", 1)).toBe("2028-01-01");
    expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(addMonths("2027-05-01", 12)).toBe("2028-05-01");
    expect(diffDays("2027-05-01", "2027-05-06")).toBe(5);
    expect(diffDays("2027-05-06", "2027-05-01")).toBe(-5);
  });
});

describe("today in the app time zone (R-072)", () => {
  const berlin = "Europe/Berlin";
  const at = (iso: string) => new Date(iso);

  it("defaults to Europe/Berlin, not the runtime's zone", () => {
    expect(appTimeZone()).toBe(DEFAULT_TIME_ZONE);
    // 00:30 CEST on 23 Oct = 22:30 UTC on 22 Oct.
    expect(todayIso(at("2026-10-22T22:30:00Z"))).toBe("2026-10-23");
  });

  it("summer time (CEST, UTC+2): 23:30 and 00:30 local", () => {
    expect(todayIso(at("2027-07-14T21:30:00Z"), berlin)).toBe("2027-07-14"); // 23:30
    expect(todayIso(at("2027-07-14T22:30:00Z"), berlin)).toBe("2027-07-15"); // 00:30
    expect(todayIso(at("2027-07-14T23:59:00Z"), berlin)).toBe("2027-07-15"); // 01:59
  });

  it("winter time (CET, UTC+1): 23:30 and 00:30 local", () => {
    expect(todayIso(at("2027-01-14T22:30:00Z"), berlin)).toBe("2027-01-14"); // 23:30
    expect(todayIso(at("2027-01-14T23:30:00Z"), berlin)).toBe("2027-01-15"); // 00:30
    expect(todayIso(at("2026-12-31T23:00:00Z"), berlin)).toBe("2027-01-01"); // new year
  });

  it("across the DST switches", () => {
    // Spring forward 28 Mar 2027 (02:00 → 03:00): 00:30 CET = 23:30 UTC the day before.
    expect(todayIso(at("2027-03-27T23:30:00Z"), berlin)).toBe("2027-03-28");
    expect(todayIso(at("2027-03-28T21:30:00Z"), berlin)).toBe("2027-03-28"); // 23:30 CEST
    expect(todayIso(at("2027-03-28T22:30:00Z"), berlin)).toBe("2027-03-29"); // 00:30 CEST
    // Fall back 31 Oct 2027 (03:00 → 02:00): 00:30 CEST = 22:30 UTC the day before.
    expect(todayIso(at("2027-10-30T22:30:00Z"), berlin)).toBe("2027-10-31");
    expect(todayIso(at("2027-10-31T22:30:00Z"), berlin)).toBe("2027-10-31"); // 23:30 CET
    expect(todayIso(at("2027-10-31T23:30:00Z"), berlin)).toBe("2027-11-01"); // 00:30 CET
  });

  it("the time zone is exchangeable (later: per trip)", () => {
    const instant = at("2027-05-01T03:00:00Z");
    expect(todayIso(instant, "UTC")).toBe("2027-05-01");
    expect(todayIso(instant, "America/New_York")).toBe("2027-04-30");
    expect(todayIso(instant, "Pacific/Auckland")).toBe("2027-05-01");
    expect(isoDateInZone(at("2027-05-01T13:00:00Z"), "Pacific/Auckland")).toBe("2027-05-02");
  });

  it("APP_TIME_ZONE configures it; unknown names fall back to Berlin", () => {
    const before = process.env.APP_TIME_ZONE;
    try {
      process.env.APP_TIME_ZONE = "America/New_York";
      expect(appTimeZone()).toBe("America/New_York");
      expect(todayIso(at("2027-05-01T03:00:00Z"))).toBe("2027-04-30");
      process.env.APP_TIME_ZONE = "Mars/Olympus";
      expect(appTimeZone()).toBe(DEFAULT_TIME_ZONE);
      expect(isValidTimeZone("Mars/Olympus")).toBe(false);
      expect(isoDateInZone(at("2027-05-01T23:30:00Z"), "Mars/Olympus")).toBe("2027-05-02");
    } finally {
      if (before === undefined) delete process.env.APP_TIME_ZONE;
      else process.env.APP_TIME_ZONE = before;
    }
  });
});

describe("quick range presets (W05)", () => {
  it("next 3 / 6 months start today", () => {
    expect(presetRange("next3", "2027-01-15")).toEqual({ start: "2027-01-15", end: "2027-04-14" });
    expect(presetRange("next6", "2027-01-15")).toEqual({ start: "2027-01-15", end: "2027-07-14" });
  });

  it("summer is this year's until June, then next year's", () => {
    expect(summerYear("2027-05-31")).toBe(2027);
    expect(summerYear("2027-06-01")).toBe(2028);
    expect(presetRange("summer", "2027-02-01")).toEqual({ start: "2027-06-01", end: "2027-08-31" });
  });
});

describe("formatting (ux-spec §8)", () => {
  it("shows the year only when needed and joins with an en dash", () => {
    expect(formatDateRange("2027-05-05", "2027-05-10", "de-DE", { today: "2027-01-01" })).toBe(
      "5.–10. Mai",
    );
    const crossing = formatDateRange("2026-12-20", "2027-01-06", "de-DE", { today: "2026-10-09" });
    expect(crossing).toContain("2026");
    expect(crossing).toContain("2027");
    // ICU puts thin spaces around the dash – compare with plain spaces.
    expect(
      formatDateRange("2027-05-01", "2027-06-30", "en-GB", { today: "2026-10-09" }).replace(
        /\s/g,
        " ",
      ),
    ).toBe("1 May – 30 June 2027");
  });

  it("formats single dates with weekday", () => {
    expect(formatDate("2027-05-01", "de-DE")).toBe("Sa., 1. Mai 2027");
    expect(formatDate("2027-05-01", "en-GB", { weekday: true, year: false })).toBe("Sat 1 May");
  });
});
