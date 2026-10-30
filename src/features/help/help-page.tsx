import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import { HELP_ANCHORS, HELP_PATHS, HELP_TOPICS, type HelpTopic } from "@/lib/help";
import { IMPRINT_PATHS, LICENSES_ANCHOR, PRIVACY_PATHS } from "@/lib/legal";
import { serverEnv } from "@/server/env";
import { HelpAnchors } from "./help-anchors";
import { FeedbackButton } from "@/features/beta/components/feedback-button";
import { isBeta } from "@/lib/app-env";
import { feedbackConfig } from "@/lib/beta-config";
import styles from "./help.module.css";

type ActionTopic = "link" | "app" | "motion" | "account" | "retention";

/**
 * Optional action under an answer (W15: «Anmelden» for a lost link, «Zum Konto» for motion;
 * increment 6: «Konto löschen», privacy policy).
 */
function actionHref(topic: HelpTopic, locale: Locale): string | undefined {
  const actions: Record<ActionTopic, string> = {
    link: "/login",
    app: "/install",
    motion: "/account",
    account: "/account/delete",
    retention: PRIVACY_PATHS[locale],
  };
  return topic in actions ? actions[topic as ActionTopic] : undefined;
}

export async function helpMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "help" });
  return {
    title: t("title"),
    description: t("lead"),
    alternates: {
      canonical: HELP_PATHS[locale],
      languages: { de: HELP_PATHS.de, en: HELP_PATHS.en },
    },
  };
}

/**
 * W15 – help / FAQ (F-051): public, static, indexable, DE and EN. Every question is a
 * `<details>` with a jump anchor (`/de/hilfe#code`); opened via anchor it is expanded and
 * focused (HelpAnchors). Reached from the footer, the avatar menu and the code step.
 */
export async function HelpPage({ locale }: { locale: Locale }) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "help" });
  const env = serverEnv();
  const other: Locale = locale === "de" ? "en" : "de";
  const tApp = await getTranslations({ locale, namespace: "app" });
  const tFeedback = await getTranslations({ locale, namespace: "feedback" });
  const values = { sender: env.MAIL_FROM, contact: env.CONTACT_EMAIL, product: tApp("name") };
  // Friends beta (W23 D.2): «Du testest die Beta – danke!» with the feedback sheet on top.
  const feedback = isBeta() ? feedbackConfig(process.env) : null;

  return (
    <PageShell alternate={{ href: HELP_PATHS[other], locale: other }}>
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p className={styles.lead}>{t("lead")}</p>
        </div>
        {feedback && (feedback.whatsapp || feedback.email) ? (
          <section className={styles.contact} aria-label={tFeedback("menu")}>
            <p>{tFeedback("helpBox")}</p>
            <FeedbackButton config={feedback} label={tFeedback("menu")} />
          </section>
        ) : null}
        <div className={styles.list}>
          {HELP_TOPICS.map((topic) => {
            const action = actionHref(topic, locale);
            return (
              <details key={topic} id={HELP_ANCHORS[topic][locale]} className={styles.item}>
                <summary className={styles.summary}>
                  <h2 className={styles.question}>{t(`topics.${topic}.q`)}</h2>
                  <Icon name="chevron-down" size={20} className={styles.chevron} />
                </summary>
                <div className={styles.answer}>
                  <p>{t(`topics.${topic}.a`, values)}</p>
                  {action ? (
                    <a className={styles.action} href={action}>
                      {t(`topics.${topic as ActionTopic}.action`)}
                    </a>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
        <section className={styles.contact} aria-labelledby="help-contact">
          <h2 id="help-contact">{t("contactTitle")}</h2>
          <p>
            {t.rich("contact", {
              email: env.CONTACT_EMAIL,
              link: (chunks) => (
                <a className={styles.action} href={`mailto:${env.CONTACT_EMAIL}`}>
                  {chunks}
                </a>
              ),
            })}
          </p>
          {/* Credits (compliance-checklist §1, tech-stack §2): holiday data CC BY 3.0. */}
          <p className={styles.credits}>
            {t.rich("credits", {
              link: (chunks) => (
                <a className={styles.action} href={`${IMPRINT_PATHS[locale]}#${LICENSES_ANCHOR}`}>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      </div>
      <HelpAnchors />
    </PageShell>
  );
}
