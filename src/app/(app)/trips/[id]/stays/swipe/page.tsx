import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { ButtonLink } from "@/components/ui/button-link";
import { SwipeDeck } from "@/features/stays/components/swipe-deck";
import styles from "@/features/stays/components/swipe.module.css";
import { loadStaysRaw, staysModel } from "@/features/stays/load";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";

type Params = PageProps<"/trips/[id]/stays/swipe">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("stays"),
    loadTripView(id, `/trips/${id}/stays/swipe`),
  ]);
  return { title: t("swipePageTitle", { trip: view.trip.name }) };
}

/**
 * W18 E.5 «Unterkünfte bewerten» (F-031, R.7 I9-05): the own unrated suggestions, oldest
 * first. No suggestions → `/stays`; a place is picked → «Die Unterkunft steht schon»; nothing
 * open → end state without the seal motion (E.5.2). Desktop: the stack only, no ranking next
 * to it (also the organiser swipes unswayed, E.11).
 */
export default async function SwipePage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/stays/swipe`);
  const { trip } = view;
  if (trip.phase !== "fixed") redirect(tripPath(trip.publicId));
  const staysHref = `${tripPath(trip.publicId)}/stays`;
  const model = staysModel(view, await loadStaysRaw(trip.id));
  if (model.total === 0) redirect(staysHref);
  const t = await getTranslations("stays");
  return (
    <TripShell view={view} tab={null} subtitle={t("swipe.title")}>
      <h1 className="visually-hidden">{`${t("swipe.title")} · ${trip.name}`}</h1>
      {model.chosen ? (
        <section className={styles.end} aria-labelledby="swipe-fixed">
          <h2 id="swipe-fixed" className={styles.endTitle}>
            {t("swipe.fixedTitle")}
          </h2>
          <p className={styles.endText}>{t("swipe.fixedText", { title: model.chosen.title })}</p>
          <ButtonLink href={staysHref} size="lg">
            {t("swipe.toStay")}
          </ButtonLink>
        </section>
      ) : (
        <SwipeDeck
          publicId={trip.publicId}
          stack={model.stack}
          total={model.total}
          isOrganizer={view.isOrganizer}
          staysHref={staysHref}
          seal={<Illustration name="seal" width={64} />}
        />
      )}
    </TripShell>
  );
}
