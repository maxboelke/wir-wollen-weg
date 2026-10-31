import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;
/** Token of POST /api/internal/retention in E2E runs (tests/e2e/increment-6-*.spec.ts). */
const E2E_RETENTION_TOKEN = "e2e-only-retention-token-0123456789abcdef";

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

// Online preview (PRD Q25, deployment.md §0.7): a second production server with APP_ENV=preview
// (Basic Auth, demo inbox) on its own port – tests/e2e/preview.spec.ts. Needs a build, so it
// runs in CI (`pnpm build` first) or locally with E2E_PREVIEW=1 after `pnpm build`.
const PREVIEW_PORT = Number(process.env.E2E_PREVIEW_PORT ?? 3100);
const previewEnabled = isCI || process.env.E2E_PREVIEW === "1";
/** Test-only values (not secrets) – repeated in tests/e2e/preview.spec.ts. */
const E2E_PREVIEW = {
  baseURL: `http://localhost:${String(PREVIEW_PORT)}`,
  password: "e2e-preview-password",
  cronSecret: "e2e-only-cron-secret-0123456789abcdef0123",
} as const;
const PREVIEW_SPEC = /preview\.spec\.ts/;

// Friends beta (Gate G0, deployment.md §0.12.4 «Tests»): two more servers of the same build with
// APP_ENV=beta and their own database (like the real beta). «beta» = normal configuration,
// «beta-strict» = kill switches on (BETA_INVITE_SIGNUP=false, PWA_SW_ENABLED=false) and an
// account limit of 1 («Beta voll»). Mails go to Mailpit via the test-only exception
// E2E_ALLOW_LOCAL_SMTP (effective only with CI set). Runs in CI or with E2E_BETA=1.
const betaEnabled = isCI || process.env.E2E_BETA === "1";
const BETA_PORT = Number(process.env.E2E_BETA_PORT ?? 3200);
const BETA_STRICT_PORT = BETA_PORT + 1;
const mainDatabase = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/wirwollenweg";
/** Test-only values (not secrets) – repeated in tests/e2e/beta.spec.ts. */
const E2E_BETA = {
  baseURL: `http://localhost:${String(BETA_PORT)}`,
  strictURL: `http://localhost:${String(BETA_STRICT_PORT)}`,
  codes: "E2E-Beta-Code-2026,Alter-Beta-Code-2025",
  database: (() => {
    const url = new URL(mainDatabase);
    url.pathname = `${url.pathname}_beta`;
    return url.toString();
  })(),
} as const;
const BETA_SPEC = /beta\.spec\.ts/;
const ONLY_MAIN = [PREVIEW_SPEC, BETA_SPEC];

function betaServerEnv(port: number, extra: Record<string, string>): Record<string, string> {
  const origin = `http://localhost:${String(port)}`;
  return {
    PORT: String(port),
    APP_ENV: "beta",
    // https base URL on the same host:port (canonical-host rule) – Chromium keeps `Secure`
    // cookies on http://localhost.
    APP_URL: `https://localhost:${String(port)}`,
    BETTER_AUTH_URL: `https://localhost:${String(port)}`,
    AUTH_TRUSTED_ORIGINS: origin,
    DATABASE_URL: E2E_BETA.database,
    MAIL_TRANSPORT: "smtp",
    SMTP_HOST: "localhost",
    SMTP_PORT: "1025",
    SMTP_SECURE: "false",
    MAIL_FROM: "login@mail.example.org",
    E2E_ALLOW_LOCAL_SMTP: "1",
    CI: "true",
    BETA_ACCESS_CODES: E2E_BETA.codes,
    LEGAL_OPERATOR_NAME: "Erika Beta",
    CONTACT_EMAIL: "kontakt@wirwollenweg.de",
    FEEDBACK_WHATSAPP_NUMBER: "4915100000000",
    FEEDBACK_EMAIL: "feedback@wirwollenweg.de",
    CRON_SECRET: "e2e-only-beta-cron-secret-0123456789abcdef",
    TRAVEL_DATA_ENABLED: "false",
    ...extra,
  };
}

// Projects per tech-stack.md §2.4. Locally the WebKit project can be skipped with
// E2E_PROJECTS=desktop-chromium,mobile-chromium if WebKit is not installed.
const selected = process.env.E2E_PROJECTS?.split(",").map((p) => p.trim());
const projects = [
  {
    name: "desktop-chromium",
    testIgnore: ONLY_MAIN,
    use: { ...devices["Desktop Chrome"], ...chromiumLaunch },
  },
  {
    name: "mobile-chromium",
    testIgnore: ONLY_MAIN,
    use: { ...devices["Pixel 7"], ...chromiumLaunch },
  },
  { name: "mobile-webkit", testIgnore: ONLY_MAIN, use: { ...devices["iPhone 15"] } },
  ...(previewEnabled
    ? [
        {
          name: "preview-chromium",
          testMatch: PREVIEW_SPEC,
          use: { ...devices["Pixel 7"], ...chromiumLaunch, baseURL: E2E_PREVIEW.baseURL },
        },
      ]
    : []),
  ...(betaEnabled
    ? [
        {
          name: "beta-chromium",
          testMatch: BETA_SPEC,
          use: { ...devices["Pixel 7"], ...chromiumLaunch, baseURL: E2E_BETA.baseURL },
        },
      ]
    : []),
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
  webServer: [
    {
      // CI builds first (`pnpm build`), then runs the production server.
      command: isCI ? "pnpm start" : "pnpm dev",
      url: `${baseURL}/api/health`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      env: {
        PORT: String(PORT),
        // E2E requests many codes from one IP; rate limits get their own tests later.
        RATE_LIMIT_ENABLED: "false",
        // Retention job endpoint (F-013/F-043) – test-only token, not a secret.
        RETENTION_TOKEN: E2E_RETENTION_TOKEN,
      },
    },
    ...(previewEnabled
      ? [
          {
            // Same build, run like the Vercel preview: https base URL (cookies with `Secure` –
            // Chromium accepts them on http://localhost), Basic Auth, mails into the demo inbox.
            command: "pnpm start",
            url: `${E2E_PREVIEW.baseURL}/api/health`,
            reuseExistingServer: !isCI,
            timeout: 120_000,
            env: {
              PORT: String(PREVIEW_PORT),
              APP_ENV: "preview",
              APP_URL: "https://vorschau.example",
              BETTER_AUTH_URL: "https://vorschau.example",
              AUTH_TRUSTED_ORIGINS: E2E_PREVIEW.baseURL,
              PREVIEW_ACCESS_PASSWORD: E2E_PREVIEW.password,
              MAIL_TRANSPORT: "inbox",
              CRON_SECRET: E2E_PREVIEW.cronSecret,
              RATE_LIMIT_ENABLED: "false",
            },
          },
        ]
      : []),
    ...(betaEnabled
      ? [
          {
            // Own database, created and migrated before the start.
            command: `node scripts/e2e-beta-db.ts ${E2E_BETA.database} && pnpm start`,
            url: `${E2E_BETA.baseURL}/api/health`,
            reuseExistingServer: !isCI,
            timeout: 180_000,
            env: betaServerEnv(BETA_PORT, {}),
          },
          {
            command: `node scripts/e2e-beta-db.ts ${E2E_BETA.database} && pnpm start`,
            url: `${E2E_BETA.strictURL}/api/health`,
            reuseExistingServer: !isCI,
            timeout: 180_000,
            env: betaServerEnv(BETA_STRICT_PORT, {
              BETA_INVITE_SIGNUP: "false",
              PWA_SW_ENABLED: "false",
              BETA_MAX_ACCOUNTS: "1",
            }),
          },
        ]
      : []),
  ],
});
