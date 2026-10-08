import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./chip.module.css";
import { Icon, type IconName } from "./icon";

export type ChipTone =
  "yes" | "maybe" | "no" | "holiday" | "info" | "neutral" | "collect" | "vote" | "fixed" | "past";

interface ChipProps {
  tone?: ChipTone | undefined;
  icon?: IconName | undefined;
  children: ReactNode;
  className?: string | undefined;
}

/** Status/extra chip (not interactive): pill 26 px, 13/700, icon 15 (design-system §9.14). */
export function Chip({ tone = "neutral", icon, children, className }: ChipProps) {
  return (
    <span className={cx(styles.chip, styles[tone], className)}>
      {tone === "holiday" && !icon ? <span className={styles.dogEar} aria-hidden="true" /> : null}
      {icon ? <Icon name={icon} size={15} /> : null}
      <span>{children}</span>
    </span>
  );
}
