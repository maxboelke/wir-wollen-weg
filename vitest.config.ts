import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Server modules may be unit-tested in Node (the marker only guards client bundles).
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    // Database tests need PostgreSQL – `pnpm test:db` (vitest.db.config.ts, CI job E2E).
    exclude: ["**/node_modules/**", "**/*.db.test.ts"],
    environment: "node",
  },
});
