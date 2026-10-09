import { describe, expect, it } from "vitest";
import {
  checkEntries,
  cleanComment,
  fromEntries,
  isImportFeedback,
  MAX_ENTRIES,
  paint,
  paintTarget,
  pushHistory,
  quickActionTargets,
  paintEach,
  replay,
  stateOf,
  toEntries,
  type StateMap,
} from "./availability";

describe("paintTarget («erster Tag entscheidet», Flow B.2)", () => {
  it("applies the brush, resets when the day already has it", () => {
    expect(paintTarget("yes", "no")).toBe("no");
    expect(paintTarget("maybe", "no")).toBe("no");
    expect(paintTarget("no", "no")).toBe("yes");
    expect(paintTarget("maybe", "maybe")).toBe("yes");
    expect(paintTarget("no", "yes")).toBe("yes");
    expect(paintTarget("yes", "yes")).toBe("yes");
  });
});

describe("paint / replay", () => {
  const start: StateMap = { "2027-05-14": "no" };

  it("only reports real changes and never stores «geht»", () => {
    const { map, changes } = paint(start, ["2027-05-13", "2027-05-14", "2027-05-15"], "no");
    expect(changes.map((c) => c.date)).toEqual(["2027-05-13", "2027-05-15"]);
    expect(map).toEqual({ "2027-05-13": "no", "2027-05-14": "no", "2027-05-15": "no" });
    const reset = paint(map, ["2027-05-14"], "yes");
    expect(reset.map).not.toHaveProperty("2027-05-14");
    expect(stateOf(reset.map, "2027-05-14")).toBe("yes");
  });

  it("undoes and redoes a step exactly", () => {
    const step = paint(start, ["2027-05-14", "2027-05-15"], "maybe");
    expect(replay(step.map, step.changes, true)).toEqual(start);
    expect(replay(start, step.changes, false)).toEqual(step.map);
  });

  it("keeps at most 20 undo steps", () => {
    let stack: number[] = [];
    for (let i = 0; i < 25; i++) stack = pushHistory(stack, i);
    expect(stack).toHaveLength(20);
    expect(stack[0]).toBe(5);
  });

  it("paints mixed targets per day", () => {
    const { map, changes } = paintEach({}, [
      ["2027-05-14", "maybe"],
      ["2027-05-15", "yes"],
    ]);
    expect(map).toEqual({ "2027-05-14": "maybe" });
    expect(changes).toHaveLength(1);
  });
});

describe("quick actions", () => {
  // Thu 27 May 2027 = holiday (Fronleichnam, DE-BY); 29/30 May weekend
  const days = ["2027-05-26", "2027-05-27", "2027-05-28", "2027-05-29", "2027-05-30"];
  const holidays = new Set(["2027-05-27"]);
  const map: StateMap = { "2027-05-28": "no", "2027-05-29": "no", "2027-05-27": "maybe" };

  it("weekdays Mo–Fr «zur Not»: unmarked workdays only, holidays excluded", () => {
    expect(quickActionTargets("workdaysMaybe", map, days, holidays)).toEqual([
      ["2027-05-26", "maybe"],
    ]);
  });

  it("weekends and holidays «geht», reset all", () => {
    expect(quickActionTargets("weekendsYes", map, days, holidays).map(([d]) => d)).toEqual([
      "2027-05-29",
      "2027-05-30",
    ]);
    expect(quickActionTargets("holidaysYes", map, days, holidays)).toEqual([["2027-05-27", "yes"]]);
    expect(quickActionTargets("reset", map, days, holidays)).toHaveLength(5);
  });
});

describe("entries", () => {
  it("round-trips sorted and filtered", () => {
    const map: StateMap = { "2027-05-20": "maybe", "2027-05-10": "no" };
    expect(toEntries(map)).toEqual([
      ["2027-05-10", "no"],
      ["2027-05-20", "maybe"],
    ]);
    expect(toEntries(map, (d) => d > "2027-05-15")).toEqual([["2027-05-20", "maybe"]]);
    expect(fromEntries(toEntries(map))).toEqual(map);
  });
});

describe("checkEntries (server validation)", () => {
  const range = { start: "2027-05-01", end: "2027-06-30" };
  it("accepts well-formed days in the search range", () => {
    expect(
      checkEntries(
        [
          ["2027-05-01", "no"],
          ["2027-06-30", "maybe"],
        ],
        range,
      ),
    ).toEqual({
      ok: true,
      entries: [
        ["2027-05-01", "no"],
        ["2027-06-30", "maybe"],
      ],
    });
    expect(checkEntries([], range)).toEqual({ ok: true, entries: [] });
  });

  it("rejects days outside the range, bad shapes, «yes», fake dates and duplicates", () => {
    expect(checkEntries([["2027-07-01", "no"]], range)).toEqual({
      ok: false,
      reason: "outsideRange",
    });
    expect(checkEntries([["2027-04-30", "no"]], range).ok).toBe(false);
    expect(checkEntries([["2027-05-02", "yes"]], range).ok).toBe(false);
    expect(checkEntries([["2027-02-30", "no"]], range).ok).toBe(false);
    expect(checkEntries([["2027-05-02"]], range).ok).toBe(false);
    expect(checkEntries("2027-05-02", range).ok).toBe(false);
    expect(checkEntries({ 0: ["2027-05-02", "no"] }, range).ok).toBe(false);
    expect(
      checkEntries(
        [
          ["2027-05-02", "no"],
          ["2027-05-02", "maybe"],
        ],
        range,
      ),
    ).toEqual({ ok: false, reason: "duplicate" });
    expect(
      checkEntries(
        Array.from({ length: MAX_ENTRIES + 1 }, () => ["2027-05-02", "no"]),
        range,
      ).ok,
    ).toBe(false);
  });
});

describe("comment and feedback", () => {
  it("trims and collapses whitespace; empty means no comment", () => {
    expect(cleanComment("  Juli   nur\nmit Kindern ")).toBe("Juli nur mit Kindern");
    expect(cleanComment("   ")).toBeNull();
  });

  it("knows the feedback answers", () => {
    expect(isImportFeedback("google")).toBe(true);
    expect(isImportFeedback("icloud")).toBe(false);
  });
});
