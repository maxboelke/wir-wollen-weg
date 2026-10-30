/**
 * Service worker of the installed app (deployment.md §0.12.6, W23 C.2) – generated as a string so
 * the build id (cache name) and the kill switch come from the server. Deliberately minimal: an
 * offline page instead of a white screen, nothing personal in any cache.
 *
 * - install: precache ONLY `/offline` and its static assets (logo, fonts),
 * - navigations: network first, on network failure the cached `/offline`,
 * - `/_next/static/*` (hashed, immutable, no personal data): cache first,
 * - everything else – app HTML, RSC, Server Actions, `/api`, `/auth`, `/i`, `/trips`,
 *   `/account`, downloads – is neither answered nor cached by the worker.
 */

/** Files cached at install time (all free of personal data). */
export const PRECACHE_URLS = [
  "/offline",
  "/favicon.svg",
  "/fonts/figtree-latin.woff2",
  "/fonts/plus-jakarta-sans-latin.woff2",
] as const;

/** Every cache of the app starts with this prefix (cleanup, kill switch). */
export const CACHE_PREFIX = "ww-";

export function cacheName(buildId: string): string {
  return `${CACHE_PREFIX}shell-${buildId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) || "dev"}`;
}

/** The active worker. */
export function serviceWorkerSource(buildId: string): string {
  return `// Wir wollen weg – service worker (deployment.md §0.12.6). No personal data in any cache.
const CACHE = ${JSON.stringify(cacheName(buildId))};
const PREFIX = ${JSON.stringify(CACHE_PREFIX)};
const PRECACHE = ${JSON.stringify(PRECACHE_URLS)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    // Network first; the cached offline page only when the network fails.
    event.respondWith(
      fetch(request).catch(() =>
        caches.open(CACHE).then((cache) => cache.match("/offline")).then(
          (page) => page || Response.error(),
        ),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then(
          (hit) =>
            hit ||
            fetch(request).then((response) => {
              if (response.ok && response.type === "basic") cache.put(request, response.clone());
              return response;
            }),
        ),
      ),
    );
    return;
  }

  if (PRECACHE.includes(url.pathname) && url.search === "") {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(url.pathname).then((hit) => hit || fetch(request)),
      ),
    );
  }
  // Everything else is not touched: HTML, RSC, Server Actions, /api, /auth, /i, /trips, …
});
`;
}

/** Kill switch `PWA_SW_ENABLED=false` (§0.12.6 Nr. 7): delete all app caches, unregister. */
export function killSwitchSource(): string {
  return `// Wir wollen weg – service worker switched off (PWA_SW_ENABLED=false).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(${JSON.stringify(CACHE_PREFIX)})).map((key) => caches.delete(key))))
      .then(() => self.registration.unregister()),
  );
});
`;
}
