import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Banner } from "@/components/ui/banner";
import { Card } from "@/components/ui/card";
import { updateTripAction } from "@/features/trips/actions";
import { SettingsAction } from "@/features/trips/components/settings-actions";
import { TripForm } from "@/features/trips/components/trip-form";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { regionGroups } from "@/features/trips/region-options";
import { sheetContext } from "@/features/trips/sheet-context";
import { regionValue, type TripDraft } from "@/lib/trip-input";
import styles from "./settings.module.css";

type Params = PageProps<"/trips/[id]/settings">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("tripSettings"),
    loadTripView(id, `/trips/${id}/settings`),
  ]);
  return { title: `${t("title")} · ${view.trip.name}` };
}

/**
 * W12 «Reise bearbeiten» (F-001 edit, F-004, F-013 simple delete) – organiser only; members
 * are sent to the overview (the actions are checked on the server anyway).
 */
export default async function TripSettingsPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/settings`);
  if (!view.isOrganizer) redirect(tripPath(view.trip.publicId));
  const [t, tDialogs, regions] = await Promise.all([
    getTranslations("tripSettings"),
    getTranslations("trip.dialogs"),
    regionGroups(),
  ]);
  const { trip, format, today, members } = view;
  const initial: TripDraft = {
    name: trip.name,
    rangeStart: trip.rangeStart,
    rangeEnd: trip.rangeEnd,
    minNights: String(trip.minNights),
    preferredNights: trip.preferredNights === null ? "" : String(trip.preferredNights),
    description: trip.description ?? "",
    deadline: trip.deadline ?? "",
    holidayRegion: regionValue(trip.holidayCountry, trip.holidaySubdivision),
  };
  const context = sheetContext(view);

  return (
    <TripShell view={view} tab={null} subtitle={t("title")}>
      <div className={styles.page}>
        <h1>{t("title")}</h1>
        <TripForm
          mode="edit"
          initial={initial}
          today={today}
          intl={format.intl}
          regions={regions}
          originalStart={trip.rangeStart}
          action={updateTripAction.bind(null, trip.publicId)}
          notice={
            <Banner tone="info">
              {view.phase === "vote" ? `${t("recalcNote")} ${t("votingNote")}` : t("recalcNote")}
            </Banner>
          }
        />

        <section aria-labelledby="settings-org" className={styles.section}>
          <h2 id="settings-org">{t("orgTitle")}</h2>
          {members.length > 1 ? (
            <SettingsAction kind="transfer" label={tDialogs("transfer")} context={context} />
          ) : (
            <p className={styles.muted}>{t("transferNone")}</p>
          )}
        </section>

        <section aria-labelledby="settings-danger" className={styles.section}>
          <h2 id="settings-danger">{t("dangerTitle")}</h2>
          <Card className={styles.danger}>
            <p className={styles.dangerTitle}>{t("deleteTitle")}</p>
            <p className={styles.muted}>{t("deleteText")}</p>
            <SettingsAction kind="delete" label={tDialogs("deleteConfirm")} context={context} />
          </Card>
        </section>
      </div>
    </TripShell>
  );
}
