import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExpensePage } from "@/features/costs/components/expense-page";
import { loadTripView } from "@/features/trips/load";

type Params = PageProps<"/trips/[id]/costs/new">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("costForm"),
    loadTripView(id, `/trips/${id}/costs/new`),
  ]);
  return { title: t("pageTitleNew", { trip: view.trip.name }) };
}

/** W19 D.5 «Ausgabe hinzufügen» (R.8 I10-02) – `?from=cockpit` returns to the cockpit after saving. */
export default async function NewExpensePage({ params, searchParams }: Params) {
  const { id } = await params;
  const from = (await searchParams).from;
  const view = await loadTripView(id, `/trips/${id}/costs/new`);
  return <ExpensePage view={view} expenseId={null} fromCockpit={from === "cockpit"} />;
}
