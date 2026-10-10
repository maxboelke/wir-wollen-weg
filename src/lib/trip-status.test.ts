import { describe, expect, it } from "vitest";
import {
  BUILT_TABS,
  compareTrips,
  defaultTab,
  phaseProgress,
  uiPhase,
  viewerTodo,
  type MemberStatus,
  type SortableTrip,
} from "./trip-status";

const TODAY = "2027-03-01";
const member = (patch: Partial<MemberStatus> = {}): MemberStatus => ({
  role: "member",
  submittedAt: null,
  votedAt: null,
  ...patch,
});

describe("uiPhase (sitemap §2)", () => {
  it("maps stored phases and derives «past»", () => {
    const base = { rangeEnd: "2027-06-30", fixedStart: null, fixedEnd: null };
    expect(uiPhase({ ...base, phase: "collecting" }, TODAY)).toBe("collect");
    expect(uiPhase({ ...base, phase: "voting" }, TODAY)).toBe("vote");
    expect(uiPhase({ ...base, phase: "collecting", rangeEnd: "2027-02-28" }, TODAY)).toBe("past");
    expect(
      uiPhase({ ...base, phase: "fixed", fixedStart: "2027-05-01", fixedEnd: "2027-05-05" }, TODAY),
    ).toBe("fixed");
    expect(
      uiPhase({ ...base, phase: "fixed", fixedStart: "2027-02-01", fixedEnd: "2027-02-05" }, TODAY),
    ).toBe("past");
  });
});

describe("progress and to-dos (F-007, F-044)", () => {
  const members = [
    member({ role: "organizer", submittedAt: "x" }),
    member({ submittedAt: "x" }),
    member(),
  ];

  it("counts submissions in phase 1 and votes in phase 2", () => {
    expect(phaseProgress("collect", members)).toEqual({ done: 2, total: 3 });
    expect(phaseProgress("vote", [member({ votedAt: "x" }), member()])).toEqual({
      done: 1,
      total: 2,
    });
    expect(phaseProgress("fixed", members)).toBeNull();
  });

  it("Q20: open placeholders count in the denominator of phase 1, not in phase 2", () => {
    expect(phaseProgress("collect", members, 2)).toEqual({ done: 2, total: 5 });
    expect(phaseProgress("vote", [member({ votedAt: "x" }), member()], 2)).toEqual({
      done: 1,
      total: 2,
    });
    // Everyone joined has submitted, but a placeholder is still open → no «startVote» yet.
    const organizer = member({ role: "organizer", submittedAt: "x" });
    const progress = phaseProgress("collect", [organizer], 1);
    expect(viewerTodo("collect", organizer, progress)).toBeNull();
  });

  it("own dates missing → addDates; organiser with everyone in → startVote; vote missing → vote", () => {
    expect(viewerTodo("collect", member(), { done: 2, total: 3 })).toBe("addDates");
    expect(
      viewerTodo("collect", member({ role: "organizer", submittedAt: "x" }), { done: 3, total: 3 }),
    ).toBe("startVote");
    expect(viewerTodo("collect", member({ submittedAt: "x" }), { done: 3, total: 3 })).toBeNull();
    expect(viewerTodo("vote", member({ submittedAt: "x" }), { done: 1, total: 3 })).toBe("vote");
    expect(viewerTodo("fixed", member(), null)).toBeNull();
  });
});

describe("defaultTab (sitemap §2)", () => {
  const all = new Set(["overview", "days", "group", "poll"] as const);
  it("follows the rules once the tabs exist", () => {
    expect(defaultTab("collect", member(), all)).toBe("days");
    expect(defaultTab("vote", member(), all)).toBe("poll");
    expect(defaultTab("collect", member({ submittedAt: "x" }), all)).toBe("overview");
    expect(defaultTab("fixed", member(), all)).toBe("overview");
  });

  it("Increment 4: «Meine Tage» and «Gruppe» are built – missing dates open «Meine Tage»", () => {
    expect(BUILT_TABS.has("days")).toBe(true);
    expect(BUILT_TABS.has("group")).toBe(true);
    expect(BUILT_TABS.has("poll")).toBe(false);
    expect(defaultTab("collect", member())).toBe("days");
    expect(defaultTab("collect", member({ submittedAt: "x" }))).toBe("overview");
    expect(defaultTab("vote", member())).toBe("overview");
    expect(defaultTab("fixed", member())).toBe("overview");
  });
});

describe("compareTrips (W04 order)", () => {
  const trip = (patch: Partial<SortableTrip>): SortableTrip => ({
    phase: "collect",
    todo: null,
    deadline: null,
    start: "2027-06-01",
    updatedAt: "2027-02-01T10:00:00Z",
    name: "A",
    ...patch,
  });

  it("to-dos first, then next event, past last", () => {
    const list = [
      trip({ name: "past", phase: "past", start: "2026-06-01" }),
      trip({ name: "later", start: "2027-08-01" }),
      trip({ name: "todo", todo: "addDates", start: "2027-09-01" }),
      trip({ name: "deadline", start: "2027-08-01", deadline: "2027-03-10" }),
      trip({ name: "soon", start: "2027-04-01" }),
    ];
    expect(list.sort((a, b) => compareTrips(a, b, TODAY)).map((t) => t.name)).toEqual([
      "todo",
      "deadline",
      "soon",
      "later",
      "past",
    ]);
  });

  it("ties: most recently active first", () => {
    const a = trip({ name: "old", updatedAt: "2027-01-01T00:00:00Z" });
    const b = trip({ name: "new", updatedAt: "2027-02-20T00:00:00Z" });
    expect([a, b].sort((x, y) => compareTrips(x, y, TODAY)).map((t) => t.name)).toEqual([
      "new",
      "old",
    ]);
  });
});
