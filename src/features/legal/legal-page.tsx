import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { Banner } from "@/components/ui/banner";
import type { Locale } from "@/i18n/config";
import { isBeta } from "@/lib/app-env";
import { serverEnv } from "@/server/env";
import {
  findPlaceholderMarkers,
  IMPRINT_PATHS,
  LICENSES_ANCHOR,
  PRIVACY_PATHS,
  PRIVACY_SECTIONS,
} from "@/lib/legal";
import styles from "./legal.module.css";

type Kind = "privacy" | "imprint";
const PATHS: Record<Kind, Record<Locale, string>> = {
  privacy: PRIVACY_PATHS,
  imprint: IMPRINT_PATHS,
};

/** Sections of the beta privacy notice `beta-1` (compliance-checklist §13.4). */
const BETA_PRIVACY_SECTIONS = [
  "controller",
  "data",
  "purpose",
  "recipients",
  "processors",
  "device",
  "retention",
  "rights",
  "required",
  "feedback",
] as const;

/** True while the page still shows placeholder texts of the offline demo (Q14/Q16). */
async function isDraft(kind: Kind, locale: Locale): Promise<boolean> {
  if (isBeta()) return false;
  const messages = await getMessages({ locale });
  return findPlaceholderMarkers(messages.legal[kind]).length > 0;
}

export async function legalMetadata(kind: Kind, locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "legal" });
  const tBeta = await getTranslations({ locale, namespace: "legalBeta" });
  return {
    title: isBeta()
      ? kind === "privacy"
        ? tBeta("privacy.title")
        : tBeta("contact.title")
      : t(`${kind}.title`),
    alternates: {
      canonical: PATHS[kind][locale],
      languages: { de: PATHS[kind].de, en: PATHS[kind].en },
    },
    // Placeholder texts of the offline demo are never indexed (compliance-checklist §0a).
    ...((await isDraft(kind, locale)) ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Body text: paragraphs separated by a blank line in the message. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </>
  );
}

const external = (href: string) => {
  const ExternalLink = (chunks: ReactNode) => (
    <a className={styles.link} href={href} rel="noreferrer">
      {chunks}
    </a>
  );
  return ExternalLink;
};

/**
 * Privacy policy and imprint (F-013, sitemap §3) – public, DE binding + EN translation.
 * Offline demo (Q14/Q16): clearly marked placeholders «[PLATZHALTER: …]» and a notice on top
 * (compliance-checklist §0a); APP_ENV=production refuses to start while markers are left
 * (src/instrumentation.ts). Structure of the privacy policy follows compliance-checklist §2,
 * so only the contents need replacing before go-live.
 */
export async function LegalPage({ kind, locale }: { kind: Kind; locale: Locale }) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const other: Locale = locale === "de" ? "en" : "de";
  if (isBeta()) return <BetaLegalPage kind={kind} locale={locale} other={other} />;

  return (
    <PageShell alternate={{ href: PATHS[kind][other], locale: other }}>
      <article className={styles.page}>
        <header className={styles.intro}>
          <h1>{t(`${kind}.title`)}</h1>
          {/* Only while the texts are placeholders – the real texts carry no demo notice. */}
          {(await isDraft(kind, locale)) ? <Banner tone="warning">{t("demoNotice")}</Banner> : null}
          {locale === "en" ? <p className={styles.muted}>{t("bindingNote")}</p> : null}
        </header>
        {kind === "privacy" ? (
          <>
            <section className={styles.summary} aria-labelledby="privacy-summary">
              <h2 id="privacy-summary">{t("privacy.summaryTitle")}</h2>
              <Paragraphs text={t("privacy.summary")} />
            </section>
            {PRIVACY_SECTIONS.map((section) => (
              <section
                key={section}
                className={styles.section}
                aria-labelledby={`privacy-${section}`}
              >
                <h2 id={`privacy-${section}`}>{t(`privacy.sections.${section}.title`)}</h2>
                <Paragraphs text={t(`privacy.sections.${section}.body`)} />
              </section>
            ))}
            <p className={styles.muted}>{t("privacy.updated")}</p>
          </>
        ) : (
          <>
            <section className={styles.section} aria-labelledby="imprint-provider">
              <h2 id="imprint-provider">{t("imprint.providerTitle")}</h2>
              <Paragraphs text={t("imprint.provider")} />
            </section>
            <section className={styles.section} aria-labelledby="imprint-contact">
              <h2 id="imprint-contact">{t("imprint.contactTitle")}</h2>
              <Paragraphs text={t("imprint.contact")} />
            </section>
            <section className={styles.section} aria-labelledby="imprint-service">
              <h2 id="imprint-service">{t("imprint.serviceTitle")}</h2>
              <Paragraphs text={t("imprint.service")} />
            </section>
            <section
              id={LICENSES_ANCHOR}
              className={styles.section}
              aria-labelledby="imprint-licenses"
            >
              <h2 id="imprint-licenses">{t("imprint.licensesTitle")}</h2>
              <p>
                {t.rich("imprint.holidays", {
                  lib: external("https://github.com/commenthol/date-holidays"),
                  cc: external("https://creativecommons.org/licenses/by/3.0/"),
                })}
              </p>
              <p>
                {t.rich("imprint.linkPreview", {
                  hp: external("https://github.com/fb55/htmlparser2"),
                  undici: external("https://github.com/nodejs/undici"),
                })}
              </p>
              <p>
                {t.rich("imprint.fonts", {
                  ofl: external("https://openfontlicense.org"),
                })}
              </p>
            </section>
          </>
        )}
      </article>
    </PageShell>
  );
}

/**
 * Friends beta (compliance-checklist §13.3, §13.4, deployment.md §0.12.8): the privacy notice
 * `beta-1` with the operator's name and contact from the environment (never in the public
 * repository) and «Anbieter & Kontakt» instead of the placeholder imprint. No placeholders.
 */
async function BetaLegalPage({
  kind,
  locale,
  other,
}: {
  kind: Kind;
  locale: Locale;
  other: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "legalBeta" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const env = serverEnv();
  const values = {
    name: process.env.LEGAL_OPERATOR_NAME?.trim() ?? "",
    contact: env.CONTACT_EMAIL,
  };
  return (
    <PageShell alternate={{ href: PATHS[kind][other], locale: other }}>
      <article className={styles.page}>
        <header className={styles.intro}>
          <h1>{kind === "privacy" ? t("privacy.title") : t("contact.title")}</h1>
          {locale === "en" ? <p className={styles.muted}>{t("translationNote")}</p> : null}
          {kind === "privacy" ? <p className={styles.muted}>{t("versionLine")}</p> : null}
        </header>
        {kind === "privacy" ? (
          BETA_PRIVACY_SECTIONS.map((section) => (
            <section key={section} className={styles.section} aria-labelledby={`beta-${section}`}>
              <h2 id={`beta-${section}`}>{t(`privacy.sections.${section}.title`)}</h2>
              <Paragraphs text={t(`privacy.sections.${section}.body`, values)} />
            </section>
          ))
        ) : (
          <>
            <section className={styles.section} aria-labelledby="beta-contact">
              <h2 id="beta-contact" className="visually-hidden">
                {t("contact.title")}
              </h2>
              <p>{t("contact.text")}</p>
              <p>{t("contact.operator", values)}</p>
              <p>
                {t.rich("contact.email", {
                  ...values,
                  mail: (chunks) => (
                    <a className={styles.link} href={`mailto:${values.contact}`}>
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </section>
            <section
              id={LICENSES_ANCHOR}
              className={styles.section}
              aria-labelledby="imprint-licenses"
            >
              <h2 id="imprint-licenses">{tLegal("imprint.licensesTitle")}</h2>
              <p>
                {tLegal.rich("imprint.holidays", {
                  lib: external("https://github.com/commenthol/date-holidays"),
                  cc: external("https://creativecommons.org/licenses/by/3.0/"),
                })}
              </p>
              <p>
                {tLegal.rich("imprint.linkPreview", {
                  hp: external("https://github.com/fb55/htmlparser2"),
                  undici: external("https://github.com/nodejs/undici"),
                })}
              </p>
              <p>
                {tLegal.rich("imprint.fonts", {
                  ofl: external("https://openfontlicense.org"),
                })}
              </p>
            </section>
          </>
        )}
      </article>
    </PageShell>
  );
}
