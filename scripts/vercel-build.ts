// Build of the online preview on Vercel (PRD Q25, deployment.md §0.7) – `pnpm vercel-build`,
// configured as buildCommand in vercel.json. Steps:
//   1. guard: only production deployments of `main` (branch/PR deployments would migrate the
//      shared demo database with unreviewed code) and only APP_ENV=preview,
//   2. database migrations (drizzle-kit, Neon direct connection if available),
//   3. demo data – only if no @demo.test person exists yet (data survives deployments),
//   4. `next build`.
// Runs with plain Node 24 (built-in TypeScript type stripping).
import { spawnSync } from "node:child_process";
import { resolveAppEnv } from "../src/lib/app-env.ts";

function run(label: string, command: string, args: string[]): void {
  console.log(`[vercel-build] ${label}: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    console.error(`[vercel-build] ${label} failed (exit ${String(result.status)}).`);
    process.exit(result.status ?? 1);
  }
}

const vercelEnv = process.env.VERCEL_ENV;
if (process.env.VERCEL === "1" && vercelEnv !== "production") {
  console.error(
    `[vercel-build] VERCEL_ENV=${vercelEnv ?? "?"}: only the production deployment (branch main) is built – ` +
      "branch deployments would change the shared demo database. See vercel.json git.deploymentEnabled.",
  );
  process.exit(1);
}
const appEnv = resolveAppEnv();
if (appEnv !== "preview") {
  console.error(`[vercel-build] APP_ENV=${appEnv}: this build is only for APP_ENV=preview.`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("[vercel-build] DATABASE_URL is missing (Neon integration or project settings).");
  process.exit(1);
}

run("migrations", "pnpm", ["exec", "drizzle-kit", "migrate"]);
run("demo data", "node", ["scripts/seed-demo.ts", "--if-empty"]);
run("next build", "pnpm", ["exec", "next", "build"]);
