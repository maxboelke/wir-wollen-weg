import { describe, expect, it } from "vitest";
import {
  BUILT_TABS,
  compareTrips,
  defaultTab,
  nextStep,
  phaseProgress,
  showTabs,
  uiPhase,
  viewerTodo,
  type MemberStatus,
  type NextStepInput,
  type NextStepPerson,
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

  it("organiser who voted: «fixDates» once everybody voted or the deadline passed (F-017)", () => {
    const orga = member({ role: "organizer", submittedAt: "x", votedAt: "x" });
    expect(viewerTodo("vote", orga, { done: 2, total: 3 })).toBeNull();
    expect(viewerTodo("vote", orga, { done: 3, total: 3 })).toBe("fixDates");
    expect(viewerTodo("vote", orga, { done: 1, total: 3 }, { deadlinePassed: true })).toBe(
      "fixDates",
    );
    // Own vote first, members never get «fixDates».
    expect(viewerTodo("vote", member({ role: "organizer" }), { done: 2, total: 3 })).toBe("vote");
    expect(viewerTodo("vote", member({ votedAt: "x" }), { done: 3, total: 3 })).toBeNull();
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
    expect(BUILT_TABS.has("poll")).toBe(true);
    expect(defaultTab("collect", member())).toBe("days");
    expect(defaultTab("collect", member({ submittedAt: "x" }))).toBe("overview");
    expect(defaultTab("vote", member())).toBe("poll");
    expect(defaultTab("vote", member({ votedAt: "x" }))).toBe("overview");
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

describe("nextStep (ux-spec §14.1 matrix)", () => {
  const ME = "me";
  const ORGA = "orga";
  const person = (userId: string, done: boolean, role: NextStepPerson["role"] = "member") => ({
    userId,
    role,
    done,
  });
  /** Viewer = member «me», organiser «orga», plus others. */
  const input = (patch: Partial<NextStepInput> & { me?: NextStepPerson }): NextStepInput => {
    const { me, ...rest } = patch;
    return {
      phase: "collect",
      storedPhase: "collecting",
      viewerId: ME,
      members: [person(ORGA, true, "organizer"), me ?? person(ME, false), person("kemal", false)],
      placeholders: [],
      deadline: null,
      today: TODAY,
      ...rest,
    };
  };
  const asOrga = (members: NextStepPerson[]) => ({
    viewerId: ORGA,
    members,
  });
  const PAST = "2027-02-20";
  const AHEAD = "2027-03-10";

  describe("phase 1 «Tage sammeln»", () => {
    it("N1-1: own dates open and deadline passed (any role)", () => {
      const step = nextStep(input({ deadline: PAST }));
      expect(step?.id).toBe("N1-1");
      expect(step?.actions).toEqual([{ kind: "addDates", variant: "primary" }]);
      expect(
        nextStep(
          input({
            deadline: PAST,
            ...asOrga([person(ORGA, false, "organizer"), person("kemal", false)]),
          }),
        )?.id,
      ).toBe("N1-1");
    });

    it("N1-2 / N1-3: only my dates missing (member / organiser)", () => {
      expect(
        nextStep(input({ members: [person(ORGA, true, "organizer"), person(ME, false)] }))?.id,
      ).toBe("N1-2");
      expect(
        nextStep(input(asOrga([person(ORGA, false, "organizer"), person("kemal", true)])))?.id,
      ).toBe("N1-3");
    });

    it("an open placeholder keeps «only mine missing» from matching (Q20)", () => {
      const step = nextStep(
        input({
          members: [person(ORGA, true, "organizer"), person(ME, false)],
          placeholders: ["Mia"],
        }),
      );
      expect(step?.id).toBe("N1-4");
    });

    it("N1-4: own dates open otherwise", () => {
      const step = nextStep(input({}));
      expect(step?.id).toBe("N1-4");
      expect(step?.actions).toEqual([{ kind: "addDates", variant: "primary" }]);
    });

    it("N1-5: organiser, everyone in", () => {
      const step = nextStep(
        input(asOrga([person(ORGA, true, "organizer"), person("kemal", true)])),
      );
      expect(step).toEqual({
        id: "N1-5",
        params: {},
        actions: [{ kind: "startVote", variant: "primary" }],
      });
    });

    it("N1-6: organiser, all members in, only placeholders open", () => {
      const step = nextStep(
        input({
          ...asOrga([person(ORGA, true, "organizer"), person("kemal", true)]),
          placeholders: ["Mia", "Tom"],
          deadline: PAST,
        }),
      );
      expect(step?.id).toBe("N1-6");
      expect(step?.params).toEqual({ names: ["Mia", "Tom"], count: 2 });
      expect(step?.actions).toEqual([
        { kind: "startVote", variant: "primary" },
        { kind: "remind", variant: "secondary" },
      ]);
    });

    it("N1-7: organiser, deadline passed, others open – counts members and placeholders", () => {
      const step = nextStep(
        input({
          ...asOrga([person(ORGA, true, "organizer"), person("kemal", false)]),
          placeholders: ["Mia"],
          deadline: PAST,
        }),
      );
      expect(step?.id).toBe("N1-7");
      expect(step?.params.count).toBe(2);
      expect(step?.actions[0]).toEqual({ kind: "startVote", variant: "primary" });
    });

    it("N1-8: organiser, others open", () => {
      const step = nextStep(
        input({
          ...asOrga([person(ORGA, true, "organizer"), person("kemal", false)]),
          deadline: AHEAD,
        }),
      );
      expect(step?.id).toBe("N1-8");
      expect(step?.actions).toEqual([
        { kind: "remind", variant: "primary" },
        { kind: "suggestions", variant: "secondary" },
      ]);
    });

    it("N1-9: member, everyone in – nudge the organiser (text button, no primary)", () => {
      const step = nextStep(
        input({ members: [person(ORGA, true, "organizer"), person(ME, true), person("k", true)] }),
      );
      expect(step?.id).toBe("N1-9");
      expect(step?.nudge).toBe("p1All");
      expect(step?.actions).toEqual([
        { kind: "suggestions", variant: "secondary" },
        { kind: "nudgeOrga", variant: "text" },
      ]);
    });

    it("N1-10: member, deadline passed, others open", () => {
      const step = nextStep(input({ me: person(ME, true), deadline: PAST }));
      expect(step?.id).toBe("N1-10");
      expect(step?.nudge).toBe("p1Deadline");
    });

    it("N1-11: member, only the organiser is open", () => {
      const step = nextStep(
        input({ members: [person(ORGA, false, "organizer"), person(ME, true), person("k", true)] }),
      );
      expect(step?.id).toBe("N1-11");
      expect(step?.actions).toEqual([
        { kind: "remindOrga", variant: "secondary" },
        { kind: "suggestions", variant: "secondary" },
      ]);
    });

    it("N1-12: member, others open (placeholders included)", () => {
      expect(nextStep(input({ me: person(ME, true) }))?.id).toBe("N1-12");
      const onlyPlaceholder = nextStep(
        input({
          members: [person(ORGA, true, "organizer"), person(ME, true)],
          placeholders: ["Mia"],
        }),
      );
      expect(onlyPlaceholder?.id).toBe("N1-12");
      expect(
        nextStep(
          input({
            members: [person(ORGA, false, "organizer"), person(ME, true)],
            placeholders: ["Mia"],
          }),
        )?.id,
      ).toBe("N1-12");
    });

    it("no primary action in member waiting states", () => {
      for (const members of [
        [person(ORGA, true, "organizer"), person(ME, true)],
        [person(ORGA, false, "organizer"), person(ME, true)],
        [person(ORGA, true, "organizer"), person(ME, true), person("k", false)],
      ]) {
        const step = nextStep(input({ members }));
        expect(step?.actions.some((a) => a.variant === "primary")).toBe(false);
      }
    });
  });

  describe("phase 2 «Abstimmung läuft»", () => {
    const vote = (patch: Partial<NextStepInput> & { me?: NextStepPerson }) =>
      input({ phase: "vote", storedPhase: "voting", ...patch });

    it("N2-1 / N2-2: not voted, deadline passed", () => {
      expect(nextStep(vote({ deadline: PAST }))?.id).toBe("N2-1");
      expect(
        nextStep(
          vote({
            deadline: PAST,
            ...asOrga([person(ORGA, false, "organizer"), person("k", false)]),
          }),
        )?.id,
      ).toBe("N2-2");
    });

    it("N2-3 / N2-4: only my vote missing", () => {
      expect(
        nextStep(vote({ members: [person(ORGA, true, "organizer"), person(ME, false)] }))?.id,
      ).toBe("N2-3");
      expect(
        nextStep(vote(asOrga([person(ORGA, false, "organizer"), person("k", true)])))?.id,
      ).toBe("N2-4");
    });

    it("placeholders never count in phase 2", () => {
      expect(
        nextStep(
          vote({
            members: [person(ORGA, true, "organizer"), person(ME, false)],
            placeholders: ["Mia"],
          }),
        )?.id,
      ).toBe("N2-3");
    });

    it("N2-5: not voted otherwise – with a deadline ahead it is passed on", () => {
      expect(nextStep(vote({}))).toEqual({
        id: "N2-5",
        params: {},
        actions: [{ kind: "vote", variant: "primary" }],
      });
      expect(nextStep(vote({ deadline: AHEAD }))?.params).toEqual({ deadline: AHEAD });
    });

    it("N2-6: organiser, everyone voted → lock in", () => {
      const step = nextStep(vote(asOrga([person(ORGA, true, "organizer"), person("k", true)])));
      expect(step?.id).toBe("N2-6");
      expect(step?.actions).toEqual([{ kind: "fixDates", variant: "primary" }]);
    });

    it("N2-7: organiser, deadline passed, others open", () => {
      const step = nextStep(
        vote({
          deadline: PAST,
          ...asOrga([person(ORGA, true, "organizer"), person("k", false), person("s", false)]),
        }),
      );
      expect(step?.id).toBe("N2-7");
      expect(step?.params.count).toBe(2);
      expect(step?.actions).toEqual([
        { kind: "fixDates", variant: "primary" },
        { kind: "remind", variant: "secondary" },
      ]);
    });

    it("N2-8: organiser, others open", () => {
      const step = nextStep(vote(asOrga([person(ORGA, true, "organizer"), person("k", false)])));
      expect(step?.id).toBe("N2-8");
      expect(step?.actions).toEqual([
        { kind: "remind", variant: "primary" },
        { kind: "poll", variant: "secondary" },
      ]);
    });

    it("N2-9 / N2-10: member waits for the organiser to lock in", () => {
      const all = nextStep(
        vote({ members: [person(ORGA, true, "organizer"), person(ME, true), person("k", true)] }),
      );
      expect(all?.id).toBe("N2-9");
      expect(all?.nudge).toBe("p2All");
      expect(all?.actions).toEqual([
        { kind: "results", variant: "secondary" },
        { kind: "nudgeOrga", variant: "text" },
      ]);
      const late = nextStep(vote({ me: person(ME, true), deadline: PAST }));
      expect(late?.id).toBe("N2-10");
      expect(late?.nudge).toBe("p2Deadline");
    });

    it("N2-11: member, only the organiser's vote is missing", () => {
      const step = nextStep(
        vote({
          members: [person(ORGA, false, "organizer"), person(ME, true)],
          placeholders: ["Mia"],
        }),
      );
      expect(step?.id).toBe("N2-11");
      expect(step?.actions[0]).toEqual({ kind: "remindOrga", variant: "secondary" });
    });

    it("N2-12: member, others open – deadline ahead switches the text", () => {
      expect(nextStep(vote({ me: person(ME, true) }))?.id).toBe("N2-12");
      expect(nextStep(vote({ me: person(ME, true), deadline: AHEAD }))?.params).toEqual({
        deadline: AHEAD,
      });
    });

    it("a deadline of today is not passed yet", () => {
      expect(nextStep(vote({ deadline: TODAY }))?.id).toBe("N2-5");
    });
  });

  describe("phase 3 and past", () => {
    it("phase 3 has no card", () => {
      expect(nextStep(input({ phase: "fixed", storedPhase: "fixed" }))).toBeNull();
    });

    it("past after fixing: new trip", () => {
      expect(nextStep(input({ phase: "past", storedPhase: "fixed" }))).toEqual({
        id: "past",
        params: {},
        actions: [{ kind: "newTrip", variant: "secondary" }],
      });
    });

    it("past without fixed dates: organiser may extend the range", () => {
      expect(nextStep(input({ phase: "past", storedPhase: "voting" }))?.actions).toEqual([
        { kind: "newTrip", variant: "secondary" },
      ]);
      const orga = nextStep(
        input({
          phase: "past",
          storedPhase: "collecting",
          ...asOrga([person(ORGA, true, "organizer")]),
        }),
      );
      expect(orga?.id).toBe("pastOpen");
      expect(orga?.actions).toEqual([
        { kind: "editTrip", variant: "secondary" },
        { kind: "newTrip", variant: "secondary" },
      ]);
    });
  });

  it("showTabs: only while the dates are not fixed (§14.4)", () => {
    expect(showTabs({ phase: "collecting" })).toBe(true);
    expect(showTabs({ phase: "voting" })).toBe(true);
    expect(showTabs({ phase: "fixed" })).toBe(false);
  });
});
