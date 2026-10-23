import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { DemoBanner, SkipLink } from "@/components/page-shell";
import { Banner } from "@/components/ui/banner";
import { ButtonLink } from "@/components/ui/button-link";
import { SiteFooter } from "@/components/shell/site-footer";
import type { TripTab } from "@/lib/trip-status";
import type { TripView } from "../load";
import { tripPath } from "../paths";
import { remindSheetData } from "../remind";
import { TabContent } from "./cockpit-client";
import { RemindProvider } from "./remind-sheet";
import { TAB_ORDER, TripCockpit } from "./trip-cockpit";
import styles from "./trip-shell.module.css";

interface TripShellProps {
  view: TripView;
  tab: TripTab | null;
  subtitle?: string | undefined;
  kpi?: ReactNode;
  /** Phase-3 cockpit «Reiseverlauf» (W16 v2) – see `TripCockpit`. */
  hub?: { phaseText: string; phaseLead: ReactNode; srSentence: string } | undefined;
  /** Extra button in row 1 (e.g. «Bearbeiten» on the info page). */
  action?: ReactNode;
  /** Wraps the page (e.g. the cockpit's sheet provider around head AND content). */
  frame?: ((content: ReactNode) => ReactNode) | undefined;
  children: ReactNode;
}

/**
 * Frame of all trip pages: no global header – the cockpit replaces it (ux-spec §3), then
 * `<main>` and the footer (help link stays in the same place, WCAG 3.2.6). Dates fixed and
 * not celebrated yet on another tab: «Der Termin steht fest! [Ansehen]» → overview, where the
 * celebration plays (ux-spec §7.5, W11).
 */
export async function TripShell({
  view,
  tab,
  subtitle,
  kpi,
  hub,
  action,
  frame,
  children,
}: TripShellProps) {
  const [t, remind] = await Promise.all([
    getTranslations("poll.result"),
    // One remind sheet per page (phase 1/2) – every entry point opens it (ux-spec §14.2).
    remindSheetData(view),
  ]);
  const banner =
    view.celebrate && tab !== "overview" ? (
      <Banner
        tone="success"
        className={styles.banner}
        action={
          <ButtonLink href={tripPath(view.trip.publicId)} variant="secondary" size="sm">
            {t("bannerAction")}
          </ButtonLink>
        }
      >
        {t("bannerFixed")}
      </Banner>
    ) : null;
  const page = (
    <>
      <SkipLink />
      <DemoBanner />
      <TripCockpit view={view} tab={tab} subtitle={subtitle} kpi={kpi} hub={hub} action={action} />
      <main id="content" className={styles.main} data-cockpit="">
        <TabContent index={tab ? TAB_ORDER.indexOf(tab) : -1}>
          {banner}
          {children}
        </TabContent>
      </main>
      <SiteFooter />
    </>
  );
  return <RemindProvider data={remind}>{frame ? frame(page) : page}</RemindProvider>;
}
