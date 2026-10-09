"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { updateName, type AccountResult } from "../actions";
import styles from "./account.module.css";

/** W13 «Profil»: display name, saved with its own button (Flow I.1 #1). */
export function ProfileCard({ name }: { name: string }) {
  const t = useTranslations("account.profile");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("auth.errors");
  const toast = useToast();
  const id = useId();
  const [state, action, pending] = useActionState<AccountResult, FormData>(updateName, {});

  useEffect(() => {
    if (state.ok) toast({ message: t("saved") });
  }, [state, t, toast]);

  return (
    <Card as="section" aria-labelledby={`${id}-title`} className={styles.card}>
      <h2 id={`${id}-title`} className={styles.cardTitle}>
        {t("title")}
      </h2>
      <form className={styles.form} action={action} noValidate>
        <TextField
          id={`${id}-name`}
          label={t("nameLabel")}
          hint={t("nameHint")}
          name="name"
          autoComplete="nickname"
          maxLength={40}
          required
          defaultValue={name}
          error={
            state.error
              ? tErrors(state.error === "nameRequired" ? "nameRequired" : "generic")
              : undefined
          }
        />
        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={pending}
          className={styles.backLink}
        >
          {tCommon("save")}
        </Button>
      </form>
    </Card>
  );
}
