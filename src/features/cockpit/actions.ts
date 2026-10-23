"use server";

import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { canEditTripInfo, validateInfo, type InfoErrors } from "@/lib/trip-info";
import {
  markAnnounced,
  markDepartureCelebrated,
  saveTripInfo,
  setPlaceholderWithoutApp,
} from "@/server/cockpit";
import { takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findMembership, type Membership } from "@/server/trips";

/**
 * Server Actions of the «Reiseverlauf» cockpit and the info page (F-053, F-033, UX-8, UX-9).
 * Every action resolves the trip through the caller's OWN membership (no IDOR) and checks the
 * role on the server; all only in the stored phase «fixed».
 */

export type CockpitError = "signedOut" | "notAllowed" | "phase" | "invalid" | "limited";
export type CockpitResult = { ok: true } | { ok: false; error: CockpitError };

async function fixedMembership(publicId: unknown): Promise<Membership | { error: CockpitError }> {
  const session = await getSession();
  if (!session) return { error: "signedOut" };
  if (typeof publicId !== "string") return { error: "notAllowed" };
  const found = await findMembership(publicId, session.user.id);
  if (!found) return { error: "notAllowed" };
  if (found.trip.phase !== "fixed" || !found.trip.fixedStart) return { error: "phase" };
  return found;
}

async function fixedOrganizer(publicId: unknown): Promise<Membership | { error: CockpitError }> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return found;
  return found.member.role === "organizer" ? found : { error: "notAllowed" };
}

/** V1 «Allen Bescheid geben»: the organiser tapped WhatsApp/share/copy (I8-03). */
export async function announcedAction(publicId: string): Promise<CockpitResult> {
  const found = await fixedOrganizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  await markAnnounced(found.trip.id);
  return { ok: true };
}

const placeholderSchema = z.uuid();

/** UX-9 «{Name} macht ohne App mit» on/off – organiser only, open placeholders of this trip. */
export async function withoutAppAction(
  publicId: string,
  placeholderId: unknown,
  on: unknown,
): Promise<CockpitResult> {
  const found = await fixedOrganizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = placeholderSchema.safeParse(placeholderId);
  if (!id.success || typeof on !== "boolean") return { ok: false, error: "invalid" };
  const changed = await setPlaceholderWithoutApp(
    found.trip.id,
    id.data,
    on ? found.member.userId : null,
  );
  return changed ? { ok: true } : { ok: false, error: "invalid" };
}

/**
 * UX-8: the small departure-day celebration started (or would have, with reduced motion) –
 * remembered per membership and arrival day; only ON the arrival day.
 */
export async function departureCelebratedAction(publicId: string): Promise<CockpitResult> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const start = found.trip.fixedStart;
  if (!start || todayIso() !== start) return { ok: false, error: "phase" };
  await markDepartureCelebrated(found.trip.id, found.member.userId, start);
  return { ok: true };
}

/** Saves per person: 30 in 10 minutes (generous – a form, not an autosave). */
const INFO_SAVE_LIMIT = { kind: "trip-info", limit: 30, windowMs: 10 * 60_000 };

export type SaveInfoState =
  | { ok: true; version: number }
  | { ok: false; error: CockpitError; errors?: InfoErrors }
  | { ok: false; error: "conflict"; version: number; editorName: string | null };

/**
 * F-033 «Infos bearbeiten» (I8-10): organiser only (`canEditTripInfo`), all fields validated
 * again on the server (limits, times, phone), control characters removed, rate-limited per
 * person. Concurrent edits are detected by version (see `saveTripInfo`).
 */
export async function saveTripInfoAction(
  publicId: string,
  input: unknown,
  version: unknown,
): Promise<SaveInfoState> {
  const found = await fixedMembership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (!canEditTripInfo(found.member)) return { ok: false, error: "notAllowed" };
  const expected = z.number().int().min(0).safeParse(version);
  if (!expected.success || typeof input !== "object" || input === null) {
    return { ok: false, error: "invalid" };
  }
  const result = validateInfo(input);
  if (!result.ok) return { ok: false, error: "invalid", errors: result.errors };
  const limit = await takeLimit(INFO_SAVE_LIMIT, `info:${found.member.userId}`);
  if (limit.limited) return { ok: false, error: "limited" };
  const saved = await saveTripInfo(
    found.trip.id,
    found.member.userId,
    result.values,
    expected.data,
  );
  if (!saved.ok) {
    return { ok: false, error: "conflict", version: saved.version, editorName: saved.editorName };
  }
  return { ok: true, version: saved.version };
}
