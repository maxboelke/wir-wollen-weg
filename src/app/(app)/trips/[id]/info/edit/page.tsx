import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InfoForm } from "@/features/cockpit/components/info-form";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { canEditTripInfo, INFO_FIELDS } from "@/lib/trip-info";
import { getTripInfo } from "@/server/cockpit";
import { listStays } from "@/server/stays/db";

type Params = PageProps<"/trips/[id]/info/edit">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("tripInfo"),
    loadTripView(id, `/trips/${id}/info/edit`),
  ]);
  return { title: t("editPageTitle", { trip: view.trip.name }) };
}

/**
 * W22 B/C «Infos bearbeiten» (F-033, I8-10): organiser only – members land on the info page
 * without an error (W22 C); the Server Action checks the role again.
 */
export default async function TripInfoEditPage({ params, searchParams }: Params) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const view = await loadTripView(id, `/trips/${id}/info/edit`);
  const { trip } = view;
  if (trip.phase !== "fixed") redirect(tripPath(trip.publicId));
  const infoHref = `${tripPath(trip.publicId)}/info`;
  if (!canEditTripInfo(view.me)) redirect(infoHref);
  const [t, info, stays] = await Promise.all([
    getTranslations("tripInfo"),
    getTripInfo(trip.id),
    listStays(trip.id),
  ]);
  // W22 D: «Aus „{Titel}“ übernehmen» – only the NAME of the picked place, never saved by itself.
  const stayTitle = stays.find((s) => s.chosenAt !== null)?.title ?? null;
  const initial = Object.fromEntries(
    INFO_FIELDS.map((field) => [field, info?.[field] ?? ""]),
  ) as Record<(typeof INFO_FIELDS)[number], string>;
  return (
    <TripShell view={view} tab={null} subtitle={t("editTitle")}>
      <h1 className="visually-hidden">{`${t("editTitle")} · ${trip.name}`}</h1>
      <InfoForm
        publicId={trip.publicId}
        infoHref={infoHref}
        initial={initial}
        version={info?.version ?? 0}
        stayTitle={stayTitle}
        fromStay={query.from === "stay" && stayTitle !== null}
      />
    </TripShell>
  );
}
