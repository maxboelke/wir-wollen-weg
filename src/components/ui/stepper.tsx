"use client";

import { useId, useState } from "react";
import { cx } from "@/lib/cx";
import { stepperAnnouncement } from "@/lib/stepper-announcement";
import { Icon } from "./icon";
import styles from "./stepper.module.css";

interface StepperProps {
  id: string;
  name: string;
  label: string;
  /** Current value as string ("" = not set, only for optional steppers). */
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  /** Optional: «−» at the minimum clears the value, «+» from empty starts at `min`. */
  optional?: boolean | undefined;
  /** Unit after the number, e.g. "Nächte" (plural decided by the caller). */
  unit: string;
  decreaseLabel: string;
  increaseLabel: string;
  placeholder?: string | undefined;
  /** Announced when «−» clears an optional stepper (e.g. «Ideally: not set»). */
  emptyAnnouncement?: string | undefined;
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
  onBlur?: (() => void) | undefined;
}

/**
 * Stepper (ux-spec §4.6): «−» value «+», the value is a directly editable number input
 * (announced natively), buttons ≥ 44 px, the limit disables its button – via `aria-disabled`,
 * so keyboard focus stays on it instead of falling back to <body> (R-038). Focus stays on
 * the button, so a polite live region reads the new value after «−»/«+» («5 nights»);
 * typing in the field is announced natively and does not trigger it. W05-02 (number
 * slides) is "später" in the motion catalogue – the value simply changes.
 */
export function Stepper({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  optional = false,
  unit,
  decreaseLabel,
  increaseLabel,
  placeholder,
  emptyAnnouncement = "",
  describedBy,
  invalid,
  onBlur,
}: StepperProps) {
  const unitId = useId();
  const [stepped, setStepped] = useState(false);
  const number = value === "" ? null : Number(value);
  const valid = number !== null && Number.isFinite(number);
  const canDecrease = valid ? number > min || optional : false;
  const canIncrease = valid ? number < max : true;

  function step(delta: number) {
    setStepped(true);
    if (!valid) {
      onChange(String(min));
      return;
    }
    const next = number + delta;
    if (next < min) {
      if (optional) onChange("");
      return;
    }
    onChange(String(Math.min(max, next)));
  }

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        aria-label={decreaseLabel}
        aria-controls={id}
        aria-disabled={!canDecrease || undefined}
        onClick={() => {
          if (canDecrease) step(-1);
        }}
      >
        <Icon name="minus" size={20} />
      </button>
      <span className={styles.valueBox}>
        <input
          id={id}
          name={name}
          className={cx(styles.input, invalid && styles.invalid)}
          type="number"
          inputMode="numeric"
          min={optional ? undefined : min}
          max={max}
          step={1}
          value={value}
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={[unitId, describedBy].filter(Boolean).join(" ")}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            setStepped(false);
            onChange(event.target.value);
          }}
          onBlur={onBlur}
        />
        <span id={unitId} className={styles.unit}>
          {unit}
        </span>
      </span>
      <button
        type="button"
        className={styles.button}
        aria-label={increaseLabel}
        aria-controls={id}
        aria-disabled={!canIncrease || undefined}
        onClick={() => {
          if (canIncrease) step(1);
        }}
      >
        <Icon name="plus" size={20} />
      </button>
      <span className="visually-hidden" aria-live="polite" aria-atomic="true">
        {stepperAnnouncement(stepped, value, unit, emptyAnnouncement)}
      </span>
    </div>
  );
}
