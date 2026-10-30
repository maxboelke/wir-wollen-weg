import { describe, expect, it } from "vitest";
import { debtThresholdCents } from "./costs";
import {
  tripRoute,
  type CostPerson,
  type CostStatus,
  type RouteAreas,
  type RouteTrip,
  type RouteViewer,
  type TripRoute,
  type TripStation,
} from "./trip-route";

// Costs in the way (W16 v2.15 + v2.17, features.md R.8 I10-09): A1 at the threshold, D1 per
// table row and role, tile, phase line, H-5/H-5b, the cost shortcut bar per sub-phase × result ×
// role incl. closed.
const trip = (patch: Partial<RouteTrip> = {}): RouteTrip => ({
  start: "2027-06-12",
  end: "2027-06-19",
  fixedOn: "2027-02-14",
  announced: true,
  orgaName: "Lena",
  memberCount: 6,
  yesVotes: 5,
  deletionDate: "2027-09-17",
  ...patch,
});
const MEMBER: RouteViewer = { role: "member" };
const ORGA: RouteViewer = { role: "organizer" };
const BEFORE = "2027-05-02";
const DURING = "2027-06-14";
const AFTER = "2027-06-28";

const person = (name: string, cents: number, patch: Partial<CostPerson> = {}): CostPerson => ({
  name,
  cents,
  key: `party-${name}`,
  placeholder: false,
  former: false,
  ...patch,
});
const costs = (patch: Partial<CostStatus> = {}): CostStatus => ({
  expenseCount: 4,
  totalCents: 45_600,
  currency: "EUR",
  myBalanceCents: 0,
  myDebts: [],
  owedToMe: [],
  openTransfers: 2,
  allSettled: false,
  closed: false,
  threshold: 5_000,
  firstHasPayInfo: true,
  ...patch,
});
const areas = (c: CostStatus | null): RouteAreas => ({
  group: { placeholders: [] },
  info: null,
  costs: c,
});
const route = (c: CostStatus | null, viewer: RouteViewer = MEMBER, today = BEFORE) =>
  tripRoute(trip(), viewer, areas(c), today);
const all = (r: TripRoute): TripStation[] => [
  ...r.groups.done,
  ...r.heute.items,
  ...r.groups.waiting,
  ...(r.groups.next ? [r.groups.next] : []),
  ...r.groups.later,
];
const find = (r: TripRoute, id: string) => all(r).find((s) => s.id === id);
const debt = (cents: number, currency = "EUR") =>
  costs({
    myBalanceCents: -cents,
    myDebts: [person("Kemal", cents)],
    currency,
    threshold: debtThresholdCents(currency),
  });

describe("A1 «Du schuldest …» (Vorbereitung/Unterwegs)", () => {
  it.each([
    [4_999, false],
    [5_000, true],
    [5_001, true],
  ])("EUR −%i cents → task %s", (cents, shown) => {
    expect(find(route(debt(cents)), "A1") !== undefined).toBe(shown);
  });
  it("GBP and DKK thresholds", () => {
    expect(find(route(debt(4_999, "GBP")), "A1")).toBeUndefined();
    expect(find(route(debt(5_000, "GBP")), "A1")).toBeDefined();
    expect(find(route(debt(49_999, "DKK")), "A1")).toBeUndefined();
    expect(find(route(debt(50_000, "DKK")), "A1")).toBeDefined();
  });
  it("rank 3, «yours», primary «Zum Ausgleich» → balances, title with 1/2/3 recipients", () => {
    const a1 = find(route(debt(8_600)), "A1");
    expect(a1).toMatchObject({
      kind: "task",
      state: "yours",
      rank: 3,
      href: { kind: "page", page: "costsBalances" },
      primary: { label: { key: "costs.toSettle" } },
      title: { key: "costs.debtTitleOne", values: { name: "Kemal" } },
      status: { key: "costs.debtStatus" },
    });
    const two = costs({
      myBalanceCents: -9_000,
      myDebts: [person("Lena", 6_000), person("Kemal", 3_000)],
      firstHasPayInfo: false,
    });
    expect(find(route(two), "A1")).toMatchObject({
      title: { key: "costs.debtTitleTwo", values: { name1: "Lena", name2: "Kemal" } },
      status: { key: "costs.debtStatusNoInfo" },
    });
    const three = costs({
      myBalanceCents: -9_000,
      myDebts: [person("Lena", 5_000), person("Kemal", 3_000), person("Mia", 1_000)],
    });
    expect(find(route(three), "A1")?.title).toMatchObject({
      key: "costs.debtTitleMany",
      values: { name1: "Lena", count: 2 },
    });
  });
  it("only in Vorbereitung (v2.17: Unterwegs the bar); not when closed; never in Danach", () => {
    expect(find(route(debt(8_600), MEMBER, DURING), "A1")).toBeUndefined();
    expect(find(route({ ...debt(8_600), closed: true }), "A1")).toBeUndefined();
    expect(find(route(debt(8_600), MEMBER, AFTER), "A1")).toBeUndefined();
  });
  it("sorts after blocking items (rank 3 – own contribution)", () => {
    const r = route(debt(8_600), ORGA);
    expect(r.heute.items.map((s) => s.id)).toContain("A1");
    expect(r.heute.sentence.key).toBe("sentence.h1");
  });
});

describe("D1 «Kosten ausgleichen» (Danach) – one test per row and role", () => {
  const d1 = (c: CostStatus, viewer: RouteViewer) => find(route(c, viewer, AFTER), "D1");
  it("no expenses → no D1, tile instead, H-5b and «Zurück seit …»", () => {
    const r = route(costs({ expenseCount: 0, totalCents: 0, allSettled: true }), MEMBER, AFTER);
    expect(find(r, "D1")).toBeUndefined();
    expect(r.tiles.map((t) => t.area)).toContain("costs");
    expect(r.heute.sentence.key).toBe("sentence.h5b");
    expect(r.phaseLine.key).toBe("phase.after");
    expect(r.headActions).toEqual([]);
  });
  it("row 1: all square and closed → done (member/orga text)", () => {
    const c = costs({ allSettled: true, closed: true, openTransfers: 0 });
    expect(d1(c, MEMBER)).toMatchObject({ state: "done", status: { key: "costs.d1DoneSquare" } });
    expect(d1(c, ORGA)).toMatchObject({ state: "done", status: { key: "costs.d1DoneClosed" } });
  });
  it("row 2: closed with open balances → done (info), organiser may reopen", () => {
    const c = costs({ closed: true, myBalanceCents: -2_350 });
    expect(d1(c, MEMBER)).toMatchObject({ state: "done", status: { key: "costs.d1ClosedOwe" } });
    expect(d1(c, MEMBER)?.textActions).toBeUndefined();
    expect(d1(costs({ closed: true, myBalanceCents: 100 }), MEMBER)?.status.key).toBe(
      "costs.d1ClosedOwed",
    );
    expect(d1(costs({ closed: true }), ORGA)).toMatchObject({
      state: "done",
      status: { key: "costs.d1Closed" },
      textActions: [{ action: { kind: "reopenCosts" } }],
    });
    const r = route(c, MEMBER, AFTER);
    expect(r.headActions).toEqual([]);
    expect(r.phaseLine.key).toBe("phase.afterSquare");
  });
  it("row 3: I owe → yours, rank 2, A1 title, any amount; no own button – the bar has it", () => {
    for (const viewer of [MEMBER, ORGA]) {
      const station = d1(debt(100), viewer);
      expect(station).toMatchObject({
        state: "yours",
        rank: 2,
        title: { key: "costs.debtTitleOne" },
        href: { kind: "page", page: "costsBalances" },
      });
      expect(station?.primary).toBeUndefined();
    }
  });
  it("row 4: I am owed → waiting with «settle» reminder (no former members)", () => {
    const one = costs({ myBalanceCents: 2_000, owedToMe: [person("Ben", 2_000)] });
    for (const viewer of [MEMBER, ORGA]) {
      expect(d1(one, viewer)).toMatchObject({
        state: "waiting",
        status: { key: "costs.owedOne", values: { name: "Ben" } },
        short: { key: "costs.shortOne" },
        remind: { occasion: "settle", keys: ["party-Ben"], label: { key: "costs.remindOne" } },
      });
    }
    const many = costs({
      myBalanceCents: 6_000,
      owedToMe: [
        person("Ben", 2_000),
        person("Mia", 2_000, { placeholder: true }),
        person("ehemaliges Mitglied", 2_000, { former: true }),
      ],
    });
    expect(d1(many, MEMBER)).toMatchObject({
      status: { key: "costs.owedMany", values: { count: 2 } },
      short: { key: "costs.shortMine" },
      remind: { keys: ["party-Ben", "party-Mia"], label: { key: "costs.remind" } },
    });
    const formerOnly = costs({
      myBalanceCents: 2_000,
      owedToMe: [person("ehemaliges Mitglied", 2_000, { former: true })],
    });
    expect(d1(formerOnly, MEMBER)?.remind).toBeUndefined();
  });
  it("row 4, R-082: a single placeholder debtor → members tell the organiser, orga reminds", () => {
    const lotte = costs({
      myBalanceCents: 3_000,
      owedToMe: [person("Lotte", 3_000, { placeholder: true })],
    });
    expect(d1(lotte, MEMBER)?.remind).toMatchObject({
      occasion: "settle",
      keys: ["party-Lotte"],
      label: { key: "v2.nudgeOrga", values: { orga: "Lena" } },
      name: { key: "costs.nudgeOrgaName", values: { orga: "Lena", name: "Lotte" } },
    });
    expect(d1(lotte, ORGA)?.remind).toMatchObject({
      label: { key: "costs.remindOne", values: { name: "Lotte" } },
    });
  });
  it("row 5: I am square, others open → waiting; organiser «settle-all» + «Abschließen …»", () => {
    const c = costs({ openTransfers: 3 });
    expect(d1(c, MEMBER)).toMatchObject({
      state: "waiting",
      status: { key: "costs.openCount", values: { count: 3 } },
      short: { key: "costs.shortOthers" },
    });
    expect(d1(c, MEMBER)?.remind).toBeUndefined();
    expect(d1(c, ORGA)).toMatchObject({
      state: "waiting",
      remind: { occasion: "settle-all" },
      textActions: [{ action: { kind: "closeCosts", open: 3 } }],
    });
  });
  it("row 6: all square, not closed → member done; organiser «abschließen?» rank 4, never primary", () => {
    const c = costs({ allSettled: true, openTransfers: 0 });
    expect(d1(c, MEMBER)).toMatchObject({ state: "done", status: { key: "costs.d1DoneSquare" } });
    expect(d1(c, ORGA)).toMatchObject({
      state: "yours",
      rank: 4,
      primary: { action: { kind: "closeCosts", open: 0 }, secondary: true },
    });
  });
  it("D1 open with own result ≠ 0: bar [Ausgleichen] + tile as its anchor, meta 0 von 1", () => {
    const r = route(debt(2_000), MEMBER, AFTER);
    expect(r.tiles.map((t) => t.area)).toContain("costs");
    expect(r.costDock).toMatchObject({ kind: "settle", balanceCents: -2_000 });
    expect(r.phaseLine.key).toBe("phase.afterSettle");
    expect(r.headActions).toEqual([]);
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 0, total: 1 } });
  });
  it("D1 open, I am square: no bar, no tile (one entry: D1)", () => {
    const r = route(costs({ openTransfers: 3 }), MEMBER, AFTER);
    expect(r.costDock).toBeNull();
    expect(r.tiles.map((t) => t.area)).not.toContain("costs");
  });
  it("D1 done: tile again, H-5, «alles ausgeglichen», done summary with «Ausgleich»", () => {
    const r = route(costs({ allSettled: true, openTransfers: 0 }), MEMBER, AFTER);
    expect(r.tiles.map((t) => t.area)).toContain("costs");
    expect(r.heute.sentence.key).toBe("sentence.h5");
    expect(r.phaseLine.key).toBe("phase.afterSquare");
    expect(r.headActions).toEqual([]);
    expect(r.doneSummary?.key).toBe("done.tripSettled");
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 1, total: 1 } });
  });
  it("H-2 short form when the first waiting station is D1", () => {
    const r = route(
      costs({ myBalanceCents: 2_000, owedToMe: [person("Ben", 2_000)] }),
      MEMBER,
      AFTER,
    );
    expect(r.heute.sentence).toMatchObject({ key: "sentence.h2" });
  });
});

describe("tile «Kosten» (W19 E.9) and the cost shortcut bar (W16 v2.17 Fassung 2)", () => {
  const tile = (c: CostStatus, today = BEFORE) =>
    route(c, MEMBER, today).tiles.find((t) => t.area === "costs");
  it("status = the own result, no group total", () => {
    const keys = (c: CostStatus) => tile(c)?.status.map((m) => m.key);
    expect(keys(costs({ expenseCount: 0, totalCents: 0 }))).toEqual(["tiles.costsEmpty"]);
    expect(keys(debt(8_600))).toEqual(["tiles.costsOwe"]);
    expect(tile(debt(8_600))?.status[0]?.values).toEqual({
      amount: { money: 8_600, currency: "EUR", exact: true },
    });
    expect(keys(costs({ myBalanceCents: 4_200 }))).toEqual(["tiles.costsOwed"]);
    expect(keys(costs())).toEqual(["tiles.costsSquareMe"]);
    expect(keys(costs({ allSettled: true }))).toEqual(["tiles.costsSquare"]);
    expect(keys(costs({ closed: true, allSettled: true }))).toEqual(["tiles.costsClosedSquare"]);
    expect(keys(costs({ closed: true, myBalanceCents: -100 }))).toEqual(["tiles.costsClosedOwe"]);
    expect(keys(costs({ closed: true, myBalanceCents: 100 }))).toEqual(["tiles.costsClosedOwed"]);
    expect(keys(costs({ closed: true }))).toEqual(["tiles.costsClosedSquareMe"]);
  });
  it("«Alle Ausgaben ansehen ›» only Unterwegs and Danach", () => {
    expect(tile(costs())?.linkLabel).toBeUndefined();
    expect(tile(costs(), DURING)?.linkLabel).toEqual({ key: "tiles.costsAll" });
    expect(tile(debt(100), AFTER)?.linkLabel).toEqual({ key: "tiles.costsAll" });
  });
  it("tile order: Unterkunft · Kosten · Infos; always in Vorbereitung and Unterwegs", () => {
    const r = tripRoute(
      trip(),
      MEMBER,
      {
        group: { placeholders: [] },
        info: { meeting: null, checkIn: null, checkOut: null, hasAddress: false },
        stay: {
          total: 1,
          myUnrated: 0,
          myNew: 0,
          membersDone: 1,
          membersTotal: 1,
          favourite: null,
          chosen: { title: "Villa" },
          booked: true,
          rebook: false,
          withoutApp: false,
        },
        costs: costs({ expenseCount: 0 }),
      },
      BEFORE,
    );
    expect(r.tiles.map((t) => t.area)).toEqual(["stay", "costs", "info"]);
    expect(tile(costs(), DURING)).toBeDefined();
  });
  it("head buttons: only «Kalender» in Vorbereitung – the cost buttons moved into the bar", () => {
    for (const viewer of [MEMBER, ORGA]) {
      expect(route(costs(), viewer, BEFORE).headActions).toEqual(["calendar"]);
      expect(route(costs(), viewer, DURING).headActions).toEqual([]);
      expect(route(debt(100), viewer, AFTER).headActions).toEqual([]);
    }
  });
  it.each([
    ["Vorbereitung", BEFORE, -8_600, false, null],
    ["Unterwegs, pays back", DURING, -8_600, false, "add"],
    ["Unterwegs, gets back", DURING, 4_200, false, "add"],
    ["Unterwegs, square", DURING, 0, false, "add"],
    ["Unterwegs, closed", DURING, -8_600, true, null],
    ["Danach, pays back", AFTER, -8_600, false, "settle"],
    ["Danach, gets back", AFTER, 4_200, false, "settle"],
    ["Danach, square", AFTER, 0, false, null],
    ["Danach, closed", AFTER, -8_600, true, null],
  ] as const)("bar: %s → %s", (_label, today, balance, closed, kind) => {
    for (const viewer of [MEMBER, ORGA]) {
      const c = costs({
        myBalanceCents: balance,
        closed,
        ...(balance < 0 ? { myDebts: [person("Kemal", -balance)] } : {}),
        ...(balance > 0 ? { owedToMe: [person("Ben", balance)] } : {}),
      });
      const r = route(c, viewer, today);
      expect(r.costDock?.kind ?? null).toBe(kind);
      // The bar is only a shortcut: the tile is always there as well.
      if (kind) expect(r.tiles.map((t) => t.area)).toContain("costs");
    }
  });
  it("bar status sentence; no expenses yet → «Noch keine Ausgaben»", () => {
    expect(route(debt(8_600), MEMBER, DURING).costDock?.status.key).toBe("tiles.costsOwe");
    expect(route(costs({ expenseCount: 0, totalCents: 0 }), MEMBER, DURING).costDock).toMatchObject(
      { kind: "add", status: { key: "tiles.costsEmpty" } },
    );
    expect(route(null, MEMBER, DURING).costDock).toBeNull();
  });
  it("primary rule: with the bar every «Heute» card button is secondary", () => {
    const r = tripRoute(
      trip(),
      MEMBER,
      {
        group: { placeholders: [] },
        info: { meeting: "10 Uhr Bahnhof", checkIn: null, checkOut: null, hasAddress: false },
        costs: costs(),
      },
      "2027-06-12",
    );
    expect(r.costDock?.kind).toBe("add");
    const meet = r.heute.items.find((s) => s.id === "T-meet");
    expect(meet?.primary?.secondary).toBe(true);
    const without = tripRoute(
      trip(),
      MEMBER,
      {
        group: { placeholders: [] },
        info: { meeting: "10 Uhr Bahnhof", checkIn: null, checkOut: null, hasAddress: false },
        costs: costs({ closed: true }),
      },
      "2027-06-12",
    );
    expect(without.heute.items.find((s) => s.id === "T-meet")?.primary?.secondary).toBeFalsy();
  });
  it("without the costs adapter nothing changes (older callers)", () => {
    const r = route(null, MEMBER, AFTER);
    expect(find(r, "D1")).toBeUndefined();
    expect(r.tiles).toEqual([]);
    expect(r.costDock).toBeNull();
    expect(r.heute.sentence.key).toBe("sentence.h5b");
  });
});
