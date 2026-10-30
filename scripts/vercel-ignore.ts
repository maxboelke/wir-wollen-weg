// Vercel «Ignored Build Step» (vercel.json ignoreCommand, deployment.md §0.12.2 Nr. 2): both
// Vercel projects – online preview (APP_ENV=preview) and friends beta (APP_ENV=beta) – are
// connected to the same repository. Each builds only its own branch; every other push is
// skipped instead of producing a failing deployment.
//   exit 0 = skip the build · exit 1 = build
// Runs with plain Node 24 (built-in TypeScript type stripping).
import { branchForAppEnv, resolveAppEnv } from "../src/lib/app-env.ts";

const appEnv = resolveAppEnv();
const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "";
const wanted = branchForAppEnv(appEnv);

if (wanted && branch !== wanted) {
  console.log(`[vercel-ignore] skipped: branch ${branch || "?"} – this project builds ${wanted}`);
  process.exit(0);
}
console.log(`[vercel-ignore] building branch ${branch || "?"} (APP_ENV=${appEnv})`);
process.exit(1);
