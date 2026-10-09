import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { IllustrationMotion } from "@/components/illustrations/illustration-motion";
import { BrandLink, DemoBanner, SkipLink } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { FlashToast } from "@/components/shell/flash-toast";
import { PendingAuthBanner } from "@/components/shell/pending-auth-banner";
import { SiteFooter } from "@/components/shell/site-footer";
import { buttonClassName } from "@/components/ui/button-styles";
import { ButtonLink } from "@/components/ui/button-link";
import { Tile, type TileTone } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { LanguageSwitchLink } from "@/features/locale/language-switch";
import { isLocale, type Locale } from "@/i18n/config";
import styles from "./landing.module.css";

/** "Plan a trip" leads to W05 – the form works without an account (Flow G: value before hurdle). */
const PLAN_HREF = "/trips/new";

const STEPS = [
  { icon: "calendar-plus", tone: "lavender", title: "step1Title", text: "step1Text" },
  { icon: "users", tone: "mint", title: "step2Title", text: "step2Text" },
  { icon: "sun", tone: "sun", title: "step3Title", text: "step3Text" },
] as const satisfies readonly { icon: IconName; tone: TileTone; title: string; text: string }[];

/** W01 – landing in direction B: Indigo cockpit, mint CTA, hero card rising out of it. */
export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  const other: Locale = locale === "de" ? "en" : "de";

  return (
    <>
      <SkipLink />
      <DemoBanner />
      <header className={styles.top}>
        <div className={styles.topInner}>
          <BrandLink href={`/${locale}`} tone="onBrand" />
          <div className={styles.topActions}>
            <LanguageSwitchLink href={`/${other}`} locale={other} tone="onBrand" />
            <Link
              className={buttonClassName({
                variant: "secondaryOnBrand",
                size: "sm",
                className: styles.signInText,
              })}
              href="/login"
            >
              {tCommon("signIn")}
            </Link>
            {/* < 375 px: icon button 44 × 44 (D-29) – same link, only one is displayed */}
            <Link
              className={buttonClassName({
                variant: "secondaryOnBrand",
                size: "sm",
                className: styles.signInIcon,
              })}
              href="/login"
              aria-label={tCommon("signIn")}
              title={tCommon("signIn")}
            >
              <Icon name="login" size={20} />
            </Link>
          </div>
        </div>
      </header>
      <PendingAuthBanner />
      <main id="content">
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 id="landing-title" className={styles.title}>
                {t("titleLead")} <span className={styles.highlight}>{t("titleHighlight")}</span>
              </h1>
              <p className={styles.lead}>{t("lead")}</p>
              <ButtonLink href={PLAN_HREF} variant="accent" block iconEnd="arrow-right">
                {t("cta")}
              </ButtonLink>
              <p className={styles.note}>{t("ctaNote")}</p>
            </div>
            <IllustrationMotion
              choreography="hero"
              sessionKey="landing-hero"
              className={styles.art}
            >
              <Illustration name="hero" className={styles.artSvg} />
            </IllustrationMotion>
          </div>
        </section>

        <Reveal className={styles.content}>
          <section className={styles.steps} aria-labelledby="steps-title">
            <h2 id="steps-title">{t("stepsTitle")}</h2>
            <ol className={styles.stepList}>
              {STEPS.map((step) => (
                <li key={step.title} className={styles.step} data-reveal>
                  <Tile icon={step.icon} tone={step.tone} />
                  <span className={styles.stepText}>
                    <span className={styles.stepTitle}>{t(step.title)}</span>
                    <span className={styles.stepDetail}>{t(step.text)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.invited} aria-labelledby="invited-title" data-reveal>
            <h2 id="invited-title">{t("invitedTitle")}</h2>
            <p>{t("invitedText")}</p>
            <ButtonLink href={PLAN_HREF} variant="secondary" size="md">
              {t("cta")}
            </ButtonLink>
          </section>
        </Reveal>
      </main>
      <SiteFooter alternateHref={`/${other}`} />
      <FlashToast />
    </>
  );
}
