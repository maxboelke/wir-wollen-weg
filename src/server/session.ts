import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "./auth";

/** Current session or null (Server Components / Actions). */
export async function getSession() {
  // Session-dependent output is always dynamic – opt out of prerendering explicitly.
  await connection();
  return auth().api.getSession({ headers: await headers() });
}
