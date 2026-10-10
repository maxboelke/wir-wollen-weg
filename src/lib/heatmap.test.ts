import { describe, expect, it } from "vitest";
import { cellCount, daySummary, heatLevel, tallyDay, toParticipant } from "./heatmap";

const person = (id: string, no: string[] = [], maybe: string[] = []) =>
  toParticipant(id, [
    ...no.map((d) => [d, "no"] as const),
    ...maybe.map((d) => [d, "maybe"] as const),
  ]);

const DAY = "2027-05-10";

describe("tallyDay – counting rule U-4", () => {
  it("counts only «Geht» in x, n = participants, unmarked days count as «Geht»", () => {
    const tally = tallyDay(DAY, [
      person("lena"),
      person("jonas", [DAY]),
      person("tim", [], [DAY]),
      person("anna"),
    ]);
    expect(tally).toMatchObject({
      x: 2,
      n: 4,
      yes: ["lena", "anna"],
      maybe: ["tim"],
      no: ["jonas"],
      allYes: false,
      anyMaybe: true,
      noneBlocked: false,
    });
    // «Zur Not» counts half in the intensity: (2 + 0.5) / 4
    expect(tally.score).toBeCloseTo(0.625);
    expect(tally.level).toBe("some");
  });

  it("✓ only when everybody has «Geht»; a «Zur Not» day without «Geht nicht» shows ◐ instead", () => {
    const all = tallyDay(DAY, [person("a"), person("b")]);
    expect(all.allYes).toBe(true);
    expect(all.anyMaybe).toBe(false);
    expect(all.level).toBe("all");

    const maybe = tallyDay(DAY, [person("a"), person("b", [], [DAY])]);
    expect(maybe.allYes).toBe(false);
    expect(maybe.anyMaybe).toBe(true);
    expect(maybe.noneBlocked).toBe(true);
    expect(maybe.level).toBe("many");
  });

  it("nobody submitted → no data, neither ✓ nor «Alle dabei»", () => {
    const tally = tallyDay(DAY, []);
    expect(tally).toMatchObject({ x: 0, n: 0, level: "nodata", allYes: false, noneBlocked: false });
    expect(daySummary(tally)).toEqual({ kind: "nodata" });
  });

  it("nobody can → level «none»", () => {
    expect(tallyDay(DAY, [person("a", [DAY]), person("b", [DAY])]).level).toBe("none");
  });
});

describe("heatLevel thresholds (design-system §6.2)", () => {
  it.each([
    [0, 0, 0, "nodata"],
    [0, 0, 5, "none"],
    [1, 0, 5, "few"],
    [0, 1, 5, "few"],
    [2, 1, 5, "some"],
    [3, 1, 5, "some"],
    [4, 0, 5, "many"],
    [4, 1, 5, "many"],
    [5, 0, 5, "all"],
  ] as const)("geht %i, zur Not %i of %i → %s", (yes, maybe, n, level) => {
    expect(heatLevel(yes, maybe, n)).toBe(level);
  });
});

describe("cellCount", () => {
  it("«x/n», on phones only «x» from n ≥ 10, «–» without data", () => {
    expect(cellCount({ x: 4, n: 5 }, true)).toBe("4/5");
    expect(cellCount({ x: 4, n: 9 }, true)).toBe("4/9");
    expect(cellCount({ x: 7, n: 10 }, true)).toBe("7");
    expect(cellCount({ x: 7, n: 10 }, false)).toBe("7/10");
    expect(cellCount({ x: 0, n: 0 }, true)).toBe("–");
  });
});

describe("daySummary", () => {
  it("all · everyone's in with k only if needed · who can't", () => {
    expect(daySummary(tallyDay(DAY, [person("a")]))).toEqual({ kind: "all" });
    expect(daySummary(tallyDay(DAY, [person("a"), person("b", [], [DAY])]))).toEqual({
      kind: "maybe",
      count: 1,
    });
    expect(
      daySummary(tallyDay(DAY, [person("a", [DAY]), person("b", [], [DAY]), person("c", [DAY])])),
    ).toEqual({ kind: "no", ids: ["a", "c"] });
  });
});
