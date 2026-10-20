import { serverEnv } from "@/server/env";
import { retentionTokenMatches } from "@/lib/retention-token";
import { runRetention } from "@/server/retention";

export const dynamic = "force-dynamic";

/**
 * Daily retention run (F-013 trips, F-043 inactive accounts, demo inbox) – called by a timer of
 * the deployment (docs/ops): `POST` with «Authorization: Bearer <RETENTION_TOKEN>» (systemd/cron)
 * or `GET` with «Authorization: Bearer <CRON_SECRET>» (Vercel Cron only sends GET, online
 * preview PRD Q25). Either token works with either method. Without a configured token, or with a
 * wrong one, the endpoint does not exist (404). The answer contains counts only.
 */
async function handle(request: Request): Promise<Response> {
  const env = serverEnv();
  const allowed = [env.RETENTION_TOKEN, env.CRON_SECRET];
  if (!(await retentionTokenMatches(request.headers.get("authorization"), allowed))) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json(await runRetention(), { headers: { "cache-control": "no-store" } });
}

export function POST(request: Request): Promise<Response> {
  return handle(request);
}

export function GET(request: Request): Promise<Response> {
  return handle(request);
}
