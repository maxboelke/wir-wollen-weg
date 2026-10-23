import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CostsPage } from "@/features/costs/components/costs-page";
import { loadTripView } from "@/features/trips/load";

type Params = PageProps<"/trips/[id]/costs/balances">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("costs"),
    loadTripView(id, `/trips/${id}/costs/balances`),
  ]);
  return { title: t("pageTitleBalances", { trip: view.trip.name }) };
}

/** W19 D.7 «Ausgleich» (F-036): proposal, marking, «Bereits bezahlt», balances, payment details. */
export default async function CostsBalancesPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/costs/balances`);
  return <CostsPage view={view} page="balances" saved={null} />;
}
