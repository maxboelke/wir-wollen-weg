import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { todayIso } from "@/lib/dates";
import { phaseProgress, uiPhase, type Progress, type UiPhase } from "@/lib/trip-status";
import { MAX_TRIP_MEMBERS } from "@/server/db/schema";
import { getSession, type Session } from "@/server/session";
import {
  findMembership,
  listMembers,
  listPlaceholders,
  type MemberRow,
  type MemberView,
  type PlaceholderView,
  type TripRow,
} from "@/server/trips";
import { viewerFormat, type ViewerFormat } from "@/server/viewer";

export interface TripView {
  session: Session;
  trip: TripRow;
  me: MemberRow;
  members: MemberView[];
  /** Open placeholders (F-007). Their invite tokens must only reach organiser views. */
  placeholders: PlaceholderView[];
  isOrganizer: boolean;
  phase: UiPhase;
  progress: Progress | null;
  full: boolean;
  today: string;
  format: ViewerFormat;
}

/**
 * Loads a trip page: signed in (else → /login with return path), member (else the shared
 * «Reise nicht gefunden» – no difference between "does not exist" and "no access",
 * sitemap §4). Cached per request.
 */
export const loadTripView = cache(async (publicId: string, path: string): Promise<TripView> => {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(path)}`);
  const found = await findMembership(publicId, session.user.id);
  if (!found) notFound();
  const today = todayIso();
  const [members, placeholders, format] = await Promise.all([
    listMembers(found.trip.id),
    listPlaceholders(found.trip.id),
    viewerFormat(session),
  ]);
  const phase = uiPhase(found.trip, today);
  return {
    session,
    trip: found.trip,
    me: found.member,
    members,
    placeholders,
    isOrganizer: found.member.role === "organizer",
    phase,
    progress: phaseProgress(phase, members),
    // Open placeholders count towards the 30 (F-007).
    full: members.length + placeholders.length >= MAX_TRIP_MEMBERS,
    today,
    format,
  };
});
