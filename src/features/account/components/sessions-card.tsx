"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOutEverywhere } from "../actions";
import styles from "./account.module.css";

/** W13 «Sitzungen» (Flow H.2): sign out on all devices after a confirmation. */
export function SessionsCard() {
  const t = useTranslations("account.sessions");
  const tCommon = useTranslations("common");
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Card as="section" aria-labelledby={`${id}-title`} className={styles.card}>
      <h2 id={`${id}-title`} className={styles.cardTitle}>
        {t("title")}
      </h2>
      <Button
        variant="secondary"
        size="md"
        icon="logout"
        className={styles.backLink}
        onClick={() => {
          setOpen(true);
        }}
      >
        {t("signOutEverywhere")}
      </Button>
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t("confirmTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.form}>
          <p>{t("confirmText")}</p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setOpen(false);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <form action={signOutEverywhere}>
              <Button type="submit" variant="danger" size="md">
                {t("confirm")}
              </Button>
            </form>
          </div>
        </div>
      </BottomSheet>
    </Card>
  );
}
