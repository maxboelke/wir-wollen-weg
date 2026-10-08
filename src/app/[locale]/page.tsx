import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { isLocale, type Locale } from "@/i18n/config";

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);
  const t = await getTranslations();
  const other: Locale = locale === "de" ? "en" : "de";

  return (
    <PageShell
      homeHref={`/${locale}`}
      languageSwitch={
        <a href={`/${other}`} hrefLang={other} lang={other}>
          {t("common.switchLanguage")}
        </a>
      }
    >
      <div className={ui.stack}>
        <h1>{t("landing.title")}</h1>
        <p>{t("landing.lead")}</p>
        <p>
          <Link className={ui.button} href="/login">
            {t("landing.login")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
