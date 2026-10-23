import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CostsPage } from "@/features/costs/components/costs-page";
import { loadTripView } from "@/features/trips/load";

type Params = PageProps<"/trips/[id]/costs">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("costs"),
    loadTripView(id, `/trips/${id}/costs`),
  ]);
  return { title: t("pageTitle", { trip: view.trip.name }) };
}

/** W19 D «Kosten» (F-035): «Dein Stand», expenses by day, ≥ 960 px also settling up. */
export default async function CostsListPage({ params, searchParams }: Params) {
  const { id } = await params;
  const saved = (await searchParams).saved;
  const view = await loadTripView(id, `/trips/${id}/costs`);
  return <CostsPage view={view} page="list" saved={typeof saved === "string" ? saved : null} />;
}
