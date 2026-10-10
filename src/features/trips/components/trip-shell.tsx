import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { DemoBanner, SkipLink } from "@/components/page-shell";
import { Banner } from "@/components/ui/banner";
import { ButtonLink } from "@/components/ui/button-link";
import { SiteFooter } from "@/components/shell/site-footer";
import type { TripTab } from "@/lib/trip-status";
import type { TripView } from "../load";
import { tripPath } from "../paths";
import { TabContent } from "./cockpit-client";
import { TAB_ORDER, TripCockpit } from "./trip-cockpit";
import styles from "./trip-shell.module.css";

interface TripShellProps {
  view: TripView;
  tab: TripTab | null;
  subtitle?: string | undefined;
  kpi?: ReactNode;
  children: ReactNode;
}

/**
 * Frame of all trip pages: no global header – the cockpit replaces it (ux-spec §3), then
 * `<main>` and the footer (help link stays in the same place, WCAG 3.2.6). Dates fixed and
 * not celebrated yet on another tab: «Der Termin steht fest! [Ansehen]» → overview, where the
 * celebration plays (ux-spec §7.5, W11).
 */
export async function TripShell({ view, tab, subtitle, kpi, children }: TripShellProps) {
  const t = await getTranslations("poll.result");
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
  return (
    <>
      <SkipLink />
      <DemoBanner />
      <TripCockpit view={view} tab={tab} subtitle={subtitle} kpi={kpi} />
      <main id="content" className={styles.main} data-cockpit="">
        <TabContent index={tab ? TAB_ORDER.indexOf(tab) : -1}>
          {banner}
          {children}
        </TabContent>
      </main>
      <SiteFooter />
    </>
  );
}
