import { describe, expect, it } from "vitest";
import { PRECACHE_URLS, cacheName, killSwitchSource, serviceWorkerSource } from "./service-worker";

describe("service worker source (deployment.md §0.12.6)", () => {
  const source = serviceWorkerSource("abc123");

  it("precaches only the offline page and its static assets", () => {
    expect(PRECACHE_URLS).toEqual([
      "/offline",
      "/favicon.svg",
      "/fonts/figtree-latin.woff2",
      "/fonts/plus-jakarta-sans-latin.woff2",
    ]);
    expect(source).toContain(JSON.stringify(cacheName("abc123")));
    expect(cacheName("abc123")).toBe("ww-shell-abc123");
    expect(cacheName("../x y")).toBe("ww-shell-xy");
  });

  it("touches only GET, same origin, navigations (network first) and /_next/static", () => {
    expect(source).toContain('request.method !== "GET"');
    expect(source).toContain("url.origin !== self.location.origin");
    expect(source).toContain('request.mode === "navigate"');
    expect(source).toContain('"/_next/static/"');
    // Only the static branch writes into the cache.
    expect(source.match(/cache\.put/g)).toHaveLength(1);
    expect(source).not.toMatch(/\/api|\/trips|\/auth|_rsc/);
  });

  it("kill switch deletes all ww- caches and unregisters", () => {
    const kill = killSwitchSource();
    expect(kill).toContain("caches.delete");
    expect(kill).toContain("self.registration.unregister()");
    expect(kill).not.toContain('addEventListener("fetch"');
  });
});
