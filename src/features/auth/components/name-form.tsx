"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import ui from "@/components/ui.module.css";
import type { ActionResult } from "../actions";
import styles from "./email-access-form.module.css";

interface NameFormProps {
  /** Server action (returnTo bound) – the form also works before hydration. */
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
}

/** Name step for signed-in accounts without a name, e.g. after a magic link (Flow H.5 3a). */
export function NameForm({ action }: NameFormProps) {
  const t = useTranslations("auth");
  const ids = useId();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h2>{t("nameTitle")}</h2>
      <label className={styles.label} htmlFor={`${ids}-name`}>
        {t("nameLabel")}
      </label>
      <input
        id={`${ids}-name`}
        className={styles.input}
        type="text"
        name="name"
        autoComplete="nickname"
        maxLength={40}
        required
        aria-invalid={state.error === "nameRequired"}
        aria-describedby={state.error ? `${ids}-error` : undefined}
      />
      {state.error ? (
        <p id={`${ids}-error`} className={ui.error} role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}
      <button className={ui.button} type="submit" disabled={pending}>
        {t("saveName")}
      </button>
    </form>
  );
}
