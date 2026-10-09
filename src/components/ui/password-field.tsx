"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "@/lib/cx";
import { FieldError, FieldHint, FieldLabel } from "./field";
import styles from "./field.module.css";
import { Icon } from "./icon";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  showLabel: string;
  hideLabel: string;
  autoComplete: "current-password" | "new-password";
  ref?: Ref<HTMLInputElement> | undefined;
}

/**
 * Password input with show/hide toggle (W02 1b, ux-spec §5.1): paste and password managers
 * work (WCAG 3.3.8), the toggle is a real button with `aria-pressed`, ≥ 44 px.
 */
export function PasswordField({
  id,
  label,
  hint,
  error,
  showLabel,
  hideLabel,
  className,
  ref,
  ...input
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cx(styles.field, className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className={styles.control}>
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          className={cx(styles.input, styles.withToggle)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          {...input}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={visible}
          aria-label={showLabel}
          title={visible ? hideLabel : showLabel}
          onClick={() => {
            setVisible((value) => !value);
          }}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      </div>
      {hint && hintId ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
