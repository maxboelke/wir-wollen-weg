import "server-only";
import { desc, eq, lt } from "drizzle-orm";
import { inboxEnabled } from "@/lib/app-env";
import { DEMO_INBOX_LIMIT, DEMO_INBOX_TTL_MS, normalizeInboxFilter } from "@/lib/demo-inbox";
import { db } from "../db/client";
import { demoMail } from "../db/schema";
import type { RenderedEmail } from "./templates";

/**
 * Demo inbox of the online preview (MAIL_TRANSPORT=inbox, PRD Q25): mails are stored instead
 * of sent and shown on /demo/postfach (behind the preview password). Never in production –
 * every entry point checks `inboxEnabled()`.
 */

export interface DemoMail {
  id: string;
  to: string;
  subject: string;
  text: string;
  code: string | null;
  link: string | null;
  createdAt: Date;
}

function assertEnabled(): void {
  if (!inboxEnabled()) throw new Error("demo inbox is disabled (MAIL_TRANSPORT/APP_ENV)");
}

/** Removes mails older than 24 hours; returns the number of removed rows. */
export async function purgeDemoInbox(now = new Date()): Promise<number> {
  const deleted = await db()
    .delete(demoMail)
    .where(lt(demoMail.createdAt, new Date(now.getTime() - DEMO_INBOX_TTL_MS)))
    .returning({ id: demoMail.id });
  return deleted.length;
}

/** «Sends» a mail into the demo inbox. */
export async function storeDemoMail(to: string, mail: RenderedEmail): Promise<void> {
  assertEnabled();
  await db()
    .insert(demoMail)
    .values({
      toAddress: to.trim().toLowerCase(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      code: mail.code ?? null,
      link: mail.link ?? null,
    });
  await purgeDemoInbox();
}

/** Newest mails first, optionally only those to one address (exact match, case-insensitive). */
export async function listDemoMails(filter?: string): Promise<DemoMail[]> {
  assertEnabled();
  await purgeDemoInbox();
  const address = normalizeInboxFilter(filter);
  const rows = await db()
    .select({
      id: demoMail.id,
      to: demoMail.toAddress,
      subject: demoMail.subject,
      text: demoMail.text,
      code: demoMail.code,
      link: demoMail.link,
      createdAt: demoMail.createdAt,
    })
    .from(demoMail)
    .where(address ? eq(demoMail.toAddress, address) : undefined)
    .orderBy(desc(demoMail.createdAt), desc(demoMail.id))
    .limit(DEMO_INBOX_LIMIT);
  return rows;
}
