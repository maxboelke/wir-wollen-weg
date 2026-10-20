import "server-only";
import { z } from "zod";
import { APP_ENVS, resolveAppEnv, resolveAppUrl, showsDemoBanner } from "@/lib/app-env";

/**
 * Server environment (names: docs/ops/deployment.md §4). Parsed lazily so that
 * `next build` works with the dummy values used in CI.
 */
const schema = z.object({
  APP_ENV: z.enum(APP_ENVS).default("development"),
  APP_URL: z.url().default("http://localhost:3000"),
  // Online preview (APP_ENV=preview, PRD Q25): password of the HTTP Basic Auth in proxy.ts.
  PREVIEW_ACCESS_PASSWORD: z.string().optional(),
  DATABASE_URL: z.string().min(1).default("postgres://app:app@localhost:5432/wirwollenweg"),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.url().optional(),
  AUTH_TRUSTED_ORIGINS: z.string().optional(),
  // Client IP for rate limits (R-005): header set by the proxy in front of the app, and
  // proxies whose entries in that header are skipped (deployment.md §0.1, §5.2).
  AUTH_IP_HEADER: z
    .string()
    .regex(/^[a-z0-9-]+$/i)
    .transform((h) => h.toLowerCase())
    .default("x-forwarded-for"),
  AUTH_TRUSTED_PROXIES: z.string().optional(),
  // smtp = real SMTP (Mailpit locally); inbox = demo inbox in the database (/demo/postfach).
  MAIL_TRANSPORT: z.enum(["smtp", "inbox"]).default("smtp"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default("login@mail.example.org"),
  MAIL_FROM_NAME_DE: z.string().optional(),
  MAIL_FROM_NAME_EN: z.string().optional(),
  MAIL_REPLY_TO: z.string().optional(),
  RATE_LIMIT_ENABLED: z.stringbool().default(true),
  // Optional online leak check for new passwords (F-042). Off in the offline demo (Q15).
  PASSWORD_BREACH_CHECK: z.enum(["off", "hibp"]).default("off"),
  // Contact address on the help page (F-051) – placeholder until go-live (Q15).
  CONTACT_EMAIL: z.string().default("hallo@example.org"),
  // Retention job (F-013/F-043): POST /api/internal/retention with «Authorization: Bearer
  // <token>», scheduled daily by Operations. Unset = endpoint disabled (404).
  RETENTION_TOKEN: z.string().min(32).optional(),
  // Vercel Cron sends «Authorization: Bearer $CRON_SECRET» (GET) – accepted like RETENTION_TOKEN.
  CRON_SECRET: z.string().min(32).optional(),
  // Connections per server instance (serverless: small, deployment.md §0.7).
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

/** Hosts allowed as SMTP target in the offline demo – mails must never leave the laptop. */
const DEMO_SMTP_HOSTS = new Set(["mailpit", "localhost", "127.0.0.1"]);

export function serverEnv(): ServerEnv {
  if (!cached) {
    const parsed = schema.parse({
      ...Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== "")),
      // Defaults that depend on the platform (Vercel: preview + production domain).
      APP_ENV: resolveAppEnv(),
      APP_URL: resolveAppUrl(),
    });
    if (
      parsed.APP_ENV === "demo" &&
      parsed.MAIL_TRANSPORT === "smtp" &&
      !DEMO_SMTP_HOSTS.has(parsed.SMTP_HOST)
    ) {
      throw new Error("APP_ENV=demo only allows Mailpit as SMTP host (deployment.md §0.1)");
    }
    cached = parsed;
  }
  return cached;
}

/**
 * Demo banner flag (deployment.md §0.1): local demo and online preview. Read at render time;
 * static pages use the build env.
 */
export function isDemo(): boolean {
  return showsDemoBanner();
}
