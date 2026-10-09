"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { PasswordField } from "@/components/ui/password-field";
import { CODE_LENGTH } from "@/lib/code";
import { formString } from "@/lib/form";
import {
  sendReauthCode,
  verifyReauthCode,
  verifyReauthPassword,
  type AccountResult,
} from "../actions";
import { useAccountErrorMessage } from "./account-errors";
import styles from "./account.module.css";

export function codeStatusFor(result: AccountResult): CodeFieldStatus {
  if (result.ok) return "success";
  if (
    result.error === "tooManyAttempts" ||
    result.error === "expired" ||
    result.error === "locked"
  ) {
    return "locked";
  }
  return result.error === "wrongCode" ? "error" : "idle";
}

interface ReauthStepProps {
  currentEmail: string;
  canUsePassword: boolean;
  /** The previous confirmation ran out (> 10 min) – say why we ask again. */
  expired?: boolean;
  onConfirmed: () => void;
}

/**
 * «Bestätige, dass du es bist» (Flow I.2 step 1, R-023): code to the current address or
 * the current password. Used before changing the e-mail and the password.
 */
export function ReauthStep({
  currentEmail,
  canUsePassword,
  expired = false,
  onConfirmed,
}: ReauthStepProps) {
  const t = useTranslations("account.email");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const errorMessage = useAccountErrorMessage();
  const id = useId();
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<"code" | "password">("code");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AccountResult>({});
  const [codeStatus, setCodeStatus] = useState<CodeFieldStatus>("idle");
  const [pending, startTransition] = useTransition();

  function sendCode() {
    startTransition(async () => {
      const response = await sendReauthCode();
      setResult(response);
      if (response.ok) {
        flushSync(() => {
          setSent(true);
          setResult({});
          setCode("");
          setCodeStatus("idle");
        });
        codeRef.current?.focus();
      }
    });
  }

  function checkCode(value: string) {
    setCodeStatus("checking");
    startTransition(async () => {
      const checked = await verifyReauthCode(value);
      setResult(checked);
      setCodeStatus(codeStatusFor(checked));
      if (checked.ok) onConfirmed();
      else if (codeStatusFor(checked) !== "locked") {
        requestAnimationFrame(() => {
          codeRef.current?.focus();
          codeRef.current?.select();
        });
      }
    });
  }

  function onCodeChange(value: string) {
    if (codeStatus === "error") {
      setCodeStatus("idle");
      setResult({});
    }
    setCode(value);
    if (value.length === CODE_LENGTH) checkCode(value);
  }

  function onPasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = formString(event.currentTarget, "password");
    startTransition(async () => {
      const checked = await verifyReauthPassword(password);
      setResult(checked);
      if (checked.ok) onConfirmed();
      else passwordRef.current?.focus();
    });
  }

  const message = errorMessage(result);

  return (
    <>
      <h2 className={styles.cardTitle}>{t("reauthTitle")}</h2>
      {expired ? <Banner tone="info">{t("reauthExpired")}</Banner> : null}
      {method === "code" ? (
        <>
          <p className={styles.muted}>
            {t.rich(sent ? "reauthSent" : "reauthLead", {
              email: currentEmail,
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          {sent ? (
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                if (codeStatus === "locked") sendCode();
                else if (code.length === CODE_LENGTH) checkCode(code);
              }}
              noValidate
            >
              <CodeField
                ref={codeRef}
                id={`${id}-reauth-code`}
                label={tAuth("codeLabel")}
                hint={tAuth("codeHint", { email: currentEmail })}
                value={code}
                onChange={onCodeChange}
                status={codeStatus}
                error={message}
                checkingLabel={tAuth("checkingCode")}
                successLabel={tAuth("codeConfirmed")}
              />
              <Button type="submit" size="md" loading={pending} className={styles.backLink}>
                {codeStatus === "locked" ? tAuth("requestNewCode") : t("confirm")}
              </Button>
            </form>
          ) : (
            <>
              {message ? (
                <p className={styles.muted} role="alert">
                  {message}
                </p>
              ) : null}
              <Button size="md" loading={pending} className={styles.backLink} onClick={sendCode}>
                {t("sendCode")}
              </Button>
            </>
          )}
        </>
      ) : (
        <form
          className={styles.form}
          onSubmit={onPasswordSubmit}
          action={() => undefined}
          noValidate
        >
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={currentEmail}
            readOnly
            hidden
          />
          <PasswordField
            ref={passwordRef}
            id={`${id}-reauth-password`}
            name="password"
            label={tAuth("passwordLabel")}
            autoComplete="current-password"
            required
            error={message ?? undefined}
            showLabel={tCommon("showPassword")}
            hideLabel={tCommon("hidePassword")}
          />
          <Button type="submit" size="md" loading={pending} className={styles.backLink}>
            {t("confirm")}
          </Button>
        </form>
      )}
      {canUsePassword ? (
        <button
          type="button"
          className={styles.textLink}
          onClick={() => {
            setMethod(method === "code" ? "password" : "code");
            setResult({});
          }}
        >
          {method === "code" ? t("usePassword") : t("useCode")}
        </button>
      ) : null}
    </>
  );
}
