import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { notFound } from "next/navigation";
import { ExpensePage } from "@/features/costs/components/expense-page";
import { loadTripView } from "@/features/trips/load";

type Params = PageProps<"/trips/[id]/costs/[eid]/edit">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("costForm"),
    loadTripView(id, `/trips/${id}/costs`),
  ]);
  return { title: t("pageTitleEdit", { trip: view.trip.name }) };
}

/** W19 D.5 «Ausgabe bearbeiten» (R.8 I10-03): creator, payer or organiser – otherwise 404. */
export default async function EditExpensePage({ params }: Params) {
  const { id, eid } = await params;
  if (!z.uuid().safeParse(eid).success) notFound();
  const view = await loadTripView(id, `/trips/${id}/costs/${eid}/edit`);
  return <ExpensePage view={view} expenseId={eid} fromCockpit={false} />;
}
