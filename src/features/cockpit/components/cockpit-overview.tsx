import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { SealMotion } from "@/components/seal-motion";
import { TripShell } from "@/features/trips/components/trip-shell";
import { WelcomeHint } from "@/features/trips/components/welcome-hint";
import type { TripView } from "@/features/trips/load";
import { loadCockpit } from "../load";
import { routeView, sheetData, ticketView } from "../view";
import { CockpitProvider } from "./cockpit-provider";
import { FocusOnParam } from "./focus-on-param";
import { MiniRing } from "./mini-ring";
import { RouteSection } from "./route-view";
import { StartHint } from "./start-hint";
import { Ticket } from "./ticket";

/**
 * Phase-3 overview «Reiseverlauf» (W16 v2, F-053, Increment 8): sticky row 1 with the trip
 * name as h1 and the mini ring, ticket head, the way with «Heute», «Immer griffbereit» and
 * «Mehr zur Reise». Replaces the result card, the module slot and the phase steps (v2.10).
 */
export async function CockpitOverview({
  view,
  welcome,
  focusTitle,
  started = false,
}: {
  view: TripView;
  welcome: boolean;
  focusTitle: boolean;
  /** Opened automatically from the app start `/` (W16 v2.18) – one-off hint. */
  started?: boolean;
}) {
  const data = await loadCockpit(view);
  const [route, ticket, sheets, tTrip] = await Promise.all([
    routeView(view, data),
    ticketView(view, data),
    sheetData(view, data),
    getTranslations("trip"),
  ]);
  return (
    <TripShell
      view={view}
      tab="overview"
      kpi={<Ticket publicId={view.trip.publicId} ticket={ticket} />}
      hub={{
        phaseText: ticket.phaseText,
        srSentence: ticket.srSentence,
        phaseLead: <MiniRing percent={ticket.percent} />,
      }}
      frame={(page) => <CockpitProvider data={sheets}>{page}</CockpitProvider>}
    >
      {focusTitle ? <FocusOnParam targetId="trip-title" param="fixed" /> : null}
      {started ? <StartHint publicId={view.trip.publicId} /> : null}
      {welcome ? (
        <WelcomeHint
          title={tTrip("welcomeTitle")}
          text={tTrip("welcomeText")}
          closeLabel={tTrip("welcomeClose")}
          seal={
            <SealMotion size="md">
              <Illustration name="seal" width={40} />
            </SealMotion>
          }
        />
      ) : null}
      <RouteSection view={route} />
    </TripShell>
  );
}
