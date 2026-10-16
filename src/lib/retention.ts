import { addDays } from "./dates";

/**
 * Retention rules (F-013, F-043, compliance-checklist §6, Flow J «Automatische Löschung»).
 *
 * Trips: 90 days after the fixed end of the trip; trips without fixed dates 12 months after
 * the last activity. The organiser gets a notice mail 14 days before and sees a banner in
 * «Meine Reisen». A trip is never deleted earlier than 14 days after its notice – a late job
 * run postpones the deletion instead of surprising anyone.
 *
 * Accounts: 24 months without use; notice mail 30 days before, same guarantee.
 */

export const TRIP_DAYS_AFTER_END = 90;
export const TRIP_INACTIVE_MONTHS = 12;
export const TRIP_NOTICE_DAYS = 14;
export const ACCOUNT_INACTIVE_MONTHS = 24;
export const ACCOUNT_NOTICE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function addMonths(date: Date, months: number): Date {
  const out = new Date(date.getTime());
  const day = out.getUTCDate();
  out.setUTCDate(1);
  out.setUTCMonth(out.getUTCMonth() + months);
  // Clamp (31 Jan + 1 month → 28/29 Feb, not 3 March).
  const last = new Date(Date.UTC(out.getUTCFullYear(), out.getUTCMonth() + 1, 0)).getUTCDate();
  out.setUTCDate(Math.min(day, last));
  return out;
}

export type TripDeletionReason = "afterTrip" | "inactive";

export interface TripRetentionInput {
  phase: "collecting" | "voting" | "fixed";
  /** Fixed departure day (ISO), phase «fixed» only. */
  fixedEnd: string | null;
  /** Latest change in the trip (edits, joins, days, votes). */
  lastActivity: Date;
}

/** When a trip is due for deletion and why. */
export function tripDeletionDate(input: TripRetentionInput): {
  at: Date;
  reason: TripDeletionReason;
} {
  if (input.phase === "fixed" && input.fixedEnd) {
    // Start of the day 90 days after departure (UTC) – the trip is long over by then.
    return {
      at: new Date(`${addDays(input.fixedEnd, TRIP_DAYS_AFTER_END)}T00:00:00Z`),
      reason: "afterTrip",
    };
  }
  return { at: addMonths(input.lastActivity, TRIP_INACTIVE_MONTHS), reason: "inactive" };
}

export type RetentionAction = "none" | "notice" | "delete" | "resetNotice";

/**
 * What the job does with one trip/account now: send the notice (once), delete (only when due
 * AND the notice is at least `noticeDays` old), or reset a notice that no longer applies
 * (activity moved the date back out of the notice window).
 */
export function retentionAction(
  dueAt: Date,
  noticeSentAt: Date | null,
  now: Date,
  noticeDays: number,
): RetentionAction {
  const noticeFrom = dueAt.getTime() - noticeDays * DAY_MS;
  if (now.getTime() < noticeFrom) return noticeSentAt ? "resetNotice" : "none";
  if (!noticeSentAt) return "notice";
  const earliest = Math.max(dueAt.getTime(), noticeSentAt.getTime() + noticeDays * DAY_MS);
  return now.getTime() >= earliest ? "delete" : "none";
}

/** The date shown to people: the later of «due» and «notice + n days» (never earlier). */
export function effectiveDeletionDate(dueAt: Date, noticeSentAt: Date | null, noticeDays: number) {
  if (!noticeSentAt) return dueAt;
  return new Date(Math.max(dueAt.getTime(), noticeSentAt.getTime() + noticeDays * DAY_MS));
}

/** Show the banner «Wird am … gelöscht» from the start of the notice window on. */
export function inNoticeWindow(dueAt: Date, now: Date, noticeDays = TRIP_NOTICE_DAYS): boolean {
  return now.getTime() >= dueAt.getTime() - noticeDays * DAY_MS;
}

/** Account inactivity: due 24 months after the last use. */
export function accountDeletionDate(lastActiveAt: Date): Date {
  return addMonths(lastActiveAt, ACCOUNT_INACTIVE_MONTHS);
}
