"use server";

import { z } from "zod";
import { addDays, todayIso } from "@/lib/dates";
import {
  checkDeadline,
  checkOption,
  checkOptions,
  isVoteChoice,
  MAX_OPTIONS,
  pollForViewer,
  type OptionProblem,
  type Period,
  type ViewerPoll,
  type VoteChoice,
} from "@/lib/poll";
import { uiPhase } from "@/lib/trip-status";
import {
  addOption,
  castVotes,
  fixDates,
  listOptions,
  listVotes,
  markCelebrated,
  startPoll,
  unfixDates,
} from "@/server/poll";
import { getSession } from "@/server/session";
import { findMembership, listMembers, type Membership } from "@/server/trips";

/**
 * Server Actions of the vote (F-010, F-011, F-012). Every action resolves the trip through the
 * caller's OWN membership (session user + public id – no IDOR); organiser actions check the
 * role on the server (F-004). All input is untrusted: ids are UUIDs of THIS trip, dates lie in
 * the search range and respect the minimum length, answers are one of yes/maybe/no. Phase
 * changes run under a lock of the trip row (src/server/poll.ts).
 */

export type PollError =
  "signedOut" | "notAllowed" | "phase" | "invalid" | "duplicate" | "full" | "count" | OptionProblem;

export type PollActionResult = { ok: true } | { ok: false; error: PollError };

/**
 * The server accepts dates from one day before its own "today": the viewer's local date may
 * be a day behind (time zones) – same rule as the trip form and «Meine Tage».
 */
function serverToday(): string {
  return addDays(todayIso(), -1);
}

async function membership(publicId: unknown): Promise<Membership | { error: PollError }> {
  const session = await getSession();
  if (!session) return { error: "signedOut" };
  if (typeof publicId !== "string") return { error: "notAllowed" };
  const found = await findMembership(publicId, session.user.id);
  return found ?? { error: "notAllowed" };
}

async function organizer(publicId: unknown): Promise<Membership | { error: PollError }> {
  const found = await membership(publicId);
  if ("error" in found) return found;
  return found.member.role === "organizer" ? found : { error: "notAllowed" };
}

function rules(found: Membership) {
  return {
    rangeStart: found.trip.rangeStart,
    rangeEnd: found.trip.rangeEnd,
    minNights: found.trip.minNights,
    today: serverToday(),
  };
}

/**
 * F-010 «Abstimmung starten» (organiser, phase «Tage sammeln»): 2–6 options, no duplicates,
 * optional deadline (F-017). Afterwards the client shows the share sheet «Abstimmung läuft».
 */
export async function startPollAction(
  publicId: string,
  options: unknown,
  deadline: unknown,
): Promise<PollActionResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (uiPhase(found.trip, todayIso()) !== "collect") return { ok: false, error: "phase" };
  const checked = checkOptions(options, rules(found));
  if (!checked.ok) return { ok: false, error: checked.reason };
  const due = checkDeadline(deadline, serverToday());
  if (!due.ok) return { ok: false, error: "invalid" };
  const result = await startPoll(found.trip.id, checked.options, due.deadline);
  return result.ok ? { ok: true } : { ok: false, error: result.reason };
}

/** «+ Option hinzufügen» after the start (organiser, phase «Abstimmung läuft», max. 6). */
export async function addOptionAction(
  publicId: string,
  option: unknown,
): Promise<PollActionResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (uiPhase(found.trip, todayIso()) !== "vote") return { ok: false, error: "phase" };
  const problem = checkOption(option, rules(found));
  if (problem) return { ok: false, error: problem };
  const period = option as Period;
  const result = await addOption(found.trip.id, { start: period.start, end: period.end });
  return result.ok ? { ok: true } : { ok: false, error: result.reason };
}

const voteSchema = z
  .array(
    z.object({
      optionId: z.uuid(),
      choice: z.custom<VoteChoice>(isVoteChoice),
    }),
  )
  .min(1)
  .max(MAX_OPTIONS);

export type VoteActionResult =
  | {
      ok: true;
      poll: ViewerPoll;
      votedAll: boolean;
      done: number;
      total: number;
      /** Status only (F-007 «abgestimmt» is visible to everyone) – never the answers. */
      voted: string[];
      open: string[];
    }
  | { ok: false; error: PollError };

/**
 * F-011: saves one or more answers («Alle Vorschläge übernehmen» sends several) and returns
 * the poll as THIS viewer may see it now (Q13 a: the results of the answered options are
 * released by the server – never shipped earlier and hidden in the browser).
 */
export async function voteAction(publicId: string, votes: unknown): Promise<VoteActionResult> {
  const found = await membership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (uiPhase(found.trip, todayIso()) !== "vote") return { ok: false, error: "phase" };
  const parsed = voteSchema.safeParse(votes);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const saved = await castVotes(found.trip.id, found.member.userId, parsed.data);
  if (!saved.ok) return { ok: false, error: saved.reason === "phase" ? "phase" : "invalid" };
  const [options, allVotes, members] = await Promise.all([
    listOptions(found.trip.id),
    listVotes(found.trip.id),
    listMembers(found.trip.id),
  ]);
  const poll = pollForViewer({
    options,
    votes: allVotes,
    names: new Map(members.map((m) => [m.userId, m.displayName])),
    viewerId: found.member.userId,
    seeAll: found.member.role === "organizer",
  });
  return {
    ok: true,
    poll,
    votedAll: saved.votedAll,
    done: members.filter((m) => m.votedAt).length,
    total: members.length,
    voted: members.filter((m) => m.votedAt).map((m) => m.displayName),
    open: members.filter((m) => !m.votedAt).map((m) => m.displayName),
  };
}

const optionIdSchema = z.uuid();

/** F-012 «Termin festlegen» (organiser): closes the vote with the chosen option → phase 3. */
export async function fixDatesAction(
  publicId: string,
  optionId: unknown,
): Promise<PollActionResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const id = optionIdSchema.safeParse(optionId);
  if (!id.success) return { ok: false, error: "invalid" };
  if (uiPhase(found.trip, todayIso()) !== "vote") return { ok: false, error: "phase" };
  const result = await fixDates(found.trip.id, id.data);
  if (!result.ok) return { ok: false, error: result.reason === "phase" ? "phase" : "invalid" };
  return { ok: true };
}

/** «Festlegung aufheben» (organiser, W11-07): vote open again, all votes stay. */
export async function unfixDatesAction(publicId: string): Promise<PollActionResult> {
  const found = await organizer(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  if (uiPhase(found.trip, todayIso()) !== "fixed") return { ok: false, error: "phase" };
  const result = await unfixDates(found.trip.id);
  return result.ok ? { ok: true } : { ok: false, error: "phase" };
}

/**
 * The celebration «Es geht los!» started visibly (ux-spec §7.5: the marker is set at the
 * visible start) – remembered per membership and fixed range.
 */
export async function celebratedAction(publicId: string): Promise<PollActionResult> {
  const found = await membership(publicId);
  if ("error" in found) return { ok: false, error: found.error };
  const { fixedStart, fixedEnd } = found.trip;
  if (found.trip.phase !== "fixed" || !fixedStart || !fixedEnd) {
    return { ok: false, error: "phase" };
  }
  await markCelebrated(found.trip.id, found.member.userId, { start: fixedStart, end: fixedEnd });
  return { ok: true };
}
