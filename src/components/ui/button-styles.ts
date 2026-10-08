import { cx } from "@/lib/cx";
import styles from "./button.module.css";

export type ButtonVariant =
  /** Indigo (light) / Mint (dark) – one main action per screen. */
  | "primary"
  /** Mint on Indigo – main action inside the cockpit. */
  | "accent"
  | "secondary"
  /** Transparent with white outline – secondary action inside the cockpit. */
  | "secondaryOnBrand"
  | "text"
  | "tool"
  | "danger"
  | "dangerQuiet";

export type ButtonSize = "lg" | "md" | "sm";

export interface ButtonStyleOptions {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  block?: boolean | undefined;
  className?: string | undefined;
}

/** Class names for anything that should look like a button (design-system §9.1). */
export function buttonClassName({
  variant = "primary",
  size = "lg",
  block = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cx(styles.button, styles[variant], styles[size], block && styles.block, className);
}
