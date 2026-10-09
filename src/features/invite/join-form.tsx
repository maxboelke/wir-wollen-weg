"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, TextField } from "@/components/ui/field";
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
  const error = state.error ? t(`auth.errors.${state.error}`) : undefined;

  return (
    <form className={styles.form} action={formAction} noValidate>
      {currentName ? (
        <>
          <p className={styles.lead}>{t("invite.joinAs", { name: currentName })}</p>
          {error ? <FieldError id={`${ids}-error`}>{error}</FieldError> : null}
        </>
      ) : (
        <>
          <h2 className={styles.heading}>{t("auth.nameTitle")}</h2>
          <TextField
            id={`${ids}-name`}
            label={t("auth.nameLabel")}
            type="text"
            name="name"
            autoComplete="nickname"
            maxLength={40}
            required
            error={error}
          />
        </>
      )}
      <Button type="submit" block loading={pending} loadingLabel={t("invite.joining")}>
        {t("invite.confirmJoin")}
      </Button>
    </form>
  );
}
