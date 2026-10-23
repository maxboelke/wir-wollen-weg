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

/**
 * CSP stage 1 (deployment.md §0.9, features.md R.7 I9-04): no `script-src`/`default-src` – the
 * Next.js scripts stay untouched – but third-party images, plugins, foreign form targets and
 * framing are blocked. Global, except for the image proxy, which sends its own
 * `default-src 'none'; sandbox` (a later headers() entry with the same key would overwrite it).
 * Stage 2 (nonce-based script-src) follows before go-live G1.
 */
const CSP_STAGE_1 = [
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
/** Every path except the image proxy (`/api/stays/image`, own CSP). */
const CSP_SOURCE = "/((?!api/stays/image).*)";

const nextConfig: NextConfig = {
  // Self-hosting in Docker (docs/ops/deployment.md): the image build (OPS-3) sets
  // NEXT_OUTPUT_STANDALONE=1 and runs `node .next/standalone/server.js`.
  // Locally and in CI `pnpm start` (= `next start`) serves the regular build.
  ...(process.env.NEXT_OUTPUT_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  poweredByHeader: false,
  // next/image is not used (stay images go through our own proxy, deployment.md §0.8) – switch
  // the built-in optimiser at /_next/image off: smaller attack surface (R-075).
  images: { unoptimized: true },
  // R-072: «today» is the calendar day in the app time zone – inline it so server and client
  // agree (src/lib/dates.ts appTimeZone(), default Europe/Berlin).
  env: { APP_TIME_ZONE: process.env.APP_TIME_ZONE ?? "" },
  // Phone tests in the LAN with `pnpm dev -H 0.0.0.0` (deployment.md §0.3), e.g. "192.168.178.20".
  ...(process.env.DEV_ALLOWED_ORIGINS
    ? { allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS.split(",").map((o) => o.trim()) }
    : {}),
  // Project conventions live in CLAUDE.md – do not let `next dev` write AGENTS.md.
  agentRules: false,
  reactStrictMode: true,
  // Invite and magic-link tokens are secrets – keep their URLs out of the dev request log.
  logging: { incomingRequests: { ignore: [/^\/i\//, /^\/auth\/magic/] } },
  headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "DENY" },
      // Demo/staging/dev must never be indexed – including the public landing pages
      // (deployment.md §0.1, §0.5). Evaluated at build time (Dockerfile passes APP_ENV).
      ...(process.env.APP_ENV === "production"
        ? []
        : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
    ];
    return Promise.resolve([
      { source: "/:path*", headers: base },
      { source: CSP_SOURCE, headers: [{ key: "Content-Security-Policy", value: CSP_STAGE_1 }] },
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
