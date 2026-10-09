import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PhaseDot } from "@/components/ui/cockpit";
import { Icon } from "@/components/ui/icon";
import type { TripTab } from "@/lib/trip-status";
import type { TripView } from "../load";
import { tripPath } from "../paths";
import { sheetContext } from "../sheet-context";
import { StickyHead, TabNav, type TabLink } from "./cockpit-client";
import { TripMenu } from "./trip-menu";
import styles from "./trip-cockpit.module.css";

export const TAB_ORDER: TripTab[] = ["overview", "days", "group", "poll"];

interface TripCockpitProps {
  view: TripView;
  /** Active tab; null on sub-pages (invite, settings) – then no tab bar, back goes to the trip. */
  tab: TripTab | null;
  /** Second line under the trip name on sub-pages (e.g. «Reise bearbeiten»). */
  subtitle?: string | undefined;
  /** At most one KPI (ux-spec §4.10) – scrolls away, only row 1 + tabs stick. */
  kpi?: ReactNode;
}

/**
 * Trip cockpit (design-system §9.2–9.4, ux-spec §3/§4.10, W07 B): no global header in
 * trips; Indigo head with back button, trip name + phase line, «⋯» trip menu and the tab
 * pills. Phase line «Tage sammeln · 5/7 fertig» reads «5 von 7 fertig» to screen readers.
 */
export async function TripCockpit({ view, tab, subtitle, kpi }: TripCockpitProps) {
  const t = await getTranslations("trip");
  const { trip, phase, progress, members } = view;
  const tabs: TabLink[] = TAB_ORDER.map((key) => ({
    key,
    href: tripPath(trip.publicId, key),
    label: t(`tabs.${key}`),
  }));
  const sr = (chunks: ReactNode) =>
    progress ? (
      <>
        <span aria-hidden="true">{chunks}</span>
        <span className="visually-hidden">
          {t("phaseLineSr", { done: progress.done, total: progress.total })}
        </span>
      </>
    ) : (
      chunks
    );
  const phaseLine =
    phase === "collect" || phase === "vote"
      ? t.rich(`phaseLine.${phase}`, {
          done: progress?.done ?? 0,
          total: progress?.total ?? members.length,
          n: sr,
        })
      : phase === "fixed"
        ? t("phaseLine.fixed", { count: members.length })
        : t("phaseLine.past");

  return (
    <>
      <StickyHead tail={Boolean(kpi)}>
        <div className={styles.row}>
          <Link
            className={styles.round}
            href={tab ? "/trips" : tripPath(trip.publicId)}
            aria-label={tab ? t("back") : t("backToTrip")}
          >
            <Icon name="arrow-left" size={20} />
          </Link>
          <div className={styles.titleBlock}>
            <p className={styles.title}>{trip.name}</p>
            <p className={styles.phase}>
              <PhaseDot phase={phase} />
              <span>{subtitle ?? phaseLine}</span>
            </p>
          </div>
          <TripMenu label={t("menu")} {...sheetContext(view)} />
        </div>
        {tab ? <TabNav tabs={tabs} current={tab} label={t("tabsLabel")} /> : null}
      </StickyHead>
      {kpi ? <div className={styles.tail}>{kpi}</div> : null}
    </>
  );
}
