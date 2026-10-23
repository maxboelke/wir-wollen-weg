import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { StayForm } from "@/features/stays/components/stay-form";
import { formProps } from "@/features/stays/form-props";
import { loadStaysRaw, staysModel, stayImageSrc } from "@/features/stays/load";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { hostOf, priceInput } from "@/lib/stays";

type Params = PageProps<"/trips/[id]/stays/[sid]/edit">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id, sid } = await params;
  const [t, view] = await Promise.all([
    getTranslations("stays"),
    loadTripView(id, `/trips/${id}/stays/${sid}/edit`),
  ]);
  return { title: t("editPageTitle", { trip: view.trip.name }) };
}

/**
 * W17 F.4 «Vorschlag bearbeiten»: author or organiser, not the picked place once booked –
 * otherwise back to `/stays` without a message. The link is read-only.
 */
export default async function EditStayPage({ params }: Params) {
  const { id, sid } = await params;
  const view = await loadTripView(id, `/trips/${id}/stays/${sid}/edit`);
  const { trip } = view;
  if (trip.phase !== "fixed") redirect(tripPath(trip.publicId));
  const staysHref = `${tripPath(trip.publicId)}/stays`;
  const raw = await loadStaysRaw(trip.id);
  const model = staysModel(view, raw);
  const stay = raw.stays.find((s) => s.id === sid);
  const item = [
    ...(model.ranking ?? []),
    ...(model.all ?? []),
    ...(model.chosen ? [model.chosen] : []),
  ].find((s) => s.id === sid);
  if (!stay || !item?.canEdit) redirect(staysHref);
  const t = await getTranslations("stayForm");
  const host = hostOf(stay.url);
  return (
    <TripShell view={view} tab={null} subtitle={t("editTitle")}>
      <h1 className="visually-hidden" tabIndex={-1}>{`${t("editTitle")} · ${trip.name}`}</h1>
      <StayForm
        {...formProps(view, model, staysHref)}
        edit={{
          id: stay.id,
          url: stay.url,
          host,
          site: stay.previewSiteName ?? host,
          hasPreview: stay.previewStatus === "ok",
          image: stayImageSrc(stay),
          title: stay.title,
          price: priceInput(stay.priceCents, view.format.locale),
          note: stay.note ?? "",
          canDelete: item.canDelete,
        }}
      />
    </TripShell>
  );
}
