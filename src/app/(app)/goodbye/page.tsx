import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { isLocale } from "@/i18n/config";
import { getSession } from "@/server/session";
import styles from "./goodbye.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("goodbye");
  return { title: t("title") };
}

/** W14 «Konto gelöscht» (/goodbye, F-043): signed out, in the former account's language. */
export default async function GoodbyePage() {
  // A signed-in visitor has an account – nothing was deleted.
  if (await getSession()) redirect("/trips");
  const [t, rawLocale] = await Promise.all([getTranslations("goodbye"), getLocale()]);
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  return (
    <PageShell>
      <section className={styles.page}>
        <Illustration name="goodbye" width={200} />
        <h1>{t("title")}</h1>
        <p className={styles.lead}>{t("text")}</p>
        <ButtonLink href={`/${locale}`} size="md">
          {t("home")}
        </ButtonLink>
      </section>
    </PageShell>
  );
}
