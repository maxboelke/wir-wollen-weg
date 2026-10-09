import { randomBytes } from "node:crypto";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";

/** Inserts a placeholder trip and returns its invite token. */
export async function createTrip(name: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("insert into trip (name, invite_token) values ($1, $2)", [name, token]);
  } finally {
    await client.end();
  }
  return token;
}

/**
 * Lets the re-authentication of every session of `email` run out – as if the last
 * confirmation (or the code sign-in) were more than 10 minutes ago (R-023).
 */
export async function expireReauthentication(email: string): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(
      `update verification set expires_at = now() - interval '1 minute'
        where identifier in (
          select 'reauth-' || s.id from session s join "user" u on u.id = s.user_id
           where u.email = $1)`,
      [email],
    );
  } finally {
    await client.end();
  }
}
