"use client";

import { useTranslations } from "next-intl";
import { formatCountdown } from "@/lib/pending-auth";
import styles from "./email-access-form.module.css";

interface ResendCodeProps {
  /** Seconds until a new code may be requested (0 = now). */
  secondsLeft: number;
  busy: boolean;
  onResend: () => void;
}

/**
 * «Neuen Code senden» with countdown «Neuer Code in 0:27» (ux-spec §4.4, W02-07): the
 * number changes once per second without animation (G-16); screen readers hear only
 * "now available" once, not every second.
 */
export function ResendCode({ secondsLeft, busy, onResend }: ResendCodeProps) {
  const t = useTranslations("auth");
  const waiting = secondsLeft > 0;
  return (
    <>
      <button
        type="button"
        className={styles.resend}
        aria-disabled={waiting || busy || undefined}
        onClick={() => {
          if (!waiting && !busy) onResend();
        }}
      >
        {waiting ? (
          <span aria-hidden="true" className={styles.countdown}>
            {t("resendCountdown", { time: formatCountdown(secondsLeft) })}
          </span>
        ) : null}
        <span className={waiting ? "visually-hidden" : undefined}>{t("resend")}</span>
      </button>
      <span className="visually-hidden" role="status">
        {waiting ? "" : t("resendAvailable")}
      </span>
    </>
  );
}
