"use server";

import {
  charCount,
  checkEntries,
  cleanComment,
  COMMENT_MAX,
  isImportFeedback,
} from "@/lib/availability";
import { editableWindow } from "@/lib/calendar";
import { addDays, todayIso } from "@/lib/dates";
import { uiPhase } from "@/lib/trip-status";
import {
  markSubmitted,
  replaceAvailability,
  saveComment,
  saveImportFeedback,
} from "@/server/availability";
import { getSession } from "@/server/session";
import { findMembership, type Membership } from "@/server/trips";

/**
 * Server Actions of «Meine Tage» (F-005, F-007). Each one resolves the trip through the
 * caller's own membership (session user + public id) – nobody can write someone else's days
 * (no IDOR). Inputs are untrusted: days must be real dates inside the trip's search range.
 * Phase 3 (dates fixed) and past trips are read-only (Flow B.3 #6).
 */

export type DaysError =
  "signedOut" | "notAllowed" | "readOnly" | "invalid" | "rangeChanged" | "generic";

export type DaysResult = { ok: true; savedAt: string } | { ok: false; error: DaysError };

/**
 * The server accepts days from one day before its own "today": the editor uses the viewer's
 * local date, which may be a day behind the server's (time zones).
 */
function serverToday(): string {
  return addDays(todayIso(), -1);
}

async function editableMembership(
  publicId: unknown,
): Promise<{ ok: true; found: Membership } | { ok: false; error: DaysError }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "signedOut" };
  if (typeof publicId !== "string") return { ok: false, error: "notAllowed" };
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { ok: false, error: "notAllowed" };
  const phase = uiPhase(found.trip, todayIso());
  if (phase === "fixed" || phase === "past") return { ok: false, error: "readOnly" };
  return { ok: true, found };
}

async function save(found: Membership, entries: unknown): Promise<DaysResult> {
  const range = { start: found.trip.rangeStart, end: found.trip.rangeEnd };
  const check = checkEntries(entries, range);
  if (!check.ok) {
    // The organiser may have shortened the range meanwhile (Flow B.4).
    return { ok: false, error: check.reason === "outsideRange" ? "rangeChanged" : "invalid" };
  }
  const window = editableWindow(range.start, range.end, serverToday());
  if (!window) return { ok: false, error: "readOnly" };
  const savedAt = await replaceAvailability(
    found.trip.id,
    found.member.userId,
    window,
    check.entries,
  );
  return { ok: true, savedAt: savedAt.toISOString() };
}

/** Autosave (Flow B.3 #1): the full snapshot of the own marked days. */
export async function saveDaysAction(publicId: string, entries: unknown): Promise<DaysResult> {
  const access = await editableMembership(publicId);
  if (!access.ok) return access;
  return save(access.found, entries);
}

/** «Fertig – abgeben»: saves the last snapshot and sets the status «abgegeben» (F-007). */
export async function submitDaysAction(publicId: string, entries: unknown): Promise<DaysResult> {
  const access = await editableMembership(publicId);
  if (!access.ok) return access;
  const saved = await save(access.found, entries);
  if (!saved.ok) return saved;
  const at = await markSubmitted(access.found.trip.id, access.found.member.userId);
  return { ok: true, savedAt: at.toISOString() };
}

/** Optional comment (F-005): ≤ 200 characters, saved when leaving the field. */
export async function saveCommentAction(publicId: string, comment: unknown): Promise<DaysResult> {
  const access = await editableMembership(publicId);
  if (!access.ok) return access;
  if (typeof comment !== "string") return { ok: false, error: "invalid" };
  const clean = cleanComment(comment);
  if (clean !== null && charCount(clean) > COMMENT_MAX) return { ok: false, error: "invalid" };
  await saveComment(access.found.trip.id, access.found.member.userId, clean);
  return { ok: true, savedAt: new Date().toISOString() };
}

/** One-off question after the first submission (F-005, A3/A7) – answer or «skipped». */
export async function importFeedbackAction(publicId: string, answer: unknown): Promise<DaysResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "signedOut" };
  if (!isImportFeedback(answer) || typeof publicId !== "string") {
    return { ok: false, error: "invalid" };
  }
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { ok: false, error: "notAllowed" };
  await saveImportFeedback(found.trip.id, found.member.userId, answer);
  return { ok: true, savedAt: new Date().toISOString() };
}
