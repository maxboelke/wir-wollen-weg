import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

// App-side rate limits (failed invite lookups, joins per trip and IP – F-003) are keyed on the
// client IP, which comes from `x-forwarded-for` without a proxy (dev/CI). Each run gets its own
// documentation address (RFC 5737), so repeated local runs never share a bucket; specs that
// test the limits set their own address.
const runIp = `198.51.100.${String(1 + Math.floor(Math.random() * 254))}`;

// Local runs: read DATABASE_URL etc. from .env.local (CI sets them in the workflow).
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local
}

// Optional: use a preinstalled Chromium (e.g. sandboxed sessions without browser downloads).
const chromiumPath = process.env.E2E_CHROMIUM_PATH;
const chromiumLaunch = chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {};

// Projects per tech-stack.md §2.4. Locally the WebKit project can be skipped with
// E2E_PROJECTS=desktop-chromium,mobile-chromium if WebKit is not installed.
const selected = process.env.E2E_PROJECTS?.split(",").map((p) => p.trim());
const projects = [
  { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], ...chromiumLaunch } },
  { name: "mobile-chromium", use: { ...devices["Pixel 7"], ...chromiumLaunch } },
  { name: "mobile-webkit", use: { ...devices["iPhone 15"] } },
].filter((project) => !selected || selected.includes(project.name));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  ...(isCI ? { workers: 2 } : {}),
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    extraHTTPHeaders: { "x-forwarded-for": runIp },
  },
  projects,
  webServer: {
    // CI builds first (`pnpm build`), then runs the production server.
    command: isCI ? "pnpm start" : "pnpm dev",
    url: `${baseURL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      PORT: String(PORT),
      // E2E requests many codes from one IP; rate limits get their own tests later.
      RATE_LIMIT_ENABLED: "false",
    },
  },
});
