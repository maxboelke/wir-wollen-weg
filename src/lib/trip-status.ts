import { diffDays, type IsoDate } from "./dates";

/**
 * Phase, progress, to-dos and order of trips (sitemap §2, Flow E, F-007, F-044). Pure, so
 * "My trips", the trip overview and the tests share one source of truth.
 */

/** UI phase incl. the derived "past" (sitemap §2) – same ids as the cockpit's phase dot. */
export type UiPhase = "collect" | "vote" | "fixed" | "past";
export type StoredPhase = "collecting" | "voting" | "fixed";

export interface TripDates {
  phase: StoredPhase;
  rangeEnd: IsoDate;
  fixedStart: IsoDate | null;
  fixedEnd: IsoDate | null;
}

/** Past = the fixed trip has ended, or the search range is over without fixed dates. */
export function uiPhase(trip: TripDates, today: IsoDate): UiPhase {
  if (trip.phase === "fixed" && trip.fixedEnd) return trip.fixedEnd < today ? "past" : "fixed";
  if (trip.rangeEnd < today) return "past";
  return trip.phase === "voting" ? "vote" : "collect";
}

export interface MemberStatus {
  role: "organizer" | "member";
  submittedAt: Date | string | null;
  votedAt: Date | string | null;
}

export interface Progress {
  done: number;
  total: number;
}

/**
 * Phase 1: submitted availability · phase 2: voted (F-007, Flow E.1). Open placeholders count
 * in phase 1 as «noch offen» (Q20, decided 2026-10-10: «3 von 9 haben abgegeben»); they cannot
 * vote, so phase 2 counts members only.
 */
export function phaseProgress(
  phase: UiPhase,
  members: readonly MemberStatus[],
  openPlaceholders = 0,
): Progress | null {
  if (phase === "collect") {
    return {
      done: members.filter((m) => m.submittedAt).length,
      total: members.length + Math.max(0, openPlaceholders),
    };
  }
  if (phase === "vote") {
    return { done: members.filter((m) => m.votedAt).length, total: members.length };
  }
  return null;
}

/** Highlighted to-do of the viewer (F-044, Flow E.1). */
export type TripTodo = "addDates" | "vote" | "startVote" | "startVoteDeadline" | "fixDates";

/**
 * `deadlinePassed`: the voting deadline is over (F-017) – the organiser is asked to fix the
 * dates (never decided automatically); likewise once everybody has voted.
 * `collectDeadlinePassed`: the deadline for adding dates is over (F-017 rest, Pflege-Paket) –
 * the organiser is asked to start the vote, also while people are still missing.
 */
export function viewerTodo(
  phase: UiPhase,
  viewer: MemberStatus,
  progress: Progress | null,
  {
    deadlinePassed = false,
    collectDeadlinePassed = false,
  }: { deadlinePassed?: boolean; collectDeadlinePassed?: boolean } = {},
): TripTodo | null {
  if (phase === "collect") {
    if (!viewer.submittedAt) return "addDates";
    if (viewer.role !== "organizer") return null;
    if (progress && progress.done === progress.total) return "startVote";
    return collectDeadlinePassed ? "startVoteDeadline" : null;
  }
  if (phase === "vote" && !viewer.votedAt) return "vote";
  if (phase === "vote" && viewer.role === "organizer") {
    const everyone = progress !== null && progress.total > 0 && progress.done === progress.total;
    if (everyone || deadlinePassed) return "fixDates";
  }
  return null;
}

/** Days until the trip starts (phase 3, «in 23 Tagen»); negative once it has begun. */
export function daysUntil(start: IsoDate, today: IsoDate): number {
  return diffDays(today, start);
}

export type TripTab = "overview" | "days" | "group" | "poll";

/**
 * Tabs that exist as real views (Increment 2 overview, 3 «Meine Tage», 4 «Gruppe»,
 * 5 «Abstimmen») – the default tab never sends people to an empty page.
 */
export const BUILT_TABS: ReadonlySet<TripTab> = new Set<TripTab>([
  "overview",
  "days",
  "group",
  "poll",
]);

/** Tab when opening a trip (sitemap §2): own dates missing → days, own vote missing → poll. */
export function defaultTab(
  phase: UiPhase,
  viewer: MemberStatus,
  built: ReadonlySet<TripTab> = BUILT_TABS,
): TripTab {
  if (phase === "collect" && !viewer.submittedAt && built.has("days")) return "days";
  if (phase === "vote" && !viewer.votedAt && built.has("poll")) return "poll";
  return "overview";
}

export interface SortableTrip {
  phase: UiPhase;
  todo: TripTodo | null;
  deadline: IsoDate | null;
  /** Fixed start, otherwise start of the search range. */
  start: IsoDate;
  /** Last activity (ISO timestamp or date). */
  updatedAt: string;
  name: string;
}

/**
 * Order of «Meine Reisen» (F-044, W04): trips with to-dos first, then by next event
 * (deadline, then start of the trip), then most recently active; past trips last.
 */
export function compareTrips(a: SortableTrip, b: SortableTrip, today: IsoDate): number {
  const pastA = a.phase === "past" ? 1 : 0;
  const pastB = b.phase === "past" ? 1 : 0;
  if (pastA !== pastB) return pastA - pastB;
  if (pastA === 1) return b.start.localeCompare(a.start);
  const todoA = a.todo ? 0 : 1;
  const todoB = b.todo ? 0 : 1;
  if (todoA !== todoB) return todoA - todoB;
  const next = (trip: SortableTrip) =>
    trip.deadline && trip.deadline >= today ? trip.deadline : trip.start;
  const byEvent = next(a).localeCompare(next(b));
  if (byEvent !== 0) return byEvent;
  const byActivity = b.updatedAt.localeCompare(a.updatedAt);
  return byActivity !== 0 ? byActivity : a.name.localeCompare(b.name);
}

/* ------------------------------------------------------------------------------------------ */
/* «Nächster Schritt» (ux-spec §14.1, W07 – Feedback-Runde 1)                                  */
/* ------------------------------------------------------------------------------------------ */

/** Rows of the matrix in ux-spec §14.1 (first matching row wins) plus phase 3 / past. */
export type NextStepId =
  | "N1-1"
  | "N1-2"
  | "N1-3"
  | "N1-4"
  | "N1-5"
  | "N1-6"
  | "N1-7"
  | "N1-8"
  | "N1-9"
  | "N1-10"
  | "N1-11"
  | "N1-12"
  | "N2-1"
  | "N2-2"
  | "N2-3"
  | "N2-4"
  | "N2-5"
  | "N2-6"
  | "N2-7"
  | "N2-8"
  | "N2-9"
  | "N2-10"
  | "N2-11"
  | "N2-12"
  | "past"
  | "pastOpen";

/**
 * Actions of the card. `remind` opens the remind sheet (exactly one other person open →
 * that person, else the list), `remindOrga` the single step for the organiser, `nudgeOrga`
 * the step «{orga} Bescheid geben».
 */
export type NextActionKind =
  | "addDates"
  | "startVote"
  | "remind"
  | "remindOrga"
  | "suggestions"
  | "vote"
  | "fixDates"
  | "poll"
  | "results"
  | "nudgeOrga"
  | "newTrip"
  | "editTrip";

export interface NextAction {
  kind: NextActionKind;
  /** At most one primary action; waiting members never get one (§14.1 rule 3). */
  variant: "primary" | "secondary" | "text";
}

/** Occasion of «{orga} Bescheid geben» – selects the share text (§14.1). */
export type OrgaNudge = "p1All" | "p1Deadline" | "p2All" | "p2Deadline";

export interface NextStep {
  id: NextStepId;
  params: {
    /** Number of other people still open (N1-7, N2-7). */
    count?: number;
    /** Names of the open placeholders (N1-6). */
    names?: string[];
    /** Deadline that is still ahead – the «mit Frist» texts (N2-5, N2-12). */
    deadline?: IsoDate;
  };
  actions: NextAction[];
  /** «{orga} Bescheid geben» for non-organisers (N1-9, N1-10, N2-9, N2-10). */
  nudge?: OrgaNudge;
}

export interface NextStepPerson {
  userId: string;
  role: "organizer" | "member";
  /** Phase 1: dates added («eingetragen»), phase 2: voted. */
  done: boolean;
}

export interface NextStepInput {
  phase: UiPhase;
  /** Stored phase – tells «past after fixing» from «range over without fixed dates». */
  storedPhase: StoredPhase;
  viewerId: string;
  members: readonly NextStepPerson[];
  /** Names of the open placeholders (count in phase 1 only, Q20). */
  placeholders: readonly string[];
  /** Phase 1: `trip.deadline`, phase 2: `trip.pollDeadline`. */
  deadline: IsoDate | null;
  today: IsoDate;
}

const primary = (kind: NextActionKind): NextAction => ({ kind, variant: "primary" });
const secondary = (kind: NextActionKind): NextAction => ({ kind, variant: "secondary" });
const text = (kind: NextActionKind): NextAction => ({ kind, variant: "text" });

/**
 * «Nächster Schritt» for every phase and role (ux-spec §14.1): rows are evaluated from top to
 * bottom, the first match wins. Answers «Wo stehen wir? → Wer ist dran? → Was kann ich tun?».
 * Phase 3 has no card (null) – the result card and the trip hub take over (§14.4).
 * `viewerTodo` stays the source for «Meine Reisen» (F-044).
 */
export function nextStep(input: NextStepInput): NextStep | null {
  const { phase, viewerId, members, placeholders, deadline, today } = input;
  if (phase === "fixed") return null;
  if (phase === "past") {
    return input.storedPhase === "fixed"
      ? { id: "past", params: {}, actions: [secondary("newTrip")] }
      : {
          id: "pastOpen",
          params: {},
          actions: [
            ...(members.find((m) => m.userId === viewerId)?.role === "organizer"
              ? [secondary("editTrip")]
              : []),
            secondary("newTrip"),
          ],
        };
  }
  const viewer = members.find((m) => m.userId === viewerId);
  if (!viewer) return null;
  const orga = viewer.role === "organizer";
  const others = members.filter((m) => m.userId !== viewerId);
  const openMembers = others.filter((m) => !m.done);
  const passed = deadline !== null && deadline < today;
  const ahead = deadline !== null && !passed ? { deadline } : {};

  if (phase === "collect") {
    const openOthers = openMembers.length + placeholders.length;
    if (!viewer.done) {
      if (passed) return { id: "N1-1", params: {}, actions: [primary("addDates")] };
      if (openOthers === 0) {
        return { id: orga ? "N1-3" : "N1-2", params: {}, actions: [primary("addDates")] };
      }
      return { id: "N1-4", params: {}, actions: [primary("addDates")] };
    }
    if (orga) {
      if (openOthers === 0) return { id: "N1-5", params: {}, actions: [primary("startVote")] };
      if (openMembers.length === 0) {
        return {
          id: "N1-6",
          params: { names: [...placeholders], count: placeholders.length },
          actions: [primary("startVote"), secondary("remind")],
        };
      }
      if (passed) {
        return {
          id: "N1-7",
          params: { count: openOthers },
          actions: [primary("startVote"), secondary("remind")],
        };
      }
      return { id: "N1-8", params: {}, actions: [primary("remind"), secondary("suggestions")] };
    }
    if (openOthers === 0) {
      return {
        id: "N1-9",
        params: {},
        actions: [secondary("suggestions"), text("nudgeOrga")],
        nudge: "p1All",
      };
    }
    if (passed) {
      return {
        id: "N1-10",
        params: {},
        actions: [secondary("suggestions"), text("nudgeOrga")],
        nudge: "p1Deadline",
      };
    }
    if (openOthers === 1 && openMembers[0]?.role === "organizer") {
      return {
        id: "N1-11",
        params: {},
        actions: [secondary("remindOrga"), secondary("suggestions")],
      };
    }
    return { id: "N1-12", params: {}, actions: [secondary("remind"), secondary("suggestions")] };
  }

  // Phase 2 – members only (placeholders cannot vote).
  const openOthers = openMembers.length;
  if (!viewer.done) {
    if (passed) return { id: orga ? "N2-2" : "N2-1", params: {}, actions: [primary("vote")] };
    if (openOthers === 0) {
      return { id: orga ? "N2-4" : "N2-3", params: {}, actions: [primary("vote")] };
    }
    return { id: "N2-5", params: { ...ahead }, actions: [primary("vote")] };
  }
  if (orga) {
    if (openOthers === 0) return { id: "N2-6", params: {}, actions: [primary("fixDates")] };
    if (passed) {
      return {
        id: "N2-7",
        params: { count: openOthers },
        actions: [primary("fixDates"), secondary("remind")],
      };
    }
    return { id: "N2-8", params: {}, actions: [primary("remind"), secondary("poll")] };
  }
  if (openOthers === 0) {
    return {
      id: "N2-9",
      params: {},
      actions: [secondary("results"), text("nudgeOrga")],
      nudge: "p2All",
    };
  }
  if (passed) {
    return {
      id: "N2-10",
      params: {},
      actions: [secondary("results"), text("nudgeOrga")],
      nudge: "p2Deadline",
    };
  }
  if (openOthers === 1 && openMembers[0]?.role === "organizer") {
    return { id: "N2-11", params: {}, actions: [secondary("remindOrga"), secondary("poll")] };
  }
  return { id: "N2-12", params: { ...ahead }, actions: [secondary("remind"), secondary("poll")] };
}

/** Phase 3 (stored phase «fixed», also once the trip is over) has no tab bar (§14.4). */
export function showTabs(trip: { phase: StoredPhase }): boolean {
  return trip.phase !== "fixed";
}
