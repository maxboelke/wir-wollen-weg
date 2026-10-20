import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { CopyCodeButton } from "@/features/demo/components/copy-code-button";
import { ResetDemoForm } from "@/features/demo/components/reset-demo-form";
import styles from "@/features/demo/components/demo-inbox.module.css";
import { demoResetAvailable, inboxEnabled } from "@/lib/app-env";
import { DEMO_INBOX_PATH, demoInboxHref, normalizeInboxFilter } from "@/lib/demo-inbox";
import { listDemoMails } from "@/server/mail/demo-inbox";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("demoInbox");
  return { title: t("title") };
}

/** Times on the page: the preview runs in UTC on Vercel – the testers sit in Germany. */
const TIME_ZONE = "Europe/Berlin";

/**
 * Demo inbox of the online preview (PRD Q25, deployment.md §0.7): every mail of the app
 * (codes, magic links, notices) lands here instead of a real mailbox. Only exists with
 * MAIL_TRANSPORT=inbox and never with APP_ENV=production (404); the preview password
 * (proxy.ts) protects it. Newest first, optional filter by address.
 */
export default async function DemoInboxPage({ searchParams }: PageProps<"/demo/postfach">) {
  await connection();
  if (!inboxEnabled()) notFound();
  const { to, reset } = await searchParams;
  const filter = normalizeInboxFilter(to);
  const [t, format, mails] = await Promise.all([
    getTranslations("demoInbox"),
    getFormatter(),
    listDemoMails(filter),
  ]);

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p className={styles.lead}>{t("lead")}</p>
          <p className={styles.lead}>{t("sharedNote")}</p>
        </div>

        {reset === "done" ? (
          <Banner tone="success" role="status">
            {t("reset.done")}
          </Banner>
        ) : null}

        <form className={styles.filter} method="get" action={DEMO_INBOX_PATH}>
          <div className={styles.filterField}>
            <TextField
              id="demo-inbox-filter"
              label={t("filterLabel")}
              hint={t("filterHint")}
              type="email"
              name="to"
              inputMode="email"
              autoComplete="off"
              defaultValue={filter ?? ""}
            />
          </div>
          <Button type="submit" variant="secondary" size="md" icon="filter">
            {t("filterSubmit")}
          </Button>
        </form>

        <div className={styles.toolbar}>
          <p className={styles.count} role="status">
            {filter
              ? t("countFiltered", { count: mails.length, email: filter })
              : t("count", { count: mails.length })}
          </p>
          <div className={styles.actions}>
            {filter ? (
              <ButtonLink href={DEMO_INBOX_PATH} variant="text" size="sm" external>
                {t("showAll")}
              </ButtonLink>
            ) : null}
            <ButtonLink href={demoInboxHref(filter)} variant="text" size="sm" external>
              {t("refresh")}
            </ButtonLink>
          </div>
        </div>

        {mails.length === 0 ? (
          <p className={styles.empty}>
            {filter ? t("emptyFiltered", { email: filter }) : t("empty")}
          </p>
        ) : (
          <ul className={styles.list}>
            {mails.map((mail) => (
              <Card as="li" key={mail.id} className={styles.mail}>
                <article className={styles.mail} aria-labelledby={`mail-${mail.id}`}>
                  <p className={styles.meta}>
                    <span>{t("to", { email: mail.to })}</span>
                    <time dateTime={mail.createdAt.toISOString()}>
                      {format.dateTime(mail.createdAt, {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: TIME_ZONE,
                      })}
                    </time>
                  </p>
                  <h2 className={styles.subject} id={`mail-${mail.id}`}>
                    {mail.subject}
                  </h2>
                  {mail.code ? (
                    <div className={styles.codeRow}>
                      <span
                        className={styles.code}
                        aria-label={t("codeLabel", { code: mail.code })}
                      >
                        {mail.code}
                      </span>
                      <CopyCodeButton code={mail.code} />
                    </div>
                  ) : null}
                  {mail.link ? (
                    <ButtonLink href={mail.link} size="md" iconEnd="arrow-right" external>
                      {t("openLink")}
                    </ButtonLink>
                  ) : null}
                  <details className={styles.details}>
                    <summary>
                      <span>{t("showMail")}</span>
                      <Icon name="chevron-down" size={18} className={styles.chevron} />
                    </summary>
                    <pre className={styles.text}>{mail.text}</pre>
                  </details>
                </article>
              </Card>
            ))}
          </ul>
        )}

        {demoResetAvailable() ? <ResetDemoForm /> : null}
      </div>
    </PageShell>
  );
}
