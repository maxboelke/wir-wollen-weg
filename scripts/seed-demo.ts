// Demo seed (deployment.md §0.4): synthetic data only (@demo.test), idempotent.
// Increment 2: real trips in different phases with several members (F-001 ff.). Dates are
// relative to today, so the demo always looks current.
// Usage: pnpm db:seed:demo   (dev: reads .env.local) · demo container: pnpm demo:seed
import { randomBytes, randomInt } from "node:crypto";
import pg from "pg";

const appEnv = process.env.APP_ENV ?? "development";
if (appEnv !== "demo" && appEnv !== "development") {
  console.error(`[seed] refusing to run with APP_ENV=${appEnv} (only demo/development).`);
  process.exit(1);
}

const DEMO_DOMAIN = "@demo.test";
const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Same formats as src/lib/tokens.ts (kept self-contained: scripts run without the app build).
const PUBLIC_ID_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const publicId = () =>
  Array.from({ length: 10 }, () => PUBLIC_ID_ALPHABET.charAt(randomInt(32))).join("");
const inviteToken = () => randomBytes(32).toString("base64url");

/** ISO date `days` from today (UTC calendar day). */
function day(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

interface Person {
  key: string;
  name: string;
  locale: "de" | "en";
  country: string;
  subdivision?: string;
}

const PEOPLE: Person[] = [
  { key: "anna", name: "Anna Schmidt", locale: "de", country: "DE", subdivision: "DE-BY" },
  { key: "ben", name: "Ben Wagner", locale: "de", country: "DE", subdivision: "DE-BE" },
  { key: "carla", name: "Carla Rossi", locale: "en", country: "GB" },
  { key: "david", name: "David Huber", locale: "de", country: "AT" },
  { key: "emma", name: "Emma Brown", locale: "en", country: "US" },
  { key: "felix", name: "Felix Meier", locale: "de", country: "CH" },
  { key: "greta", name: "Greta Lind", locale: "de", country: "DE" },
  { key: "hanna", name: "Hanna Koch", locale: "de", country: "DE", subdivision: "DE-NW" },
];

interface MemberSeed {
  person: string;
  /** Display name in this trip (first name by default). */
  name?: string;
  organizer?: boolean;
  submitted?: boolean;
  voted?: boolean;
}

interface TripSeed {
  name: string;
  description?: string;
  rangeStart: string;
  rangeEnd: string;
  minNights: number;
  preferredNights?: number;
  deadline?: string;
  country: string;
  subdivision?: string;
  locale: "de" | "en";
  phase: "collecting" | "voting" | "fixed";
  fixedStart?: string;
  fixedEnd?: string;
  joinOpen?: boolean;
  members: MemberSeed[];
}

const TRIPS: TripSeed[] = [
  {
    name: "Lissabon 2027",
    description: "Sonne, Pastéis, Surfen. Wer ist dabei?",
    rangeStart: day(30),
    rangeEnd: day(90),
    minNights: 4,
    preferredNights: 5,
    deadline: day(14),
    country: "DE",
    subdivision: "DE-BY",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "anna", organizer: true },
      { person: "ben", submitted: true },
      { person: "carla", submitted: true },
      { person: "david" },
      { person: "emma" },
      { person: "felix" },
      { person: "greta", submitted: true },
    ],
  },
  {
    name: "Skiurlaub Arlberg",
    rangeStart: day(60),
    rangeEnd: day(120),
    minNights: 5,
    country: "AT",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "ben", organizer: true, submitted: true },
      { person: "anna", submitted: true },
      { person: "david", submitted: true },
      { person: "hanna", submitted: true },
    ],
  },
  {
    name: "JGA Tim",
    description: "Ein Wochenende, eine Stadt, viel Quatsch.",
    rangeStart: day(20),
    rangeEnd: day(75),
    minNights: 2,
    preferredNights: 3,
    country: "DE",
    locale: "de",
    phase: "voting",
    members: [
      { person: "carla", organizer: true, submitted: true, voted: true },
      { person: "anna", submitted: true },
      { person: "ben", submitted: true, voted: true },
      { person: "felix", submitted: true, voted: true },
      { person: "greta", submitted: true },
    ],
  },
  {
    name: "Familientreffen Harz",
    rangeStart: day(10),
    rangeEnd: day(70),
    minNights: 3,
    country: "DE",
    subdivision: "DE-NW",
    locale: "de",
    phase: "fixed",
    fixedStart: day(41),
    fixedEnd: day(45),
    members: [
      { person: "anna", organizer: true, submitted: true, voted: true },
      { person: "hanna", submitted: true, voted: true },
      { person: "greta", submitted: true, voted: true },
    ],
  },
  {
    name: "Wanderwoche Dolomiten",
    rangeStart: day(45),
    rangeEnd: day(150),
    minNights: 6,
    preferredNights: 7,
    country: "CH",
    locale: "de",
    phase: "collecting",
    joinOpen: false,
    members: [
      { person: "felix", organizer: true },
      { person: "anna" },
      { person: "emma", submitted: true },
    ],
  },
  {
    name: "Malle 2026",
    rangeStart: day(-120),
    rangeEnd: day(-40),
    minNights: 4,
    country: "DE",
    locale: "de",
    phase: "fixed",
    fixedStart: day(-60),
    fixedEnd: day(-55),
    members: [
      { person: "anna", organizer: true, submitted: true, voted: true },
      { person: "ben", submitted: true, voted: true },
    ],
  },
];

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("begin");
  // 1. Clear previous demo data: trips with a demo member, then the demo users
  //    (cascades to sessions, accounts, memberships).
  await client.query(
    `delete from trip where id in (
       select m.trip_id from trip_member m join "user" u on u.id = m.user_id where u.email like $1)`,
    [`%${DEMO_DOMAIN}`],
  );
  await client.query(`delete from "user" where email like $1`, [`%${DEMO_DOMAIN}`]);

  // 2. People.
  const ids = new Map<string, string>();
  for (const person of PEOPLE) {
    const row = await client.query<{ id: string }>(
      `insert into "user" (name, email, email_verified, locale, country, subdivision)
       values ($1, $2, true, $3, $4, $5) returning id`,
      [
        person.name,
        `${person.key}${DEMO_DOMAIN}`,
        person.locale,
        person.country,
        person.subdivision ?? null,
      ],
    );
    ids.set(person.key, row.rows[0]?.id ?? "");
  }

  // 3. Trips with members.
  const lines: string[] = [];
  for (const [index, seed] of TRIPS.entries()) {
    const token = inviteToken();
    const id = publicId();
    const row = await client.query<{ id: string }>(
      `insert into trip (public_id, name, description, range_start, range_end, min_nights,
         preferred_nights, deadline, holiday_country, holiday_subdivision, locale, invite_token,
         join_open, phase, fixed_start, fixed_end, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now() - make_interval(hours => $17))
       returning id`,
      [
        id,
        seed.name,
        seed.description ?? null,
        seed.rangeStart,
        seed.rangeEnd,
        seed.minNights,
        seed.preferredNights ?? null,
        seed.deadline ?? null,
        seed.country,
        seed.subdivision ?? null,
        seed.locale,
        token,
        seed.joinOpen ?? true,
        seed.phase,
        seed.fixedStart ?? null,
        seed.fixedEnd ?? null,
        index,
      ],
    );
    const tripId = row.rows[0]?.id;
    for (const [position, member] of seed.members.entries()) {
      const person = PEOPLE.find((p) => p.key === member.person);
      await client.query(
        `insert into trip_member (trip_id, user_id, display_name, role, joined_at, submitted_at, voted_at)
         values ($1, $2, $3, $4, now() - make_interval(days => $5), $6, $7)`,
        [
          tripId,
          ids.get(member.person),
          member.name ?? person?.name.split(" ")[0] ?? member.person,
          member.organizer ? "organizer" : "member",
          20 - position,
          member.submitted ? new Date(Date.now() - (position + 1) * 3_600_000) : null,
          member.voted ? new Date(Date.now() - (position + 1) * 1_800_000) : null,
        ],
      );
    }
    const orga = seed.members.find((m) => m.organizer)?.person ?? "?";
    lines.push(
      `  • ${seed.name} (${seed.phase}${seed.joinOpen === false ? ", join closed" : ""}) – Orga ${orga}${DEMO_DOMAIN}\n` +
        `      trip:   ${appUrl}/trips/${id}\n      invite: ${appUrl}/i/${token}`,
    );
  }
  await client.query("commit");

  console.log(
    `[seed] ${String(PEOPLE.length)} demo people (${PEOPLE.map((p) => p.key + DEMO_DOMAIN).join(", ")})`,
  );
  console.log(
    `[seed] Sign in as anna${DEMO_DOMAIN} at ${appUrl}/login (code from Mailpit) – she is in every trip.`,
  );
  console.log(`[seed] ${String(TRIPS.length)} trips:\n${lines.join("\n")}`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
