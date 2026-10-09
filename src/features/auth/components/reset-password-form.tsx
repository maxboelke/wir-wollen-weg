"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { TextField } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { useToast } from "@/components/ui/toast";
import { CODE_LENGTH } from "@/lib/code";
import { formString } from "@/lib/form";
import { DISTANCE, enter } from "@/lib/motion";
import { checkPassword } from "@/lib/password-policy";
import { EMAIL_PATTERN, postAuth, readAuthError, type AuthError } from "../auth-errors";
import styles from "./email-access-form.module.css";

const PROBLEM_KEYS = {
  tooShort: "passwordTooShort",
  tooLong: "passwordTooLong",
  common: "passwordCommon",
} as const;

/**
 * «Passwort vergessen» (Flow H.3, W02): neutral answer (no enumeration), then code and new
 * password in one form. Better Auth ends all sessions on reset; we sign in right after with
 * the new password, so the user simply continues («Auf anderen Geräten wurdest du
 * abgemeldet.»).
 */
export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const t = useTranslations("reset");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const ids = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<CodeFieldStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step === "code") enter(rootRef.current, { x: DISTANCE.sm });
  }, [step]);

  const errorText = error
    ? tAuth(`errors.${error.key}`, { minutes: error.minutes ?? 1, count: error.count ?? 0 })
    : null;
  const isPasswordError = error?.key.startsWith("password") ?? false;

  async function onEmailSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = formString(event.currentTarget, "email").trim().toLowerCase();
    setEmail(value);
    setError(null);
    if (!EMAIL_PATTERN.test(value)) {
      setError({ key: "invalidEmail" });
      emailRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const response = await postAuth("/email-otp/request-password-reset", { email: value });
      if (!response.ok) {
        setError(await readAuthError(response));
        emailRef.current?.focus();
        return;
      }
      flushSync(() => {
        setStep("code");
      });
      codeRef.current?.focus();
    } catch {
      setError({ key: "generic" });
    } finally {
      setBusy(false);
    }
  }

  async function onResetSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = formString(event.currentTarget, "password");
    setError(null);
    if (code.length !== CODE_LENGTH) {
      setError({ key: "codeLength" });
      codeRef.current?.focus();
      return;
    }
    const problem = checkPassword(password, email);
    if (problem) {
      setError({ key: PROBLEM_KEYS[problem] });
      passwordRef.current?.focus();
      return;
    }
    setBusy(true);
    setCodeStatus("checking");
    try {
      const response = await postAuth("/email-otp/reset-password", { email, otp: code, password });
      if (!response.ok) {
        const failure = await readAuthError(response);
        setError(failure);
        const locked =
          failure.key === "tooManyAttempts" ||
          failure.key === "expired" ||
          failure.key === "locked";
        setCodeStatus(locked ? "locked" : failure.key.startsWith("password") ? "idle" : "error");
        if (failure.key.startsWith("password")) passwordRef.current?.focus();
        else codeRef.current?.focus();
        return;
      }
      setCodeStatus("success");
      const signIn = await postAuth("/sign-in/email", { email, password, rememberMe: true });
      toast({ message: t("done") });
      router.push(signIn.ok ? "/trips" : "/login");
    } catch {
      setError({ key: "generic" });
      setCodeStatus("idle");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={rootRef} className={styles.step}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>{t("title")}</h1>
        <Banner
          tone="info"
          action={
            <Link className={styles.textLink} href="/login">
              {t("useCode")}
            </Link>
          }
        >
          {t("lead")}
        </Banner>
      </div>
      {step === "email" ? (
        <form
          className={styles.form}
          onSubmit={(event) => void onEmailSubmit(event)}
          action={() => undefined}
          noValidate
        >
          <TextField
            ref={emailRef}
            id={`${ids}-email`}
            label={tAuth("emailLabel")}
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            required
            defaultValue={email}
            error={errorText ?? undefined}
          />
          <Button type="submit" block loading={busy} loadingLabel={tAuth("sendingCode")}>
            {t("sendCode")}
          </Button>
        </form>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => void onResetSubmit(event)}
          action={() => undefined}
          noValidate
        >
          <h2 className={styles.subheading}>{t("codeTitle")}</h2>
          <p className={styles.lead}>
            {t.rich("codeSentTo", {
              email,
              b: (chunks) => <strong className={styles.email}>{chunks}</strong>,
            })}
          </p>
          <CodeField
            ref={codeRef}
            id={`${ids}-code`}
            label={tAuth("codeLabel")}
            hint={tAuth("codeHint", { email })}
            value={code}
            onChange={(value) => {
              if (codeStatus === "error") {
                setCodeStatus("idle");
                setError(null);
              }
              setCode(value);
              // No auto-submit here: the new password belongs to the same request.
              if (value.length === CODE_LENGTH) passwordRef.current?.focus();
            }}
            status={codeStatus}
            error={isPasswordError ? null : errorText}
            checkingLabel={tAuth("checkingCode")}
            successLabel={tAuth("codeConfirmed")}
          />
          <PasswordField
            ref={passwordRef}
            id={`${ids}-password`}
            name="password"
            label={t("newPasswordLabel")}
            autoComplete="new-password"
            hint={t("newPasswordHint")}
            error={isPasswordError ? errorText : undefined}
            showLabel={tCommon("showPassword")}
            hideLabel={tCommon("hidePassword")}
          />
          <Button type="submit" block loading={busy} loadingLabel={t("saving")}>
            {t("save")}
          </Button>
          <p className={styles.small}>{tAuth("spamHint")}</p>
        </form>
      )}
    </div>
  );
}
