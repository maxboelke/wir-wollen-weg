import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { serverEnv } from "../env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __wwwDb?: Database };

/** Lazily created singleton (survives hot reloads in `next dev`). */
export function db(): Database {
  globalForDb.__wwwDb ??= drizzle({
    client: new Pool({ connectionString: serverEnv().DATABASE_URL, max: 10 }),
    schema,
  });
  return globalForDb.__wwwDb;
}
