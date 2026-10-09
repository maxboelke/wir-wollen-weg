"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { setMotionPreference, watchSystemMotion } from "@/lib/motion";
import { updateReduceMotion } from "../actions";
import styles from "./account.module.css";

const DEVICE_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * W13 «Darstellung» – switch «Bewegung reduzieren» (Q17 a, ux-spec §7.5, W13-01): off =
 * follow the device; on = reduced everywhere. Applies at once (`data-motion` via the
 * `ww-motion` cookie), saves in the account, snackbar «Gespeichert». If the device already
 * reduces motion, the switch shows "on", is not operable and says why.
 */
export function AppearanceCard({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations("settings.motion");
  const tAccount = useTranslations("account.appearance");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const id = useId();
  const [, startTransition] = useTransition();
  const [reduce, setReduce] = useState(reduceMotion);
  const [device, setDevice] = useState(false);

  useEffect(() => {
    const read = () => {
      setDevice(window.matchMedia(DEVICE_QUERY).matches);
    };
    read();
    return watchSystemMotion(read);
  }, []);

  return (
    <Card as="section" aria-labelledby={`${id}-title`} className={styles.card}>
      <h2 id={`${id}-title`} className={styles.cardTitle}>
        {tAccount("title")}
      </h2>
      <Switch
        label={t("label")}
        description={reduce || device ? t("help") : `${t("help")} ${t("off")}`}
        checked={reduce}
        lockedReason={device ? t("device") : undefined}
        onChange={(next) => {
          // Effect first (same frame), then persist (state first, motion second).
          setMotionPreference(next);
          setReduce(next);
          startTransition(async () => {
            const result = await updateReduceMotion(next);
            if (result.ok) toast({ message: tCommon("saved") });
          });
        }}
      />
    </Card>
  );
}
