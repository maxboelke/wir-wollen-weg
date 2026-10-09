import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "../env";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import type { RenderedEmail } from "./templates";

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const env = serverEnv();
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? "" } } : {}),
    });
  }
  return transporter;
}

/** Sends a transactional mail via SMTP (Mailpit locally, EU provider later). */
export async function sendMail(
  to: string,
  fromName: string,
  { subject, text, html }: RenderedEmail,
): Promise<void> {
  const env = serverEnv();
  await getTransporter().sendMail({
    from: { name: fromName, address: env.MAIL_FROM },
    ...(env.MAIL_REPLY_TO ? { replyTo: env.MAIL_REPLY_TO } : {}),
    to,
    subject,
    text,
    html,
  });
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
