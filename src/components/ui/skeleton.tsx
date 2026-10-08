import { cx } from "@/lib/cx";
import styles from "./skeleton.module.css";

/** Placeholder shape while content loads (G-07: pulses at most 4 times, then static). */
export function Skeleton({
  width = "100%",
  height = "1em",
  round = false,
  className,
}: {
  width?: string | undefined;
  height?: string | undefined;
  round?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <span
      className={cx(styles.skeleton, round && styles.round, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
