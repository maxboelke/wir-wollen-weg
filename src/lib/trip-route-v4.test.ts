import { describe, expect, it } from "vitest";
import {
  tripRoute,
  type InfoStatus,
  type RouteAreas,
  type RouteTrip,
  type RouteViewer,
  type StayStatus,
  type TravelDataStatus,
  type TripStation,
} from "./trip-route";

// V4 «Reisedaten», D3, tile «Reisedaten» and the «Bucher» of V3 (W16 v2.16, features.md R.9
// I11-02/I11-03): one test per table row × role (member, «Bucht», organiser without the marking,
// organiser + «Bucht», asked + «Bucht»).
const trip = (patch: Partial<RouteTrip> = {}): RouteTrip => ({
  start: "2027-06-12",
  end: "2027-06-19",
  fixedOn: "2027-02-14",
  announced: true,
  orgaName: "Lena",
  memberCount: 6,
  yesVotes: 5,
  deletionDate: "2027-09-17",
  bookerNames: ["Lena"],
  ...patch,
});
const MEMBER: RouteViewer = { role: "member" };
const BOOKER: RouteViewer = { role: "member", booker: true };
const ORGA: RouteViewer = { role: "organizer" };
const ORGA_BOOKER: RouteViewer = { role: "organizer", booker: true };
const INFO: InfoStatus = {
  meeting: "Treffpunkt 6:15",
  checkIn: "15:00",
  checkOut: "10:00",
  hasAddress: true,
};
const BEFORE = "2027-05-02";
const DURING = "2027-06-14";
const AFTER = "2027-06-22";
const GONE = "2027-06-28";

const travel = (patch: Partial<TravelDataStatus> = {}): TravelDataStatus => ({
  deleteOn: "2027-06-26",
  deleted: false,
  affected: false,
  toMe: [],
  mine: [],
  others: [],
  ...patch,
});
const toMe = (
  state: "open" | "released" | "declined" | "expired",
  patch: Partial<TravelDataStatus["toMe"][number]> = {},
) => ({
  requestId: "r-1",
  byName: "Sara",
  purpose: "Fähre Split – Hvar",
  fieldKeys: ["legal_name", "birth_date"],
  state,
  ...patch,
});
const mine = (patch: Partial<TravelDataStatus["mine"][number]> = {}) => ({
  requestId: "m-1",
  purpose: "Flüge München – Split",
  released: 1,
  total: 4,
  open: [
    { key: "u-max", name: "Max" },
    { key: "u-kemal", name: "Kemal" },
    { key: "u-jonas", name: "Jonas" },
  ],
  complete: false,
  usedSinceComplete: false,
  closed: false,
  ...patch,
});
const other = (patch: Partial<TravelDataStatus["others"][number]> = {}) => ({
  byName: "Sara",
  purpose: "Fähre",
  released: 2,
  total: 4,
  complete: false,
  ...patch,
});
const areas = (t: TravelDataStatus | null, stay: StayStatus | null = null): RouteAreas => ({
  group: { placeholders: [] },
  info: INFO,
  stay,
  travelData: t,
});
const route = (
  t: TravelDataStatus | null,
  viewer: RouteViewer = MEMBER,
  today = BEFORE,
  patch: Partial<RouteTrip> = {},
) => tripRoute(trip(patch), viewer, areas(t), today);
const all = (r: ReturnType<typeof tripRoute>): TripStation[] => [
  ...r.groups.done,
  ...r.heute.items,
  ...r.groups.waiting,
  ...(r.groups.next ? [r.groups.next] : []),
  ...r.groups.later,
];
const station = (r: ReturnType<typeof tripRoute>, id: "V4" | "D3") =>
  all(r).find((s) => s.id === id);

describe("V4 visibility (W16 v2.16)", () => {
  it("member without any request: no V4", () => {
    expect(station(route(travel()), "V4")).toBeUndefined();
  });
  it("organiser without the marking and without running requests: no V4", () => {
    expect(station(route(travel(), ORGA), "V4")).toBeUndefined();
  });
  it("area switched off (null): no V4, no D3, no tile – in every role", () => {
    for (const viewer of [MEMBER, BOOKER, ORGA, ORGA_BOOKER]) {
      for (const today of [BEFORE, DURING, AFTER]) {
        const r = route(null, viewer, today);
        expect(station(r, "V4")).toBeUndefined();
        expect(station(r, "D3")).toBeUndefined();
        expect(r.tiles.some((t) => t.area === "travelData")).toBe(false);
      }
    }
  });
  it("Danach: never V4 (D3 instead)", () => {
    const r = route(travel({ toMe: [toMe("open")] }), MEMBER, AFTER);
    expect(station(r, "V4")).toBeUndefined();
  });
});

describe("V4 row 1 – a request to me is open", () => {
  it.each([MEMBER, BOOKER, ORGA, ORGA_BOOKER])(
    "%j: dran, rank 1, primary to the request",
    (viewer) => {
      const r = route(travel({ toMe: [toMe("open")], mine: [mine()], others: [other()] }), viewer);
      const v4 = r.heute.items.find((s) => s.id === "V4");
      expect(v4).toMatchObject({
        state: "yours",
        rank: 1,
        title: { key: "v4.titleFor", values: { by: "Sara" } },
        status: { key: "v4.asks", values: { by: "Sara" } },
        primary: {
          label: { key: "v4.share" },
          action: { kind: "page", page: "travelDataRequest", requestId: "r-1" },
        },
      });
      expect(v4?.detail).toEqual({
        key: "v4.asksLong",
        values: {
          purpose: "Fähre Split – Hvar",
          fields: { fields: ["legal_name", "birth_date"] },
          by: "Sara",
        },
      });
    },
  );
  it("several open requests: title with the count, both askers, oldest request first", () => {
    const r = route(
      travel({
        toMe: [toMe("open"), toMe("open", { requestId: "r-2", byName: "Lena", purpose: "Flüge" })],
      }),
    );
    const v4 = station(r, "V4");
    expect(v4?.title).toEqual({ key: "v4.titleMany", values: { count: 2 } });
    expect(v4?.status).toEqual({
      key: "v4.asksMany",
      values: { names: { names: ["Sara", "Lena"] } },
    });
    expect(v4?.primary?.action).toEqual({
      kind: "page",
      page: "travelDataRequest",
      requestId: "r-1",
    });
  });
  it("Heute order: V4 «freigeben» (1) before V3 «buchen» (2)", () => {
    const stay: StayStatus = {
      total: 3,
      myUnrated: 0,
      myNew: 0,
      membersDone: 5,
      membersTotal: 5,
      favourite: null,
      chosen: { title: "Villa" },
      booked: false,
      rebook: false,
      withoutApp: false,
    };
    const r = tripRoute(trip(), ORGA_BOOKER, areas(travel({ toMe: [toMe("open")] }), stay), BEFORE);
    expect(r.heute.items.map((s) => s.id).slice(0, 2)).toEqual(["V4", "V3"]);
  });
  it("Unterwegs: still dran (the ferry on day 3)", () => {
    const r = route(travel({ toMe: [toMe("open")] }), MEMBER, DURING);
    expect(station(r, "V4")?.state).toBe("yours");
  });
});

describe("V4 row 2 – «Bucht», everybody answered", () => {
  it.each([BOOKER, ORGA_BOOKER])("%j: dran rank 2 «Du kannst buchen» until used once", (viewer) => {
    const done = mine({ released: 3, total: 4, open: [], complete: true });
    const r = route(travel({ mine: [done] }), viewer);
    expect(station(r, "V4")).toMatchObject({
      state: "yours",
      rank: 2,
      status: { key: "v4.allIn", values: { released: 3, total: 4 } },
      primary: { action: { kind: "page", page: "travelData" } },
    });
    const used = route(travel({ mine: [{ ...done, usedSinceComplete: true }] }), viewer);
    expect(station(used, "V4")).toMatchObject({
      state: "done",
      status: { key: "v4.doneMine", values: { released: 3, total: 4 } },
    });
  });
});

describe("V4 row 3 – «Bucht», own request with open people", () => {
  it.each([BOOKER, ORGA_BOOKER])("%j: wartet with the reminder `travel-data`", (viewer) => {
    const r = route(travel({ mine: [mine()] }), viewer);
    const v4 = r.groups.waiting.find((s) => s.id === "V4");
    expect(v4).toMatchObject({
      state: "waiting",
      status: {
        key: "v4.waiting",
        values: { released: 1, total: 4, names: { names: ["Max", "Kemal", "Jonas"] } },
      },
      short: { key: "v4.shortMine" },
      remind: { occasion: "travel-data", keys: ["m-1"] },
    });
  });
  it("the OLDEST open own request decides (R.9 I11-03)", () => {
    const r = route(
      travel({
        mine: [
          mine({ requestId: "m-0", closed: true }),
          mine({ requestId: "m-1" }),
          mine({ requestId: "m-2", released: 0, total: 1, open: [{ key: "u", name: "Mia" }] }),
        ],
      }),
      BOOKER,
    );
    expect(station(r, "V4")?.remind?.keys).toEqual(["m-1"]);
  });
});

describe("V4 row 4 – organiser, another «Bucht» person collects", () => {
  it("organiser without the marking: wartet, numbers only, NO reminder", () => {
    const r = route(travel({ others: [other()] }), ORGA);
    const v4 = station(r, "V4");
    expect(v4).toMatchObject({
      state: "waiting",
      status: { key: "v4.collecting", values: { by: "Sara", released: 2, total: 4 } },
      short: { key: "v4.shortOthers", values: { by: "Sara" } },
    });
    expect(v4?.remind).toBeUndefined();
    expect(v4?.primary).toBeUndefined();
  });
  it("two collecting «Bucht» people: «Sara und Kemal sammeln Reisedaten»", () => {
    const r = route(travel({ others: [other(), other({ byName: "Kemal" })] }), ORGA);
    expect(station(r, "V4")?.status).toEqual({
      key: "v4.collectingMany",
      values: { names: { names: ["Sara", "Kemal"] } },
    });
  });
  it("a plain member never sees other people's requests", () => {
    expect(station(route(travel({ others: [other()] }), MEMBER), "V4")).toBeUndefined();
  });
  it("all answers in: done «Sara hat alle Antworten»", () => {
    const r = route(travel({ others: [other({ complete: true })] }), ORGA);
    expect(station(r, "V4")).toMatchObject({
      state: "done",
      status: { key: "v4.doneOthers", values: { by: "Sara" } },
    });
  });
});

describe("V4 row 5 – «Bucht» without any request: a quiet «später» line", () => {
  it.each([BOOKER, ORGA_BOOKER])("%j: later, never «als Nächstes», not counted", (viewer) => {
    const r = route(travel(), viewer);
    expect(r.groups.next?.id).not.toBe("V4");
    const later = r.groups.later.find((s) => s.id === "V4");
    expect(later).toMatchObject({ state: "later", status: { key: "v4.later" } });
    // Meta counts V1, V2 – not V4 (W16 v2.16).
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 2, total: 2 } });
  });
  it("Unterwegs: row 5 disappears", () => {
    expect(station(route(travel(), BOOKER, DURING), "V4")).toBeUndefined();
  });
});

describe("V4 row 6 – done", () => {
  it("member: shared / declined / several / deleted", () => {
    expect(station(route(travel({ toMe: [toMe("released")] })), "V4")?.status).toEqual({
      key: "v4.doneShared",
      values: { by: "Sara" },
    });
    expect(station(route(travel({ toMe: [toMe("declined")] })), "V4")?.status).toEqual({
      key: "v4.doneDeclined",
      values: { by: "Sara" },
    });
    expect(
      station(
        route(travel({ toMe: [toMe("released"), toMe("declined", { requestId: "r-2" })] })),
        "V4",
      )?.status,
    ).toEqual({ key: "v4.doneMany", values: { count: 2 } });
  });
  it("«Bucht»: closed / nobody shared", () => {
    expect(
      station(route(travel({ mine: [mine({ closed: true })] }), BOOKER), "V4")?.status,
    ).toEqual({ key: "v4.doneClosed" });
    expect(
      station(
        route(travel({ mine: [mine({ released: 0, open: [], complete: true })] }), BOOKER),
        "V4",
      )?.status,
    ).toEqual({ key: "v4.doneNobody" });
  });
  it("V4 counts in the meta once visible (not row 5)", () => {
    const r = route(travel({ toMe: [toMe("released")] }));
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 3, total: 3 } });
  });
});

describe("D3 «Reisedaten gelöscht» (Danach)", () => {
  it("affected, before the deletion date: «als Nächstes» with the date", () => {
    const r = route(travel({ affected: true }), MEMBER, AFTER);
    expect(station(r, "D3")).toMatchObject({
      state: "next",
      status: { key: "d3.before", values: { date: { date: "2027-06-26" } } },
      href: { kind: "page", page: "travelData" },
    });
  });
  it("deleted: done «Am … gelöscht – wie angekündigt», counted in the meta", () => {
    const r = route(travel({ affected: true, deleted: true }), BOOKER, GONE);
    expect(station(r, "D3")).toMatchObject({ state: "done", status: { key: "d3.done" } });
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 1, total: 1 } });
  });
  it("not affected: no D3; not in Vorbereitung", () => {
    expect(station(route(travel(), MEMBER, AFTER), "D3")).toBeUndefined();
    expect(station(route(travel({ affected: true }), MEMBER, BEFORE), "D3")).toBeUndefined();
  });
});

describe("tile «Reisedaten» (W16 v2.16, R.9 I11-03)", () => {
  const tile = (r: ReturnType<typeof tripRoute>) => r.tiles.find((t) => t.area === "travelData");
  it("«Bucht» with releases once V4 is done: «{released} von {total} freigegeben · gelöscht am …»", () => {
    const r = route(
      travel({ mine: [mine({ released: 3, open: [], complete: true, usedSinceComplete: true })] }),
      BOOKER,
    );
    expect(tile(r)?.status).toEqual([
      { key: "tiles.travelMine", values: { released: 3, total: 4 } },
      { key: "tiles.travelDeleteOn", values: { date: { date: "2027-06-26" } } },
    ]);
  });
  it("every person with an own release gets the tile (withdrawal one tap away)", () => {
    const r = route(
      travel({ toMe: [toMe("released"), toMe("released", { requestId: "r-2", byName: "Lena" })] }),
    );
    expect(tile(r)?.status[0]).toEqual({
      key: "tiles.travelShared",
      values: { names: { names: ["Sara", "Lena"] } },
    });
  });
  it("no tile while V4 is dran/wartet/später – one entry per area", () => {
    expect(tile(route(travel({ toMe: [toMe("open")] })))).toBeUndefined();
    expect(tile(route(travel({ mine: [mine()] }), BOOKER))).toBeUndefined();
    expect(tile(route(travel(), BOOKER))).toBeUndefined();
  });
  it("no tile without data, in Danach or after the deletion", () => {
    expect(tile(route(travel({ toMe: [toMe("declined")] })))).toBeUndefined();
    expect(
      tile(route(travel({ toMe: [toMe("released")], affected: true }), MEMBER, AFTER)),
    ).toBeUndefined();
    expect(tile(route(travel({ toMe: [toMe("released")], deleted: true })))).toBeUndefined();
  });
});

describe("V3 «Bucher» = the «Bucht» people (W16 v2.16, W18 E.16)", () => {
  const stay: StayStatus = {
    total: 3,
    myUnrated: 0,
    myNew: 0,
    membersDone: 5,
    membersTotal: 5,
    favourite: null,
    chosen: { title: "Villa" },
    booked: false,
    rebook: false,
    withoutApp: false,
  };
  const v3 = (viewer: RouteViewer, bookerNames: string[]) =>
    all(tripRoute(trip({ bookerNames }), viewer, areas(null, stay), BEFORE)).find(
      (s) => s.id === "V3",
    );
  it("Sara books (not organiser): Sara dran rank 2", () => {
    expect(v3(BOOKER, ["Sara"])).toMatchObject({ state: "yours", rank: 2 });
  });
  it("organiser without the marking waits with «Sara Bescheid geben»", () => {
    expect(v3(ORGA, ["Sara"])).toMatchObject({
      state: "waiting",
      status: { key: "v3.memberBook", values: { bookers: { or: ["Sara"] } } },
      remind: { occasion: "stay-book", label: { key: "v2.nudgeOrga", values: { orga: "Sara" } } },
    });
  });
  it("two «Bucht» people: «Sara oder Kemal bucht …», «Bescheid geben»", () => {
    expect(v3(MEMBER, ["Sara", "Kemal"])).toMatchObject({
      status: { key: "v3.memberBook", values: { bookers: { or: ["Sara", "Kemal"] } } },
      remind: { label: { key: "v3.nudgeBookers" } },
    });
  });
  it("nobody marked: the organiser books (Increment 9 behaviour)", () => {
    expect(v3(ORGA, [])).toMatchObject({ state: "yours", rank: 2 });
    expect(v3(MEMBER, [])).toMatchObject({
      status: { values: { bookers: { or: ["Lena"] } } },
    });
  });
});
