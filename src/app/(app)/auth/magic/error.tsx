"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import styles from "@/features/auth/components/email-access-form.module.css";

/**
 * Fallback only: unexpected render errors on /auth/magic. Network failures while redeeming
 * the link are shown inline by MagicLinkForm (R-013, Flow H.5 3e).
 */
export default function MagicLinkError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("magic");
  return (
    <div className={styles.step}>
      <h1 className={styles.heading}>{t("heading")}</h1>
      <FieldError id="magic-error">{t("failed")}</FieldError>
      <Button block onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
