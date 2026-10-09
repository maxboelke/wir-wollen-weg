"use client";

import { useId, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { animate, DURATION, SCALE, spring } from "@/lib/motion";
import styles from "./radio-group.module.css";

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  /** Language of the label, e.g. "English" in a German UI (ux-spec §7.1). */
  lang?: string | undefined;
}

interface RadioGroupProps<T extends string> {
  legend: ReactNode;
  name: string;
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "row": options side by side when they fit (e.g. Deutsch / English). */
  layout?: "column" | "row" | undefined;
  className?: string | undefined;
}

/**
 * Radio group (R-018, design-system §9 states): native radios in a fieldset with a visible
 * legend – arrow keys, screen readers and forms work as usual. 24 px control, whole row
 * ≥ 44 px tappable. G-12: the dot pops in on selection (reduced: appears at once).
 */
export function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  layout = "column",
  className,
}: RadioGroupProps<T>) {
  const id = useId();
  const dots = useRef(new Map<string, HTMLSpanElement>());
  return (
    <fieldset className={cx(styles.group, className)}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={cx(styles.options, layout === "row" && styles.row)}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const hintId = option.hint ? `${optionId}-hint` : undefined;
          return (
            <label key={option.value} className={styles.option} htmlFor={optionId}>
              <input
                id={optionId}
                className={styles.input}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                aria-describedby={hintId}
                onChange={() => {
                  onChange(option.value);
                  animate(
                    dots.current.get(option.value),
                    [{ transform: `scale(${SCALE.pop})` }, { transform: "scale(1)" }],
                    { duration: DURATION.fast, easing: spring("soft") },
                  );
                }}
              />
              <span className={styles.control} aria-hidden="true">
                <span
                  className={styles.dot}
                  ref={(element) => {
                    if (element) dots.current.set(option.value, element);
                    else dots.current.delete(option.value);
                  }}
                />
              </span>
              <span className={styles.text}>
                <span lang={option.lang}>{option.label}</span>
                {option.hint ? (
                  <span id={hintId} className={styles.hint}>
                    {option.hint}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
