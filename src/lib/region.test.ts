import { describe, expect, it } from "vitest";
import {
  firstDayOfWeek,
  formatLongDate,
  formattingLocale,
  isSubdivisionOf,
  PREVIEW_DATE,
  regionFromAcceptLanguage,
  SUBDIVISIONS,
  weekdayName,
} from "./region";

describe("region (F-046, Flow F.1)", () => {
  it.each([
    ["de-AT,de;q=0.9", "de", "AT"],
    ["de-CH", "de", "CH"],
    ["en-US,en;q=0.9", "en", "US"],
    ["en-GB", "en", "GB"],
    ["en-UK", "en", "GB"],
    ["de", "de", "DE"],
    ["en", "en", "GB"],
    ["fr-FR,fr;q=0.9", "en", "GB"],
    ["en-AU", "en", "GB"],
  ] as const)("guesses the region from %s", (header, locale, expected) => {
    expect(regionFromAcceptLanguage(header, locale)).toBe(expected);
  });

  it("keeps language and region separate in Intl formats", () => {
    expect(formattingLocale("de", "AT")).toBe("de-AT");
    expect(formatLongDate(PREVIEW_DATE, "de", "DE")).toBe("Fr., 2. Juli 2027");
    // ICU versions differ in the comma after the weekday (Node 22 vs. browsers).
    expect(formatLongDate(PREVIEW_DATE, "en", "GB")).toMatch(/^Fri,? 2 July 2027$/);
    expect(formatLongDate(PREVIEW_DATE, "en", "US")).toBe("Fri, July 2, 2027");
  });

  it("starts the week on Sunday only for the US unless overridden", () => {
    expect(firstDayOfWeek("auto", "US")).toBe(0);
    expect(firstDayOfWeek("auto", "DE")).toBe(1);
    expect(firstDayOfWeek("auto", "GB")).toBe(1);
    expect(firstDayOfWeek("sun", "DE")).toBe(0);
    expect(firstDayOfWeek("mon", "US")).toBe(1);
    expect(weekdayName(1, "de")).toBe("Montag");
    expect(weekdayName(0, "en")).toBe("Sunday");
  });

  it("accepts subdivisions only for their own country (ISO 3166-2)", () => {
    expect(isSubdivisionOf("DE", "DE-BY")).toBe(true);
    expect(isSubdivisionOf("AT", "DE-BY")).toBe(false);
    expect(isSubdivisionOf("US", "US-CA")).toBe(false);
    expect(SUBDIVISIONS.DE).toHaveLength(16);
    expect(SUBDIVISIONS.AT).toHaveLength(9);
    expect(SUBDIVISIONS.CH).toHaveLength(26);
  });
});
