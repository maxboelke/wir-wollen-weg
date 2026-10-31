"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { catchInstallPrompt } from "@/lib/install-prompt";
import { CACHE_PREFIX } from "@/lib/service-worker";
import { isStandalone } from "@/lib/use-standalone";

/** Back from the background after this long → refresh the page data silently (W23 C.7). */
const REFRESH_AFTER_MS = 30_000;

async function removeServiceWorkers(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key)),
    );
  }
}

/**
 * PWA plumbing in both root layouts (deployment.md §0.12.6, W23 B.3, C.7):
 * - registers `/sw.js` after `load` – only in beta/production and without the kill switch
 *   (`enabled` comes from the server); otherwise removes a worker left from earlier,
 * - catches `beforeinstallprompt` (Android) so the install guide decides the moment,
 * - installed app: after ≥ 30 s in the background the page data is refreshed silently (no
 *   pull-to-refresh) – not while a form field has focus.
 */
export function ServiceWorker({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", catchInstallPrompt);
    if ("serviceWorker" in navigator) {
      if (enabled) {
        const register = () => {
          navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
        };
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register, { once: true });
      } else {
        void removeServiceWorkers().catch(() => undefined);
      }
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", catchInstallPrompt);
    };
  }, [enabled]);

  useEffect(() => {
    if (!isStandalone()) return;
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      const typing = document.activeElement?.matches("input, textarea, select, [contenteditable]");
      if (away >= REFRESH_AFTER_MS && !typing) router.refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}

/** Sign-out / account deletion: drop the app caches on this device too (§0.12.6 Nr. 6). */
export async function clearAppCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key)),
  );
}
