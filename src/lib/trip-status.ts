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

/** Phase 1: submitted availability · phase 2: voted (F-007, Flow E.1). */
export function phaseProgress(phase: UiPhase, members: readonly MemberStatus[]): Progress | null {
  if (phase === "collect") {
    return { done: members.filter((m) => m.submittedAt).length, total: members.length };
  }
  if (phase === "vote") {
    return { done: members.filter((m) => m.votedAt).length, total: members.length };
  }
  return null;
}

/** Highlighted to-do of the viewer (F-044, Flow E.1). */
export type TripTodo = "addDates" | "vote" | "startVote";

export function viewerTodo(
  phase: UiPhase,
  viewer: MemberStatus,
  progress: Progress | null,
): TripTodo | null {
  if (phase === "collect") {
    if (!viewer.submittedAt) return "addDates";
    if (viewer.role === "organizer" && progress && progress.done === progress.total) {
      return "startVote";
    }
    return null;
  }
  if (phase === "vote" && !viewer.votedAt) return "vote";
  return null;
}

/** Days until the trip starts (phase 3, «in 23 Tagen»); negative once it has begun. */
export function daysUntil(start: IsoDate, today: IsoDate): number {
  return diffDays(today, start);
}

export type TripTab = "overview" | "days" | "group" | "poll";

/**
 * Tabs that already exist as real views. Increment 2 builds the overview; «Meine Tage»
 * (Increment 3), «Gruppe» (4) and «Abstimmen» (5) are "coming soon" placeholders until then,
 * so the default tab does not send people to an empty page.
 */
export const BUILT_TABS: ReadonlySet<TripTab> = new Set<TripTab>(["overview"]);

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
