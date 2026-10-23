import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewRequestPage } from "@/features/travel-data/components/travel-page";
import { loadTripView } from "@/features/trips/load";
import { travelDataOn } from "@/lib/app-env";

type Params = PageProps<"/trips/[id]/travel-data/new">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!travelDataOn()) return {};
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("travelData"),
    loadTripView(id, `/trips/${id}/travel-data/new`),
  ]);
  return { title: t("newPageTitle", { trip: view.trip.name }) };
}

/** W20 H.4 «Reisedaten anfragen» – «Bucht» only (R.9 I11-04). */
export default async function NewTravelRequestPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/travel-data/new`);
  return <NewRequestPage view={view} />;
}
