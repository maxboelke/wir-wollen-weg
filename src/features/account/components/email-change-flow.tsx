"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { TextField } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { CODE_LENGTH } from "@/lib/code";
import { formString } from "@/lib/form";
import { DISTANCE, enter } from "@/lib/motion";
import {
  confirmEmailChange,
  requestEmailChange,
  sendReauthCode,
  verifyReauthCode,
  verifyReauthPassword,
  type AccountResult,
} from "../actions";
import { useAccountErrorMessage } from "./account-errors";
import styles from "./account.module.css";

type Step = "reauth" | "new" | "code" | "done";

interface EmailChangeFlowProps {
  currentEmail: string;
  canUsePassword: boolean;
}

function statusFor(result: AccountResult): CodeFieldStatus {
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

/**
 * «E-Mail ändern» (Flow I.2, W13): 1) confirm it's you – code to the current address or
 * the password, 2) new address, 3) code to the new address (same code component as W02),
 * then the old address gets an info mail. A taken address is handled neutrally.
 */
export function EmailChangeFlow({ currentEmail, canUsePassword }: EmailChangeFlowProps) {
  const t = useTranslations("account.email");
  const tAll = useTranslations();
  const errorMessage = useAccountErrorMessage();
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const newEmailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("reauth");
  const [method, setMethod] = useState<"code" | "password">("code");
  const [reauthSent, setReauthSent] = useState(false);
  const [code, setCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [result, setResult] = useState<AccountResult>({});
  const [codeStatus, setCodeStatus] = useState<CodeFieldStatus>("idle");
  const [pending, startTransition] = useTransition();
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (step !== "reauth") enter(rootRef.current, { x: DISTANCE.sm });
    if (step === "done") doneRef.current?.focus();
  }, [step]);

  function go(next: Step) {
    flushSync(() => {
      setStep(next);
      setResult({});
      setCode("");
      setCodeStatus("idle");
    });
    if (next === "new") newEmailRef.current?.focus();
    if (next === "code") codeRef.current?.focus();
  }

  function sendCode() {
    startTransition(async () => {
      const sent = await sendReauthCode();
      setResult(sent);
      if (sent.ok) {
        flushSync(() => {
          setReauthSent(true);
          setResult({});
        });
        codeRef.current?.focus();
      }
    });
  }

  function checkCode(
    value: string,
    verify: (code: string) => Promise<AccountResult>,
    onOk: () => void,
  ) {
    setCodeStatus("checking");
    startTransition(async () => {
      const checked = await verify(value);
      setResult(checked);
      setCodeStatus(statusFor(checked));
      if (checked.ok) onOk();
      else if (statusFor(checked) !== "locked") {
        requestAnimationFrame(() => {
          codeRef.current?.focus();
          codeRef.current?.select();
        });
      }
    });
  }

  function onReauthCodeChange(value: string) {
    if (codeStatus === "error") {
      setCodeStatus("idle");
      setResult({});
    }
    setCode(value);
    if (value.length === CODE_LENGTH)
      checkCode(value, verifyReauthCode, () => {
        go("new");
      });
  }

  function onPasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = formString(event.currentTarget, "password");
    startTransition(async () => {
      const checked = await verifyReauthPassword(password);
      setResult(checked);
      if (checked.ok) go("new");
      else passwordRef.current?.focus();
    });
  }

  function onNewEmailSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = formString(event.currentTarget, "email").trim().toLowerCase();
    setNewEmail(value);
    startTransition(async () => {
      const requested = await requestEmailChange(value);
      setResult(requested);
      if (requested.ok) go("code");
      else if (requested.error === "reauthExpired") go("reauth");
      else newEmailRef.current?.focus();
    });
  }

  function onNewCodeChange(value: string) {
    if (codeStatus === "error") {
      setCodeStatus("idle");
      setResult({});
    }
    setCode(value);
    if (value.length === CODE_LENGTH) {
      checkCode(
        value,
        (c) => confirmEmailChange(newEmail, c),
        () => {
          window.setTimeout(() => {
            go("done");
            router.refresh();
          }, 450);
        },
      );
    }
  }

  const message = errorMessage(result);

  return (
    <div className={styles.page}>
      <Link className={`${styles.textLink} ${styles.backLink}`} href="/account">
        {tAll("account.back")}
      </Link>
      <h1>{t("title")}</h1>
      <div ref={rootRef}>
        <Card className={styles.card}>
          {step === "reauth" ? (
            <>
              <h2 className={styles.cardTitle}>{t("reauthTitle")}</h2>
              {result.error === "reauthExpired" ? (
                <Banner tone="info">{t("reauthExpired")}</Banner>
              ) : null}
              {method === "code" ? (
                <>
                  <p className={styles.muted}>
                    {t.rich(reauthSent ? "reauthSent" : "reauthLead", {
                      email: currentEmail,
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                  {reauthSent ? (
                    <form
                      className={styles.form}
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (codeStatus === "locked") sendCode();
                        else if (code.length === CODE_LENGTH)
                          checkCode(code, verifyReauthCode, () => {
                            go("new");
                          });
                      }}
                      noValidate
                    >
                      <CodeField
                        ref={codeRef}
                        id={`${id}-reauth-code`}
                        label={tAuth("codeLabel")}
                        hint={tAuth("codeHint", { email: currentEmail })}
                        value={code}
                        onChange={onReauthCodeChange}
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
                      <Button
                        size="md"
                        loading={pending}
                        className={styles.backLink}
                        onClick={sendCode}
                      >
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
          ) : null}

          {step === "new" ? (
            <form
              className={styles.form}
              onSubmit={onNewEmailSubmit}
              action={() => undefined}
              noValidate
            >
              <h2 className={styles.cardTitle}>{t("newTitle")}</h2>
              <TextField
                ref={newEmailRef}
                id={`${id}-new-email`}
                label={t("newLabel")}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                defaultValue={newEmail}
                error={message ?? undefined}
              />
              <Button type="submit" size="md" loading={pending} className={styles.backLink}>
                {t("sendNew")}
              </Button>
            </form>
          ) : null}

          {step === "code" ? (
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                if (code.length === CODE_LENGTH) onNewCodeChange(code);
              }}
              noValidate
            >
              <h2 className={styles.cardTitle}>{t("codeTitle")}</h2>
              <p className={styles.muted}>
                {t.rich("codeLead", { email: newEmail, b: (chunks) => <strong>{chunks}</strong> })}
              </p>
              <CodeField
                ref={codeRef}
                id={`${id}-new-code`}
                label={tAuth("codeLabel")}
                hint={tAuth("codeHint", { email: newEmail })}
                value={code}
                onChange={onNewCodeChange}
                status={codeStatus}
                error={message}
                checkingLabel={tAuth("checkingCode")}
                successLabel={tAuth("codeConfirmed")}
              />
              <Button type="submit" size="md" loading={pending} className={styles.backLink}>
                {t("confirm")}
              </Button>
              <p className={styles.muted}>{tAuth("spamHint")}</p>
            </form>
          ) : null}

          {step === "done" ? (
            <div className={styles.success}>
              <Banner tone="success" role="status">
                <p ref={doneRef} tabIndex={-1}>
                  {t("done", { email: newEmail })}
                </p>
              </Banner>
              <Link className={styles.textLink} href="/account">
                {tAll("account.back")}
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
