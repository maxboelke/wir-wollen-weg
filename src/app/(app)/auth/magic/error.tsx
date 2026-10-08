"use client";

import { useTranslations } from "next-intl";
import ui from "@/components/ui.module.css";

/**
 * Network failure while redeeming the magic link (Flow H.5 3e). The token is not consumed
 * yet, so "Try again" simply shows the landing card again.
 */
export default function MagicLinkError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("magic");
  return (
    <div className={ui.stack}>
      <h1>{t("heading")}</h1>
      <p className={ui.error} role="alert">
        {t("failed")}
      </p>
      <p>
        <button className={ui.button} type="button" onClick={reset}>
          {t("retry")}
        </button>
      </p>
    </div>
  );
}
