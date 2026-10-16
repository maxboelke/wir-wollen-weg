import "server-only";
import { and, eq, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "./auth";
import { db } from "./db/client";
import { user } from "./db/schema";

/**
 * Current session or null (Server Components / Actions). Cached per request: layout,
 * locale resolution and page share one lookup.
 */
export const getSession = cache(async () => {
  // Session-dependent output is always dynamic – opt out of prerendering explicitly.
  await connection();
  const session = await auth().api.getSession({ headers: await headers() });
  if (session) touchActivity(session.user.id);
  return session;
});

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * Remembers that the account is in use (inactivity deletion after 24 months, F-043) – at most
 * once a day, and clears a pending inactivity notice. Fire-and-forget: never delays a page.
 */
export function touchActivity(userId: string): void {
  db()
    .update(user)
    .set({ lastActiveAt: new Date(), inactivityNoticeSentAt: null })
    .where(and(eq(user.id, userId), lt(user.lastActiveAt, sql`now() - interval '1 day'`)))
    .catch(() => undefined);
}
