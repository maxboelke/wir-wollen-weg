import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "./auth";

/**
 * Current session or null (Server Components / Actions). Cached per request: layout,
 * locale resolution and page share one lookup.
 */
export const getSession = cache(async () => {
  // Session-dependent output is always dynamic – opt out of prerendering explicitly.
  await connection();
  return auth().api.getSession({ headers: await headers() });
});

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
