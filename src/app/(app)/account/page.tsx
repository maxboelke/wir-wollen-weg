import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/features/account/actions";
import { AppearanceCard } from "@/features/account/components/appearance-card";
import { LanguageRegionCard } from "@/features/account/components/language-region-card";
import { ProfileCard } from "@/features/account/components/profile-card";
import { SessionsCard } from "@/features/account/components/sessions-card";
import styles from "@/features/account/components/account.module.css";
import { isLocale } from "@/i18n/config";
import { isCountry, isWeekStart } from "@/lib/region";
import { hasPassword } from "@/server/account";
import { serverEnv } from "@/server/env";
import { getSession } from "@/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

/**
 * W13 – account settings (F-043, F-046, F-052, F-041/F-042): Profil · Sprache & Region ·
 * Darstellung · Anmeldung · Sitzungen · Daten & Datenschutz · Abmelden. Account deletion
 * (F-043) follows in increment 6.
 */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const t = await getTranslations("account");
  const tCommon = await getTranslations("common");
  const { user } = session;
  const passwordSet = await hasPassword(user.id);
  const contact = serverEnv().CONTACT_EMAIL;

  return (
    <PageShell>
      <div className={styles.page}>
        <h1>{t("title")}</h1>
        <ProfileCard name={user.name} />
        <LanguageRegionCard
          locale={isLocale(user.locale) ? user.locale : "en"}
          country={isCountry(user.country) ? user.country : "GB"}
          subdivision={user.subdivision ?? null}
          weekStart={isWeekStart(user.weekStart) ? user.weekStart : "auto"}
        />
        <AppearanceCard reduceMotion={user.reduceMotion === true} />
        <Card as="section" aria-labelledby="account-signin" className={styles.card}>
          <h2 id="account-signin" className={styles.cardTitle}>
            {t("signInMethods.title")}
          </h2>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>{t("signInMethods.emailLabel")}</dt>
              <dd className={styles.value}>{user.email}</dd>
              <dd>
                <Link className={styles.textLink} href="/account/email">
                  {t("signInMethods.changeEmail")}
                </Link>
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>{t("signInMethods.passwordLabel")}</dt>
              <dd className={styles.value}>
                {passwordSet ? t("signInMethods.passwordSet") : t("signInMethods.passwordNotSet")}
              </dd>
              <dd>
                <Link className={styles.textLink} href="/account/password">
                  {passwordSet ? t("signInMethods.changePassword") : t("signInMethods.setPassword")}
                </Link>
              </dd>
            </div>
          </dl>
        </Card>
        <SessionsCard />
        <Card as="section" aria-labelledby="account-privacy" className={styles.card}>
          <h2 id="account-privacy" className={styles.cardTitle}>
            {t("privacy.title")}
          </h2>
          <p className={styles.muted}>
            {t.rich("privacy.request", {
              contact,
              link: (chunks) => (
                <a className={styles.textLink} href={`mailto:${contact}`}>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </Card>
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="md" icon="logout">
            {tCommon("signOut")}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
