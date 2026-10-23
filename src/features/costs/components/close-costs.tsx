"use client";

import { useTranslations } from "next-intl";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import styles from "./costs.module.css";

/**
 * Body of the dialog «Abrechnung abschließen?» (W19 D.9) – in the cockpit (D1) and on
 * `/costs/balances`. With open settlements: warning (amber) and «Trotzdem abschließen»; the
 * default focus is on «Abbrechen» (the first button).
 */
export function CloseCostsBody({
  open,
  pending,
  onConfirm,
  onCancel,
}: {
  open: number;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("closeCosts");
  const tCommon = useTranslations("common");
  return (
    <div className={styles.sheetBody}>
      {open > 0 ? (
        <Banner tone="warning" role="note">
          {t("warning", { count: open })}
        </Banner>
      ) : (
        <p>{t("text")}</p>
      )}
      <div className={styles.sheetActions}>
        <Button variant="secondary" size="md" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button size="md" loading={pending} onClick={onConfirm} data-close-costs="">
          {open > 0 ? t("confirmAnyway") : t("confirm")}
        </Button>
      </div>
    </div>
  );
}
