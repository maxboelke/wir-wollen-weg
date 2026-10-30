import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { TripShell } from "@/features/trips/components/trip-shell";
import type { TripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { loadCostsRaw } from "@/server/costs/db";
import { costsModel } from "../load";
import { costRemindData, costShareTexts } from "../remind";
import { costsPath } from "@/features/trips/paths";
import { tripLink } from "@/features/trips/share-texts";
import { CostsSignals } from "./costs-signals";
import { CostsView } from "./costs-view";

/**
 * Server frame of `/costs` and `/costs/balances` (W19 D.1/E.3/E.5): members only (shared 404
 * via `loadTripView`), phase «fixed» only – otherwise back to the trip without a message (the
 * data stays stored). Header: trip name + «Kosten» / «Ausgleichen»; «Übersicht teilen» moved
 * from the header to the end of `/balances` (W19 E.3).
 */
export async function CostsPage({
  view,
  page,
  saved,
  fromCockpit = false,
}: {
  view: TripView;
  page: "list" | "balances";
  saved: string | null;
  /** `/balances?from=cockpit` – ← leads back to the cockpit, otherwise to `/costs` (W19 E.5). */
  fromCockpit?: boolean;
}) {
  const { trip, format } = view;
  if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd)
    redirect(tripPath(trip.publicId));
  const raw = await loadCostsRaw(trip.id);
  const model = costsModel(view, raw);
  const [t, tTrip, remind, shareTexts] = await Promise.all([
    getTranslations("costs"),
    getTranslations("trip"),
    costRemindData(view, raw),
    page === "balances" && raw.expenses.length > 0
      ? costShareTexts(view, raw)
      : Promise.resolve(null),
  ]);
  const title = page === "list" ? t("title") : t("titleBalances");
  return (
    <TripShell
      view={view}
      tab={null}
      subtitle={title}
      back={
        page === "balances" && !fromCockpit
          ? { href: costsPath(trip.publicId), label: tTrip("backToCosts") }
          : undefined
      }
    >
      <h1 className="visually-hidden" id="costs-title" tabIndex={-1}>
        {`${title} · ${trip.name}`}
      </h1>
      <CostsSignals />
      <CostsView
        model={model}
        view={page}
        remind={remind}
        freshId={saved}
        share={
          shareTexts
            ? {
                link: tripLink(costsPath(trip.publicId, "balances")),
                texts: shareTexts,
                defaultLocale: format.locale,
                tripName: trip.name,
              }
            : null
        }
        sealSmall={<Illustration name="seal" width={40} />}
        sealLarge={<Illustration name="seal" width={40} />}
        emptyIllustration={<Illustration name="empty-costs" width={160} />}
      />
    </TripShell>
  );
}
