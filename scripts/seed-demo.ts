// Demo seed (deployment.md §0.4): synthetic data only (@demo.test), idempotent. The data and
// the logic live in src/server/demo/seed.ts (shared with «Demo zurücksetzen» of the online
// preview, deployment.md §0.7).
// Usage: pnpm db:seed:demo   (dev: reads .env.local) · demo container: pnpm demo:seed
//        --if-empty: only when no demo person exists yet (Vercel build, scripts/vercel-build.ts)
import pg from "pg";
import { onVercel, resolveAppEnv, resolveAppUrl } from "../src/lib/app-env.ts";
import { DEMO_DOMAIN, hasDemoData, seedDemo } from "../src/server/demo/seed.ts";

const SEED_ENVS = new Set(["demo", "development", "preview"]);
const appEnv = resolveAppEnv();
if (!SEED_ENVS.has(appEnv)) {
  console.error(`[seed] refusing to run with APP_ENV=${appEnv} (only demo/development/preview).`);
  process.exit(1);
}

const onlyIfEmpty = process.argv.includes("--if-empty");
// Migrations and seed prefer Neon's direct (unpooled) connection when it is available.
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  "postgres://app:app@localhost:5432/wirwollenweg";
const appUrl = resolveAppUrl();

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  if (onlyIfEmpty && (await hasDemoData(client))) {
    console.log(`[seed] demo people (${DEMO_DOMAIN}) exist already – nothing to do.`);
  } else {
    const result = await seedDemo(client, appUrl);
    console.log(`[seed] ${String(result.people.length)} demo people (${result.people.join(", ")})`);
    console.log(`[seed] Sign in as anna${DEMO_DOMAIN} at ${appUrl}/login – she is in every trip.`);
    // Invite links are secrets (R-037) – never in the Vercel build log.
    if (onVercel()) console.log(`[seed] ${String(result.trips.length)} trips.`);
    else console.log(`[seed] ${String(result.trips.length)} trips:\n${result.trips.join("\n")}`);
  }
} finally {
  await client.end();
}
