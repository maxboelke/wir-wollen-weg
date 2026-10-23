// Key rotation of the personal travel details (deployment.md §0.11.6, Runbook A §0.11.7).
// Usage: pnpm travel-data:rotate [--dry-run] [--purge-unreadable]
// Output: counts per key id only. Exit code 1 when unknown key ids or unreadable rows remain.
import pg from "pg";
import { resolveAppEnv } from "../src/lib/app-env.ts";
import { DERIVED_KEY_ID } from "../src/lib/travel-data-keys.ts";
import { currentKeyRing } from "../src/server/travel-data/cipher.ts";
import { rotateTravelKeys } from "../src/server/travel-data/rotate.ts";

const appEnv = resolveAppEnv();
const ring = currentKeyRing(process.env);
if (!ring) {
  console.error("[rotate] no key ring – set TRAVEL_DATA_KEYS (deployment.md §0.11.2)");
  process.exit(1);
}
if (ring.active.kid === DERIVED_KEY_ID && (appEnv === "staging" || appEnv === "production")) {
  console.error(`[rotate] refusing: APP_ENV=${appEnv} must not use the derived key`);
  process.exit(1);
}
const dryRun = process.argv.includes("--dry-run");
const purgeUnreadable = process.argv.includes("--purge-unreadable");
const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    "postgres://app:app@localhost:5432/wirwollenweg",
});
await client.connect();
try {
  const report = await rotateTravelKeys(client, ring, { dryRun, purgeUnreadable });
  const before = Object.entries(report.before)
    .map(([kid, n]) => `${kid}=${String(n)}`)
    .join(" ");
  console.log(`[rotate] active=${ring.active.kid} before: ${before || "none"}`);
  console.log(
    `[rotate] rotated=${String(report.rotated)} unknown_key=${String(report.unknownKey)} failed=${String(report.failed)} purged=${String(report.purged)} remaining_old_keys=${String(report.remainingOldKeys)}${dryRun ? " (dry run)" : ""}`,
  );
  if (!purgeUnreadable && report.unknownKey + report.failed > 0) process.exitCode = 1;
} finally {
  await client.end();
}
