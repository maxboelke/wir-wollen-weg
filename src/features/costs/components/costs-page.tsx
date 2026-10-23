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
import { CostsSignals, CostsShareButton } from "./costs-signals";
import { CostsView } from "./costs-view";

/**
 * Server frame of `/costs` and `/costs/balances` (W19 D.1/D.3): members only (shared 404 via
 * `loadTripView`), phase «fixed» only – otherwise back to the trip without a message (the data
 * stays stored). Header: trip name, «Kosten», `[Teilen]` (only with ≥ 1 expense).
 */
export async function CostsPage({
  view,
  page,
  saved,
}: {
  view: TripView;
  page: "list" | "balances";
  saved: string | null;
}) {
  const { trip, format } = view;
  if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd)
    redirect(tripPath(trip.publicId));
  const raw = await loadCostsRaw(trip.id);
  const model = costsModel(view, raw);
  const [t, remind, shareTexts] = await Promise.all([
    getTranslations("costs"),
    costRemindData(view, raw),
    raw.expenses.length > 0 ? costShareTexts(view, raw) : Promise.resolve(null),
  ]);
  const title = page === "list" ? t("title") : t("titleBalances");
  return (
    <TripShell
      view={view}
      tab={null}
      subtitle={t("title")}
      action={
        shareTexts ? (
          <CostsShareButton
            link={tripLink(costsPath(trip.publicId, "balances"))}
            texts={shareTexts}
            defaultLocale={format.locale}
            tripName={trip.name}
          />
        ) : null
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
        sealSmall={<Illustration name="seal" width={40} />}
        sealLarge={<Illustration name="seal" width={40} />}
        emptyIllustration={<Illustration name="empty-costs" width={160} />}
      />
    </TripShell>
  );
}
