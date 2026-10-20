"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { resetDemoData, type ResetDemoState } from "../actions";
import styles from "./demo-inbox.module.css";

/**
 * «Demo zurücksetzen» (online preview only): collapsed by default, needs an explicit
 * confirmation checkbox (checked on the server as well).
 */
export function ResetDemoForm() {
  const t = useTranslations("demoInbox.reset");
  const [state, action, pending] = useActionState<ResetDemoState, FormData>(resetDemoData, {});
  return (
    <details className={styles.reset} open={state.error ? true : undefined}>
      <summary className={styles.resetSummary}>
        <span>{t("title")}</span>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </summary>
      <form action={action} className={styles.resetForm}>
        <p>{t("text")}</p>
        <Checkbox name="confirm" label={t("confirm")} />
        {state.error ? (
          <p className={styles.error} role="alert">
            {t(state.error)}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" loading={pending} loadingLabel={t("submitting")}>
          {t("submit")}
        </Button>
      </form>
    </details>
  );
}
