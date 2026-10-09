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
import { CODE_LENGTH } from "@/lib/code";
import { formString } from "@/lib/form";
import { DISTANCE, enter } from "@/lib/motion";
import { confirmEmailChange, requestEmailChange, type AccountResult } from "../actions";
import { useAccountErrorMessage } from "./account-errors";
import { codeStatusFor, ReauthStep } from "./reauth-step";
import styles from "./account.module.css";

type Step = "reauth" | "new" | "code" | "done";

interface EmailChangeFlowProps {
  currentEmail: string;
  canUsePassword: boolean;
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
  const router = useRouter();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const newEmailRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("reauth");
  const [reauthExpired, setReauthExpired] = useState(false);
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

  function checkCode(
    value: string,
    verify: (code: string) => Promise<AccountResult>,
    onOk: () => void,
  ) {
    setCodeStatus("checking");
    startTransition(async () => {
      const checked = await verify(value);
      setResult(checked);
      setCodeStatus(codeStatusFor(checked));
      if (checked.ok) onOk();
      else if (codeStatusFor(checked) !== "locked") {
        requestAnimationFrame(() => {
          codeRef.current?.focus();
          codeRef.current?.select();
        });
      }
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
      else if (requested.error === "reauthExpired") {
        setReauthExpired(true);
        go("reauth");
      } else newEmailRef.current?.focus();
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
            <ReauthStep
              currentEmail={currentEmail}
              canUsePassword={canUsePassword}
              expired={reauthExpired}
              onConfirmed={() => {
                setReauthExpired(false);
                go("new");
              }}
            />
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
