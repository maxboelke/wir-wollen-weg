import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Database tests (`*.db.test.ts`): need PostgreSQL with all migrations applied – locally
// `pnpm dev:services && pnpm db:migrate`, in CI the E2E job (service container). Run with
// `pnpm test:db`. One file at a time: the tests share the database.
try {
  process.loadEnvFile(".env.local");
} catch {
  // CI passes DATABASE_URL directly
}

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.db.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
