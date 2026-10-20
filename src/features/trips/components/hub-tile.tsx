import Link from "next/link";
import type { ReactNode } from "react";
import { Card, Tile, type TileTone } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./hub-tile.module.css";

export interface HubTileProps {
  href: string;
  icon: IconName;
  tone: TileTone;
  title: string;
  meta: string;
  /** To-do edge on the left (like F-044) – modules where the viewer has something to do. */
  todo?: boolean | undefined;
}

/**
 * Tile of the trip hub (phase 3, ux-spec §14.4, U-21 b/c): one link per card (single focus
 * target, ≥ 64 px) – icon tile 40, title, meta line, chevron. The accessible name is the whole
 * content («Abstimmungsergebnis – 7 von 7 haben abgestimmt»).
 */
export function HubTile({ href, icon, tone, title, meta, todo = false }: HubTileProps) {
  return (
    <Card as="li" interactive padding="none" className={cx(styles.tile, todo && styles.todo)}>
      <Link className={styles.link} href={href}>
        <Tile icon={icon} tone={tone} />
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className="visually-hidden">{" – "}</span>
          <span className={styles.meta}>{meta}</span>
        </span>
        <Icon name="chevron-right" size={20} className={styles.chevron} />
      </Link>
    </Card>
  );
}

/** Grid of hub tiles: side by side from a 21.5 em wide container on, otherwise stacked. */
export function HubTiles({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className={styles.container}>
      <ul className={styles.grid} aria-label={label}>
        {children}
      </ul>
    </div>
  );
}
