"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import ui from "@/components/ui.module.css";
import type { ActionResult } from "../auth/actions";
import styles from "../auth/components/email-access-form.module.css";

interface JoinFormProps {
  currentName: string;
  /** Server action (token bound) – the form also works before hydration. */
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
}

/** Signed-in, not yet a member: confirm joining (asks for a name if the account has none). */
export function JoinForm({ currentName, action }: JoinFormProps) {
  const t = useTranslations();
  const ids = useId();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className={styles.form} action={formAction} noValidate>
      {currentName ? (
        <p>{t("invite.joinAs", { name: currentName })}</p>
      ) : (
        <>
          <label className={styles.label} htmlFor={`${ids}-name`}>
            {t("auth.nameLabel")}
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
          />
        </>
      )}
      {state.error ? (
        <p className={ui.error} role="alert">
          {t(`auth.errors.${state.error}`)}
        </p>
      ) : null}
      <button className={ui.button} type="submit" disabled={pending}>
        {t("invite.confirmJoin")}
      </button>
    </form>
  );
}
