import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/** Exit code of the Ignored Build Step: 0 = skip, 1 = build (deployment.md §0.12.2). */
function decide(env: Record<string, string>): number | null {
  const base: NodeJS.ProcessEnv = { NODE_ENV: "test" };
  for (const [name, value] of Object.entries(process.env)) {
    if (!name.startsWith("VERCEL") && name !== "APP_ENV") base[name] = value;
  }
  const result = spawnSync(process.execPath, ["scripts/vercel-ignore.ts"], {
    env: { ...base, VERCEL: "1", ...env },
    encoding: "utf8",
    timeout: 20_000,
  });
  return result.status;
}

describe("vercel-ignore (deployment.md §0.12.2)", () => {
  it("each project builds only the production deployment of its own branch", () => {
    const production = { VERCEL_ENV: "production" };
    expect(decide({ ...production, APP_ENV: "beta", VERCEL_GIT_COMMIT_REF: "beta" })).toBe(1);
    expect(decide({ ...production, APP_ENV: "beta", VERCEL_GIT_COMMIT_REF: "main" })).toBe(0);
    expect(decide({ ...production, APP_ENV: "preview", VERCEL_GIT_COMMIT_REF: "main" })).toBe(1);
    expect(decide({ ...production, APP_ENV: "preview", VERCEL_GIT_COMMIT_REF: "beta" })).toBe(0);
  });

  it("skips branch deployments instead of failing them (APP_ENV only set for Production)", () => {
    // Beta project, push to main = preview deployment without APP_ENV → would default to
    // preview, match «main» and then fail in vercel-build.
    expect(decide({ VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "main" })).toBe(0);
    expect(decide({ VERCEL_ENV: "preview", APP_ENV: "beta", VERCEL_GIT_COMMIT_REF: "beta" })).toBe(
      0,
    );
  });
});
