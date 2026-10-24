import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PhaseDot } from "@/components/ui/cockpit";
import { Icon } from "@/components/ui/icon";
import { showTabs, type TripTab } from "@/lib/trip-status";
import type { TripView } from "../load";
import { tripPath } from "../paths";
import { sheetContext } from "../sheet-context";
import { StickyHead, TabNav, type TabLink } from "./cockpit-client";
import { TripMenu } from "./trip-menu";
import styles from "./trip-cockpit.module.css";

export const TAB_ORDER: TripTab[] = ["overview", "days", "group", "poll"];

interface TripCockpitProps {
  view: TripView;
  /**
   * Active tab; null on sub-pages (invite, settings, phase-3 «Abstimmungsergebnis») – then no
   * tab bar, back goes to the trip. Phase 3 has no tab bar at all (ux-spec §14.4).
   */
  tab: TripTab | null;
  /** Second line under the trip name on sub-pages (e.g. «Reise bearbeiten»). */
  subtitle?: string | undefined;
  /** At most one KPI (ux-spec §4.10) – scrolls away, only row 1 + tabs stick. */
  kpi?: ReactNode;
  /**
   * Phase-3 cockpit «Reiseverlauf» (W16 v2.1): the trip name is the page's h1, the phase line
   * text and its leading symbol (mini ring, D-42) come from the way, plus a screen-reader
   * sentence right after h1 («Noch 41 Tage bis zur Abreise.»).
   */
  hub?: { phaseText: string; phaseLead: ReactNode; srSentence: string } | undefined;
  /** Extra button in row 1 before «⋯» (e.g. «Bearbeiten» on the info page, W22 C). */
  action?: ReactNode;
  /** Back button target and name instead of «Meine Reisen» / «Zurück zur Reise». */
  back?: { href: string; label: string } | undefined;
}

/**
 * Trip cockpit (design-system §9.2–9.4, ux-spec §3/§4.10, W07 B): no global header in
 * trips; Indigo head with back button, trip name + phase line, «⋯» trip menu and the tab
 * pills. Phase line «Tage sammeln · 5/7 fertig» reads «5 von 7 fertig» to screen readers.
 */
export async function TripCockpit({
  view,
  tab,
  subtitle,
  kpi,
  hub,
  action,
  back,
}: TripCockpitProps) {
  const [t, menuContext] = await Promise.all([getTranslations("trip"), sheetContext(view, tab)]);
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
            href={back?.href ?? (tab ? "/trips" : tripPath(trip.publicId))}
            aria-label={back?.label ?? (tab ? t("back") : t("backToTrip"))}
          >
            <Icon name="arrow-left" size={20} />
          </Link>
          <div className={styles.titleBlock}>
            {hub ? (
              <>
                <h1 className={styles.title} id="trip-title" tabIndex={-1}>
                  {trip.name}
                </h1>
                <p className="visually-hidden">{hub.srSentence}</p>
              </>
            ) : (
              <p className={styles.title}>{trip.name}</p>
            )}
            <p className={styles.phase}>
              {hub ? hub.phaseLead : <PhaseDot phase={phase} />}
              <span>{hub ? hub.phaseText : (subtitle ?? phaseLine)}</span>
            </p>
          </div>
          {action}
          <TripMenu label={t("menu")} {...menuContext} />
        </div>
        {tab && showTabs(trip) ? <TabNav tabs={tabs} current={tab} label={t("tabsLabel")} /> : null}
      </StickyHead>
      {kpi ? <div className={styles.tail}>{kpi}</div> : null}
    </>
  );
}
