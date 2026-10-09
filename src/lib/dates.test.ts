import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  diffDays,
  formatDate,
  formatDateRange,
  isIsoDate,
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

  it("today is the local calendar day", () => {
    expect(todayIso(new Date(2027, 4, 1, 23, 59))).toBe("2027-05-01");
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
