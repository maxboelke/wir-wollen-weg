import { resolveAppEnv } from "@/lib/app-env";
import { serviceWorkerEnabled } from "@/lib/beta-config";
import { killSwitchSource, serviceWorkerSource } from "@/lib/service-worker";

export const dynamic = "force-dynamic";

/**
 * `/sw.js` (deployment.md §0.12.6): the service worker in beta/production; with the kill switch
 * `PWA_SW_ENABLED=false` – and in every other mode – a worker that deletes the app caches and
 * unregisters itself. `no-cache`, so updates and the kill switch arrive on the next start.
 */
export function GET(): Response {
  const enabled = serviceWorkerEnabled(resolveAppEnv(), process.env);
  const source = enabled
    ? serviceWorkerSource(process.env.APP_BUILD_ID || "dev")
    : killSwitchSource();
  return new Response(source, {
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-cache",
      "service-worker-allowed": "/",
    },
  });
}
