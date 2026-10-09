import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { SealMotion } from "@/components/seal-motion";
import { Banner } from "@/components/ui/banner";
import { ButtonLink } from "@/components/ui/button-link";
import { ClearTripDraft } from "@/features/trips/components/clear-trip-draft";
import { InviteAdmin } from "@/features/trips/components/invite-admin";
import { SharePanel } from "@/features/trips/components/share-panel";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { inviteLink, inviteShareTexts } from "@/features/trips/share-texts";
import styles from "./invite.module.css";

type Params = PageProps<"/trips/[id]/invite">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("share"),
    loadTripView(id, `/trips/${id}/invite`),
  ]);
  return { title: `${t("title")} · ${view.trip.name}` };
}

/**
 * W06 «Freunde einladen» (F-002): share text DE/EN, Web Share with copy fallback, the bare
 * link; all members may share while joining is open (Q13 b). Organiser: join switch and
 * «Link erneuern». Right after creating: «Deine Reise ist angelegt!» with seal (W05-05).
 */
export default async function InvitePage({ params, searchParams }: Params) {
  const { id } = await params;
  const created = (await searchParams).created === "1";
  const view = await loadTripView(id, `/trips/${id}/invite`);
  const t = await getTranslations("share");
  const { trip, isOrganizer, full, format, members } = view;
  const texts = await inviteShareTexts({
    tripName: trip.name,
    token: trip.inviteToken,
    deadline: trip.deadline,
    senderCountry: format.country,
  });
  const closed = !trip.joinOpen;

  return (
    <TripShell view={view} tab={null} subtitle={t("title")}>
      <div className={styles.page}>
        {created ? <ClearTripDraft /> : null}
        <div className={styles.intro}>
          {created ? (
            <div className={styles.created}>
              <SealMotion size="md">
                <Illustration name="seal" width={40} />
              </SealMotion>
              <h1>{t("createdTitle")}</h1>
            </div>
          ) : (
            <h1>{t("title")}</h1>
          )}
          {created ? <p className={styles.lead}>{t("createdLead")}</p> : null}
        </div>

        {full ? (
          <Banner tone="info" role="status">
            {t("full", { count: members.length })}
          </Banner>
        ) : closed ? (
          <Banner tone="warning" role="status">
            {isOrganizer ? t("closedOrga") : t("closedMember")}
          </Banner>
        ) : null}

        {full || (closed && !isOrganizer) ? null : (
          <SharePanel
            link={inviteLink(trip.inviteToken)}
            texts={texts}
            defaultLocale={format.locale}
            tripName={trip.name}
            locked={closed}
          />
        )}

        {isOrganizer ? <InviteAdmin publicId={trip.publicId} joinOpen={trip.joinOpen} /> : null}

        {created ? (
          <ButtonLink
            href={tripPath(trip.publicId, "days")}
            variant="secondary"
            size="md"
            iconEnd="arrow-right"
          >
            {t("continue")}
          </ButtonLink>
        ) : null}
      </div>
    </TripShell>
  );
}
