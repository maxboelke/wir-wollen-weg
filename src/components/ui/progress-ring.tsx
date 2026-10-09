import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./progress-ring.module.css";

interface ProgressRingProps {
  value: number;
  max: number;
  /** "onBrand": mint on white 18 % (cockpit) · "light": indigo on progress-track. */
  tone?: "onBrand" | "light" | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

const RADIUS = 23;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Progress ring 52 px, stroke 6, round caps – decorative, value stands as text nearby (§9.13). */
export function ProgressRing({
  value,
  max,
  tone = "onBrand",
  className,
  children,
}: ProgressRingProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <span className={cx(styles.ring, styles[tone], className)} aria-hidden="true">
      <svg viewBox="0 0 52 52" focusable="false">
        <circle className={styles.track} cx="26" cy="26" r={RADIUS} />
        <circle
          className={styles.fill}
          cx="26"
          cy="26"
          r={RADIUS}
          strokeDasharray={`${(ratio * CIRCUMFERENCE).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`}
        />
      </svg>
      {children ? <span className={styles.center}>{children}</span> : null}
    </span>
  );
}
