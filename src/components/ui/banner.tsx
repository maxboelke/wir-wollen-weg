import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./banner.module.css";
import { Icon, type IconName } from "./icon";

export type BannerTone = "info" | "warning" | "success" | "danger";

const ICONS: Record<BannerTone, IconName> = {
  info: "info",
  warning: "warning",
  success: "success",
  danger: "warning",
};

interface BannerProps {
  tone?: BannerTone | undefined;
  children: ReactNode;
  action?: ReactNode;
  /** `status` for polite announcements, `alert` for errors that need action. */
  role?: "status" | "alert" | "note" | undefined;
  className?: string | undefined;
}

/** Info / warning / success / error hint: tint + text colour + icon (design-system §9.18). */
export function Banner({ tone = "info", children, action, role, className }: BannerProps) {
  return (
    <div className={cx(styles.banner, styles[tone], className)} role={role}>
      <Icon name={ICONS[tone]} size={20} className={styles.icon} />
      <div className={styles.body}>{children}</div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
