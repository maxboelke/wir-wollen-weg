import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "@/lib/cx";
import styles from "./field.module.css";
import { Icon, type IconName } from "./icon";

interface FieldMessageProps {
  id: string;
  children: ReactNode;
  /** `alert` announces the message immediately (form errors after submit). */
  role?: "alert" | "status" | undefined;
  icon?: IconName | undefined;
}

/** Error text below a field: icon + text, never colour alone (design-system §9.7). */
export function FieldError({ id, children, role = "alert", icon = "warning" }: FieldMessageProps) {
  return (
    <p id={id} className={styles.error} role={role}>
      <Icon name={icon} size={18} className={styles.messageIcon} />
      <span>{children}</span>
    </p>
  );
}

export function FieldHint({ id, children }: Omit<FieldMessageProps, "role" | "icon">) {
  return (
    <p id={id} className={styles.hint}>
      {children}
    </p>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label className={styles.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Confirmed value (e.g. code verified): mint border + check. */
  success?: boolean | undefined;
  ref?: Ref<HTMLInputElement> | undefined;
}

/** Label above, input, hint and error below; 16 px text (no iOS zoom), height 48. */
export function TextField({
  id,
  label,
  hint,
  error,
  success = false,
  className,
  ref,
  ...input
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx(styles.field, className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className={styles.control}>
        <input
          ref={ref}
          id={id}
          className={cx(styles.input, success && styles.success)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {success ? <Icon name="check" size={20} className={styles.successIcon} /> : null}
      </div>
      {hint && hintId ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  hint?: ReactNode;
}

/** Native checkbox (24 px, whole row ≥ 44 px tappable). */
export function Checkbox({ label, hint, className, ...input }: CheckboxProps) {
  return (
    <label className={cx(styles.checkbox, className)}>
      <input type="checkbox" className={styles.checkboxInput} {...input} />
      <span className={styles.checkboxText}>
        <span>{label}</span>
        {hint ? <span className={styles.checkboxHint}>{hint}</span> : null}
      </span>
    </label>
  );
}
