"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toSafeInternalPath } from "@/lib/safe-path";
import { auth } from "@/server/auth";
import { getSession } from "@/server/session";
import { addMember, findTripByInviteToken } from "@/server/trips";

export interface ActionResult {
  error?: "nameRequired" | "generic";
}

const nameSchema = z.string().trim().min(1).max(40);

/** Name step for new accounts on /login (Flow H.1). */
export async function saveName(returnTo: string, name: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: "nameRequired" };

  await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  redirect(toSafeInternalPath(returnTo, "/trips"));
}

/**
 * Join step on /i/<token> (Flow A.1 #6/#7). For new accounts the name step IS the
 * join step. Placeholder for F-003 (Increment 2: duplicate names, limits, rate limit).
 */
export async function joinTrip(token: string, name: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "generic" };
  const trip = await findTripByInviteToken(token);
  if (!trip) return { error: "generic" };

  const parsed = nameSchema.safeParse(name || session.user.name);
  if (!parsed.success) return { error: "nameRequired" };
  if (!session.user.name) {
    await auth().api.updateUser({ body: { name: parsed.data }, headers: await headers() });
  }
  await addMember(trip.id, session.user.id, parsed.data);
  redirect("/trips");
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

export async function signOut(): Promise<void> {
  await auth().api.signOut({ headers: await headers() });
  redirect("/");
}
