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
