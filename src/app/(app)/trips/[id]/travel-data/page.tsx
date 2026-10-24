import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TravelAreaPage } from "@/features/travel-data/components/travel-page";
import { loadTripView } from "@/features/trips/load";
import { travelDataOn } from "@/lib/app-env";

type Params = PageProps<"/trips/[id]/travel-data">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!travelDataOn()) return {};
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("travelData"),
    loadTripView(id, `/trips/${id}/travel-data`),
  ]);
  return { title: t("pageTitle", { trip: view.trip.name }) };
}

/** W20 H.3 «Reisedaten» (F-054/F-056): members only, phase «fixed» only, area switched on. */
export default async function TravelDataPage({ params, searchParams }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/travel-data`);
  return <TravelAreaPage view={view} params={await searchParams} />;
}
