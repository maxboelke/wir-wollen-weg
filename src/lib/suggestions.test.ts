import { describe, expect, it } from "vitest";
import { datesBetween } from "./calendar";
import { addDays } from "./dates";
import { toParticipant, type Participant } from "./heatmap";
import { holidaysInRange } from "./holidays";
import {
  compareSuggestions,
  computeSuggestions,
  effectiveMinNights,
  holidaysIn,
  noMatchHints,
  vacationDays,
  type Suggestion,
  type SuggestionInput,
} from "./suggestions";

const range = (a: string, b: string) => datesBetween(a, b);

function person(id: string, no: string[] = [], maybe: string[] = []): Participant {
  return toParticipant(id, [
    ...no.map((d) => [d, "no"] as const),
    ...maybe.map((d) => [d, "maybe"] as const),
  ]);
}

/**
 * The W09 example (docs/ux/wireframes/09-gruppe-heatmap.html): 5 of 7 submitted, minimum 4,
 * wish 5 nights, tolerance 1, today = Mon 3 May 2027 – heatmap and suggestions of the sketch
 * come from the same data, so the result must match the sketch.
 */
function w09(): SuggestionInput {
  return {
    from: "2027-05-03",
    to: "2027-06-30",
    minNights: 4,
    targetNights: 5,
    tolerance: 1,
    participants: [
      person("lena", [...range("2027-05-24", "2027-05-31")], ["2027-06-01", "2027-06-02"]),
      person(
        "jonas",
        [...range("2027-05-11", "2027-05-23"), ...range("2027-06-20", "2027-06-30")],
        ["2027-06-19"],
      ),
      person("tim", [
        "2027-05-03",
        "2027-05-04",
        ...range("2027-05-20", "2027-05-26"),
        ...range("2027-06-01", "2027-06-11"),
      ]),
      person(
        "anna",
        ["2027-05-11", "2027-05-12", ...range("2027-06-20", "2027-06-30")],
        ["2027-05-05", "2027-06-12"],
      ),
      person("paul", ["2027-05-03", "2027-05-04"], ["2027-05-10"]),
    ],
  };
}

const short = (list: Suggestion[]) =>
  list.map(
    (s) =>
      `${s.start}..${s.end} ${String(s.nights)}n -${s.missing.join("+")} ◐${String(s.maybeDays)}`,
  );

describe("computeSuggestions – W09 example", () => {
  it("«Alle dabei»: maximal spans without «Geht nicht», «Zur Not» allowed and counted", () => {
    const { all } = computeSuggestions(w09());
    expect(short(all)).toEqual([
      "2027-05-05..2027-05-10 5n - ◐2",
      "2027-06-12..2027-06-19 7n - ◐2",
    ]);
    expect(all.every((s) => s.group === "all")).toBe(true);
  });

  it("«Fast alle dabei»: 1…k missing people named, sorted by missing, ◐, length, start", () => {
    const { almost } = computeSuggestions(w09());
    expect(short(almost)).toEqual([
      "2027-05-13..2027-05-19 6n -jonas ◐0",
      "2027-05-27..2027-05-31 4n -lena ◐0",
      "2027-06-01..2027-06-19 18n -tim ◐4",
    ]);
  });

  it("tolerance 0 → no «Fast alle dabei»; tolerance 2 adds pairs after the single ones", () => {
    expect(computeSuggestions({ ...w09(), tolerance: 0 }).almost).toEqual([]);
    const { almost } = computeSuggestions({ ...w09(), tolerance: 2 });
    expect(almost.slice(0, 3).map((s) => s.missing.length)).toEqual([1, 1, 1]);
    expect(almost.slice(3).every((s) => s.missing.length === 2)).toBe(true);
    expect(short(almost)).toContain("2027-05-05..2027-05-19 14n -jonas+anna ◐1");
  });

  it("urlaubstage and holidays of the viewer only decorate the cards (F-016)", () => {
    const holidays = holidaysInRange("DE-BY", "2027-05-01", "2027-06-30", "de");
    const dates = new Set(holidays.map((h) => h.date));
    expect(vacationDays("2027-05-05", "2027-05-10", dates)).toBe(3); // Christi Himmelfahrt
    expect(vacationDays("2027-06-12", "2027-06-19", dates)).toBe(5);
    expect(vacationDays("2027-05-13", "2027-05-19", dates)).toBe(4); // Pfingstmontag
    expect(vacationDays("2027-05-27", "2027-05-31", dates)).toBe(2); // Fronleichnam
    expect(holidaysIn("2027-05-05", "2027-05-10", holidays).map((h) => h.name)).toEqual([
      "Christi Himmelfahrt",
    ]);
  });
});

describe("computeSuggestions – edge cases", () => {
  const base = (participants: Participant[], extra: Partial<SuggestionInput> = {}) => ({
    from: "2027-07-01",
    to: "2027-07-31",
    minNights: 3,
    targetNights: 3,
    tolerance: 1,
    participants,
    ...extra,
  });

  it("nobody submitted → nothing", () => {
    expect(computeSuggestions(base([]))).toEqual({ all: [], almost: [] });
  });

  it("everybody always can → the whole range is one span (windows at both edges)", () => {
    const { all, almost } = computeSuggestions(base([person("a"), person("b")]));
    expect(short(all)).toEqual(["2027-07-01..2027-07-31 30n - ◐0"]);
    expect(almost).toEqual([]);
  });

  it("windows touching the edges of the search range are found", () => {
    const blocked = range("2027-07-05", "2027-07-27");
    const { all } = computeSuggestions(base([person("a", blocked)]));
    expect(short(all)).toEqual([
      "2027-07-01..2027-07-04 3n - ◐0",
      "2027-07-28..2027-07-31 3n - ◐0",
    ]);
  });

  it("minimum = search range − 1 night: exactly one window or none", () => {
    const input = base([person("a")], { from: "2027-07-01", to: "2027-07-08", minNights: 7 });
    expect(short(computeSuggestions(input).all)).toEqual(["2027-07-01..2027-07-08 7n - ◐0"]);
    const blocked = base([person("a", ["2027-07-08"])], {
      from: "2027-07-01",
      to: "2027-07-08",
      minNights: 7,
    });
    expect(computeSuggestions(blocked).all).toEqual([]);
  });

  it("search range shorter than the minimum → nothing (no crash)", () => {
    const input = base([person("a")], { from: "2027-07-01", to: "2027-07-03", minNights: 5 });
    expect(computeSuggestions(input)).toEqual({ all: [], almost: [] });
  });

  it("nobody can ever → nothing, also with tolerance", () => {
    const all31 = range("2027-07-01", "2027-07-31");
    const result = computeSuggestions(base([person("a", all31), person("b", all31)]));
    expect(result).toEqual({ all: [], almost: [] });
  });

  it("one member blocks everything → «Alle dabei» empty, «Fast alle dabei» without them", () => {
    const all31 = range("2027-07-01", "2027-07-31");
    const { all, almost } = computeSuggestions(base([person("a"), person("blocker", all31)]));
    expect(all).toEqual([]);
    expect(short(almost)).toEqual(["2027-07-01..2027-07-31 30n -blocker ◐0"]);
  });

  it("«Zur Not» never blocks; it only costs in the order", () => {
    const { all } = computeSuggestions(
      base([person("a", ["2027-07-10"], ["2027-07-03"]), person("b")], {
        to: "2027-07-20",
      }),
    );
    expect(short(all)).toEqual([
      "2027-07-11..2027-07-20 9n - ◐0",
      "2027-07-01..2027-07-09 8n - ◐1",
    ]);
  });

  it("ties: equal missing and ◐ → closer to the wish length, then the earlier start", () => {
    const a: Suggestion = {
      group: "all",
      start: "2027-07-10",
      end: "2027-07-15",
      nights: 5,
      missing: [],
      maybeDays: 0,
    };
    const b: Suggestion = { ...a, start: "2027-07-01", end: "2027-07-04", nights: 3 };
    const c: Suggestion = { ...a, start: "2027-07-20", end: "2027-07-26", nights: 6 };
    expect([a, b, c].sort((x, y) => compareSuggestions(x, y, 5)).map((s) => s.start)).toEqual([
      "2027-07-10",
      "2027-07-20",
      "2027-07-01",
    ]);
    // complete tie → earlier start wins
    const d = { ...a, start: "2027-07-02", end: "2027-07-07" };
    expect([a, d].sort((x, y) => compareSuggestions(x, y, 5))[0]?.start).toBe("2027-07-02");
  });

  it("is deterministic – same input, same output", () => {
    expect(computeSuggestions(w09())).toEqual(computeSuggestions(w09()));
  });

  it("placeholders and drafts never count: only the passed participants are used", () => {
    // A member without submission is simply not a participant – even if their draft blocks.
    const { all } = computeSuggestions(base([person("submitted")]));
    expect(all).toHaveLength(1);
  });
});

describe("noMatchHints", () => {
  it("suggests a shorter duration and a higher tolerance", () => {
    const input: SuggestionInput = {
      from: "2027-07-01",
      to: "2027-07-14",
      minNights: 6,
      targetNights: 6,
      tolerance: 0,
      participants: [person("a", ["2027-07-05", "2027-07-10"]), person("b", ["2027-07-12"])],
    };
    expect(computeSuggestions(input).all).toEqual([]);
    const hints = noMatchHints(input);
    expect(hints.shorter).toEqual({ nights: 3, count: 2 });
    expect(hints.tolerance).toEqual({ tolerance: 1, count: 1 });
  });

  it("gives up without false promises", () => {
    const all = range("2027-07-01", "2027-07-14");
    const hints = noMatchHints({
      from: "2027-07-01",
      to: "2027-07-14",
      minNights: 3,
      targetNights: 3,
      tolerance: 1,
      participants: [person("a", all), person("b", all)],
    });
    expect(hints).toEqual({ shorter: null, tolerance: null });
  });
});

describe("effectiveMinNights", () => {
  it("the «Dauer» filter is the target; below the trip minimum it lowers the minimum", () => {
    expect(effectiveMinNights(4, 5)).toBe(4);
    expect(effectiveMinNights(4, 3)).toBe(3);
    expect(effectiveMinNights(4, 0)).toBe(1);
  });
});

describe("performance (F-009: 30 members × 365 days < 500 ms)", () => {
  it("computes a full year for 30 members with tolerance 3 quickly", () => {
    const from = "2027-01-01";
    const to = addDays(from, 364);
    const participants = Array.from({ length: 30 }, (_, p) => {
      const no: string[] = [];
      const maybe: string[] = [];
      for (let d = 0; d < 365; d++) {
        if ((d - p * 12 + 365) % 365 < 10) no.push(addDays(from, d));
        else if ((d + p) % 11 === 0) maybe.push(addDays(from, d));
      }
      return person(`p${String(p)}`, no, maybe);
    });
    const started = performance.now();
    const result = computeSuggestions({
      from,
      to,
      participants,
      minNights: 3,
      targetNights: 5,
      tolerance: 3,
    });
    const took = performance.now() - started;
    expect(result.all.length + result.almost.length).toBeGreaterThan(0);
    expect(took).toBeLessThan(500);
  });
});
