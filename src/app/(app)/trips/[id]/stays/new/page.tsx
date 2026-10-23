import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { StayForm } from "@/features/stays/components/stay-form";
import { formProps } from "@/features/stays/form-props";
import { loadStaysRaw, staysModel } from "@/features/stays/load";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";

type Params = PageProps<"/trips/[id]/stays/new">;

// deployment.md §0.8: the Server Action saves and fetches the preview afterwards via after()
// within the page's duration.
export const maxDuration = 20;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("stays"),
    loadTripView(id, `/trips/${id}/stays/new`),
  ]);
  return { title: t("newPageTitle", { trip: view.trip.name }) };
}

/**
 * W17 F «Unterkunft vorschlagen» (F-031, R.7 I9-02): phase «fixed», nothing picked yet, fewer
 * than 30 suggestions – otherwise back to `/stays` with a snackbar (W17 F.1).
 */
export default async function NewStayPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/stays/new`);
  const { trip } = view;
  if (trip.phase !== "fixed") redirect(tripPath(trip.publicId));
  const staysHref = `${tripPath(trip.publicId)}/stays`;
  const model = staysModel(view, await loadStaysRaw(trip.id));
  if (model.chosen) redirect(`${staysHref}?notice=fixed`);
  if (model.limitReached) redirect(`${staysHref}?notice=limit`);
  const t = await getTranslations("stayForm");
  return (
    <TripShell view={view} tab={null} subtitle={t("title")}>
      <h1 className="visually-hidden" id="stay-form-title" tabIndex={-1}>
        {`${t("title")} · ${trip.name}`}
      </h1>
      <StayForm {...formProps(view, model, staysHref)} />
    </TripShell>
  );
}
