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

/** W19 E.5 «Ausgleichen» (F-036): own transfers in detail, the others' compact, payment details. */
export default async function CostsBalancesPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { from } = await searchParams;
  const view = await loadTripView(id, `/trips/${id}/costs/balances`);
  return <CostsPage view={view} page="balances" saved={null} fromCockpit={from === "cockpit"} />;
}
