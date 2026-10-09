import { getTranslations } from "next-intl/server";
import { Illustration, type IllustrationName } from "@/components/illustrations/illustration";
import { ButtonLink } from "@/components/ui/button-link";
import type { TripView } from "../load";
import { tripPath } from "../paths";
import { TripShell } from "./trip-shell";
import styles from "./coming-soon.module.css";

const ART: Record<"days" | "group" | "poll", IllustrationName> = {
  days: "submitted",
  group: "no-matches",
  poll: "vote-waiting",
};

/**
 * Placeholder for the tabs built in Increments 3–5 («Meine Tage», «Gruppe», «Abstimmen»):
 * the trip frame and the tab exist, the content says honestly that it is coming.
 */
export async function ComingSoon({
  view,
  tab,
}: {
  view: TripView;
  tab: "days" | "group" | "poll";
}) {
  const t = await getTranslations("trip");
  return (
    <TripShell view={view} tab={tab}>
      <section className={styles.soon}>
        <Illustration name={ART[tab]} width={180} />
        <h1>{t("soon.title", { tab: t(`tabs.${tab}`) })}</h1>
        <p className={styles.text}>{t(`soon.${tab}`)}</p>
        <ButtonLink href={tripPath(view.trip.publicId)} variant="secondary" size="md">
          {t("soon.back")}
        </ButtonLink>
      </section>
    </TripShell>
  );
}
