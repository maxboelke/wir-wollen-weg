import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./button.module.css";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export interface ButtonContentProps {
  icon?: IconName | undefined;
  iconEnd?: IconName | undefined;
  loading?: boolean | undefined;
  loadingLabel?: ReactNode;
  children: ReactNode;
}

/**
 * Label + icons. Both labels share one grid cell so the width never jumps when the
 * loading label appears (design-system §9.1, motion-system §5.9).
 */
export function ButtonContent({
  icon,
  iconEnd,
  loading,
  loadingLabel,
  children,
}: ButtonContentProps) {
  const lead = loading ? <Spinner /> : icon ? <Icon name={icon} size={20} /> : null;
  return (
    <>
      {lead}
      <span className={styles.labels}>
        <span className={cx(styles.label, loading && loadingLabel ? styles.hidden : undefined)}>
          {children}
        </span>
        {loadingLabel ? (
          <span
            className={cx(styles.label, loading ? undefined : styles.hidden)}
            aria-hidden={!loading}
          >
            {loadingLabel}
          </span>
        ) : null}
      </span>
      {iconEnd && !loading ? <Icon name={iconEnd} size={20} /> : null}
    </>
  );
}
