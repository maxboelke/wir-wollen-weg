import { cx } from "@/lib/cx";
import type { IconName } from "./icon-names";
import styles from "./icon.module.css";

export type { IconName } from "./icon-names";

interface IconProps {
  name: IconName;
  /** 16 / 20 / 24 (design-system §7); 22 in tiles. */
  size?: number;
  className?: string | undefined;
  /** Accessible name – only for icons that stand alone (prefer a label on the button). */
  label?: string | undefined;
}

/** Icon from the sprite `public/icons.svg` (design-system §11). Decorative by default. */
export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      className={cx(styles.icon, className)}
      width={size}
      height={size}
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <use href={`/icons.svg#ww-icon-${name}`} />
    </svg>
  );
}
