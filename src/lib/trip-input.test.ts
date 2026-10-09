import { describe, expect, it } from "vitest";
import {
  emptyDraft,
  firstErrorField,
  parseRegion,
  parseStoredDraft,
  validateTrip,
  type TripDraft,
} from "./trip-input";

const TODAY = "2027-01-10";

function draft(patch: Partial<TripDraft> = {}): TripDraft {
  return {
    ...emptyDraft("DE"),
    name: "Lissabon 2027",
    rangeStart: "2027-05-01",
    rangeEnd: "2027-06-30",
    ...patch,
  };
}

function errorOf(
  patch: Partial<TripDraft>,
  options: { originalStart?: string; originalDeadline?: string | null } = {},
) {
  const result = validateTrip(draft(patch), { today: TODAY, ...options });
  return result.ok ? {} : result.errors;
}

describe("validateTrip (F-001, ux-spec §5.2)", () => {
  it("accepts a valid draft and normalises it", () => {
    const result = validateTrip(
      draft({
        name: "  Lissabon 2027 ",
        description: " ",
        preferredNights: "5",
        holidayRegion: "DE-BY",
      }),
      { today: TODAY },
    );
    expect(result).toEqual({
      ok: true,
      values: {
        name: "Lissabon 2027",
        rangeStart: "2027-05-01",
        rangeEnd: "2027-06-30",
        minNights: 4,
        preferredNights: 5,
        description: null,
        deadline: null,
        holidayCountry: "DE",
        holidaySubdivision: "DE-BY",
      },
    });
  });

  it("requires a name of 1–80 characters", () => {
    expect(errorOf({ name: "   " }).name).toEqual({ key: "nameRequired" });
    expect(errorOf({ name: "x".repeat(81) }).name).toEqual({ key: "nameTooLong" });
    expect(errorOf({ name: "x".repeat(80) }).name).toBeUndefined();
  });

  it("start today at the earliest – unless editing an unchanged start", () => {
    expect(errorOf({ rangeStart: "2027-01-09" }).rangeStart).toEqual({ key: "startInPast" });
    expect(errorOf({ rangeStart: TODAY }).rangeStart).toBeUndefined();
    expect(
      errorOf({ rangeStart: "2027-01-01" }, { originalStart: "2027-01-01" }).rangeStart,
    ).toBeUndefined();
  });

  it("end after start, at most 12 months, at least min nights + 1 day", () => {
    expect(errorOf({ rangeEnd: "2027-05-01" }).rangeEnd).toEqual({ key: "endBeforeStart" });
    expect(errorOf({ rangeEnd: "2028-04-30" }).rangeEnd).toBeUndefined();
    expect(errorOf({ rangeEnd: "2028-05-01" }).rangeEnd).toEqual({ key: "rangeTooLong" });
    // 4 nights need 5 days: 1.–5. May is enough, 1.–4. May is not.
    expect(errorOf({ rangeEnd: "2027-05-05" }).rangeEnd).toBeUndefined();
    expect(errorOf({ rangeEnd: "2027-05-04" }).rangeEnd).toEqual({
      key: "rangeTooShort",
      values: { nights: 4, days: 5 },
    });
    expect(errorOf({ rangeEnd: "" }).rangeEnd).toEqual({ key: "endRequired" });
  });

  it("nights 1–30, preferred ≥ minimum", () => {
    expect(errorOf({ minNights: "0" }).minNights).toEqual({ key: "nightsRange" });
    expect(errorOf({ minNights: "31" }).minNights).toEqual({ key: "nightsRange" });
    expect(errorOf({ minNights: "abc" }).minNights).toEqual({ key: "nightsRange" });
    expect(errorOf({ preferredNights: "3" }).preferredNights).toEqual({
      key: "preferredTooShort",
      values: { nights: 4 },
    });
    expect(errorOf({ preferredNights: "" }).preferredNights).toBeUndefined();
  });

  it("description ≤ 500, deadline between today and the end, region from the list", () => {
    expect(errorOf({ description: "x".repeat(501) }).description).toEqual({
      key: "descriptionTooLong",
    });
    expect(errorOf({ deadline: "2027-01-01" }).deadline).toEqual({ key: "deadlineInPast" });
    expect(errorOf({ deadline: "2027-07-01" }).deadline).toEqual({ key: "deadlineAfterEnd" });
    expect(errorOf({ deadline: "2027-04-01" }).deadline).toBeUndefined();
    // R-040: editing keeps an expired, unchanged deadline – a new past date is still refused.
    expect(
      errorOf({ deadline: "2027-01-01" }, { originalDeadline: "2027-01-01" }).deadline,
    ).toBeUndefined();
    expect(
      errorOf({ deadline: "2027-01-02" }, { originalDeadline: "2027-01-01" }).deadline,
    ).toEqual({ key: "deadlineInPast" });
    expect(errorOf({ holidayRegion: "FR" }).holidayRegion).toEqual({ key: "regionInvalid" });
    expect(errorOf({ holidayRegion: "DE-XX" }).holidayRegion).toEqual({ key: "regionInvalid" });
  });

  it("first faulty field follows the form order", () => {
    expect(
      firstErrorField({ deadline: { key: "deadlineInPast" }, name: { key: "nameRequired" } }),
    ).toBe("name");
  });
});

describe("helpers", () => {
  it("parses regions", () => {
    expect(parseRegion("CH")).toEqual({ country: "CH", subdivision: null });
    expect(parseRegion("GB-SCT")).toEqual({ country: "GB", subdivision: "GB-SCT" });
    expect(parseRegion("AT-DE-BY")).toBeNull();
  });

  it("accepts stored drafts only with the right shape", () => {
    expect(parseStoredDraft(draft())).toEqual(draft());
    expect(parseStoredDraft({ ...draft(), name: 5 })).toBeNull();
    expect(parseStoredDraft("x")).toBeNull();
  });
});
