"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import styles from "./stays.module.css";

/** «Unterkunft ohne App erledigt?» (UX-9, W18 E.7.5) – [Abbrechen] [Abhaken]. */
export function StayWithoutAppConfirm({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("stays.withoutApp");
  const tCommon = useTranslations("common");
  return (
    <div className={styles.sheetBody}>
      <p>{t("text")}</p>
      <div className={styles.sheetActions}>
        <Button variant="secondary" size="md" data-autofocus="" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button size="md" loading={pending} onClick={onConfirm}>
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}
