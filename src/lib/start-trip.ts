import { diffDays, type IsoDate } from "./dates";

/**
 * «App startet in der laufenden Reise» (W16 v2.18, client decision 2026-10-23). Pure, so the
 * start route `/`, «Meine Reisen» and the unit tests share one rule.
 *
 * A trip is running when the viewer is a member (the caller only passes the viewer's own
 * memberships – placeholder accesses have no account), its dates are fixed and
 * arrival ≤ today ≤ departure in the app time zone (`todayIso()`, R-072). The arrival day counts
 * (UX-8 «Heute geht's los»); the day before and the days after do NOT (client decision:
 * `startWindowDaysBefore = 0`).
 */

export interface StartCandidate {
  publicId: string;
  name: string;
  phase: string;
  fixedStart: IsoDate | null;
  fixedEnd: IsoDate | null;
}

export interface RunningTrip {
  publicId: string;
  name: string;
  /** «Tag 3 von 8» – arrival day = 1. */
  day: number;
  total: number;
}

/** Days before the arrival that already count as «running» – 0 by client decision. */
export const START_WINDOW_DAYS_BEFORE = 0;

/** All trips running today, ordered by arrival (earliest first), then name. */
export function runningTrips(
  trips: readonly StartCandidate[],
  today: IsoDate,
  daysBefore: number = START_WINDOW_DAYS_BEFORE,
): RunningTrip[] {
  const result: RunningTrip[] = [];
  for (const trip of trips) {
    if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd) continue;
    const toStart = diffDays(today, trip.fixedStart);
    if (toStart > daysBefore || today > trip.fixedEnd) continue;
    const total = diffDays(trip.fixedStart, trip.fixedEnd) + 1;
    result.push({
      publicId: trip.publicId,
      name: trip.name,
      day: Math.max(1, Math.min(total, diffDays(trip.fixedStart, today) + 1)),
      total,
    });
  }
  const start = new Map(trips.map((t) => [t.publicId, t.fixedStart ?? ""]));
  return result.sort(
    (a, b) =>
      (start.get(a.publicId) ?? "").localeCompare(start.get(b.publicId) ?? "") ||
      a.name.localeCompare(b.name),
  );
}

/**
 * Target of the start route `/` for a signed-in viewer: exactly one running trip → its cockpit;
 * none or several (overlapping trips – guessing would be worse than one tap) → «Meine Reisen».
 */
export function startTrip(
  trips: readonly StartCandidate[],
  today: IsoDate,
): { kind: "trip"; publicId: string } | { kind: "list" } {
  const running = runningTrips(trips, today);
  const only = running.length === 1 ? running[0] : undefined;
  return only ? { kind: "trip", publicId: only.publicId } : { kind: "list" };
}

/** Query flag on the redirect target – the cockpit shows the one-off hint (W16 v2.18). */
export const START_PARAM = "start";
