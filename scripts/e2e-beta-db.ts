// E2E only (project «beta-chromium», playwright.config.ts): prepares the separate database of
// the beta test server – created if missing, then migrated. The beta keeps its own data like
// the real beta (deployment.md §0.12.2: own Neon project), so the account limit is testable.
// Usage: node scripts/e2e-beta-db.ts <database-url>. Runs with plain Node 24.
import { spawnSync } from "node:child_process";
import pg from "pg";

const target = process.argv[2];
if (!target) {
  console.error("[e2e-beta-db] usage: node scripts/e2e-beta-db.ts <database-url>");
  process.exit(1);
}
const url = new URL(target);
const name = url.pathname.slice(1);
if (!/^[a-z0-9_]+$/.test(name) || !name.endsWith("_beta")) {
  console.error("[e2e-beta-db] refusing: the database name must end with _beta");
  process.exit(1);
}
const admin = new URL(target);
admin.pathname = "/postgres";
const client = new pg.Client({ connectionString: admin.toString() });
await client.connect();
// Both beta test servers run this script at the same time: one after the other.
await client.query("select pg_advisory_lock(4711)");
const exists = await client.query("select 1 from pg_database where datname = $1", [name]);
if (exists.rowCount === 0) await client.query(`create database "${name}"`);
const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: target, DATABASE_URL_UNPOOLED: target },
});
await client.query("select pg_advisory_unlock(4711)");
await client.end();
process.exit(result.status ?? 1);
