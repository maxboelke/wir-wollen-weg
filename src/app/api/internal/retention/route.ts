import { timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/server/env";
import { runRetention } from "@/server/retention";

export const dynamic = "force-dynamic";

function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Daily retention run (F-013 trips, F-043 inactive accounts) – called by a timer of the
 * deployment (docs/ops). Without RETENTION_TOKEN, or with a wrong token, the endpoint does not
 * exist (404). The answer contains counts only.
 */
export async function POST(request: Request): Promise<Response> {
  const token = serverEnv().RETENTION_TOKEN;
  const given = request.headers.get("authorization") ?? "";
  if (!token || !matches(given, `Bearer ${token}`)) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json(await runRetention(), { headers: { "cache-control": "no-store" } });
}
