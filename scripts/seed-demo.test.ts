import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("seed-demo guard (deployment.md §0.12.2 Nr. 4)", () => {
  it.each(["beta", "production", "staging"])(
    "refuses APP_ENV=%s before touching a database",
    (mode) => {
      const result = spawnSync(process.execPath, ["scripts/seed-demo.ts"], {
        env: {
          ...process.env,
          APP_ENV: mode,
          DATABASE_URL: "postgres://nobody@127.0.0.1:1/x",
        },
        encoding: "utf8",
        timeout: 20_000,
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`refusing to run with APP_ENV=${mode}`);
    },
  );
});
