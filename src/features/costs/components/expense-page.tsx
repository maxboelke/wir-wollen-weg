import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TripShell } from "@/features/trips/components/trip-shell";
import type { TripView } from "@/features/trips/load";
import { costsPath, tripPath } from "@/features/trips/paths";
import { loadCostsRaw } from "@/server/costs/db";
import { costsModel } from "../load";
import { ExpenseForm } from "./expense-form";

/**
 * `/costs/new` and `/costs/{eid}/edit` (W19 D.5): phase «fixed» only; closed → back to the list
 * with a notice (D.1); edit without the right or for an unknown/deleted expense → 404 like other
 * trip sub-pages. Default date: today (app time zone), clamped into the allowed window.
 */
export async function ExpensePage({
  view,
  expenseId,
  fromCockpit,
}: {
  view: TripView;
  expenseId: string | null;
  fromCockpit: boolean;
}) {
  const { trip, today } = view;
  if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd)
    redirect(tripPath(trip.publicId));
  const raw = await loadCostsRaw(trip.id);
  if (raw.closed) redirect(`${costsPath(trip.publicId)}?notice=closed`);
  const model = costsModel(view, raw);
  const expense = expenseId ? (model.expenses.find((e) => e.id === expenseId) ?? null) : null;
  if (expenseId && (!expense || !expense.canEdit)) notFound();
  const t = await getTranslations("costForm");
  const title = expense ? t("titleEdit") : t("titleNew");
  const date =
    today < model.window.min
      ? model.window.min
      : today > model.window.max
        ? model.window.max
        : today;
  return (
    <TripShell view={view} tab={null} subtitle={title}>
      <h1 className="visually-hidden" id="expense-form-title" tabIndex={-1}>
        {`${title} · ${trip.name}`}
      </h1>
      <ExpenseForm model={model} expense={expense} date={date} fromCockpit={fromCockpit} />
    </TripShell>
  );
}
