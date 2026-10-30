"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { buttonClassName } from "@/components/ui/button-styles";
import type { FeedbackConfig } from "@/lib/beta-config";
import { APP_VERSION, feedbackArea, feedbackDevice } from "@/lib/pwa";
import { isStandalone } from "@/lib/use-standalone";
import styles from "../beta.module.css";

interface FeedbackProps {
  config: FeedbackConfig;
  open: boolean;
  onClose: () => void;
}

/**
 * W23 D.2 – «Feedback geben»: a small sheet that says where the message goes (WhatsApp to the
 * client, or mail). The pre-filled text holds the view, device, «installed» and the version –
 * never trip names, ids, names or e-mail addresses. Number/address come from the environment
 * (FEEDBACK_*), missing ones hide their button.
 */
export function Feedback({ config, open, onClose }: FeedbackProps) {
  const t = useTranslations("feedback");
  const tCommon = useTranslations("common");
  const tApp = useTranslations("app");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) return;
    const device = feedbackDevice(navigator.userAgent, navigator.maxTouchPoints);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- page title/user agent only readable in the browser
    setBody(
      t("body", {
        area: feedbackArea(document.title, tApp("name")),
        device: t(`devices.${device}`),
        installed: isStandalone() ? t("yes") : t("no"),
        version: APP_VERSION,
      }),
    );
  }, [open, t, tApp]);

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={t("heading")} closeLabel={tCommon("close")}>
        <div className={styles.form}>
          <p>{t("intro")}</p>
          {config.whatsapp ? (
            <a
              className={buttonClassName({ block: true })}
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(body)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("whatsapp")}
            </a>
          ) : null}
          {config.email ? (
            <a
              className={buttonClassName({ variant: "secondary", block: true })}
              href={`mailto:${config.email}?subject=${encodeURIComponent(t("subject"))}&body=${encodeURIComponent(body)}`}
            >
              {t("mail")}
            </a>
          ) : null}
          <p className={styles.small}>{t("privacy")}</p>
        </div>
      </BottomSheet>
    </>
  );
}
