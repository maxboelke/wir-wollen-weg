"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { CODE_LENGTH, normalizeCode } from "@/lib/code";
import { cx } from "@/lib/cx";
import { animate, DURATION, EASING, shake, spring, STAGGER } from "@/lib/motion";
import styles from "./code-field.module.css";
import { FieldError } from "./field";
import { Icon } from "./icon";
import { Spinner } from "./spinner";

export type CodeFieldStatus = "idle" | "checking" | "error" | "success" | "locked";

/** "Prüfe Code …" only appears after this wait (W02-08). */
export const CHECKING_SPINNER_DELAY_MS = 400;

interface CodeFieldProps {
  id: string;
  label: ReactNode;
  /** Description (aria-describedby), e.g. "Gesendet an kemal@… · gültig 15 Minuten". */
  hint?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  status?: CodeFieldStatus | undefined;
  /** Error text (status error/locked) – icon + text below the boxes. */
  error?: ReactNode;
  checkingLabel: ReactNode;
  /** Screen-reader confirmation on success, e.g. "Code bestätigt." */
  successLabel: ReactNode;
  name?: string | undefined;
  ref?: Ref<HTMLInputElement> | undefined;
}

const GROUP = CODE_LENGTH / 2;

/**
 * One-time-code field (ux-spec §4.4, design-system §9.7): technically ONE `<input>`
 * (paste, autofill `one-time-code`, screen readers), visually six boxes behind it.
 * Motion package M-1 (interaktionen.md W02-02 … W02-08); reduced motion = no scale,
 * no shake, no wave, static caret – states and texts stay the same.
 */
export function CodeField({
  id,
  label,
  hint,
  value,
  onChange,
  status = "idle",
  error,
  checkingLabel,
  successLabel,
  name = "code",
  ref,
}: CodeFieldProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const boxRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sealRef = useRef<HTMLSpanElement>(null);
  const previousValue = useRef(value);
  const previousStatus = useRef(status);
  const [focused, setFocused] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [caretKey, setCaretKey] = useState(0);

  // W02-02 / W02-03: new digits pop in; pasted codes appear left to right (≤ 120 ms).
  useLayoutEffect(() => {
    const before = previousValue.current.length;
    previousValue.current = value;
    const added = value.length - before;
    if (added <= 0) return;
    for (let i = before; i < value.length; i++) {
      animate(
        digitRefs.current[i],
        [
          { transform: "scale(0.8)", opacity: 0 },
          { transform: "scale(1)", opacity: 1 },
        ],
        {
          duration: DURATION.instant + (added > 1 ? 20 : 0),
          delay: added > 1 ? (i - before) * 20 : 0,
          easing: EASING.standard,
          fill: "backwards",
        },
      );
    }
  }, [value]);

  // Status transitions: shake once on a wrong code (W02-04), wave + seal on success (W02-05).
  useEffect(() => {
    const before = previousStatus.current;
    previousStatus.current = status;
    if (status === before) return;
    if (status === "error") shake(groupRef.current);
    if (status === "success") {
      boxRefs.current.forEach((box, i) => {
        animate(
          box,
          [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
          { duration: DURATION.fast, delay: i * STAGGER.item, easing: EASING.standard },
        );
      });
      animate(sealRef.current, [{ transform: "scale(0)" }, { transform: "scale(1)" }], {
        duration: DURATION.base,
        delay: CODE_LENGTH * STAGGER.item,
        easing: spring("soft"),
        fill: "backwards",
      });
    }
  }, [status]);

  const busy = status === "checking" || status === "success" || status === "locked";
  const activeIndex = focused && !busy && value.length < CODE_LENGTH ? value.length : -1;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => (
    <span
      key={i}
      ref={(element) => {
        boxRefs.current[i] = element;
      }}
      className={cx(
        styles.box,
        i < value.length && styles.filled,
        i === activeIndex && styles.active,
        i === GROUP - 1 && styles.groupEnd,
      )}
      style={{ "--ww-code-index": i } as CSSProperties}
    >
      <span
        ref={(element) => {
          digitRefs.current[i] = element;
        }}
        className={styles.digit}
      >
        {value[i] ?? ""}
      </span>
      {i === activeIndex ? <span key={caretKey} className={styles.caret} /> : null}
    </span>
  ));

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div
        ref={groupRef}
        className={cx(
          styles.group,
          status === "error" && styles.error,
          status === "checking" && styles.checking,
          status === "success" && styles.success,
          status === "locked" && styles.locked,
          selectedAll && value.length > 0 && status !== "locked" && styles.selected,
        )}
      >
        <span className={styles.boxes} aria-hidden="true">
          {boxes}
        </span>
        <input
          ref={ref}
          id={id}
          name={name}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH * 2}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          disabled={status === "locked"}
          readOnly={status === "checking" || status === "success"}
          aria-invalid={status === "error" || undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          onChange={(event) => {
            setCaretKey((key) => key + 1);
            onChange(normalizeCode(event.target.value));
          }}
          onFocus={() => {
            setFocused(true);
            setCaretKey((key) => key + 1);
          }}
          onBlur={() => {
            setFocused(false);
            setSelectedAll(false);
          }}
          onSelect={(event) => {
            const input = event.currentTarget;
            setSelectedAll(
              input.value.length > 0 &&
                input.selectionStart === 0 &&
                input.selectionEnd === input.value.length,
            );
          }}
        />
        <span ref={sealRef} className={styles.seal} aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          <Icon name="clock" size={16} />
          <span>{hint}</span>
        </p>
      ) : null}
      <div className={styles.messages} aria-live="polite">
        {error && errorId ? (
          <FieldError id={errorId} role={undefined} icon={status === "locked" ? "lock" : "warning"}>
            {error}
          </FieldError>
        ) : null}
        {status === "checking" ? (
          // W02-08: only visible after 400 ms of waiting (CSS delay, no timer state).
          <p
            className={cx(styles.status, styles.delayed)}
            style={{ animationDelay: `${String(CHECKING_SPINNER_DELAY_MS)}ms` }}
          >
            <Spinner />
            <span>{checkingLabel}</span>
          </p>
        ) : null}
        {status === "success" ? (
          <p className={cx(styles.status, styles.successText)}>
            <span>{successLabel}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
