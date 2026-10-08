import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Routes that belong to the signed-in app or carry tokens – never indexed. */
const PRIVATE_ROUTES = [
  "/trips/:path*",
  "/i/:path*",
  "/login/:path*",
  "/auth/:path*",
  "/account/:path*",
];
/**
 * Routes whose URL contains a secret token – never leak it via the Referer header to other
 * sites. `same-origin` instead of `no-referrer` (sitemap §4): with `no-referrer` browsers send
 * `Origin: null` on form POSTs, which breaks the CSRF origin checks of Server Actions and
 * Better Auth (found by the E2E spike, see docs/ops/spike-auth.md).
 */
const TOKEN_ROUTES = ["/i/:path*", "/auth/:path*"];

const nextConfig: NextConfig = {
  // Self-hosting in Docker (docs/ops/deployment.md): the image build (OPS-3) sets
  // NEXT_OUTPUT_STANDALONE=1 and runs `node .next/standalone/server.js`.
  // Locally and in CI `pnpm start` (= `next start`) serves the regular build.
  ...(process.env.NEXT_OUTPUT_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  poweredByHeader: false,
  // Phone tests in the LAN with `pnpm dev -H 0.0.0.0` (deployment.md §0.3), e.g. "192.168.178.20".
  ...(process.env.DEV_ALLOWED_ORIGINS
    ? { allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS.split(",").map((o) => o.trim()) }
    : {}),
  // Project conventions live in CLAUDE.md – do not let `next dev` write AGENTS.md.
  agentRules: false,
  reactStrictMode: true,
  headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    return Promise.resolve([
      { source: "/:path*", headers: base },
      ...PRIVATE_ROUTES.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
      ...TOKEN_ROUTES.map((source) => ({
        source,
        headers: [{ key: "Referrer-Policy", value: "same-origin" }],
      })),
    ]);
  },
};

export default withNextIntl(nextConfig);
