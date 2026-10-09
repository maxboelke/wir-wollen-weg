import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/features/trips/components/coming-soon";
import { loadTripView } from "@/features/trips/load";

type Params = PageProps<"/trips/[id]/group">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("trip"),
    loadTripView(id, `/trips/${id}/group`),
  ]);
  return { title: `${t("tabs.group")} · ${view.trip.name}` };
}

/** Tab placeholder until its increment (sitemap §3). */
export default async function Page({ params }: Params) {
  const { id } = await params;
  return <ComingSoon view={await loadTripView(id, `/trips/${id}/group`)} tab="group" />;
}
