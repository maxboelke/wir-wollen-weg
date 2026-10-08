import { cx } from "@/lib/cx";
import styles from "./spinner.module.css";

/** 16 px spinner; with reduced motion three static dots (motion-system §6.2). Decorative. */
export function Spinner({ className }: { className?: string | undefined }) {
  return <span className={cx(styles.spinner, className)} aria-hidden="true" />;
}
