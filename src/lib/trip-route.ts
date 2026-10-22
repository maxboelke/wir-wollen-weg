import { diffDays, type IsoDate } from "./dates";
import { ringPercent, RING_MIN_PERCENT } from "./poll";

/**
 * «Reiseverlauf» – the way of a fixed trip (W16 v2 «Reiseverlauf», F-053, Increment 8). Pure,
 * so the cockpit page and the unit tests share one source of truth (contract W16 v2.10).
 *
 * Texts are message references (`Msg`) – the page translates them; dates, times and name
 * lists stay typed values so they are formatted in the viewer's language and region.
 *
 * Every area reports through an adapter (`RouteAreas`); areas that are not built yet are
 * `null` → no station, tile, task, head button or sentence part (W16 v2.13 «keine Teaser»).
 */

export type Subphase = "before" | "during" | "after";
export type StationState = "done" | "yours" | "waiting" | "next" | "later";
/**
 * V1 «Termin steht», V2 «Alle sind dabei», A2 task «Infos eintragen», T-meet meeting point on
 * the first travel day (a plan, not a task), goals V6 / T-goal / D-goal.
 */
export type StationId = "V1" | "V2" | "A2" | "T-meet";
export type GoalId = "V6" | "T-goal" | "D-goal";

/** A value inside a message: formatted by the page (names as a list, dates, clock times). */
export type MsgValue =
  | string
  | number
  | { names: readonly string[] }
  | { date: IsoDate }
  | { time: string }
  | { msg: Msg };

export interface Msg {
  /** Key below the `route` namespace of messages/*.json. */
  key: string;
  values?: Record<string, MsgValue>;
}

export type RouteTarget =
  | { kind: "sheet"; sheet: "decided" | "members" }
  | { kind: "page"; page: "info" | "infoEdit" | "newTrip" };

export type RouteAction =
  | { kind: "announce" }
  | { kind: "withoutApp"; placeholderId: string; name: string }
  | { kind: "undoWithoutApp"; placeholderId: string; name: string };

/** «Erinnern» below a waiting station – opens the remind sheet of the cockpit. */
export interface RouteRemind {
  /** `placeholder`: organiser → personal link(s); `orga`: member → «{orga} Bescheid geben». */
  occasion: "placeholder" | "orga";
  /** Placeholder ids (one → single step, several → list). Empty for `orga`. */
  keys: string[];
  label: Msg;
  /** Accessible name with the object («Lena Bescheid geben, dass Mia fehlt»). */
  name: Msg;
}

export interface TripStation {
  id: StationId;
  /** station = step with an end; task = to-do without a station (A2); plan = appointment. */
  kind: "station" | "task" | "plan";
  state: StationState;
  title: Msg;
  status: Msg;
  /** Where the card leads (sheet or sub-page). */
  href: RouteTarget;
  /** Main action – only shown on the first «Heute» card (the only primary of the page). */
  primary?: { label: Msg; action: RouteTarget | RouteAction };
  remind?: RouteRemind;
  /** Text buttons (e.g. «Mia macht ohne App mit», «Rückgängig» in the done list). */
  textActions?: { label: Msg; action: RouteAction }[];
  /** Done «ohne App» (UX-9) – chip «ohne App erledigt» in the done list. */
  offline?: boolean;
  /** Not done when its sub-phase ended – «nicht genutzt», without a tick (W16 v2.4). */
  unused?: boolean;
  /** Short form for «Ihr wartet auf: …» (H-2). */
  short?: Msg;
}

export interface TripGoal {
  id: GoalId;
  date: IsoDate | null;
  title: Msg;
  status: Msg;
  href: RouteTarget | null;
  /** Danach: «Neue Reise planen» (secondary). */
  button?: { label: Msg; href: RouteTarget };
  /** Danach: «Diese Reise wird am … automatisch gelöscht.» */
  note?: Msg;
}

export interface TripTile {
  area: "info";
  title: Msg;
  /** Parts of the one status line, joined with « · ». */
  status: Msg[];
  href: RouteTarget;
}

export type RingModel =
  | { kind: "count"; percent: number; count: number }
  | { kind: "day"; percent: number; day: number; total: number }
  | { kind: "bye"; percent: 100 };

export interface TripRoute {
  subphase: Subphase;
  /** Day x of y while travelling (arrival day = 1, departure day = y). */
  day: { index: number; total: number };
  phaseLine: Msg;
  /** Screen-reader sentence right after h1 («Noch 41 Tage bis zur Abreise.»). */
  srSentence: Msg;
  ring: RingModel;
  /** Accessible name of the ring button («Vorfreude: noch 41 Tage»). */
  ringLabel: Msg;
  /** Buttons in the ticket stub (W16 v2.2/v2.13): Vorbereitung «Kalender», else none. */
  headActions: "calendar"[];
  wayTitle: Msg;
  meta: Msg | null;
  /** Summary of the collapsed done row; null → «{n} erledigt: {titles}». */
  doneSummary: Msg | null;
  heute: {
    date: IsoDate;
    label: { kind: "date" } | { kind: "day"; day: number } | { kind: "back"; days: number };
    sentence: Msg;
    items: TripStation[];
  };
  groups: {
    done: TripStation[];
    waiting: TripStation[];
    next: TripStation | null;
    later: TripStation[];
  };
  goal: TripGoal;
  tiles: TripTile[];
  /** Arrival day (UX-8): the small celebration may play, sentence H-7. */
  departureDay: boolean;
}

/* ------------------------------------------------------------------------------------------ */
/* Input                                                                                        */
/* ------------------------------------------------------------------------------------------ */

export interface RouteTrip {
  start: IsoDate;
  end: IsoDate;
  /** Day the dates were fixed (start of the «Vorfreude» ring, V1 «7 Tage nach Festlegung»). */
  fixedOn: IsoDate;
  /** The organiser tapped WhatsApp/share/copy in «Allen Bescheid geben» (V1). */
  announced: boolean;
  orgaName: string;
  memberCount: number;
  /** «Platz 1 mit {n}× Ja» – null when the fixed range has no vote option (old data). */
  yesVotes: number | null;
  /** Automatic deletion (F-013) – «Diese Reise wird am … gelöscht.» */
  deletionDate: IsoDate | null;
}

export interface RouteViewer {
  role: "organizer" | "member";
}

/** Status of the info page (F-033) for the way – null = area not built. */
export interface InfoStatus {
  /** First line of «Treffpunkt & Anreise» (W22 C), null when empty. */
  meeting: string | null;
  checkIn: string | null;
  checkOut: string | null;
  hasAddress: boolean;
}

export interface RouteAreas {
  group: { placeholders: readonly { id: string; name: string; withoutApp: boolean }[] };
  info: InfoStatus | null;
  // Increments 9–12 add `stay`, `costs`, `travelData`, `documents` adapters here.
}

/** A2 appears this many days before the arrival when the infos are still empty (W16 v2.4). */
export const INFO_TASK_DAYS = 21;
/** V1 counts as done for the organiser this many days after fixing (W16 v2.4). */
export const ANNOUNCE_DAYS = 7;

/** Urgency under «Heute» (W16 v2.5): what blocks others first, then dates/deadlines. */
const RANK: Record<StationId, number> = { "T-meet": 0, V1: 1, A2: 2, V2: 3 };
/** Catalogue order (W16 v2.3) – ties and every other group. */
const ORDER: Record<StationId, number> = { "T-meet": 0, V1: 1, V2: 2, A2: 3 };

export function subphaseOf(start: IsoDate, end: IsoDate, today: IsoDate): Subphase {
  if (today < start) return "before";
  if (today <= end) return "during";
  return "after";
}

/** Fill of the day ring while travelling: passed days incl. today, at least 4 %. */
export function dayRingPercent(index: number, total: number): number {
  if (total <= 0) return 100;
  const percent = (index / total) * 100;
  return Math.round(Math.min(100, Math.max(RING_MIN_PERCENT, percent)) * 10) / 10;
}

const msg = (key: string, values?: Record<string, MsgValue>): Msg =>
  values ? { key, values } : { key };

function v1Station(trip: RouteTrip, viewer: RouteViewer, today: IsoDate, sub: Subphase) {
  const orgaTurn =
    viewer.role === "organizer" &&
    sub === "before" &&
    !trip.announced &&
    diffDays(trip.fixedOn, today) < ANNOUNCE_DAYS;
  const base = {
    id: "V1" as const,
    kind: "station" as const,
    title: msg("v1.title"),
    href: { kind: "sheet", sheet: "decided" } as const,
  };
  if (orgaTurn) {
    return {
      ...base,
      state: "yours" as const,
      status: msg("v1.yours"),
      primary: { label: msg("v1.announce"), action: { kind: "announce" } as const },
    } satisfies TripStation;
  }
  return {
    ...base,
    state: "done" as const,
    status:
      trip.yesVotes !== null
        ? msg("v1.doneVotes", { count: trip.yesVotes, orga: trip.orgaName })
        : msg("v1.done", { orga: trip.orgaName }),
  } satisfies TripStation;
}

function v2Station(
  trip: RouteTrip,
  viewer: RouteViewer,
  areas: RouteAreas,
  sub: Subphase,
): TripStation {
  const orga = viewer.role === "organizer";
  const open = areas.group.placeholders.filter((p) => !p.withoutApp);
  const offline = areas.group.placeholders.filter((p) => p.withoutApp);
  const base = {
    id: "V2" as const,
    kind: "station" as const,
    title: msg("v2.title"),
    href: { kind: "sheet", sheet: "members" } as const,
  };
  const undo = orga
    ? offline.map((p) => ({
        label: msg("v2.undo", { name: p.name }),
        action: { kind: "undoWithoutApp", placeholderId: p.id, name: p.name } as const,
      }))
    : [];
  if (open.length === 0) {
    return {
      ...base,
      state: "done",
      status:
        offline.length > 0
          ? msg("v2.doneOffline", {
              names: { names: offline.map((p) => p.name) },
              count: offline.length,
            })
          : msg("v2.done", { count: trip.memberCount }),
      ...(offline.length > 0 ? { offline: true } : {}),
      ...(undo.length > 0 ? { textActions: undo } : {}),
    };
  }
  const names = { names: open.map((p) => p.name) };
  if (sub !== "before") {
    // The trip has begun: nobody joins any more – «nicht genutzt», without a tick.
    return {
      ...base,
      state: "done",
      unused: true,
      status: msg("v2.unused", { names, count: open.length }),
      ...(undo.length > 0 ? { textActions: undo } : {}),
    };
  }
  const first = open[0];
  const remind: RouteRemind = orga
    ? {
        occasion: "placeholder",
        keys: open.map((p) => p.id),
        label:
          open.length === 1 && first
            ? msg("v2.remindOne", { name: first.name })
            : msg("v2.remindAll"),
        name:
          open.length === 1 && first
            ? msg("v2.remindOneName", { name: first.name })
            : msg("v2.remindAllName", { names, count: open.length }),
      }
    : {
        occasion: "orga",
        keys: open.map((p) => p.id),
        label: msg("v2.nudgeOrga", { orga: trip.orgaName }),
        name: msg("v2.nudgeOrgaName", { orga: trip.orgaName, names, count: open.length }),
      };
  return {
    ...base,
    state: "waiting",
    status: msg("v2.waiting", { names, count: open.length }),
    short: msg("v2.short", { names, count: open.length }),
    remind,
    ...(orga
      ? {
          textActions: [
            ...open.map((p) => ({
              label: msg("v2.withoutApp", { name: p.name }),
              action: { kind: "withoutApp", placeholderId: p.id, name: p.name } as const,
            })),
            ...undo,
          ],
        }
      : {}),
  };
}

/** A2: organiser, infos empty (no meeting point, no address), ≤ 21 days before arrival. */
function infoTask(viewer: RouteViewer, areas: RouteAreas, daysToGo: number): TripStation | null {
  const info = areas.info;
  if (viewer.role !== "organizer" || !info) return null;
  if (info.meeting || info.hasAddress || daysToGo > INFO_TASK_DAYS) return null;
  return {
    id: "A2",
    kind: "task",
    state: "yours",
    title: msg("a2.title"),
    status: msg("a2.status"),
    href: { kind: "page", page: "infoEdit" },
    primary: { label: msg("a2.action"), action: { kind: "page", page: "infoEdit" } },
  };
}

function infoTile(viewer: RouteViewer, trip: RouteTrip, info: InfoStatus): TripTile {
  const parts: Msg[] = [];
  if (info.meeting) parts.push(msg("tiles.infoMeeting"));
  if (info.checkIn) parts.push(msg("tiles.infoCheckIn", { time: { time: info.checkIn } }));
  if (info.hasAddress) parts.push(msg("tiles.infoAddress"));
  if (parts.length === 0) {
    parts.push(
      viewer.role === "organizer"
        ? msg("tiles.infoEmptyOrga")
        : msg("tiles.infoEmpty", { orga: trip.orgaName }),
    );
  }
  return {
    area: "info",
    title: msg("tiles.info"),
    status: parts,
    href: { kind: "page", page: "info" },
  };
}

const byCatalogue = (a: TripStation, b: TripStation) => ORDER[a.id] - ORDER[b.id];
const byUrgency = (a: TripStation, b: TripStation) =>
  RANK[a.id] - RANK[b.id] || ORDER[a.id] - ORDER[b.id];

/**
 * The way of a fixed trip for one viewer on one day (W16 v2.3–v2.6, v2.13 Increment-8 cut).
 * Rules per station: first matching rule wins (done → yours → waiting → next/later).
 */
export function tripRoute(
  trip: RouteTrip,
  viewer: RouteViewer,
  areas: RouteAreas,
  today: IsoDate,
): TripRoute {
  const sub = subphaseOf(trip.start, trip.end, today);
  const total = diffDays(trip.start, trip.end) + 1;
  const index = Math.min(total, Math.max(1, diffDays(trip.start, today) + 1));
  const daysToGo = Math.max(0, diffDays(today, trip.start));
  const daysBack = Math.max(0, diffDays(trip.end, today));
  const info = areas.info;

  const stations = [v1Station(trip, viewer, today, sub), v2Station(trip, viewer, areas, sub)];
  const tasks = sub === "before" ? [infoTask(viewer, areas, daysToGo)] : [];
  const all: TripStation[] = [
    ...stations,
    ...tasks.filter((task): task is TripStation => task !== null),
  ];

  const done = all.filter((s) => s.state === "done").sort(byCatalogue);
  const yours = all.filter((s) => s.state === "yours").sort(byUrgency);
  const waiting = all.filter((s) => s.state === "waiting").sort(byCatalogue);
  const open = all
    .filter((s) => s.kind === "station" && (s.state === "next" || s.state === "later"))
    .sort(byCatalogue);
  const next = open[0] ? { ...open[0], state: "next" as const } : null;
  const later = open.slice(1).map((s) => ({ ...s, state: "later" as const }));

  // Appointments of the day (Unterwegs): in Increment 8 only the meeting point on day 1.
  const plans: TripStation[] =
    sub === "during" && index === 1 && info?.meeting
      ? [
          {
            id: "T-meet",
            kind: "plan",
            state: "yours",
            title: msg("plan.meetTitle"),
            status: msg("plan.meetStatus", { text: info.meeting }),
            href: { kind: "page", page: "info" },
            primary: { label: msg("plan.meetAction"), action: { kind: "page", page: "info" } },
          },
        ]
      : [];
  const items = [...plans, ...yours];
  const sentence = heuteSentence(sub, index, plans.length, yours.length, waiting[0]);

  const doneStations = done.filter((s) => s.kind === "station");
  const countable = stations.length;
  return {
    subphase: sub,
    day: { index, total },
    phaseLine:
      sub === "before"
        ? msg("phase.before", { count: daysToGo })
        : sub === "during"
          ? msg("phase.during", { day: index, total })
          : msg("phase.after", { count: daysBack }),
    srSentence:
      sub === "before"
        ? msg("sr.before", { count: daysToGo })
        : sub === "during"
          ? msg("sr.during", { day: index, total })
          : msg("sr.after"),
    ring:
      sub === "before"
        ? { kind: "count", count: daysToGo, percent: ringPercent(trip.fixedOn, trip.start, today) }
        : sub === "during"
          ? { kind: "day", day: index, total, percent: dayRingPercent(index, total) }
          : { kind: "bye", percent: 100 },
    ringLabel:
      sub === "before"
        ? msg("ring.before", { count: daysToGo })
        : sub === "during"
          ? msg("ring.during", { day: index, total })
          : msg("ring.after"),
    headActions: sub === "before" ? ["calendar"] : [],
    wayTitle: msg(`way.${sub}`),
    meta:
      sub === "before"
        ? countable > 0
          ? msg("meta.done", { done: doneStations.length, total: countable })
          : null
        : sub === "during"
          ? msg("meta.day", { day: index, total })
          : null,
    doneSummary:
      sub === "during"
        ? msg("done.prep", { count: doneStations.filter((s) => !s.unused).length })
        : sub === "after"
          ? msg("done.trip", { days: total })
          : null,
    heute: {
      date: today,
      label:
        sub === "before"
          ? { kind: "date" }
          : sub === "during"
            ? { kind: "day", day: index }
            : { kind: "back", days: daysBack },
      sentence,
      items,
    },
    groups: { done, waiting, next, later },
    goal: goalOf(sub, trip, info, today, daysToGo),
    tiles: info ? [infoTile(viewer, trip, info)] : [],
    departureDay: today === trip.start,
  };
}

/** Heute-Satz H-1–H-7 with the precedence H-7 → H-6 → H-1 → H-2 → H-3/H-4/H-5b (W16 v2.5). */
function heuteSentence(
  sub: Subphase,
  dayIndex: number,
  plans: number,
  yours: number,
  firstWaiting: TripStation | undefined,
): Msg {
  if (sub === "during" && dayIndex === 1) return msg("sentence.h7");
  if (sub === "during" && plans > 0) {
    return yours > 0
      ? msg("sentence.h6Tasks", { plans, count: yours })
      : msg("sentence.h6", { plans });
  }
  if (yours > 0) return msg("sentence.h1", { count: yours });
  if (firstWaiting?.short) return msg("sentence.h2", { short: { msg: firstWaiting.short } });
  if (sub === "before") return msg("sentence.h3");
  if (sub === "during") return msg("sentence.h4");
  // Danach: costs are not built yet → H-5b (H-5 «Alles ausgeglichen» comes with Increment 10).
  return msg("sentence.h5b");
}

function goalOf(
  sub: Subphase,
  trip: RouteTrip,
  info: InfoStatus | null,
  today: IsoDate,
  daysToGo: number,
): TripGoal {
  const infoLink: RouteTarget | null = info ? { kind: "page", page: "info" } : null;
  if (sub === "before") {
    return {
      id: "V6",
      date: trip.start,
      title: msg("goal.go"),
      status: info?.meeting
        ? msg("goal.text", { text: info.meeting })
        : info?.checkIn
          ? msg("goal.checkIn", { time: { time: info.checkIn } })
          : msg("goal.daysToGo", { count: daysToGo }),
      href: infoLink,
    };
  }
  if (sub === "during") {
    return {
      id: "T-goal",
      date: trip.end,
      title: msg("goal.home"),
      status: info?.checkOut
        ? msg("goal.checkOut", { time: { time: info.checkOut } })
        : msg("goal.daysLeft", { count: Math.max(0, diffDays(today, trip.end)) }),
      href: infoLink,
    };
  }
  return {
    id: "D-goal",
    date: null,
    title: msg("goal.next"),
    status: msg("goal.nextStatus"),
    href: null,
    button: { label: msg("goal.newTrip"), href: { kind: "page", page: "newTrip" } },
    ...(trip.deletionDate
      ? { note: msg("goal.deletion", { date: { date: trip.deletionDate } }) }
      : {}),
  };
}

/**
 * «Neu erledigt» (W16 v2.7, UM-4): stations that are done now but were not at the last visit
 * in this browser. First visit (nothing stored) → nothing is «new».
 */
export function freshlyDone(
  previous: readonly string[] | null,
  current: readonly string[],
): string[] {
  if (previous === null) return [];
  const seen = new Set(previous);
  return current.filter((id) => !seen.has(id));
}
