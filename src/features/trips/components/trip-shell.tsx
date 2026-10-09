import type { ReactNode } from "react";
import { DemoBanner, SkipLink } from "@/components/page-shell";
import { SiteFooter } from "@/components/shell/site-footer";
import type { TripTab } from "@/lib/trip-status";
import type { TripView } from "../load";
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
 * `<main>` and the footer (help link stays in the same place, WCAG 3.2.6).
 */
export function TripShell({ view, tab, subtitle, kpi, children }: TripShellProps) {
  return (
    <>
      <SkipLink />
      <DemoBanner />
      <TripCockpit view={view} tab={tab} subtitle={subtitle} kpi={kpi} />
      <main id="content" className={styles.main} data-cockpit="">
        <TabContent index={tab ? TAB_ORDER.indexOf(tab) : -1}>{children}</TabContent>
      </main>
      <SiteFooter />
    </>
  );
}
