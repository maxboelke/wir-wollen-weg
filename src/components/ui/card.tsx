import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./card.module.css";
import { Icon, type IconName } from "./icon";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "li" | "aside";
  /** Hover shadow + press for cards that contain a stretched link (ux-spec §4.8). */
  interactive?: boolean | undefined;
  padding?: "md" | "lg" | "none" | undefined;
  children: ReactNode;
}

/** White card, radius 24, soft shadow, no outline (design-system §9.6). */
export function Card({
  as: Element = "div",
  interactive = false,
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Element
      className={cx(
        styles.card,
        interactive && styles.interactive,
        padding === "lg" && styles.padLg,
        padding === "none" && styles.padNone,
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
}

export type TileTone = "lavender" | "mint" | "sun" | "coral" | "brand";

interface TileProps {
  icon: IconName;
  tone?: TileTone | undefined;
  size?: "md" | "sm" | undefined;
  className?: string | undefined;
}

/** Icon tile (40 / 34 px) – always next to text, never the only information (§9.5). */
export function Tile({ icon, tone = "lavender", size = "md", className }: TileProps) {
  return (
    <span
      className={cx(styles.tile, styles[tone], size === "sm" && styles.tileSm, className)}
      aria-hidden="true"
    >
      <Icon name={icon} size={size === "sm" ? 20 : 22} />
    </span>
  );
}
