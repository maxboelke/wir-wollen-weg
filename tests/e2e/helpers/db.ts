import { randomBytes, randomInt } from "node:crypto";
import pg from "pg";
import { deriveEmailLimitKey, hmacHex } from "../../../src/server/auth/email-limit-key";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";

async function withClient<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const publicId = () => Array.from({ length: 10 }, () => ALPHABET.charAt(randomInt(32))).join("");

/** ISO date `days` from today (UTC). */
export function isoDay(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function insertUser(client: pg.Client, name: string, email?: string): Promise<string> {
  const row = await client.query<{ id: string }>(
    `insert into "user" (name, email, email_verified) values ($1, $2, true) returning id`,
    [name, email ?? `seed-${randomBytes(6).toString("hex")}@example.org`],
  );
  return row.rows[0]?.id ?? "";
}

export interface SeededTrip {
  token: string;
  publicId: string;
  tripId: string;
}

export interface TripOptions {
  /** Organiser display name (default «Lena Berg» → «Lena» on the invite card). */
  organizer?: string;
  /** Additional synthetic members (names «Member 1…n»). */
  extraMembers?: number;
  joinOpen?: boolean;
  phase?: "collecting" | "voting" | "fixed";
  description?: string;
  /** Search range (default: in 30–90 days). */
  rangeStart?: string;
  rangeEnd?: string;
  /** Holiday region of the trip (default DE nationwide). */
  holidayCountry?: string;
  holidaySubdivision?: string;
}

/** Inserts a trip with an organiser (and optional members); returns token and ids. */
export async function seedTrip(name: string, options: TripOptions = {}): Promise<SeededTrip> {
  return withClient(async (client) => {
    const token = randomBytes(32).toString("base64url");
    const id = publicId();
    const fixed = options.phase === "fixed";
    const trip = await client.query<{ id: string }>(
      `insert into trip (public_id, name, description, range_start, range_end, min_nights,
         preferred_nights, holiday_country, holiday_subdivision, locale, invite_token, join_open,
         phase, fixed_start, fixed_end)
       values ($1, $2, $3, $4, $5, 4, 5, $11, $12, 'en', $6, $7, $8, $9, $10) returning id`,
      [
        id,
        name,
        options.description ?? null,
        options.rangeStart ?? isoDay(30),
        options.rangeEnd ?? isoDay(90),
        token,
        options.joinOpen ?? true,
        options.phase ?? "collecting",
        fixed ? isoDay(40) : null,
        fixed ? isoDay(45) : null,
        options.holidayCountry ?? "DE",
        options.holidaySubdivision ?? null,
      ],
    );
    const tripId = trip.rows[0]?.id ?? "";
    const organizer = options.organizer ?? "Lena Berg";
    const orgaId = await insertUser(client, organizer);
    await client.query(
      `insert into trip_member (trip_id, user_id, display_name, role) values ($1, $2, $3, 'organizer')`,
      [tripId, orgaId, organizer],
    );
    await addMembers(client, tripId, options.extraMembers ?? 0);
    return { token, publicId: id, tripId };
  });
}

async function addMembers(client: pg.Client, tripId: string, count: number, offset = 0) {
  for (let i = 0; i < count; i++) {
    const name = `Member ${String(offset + i + 1)}`;
    const userId = await insertUser(client, name);
    await client.query(
      `insert into trip_member (trip_id, user_id, display_name) values ($1, $2, $3)`,
      [tripId, userId, name],
    );
  }
}

/** Adds synthetic members to a trip (e.g. to reach the 30-member limit). */
export async function addTripMembers(tripId: string, count: number): Promise<void> {
  await withClient(async (client) => {
    const existing = await client.query<{ n: number }>(
      "select count(*)::int as n from trip_member where trip_id = $1",
      [tripId],
    );
    await addMembers(client, tripId, count, 100 + (existing.rows[0]?.n ?? 0));
  });
}

/** Kept for older specs: a trip with an organiser, returns its invite token. */
export async function createTrip(name: string): Promise<string> {
  return (await seedTrip(name)).token;
}

export async function memberNames(publicIdValue: string): Promise<string[]> {
  return withClient(async (client) => {
    const rows = await client.query<{ display_name: string }>(
      `select m.display_name from trip_member m join trip t on t.id = m.trip_id
        where t.public_id = $1 order by m.joined_at`,
      [publicIdValue],
    );
    return rows.rows.map((row) => row.display_name);
  });
}

export async function tripRow(publicIdValue: string) {
  return withClient(async (client) => {
    const rows = await client.query<{
      id: string;
      join_open: boolean;
      invite_token: string;
      name: string;
    }>("select id, join_open, invite_token, name from trip where public_id = $1", [publicIdValue]);
    return rows.rows[0];
  });
}

export async function organizerName(publicIdValue: string): Promise<string | undefined> {
  return withClient(async (client) => {
    const rows = await client.query<{ display_name: string }>(
      `select m.display_name from trip_member m join trip t on t.id = m.trip_id
        where t.public_id = $1 and m.role = 'organizer'`,
      [publicIdValue],
    );
    return rows.rows[0]?.display_name;
  });
}

/** Makes an existing account a member of a trip (bypassing the invite). */
export async function addAccountToTrip(tripId: string, email: string, displayName: string) {
  await withClient(async (client) => {
    await client.query(
      `insert into trip_member (trip_id, user_id, display_name)
       select $1, id, $3 from "user" where email = $2`,
      [tripId, email, displayName],
    );
  });
}

/**
 * Lets the re-authentication of every session of `email` run out – as if the last
 * confirmation (or the code sign-in) were more than 10 minutes ago (R-023).
 */
export async function expireReauthentication(email: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `update verification set expires_at = now() - interval '1 minute'
        where identifier in (
          select 'reauth-' || s.id from session s join "user" u on u.id = s.user_id
           where u.email = $1)`,
      [email],
    );
  });
}

/** HMAC key of an app rate-limit subject – same derivation as src/server/rate-limit.ts. */
function limitKey(subject: string): string {
  return hmacHex(
    deriveEmailLimitKey({
      appEnv: process.env.APP_ENV || undefined,
      secret: process.env.BETTER_AUTH_SECRET || undefined,
    }),
    `app-limit:${subject}`,
  );
}

/**
 * Pre-fills the join limit of one trip for one client subject (IPv4 address or IPv6 /64
 * network such as «2001:db8:1:2::/64», R-036) – as if `count` people had joined from there
 * within the hour.
 */
export async function fillJoinLimit(tripId: string, subject: string, count: number): Promise<void> {
  const key = limitKey(`${tripId}:${subject}`);
  await withClient(async (client) => {
    for (let i = 0; i < count; i++) {
      await client.query("insert into rate_limit_event (key, kind) values ($1, 'join')", [key]);
    }
  });
}

/** Number of recorded events of one kind for one subject (e.g. invite misses, R-036). */
export async function limitEventCount(kind: string, subject: string): Promise<number> {
  return withClient(async (client) => {
    const rows = await client.query<{ n: number }>(
      "select count(*)::int as n from rate_limit_event where key = $1 and kind = $2",
      [limitKey(subject), kind],
    );
    return rows.rows[0]?.n ?? 0;
  });
}

/**
 * Seeds a trip with an organiser and one member and renames both in two parallel
 * transactions directly in the database (bypassing the app check). Returns "ok" or the
 * PostgreSQL error code per rename – proves the unique index (trip_id, lower(name)) (R-039).
 */
export async function renameInParallel(names: [string, string]): Promise<string[]> {
  const seeded = await seedTrip(`Race ${String(Date.now())}`, { extraMembers: 1 });
  const userIds = await withClient(async (client) => {
    const rows = await client.query<{ user_id: string }>(
      "select user_id from trip_member where trip_id = $1 order by joined_at",
      [seeded.tripId],
    );
    return rows.rows.map((row) => row.user_id);
  });
  const a = new pg.Client({ connectionString: databaseUrl });
  const b = new pg.Client({ connectionString: databaseUrl });
  await Promise.all([a.connect(), b.connect()]);
  try {
    const clients = [a, b];
    await Promise.all(clients.map((client) => client.query("begin")));
    const updates = clients.map((client, i) =>
      client
        .query("update trip_member set display_name = $1 where trip_id = $2 and user_id = $3", [
          names[i],
          seeded.tripId,
          userIds[i],
        ])
        .then(() => client.query("commit"))
        .then(() => "ok")
        .catch(async (error: unknown) => {
          await client.query("rollback");
          return String((error as { code?: unknown }).code);
        }),
    );
    return await Promise.all(updates);
  } finally {
    await Promise.all([a.end(), b.end()]);
  }
}

/** Personal invite token of an open placeholder (F-007), by its name. */
export async function placeholderToken(
  publicIdValue: string,
  name: string,
): Promise<string | undefined> {
  return withClient(async (client) => {
    const rows = await client.query<{ invite_token: string }>(
      `select p.invite_token from trip_placeholder p join trip t on t.id = p.trip_id
        where t.public_id = $1 and p.display_name = $2 and p.claimed_at is null`,
      [publicIdValue, name],
    );
    return rows.rows[0]?.invite_token;
  });
}

/** Placeholders of a trip with their claim state. */
export async function placeholderRows(publicIdValue: string) {
  return withClient(async (client) => {
    const rows = await client.query<{ display_name: string; claimed: boolean }>(
      `select p.display_name, p.claimed_at is not null as claimed
         from trip_placeholder p join trip t on t.id = p.trip_id
        where t.public_id = $1 order by p.created_at`,
      [publicIdValue],
    );
    return rows.rows;
  });
}

/** Stored days of one member (by account e-mail) – F-005. */
export async function availabilityOf(
  publicIdValue: string,
  email: string,
): Promise<Record<string, string>> {
  return withClient(async (client) => {
    const rows = await client.query<{ day: string; state: string }>(
      `select to_char(a.day, 'YYYY-MM-DD') as day, a.state
         from availability a join trip t on t.id = a.trip_id join "user" u on u.id = a.user_id
        where t.public_id = $1 and u.email = $2 order by a.day`,
      [publicIdValue, email],
    );
    return Object.fromEntries(rows.rows.map((row) => [row.day, row.state]));
  });
}

/** Membership status of an account (F-007). */
export async function memberStatus(publicIdValue: string, email: string) {
  return withClient(async (client) => {
    const rows = await client.query<{ submitted: boolean; comment: string | null }>(
      `select m.submitted_at is not null as submitted, m.comment
         from trip_member m join trip t on t.id = m.trip_id join "user" u on u.id = m.user_id
        where t.public_id = $1 and u.email = $2`,
      [publicIdValue, email],
    );
    return rows.rows[0];
  });
}

/** Stores days of one member directly (e.g. marks on days that are already past) – F-005. */
export async function setAvailability(
  tripId: string,
  email: string,
  entries: Record<string, "no" | "maybe">,
): Promise<void> {
  await withClient(async (client) => {
    for (const [day, state] of Object.entries(entries)) {
      await client.query(
        `insert into availability (trip_id, user_id, day, state)
         select $1, id, $3::date, $4 from "user" where email = $2`,
        [tripId, email, day, state],
      );
    }
  });
}

/** The organiser fixes the dates (phase 3) – e.g. while someone still has «Meine Tage» open. */
export async function fixTripDates(tripId: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `update trip set phase = 'fixed', fixed_start = $2, fixed_end = $3 where id = $1`,
      [tripId, isoDay(40), isoDay(45)],
    );
  });
}

/**
 * Adds a synthetic member with marked days (F-005); `submitted` false keeps them as a draft
 * (must never count in the group calendar, F-008 U-4). Days are ISO dates.
 */
export async function addMemberWithDays(
  tripId: string,
  name: string,
  days: { no?: string[]; maybe?: string[] },
  submitted = true,
): Promise<void> {
  await withClient(async (client) => {
    const userId = await insertUser(client, name);
    await client.query(
      `insert into trip_member (trip_id, user_id, display_name, submitted_at, availability_updated_at)
       values ($1, $2, $3, $4, $4)`,
      [tripId, userId, name, submitted ? new Date() : null],
    );
    for (const [state, list] of [
      ["no", days.no ?? []],
      ["maybe", days.maybe ?? []],
    ] as const) {
      for (const day of list) {
        await client.query(
          `insert into availability (trip_id, user_id, day, state) values ($1, $2, $3, $4)`,
          [tripId, userId, day, state],
        );
      }
    }
  });
}

/** An open placeholder (F-007) – counts as «noch offen» in the progress (Q20). */
export async function addPlaceholder(tripId: string, name: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `insert into trip_placeholder (trip_id, display_name, invite_token) values ($1, $2, $3)`,
      [tripId, name, randomBytes(32).toString("base64url")],
    );
  });
}

// ---------------------------------------------------------------------------
// Increment 5: vote (F-010, F-011, F-012)
// ---------------------------------------------------------------------------

/** Makes an account the organiser of a trip (the seeded organiser becomes a member). */
export async function makeOrganizer(tripId: string, email: string): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      `update trip_member set role = 'member' where trip_id = $1 and role = 'organizer'`,
      [tripId],
    );
    await client.query(
      `update trip_member set role = 'organizer'
        where trip_id = $1 and user_id = (select id from "user" where email = $2)`,
      [tripId, email],
    );
  });
}

/**
 * Starts a vote directly (phase «voting») with the given periods; `fixed` additionally fixes
 * the first option (phase 3). Returns the option ids in creation order.
 */
export async function seedPoll(
  tripId: string,
  periods: [string, string][],
  options: { fixed?: boolean; deadline?: string } = {},
): Promise<string[]> {
  return withClient(async (client) => {
    const ids: string[] = [];
    for (const [index, [start, end]] of periods.entries()) {
      const row = await client.query<{ id: string }>(
        `insert into poll_option (trip_id, start_date, end_date, created_at)
         values ($1, $2, $3, now() - make_interval(secs => $4)) returning id`,
        [tripId, start, end, 100 - index],
      );
      ids.push(row.rows[0]?.id ?? "");
    }
    const [first] = periods;
    await client.query(
      `update trip set phase = $2, poll_deadline = $3, poll_started_at = now(),
         fixed_start = $4, fixed_end = $5, fixed_at = case when $2 = 'fixed' then now() end
       where id = $1`,
      [
        tripId,
        options.fixed ? "fixed" : "voting",
        options.deadline ?? null,
        options.fixed ? (first?.[0] ?? null) : null,
        options.fixed ? (first?.[1] ?? null) : null,
      ],
    );
    return ids;
  });
}

/** A synthetic member with answers per option (null = no answer); «abgestimmt» if complete. */
export async function addVoter(
  tripId: string,
  name: string,
  optionIds: string[],
  choices: ("yes" | "maybe" | "no" | null)[],
): Promise<void> {
  await withClient(async (client) => {
    const userId = await insertUser(client, name);
    const complete = choices.length === optionIds.length && choices.every((c) => c !== null);
    await client.query(
      `insert into trip_member (trip_id, user_id, display_name, submitted_at, voted_at)
       values ($1, $2, $3, now(), $4)`,
      [tripId, userId, name, complete ? new Date() : null],
    );
    for (const [index, choice] of choices.entries()) {
      if (!choice) continue;
      await client.query(
        `insert into poll_vote (option_id, trip_id, user_id, choice) values ($1, $2, $3, $4)`,
        [optionIds[index], tripId, userId, choice],
      );
    }
  });
}

export async function pollState(publicIdValue: string) {
  return withClient(async (client) => {
    const rows = await client.query<{
      phase: string;
      fixed_start: string | null;
      fixed_end: string | null;
      poll_deadline: string | null;
      options: number;
    }>(
      `select phase, fixed_start::text, fixed_end::text, poll_deadline::text,
         (select count(*)::int from poll_option o where o.trip_id = t.id) as options
         from trip t where public_id = $1`,
      [publicIdValue],
    );
    return rows.rows[0];
  });
}

/** Own answers of an account: { "start/end": choice }. */
export async function votesOf(publicIdValue: string, email: string) {
  return withClient(async (client) => {
    const rows = await client.query<{ key: string; choice: string }>(
      `select o.start_date::text || '/' || o.end_date::text as key, v.choice
         from poll_vote v join poll_option o on o.id = v.option_id
         join trip t on t.id = v.trip_id join "user" u on u.id = v.user_id
        where t.public_id = $1 and u.email = $2`,
      [publicIdValue, email],
    );
    return Object.fromEntries(rows.rows.map((row) => [row.key, row.choice]));
  });
}

export async function memberVoteStatus(publicIdValue: string, email: string) {
  return withClient(async (client) => {
    const rows = await client.query<{ voted: boolean; celebrated_for: string | null }>(
      `select m.voted_at is not null as voted, m.celebrated_for
         from trip_member m join trip t on t.id = m.trip_id join "user" u on u.id = m.user_id
        where t.public_id = $1 and u.email = $2`,
      [publicIdValue, email],
    );
    return rows.rows[0];
  });
}
