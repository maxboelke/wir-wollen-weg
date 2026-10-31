// Build on Vercel – `pnpm vercel-build`, configured as buildCommand in vercel.json. Two
// projects use it: the online preview (APP_ENV=preview, branch `main`, PRD Q25, deployment.md
// §0.7) and the friends beta (APP_ENV=beta, branch `beta`, deployment.md §0.12.2). Steps:
//   1. guard: only production deployments (branch/PR deployments would migrate the database
//      with unreviewed code), only APP_ENV=preview|beta, and the beta only from branch `beta`,
//   2. database migrations (drizzle-kit, Neon direct connection if available),
//   3. demo data – preview only, and only if no @demo.test person exists yet (never in beta:
//      real people, no demo persons),
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
if (appEnv !== "preview" && appEnv !== "beta") {
  console.error(
    `[vercel-build] APP_ENV=${appEnv}: this build is only for APP_ENV=preview or APP_ENV=beta.`,
  );
  process.exit(1);
}
const branch = process.env.VERCEL_GIT_COMMIT_REF;
if (appEnv === "beta" && process.env.VERCEL === "1" && branch !== "beta") {
  console.error(
    `[vercel-build] APP_ENV=beta: this build is only for branch beta (got ${branch ?? "?"}) – deployment.md §0.12.2.`,
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("[vercel-build] DATABASE_URL is missing (Neon integration or project settings).");
  process.exit(1);
}

run("migrations", "pnpm", ["exec", "drizzle-kit", "migrate"]);
if (appEnv === "preview") run("demo data", "node", ["scripts/seed-demo.ts", "--if-empty"]);
run("next build", "pnpm", ["exec", "next", "build"]);
