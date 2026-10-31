"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { copyText } from "@/lib/clipboard";
import { detectPlatform } from "@/lib/pwa";
import { useStandalone } from "@/lib/use-standalone";
import styles from "../beta.module.css";

/**
 * W23 A.8 (end): on an invite page in Safari on iOS – somebody who already has the app on the
 * Home Screen can copy the link and paste it in the app («Einladungslink einfügen»).
 */
export function InstalledAppHint() {
  const t = useTranslations("install");
  const showToast = useToast();
  const standalone = useStandalone();
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- user agent only readable after mounting
    setIos(detectPlatform(navigator.userAgent, navigator.maxTouchPoints).platform === "ios");
  }, []);

  if (!ios || standalone) return null;
  return (
    <details className={styles.details}>
      <summary>{t("inapp.copy")}</summary>
      <div className={styles.consentBox}>
        <p className={styles.small}>{t("inviteHint")}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void copyText(window.location.href).then((ok) => {
              if (ok) showToast({ message: t("inapp.copied") });
            });
          }}
        >
          {t("inapp.copy")}
        </Button>
      </div>
    </details>
  );
}
