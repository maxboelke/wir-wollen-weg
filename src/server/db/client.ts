import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { onVercel } from "@/lib/app-env";
import { serverEnv } from "../env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __wwwDb?: Database & { $client: Pool } };

/**
 * Lazily created singleton (survives hot reloads in `next dev`).
 *
 * Serverless (Vercel + Neon, deployment.md §0.7): many short-lived instances, each with its own
 * pool – so only a few connections per instance (default 3) that are closed quickly when idle,
 * against Neon's pooled endpoint (`…-pooler…`, PgBouncer in transaction mode; the app only
 * uses transaction-scoped advisory locks, which work there). TLS comes from the connection
 * string (`sslmode=require`).
 */
export function db(): Database {
  const env = serverEnv();
  const serverless = onVercel();
  globalForDb.__wwwDb ??= drizzle({
    client: new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DATABASE_POOL_MAX ?? (serverless ? 3 : 10),
      ...(serverless ? { idleTimeoutMillis: 5_000, connectionTimeoutMillis: 15_000 } : {}),
    }),
    schema,
  });
  return globalForDb.__wwwDb;
}

/** The underlying pg pool – for raw SQL scripts that need their own client (demo reset). */
export function dbPool(): Pool {
  db();
  return (globalForDb.__wwwDb as Database & { $client: Pool }).$client;
}
