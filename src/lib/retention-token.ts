import { secretsEqual } from "./basic-auth";

/**
 * Checks «Authorization: Bearer <token>» of the retention job against the configured tokens
 * (RETENTION_TOKEN for own timers, CRON_SECRET for Vercel Cron). Unset tokens never match;
 * every configured token is compared in constant time, so the answer time does not reveal
 * which one (or whether any) matched.
 */
export async function retentionTokenMatches(
  header: string | null,
  tokens: readonly (string | undefined)[],
): Promise<boolean> {
  const given = /^Bearer (\S+)$/.exec(header ?? "")?.[1];
  let ok = false;
  for (const token of tokens) {
    if (!token) continue;
    if ((await secretsEqual(given ?? "", token)) && given !== undefined) ok = true;
  }
  return ok;
}
