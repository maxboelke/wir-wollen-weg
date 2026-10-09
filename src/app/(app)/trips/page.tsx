import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { IllustrationMotion } from "@/components/illustrations/illustration-motion";
import { PageShell } from "@/components/page-shell";
import { StaggerEnter } from "@/components/stagger-enter";
import { Button } from "@/components/ui/button";
import { Card, Tile } from "@/components/ui/card";
import { signOut } from "@/features/auth/actions";
import { LanguageSwitch } from "@/features/locale/language-switch";
import { getSession } from "@/server/session";
import { listTripsForUser } from "@/server/trips";
import styles from "./trips.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trips");
  return { title: t("title") };
}

/** Placeholder "My trips" (W04; F-044 comes in Increment 2) – proves session + join. */
export default async function TripsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/trips");
  const t = await getTranslations("trips");
  const trips = await listTripsForUser(session.user.id);

  return (
    <PageShell homeHref="/trips" languageSwitch={<LanguageSwitch />}>
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1>{t("title")}</h1>
          <p className={styles.muted}>{t("signedInAs", { name: session.user.name })}</p>
        </div>
        {trips.length === 0 ? (
          <section className={styles.empty} aria-labelledby="trips-empty">
            <IllustrationMotion choreography="empty" sessionKey="trips-empty">
              <Illustration name="empty-trips" width={200} />
            </IllustrationMotion>
            <h2 id="trips-empty">{t("emptyTitle")}</h2>
            <p className={styles.muted}>{t("emptyText")}</p>
          </section>
        ) : (
          <StaggerEnter sessionKey="trips-list">
            <ul className={styles.list} aria-label={t("listLabel")}>
              {trips.map((trip) => (
                <Card as="li" key={trip.id} className={styles.trip} data-stagger>
                  <Tile icon="plane" tone="lavender" />
                  <span className={styles.tripText}>
                    <span className={styles.tripName}>{trip.name}</span>
                    <span className={styles.muted}>
                      {t("joinedAs", { name: trip.displayName })}
                    </span>
                  </span>
                </Card>
              ))}
            </ul>
          </StaggerEnter>
        )}
        <form action={signOut}>
          <Button type="submit" variant="text" size="sm" icon="logout">
            {t("signOut")}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
