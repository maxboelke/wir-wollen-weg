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
export type StationId = "V1" | "V2" | "V3" | "A2" | "A1" | "D1" | "T-meet";
export type GoalId = "V6" | "T-goal" | "D-goal";

/** A value inside a message: formatted by the page (names as a list, dates, clock times). */
export type MsgValue =
  | string
  | number
  | { names: readonly string[] }
  | { date: IsoDate }
  | { time: string }
  /** Money in cents of a currency – `exact` always shows two decimals (balances, W19 D.6). */
  | { money: number; currency: string; exact?: boolean }
  | { msg: Msg };

export interface Msg {
  /** Key below the `route` namespace of messages/*.json. */
  key: string;
  values?: Record<string, MsgValue>;
}

export type RouteTarget =
  | { kind: "sheet"; sheet: "decided" | "members" }
  | {
      kind: "page";
      page:
        | "info"
        | "infoEdit"
        | "newTrip"
        | "stays"
        | "staysSwipe"
        | "staysRanking"
        | "costs"
        | "costsBalances"
        | "costsNew";
    };

export type RouteAction =
  | { kind: "announce" }
  | { kind: "withoutApp"; placeholderId: string; name: string }
  | { kind: "undoWithoutApp"; placeholderId: string; name: string }
  /** UX-9 for V3 «Haben wir schon / brauchen wir nicht» (on: dialog first) / undo. */
  | { kind: "stayWithoutApp"; on: boolean }
  /** D1 (organiser): «Abrechnung abschließen» (dialog W19 D.9) / «wieder öffnen». */
  | { kind: "closeCosts"; open: number }
  | { kind: "reopenCosts" };

/** «Erinnern» below a waiting station – opens the remind sheet of the cockpit. */
export interface RouteRemind {
  /**
   * `placeholder`: organiser → personal link(s); `orga`: member → «{orga} Bescheid geben»;
   * `stay-*`: places to stay (W16 v2.14) – rate (status list), fix/book (to the organiser).
   */
  occasion:
    | "placeholder"
    | "orga"
    | "stay-rate"
    | "stay-fix"
    | "stay-book"
    /** Costs (W16 v2.15): own debtors (`single`/status) – all open settlements (organiser). */
    | "settle"
    | "settle-all";
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
  /** Longer status for the expanded first «Heute» card (W16 v2.14 «ausgeklappt»). */
  detail?: Msg;
  /** Urgency under «Heute» (W16 v2.5/v2.14: depends on the state, not only the station). */
  rank?: number;
  /** Progress bar of the compact card (0–1, decorative). */
  progress?: number;
  /** Where the card leads (sheet or sub-page). */
  href: RouteTarget;
  /**
   * Main action – only shown on the first «Heute» card (the only primary of the page).
   * `secondary`: never the page's primary (U-30 «Abschließen»).
   */
  primary?: { label: Msg; action: RouteTarget | RouteAction; secondary?: boolean };
  remind?: RouteRemind;
  /** Text buttons (e.g. «Mia macht ohne App mit», «Rückgängig» in the done list). */
  textActions?: { label: Msg; action: RouteAction | RouteTarget }[];
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
  area: "info" | "stay" | "costs";
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
  /**
   * Buttons in the ticket stub (W16 v2.2/v2.15): Vorbereitung «Kalender», Unterwegs
   * «+ Ausgabe», Danach «Ausgleichen» (only with open balances, not closed).
   */
  headActions: ("calendar" | "addExpense" | "settle")[];
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

/**
 * Status of the places to stay (F-031) – adapter `stayStatus()` of W16 v2.14. `favourite` only
 * for the organiser or when the viewer's ranking is free (Q33); null = area not built.
 */
export interface StayStatus {
  /** Current suggestions. */
  total: number;
  /** Suggestions the viewer has not rated. */
  myUnrated: number;
  /** Unrated suggestions created after the viewer's latest rating (W18 E.5.6). */
  myNew: number;
  /** Members (without placeholders) who rated every current suggestion. */
  membersDone: number;
  membersTotal: number;
  favourite: { titles: readonly string[]; likes: number } | null;
  chosen: { title: string } | null;
  booked: boolean;
  /** «gebucht» was reset by new dates and the notice is still open (rule 5/8 «neu buchen»). */
  rebook: boolean;
  /** UX-9 «ohne App erledigt». */
  withoutApp: boolean;
}

/** A person in a cost task (name already resolved – «ehemaliges Mitglied» for former ones). */
export interface CostPerson {
  name: string;
  cents: number;
  /** Party id – reminder key. */
  key: string;
  placeholder: boolean;
  former: boolean;
}

/**
 * Status of the costs (F-035/F-036) – adapter `costStatus()` of W16 v2.15; null = not built.
 * Amounts in cents of `currency`.
 */
export interface CostStatus {
  /** Expenses that are not deleted. */
  expenseCount: number;
  totalCents: number;
  currency: string;
  myBalanceCents: number;
  /** Proposal rows in which I pay (proposal order). */
  myDebts: readonly CostPerson[];
  /** Proposal rows in which I receive. */
  owedToMe: readonly CostPerson[];
  /** Proposal rows in total. */
  openTransfers: number;
  /** All balances 0. */
  allSettled: boolean;
  closed: boolean;
  /** A1 threshold in cents (R.8 rule 7). */
  threshold: number;
  /** The first recipient of my debts has payment details (A1 status text). */
  firstHasPayInfo: boolean;
}

export interface RouteAreas {
  group: { placeholders: readonly { id: string; name: string; withoutApp: boolean }[] };
  info: InfoStatus | null;
  /** Increment 9 – undefined/null: area not built (older callers and tests). */
  stay?: StayStatus | null;
  /** Increment 10 – undefined/null: area not built (older callers and tests). */
  costs?: CostStatus | null;
  // Increments 11–12 add `travelData`, `documents` adapters here.
}

/** A2 appears this many days before the arrival when the infos are still empty (W16 v2.4). */
export const INFO_TASK_DAYS = 21;
/** V1 counts as done for the organiser this many days after fixing (W16 v2.4). */
export const ANNOUNCE_DAYS = 7;

/**
 * Default urgency under «Heute» (W16 v2.5): what blocks others first (1), then dates/deadlines
 * (2), then own contributions (3). V3 sets its rank per state (W16 v2.14).
 */
const RANK: Record<StationId, number> = { "T-meet": 0, V1: 1, A2: 2, V2: 3, V3: 3, A1: 3, D1: 2 };
/** Catalogue order (W16 v2.3/v2.15) – ties and every other group. */
const ORDER: Record<StationId, number> = { "T-meet": 0, V1: 1, V2: 2, V3: 3, A2: 4, A1: 5, D1: 6 };

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

/* ------------------------------------------------------------------------------------------ */
/* V3 «Unterkunft» (W16 v2.14, Increment 9)                                                    */
/* ------------------------------------------------------------------------------------------ */

const STAYS: RouteTarget = { kind: "page", page: "stays" };
const RANKING: RouteTarget = { kind: "page", page: "staysRanking" };

function favouriteMsg(prefix: string, stay: StayStatus): Msg {
  const fav = stay.favourite;
  if (!fav) return msg(`${prefix}NoFavourite`);
  if (fav.titles.length > 1) return msg(`${prefix}Tied`, { titles: { names: fav.titles } });
  return msg(`${prefix}Favourite`, { title: fav.titles[0] ?? "", likes: fav.likes });
}

/**
 * Station V3 (W16 v2.14 table, first matching rule wins; «Bucher» = organiser in Increment 9).
 * Counting base `membersTotal` = members without placeholders.
 */
export function v3Station(
  trip: RouteTrip,
  viewer: RouteViewer,
  stay: StayStatus,
  sub: Subphase,
): TripStation {
  const orga = viewer.role === "organizer";
  const base = {
    id: "V3" as const,
    kind: "station" as const,
    title: msg("v3.title"),
    href: STAYS,
  };
  const withoutAppAction = {
    label: msg("v3.withoutApp"),
    action: { kind: "stayWithoutApp", on: true } as const,
  };
  const fixNow = { label: msg("v3.fixNow"), action: RANKING };
  const chosenTitle = stay.chosen?.title ?? "";
  const rated = stay.total - stay.myUnrated;

  // 1 – done: picked and booked, or UX-9.
  if (stay.chosen && stay.booked) {
    return { ...base, state: "done", status: msg("v3.doneBooked", { title: chosenTitle }) };
  }
  if (stay.withoutApp) {
    return {
      ...base,
      state: "done",
      offline: true,
      status: msg("v3.doneOffline"),
      ...(orga
        ? {
            textActions: [
              { label: msg("v3.undo"), action: { kind: "stayWithoutApp", on: false } as const },
            ],
          }
        : {}),
    };
  }
  // 2 – travelling / back and not done: «nicht genutzt».
  if (sub !== "before") {
    return {
      ...base,
      state: "done",
      unused: true,
      status: stay.chosen ? msg("v3.unusedChosen", { title: chosenTitle }) : msg("v3.unusedNone"),
    };
  }
  // 9 – no suggestions: «als Nächstes» (no task, no reminder).
  if (stay.total === 0) {
    return {
      ...base,
      state: "next",
      status: msg("v3.empty"),
      ...(orga ? { textActions: [withoutAppAction] } : {}),
    };
  }
  const allDone = stay.membersTotal > 0 && stay.membersDone >= stay.membersTotal;
  // 3 – I have unrated suggestions, nothing picked: your turn (rank 3).
  if (stay.myUnrated > 0 && !stay.chosen) {
    return {
      ...base,
      state: "yours",
      rank: 3,
      status: msg("v3.rateShort", { rated, total: stay.total }),
      detail:
        stay.myNew > 0
          ? msg("v3.rateNew", { count: stay.myNew })
          : msg("v3.rateLong", { count: stay.myUnrated, rated, total: stay.total }),
      progress: stay.total > 0 ? rated / stay.total : 0,
      primary: { label: msg("v3.swipe"), action: { kind: "page", page: "staysSwipe" } },
      ...(orga ? { textActions: [fixNow, withoutAppAction] } : {}),
    };
  }
  if (orga) {
    // 4 – everybody rated, nothing picked: pick (rank 1, blocks the others).
    if (!stay.chosen && allDone) {
      return {
        ...base,
        state: "yours",
        rank: 1,
        status: favouriteMsg("v3.fix", stay),
        primary: { label: msg("v3.fixAction"), action: RANKING },
      };
    }
    // 5 – picked, not booked: book (rank 2, a date/deadline).
    if (stay.chosen) {
      return {
        ...base,
        state: "yours",
        rank: 2,
        status: stay.rebook
          ? msg("v3.rebook", { title: chosenTitle })
          : msg("v3.book", { title: chosenTitle }),
        primary: { label: msg("v3.toStay"), action: STAYS },
      };
    }
    // 6 (organiser) – waiting for ratings.
    const status = stay.favourite
      ? msg("v3.waitingOrga", {
          done: stay.membersDone,
          total: stay.membersTotal,
          favourite: { msg: favouriteMsg("v3.wait", stay) },
        })
      : msg("v3.waiting", { done: stay.membersDone, total: stay.membersTotal });
    return {
      ...base,
      state: "waiting",
      status,
      short: msg("v3.shortRate"),
      remind: {
        occasion: "stay-rate",
        keys: [],
        label: msg("v3.remind"),
        name: msg("v3.remindName"),
      },
      textActions: [fixNow, withoutAppAction],
    };
  }
  // 8 – member: picked, not booked.
  if (stay.chosen) {
    return {
      ...base,
      state: "waiting",
      status: stay.rebook
        ? msg("v3.memberRebook", { orga: trip.orgaName, title: chosenTitle })
        : msg("v3.memberBook", { orga: trip.orgaName, title: chosenTitle }),
      short: msg("v3.shortBook", { orga: trip.orgaName, title: chosenTitle }),
      remind: {
        occasion: "stay-book",
        keys: [],
        label: msg("v2.nudgeOrga", { orga: trip.orgaName }),
        name: msg("v3.nudgeBookName", { orga: trip.orgaName, title: chosenTitle }),
      },
    };
  }
  // 7 – member: everybody rated, the organiser picks.
  if (allDone) {
    return {
      ...base,
      state: "waiting",
      status: msg("v3.memberFix", { orga: trip.orgaName }),
      short: msg("v3.shortFix", { orga: trip.orgaName }),
      remind: {
        occasion: "stay-fix",
        keys: [],
        label: msg("v2.nudgeOrga", { orga: trip.orgaName }),
        name: msg("v3.nudgeFixName", { orga: trip.orgaName }),
      },
    };
  }
  // 6 (member) – I am done, others are not.
  return {
    ...base,
    state: "waiting",
    status: msg("v3.waiting", { done: stay.membersDone, total: stay.membersTotal }),
    short: msg("v3.shortRate"),
    remind: {
      occasion: "stay-rate",
      keys: [],
      label: msg("v3.remind"),
      name: msg("v3.remindName"),
    },
  };
}

/**
 * Tile «Unterkunft» (W16 v2.14): when V3 is done (not «nicht genutzt»), or while travelling /
 * back as soon as there is at least one suggestion. First tile of «Immer griffbereit».
 */
function stayTile(stay: StayStatus, sub: Subphase, v3: TripStation | undefined): TripTile | null {
  const done = v3?.state === "done" && !v3.unused;
  if (!done && (sub === "before" || stay.total === 0)) return null;
  const status: Msg =
    stay.chosen && stay.booked
      ? msg("tiles.stayBooked", { title: stay.chosen.title })
      : stay.withoutApp
        ? msg("tiles.stayOffline")
        : stay.chosen
          ? msg("tiles.stayChosen", { title: stay.chosen.title })
          : msg("tiles.stayNone", { count: stay.total });
  return { area: "stay", title: msg("tiles.stay"), status: [status], href: STAYS };
}

/* ------------------------------------------------------------------------------------------ */
/* Costs: A1, D1, tile (W16 v2.15, Increment 10)                                                */
/* ------------------------------------------------------------------------------------------ */

const COSTS: RouteTarget = { kind: "page", page: "costs" };
const BALANCES: RouteTarget = { kind: "page", page: "costsBalances" };

const money = (cents: number, currency: string): MsgValue => ({
  money: Math.abs(cents),
  currency,
  exact: true,
});

/** «Du schuldest Kemal 23,50 €» / «… – an Lena und Kemal» / «… – an Lena und 2 weitere». */
function debtTitle(costs: CostStatus): Msg {
  const first = costs.myDebts[0];
  const second = costs.myDebts[1];
  const total = money(costs.myBalanceCents, costs.currency);
  if (!first) return msg("costs.debtTitleOne", { name: "", amount: total });
  if (costs.myDebts.length === 1) {
    return msg("costs.debtTitleOne", {
      name: first.name,
      amount: money(first.cents, costs.currency),
    });
  }
  if (costs.myDebts.length === 2 && second) {
    return msg("costs.debtTitleTwo", { total, name1: first.name, name2: second.name });
  }
  return msg("costs.debtTitleMany", {
    total,
    name1: first.name,
    count: costs.myDebts.length - 1,
  });
}

function debtStatus(costs: CostStatus): Msg {
  return costs.firstHasPayInfo ? msg("costs.debtStatus") : msg("costs.debtStatusNoInfo");
}

/** A1 «Du schuldest …» (Vorbereitung/Unterwegs): own balance ≤ −threshold, not closed. */
export function a1Task(costs: CostStatus): TripStation | null {
  if (costs.closed || costs.myBalanceCents > -costs.threshold) return null;
  return {
    id: "A1",
    kind: "task",
    state: "yours",
    rank: 3,
    title: debtTitle(costs),
    status: debtStatus(costs),
    href: BALANCES,
    primary: { label: msg("costs.toSettle"), action: BALANCES },
  };
}

/** D1 «Kosten ausgleichen» (Danach, ≥ 1 expense) – W16 v2.15 table, first matching row wins. */
export function d1Station(costs: CostStatus, viewer: RouteViewer): TripStation | null {
  if (costs.expenseCount === 0) return null;
  const orga = viewer.role === "organizer";
  const base = {
    id: "D1" as const,
    kind: "station" as const,
    title: msg("costs.d1Title"),
    href: BALANCES,
  };
  const me = costs.myBalanceCents;
  // 1 – all square and closed.
  if (costs.allSettled && costs.closed) {
    return {
      ...base,
      state: "done",
      status: orga ? msg("costs.d1DoneClosed") : msg("costs.d1DoneSquare"),
    };
  }
  // 2 – closed with open balances (info only, marking is locked).
  if (costs.closed) {
    const status =
      me < 0
        ? msg("costs.d1ClosedOwe", { amount: money(me, costs.currency) })
        : me > 0
          ? msg("costs.d1ClosedOwed", { amount: money(me, costs.currency) })
          : msg("costs.d1Closed");
    return {
      ...base,
      state: "done",
      status,
      ...(orga
        ? {
            textActions: [{ label: msg("costs.reopen"), action: { kind: "reopenCosts" } as const }],
          }
        : {}),
    };
  }
  // 3 – I owe: my turn (rank 2).
  if (me < 0) {
    return {
      ...base,
      state: "yours",
      rank: 2,
      title: debtTitle(costs),
      status: debtStatus(costs),
      primary: { label: msg("costs.toSettle"), action: BALANCES },
    };
  }
  // 4 – I am owed: waiting for the others (reminder «settle»).
  if (me > 0) {
    const [first, second] = costs.owedToMe;
    const amount = money(me, costs.currency);
    const status =
      costs.owedToMe.length <= 1
        ? msg("costs.owedOne", { amount, name: first?.name ?? "" })
        : costs.owedToMe.length === 2
          ? msg("costs.owedTwo", { amount, name1: first?.name ?? "", name2: second?.name ?? "" })
          : msg("costs.owedMany", {
              amount,
              name1: first?.name ?? "",
              count: costs.owedToMe.length - 1,
            });
    const remindable = costs.owedToMe.filter((p) => !p.former);
    const single = remindable.length === 1 ? remindable[0] : undefined;
    return {
      ...base,
      state: "waiting",
      status,
      short:
        costs.owedToMe.length === 1 && first
          ? msg("costs.shortOne", { name: first.name })
          : msg("costs.shortMine"),
      ...(remindable.length > 0
        ? {
            remind: {
              occasion: "settle" as const,
              keys: remindable.map((p) => p.key),
              label: single ? msg("costs.remindOne", { name: single.name }) : msg("costs.remind"),
              name: single
                ? msg("costs.remindOne", { name: single.name })
                : msg("costs.remindMineName"),
            },
          }
        : {}),
    };
  }
  // 5 – I am square, others are not.
  if (!costs.allSettled) {
    return {
      ...base,
      state: "waiting",
      status: msg("costs.openCount", { count: costs.openTransfers }),
      short: msg("costs.shortOthers"),
      ...(orga
        ? {
            remind: {
              occasion: "settle-all" as const,
              keys: [],
              label: msg("costs.remind"),
              name: msg("costs.remindAllName"),
            },
            textActions: [
              {
                label: msg("costs.closeEarly"),
                action: { kind: "closeCosts", open: costs.openTransfers } as const,
              },
            ],
          }
        : {}),
    };
  }
  // 6 – all square, not closed: done for members, «abschließen?» for the organiser (rank 4).
  if (orga) {
    return {
      ...base,
      state: "yours",
      rank: 4,
      title: msg("costs.d1CloseTitle"),
      status: msg("costs.d1CloseStatus"),
      primary: {
        label: msg("costs.close"),
        action: { kind: "closeCosts", open: 0 },
        secondary: true,
      },
    };
  }
  return { ...base, state: "done", status: msg("costs.d1DoneSquare") };
}

/** Tile «Kosten» (W16 v2.15): status «… gesamt · du schuldest …», «Noch keine Ausgaben» … */
function costsTile(costs: CostStatus): TripTile {
  const parts: Msg[] = [];
  if (costs.closed) parts.push(msg("tiles.costsClosed"));
  if (costs.expenseCount === 0) {
    parts.push(msg("tiles.costsEmpty"));
  } else {
    parts.push(
      msg("tiles.costsTotal", { total: { money: costs.totalCents, currency: costs.currency } }),
    );
    const amount: MsgValue = { money: Math.abs(costs.myBalanceCents), currency: costs.currency };
    if (costs.myBalanceCents < 0) parts.push(msg("tiles.costsOwe", { amount }));
    else if (costs.myBalanceCents > 0) parts.push(msg("tiles.costsOwed", { amount }));
    else if (!costs.allSettled) parts.push(msg("tiles.costsSquareMe"));
    else parts.push(msg("tiles.costsSquare"));
  }
  return { area: "costs", title: msg("tiles.costs"), status: parts, href: COSTS };
}

const byCatalogue = (a: TripStation, b: TripStation) => ORDER[a.id] - ORDER[b.id];
const rankOf = (s: TripStation) => s.rank ?? RANK[s.id];
const byUrgency = (a: TripStation, b: TripStation) =>
  rankOf(a) - rankOf(b) || ORDER[a.id] - ORDER[b.id];

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

  const stay = areas.stay ?? null;
  const costs = areas.costs ?? null;
  const d1 = costs && sub === "after" ? d1Station(costs, viewer) : null;
  const stations = [
    v1Station(trip, viewer, today, sub),
    v2Station(trip, viewer, areas, sub),
    ...(stay ? [v3Station(trip, viewer, stay, sub)] : []),
    ...(d1 ? [d1] : []),
  ];
  const tasks = [
    ...(sub === "before" ? [infoTask(viewer, areas, daysToGo)] : []),
    ...(costs && sub !== "after" ? [a1Task(costs)] : []),
  ];
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
  const sentence = heuteSentence(
    sub,
    index,
    plans.length,
    yours.length,
    waiting[0],
    (costs?.expenseCount ?? 0) > 0,
  );

  const doneStations = done.filter((s) => s.kind === "station");
  const countable = stations.length;
  const d1Done = d1?.state === "done";
  const costsOpen = costs !== null && costs.expenseCount > 0 && !costs.allSettled && !costs.closed;
  return {
    subphase: sub,
    day: { index, total },
    phaseLine:
      sub === "before"
        ? msg("phase.before", { count: daysToGo })
        : sub === "during"
          ? msg("phase.during", { day: index, total })
          : costs && costs.expenseCount > 0
            ? costsOpen
              ? msg("phase.afterSettle")
              : msg("phase.afterSquare")
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
    headActions:
      sub === "before"
        ? ["calendar"]
        : sub === "during"
          ? costs && !costs.closed
            ? ["addExpense"]
            : []
          : costsOpen
            ? ["settle"]
            : [],
    wayTitle: msg(`way.${sub}`),
    meta:
      sub === "before"
        ? countable > 0
          ? msg("meta.done", { done: doneStations.length, total: countable })
          : null
        : sub === "during"
          ? msg("meta.day", { day: index, total })
          : d1
            ? msg("meta.done", { done: d1Done ? 1 : 0, total: 1 })
            : null,
    doneSummary:
      sub === "during"
        ? msg("done.prep", { count: doneStations.filter((s) => !s.unused).length })
        : sub === "after"
          ? d1Done
            ? msg("done.tripSettled", { days: total })
            : msg("done.trip", { days: total })
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
    tiles: [
      ...(stay
        ? [
            stayTile(
              stay,
              sub,
              stations.find((s) => s.id === "V3"),
            ),
          ]
        : []),
      // Costs: always in Vorbereitung/Unterwegs; in Danach only without a visible D1 station.
      ...(costs && (sub !== "after" || d1 === null || d1Done) ? [costsTile(costs)] : []),
      ...(info ? [infoTile(viewer, trip, info)] : []),
    ].filter((tile): tile is TripTile => tile !== null),
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
  hasExpenses: boolean,
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
  // Danach: H-5 «Alles ausgeglichen» with expenses, H-5b without (W16 v2.15).
  return hasExpenses ? msg("sentence.h5") : msg("sentence.h5b");
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
