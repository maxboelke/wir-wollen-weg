"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { addDays, todayIso } from "@/lib/dates";
import { cleanDisplayName, DISPLAY_NAME_MAX } from "@/lib/display-name";
import { draftFromFormData, validateTrip, type TripDraft, type TripErrors } from "@/lib/trip-input";
import { auth } from "@/server/auth";
import { getSession } from "@/server/session";
import {
  createPlaceholder,
  createTrip as insertTrip,
  deleteTrip,
  findMembership,
  regenerateInviteToken,
  removeMember,
  removePlaceholder,
  renameMember,
  renamePlaceholder,
  setJoinOpen,
  transferOrganizer,
  updateTrip,
  type Membership,
  type PlaceholderResult,
} from "@/server/trips";
import { FLASH_COOKIE, flashValue } from "@/lib/flash";
import { tripPath } from "./paths";

/**
 * Server Actions for trips (F-001, F-002, F-004, F-013). Every action resolves the trip
 * through the caller's membership (no IDOR) and checks the role on the server – hidden
 * buttons are never the protection (F-004).
 */

export type TripActionError = "generic" | "notAllowed" | "signedOut";

export interface TripFormState {
  errors?: TripErrors;
  error?: TripActionError;
  ok?: boolean;
}

/**
 * The server accepts a start date one day before its own "today": the form validates
 * against the viewer's local date, which may be behind the server's (time zones).
 */
function serverToday(): string {
  return addDays(todayIso(), -1);
}

async function membership(publicId: string): Promise<Membership | null> {
  const session = await getSession();
  if (!session) return null;
  return findMembership(publicId, session.user.id);
}

async function organizer(publicId: string): Promise<Membership | null> {
  const found = await membership(publicId);
  return found?.member.role === "organizer" ? found : null;
}

const nameSchema = z
  .string()
  .transform(cleanDisplayName)
  .pipe(z.string().min(1).max(DISPLAY_NAME_MAX));

/** F-001: create a trip (signed in) → invite page with «Deine Reise ist angelegt!». */
export async function createTrip(draft: TripDraft): Promise<TripFormState> {
  const session = await getSession();
  if (!session) return { error: "signedOut" };
  const result = validateTrip(draft, { today: serverToday() });
  if (!result.ok) return { errors: result.errors };
  const created = await insertTrip(result.values, {
    userId: session.user.id,
    displayName: session.user.name || session.user.email.split("@")[0] || "?",
    locale: await getLocale(),
  });
  redirect(`${tripPath(created.publicId, "invite")}?created=1`);
}

/** Form variant (works before hydration). */
export async function createTripFormAction(
  _previous: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  return createTrip(draftFromFormData(formData));
}

/**
 * Flow G #4: new account created at the end of «Reise anlegen» – the name step saves the
 * account name, then the trip is created with the draft kept in `pendingAuth`.
 */
export async function createTripWithName(
  draft: TripDraft,
  name: string,
): Promise<{ error?: "nameRequired" | "generic" | "tripInvalid" }> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };
  if (!validateTrip(draft, { today: serverToday() }).ok) return { error: "tripInvalid" };
  await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  const result = await createTrip(draft);
  return result.errors ? { error: "tripInvalid" } : { error: "generic" };
}

/** F-001 (W12): edit trip data – organiser only. */
export async function updateTripAction(
  publicId: string,
  _previous: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const found = await organizer(publicId);
  if (!found) return { error: "notAllowed" };
  const draft = draftFromFormData(formData);
  const options = {
    today: serverToday(),
    originalStart: found.trip.rangeStart,
    originalDeadline: found.trip.deadline,
    originalEnd: found.trip.rangeEnd,
  };
  // R-055: once the vote has started, the end must not move into the past (the trip would tip
  // into «Vergangen» and end the vote) – the real today, `uiPhase` uses it too.
  const endNotBefore = todayIso();
  const result = validateTrip(draft, {
    ...options,
    endNotBefore: found.trip.phase === "collecting" ? undefined : endNotBefore,
  });
  if (!result.ok) return { errors: result.errors };
  const endMovedIntoPast =
    result.values.rangeEnd < endNotBefore && result.values.rangeEnd !== found.trip.rangeEnd;
  const saved = await updateTrip(found.trip.id, result.values, {
    onlyWhileCollecting: endMovedIntoPast,
  });
  if (!saved) {
    // The vote was started in the meantime – answer with the field error of the new phase.
    const again = validateTrip(draft, { ...options, endNotBefore });
    return again.ok ? { error: "generic" } : { errors: again.errors };
  }
  return { ok: true };
}

export interface InviteActionResult {
  ok?: boolean;
  error?: TripActionError;
}

/** F-002/F-004: new invite link – the old one stops working at once. */
export async function regenerateInviteAction(publicId: string): Promise<InviteActionResult> {
  const found = await organizer(publicId);
  if (!found) return { error: "notAllowed" };
  await regenerateInviteToken(found.trip.id);
  return { ok: true };
}

/** F-004: «Neue Mitglieder können beitreten». */
export async function setJoinOpenAction(
  publicId: string,
  open: boolean,
): Promise<InviteActionResult> {
  const found = await organizer(publicId);
  if (!found) return { error: "notAllowed" };
  await setJoinOpen(found.trip.id, typeof open === "boolean" && open);
  return { ok: true };
}

const userIdSchema = z.uuid();

/** F-004: hand the «Orga» role to another member (organiser stays a member). */
export async function transferOrganizerAction(
  publicId: string,
  toUserId: string,
): Promise<InviteActionResult> {
  const found = await organizer(publicId);
  const target = userIdSchema.safeParse(toUserId);
  if (!found || !target.success) return { error: "notAllowed" };
  const done = await transferOrganizer(found.trip.id, found.member.userId, target.data);
  return done ? { ok: true } : { error: "generic" };
}

/** F-004: remove a member (Flow J) – optionally renew the link right away. */
export async function removeMemberAction(
  publicId: string,
  userId: string,
  renewLink: boolean,
): Promise<InviteActionResult> {
  const found = await organizer(publicId);
  const target = userIdSchema.safeParse(userId);
  if (!found || !target.success || target.data === found.member.userId) {
    return { error: "notAllowed" };
  }
  const removed = await removeMember(found.trip.id, target.data);
  if (!removed) return { error: "generic" };
  if (typeof renewLink === "boolean" && renewLink) await regenerateInviteToken(found.trip.id);
  return { ok: true };
}

/** «Mein Name in dieser Reise». */
export async function renameSelfAction(
  publicId: string,
  name: string,
): Promise<{ ok?: boolean; error?: TripActionError | "nameRequired"; suggestion?: string }> {
  const found = await membership(publicId);
  if (!found) return { error: "notAllowed" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };
  const result = await renameMember(found.trip.id, found.member.userId, parsed.data);
  return result.ok ? { ok: true } : { suggestion: result.suggestion };
}

async function flash(kind: "trip-left" | "trip-deleted", tripName: string) {
  (await cookies()).set(FLASH_COOKIE, flashValue(kind, tripName), {
    maxAge: 60,
    sameSite: "lax",
    path: "/",
  });
}

/** F-013 / Flow J: leave a trip (members only – the organiser hands over or deletes first). */
export async function leaveTripAction(publicId: string): Promise<InviteActionResult> {
  const found = await membership(publicId);
  if (!found || found.member.role === "organizer") return { error: "notAllowed" };
  await removeMember(found.trip.id, found.member.userId);
  await flash("trip-left", found.trip.name);
  redirect("/trips");
}

/** F-013 (simple case): delete the whole trip – organiser, confirmed by typing its name. */
export async function deleteTripAction(
  publicId: string,
  confirmName: string,
): Promise<InviteActionResult> {
  const found = await organizer(publicId);
  if (!found) return { error: "notAllowed" };
  const matches =
    typeof confirmName === "string" &&
    confirmName.trim().toLocaleLowerCase() === found.trip.name.trim().toLocaleLowerCase();
  if (!matches) return { error: "generic" };
  await deleteTrip(found.trip.id);
  await flash("trip-deleted", found.trip.name);
  redirect("/trips");
}

// ---------------------------------------------------------------------------
// Placeholders (F-007) – organiser only, checked on the server (F-004)
// ---------------------------------------------------------------------------

export interface PlaceholderActionResult {
  ok?: boolean;
  error?: TripActionError | "nameRequired" | "full";
  suggestion?: string;
}

function placeholderResult(result: PlaceholderResult): PlaceholderActionResult {
  if (result.ok) return { ok: true };
  if (result.reason === "nameTaken") return { suggestion: result.suggestion };
  return { error: result.reason === "full" ? "full" : "generic" };
}

/** «Wer soll dabei sein?» – adds a placeholder with its own invite link (W06). */
export async function addPlaceholderAction(
  publicId: string,
  name: string,
): Promise<PlaceholderActionResult> {
  const found = await organizer(publicId);
  if (!found) return { error: "notAllowed" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };
  return placeholderResult(await createPlaceholder(found.trip.id, parsed.data));
}

export async function renamePlaceholderAction(
  publicId: string,
  placeholderId: string,
  name: string,
): Promise<PlaceholderActionResult> {
  const found = await organizer(publicId);
  const id = userIdSchema.safeParse(placeholderId);
  if (!found || !id.success) return { error: "notAllowed" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };
  return placeholderResult(await renamePlaceholder(found.trip.id, id.data, parsed.data));
}

/** Flow J «Platzhalter entfernen»: the personal link stops working at once. */
export async function removePlaceholderAction(
  publicId: string,
  placeholderId: string,
): Promise<PlaceholderActionResult> {
  const found = await organizer(publicId);
  const id = userIdSchema.safeParse(placeholderId);
  if (!found || !id.success) return { error: "notAllowed" };
  return (await removePlaceholder(found.trip.id, id.data)) ? { ok: true } : { error: "generic" };
}
