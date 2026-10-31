import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "../env";
import { storeDemoMail } from "./demo-inbox";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import type { RenderedEmail } from "./templates";

let transporter: Transporter | undefined;

/** Hosts on the same machine/network (Mailpit) – plain SMTP is fine there. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "mailpit"]);

/**
 * SMTP options (deployment.md §0.12.9): implicit TLS on 465 (`SMTP_SECURE=true`), otherwise
 * STARTTLS is REQUIRED for every non-local host; short timeouts so serverless functions never
 * hang on a slow provider; no pooling (one short-lived function per request).
 */
export function smtpOptions(env: {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string | undefined;
  SMTP_PASSWORD?: string | undefined;
}) {
  const local = LOCAL_HOSTS.has(env.SMTP_HOST.toLowerCase());
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(!env.SMTP_SECURE && !local ? { requireTLS: true } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    pool: false,
    ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? "" } } : {}),
  } as const;
}

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport(smtpOptions(serverEnv()));
  return transporter;
}

/**
 * Sends a transactional mail via SMTP (Mailpit locally, EU provider later) – or, with
 * MAIL_TRANSPORT=inbox (online preview, PRD Q25), stores it in the demo inbox instead.
 */
export async function sendMail(to: string, fromName: string, mail: RenderedEmail): Promise<void> {
  const env = serverEnv();
  if (env.MAIL_TRANSPORT === "inbox") {
    await storeDemoMail(to, mail);
    return;
  }
  const { subject, text, html } = mail;
  try {
    await getTransporter().sendMail({
      from: { name: fromName, address: env.MAIL_FROM },
      ...(env.MAIL_REPLY_TO ? { replyTo: env.MAIL_REPLY_TO } : {}),
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    // Counter only – never the address, the code or the provider's answer (§0.12.9).
    console.error("mail.send_failed");
    throw error;
  }
}

/** Sends a mail with the sender name in the mail's language (ux-spec §10.5, F-046). */
export async function sendLocalizedMail(
  to: string,
  locale: "de" | "en",
  rendered: RenderedEmail,
): Promise<void> {
  const env = serverEnv();
  const configured = locale === "de" ? env.MAIL_FROM_NAME_DE : env.MAIL_FROM_NAME_EN;
  await sendMail(to, configured ?? (locale === "de" ? de : en).mail.fromName, rendered);
}
