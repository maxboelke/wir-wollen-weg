"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cleanDisplayName, DISPLAY_NAME_MAX } from "@/lib/display-name";
import { JOIN_LIMIT } from "@/lib/invite-limits";
import { isInviteTokenShape } from "@/lib/tokens";
import { todayIso } from "@/lib/dates";
import { defaultTab, uiPhase } from "@/lib/trip-status";
import { auth } from "@/server/auth";
import { requestLimitSubject, takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findInvite, joinByToken } from "@/server/trips";
import type { ActionResult } from "../auth/actions";
import { tripPath } from "../trips/paths";

const nameSchema = z
  .string()
  .transform(cleanDisplayName)
  .pipe(z.string().min(1).max(DISPLAY_NAME_MAX));

/**
 * Join on /i/<token> (F-003, Flow A.1 #6/#7, A.3). New accounts: the name step IS the join
 * step (the name also becomes the account name). Signed-in people join with one tap (name
 * from the account, changeable for this trip). Checks: token valid, join open, < 30 members,
 * name unique in the trip, max. 20 joins per trip and hour per IP. Success → the trip's
 * default tab with the «Du bist dabei!» welcome (W03-06).
 */
export async function joinTrip(token: string, name: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  if (!isInviteTokenShape(token)) return { error: "joinInvalid" };

  const parsed = nameSchema.safeParse(name || session.user.name);
  if (!parsed.success) return { error: "nameRequired" };

  const preview = await findInvite(token);
  if (!preview) return { error: "joinInvalid" };
  // Per trip and client IP (IPv6: /64). No resolvable IP (broken proxy setup outside
  // dev/CI): reject like the auth route (400) instead of a shared bucket (R-005, R-036).
  const subject = await requestLimitSubject();
  if (!subject) return { error: "generic" };
  const limit = await takeLimit(JOIN_LIMIT, `${preview.id}:${subject}`);
  if (limit.limited) return { error: "joinRateLimited", minutes: limit.retryMinutes };

  // New account without a name: the name of the join step becomes the account name.
  if (!session.user.name) {
    await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  }
  const outcome = await joinByToken(token, session.user.id, parsed.data, session.user.name);
  if (!outcome.ok) {
    switch (outcome.reason) {
      case "invalid":
        return { error: "joinInvalid" };
      case "closed":
        return { error: "joinClosed" };
      case "full":
        return { error: "joinFull" };
      case "nameTaken":
        return { error: "nameTaken", suggestion: outcome.suggestion };
    }
  }
  // CEO decision (Increment 2): after joining → «Meine Tage» while dates are collected; in
  // phase 2/3 the overview (Flow A.5: dates are read-only once fixed).
  const tab = defaultTab(uiPhase(preview, todayIso()), {
    role: "member",
    submittedAt: null,
    votedAt: null,
  });
  redirect(`${tripPath(outcome.publicId, tab)}${outcome.alreadyMember ? "" : "?welcome=1"}`);
}

/** Form variant of joinTrip – works before hydration (progressive enhancement). */
export async function joinTripFormAction(
  token: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name");
  return joinTrip(token, typeof name === "string" ? name : "");
}
