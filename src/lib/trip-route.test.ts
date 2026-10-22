import { describe, expect, it } from "vitest";
import {
  ANNOUNCE_DAYS,
  dayRingPercent,
  freshlyDone,
  INFO_TASK_DAYS,
  subphaseOf,
  tripRoute,
  type InfoStatus,
  type RouteAreas,
  type RouteTrip,
  type RouteViewer,
  type TripStation,
} from "./trip-route";

// Example of W16: Kroatien 2027, Sa. 12. – Sa. 19. Juni (8 days, 7 nights), fixed 2027-02-14.
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
const EMPTY_INFO: InfoStatus = { meeting: null, checkIn: null, checkOut: null, hasAddress: false };
const FULL_INFO: InfoStatus = {
  meeting: "Treffpunkt 6:15 Uhr · Flughafen München T2",
  checkIn: "15:00",
  checkOut: "10:00",
  hasAddress: true,
};
const areas = (patch: Partial<RouteAreas> = {}): RouteAreas => ({
  group: { placeholders: [] },
  info: EMPTY_INFO,
  ...patch,
});
const MIA = { id: "p-mia", name: "Mia", withoutApp: false };
const TOM = { id: "p-tom", name: "Tom", withoutApp: false };
const BEFORE = "2027-05-02"; // 41 days to go
const ids = (list: readonly TripStation[]) => list.map((s) => s.id);
const station = (list: readonly TripStation[], id: string) => list.find((s) => s.id === id);

describe("subphases (F-053, I8-06: border days in the trip's time zone)", () => {
  it.each([
    ["2027-06-11", "before"],
    ["2027-06-12", "during"],
    ["2027-06-19", "during"],
    ["2027-06-20", "after"],
  ] as const)("%s → %s", (today, expected) => {
    expect(subphaseOf("2027-06-12", "2027-06-19", today)).toBe(expected);
    expect(tripRoute(trip(), MEMBER, areas(), today).subphase).toBe(expected);
  });

  it("phase line, sr sentence, ring and head buttons per sub-phase (v2.13)", () => {
    const before = tripRoute(trip(), MEMBER, areas(), BEFORE);
    expect(before.phaseLine).toEqual({ key: "phase.before", values: { count: 41 } });
    expect(before.srSentence).toEqual({ key: "sr.before", values: { count: 41 } });
    expect(before.ring).toMatchObject({ kind: "count", count: 41 });
    expect(before.ringLabel).toEqual({ key: "ring.before", values: { count: 41 } });
    expect(before.headActions).toEqual(["calendar"]);
    expect(before.wayTitle.key).toBe("way.before");

    const during = tripRoute(trip(), MEMBER, areas(), "2027-06-14");
    expect(during.phaseLine).toEqual({ key: "phase.during", values: { day: 3, total: 8 } });
    expect(during.ring).toEqual({ kind: "day", day: 3, total: 8, percent: 37.5 });
    expect(during.headActions).toEqual([]);
    expect(during.meta).toEqual({ key: "meta.day", values: { day: 3, total: 8 } });
    expect(during.wayTitle.key).toBe("way.during");

    const after = tripRoute(trip(), MEMBER, areas(), "2027-06-28");
    expect(after.phaseLine).toEqual({ key: "phase.after", values: { count: 9 } });
    expect(after.ring).toEqual({ kind: "bye", percent: 100 });
    expect(after.headActions).toEqual([]);
    expect(after.meta).toBeNull();
    expect(after.heute.label).toEqual({ kind: "back", days: 9 });
    expect(after.wayTitle.key).toBe("way.after");
  });

  it("day ring: at least 4 %, full on the last day", () => {
    expect(dayRingPercent(1, 30)).toBe(4);
    expect(dayRingPercent(8, 8)).toBe(100);
    expect(dayRingPercent(1, 0)).toBe(100);
  });
});

describe("V1 «Termin steht» (W16 v2.4, I8-03)", () => {
  it("member: always done with «Platz 1 mit 5× Ja · festgelegt von Lena»", () => {
    const route = tripRoute(trip({ announced: false }), MEMBER, areas(), "2027-02-15");
    const v1 = station(route.groups.done, "V1");
    expect(v1?.state).toBe("done");
    expect(v1?.status).toEqual({ key: "v1.doneVotes", values: { count: 5, orga: "Lena" } });
    expect(v1?.href).toEqual({ kind: "sheet", sheet: "decided" });
  });

  it("without a matching vote option the status names only the organiser", () => {
    const route = tripRoute(trip({ yesVotes: null }), MEMBER, areas(), BEFORE);
    expect(station(route.groups.done, "V1")?.status).toEqual({
      key: "v1.done",
      values: { orga: "Lena" },
    });
  });

  it("organiser before «Allen Bescheid geben»: your turn with the announce action", () => {
    const route = tripRoute(trip({ announced: false }), ORGA, areas(), "2027-02-15");
    expect(ids(route.heute.items)).toEqual(["V1"]);
    const v1 = route.heute.items[0];
    expect(v1?.state).toBe("yours");
    expect(v1?.status.key).toBe("v1.yours");
    expect(v1?.primary).toEqual({ label: { key: "v1.announce" }, action: { kind: "announce" } });
  });

  it("organiser after announcing, or 7 days after fixing: done", () => {
    expect(station(tripRoute(trip(), ORGA, areas(), "2027-02-15").groups.done, "V1")?.state).toBe(
      "done",
    );
    const lastDay = `2027-02-${String(14 + ANNOUNCE_DAYS - 1)}`;
    const dayAfter = `2027-02-${String(14 + ANNOUNCE_DAYS)}`;
    expect(ids(tripRoute(trip({ announced: false }), ORGA, areas(), lastDay).heute.items)).toEqual([
      "V1",
    ]);
    expect(
      ids(tripRoute(trip({ announced: false }), ORGA, areas(), dayAfter).groups.done),
    ).toContain("V1");
  });
});

describe("V2 «Alle sind dabei» + UX-9 (W16 v2.4, I8-04)", () => {
  it("no open placeholders → done «Alle 6 sind dabei»", () => {
    const route = tripRoute(trip(), MEMBER, areas(), BEFORE);
    expect(station(route.groups.done, "V2")?.status).toEqual({
      key: "v2.done",
      values: { count: 6 },
    });
  });

  it("member, placeholder open → waiting with «Lena Bescheid geben»", () => {
    const route = tripRoute(trip(), MEMBER, areas({ group: { placeholders: [MIA] } }), BEFORE);
    const v2 = station(route.groups.waiting, "V2");
    expect(v2?.state).toBe("waiting");
    expect(v2?.status).toEqual({
      key: "v2.waiting",
      values: { names: { names: ["Mia"] }, count: 1 },
    });
    expect(v2?.remind).toMatchObject({ occasion: "orga", keys: ["p-mia"] });
    expect(v2?.remind?.label).toEqual({ key: "v2.nudgeOrga", values: { orga: "Lena" } });
    expect(v2?.textActions).toBeUndefined();
  });

  it("organiser, one placeholder → «Mia erinnern» + «Mia macht ohne App mit»", () => {
    const route = tripRoute(trip(), ORGA, areas({ group: { placeholders: [MIA] } }), BEFORE);
    const v2 = station(route.groups.waiting, "V2");
    expect(v2?.remind).toMatchObject({ occasion: "placeholder", keys: ["p-mia"] });
    expect(v2?.remind?.label).toEqual({ key: "v2.remindOne", values: { name: "Mia" } });
    expect(v2?.textActions).toEqual([
      {
        label: { key: "v2.withoutApp", values: { name: "Mia" } },
        action: { kind: "withoutApp", placeholderId: "p-mia", name: "Mia" },
      },
    ]);
  });

  it("organiser, several placeholders → the list (status step), one text button each", () => {
    const route = tripRoute(trip(), ORGA, areas({ group: { placeholders: [MIA, TOM] } }), BEFORE);
    const v2 = station(route.groups.waiting, "V2");
    expect(v2?.remind?.keys).toEqual(["p-mia", "p-tom"]);
    expect(v2?.remind?.label.key).toBe("v2.remindAll");
    expect(v2?.textActions?.map((a) => a.action.kind)).toEqual(["withoutApp", "withoutApp"]);
  });

  it("every open placeholder «ohne App» → done «Alle dabei · Mia ohne App», undo for the organiser", () => {
    const offline = { ...MIA, withoutApp: true };
    const orga = tripRoute(trip(), ORGA, areas({ group: { placeholders: [offline] } }), BEFORE);
    const v2 = station(orga.groups.done, "V2");
    expect(v2?.offline).toBe(true);
    expect(v2?.status).toEqual({
      key: "v2.doneOffline",
      values: { names: { names: ["Mia"] }, count: 1 },
    });
    expect(v2?.textActions?.[0]?.action).toEqual({
      kind: "undoWithoutApp",
      placeholderId: "p-mia",
      name: "Mia",
    });
    const member = tripRoute(trip(), MEMBER, areas({ group: { placeholders: [offline] } }), BEFORE);
    expect(station(member.groups.done, "V2")?.textActions).toBeUndefined();
  });

  it("a new placeholder opens V2 again (one marked, one open → waiting)", () => {
    const route = tripRoute(
      trip(),
      ORGA,
      areas({ group: { placeholders: [{ ...MIA, withoutApp: true }, TOM] } }),
      BEFORE,
    );
    const v2 = station(route.groups.waiting, "V2");
    expect(v2?.status.values?.names).toEqual({ names: ["Tom"] });
    expect(v2?.textActions?.map((a) => a.action.kind)).toEqual(["withoutApp", "undoWithoutApp"]);
  });

  it("after the start an open placeholder is «nicht genutzt» (done group, no tick)", () => {
    const route = tripRoute(
      trip(),
      MEMBER,
      areas({ group: { placeholders: [MIA] } }),
      "2027-06-14",
    );
    const v2 = station(route.groups.done, "V2");
    expect(v2?.unused).toBe(true);
    expect(v2?.status.key).toBe("v2.unused");
    expect(route.groups.waiting).toEqual([]);
  });
});

describe("A2 «Infos eintragen» (W16 v2.4, I8-05)", () => {
  const inDays = (days: number) => {
    const date = new Date(Date.UTC(2027, 5, 12));
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
  };

  it("organiser, infos empty, ≤ 21 days before arrival → your turn → /info/edit", () => {
    const route = tripRoute(trip(), ORGA, areas(), inDays(INFO_TASK_DAYS));
    const a2 = station(route.heute.items, "A2");
    expect(a2).toMatchObject({ kind: "task", state: "yours" });
    expect(a2?.href).toEqual({ kind: "page", page: "infoEdit" });
    expect(a2?.primary?.action).toEqual({ kind: "page", page: "infoEdit" });
  });

  it("not 22 days before, not for members, not once a meeting point or address exists", () => {
    expect(station(tripRoute(trip(), ORGA, areas(), inDays(22)).heute.items, "A2")).toBeUndefined();
    expect(
      station(tripRoute(trip(), MEMBER, areas(), inDays(5)).heute.items, "A2"),
    ).toBeUndefined();
    const meeting = { ...EMPTY_INFO, meeting: "Bahnhof 8 Uhr" };
    expect(
      station(tripRoute(trip(), ORGA, areas({ info: meeting }), inDays(5)).heute.items, "A2"),
    ).toBeUndefined();
    const address = { ...EMPTY_INFO, hasAddress: true };
    expect(
      station(tripRoute(trip(), ORGA, areas({ info: address }), inDays(5)).heute.items, "A2"),
    ).toBeUndefined();
  });

  it("area not built (adapter null) → no task, no tile", () => {
    const route = tripRoute(trip(), ORGA, areas({ info: null }), inDays(5));
    expect(station(route.heute.items, "A2")).toBeUndefined();
    expect(route.tiles).toEqual([]);
    expect(route.goal.href).toBeNull();
  });

  it("«Heute» order: V1 (blocks others) before A2, the first carries the primary", () => {
    const route = tripRoute(
      trip({ announced: false, fixedOn: "2027-05-30" }),
      ORGA,
      areas(),
      "2027-06-01",
    );
    expect(ids(route.heute.items)).toEqual(["V1", "A2"]);
    expect(route.heute.sentence).toEqual({ key: "sentence.h1", values: { count: 2 } });
  });
});

describe("Heute-Sätze H-1–H-7 and precedence (W16 v2.5)", () => {
  it("H-1: something for me", () => {
    const route = tripRoute(trip({ announced: false }), ORGA, areas(), "2027-02-15");
    expect(route.heute.sentence).toEqual({ key: "sentence.h1", values: { count: 1 } });
  });

  it("H-2: nothing for me, V2 waits → «Ihr wartet auf: Mia tritt bei»", () => {
    const route = tripRoute(trip(), MEMBER, areas({ group: { placeholders: [MIA] } }), BEFORE);
    expect(route.heute.sentence).toEqual({
      key: "sentence.h2",
      values: {
        short: { msg: { key: "v2.short", values: { names: { names: ["Mia"] }, count: 1 } } },
      },
    });
  });

  it("H-1 wins over H-2 (organiser: V1 to do while V2 waits)", () => {
    const route = tripRoute(
      trip({ announced: false }),
      ORGA,
      areas({ group: { placeholders: [MIA] } }),
      "2027-02-15",
    );
    expect(route.heute.sentence.key).toBe("sentence.h1");
  });

  it("H-3: everything done before the trip", () => {
    expect(tripRoute(trip(), MEMBER, areas(), BEFORE).heute.sentence.key).toBe("sentence.h3");
  });

  it("H-4: travelling, nothing planned", () => {
    expect(tripRoute(trip(), MEMBER, areas(), "2027-06-14").heute.sentence.key).toBe("sentence.h4");
  });

  it("H-5b: after the trip (costs not built)", () => {
    expect(tripRoute(trip(), MEMBER, areas(), "2027-06-28").heute.sentence.key).toBe(
      "sentence.h5b",
    );
  });

  it("H-7 on the first travel day – also with a meeting point (H-7 before H-6)", () => {
    const withMeeting = tripRoute(trip(), MEMBER, areas({ info: FULL_INFO }), "2027-06-12");
    expect(withMeeting.heute.sentence.key).toBe("sentence.h7");
    expect(withMeeting.departureDay).toBe(true);
    const meet = withMeeting.heute.items[0];
    expect(meet).toMatchObject({ id: "T-meet", kind: "plan" });
    expect(meet?.status).toEqual({ key: "plan.meetStatus", values: { text: FULL_INFO.meeting } });
    expect(meet?.primary?.action).toEqual({ kind: "page", page: "info" });

    const without = tripRoute(trip(), MEMBER, areas(), "2027-06-12");
    expect(without.heute.sentence.key).toBe("sentence.h7");
    expect(without.heute.items).toEqual([]);
  });

  it("no meeting point card after day 1; departureDay only on the arrival day", () => {
    const route = tripRoute(trip(), MEMBER, areas({ info: FULL_INFO }), "2027-06-13");
    expect(route.heute.items).toEqual([]);
    expect(route.departureDay).toBe(false);
  });
});

describe("done group, meta and goals (W16 v2.3, v2.13)", () => {
  it("Vorbereitung: meta «{done} von 2 geschafft», goal V6 → infos", () => {
    const route = tripRoute(trip(), MEMBER, areas({ group: { placeholders: [MIA] } }), BEFORE);
    expect(route.meta).toEqual({ key: "meta.done", values: { done: 1, total: 2 } });
    expect(route.doneSummary).toBeNull();
    expect(route.goal).toMatchObject({ id: "V6", date: "2027-06-12" });
    expect(route.goal.href).toEqual({ kind: "page", page: "info" });
    expect(route.groups.next).toBeNull();
    expect(route.groups.later).toEqual([]);
  });

  it("goal V6 status: meeting point → check-in → days to go", () => {
    const meeting = tripRoute(trip(), MEMBER, areas({ info: FULL_INFO }), BEFORE).goal;
    expect(meeting.status).toEqual({ key: "goal.text", values: { text: FULL_INFO.meeting } });
    const checkIn = tripRoute(
      trip(),
      MEMBER,
      areas({ info: { ...FULL_INFO, meeting: null } }),
      BEFORE,
    ).goal;
    expect(checkIn.status).toEqual({ key: "goal.checkIn", values: { time: { time: "15:00" } } });
    expect(tripRoute(trip(), MEMBER, areas(), BEFORE).goal.status).toEqual({
      key: "goal.daysToGo",
      values: { count: 41 },
    });
  });

  it("Unterwegs: «Vorbereitung · n erledigt», goal «Heimreise» with check-out or days left", () => {
    const route = tripRoute(trip(), MEMBER, areas({ info: FULL_INFO }), "2027-06-14");
    expect(route.doneSummary).toEqual({ key: "done.prep", values: { count: 2 } });
    expect(ids(route.groups.done)).toEqual(["V1", "V2"]);
    expect(route.goal).toMatchObject({ id: "T-goal", date: "2027-06-19" });
    expect(route.goal.status).toEqual({
      key: "goal.checkOut",
      values: { time: { time: "10:00" } },
    });
    expect(tripRoute(trip(), MEMBER, areas(), "2027-06-14").goal.status).toEqual({
      key: "goal.daysLeft",
      values: { count: 5 },
    });
  });

  it("Danach: «Reise · Vorbereitung und 8 Tage», goal «Wohin geht's als Nächstes?» + deletion", () => {
    const route = tripRoute(trip(), MEMBER, areas(), "2027-06-28");
    expect(route.doneSummary).toEqual({ key: "done.trip", values: { days: 8 } });
    expect(route.goal.id).toBe("D-goal");
    expect(route.goal.button?.href).toEqual({ kind: "page", page: "newTrip" });
    expect(route.goal.note).toEqual({
      key: "goal.deletion",
      values: { date: { date: "2027-09-17" } },
    });
    expect(tripRoute(trip({ deletionDate: null }), MEMBER, areas(), "2027-06-28").goal.note).toBe(
      undefined,
    );
  });

  it("organiser after the start: nothing is «your turn» (V1 done, no A2)", () => {
    const route = tripRoute(trip({ announced: false }), ORGA, areas(), "2027-06-14");
    expect(route.heute.items).toEqual([]);
  });
});

describe("tile «Infos» (W16 v2.6, v2.13)", () => {
  it("filled: first available facts joined", () => {
    const tile = tripRoute(trip(), MEMBER, areas({ info: FULL_INFO }), BEFORE).tiles[0];
    expect(tile?.status.map((m) => m.key)).toEqual([
      "tiles.infoMeeting",
      "tiles.infoCheckIn",
      "tiles.infoAddress",
    ]);
    expect(tile?.href).toEqual({ kind: "page", page: "info" });
  });

  it("empty: member «Noch leer – Lena trägt sie ein», organiser «Infos ergänzen»", () => {
    expect(tripRoute(trip(), MEMBER, areas(), BEFORE).tiles[0]?.status).toEqual([
      { key: "tiles.infoEmpty", values: { orga: "Lena" } },
    ]);
    expect(tripRoute(trip(), ORGA, areas(), BEFORE).tiles[0]?.status).toEqual([
      { key: "tiles.infoEmptyOrga" },
    ]);
  });
});

describe("«Neu erledigt» (W16 v2.7, UM-4)", () => {
  it("first visit: nothing new; later: only newly done stations", () => {
    expect(freshlyDone(null, ["V1", "V2"])).toEqual([]);
    expect(freshlyDone(["V1"], ["V1", "V2"])).toEqual(["V2"]);
    expect(freshlyDone(["V1", "V2"], ["V1"])).toEqual([]);
  });
});
