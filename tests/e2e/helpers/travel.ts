import pg from "pg";

// Increment 11 (F-054/F-056): DB shortcuts for the travel-details specs – markings and the
// 12-hour re-authentication. Never values (they are only entered through the UI).
const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";

async function run(sql: string, params: unknown[]): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql, params);
  } finally {
    await client.end();
  }
}

/** Gives (or takes) the marking «Bucht» of `email` in a trip – no requests are touched. */
export async function setBookerMark(tripId: string, email: string, on: boolean): Promise<void> {
  await run(
    `update trip_member set booker_since = case when $3 then now() end
      where trip_id = $1 and user_id = (select id from "user" where email = $2)`,
    [tripId, email, on],
  );
  await run(`update trip set booker_defaulted_at = coalesce(booker_defaulted_at, now()) where id = $1`, [
    tripId,
  ]);
}

/** As if the last code sign-in of every session of `email` were more than 12 hours ago. */
export async function expireTravelReauth(email: string): Promise<void> {
  await run(
    `delete from verification where identifier in (
       select 'travel-reauth-' || s.id from session s join "user" u on u.id = s.user_id where u.email = $1)`,
    [email],
  );
}
