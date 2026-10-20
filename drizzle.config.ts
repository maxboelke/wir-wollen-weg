import { defineConfig } from "drizzle-kit";

// Local development reads .env.local; CI/production pass DATABASE_URL directly. Neon (online
// preview, deployment.md §0.7) also provides DATABASE_URL_UNPOOLED – migrations use the direct
// connection when it is there (DDL outside the PgBouncer pool).
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local – fine
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      "postgres://app:app@localhost:5432/wirwollenweg",
  },
  strict: true,
  verbose: false,
});
