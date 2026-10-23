import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { PageSignals, SuggestButton } from "@/features/stays/components/page-signals";
import { StaysView } from "@/features/stays/components/stays-view";
import { loadStaysRaw, staysModel } from "@/features/stays/load";
import { stayRemindData } from "@/features/stays/remind";
import { TripShell } from "@/features/trips/components/trip-shell";
import { loadTripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { locales, type Locale } from "@/i18n/config";
import { formatDateRange } from "@/lib/dates";
import { getTripInfo } from "@/server/cockpit";

type Params = PageProps<"/trips/[id]/stays">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("stays"),
    loadTripView(id, `/trips/${id}/stays`),
  ]);
  return { title: t("pageTitle", { trip: view.trip.name }) };
}

/**
 * W18 «Unterkünfte» (F-031, features.md R.7 I9-01): members only (shared «Reise nicht
 * gefunden» otherwise), phase «fixed» only – before that (also after «Festlegung aufheben»)
 * back to the trip without a message, the data stays stored (W18 E.1). The view model is built
 * on the server and contains other people's ratings only when the viewer may see them (Q33).
 */
export default async function StaysPage({ params }: Params) {
  const { id } = await params;
  const view = await loadTripView(id, `/trips/${id}/stays`);
  const { trip, format, today } = view;
  if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd) {
    redirect(tripPath(trip.publicId));
  }
  const raw = await loadStaysRaw(trip.id);
  const model = staysModel(view, raw);
  const [t, info, remind] = await Promise.all([
    getTranslations("stays"),
    getTripInfo(trip.id),
    model.total > 0 && model.rankingFree ? stayRemindData(view, raw) : Promise.resolve(null),
  ]);
  const base = tripPath(trip.publicId);
  const chosen = model.chosen;
  const share =
    chosen?.href != null
      ? {
          link: chosen.href,
          texts: Object.fromEntries(
            await Promise.all(
              locales.map(async (locale) => {
                const tt = await getTranslations({ locale, namespace: "stays.chosen" });
                return [
                  locale,
                  tt("share", { trip: trip.name, title: chosen.title, link: chosen.href ?? "" }),
                ] as const;
              }),
            ),
          ) as Record<Locale, string>,
        }
      : null;
  return (
    <TripShell
      view={view}
      tab={null}
      subtitle={t("title")}
      action={
        model.chosen ? null : <SuggestButton href={`${base}/stays/new`} full={model.limitReached} />
      }
    >
      <h1 className="visually-hidden">{`${t("title")} · ${trip.name}`}</h1>
      <PageSignals />
      <StaysView
        publicId={trip.publicId}
        tripName={trip.name}
        model={model}
        rangeText={formatDateRange(trip.fixedStart, trip.fixedEnd, format.intl, { today })}
        remind={remind}
        share={share}
        info={{
          copyHref:
            view.isOrganizer && chosen && info?.stayName !== chosen.title
              ? `${base}/info/edit?from=stay`
              : null,
          viewHref: `${base}/info`,
        }}
        defaultLocale={format.locale}
        seal={<Illustration name="seal" width={34} />}
        sealSmall={<Illustration name="seal" width={20} />}
        emptyIllustration={<Illustration name="empty-stays" width={200} />}
      />
    </TripShell>
  );
}
