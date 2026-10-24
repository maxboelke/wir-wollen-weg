import { describe, expect, it } from "vitest";
import {
  tripRoute,
  type InfoStatus,
  type RouteAreas,
  type RouteTrip,
  type RouteViewer,
  type StayStatus,
  type TripStation,
} from "./trip-route";

// V3 «Unterkunft» (W16 v2.14, features.md R.7 I9-08): one test per table row and role.
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
const INFO: InfoStatus = {
  meeting: "Treffpunkt 6:15",
  checkIn: "15:00",
  checkOut: "10:00",
  hasAddress: true,
};
const BEFORE = "2027-05-02";
const DURING = "2027-06-14";
const AFTER = "2027-06-28";
const stay = (patch: Partial<StayStatus> = {}): StayStatus => ({
  total: 5,
  myUnrated: 0,
  myNew: 0,
  membersDone: 3,
  membersTotal: 5,
  favourite: null,
  chosen: null,
  booked: false,
  rebook: false,
  withoutApp: false,
  ...patch,
});
const areas = (s: StayStatus | null): RouteAreas => ({
  group: { placeholders: [] },
  info: INFO,
  stay: s,
});
const route = (s: StayStatus, viewer: RouteViewer = MEMBER, today = BEFORE) =>
  tripRoute(trip(), viewer, areas(s), today);
const v3 = (r: ReturnType<typeof tripRoute>): TripStation | undefined =>
  [
    ...r.groups.done,
    ...r.heute.items,
    ...r.groups.waiting,
    ...(r.groups.next ? [r.groups.next] : []),
    ...r.groups.later,
  ].find((s) => s.id === "V3");

describe("V3 not built (Increment 8 callers)", () => {
  it("no station, no tile, meta counts 2 stations", () => {
    const r = tripRoute(trip(), MEMBER, { group: { placeholders: [] }, info: INFO }, BEFORE);
    expect(v3(r)).toBeUndefined();
    expect(r.tiles.map((t) => t.area)).toEqual(["info"]);
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 2, total: 2 } });
  });
});

describe("V3 rule 1 – done: picked and booked, or «ohne App erledigt»", () => {
  it.each([MEMBER, ORGA])("booked (%j) → done «{title} · gebucht ✓» + tile", (viewer) => {
    const r = route(stay({ chosen: { title: "Kamena Kuća" }, booked: true }), viewer);
    const station = v3(r);
    expect(station?.state).toBe("done");
    expect(station?.status).toEqual({ key: "v3.doneBooked", values: { title: "Kamena Kuća" } });
    expect(r.tiles[0]).toMatchObject({
      area: "stay",
      status: [{ key: "tiles.stayBooked", values: { title: "Kamena Kuća" } }],
      href: { kind: "page", page: "stays" },
    });
    expect(r.meta).toEqual({ key: "meta.done", values: { done: 3, total: 3 } });
  });

  it("UX-9 member: done «Ohne App erledigt», no undo", () => {
    const station = v3(route(stay({ withoutApp: true })));
    expect(station).toMatchObject({
      state: "done",
      offline: true,
      status: { key: "v3.doneOffline" },
    });
    expect(station?.textActions).toBeUndefined();
  });

  it("UX-9 organiser: undo in the done group, tile «Ohne App erledigt»", () => {
    const r = route(stay({ withoutApp: true, total: 0 }), ORGA);
    expect(v3(r)?.textActions).toEqual([
      { label: { key: "v3.undo" }, action: { kind: "stayWithoutApp", on: false } },
    ]);
    expect(r.tiles[0]?.status).toEqual([{ key: "tiles.stayOffline" }]);
  });
});

describe("V3 rule 2 – travelling / back and not done: «nicht genutzt»", () => {
  it("picked, not booked → unused with the title; tile shows the title", () => {
    const r = route(stay({ chosen: { title: "Villa" } }), MEMBER, DURING);
    expect(v3(r)).toMatchObject({
      state: "done",
      unused: true,
      status: { key: "v3.unusedChosen", values: { title: "Villa" } },
    });
    expect(r.tiles[0]?.status).toEqual([{ key: "tiles.stayChosen", values: { title: "Villa" } }]);
    expect(r.heute.items).toHaveLength(0);
  });
  it("nothing picked, suggestions exist → unused + tile «n Vorschläge · keiner festgelegt»", () => {
    const r = route(stay({ myUnrated: 2 }), ORGA, AFTER);
    expect(v3(r)?.status).toEqual({ key: "v3.unusedNone" });
    expect(r.tiles[0]?.status).toEqual([{ key: "tiles.stayNone", values: { count: 5 } }]);
  });
  it("never used → unused, no tile", () => {
    const r = route(stay({ total: 0, membersDone: 5 }), MEMBER, DURING);
    expect(v3(r)?.unused).toBe(true);
    expect(r.tiles.map((t) => t.area)).toEqual(["info"]);
  });
});

describe("V3 rule 3 – own unrated suggestions: your turn (rank 3)", () => {
  it("member: «Du hast 2 von 5 bewertet», primary «Jetzt swipen»", () => {
    const r = route(stay({ myUnrated: 3 }));
    const station = r.heute.items.find((s) => s.id === "V3");
    expect(station).toMatchObject({
      state: "yours",
      rank: 3,
      status: { key: "v3.rateShort", values: { rated: 2, total: 5 } },
      detail: { key: "v3.rateLong", values: { count: 3, rated: 2, total: 5 } },
      progress: 0.4,
      primary: {
        label: { key: "v3.swipe" },
        action: { kind: "page", page: "staysSwipe" },
      },
    });
    expect(station?.textActions).toBeUndefined();
    expect(r.heute.sentence).toEqual({ key: "sentence.h1", values: { count: 1 } });
  });
  it("new suggestions since the last swipe → «1 neue Unterkunft …»", () => {
    const station = route(stay({ myUnrated: 1, myNew: 1 })).heute.items[0];
    expect(station?.detail).toEqual({ key: "v3.rateNew", values: { count: 1 } });
  });
  it("organiser: plus «Schon festlegen» and «Haben wir schon …» (rule 3 before 4)", () => {
    const station = route(stay({ myUnrated: 1, membersDone: 4 }), ORGA).heute.items[0];
    expect(station?.rank).toBe(3);
    expect(station?.textActions).toEqual([
      { label: { key: "v3.fixNow" }, action: { kind: "page", page: "staysRanking" } },
      { label: { key: "v3.withoutApp" }, action: { kind: "stayWithoutApp", on: true } },
    ]);
  });
});

describe("V3 rules 4/5 – organiser", () => {
  it("4: everybody rated → «Festlegen» (rank 1) with the favourite", () => {
    const station = route(
      stay({ membersDone: 5, favourite: { titles: ["Villa"], likes: 4 } }),
      ORGA,
    ).heute.items[0];
    expect(station).toMatchObject({
      state: "yours",
      rank: 1,
      status: { key: "v3.fixFavourite", values: { title: "Villa", likes: 4 } },
      primary: {
        label: { key: "v3.fixAction" },
        action: { kind: "page", page: "staysRanking" },
      },
    });
  });
  it("4: tie and no ♥", () => {
    expect(
      route(stay({ membersDone: 5, favourite: { titles: ["A", "B"], likes: 2 } }), ORGA).heute
        .items[0]?.status,
    ).toEqual({ key: "v3.fixTied", values: { titles: { names: ["A", "B"] } } });
    expect(route(stay({ membersDone: 5 }), ORGA).heute.items[0]?.status).toEqual({
      key: "v3.fixNoFavourite",
    });
  });
  it("5: picked, not booked → «{title} buchen» (rank 2); after new dates «neu buchen»", () => {
    const station = route(stay({ chosen: { title: "Villa" } }), ORGA).heute.items[0];
    expect(station).toMatchObject({
      rank: 2,
      status: { key: "v3.book", values: { title: "Villa" } },
      primary: { label: { key: "v3.toStay" }, action: { kind: "page", page: "stays" } },
    });
    expect(
      route(stay({ chosen: { title: "Villa" }, rebook: true }), ORGA).heute.items[0]?.status,
    ).toEqual({ key: "v3.rebook", values: { title: "Villa" } });
  });
  it("Heute order: V1 announce (1) · V3 pick (1) · V3 book (2) = A2 (2)", () => {
    const pick = tripRoute(
      trip({ announced: false }),
      ORGA,
      areas(stay({ membersDone: 5 })),
      "2027-02-15",
    );
    expect(pick.heute.items.map((s) => s.id)).toEqual(["V1", "V3"]);
    const book = tripRoute(
      trip(),
      ORGA,
      {
        group: { placeholders: [] },
        info: { meeting: null, checkIn: null, checkOut: null, hasAddress: false },
        stay: stay({ chosen: { title: "Villa" } }),
      },
      "2027-06-01",
    );
    expect(book.heute.items.map((s) => [s.id, s.rank ?? 2])).toEqual([
      ["V3", 2],
      ["A2", 2],
    ]);
  });
});

describe("V3 rules 6–8 – waiting", () => {
  it("6 member: «3 von 5 haben bewertet» + Erinnern (stay-rate); H-2 short", () => {
    const r = route(stay());
    const station = r.groups.waiting.find((s) => s.id === "V3");
    expect(station?.status).toEqual({ key: "v3.waiting", values: { done: 3, total: 5 } });
    expect(station?.remind).toMatchObject({ occasion: "stay-rate", label: { key: "v3.remind" } });
    expect(station?.textActions).toBeUndefined();
    expect(r.heute.sentence).toEqual({
      key: "sentence.h2",
      values: { short: { msg: { key: "v3.shortRate" } } },
    });
  });
  it("6 organiser: + favourite and the text actions", () => {
    const station = route(stay({ favourite: { titles: ["Villa"], likes: 3 } }), ORGA).groups
      .waiting[0];
    expect(station?.status).toEqual({
      key: "v3.waitingOrga",
      values: {
        done: 3,
        total: 5,
        favourite: { msg: { key: "v3.waitFavourite", values: { title: "Villa", likes: 3 } } },
      },
    });
    expect(station?.textActions?.map((a) => a.label.key)).toEqual(["v3.fixNow", "v3.withoutApp"]);
  });
  it("7 member: everybody rated → «Lena legt fest» + stay-fix", () => {
    const station = route(stay({ membersDone: 5 })).groups.waiting[0];
    expect(station?.status).toEqual({ key: "v3.memberFix", values: { orga: "Lena" } });
    expect(station?.remind?.occasion).toBe("stay-fix");
    expect(station?.short).toEqual({ key: "v3.shortFix", values: { orga: "Lena" } });
  });
  it("8 member: picked, not booked → «Lena bucht …» + stay-book; after new dates «neu»", () => {
    const station = route(stay({ chosen: { title: "Villa" } })).groups.waiting[0];
    expect(station?.status).toEqual({
      key: "v3.memberBook",
      values: { bookers: { or: ["Lena"] }, title: "Villa" },
    });
    expect(station?.remind?.occasion).toBe("stay-book");
    expect(
      route(stay({ chosen: { title: "Villa" }, rebook: true })).groups.waiting[0]?.status.key,
    ).toBe("v3.memberRebook");
  });
  it("member with unrated suggestions while picked → still rule 8 (no rating after picking)", () => {
    expect(route(stay({ chosen: { title: "Villa" }, myUnrated: 2 })).groups.waiting[0]?.id).toBe(
      "V3",
    );
  });
});

describe("V3 rule 9 – no suggestions yet", () => {
  it("member: «Als Nächstes», no task, no reminder", () => {
    const r = route(stay({ total: 0, membersDone: 5 }));
    expect(r.groups.next).toMatchObject({ id: "V3", state: "next", status: { key: "v3.empty" } });
    expect(r.groups.next?.remind).toBeUndefined();
    expect(r.groups.next?.textActions).toBeUndefined();
  });
  it("organiser: + «Haben wir schon / brauchen wir nicht …»", () => {
    const r = route(stay({ total: 0, membersDone: 5 }), ORGA);
    expect(r.groups.next?.textActions).toEqual([
      { label: { key: "v3.withoutApp" }, action: { kind: "stayWithoutApp", on: true } },
    ]);
  });
  it("tile order: Unterkunft before Infos", () => {
    const r = route(stay({ chosen: { title: "Villa" }, booked: true }));
    expect(r.tiles.map((t) => t.area)).toEqual(["stay", "info"]);
  });
});
