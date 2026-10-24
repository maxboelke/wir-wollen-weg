import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnswerPage } from "@/features/travel-data/components/travel-page";
import { loadTripView } from "@/features/trips/load";
import { travelDataOn } from "@/lib/app-env";

type Params = PageProps<"/trips/[id]/travel-data/[rid]">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!travelDataOn()) return {};
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("travelData"),
    loadTripView(id, `/trips/${id}/travel-data`),
  ]);
  // No names or values in the title of the server render – the form sets the step title.
  return { title: t("pageTitle", { trip: view.trip.name }) };
}

/** W20 H.5 answer a request (steps «Angaben» and «Freigeben»), R.9 I11-05/06. */
export default async function TravelAnswerPage({ params, searchParams }: Params) {
  const { id, rid } = await params;
  const change = (await searchParams).change === "1";
  const view = await loadTripView(id, `/trips/${id}/travel-data/${rid}`);
  return <AnswerPage view={view} requestId={rid} change={change} />;
}
