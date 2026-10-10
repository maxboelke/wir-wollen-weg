import { describe, expect, it } from "vitest";
import {
  buildMonths,
  datesBetween,
  editableWindow,
  isInWindow,
  isWeekend,
  isWorkday,
  moveInCalendar,
  orderedRange,
  weekdayColumns,
  weekdayOf,
} from "./calendar";

describe("weekdays", () => {
  it("knows weekends and workdays independent of the week start", () => {
    expect(weekdayOf("2027-05-01")).toBe(6); // Saturday
    expect(isWeekend("2027-05-01")).toBe(true);
    expect(isWeekend("2027-05-02")).toBe(true);
    expect(isWorkday("2027-05-03")).toBe(true);
    expect(isWorkday("2027-05-07")).toBe(true);
  });

  it("orders columns by week start (Monday DE/AT/CH/GB, Sunday US)", () => {
    expect(weekdayColumns(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekdayColumns(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("ranges", () => {
  it("lists days inclusive and in date order, also backwards and across months", () => {
    expect(datesBetween("2027-05-30", "2027-06-02")).toEqual([
      "2027-05-30",
      "2027-05-31",
      "2027-06-01",
      "2027-06-02",
    ]);
    expect(datesBetween("2027-06-02", "2027-05-30")).toEqual([]);
    expect(orderedRange("2027-05-19", "2027-05-13")).toHaveLength(7);
    expect(orderedRange("2027-05-19", "2027-05-13")[0]).toBe("2027-05-13");
  });

  it("handles leap days", () => {
    expect(datesBetween("2028-02-28", "2028-03-01")).toEqual([
      "2028-02-28",
      "2028-02-29",
      "2028-03-01",
    ]);
  });
});

describe("buildMonths", () => {
  it("builds full weeks with a Monday start (W08 example May 2027)", () => {
    const [may, june] = buildMonths("2027-05-01", "2027-06-30", 1);
    expect(may?.key).toBe("2027-05");
    expect(may?.weeks[0]).toEqual([null, null, null, null, null, "2027-05-01", "2027-05-02"]);
    expect(may?.weeks.at(-1)).toEqual(["2027-05-31", null, null, null, null, null, null]);
    expect(june?.weeks[0]?.[1]).toBe("2027-06-01");
    expect(may?.weeks.every((week) => week.length === 7)).toBe(true);
  });

  it("builds weeks with a Sunday start (US)", () => {
    const [may] = buildMonths("2027-05-10", "2027-05-20", 0);
    expect(may?.weeks[0]?.[6]).toBe("2027-05-01");
    expect(may?.weeks[1]?.[0]).toBe("2027-05-02");
  });

  it("covers every month of a range across the year change", () => {
    const months = buildMonths("2027-11-15", "2028-02-03", 1);
    expect(months.map((m) => m.key)).toEqual(["2027-11", "2027-12", "2028-01", "2028-02"]);
    expect(buildMonths("2027-05-02", "2027-05-01", 1)).toEqual([]);
  });
});

describe("editable window", () => {
  it("starts today when the range has begun and is empty when it is over", () => {
    expect(editableWindow("2027-05-01", "2027-06-30", "2027-05-03")).toEqual({
      first: "2027-05-03",
      last: "2027-06-30",
    });
    expect(editableWindow("2027-05-01", "2027-06-30", "2027-04-01")?.first).toBe("2027-05-01");
    expect(editableWindow("2027-05-01", "2027-06-30", "2027-07-01")).toBeNull();
    expect(isInWindow("2027-05-02", editableWindow("2027-05-01", "2027-06-30", "2027-05-03"))).toBe(
      false,
    );
  });
});

describe("moveInCalendar (ux-spec §7.3)", () => {
  const window = { first: "2027-05-03", last: "2027-06-30" };
  it("moves by day, week and month across month borders", () => {
    expect(moveInCalendar("2027-05-31", "ArrowRight", window, 1)).toBe("2027-06-01");
    expect(moveInCalendar("2027-05-28", "ArrowDown", window, 1)).toBe("2027-06-04");
    expect(moveInCalendar("2027-05-15", "PageDown", window, 1)).toBe("2027-06-15");
  });

  it("goes to the start/end of the week by week start", () => {
    // Thursday 6 May 2027
    expect(moveInCalendar("2027-05-06", "Home", window, 1)).toBe("2027-05-03");
    expect(moveInCalendar("2027-05-06", "End", window, 1)).toBe("2027-05-09");
    expect(moveInCalendar("2027-05-06", "Home", window, 0)).toBe("2027-05-03"); // clamped (Sun 2 May is past)
    expect(moveInCalendar("2027-05-13", "Home", window, 0)).toBe("2027-05-09");
    expect(moveInCalendar("2027-05-13", "End", window, 0)).toBe("2027-05-15");
  });

  it("clamps to the editable window and jumps to its ends with Ctrl/Cmd", () => {
    expect(moveInCalendar("2027-05-03", "ArrowLeft", window, 1)).toBe("2027-05-03");
    expect(moveInCalendar("2027-06-20", "PageDown", window, 1)).toBe("2027-06-30");
    expect(moveInCalendar("2027-05-20", "Home", window, 1, true)).toBe("2027-05-03");
    expect(moveInCalendar("2027-05-20", "End", window, 1, true)).toBe("2027-06-30");
  });
});
