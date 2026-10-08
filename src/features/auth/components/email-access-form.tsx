"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import ui from "@/components/ui.module.css";
import { normalizeCode, CODE_LENGTH } from "@/lib/code";
import type { ActionResult } from "../actions";
import styles from "./email-access-form.module.css";

type Step = "email" | "code" | "name";
type ErrorKey =
  | "invalidEmail"
  | "wrongCode"
  | "tooManyAttempts"
  | "expired"
  | "rateLimited"
  | "nameRequired"
  | "generic";

interface EmailAccessFormProps {
  /** Internal path to continue at after sign-in (e.g. `/i/<token>` or `/trips`). */
  returnTo: string;
  /** "login": visible remember-me checkbox; "invite": compact text line (ux-spec §4.4). */
  variant: "login" | "invite";
  /** Name step for new accounts – on invites this is the join step (Flow A.1 #6). */
  onNameSubmit: (name: string) => Promise<ActionResult>;
}

/**
 * Spike UI for P1-0a: e-mail → 6-digit code → (new accounts) name.
 * Everything happens on the same URL via fetch, so the invite token in the URL
 * survives the whole registration (tech-stack.md §3.4). The full UI
 * (segmented code field, resend countdown, pendingAuth recovery) is Increment 1.
 */
export function EmailAccessForm({ returnTo, variant, onNameSubmit }: EmailAccessFormProps) {
  const t = useTranslations("auth");
  const tInvite = useTranslations("invite");
  const locale = useLocale();
  const router = useRouter();
  const ids = useId();
  const codeRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  // Move focus to the code field once the code step is rendered (the email field it
  // replaces is unmounted, focus would otherwise fall back to <body>).
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function post(path: string, body: unknown): Promise<Response> {
    return fetch(`/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
  }

  // Email and name steps use form actions with FormData: values typed before
  // hydration are not lost, and React blocks a native (URL-leaking) submit.
  async function requestCode(formData: FormData) {
    setError(null);
    const value = formText(formData, "email");
    const remember = variant === "login" ? formData.get("rememberMe") === "on" : true;
    setEmail(value);
    setRememberMe(remember);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("invalidEmail");
      return;
    }
    setBusy(true);
    try {
      const response = await post("/email-access/request", {
        email: value,
        callbackURL: returnTo,
        locale,
      });
      if (!response.ok) {
        setError(response.status === 429 ? "rateLimited" : "generic");
        return;
      }
      setStep("code");
    } catch {
      setError("generic");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value: string) {
    setError(null);
    setBusy(true);
    try {
      const response = await post("/sign-in/email-otp", {
        email,
        otp: value,
        rememberMe,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { code?: string };
        setError(errorFromVerification(response.status, body.code));
        codeRef.current?.select();
        return;
      }
      const { user } = (await response.json()) as { user: { name: string } };
      if (!user.name) {
        setStep("name");
        return;
      }
      if (variant === "invite") router.refresh();
      else router.push(returnTo);
    } catch {
      setError("generic");
    } finally {
      setBusy(false);
    }
  }

  function onCodeChange(raw: string) {
    const value = normalizeCode(raw);
    setCode(value);
    // Auto-submit at 6 digits (ux-spec §4.4).
    if (value.length === CODE_LENGTH && !busy) void verifyCode(value);
  }

  async function submitName(formData: FormData) {
    setError(null);
    const value = formText(formData, "name");
    setName(value);
    if (!value) {
      setError("nameRequired");
      return;
    }
    setBusy(true);
    const result = await onNameSubmit(value).catch(() => ({ error: "generic" as const }));
    setBusy(false);
    if (result.error) setError(result.error);
  }

  const errorId = `${ids}-error`;
  const errorMessage = error ? (
    <p id={errorId} className={ui.error} role="alert">
      {t(`errors.${error}`)}
    </p>
  ) : null;

  if (step === "email") {
    return (
      <form key="email" className={styles.form} action={requestCode} noValidate>
        <label className={styles.label} htmlFor={`${ids}-email`}>
          {t("emailLabel")}
        </label>
        <input
          id={`${ids}-email`}
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={email}
          aria-invalid={error === "invalidEmail"}
          aria-describedby={error ? errorId : undefined}
        />
        {variant === "login" ? (
          <label className={styles.checkbox}>
            <input type="checkbox" name="rememberMe" defaultChecked={rememberMe} />
            <span>{t("rememberMe")}</span>
            <span className={ui.muted}>{t("rememberMeHint")}</span>
          </label>
        ) : (
          <p className={ui.muted}>{t("rememberMeInline")}</p>
        )}
        {errorMessage}
        <button className={ui.button} type="submit" disabled={busy}>
          {t("sendCode")}
        </button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form
        key="code"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void verifyCode(code);
        }}
        noValidate
      >
        <p>{t("codeSentLead")}</p>
        <label className={styles.label} htmlFor={`${ids}-code`}>
          {t("codeLabel")}
        </label>
        <input
          ref={codeRef}
          id={`${ids}-code`}
          className={`${styles.input} ${styles.code}`}
          type="text"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          autoCapitalize="off"
          spellCheck={false}
          value={code}
          onChange={(e) => {
            onCodeChange(e.target.value);
          }}
          aria-invalid={error !== null}
          aria-describedby={`${ids}-code-hint${error ? ` ${errorId}` : ""}`}
        />
        <p id={`${ids}-code-hint`} className={ui.muted}>
          {t("codeHint", { email })}
        </p>
        <div aria-live="polite">{errorMessage}</div>
        <button className={ui.button} type="submit" disabled={busy || code.length !== CODE_LENGTH}>
          {t("verify")}
        </button>
        <button
          type="button"
          className={ui.textButton}
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
        >
          {t("otherEmail")}
        </button>
        <p className={ui.muted}>{t("magicHint")}</p>
      </form>
    );
  }

  return (
    <form key="name" className={styles.form} action={submitName} noValidate>
      <h2>{t("nameTitle")}</h2>
      <label className={styles.label} htmlFor={`${ids}-name`}>
        {t("nameLabel")}
      </label>
      <input
        id={`${ids}-name`}
        className={styles.input}
        type="text"
        name="name"
        autoComplete="nickname"
        maxLength={40}
        required
        defaultValue={name}
        aria-invalid={error === "nameRequired"}
        aria-describedby={error ? errorId : undefined}
      />
      {errorMessage}
      <button className={ui.button} type="submit" disabled={busy}>
        {variant === "invite" ? tInvite("confirmJoin") : t("saveName")}
      </button>
    </form>
  );
}

function errorFromVerification(status: number, code: string | undefined): ErrorKey {
  if (status === 429) return "rateLimited";
  if (code === "OTP_EXPIRED") return "expired";
  if (code === "TOO_MANY_ATTEMPTS") return "tooManyAttempts";
  return "wrongCode";
}

function formText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
