"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { Icon } from "@/components/ui/icon";
import { CODE_LENGTH } from "@/lib/code";
import { useAccountErrorMessage } from "@/features/account/components/account-errors";
import { codeStatusFor } from "@/features/account/components/reauth-step";
import type { AccountResult } from "@/features/account/actions";
import { confirmTravelCodeAction, sendTravelCodeAction } from "../actions";
import styles from "./travel-data.module.css";

/**
 * Re-authentication for document numbers (R.9 I11-08, W20 H.7): code only – a password does
 * not count. After the confirmation the original action runs at once (no second tap); cancel
 * keeps everything masked and writes no log row.
 */
export function TravelReauth({ email, onConfirmed }: { email: string; onConfirmed: () => void }) {
  const t = useTranslations("travelData.reauth");
  const tAuth = useTranslations("auth");
  const errorMessage = useAccountErrorMessage();
  const id = useId();
  const codeRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AccountResult>({});
  const [status, setStatus] = useState<CodeFieldStatus>("idle");
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      const response = await sendTravelCodeAction();
      setResult(response);
      if (response.ok) {
        flushSync(() => {
          setSent(true);
          setResult({});
          setCode("");
          setStatus("idle");
        });
        codeRef.current?.focus();
      }
    });
  }

  function check(value: string) {
    setStatus("checking");
    startTransition(async () => {
      const checked = await confirmTravelCodeAction(value);
      setResult(checked);
      setStatus(codeStatusFor(checked));
      if (checked.ok) onConfirmed();
      else if (codeStatusFor(checked) !== "locked") {
        requestAnimationFrame(() => {
          codeRef.current?.focus();
          codeRef.current?.select();
        });
      }
    });
  }

  const message = errorMessage(result);
  return (
    <div className={styles.stack} data-travel-reauth="">
      <div className={styles.cardHead}>
        <span className={styles.logIcon} aria-hidden="true">
          <Icon name="key" size={18} />
        </span>
        <p className={styles.muted}>{t("intro")}</p>
      </div>
      {sent ? (
        <form
          className={styles.stack}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (status === "locked") send();
            else if (code.length === CODE_LENGTH) check(code);
          }}
        >
          <p className={styles.muted}>{t("sent", { email })}</p>
          <CodeField
            ref={codeRef}
            id={`${id}-code`}
            label={tAuth("codeLabel")}
            hint={tAuth("codeHint", { email })}
            value={code}
            onChange={(value) => {
              if (status === "error") {
                setStatus("idle");
                setResult({});
              }
              setCode(value);
              if (value.length === CODE_LENGTH) check(value);
            }}
            status={status}
            error={message}
            checkingLabel={tAuth("checkingCode")}
            successLabel={tAuth("codeConfirmed")}
          />
          <Button type="submit" size="md" loading={pending}>
            {status === "locked" ? tAuth("requestNewCode") : t("confirm")}
          </Button>
        </form>
      ) : (
        <>
          {message ? (
            <p className={styles.muted} role="alert">
              {message}
            </p>
          ) : null}
          <Button size="md" icon="key" loading={pending} onClick={send}>
            {t("send")}
          </Button>
        </>
      )}
    </div>
  );
}
