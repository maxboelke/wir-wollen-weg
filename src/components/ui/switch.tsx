"use client";

import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./icon";
import styles from "./switch.module.css";

interface SwitchProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * Shown "on" but not operable, with the reason below (e.g. the device already reduces
   * motion – design-system §9.20, ux-spec §7.5).
   */
  lockedReason?: ReactNode;
  className?: string | undefined;
}

/** Switch (`role="switch"`), whole row ≥ 44 px tappable; knob slides (G-12). */
export function Switch({
  label,
  description,
  checked,
  onChange,
  lockedReason,
  className,
}: SwitchProps) {
  const id = useId();
  const locked = lockedReason !== undefined && lockedReason !== null;
  const on = locked || checked;
  const describedBy = [description ? `${id}-desc` : null, locked ? `${id}-reason` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cx(styles.row, locked && styles.locked, className)}>
      <label className={styles.text} htmlFor={`${id}-switch`}>
        <span id={`${id}-label`} className={styles.label}>
          {label}
        </span>
        {description ? (
          <span id={`${id}-desc`} className={styles.description}>
            {description}
          </span>
        ) : null}
      </label>
      <button
        id={`${id}-switch`}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy || undefined}
        aria-disabled={locked || undefined}
        className={styles.switch}
        onClick={() => {
          if (!locked) onChange(!checked);
        }}
      >
        <span className={styles.knob}>
          {on ? <Icon name="check" size={14} className={styles.check} /> : null}
        </span>
      </button>
      {locked ? (
        <p id={`${id}-reason`} className={styles.reason}>
          <Icon name="lock" size={16} />
          <span>{lockedReason}</span>
        </p>
      ) : null}
    </div>
  );
}
