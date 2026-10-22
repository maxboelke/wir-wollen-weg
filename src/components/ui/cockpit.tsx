import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./cockpit.module.css";
import { Icon } from "./icon";
import { ProgressRing } from "./progress-ring";

export type Phase = "collect" | "vote" | "fixed" | "past";

/** 8 px dot in front of the phase text – an extra, never the only information (§9.14). */
export function PhaseDot({ phase }: { phase: Phase }) {
  return <span className={cx(styles.dot, styles[phase])} aria-hidden="true" />;
}

export interface CockpitTab {
  href: string;
  label: string;
  current?: boolean | undefined;
}

interface CockpitHeaderProps {
  /** "full": with optional KPI box below the tabs · "compact": sticky, 104 px, no KPI (B-3). */
  variant?: "full" | "compact" | undefined;
  title: string;
  /** Heading level of the trip name (h1 on the overview, otherwise a div). */
  titleAs?: "h1" | "p" | undefined;
  back: { href: string; label: string };
  phase?: { phase: Phase; label: ReactNode } | undefined;
  /** Trip menu button ("⋯") – rendered by the caller (needs client behaviour). */
  menu?: ReactNode;
  tabs?: CockpitTab[] | undefined;
  tabsLabel?: string | undefined;
  /** At most one KPI per cockpit (ux-spec §4.10); hidden in the compact variant. */
  children?: ReactNode;
}

/** Trip cockpit header: Indigo surface, light spots, phase line, tab pills (design-system §9.2). */
export function CockpitHeader({
  variant = "full",
  title,
  titleAs: Title = "p",
  back,
  phase,
  menu,
  tabs,
  tabsLabel,
  children,
}: CockpitHeaderProps) {
  return (
    <header className={cx(styles.cockpit, variant === "compact" && styles.compact)}>
      <div className={styles.row}>
        <Link className={styles.roundButton} href={back.href} aria-label={back.label}>
          <Icon name="arrow-left" size={20} />
        </Link>
        <div className={styles.titleBlock}>
          <Title className={styles.title}>{title}</Title>
          {phase ? (
            <p className={styles.phase}>
              <PhaseDot phase={phase.phase} />
              <span>{phase.label}</span>
            </p>
          ) : null}
        </div>
        {menu}
      </div>
      {tabs && tabs.length > 0 ? (
        <nav className={styles.tabs} aria-label={tabsLabel}>
          <ul className={styles.track}>
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  className={styles.tab}
                  href={tab.href}
                  aria-current={tab.current ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {variant === "full" && children ? <div className={styles.kpiSlot}>{children}</div> : null}
    </header>
  );
}

/** Round 44 px icon button on Indigo (back, menu). */
export function CockpitIconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button type="button" className={styles.roundButton} aria-label={label}>
      {children}
    </button>
  );
}

interface KpiBoxProps {
  value: number;
  max: number;
  /** Main sentence, e.g. "5 von 7 haben eingetragen" (number never counts up, G-16). */
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  /** The box is (inside) a button: chevron at the end, no action (ux-spec §14.2, U-18). */
  chevron?: boolean | undefined;
}

/**
 * KPI box in the cockpit: ring 52 px + sentence + optional mint button (design-system §9.3).
 * Only phrasing content (spans), so the whole box can sit inside a `<button>`.
 */
export function KpiBox({ value, max, title, text, action, chevron = false }: KpiBoxProps) {
  return (
    <span className={cx(styles.kpi, chevron && styles.kpiWithChevron)}>
      <ProgressRing value={value} max={max} tone="onBrand" className={styles.kpiRing}>
        <Icon name="users" size={20} />
      </ProgressRing>
      <span className={styles.kpiText}>
        <span className={styles.kpiTitle}>{title}</span>
        {text ? <span className={styles.kpiDetail}>{text}</span> : null}
      </span>
      {chevron ? (
        <span className={styles.kpiChevron} aria-hidden="true">
          <Icon name="chevron-right" size={20} />
        </span>
      ) : action ? (
        <span className={styles.kpiAction}>{action}</span>
      ) : null}
    </span>
  );
}
