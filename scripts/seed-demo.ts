// Demo seed (deployment.md §0.4): synthetic data only (@demo.test), idempotent.
// Grows with the increments; for the auth spike it creates one trip with Anna as organiser.
// Usage: pnpm db:seed:demo   (dev: reads .env.local) · demo container: pnpm demo:seed
import { randomBytes } from "node:crypto";
import pg from "pg";

const appEnv = process.env.APP_ENV ?? "development";
if (appEnv !== "demo" && appEnv !== "development") {
  console.error(`[seed] refusing to run with APP_ENV=${appEnv} (only demo/development).`);
  process.exit(1);
}

const DEMO_DOMAIN = "@demo.test";
const DEMO_TRIP = "Lissabon 2027";
const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("begin");
  // 1. Clear previous demo data (cascades to sessions, accounts, memberships).
  await client.query("delete from trip where name = $1", [DEMO_TRIP]);
  await client.query(`delete from "user" where email like $1`, [`%${DEMO_DOMAIN}`]);

  // 2. Insert.
  const anna = await client.query<{ id: string }>(
    `insert into "user" (name, email, email_verified) values ($1, $2, true) returning id`,
    ["Anna", `anna${DEMO_DOMAIN}`],
  );
  const token = randomBytes(32).toString("base64url");
  const trip = await client.query<{ id: string }>(
    "insert into trip (name, invite_token) values ($1, $2) returning id",
    [DEMO_TRIP, token],
  );
  await client.query(
    "insert into trip_member (trip_id, user_id, display_name) values ($1, $2, $3)",
    [trip.rows[0]?.id, anna.rows[0]?.id, "Anna"],
  );
  await client.query("commit");

  console.log(`[seed] Demo trip "${DEMO_TRIP}" (organiser: anna${DEMO_DOMAIN})`);
  console.log(`[seed] Invite link: ${appUrl}/i/${token}`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
