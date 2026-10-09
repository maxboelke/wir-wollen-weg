"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { animate, DURATION, SCALE, spring } from "@/lib/motion";
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
  const knobRef = useRef<HTMLSpanElement>(null);
  const wasOn = useRef(on);

  // W13-01 / G-12: the check in the knob pops in when switched on (not on first render).
  // With reduced motion `animate` does nothing – which, when turning reduction ON, already
  // applies to this very tap ("the reduction acts on the knob itself").
  useEffect(() => {
    if (on && !wasOn.current) {
      animate(
        knobRef.current?.firstElementChild,
        [{ transform: `scale(${SCALE.pop})` }, { transform: "scale(1)" }],
        { duration: DURATION.fast, easing: spring("soft") },
      );
    }
    wasOn.current = on;
  }, [on]);
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
        <span ref={knobRef} className={styles.knob}>
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
