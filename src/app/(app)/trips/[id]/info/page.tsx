import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/icon";
import { InfoView } from "@/features/cockpit/components/info-view";
import infoStyles from "@/features/cockpit/components/info.module.css";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { canEditTripInfo } from "@/lib/trip-info";
import { getTripInfo } from "@/server/cockpit";
import { listStays } from "@/server/stays/db";

type Params = PageProps<"/trips/[id]/info">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("tripInfo"),
    loadTripView(id, `/trips/${id}/info`),
  ]);
  return { title: t("pageTitle", { trip: view.trip.name }) };
}

/**
 * W22 «Infos» (F-033, I8-09): members only (shared «Reise nicht gefunden» otherwise), phase
 * «fixed» only – before that (also after «Festlegung aufheben») back to the trip; the infos
 * stay stored. Editing: organiser (`canEditTripInfo`).
 */
export default async function TripInfoPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/info`);
  const { trip } = view;
  if (trip.phase !== "fixed") redirect(tripPath(trip.publicId));
  const [t, info, stays] = await Promise.all([
    getTranslations("tripInfo"),
    getTripInfo(trip.id),
    listStays(trip.id),
  ]);
  const stayPicked = stays.some((s) => s.chosenAt !== null);
  const canEdit = canEditTripInfo(view.me);
  const editHref = `${tripPath(trip.publicId)}/info/edit`;
  return (
    <TripShell
      view={view}
      tab={null}
      subtitle={t("title")}
      action={
        canEdit ? (
          <Link className={infoStyles.edit} href={editHref} aria-label={t("editName")}>
            <Icon name="edit" size={20} />
            <span className={infoStyles.editLabel}>{t("edit")}</span>
          </Link>
        ) : null
      }
    >
      <h1 className="visually-hidden">{`${t("title")} · ${trip.name}`}</h1>
      <InfoView
        view={view}
        info={info}
        canEdit={canEdit}
        editHref={editHref}
        stayHref={stayPicked ? `${tripPath(trip.publicId)}/stays` : null}
      />
    </TripShell>
  );
}
