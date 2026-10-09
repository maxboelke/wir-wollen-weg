"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { regenerateInviteAction, setJoinOpenAction } from "../actions";
import styles from "./invite-admin.module.css";

/**
 * Organiser-only controls on /invite (F-004, W06): «Neue Mitglieder können beitreten» and
 * «Link erneuern» (confirmation: the old link stops working at once). Both checked on the
 * server again.
 */
export function InviteAdmin({ publicId, joinOpen }: { publicId: string; joinOpen: boolean }) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(joinOpen);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card as="section" aria-labelledby="invite-admin" className={styles.card}>
      <h2 id="invite-admin" className={styles.title}>
        {t("orgaTitle")}
      </h2>
      <Switch
        label={t("joinOpen")}
        description={open ? undefined : t("joinOpenHint")}
        checked={open}
        onChange={(next) => {
          setOpen(next);
          setError(null);
          startTransition(async () => {
            const result = await setJoinOpenAction(publicId, next);
            if (!result.ok) {
              setOpen(!next);
              setError(tCommon("genericError"));
              return;
            }
            toast({ message: next ? t("joinOpened") : t("joinClosedToast") });
            router.refresh();
          });
        }}
      />
      <Button
        variant="text"
        size="sm"
        icon="link"
        onClick={() => {
          setConfirm(true);
        }}
      >
        {t("renew")}
      </Button>
      {error ? (
        <Banner tone="danger" role="alert">
          {error}
        </Banner>
      ) : null}
      <BottomSheet
        open={confirm}
        onClose={() => {
          setConfirm(false);
        }}
        title={t("renewTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{t("renewText")}</p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setConfirm(false);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await regenerateInviteAction(publicId);
                  setConfirm(false);
                  if (!result.ok) {
                    setError(tCommon("genericError"));
                    return;
                  }
                  toast({ message: t("renewed") });
                  router.refresh();
                });
              }}
            >
              {t("renewConfirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </Card>
  );
}
