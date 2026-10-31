"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
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
  // The text is built while rendering the opened sheet (state adjusted during render), so the
  // links never show – or get tapped – with an empty text: an effect would fill it only after
  // the first paint of the open sheet. `open` is false on the server and during hydration, so
  // the browser-only values (title, path, user agent) are read on the client only.
  const [body, setBody] = useState("");
  const [builtFor, setBuiltFor] = useState(false);
  if (open !== builtFor) {
    setBuiltFor(open);
    if (open) {
      const device = feedbackDevice(navigator.userAgent, navigator.maxTouchPoints);
      setBody(
        t("body", {
          area: feedbackArea(document.title, tApp("name"), window.location.pathname, {
            invite: t("areas.invite"),
            travelData: t("areas.travelData"),
          }),
          device: t(`devices.${device}`),
          installed: isStandalone() ? t("yes") : t("no"),
          version: APP_VERSION,
        }),
      );
    }
  }

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
