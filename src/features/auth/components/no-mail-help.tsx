"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { NO_MAIL_HELP_DELAY_MS } from "@/lib/pending-auth";
import styles from "./email-access-form.module.css";

interface NoMailHelpProps {
  email: string;
  /** When the code was sent (epoch ms) – the help opens by itself 60 s later (Flow A.2). */
  sentAt: number | null;
  helpHref: string;
  canResend: boolean;
  onChangeEmail: () => void;
  onResend: () => void;
}

/** «Noch nichts da?» – spam, address, new code, link to the help page (F-051 `#code`). */
export function NoMailHelp({
  email,
  sentAt,
  helpHref,
  canResend,
  onChangeEmail,
  onResend,
}: NoMailHelpProps) {
  const t = useTranslations("auth.noMail");
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (sentAt === null) return;
    const timer = window.setTimeout(
      () => {
        if (ref.current) ref.current.open = true;
      },
      Math.max(0, sentAt + NO_MAIL_HELP_DELAY_MS - Date.now()),
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [sentAt]);

  return (
    <details ref={ref} className={styles.noMail}>
      <summary className={styles.noMailSummary}>
        <span>{t("title")}</span>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </summary>
      <ol className={styles.noMailList}>
        <li>{t("spam")}</li>
        <li>
          {t("address", { email })}{" "}
          <button type="button" className={styles.inlineLink} onClick={onChangeEmail}>
            {t("change")}
          </button>
        </li>
        <li>
          <button
            type="button"
            className={styles.inlineLink}
            aria-disabled={!canResend || undefined}
            onClick={() => {
              if (canResend) onResend();
            }}
          >
            {t("resend")}
          </button>
        </li>
      </ol>
      <a className={styles.textLink} href={helpHref}>
        {t("help")}
      </a>
    </details>
  );
}
