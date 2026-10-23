import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./travel-data.module.css";

/**
 * Small building blocks of the travel-details area (design-system §9.23) – usable from server
 * and client components. Icons are decorative; the text carries the meaning.
 */

/** Chip «Bucht» / «Booking» (§9.23.1) – text + `id-card`, not interactive. */
export function BookerChip({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <span className={cx(styles.bookerChip, large && styles.bookerChipLg)}>
      <Icon name="id-card" size={large ? 16 : 14} />
      <span>{label}</span>
    </span>
  );
}

export type PersonState = "released" | "open" | "declined" | "placeholder";

const STATUS_ICON = {
  released: "check",
  open: "clock",
  declined: "comment",
  placeholder: "user",
} as const;

/** Status chip of a person (§9.23.5) – never amber or red. */
export function StatusChip({ state, label }: { state: PersonState; label: string }) {
  return (
    <span className={cx(styles.status, styles[`status-${state}`])}>
      <Icon name={STATUS_ICON[state]} size={15} />
      <span>{label}</span>
    </span>
  );
}

/**
 * Preview notice «Nur Fantasiedaten» (§9.23.8, W20 H.12): warm, striped edge, tag, NOT
 * dismissible (CEO, R.9 I11-12). `action` = «Fantasiedaten einsetzen» in step 1.
 */
export function DemoNote({
  tag,
  children,
  action,
}: {
  tag: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cx(styles.demo, styles.noPrint)} role="note" data-travel-demo="">
      <Icon name="warning" size={20} />
      <div className={styles.demoBody}>
        <span className={styles.demoTag}>{tag}</span>
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}

/** Deletion line (§9.23.6): `clock` + text with the date in bold. */
export function DeleteLine({ children, small = false }: { children: ReactNode; small?: boolean }) {
  return (
    <p className={cx(styles.lineIcon, small && styles.small)}>
      <Icon name="clock" size={18} />
      <span>{children}</span>
    </p>
  );
}

/** Protection box (`shield`, §9.23.2) – who sees the details. */
export function ShieldBox({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.shield}>
      <Icon name="shield" size={18} />
      <div>
        <p>
          <strong>{title}</strong>
        </p>
        {children ? <p className={styles.muted}>{children}</p> : null}
      </div>
    </div>
  );
}

/** Amber hint (document warning, expiry before the return trip – §9.23.4). */
export function WarnBox({
  icon = "warning",
  id,
  children,
}: {
  icon?: "warning" | "clock" | "key";
  id?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.warn} id={id}>
      <Icon name={icon} size={18} />
      <p>{children}</p>
    </div>
  );
}
