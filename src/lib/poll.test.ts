import { describe, expect, it } from "vitest";
import { toParticipant } from "./heatmap";
import {
  celebrationDue,
  checkDeadline,
  checkOption,
  checkOptions,
  compareTallies,
  concreteWindow,
  countdown,
  hasVotedAll,
  initialOrder,
  optionAvailability,
  periodKey,
  pollForViewer,
  preselectWinner,
  rankOptions,
  resizeWindow,
  ringPercent,
  shiftWindow,
  suggestedChoice,
  tallyOf,
  type VoteRow,
} from "./poll";

const rules = {
  rangeStart: "2027-05-01",
  rangeEnd: "2027-06-30",
  minNights: 3,
  today: "2027-04-01",
};

describe("checkOption / checkOptions (F-010)", () => {
  it("accepts a valid period inside the range with the minimum nights", () => {
    expect(checkOption({ start: "2027-05-05", end: "2027-05-08" }, rules)).toBeNull();
    expect(checkOption({ start: "2027-06-27", end: "2027-06-30" }, rules)).toBeNull();
  });

  it("rejects malformed, reversed, outside, past, too short and too long periods", () => {
    expect(checkOption(null, rules)).toBe("invalid");
    expect(checkOption({ start: "2027-02-30", end: "2027-05-08" }, rules)).toBe("invalid");
    expect(checkOption({ start: "2027-05-08", end: "2027-05-08" }, rules)).toBe("invalid");
    expect(checkOption({ start: "2027-04-28", end: "2027-05-03" }, rules)).toBe("outsideRange");
    expect(checkOption({ start: "2027-06-28", end: "2027-07-01" }, rules)).toBe("outsideRange");
    expect(
      checkOption({ start: "2027-05-05", end: "2027-05-10" }, { ...rules, today: "2027-05-06" }),
    ).toBe("past");
    expect(checkOption({ start: "2027-05-05", end: "2027-05-07" }, rules)).toBe("tooShort");
    expect(
      checkOption(
        { start: "2027-05-01", end: "2027-08-01" },
        { ...rules, rangeStart: "2027-01-01", rangeEnd: "2027-12-31" },
      ),
    ).toBe("tooLong");
  });

  it("needs 2–6 options without duplicates", () => {
    const a = { start: "2027-05-05", end: "2027-05-08" };
    const b = { start: "2027-06-01", end: "2027-06-05" };
    expect(checkOptions([a], rules)).toEqual({ ok: false, reason: "count" });
    expect(
      checkOptions(
        Array.from({ length: 7 }, () => a),
        rules,
      ),
    ).toEqual({
      ok: false,
      reason: "count",
    });
    expect(checkOptions([a, { ...a }], rules)).toEqual({
      ok: false,
      reason: "duplicate",
      index: 1,
    });
    expect(checkOptions("nope", rules)).toEqual({ ok: false, reason: "count" });
    const ok = checkOptions([a, { ...b, extra: "dropped" }], rules);
    expect(ok).toEqual({ ok: true, options: [a, b] });
  });

  it("deadline is optional and never in the past (F-017)", () => {
    expect(checkDeadline("", "2027-04-01")).toEqual({ ok: true, deadline: null });
    expect(checkDeadline(null, "2027-04-01")).toEqual({ ok: true, deadline: null });
    expect(checkDeadline("2027-04-01", "2027-04-01")).toEqual({ ok: true, deadline: "2027-04-01" });
    expect(checkDeadline("2027-03-31", "2027-04-01")).toEqual({ ok: false });
    expect(checkDeadline("tomorrow", "2027-04-01")).toEqual({ ok: false });
  });
});

describe("windows of a suggestion span (Flow D.1)", () => {
  const span = { start: "2027-05-05", end: "2027-05-12" }; // 7 nights
  it("concretises in the wished length, never longer than the span", () => {
    expect(concreteWindow(span, 5)).toEqual({ start: "2027-05-05", end: "2027-05-10" });
    expect(concreteWindow(span, 10)).toEqual(span);
  });
  it("shifts inside the span and stops at the edges", () => {
    const w = { start: "2027-05-05", end: "2027-05-10" };
    expect(shiftWindow(w, span, -1)).toBeNull();
    expect(shiftWindow(w, span, 1)).toEqual({ start: "2027-05-06", end: "2027-05-11" });
    expect(shiftWindow({ start: "2027-05-07", end: "2027-05-12" }, span, 1)).toBeNull();
  });
  it("resizes from the arrival day inside the bound", () => {
    const w = { start: "2027-05-05", end: "2027-05-10" };
    expect(resizeWindow(w, span, 7)).toEqual(span);
    expect(resizeWindow(w, span, 8)).toBeNull();
    expect(resizeWindow(w, span, 0)).toBeNull();
  });
});

describe("availability and pre-filled answers (F-010, F-011)", () => {
  const jonas = toParticipant("jonas", [["2027-05-06", "no"]]);
  const tim = toParticipant("tim", [
    ["2027-05-07", "maybe"],
    ["2027-05-08", "maybe"],
  ]);
  const lena = toParticipant("lena", []);
  it("can = no «Geht nicht» in the period; «zur Not» counts as person-days of those who can", () => {
    expect(
      optionAvailability({ start: "2027-05-05", end: "2027-05-08" }, [jonas, tim, lena]),
    ).toEqual({ can: ["tim", "lena"], cannot: ["jonas"], maybeDays: 2 });
    // Departure day counts (a window of d nights covers d + 1 days).
    expect(optionAvailability({ start: "2027-05-03", end: "2027-05-06" }, [jonas]).cannot).toEqual([
      "jonas",
    ]);
  });
  it("«Geht nicht» → Nein, «Zur Not» → Vielleicht, otherwise no suggestion", () => {
    const own = (p: typeof jonas) => ({ no: p.no, maybe: p.maybe });
    expect(suggestedChoice({ start: "2027-05-05", end: "2027-05-08" }, own(jonas))).toBe("no");
    expect(suggestedChoice({ start: "2027-05-05", end: "2027-05-08" }, own(tim))).toBe("maybe");
    expect(suggestedChoice({ start: "2027-05-05", end: "2027-05-08" }, own(lena))).toBeNull();
  });
});

describe("tally and rank (F-011)", () => {
  it("ranks by yes, then maybe, then fewer no; stable on equal tallies", () => {
    const options = [
      { id: "a", tally: { yes: 2, maybe: 1, no: 0 } },
      { id: "b", tally: { yes: 3, maybe: 0, no: 2 } },
      { id: "c", tally: { yes: 2, maybe: 1, no: 1 } },
      { id: "d", tally: { yes: 2, maybe: 2, no: 3 } },
    ];
    expect(rankOptions(options)).toEqual({ order: ["b", "d", "a", "c"], top: ["b"] });
    expect(compareTallies({ yes: 1, maybe: 0, no: 0 }, { yes: 1, maybe: 0, no: 0 })).toBe(0);
  });
  it("a tie on place 1 gives several top choices and no pre-selection (W11)", () => {
    const { top } = rankOptions([
      { id: "a", tally: { yes: 2, maybe: 0, no: 0 } },
      { id: "b", tally: { yes: 2, maybe: 0, no: 0 } },
      { id: "c", tally: { yes: 1, maybe: 0, no: 0 } },
    ]);
    expect(top).toEqual(["a", "b"]);
    expect(preselectWinner(top)).toBeNull();
    expect(preselectWinner(["a"])).toBe("a");
  });
  it("nobody voted: no place 1", () => {
    expect(rankOptions([{ id: "a", tally: tallyOf([]) }]).top).toEqual([]);
  });
  it("«abgestimmt» needs an answer on every option", () => {
    expect(hasVotedAll(["a", "b"], new Set(["a"]))).toBe(false);
    expect(hasVotedAll(["a", "b"], new Set(["a", "b"]))).toBe(true);
    expect(hasVotedAll([], new Set())).toBe(false);
  });
});

describe("pollForViewer – Q13 a visibility rule", () => {
  const options = [
    { id: "o1", start: "2027-05-05", end: "2027-05-08" },
    { id: "o2", start: "2027-06-01", end: "2027-06-05" },
  ];
  const votes: VoteRow[] = [
    { optionId: "o1", userId: "kemal", choice: "yes" },
    { optionId: "o1", userId: "lena", choice: "no" },
    { optionId: "o2", userId: "lena", choice: "yes" },
    { optionId: "o2", userId: "sara", choice: "maybe" },
  ];
  const names = new Map([
    ["kemal", "Kemal"],
    ["lena", "Lena"],
    ["sara", "Sara"],
  ]);

  it("a member sees the result of an option only after voting on THIS option", () => {
    const poll = pollForViewer({ options, votes, names, viewerId: "kemal", seeAll: false });
    const [o1, o2] = poll.options;
    expect(o1?.mine).toBe("yes");
    expect(o1?.result?.tally).toEqual({ yes: 1, maybe: 0, no: 1 });
    expect(o1?.result?.names).toEqual({ yes: ["Kemal"], maybe: [], no: ["Lena"] });
    expect(o2?.mine).toBeNull();
    expect(o2?.result).toBeNull();
    // Rank would leak the hidden results.
    expect(poll.top).toEqual([]);
    expect(poll.order).toBeNull();
    // Nothing of o2's voters is in the serialised data.
    expect(JSON.stringify(poll)).not.toContain("Sara");
  });

  it("someone who has not voted yet sees no result at all", () => {
    const poll = pollForViewer({ options, votes, names, viewerId: "mia", seeAll: false });
    expect(poll.options.every((option) => option.result === null)).toBe(true);
    expect(JSON.stringify(poll)).not.toMatch(/Lena|Sara|Kemal/);
  });

  it("the organiser (or everybody after fixing) sees everything incl. rank", () => {
    const poll = pollForViewer({ options, votes, names, viewerId: "lena", seeAll: true });
    expect(poll.options.every((option) => option.result !== null)).toBe(true);
    expect(poll.top).toEqual(["o2"]);
    expect(initialOrder(poll)).toEqual(["o2", "o1"]);
  });

  it("cards keep the creation order until the viewer answered everything (W10-08)", () => {
    const partly = pollForViewer({ options, votes, names, viewerId: "kemal", seeAll: true });
    expect(initialOrder(partly)).toEqual(["o1", "o2"]);
    const all = pollForViewer({
      options,
      votes: [...votes, { optionId: "o2", userId: "kemal", choice: "yes" }],
      names,
      viewerId: "kemal",
      seeAll: false,
    });
    expect(initialOrder(all)).toEqual(["o2", "o1"]);
  });
});

describe("result: countdown, ring, celebration (F-012, W11)", () => {
  const period = { start: "2027-05-05", end: "2027-05-10" };
  it("counts days, then «today», «during», «past» – never counts up (pure value)", () => {
    expect(countdown(period, "2027-04-12")).toEqual({ kind: "days", count: 23 });
    expect(countdown(period, "2027-05-04")).toEqual({ kind: "days", count: 1 });
    expect(countdown(period, "2027-05-05")).toEqual({ kind: "today" });
    expect(countdown(period, "2027-05-10")).toEqual({ kind: "during" });
    expect(countdown(period, "2027-05-11")).toEqual({ kind: "past" });
  });
  it("the ring fills with the passed anticipation time, at least 4 %", () => {
    expect(ringPercent("2027-04-05", "2027-05-05", "2027-04-05")).toBe(4);
    expect(ringPercent("2027-04-05", "2027-05-05", "2027-04-20")).toBe(50);
    expect(ringPercent("2027-04-05", "2027-05-05", "2027-05-05")).toBe(100);
    expect(ringPercent("2027-05-05", "2027-05-05", "2027-05-05")).toBe(100);
  });
  it("celebrates once per person and fixed range – again only for a different range", () => {
    expect(celebrationDue(period, null)).toBe(true);
    expect(celebrationDue(period, periodKey(period))).toBe(false);
    expect(celebrationDue({ ...period, end: "2027-05-11" }, periodKey(period))).toBe(true);
    expect(celebrationDue(null, null)).toBe(false);
  });
});
