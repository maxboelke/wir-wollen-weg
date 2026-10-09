import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import styles from "./not-found.module.css";

/**
 * «Reise nicht gefunden» (W14, sitemap §4): the same page for trips that do not exist and
 * trips the viewer is not a member of – nothing about the trip is revealed.
 */
export default async function TripNotFound() {
  const t = await getTranslations("trip");
  return (
    <PageShell>
      <section className={styles.notFound}>
        <Illustration name="error" width={200} />
        <h1>{t("notFoundTitle")}</h1>
        <p className={styles.text}>{t("notFoundText")}</p>
        <ButtonLink href="/trips" variant="primary">
          {t("notFoundAction")}
        </ButtonLink>
      </section>
    </PageShell>
  );
}
