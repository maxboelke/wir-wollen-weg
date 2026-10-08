"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
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
      <h1 className={styles.heading}>{t("nameTitle")}</h1>
      <TextField
        id={`${ids}-name`}
        label={t("nameLabel")}
        type="text"
        name="name"
        autoComplete="nickname"
        maxLength={40}
        required
        error={state.error ? t(`errors.${state.error}`) : undefined}
      />
      <Button type="submit" block loading={pending} loadingLabel={t("saving")}>
        {t("saveName")}
      </Button>
    </form>
  );
}
