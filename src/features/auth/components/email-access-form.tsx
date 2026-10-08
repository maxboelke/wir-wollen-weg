"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { Checkbox, TextField } from "@/components/ui/field";
import { normalizeCode, CODE_LENGTH } from "@/lib/code";
import { DISTANCE, enter } from "@/lib/motion";
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

/** Success state stays visible this long before the next step (W02-05: ≤ 450 ms). */
export const SUCCESS_HOLD_MS = 450;

const STEP_ORDER: Record<Step, number> = { email: 0, code: 1, name: 2 };

interface EmailAccessFormProps {
  /** Internal path to continue at after sign-in (e.g. `/i/<token>` or `/trips`). */
  returnTo: string;
  /** "login": own h1 + visible remember-me checkbox; "invite": h2 below the trip card. */
  variant: "login" | "invite";
  /** Name step for new accounts – on invites this is the join step (Flow A.1 #6). */
  onNameSubmit: (name: string) => Promise<ActionResult>;
  /** Decorative "code sent" illustration, rendered on the server (W02/W03). */
  codeIllustration?: ReactNode;
}

/**
 * E-mail → 6-digit code → (new accounts) name, all on the same URL via fetch, so the
 * invite token in the URL survives the whole registration (tech-stack.md §3.4).
 * Look & motion: direction B, motion package M-1 (W02-01 … W02-08).
 */
export function EmailAccessForm({
  returnTo,
  variant,
  onNameSubmit,
  codeIllustration,
}: EmailAccessFormProps) {
  const t = useTranslations("auth");
  const tInvite = useTranslations("invite");
  const locale = useLocale();
  const router = useRouter();
  const ids = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const previousStep = useRef<Step>("email");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeStatus, setCodeStatus] = useState<CodeFieldStatus>("idle");

  // W02-01: the new step fades in from the right (back: from the left); reduced = fade.
  useLayoutEffect(() => {
    const before = previousStep.current;
    previousStep.current = step;
    if (before === step) return;
    const direction = STEP_ORDER[step] > STEP_ORDER[before] ? 1 : -1;
    enter(rootRef.current, { x: direction * DISTANCE.sm });
  }, [step]);

  // Focus moves into the new step right away (R-003; the old field is unmounted).
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
    if (step === "name") nameRef.current?.focus();
  }, [step]);

  async function post(path: string, body: unknown): Promise<Response> {
    return fetch(`/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
  }

  async function sendCode(value: string): Promise<boolean> {
    const response = await post("/email-access/request", {
      email: value,
      callbackURL: returnTo,
      locale,
    });
    if (!response.ok) {
      setError(response.status === 429 ? "rateLimited" : "generic");
      return false;
    }
    return true;
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
      if (await sendCode(value)) {
        setCode("");
        setCodeStatus("idle");
        setStep("code");
      }
    } catch {
      setError("generic");
    } finally {
      setBusy(false);
    }
  }

  /** Locked after too many attempts: "Send a new code" is the primary action (ux-spec §4.4). */
  async function requestNewCode() {
    setError(null);
    setBusy(true);
    try {
      if (await sendCode(email)) {
        setCode("");
        setCodeStatus("idle");
        requestAnimationFrame(() => codeRef.current?.focus());
      }
    } catch {
      setError("generic");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value: string) {
    setError(null);
    setCodeStatus("checking");
    try {
      const response = await post("/sign-in/email-otp", { email, otp: value, rememberMe });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { code?: string };
        const key = errorFromVerification(response.status, body.code);
        setError(key);
        setCodeStatus(
          key === "tooManyAttempts" ? "locked" : key === "wrongCode" ? "error" : "idle",
        );
        // Keep the value selected for quick overwriting, focus stays (ux-spec §4.4).
        requestAnimationFrame(() => {
          codeRef.current?.focus();
          codeRef.current?.select();
        });
        return;
      }
      const { user } = (await response.json()) as { user: { name: string } };
      setCodeStatus("success");
      window.setTimeout(() => {
        if (!user.name) setStep("name");
        else if (variant === "invite") router.refresh();
        else router.push(returnTo);
      }, SUCCESS_HOLD_MS);
    } catch {
      setError("generic");
      setCodeStatus("idle");
    }
  }

  function onCodeChange(value: string) {
    if (codeStatus === "error") {
      setCodeStatus("idle");
      setError(null);
    }
    setCode(value);
    // Auto-submit at 6 digits (ux-spec §4.4).
    if (value.length === CODE_LENGTH && codeStatus !== "checking") void verifyCode(value);
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

  const Heading = variant === "login" ? "h1" : "h2";
  const errorText = error ? t(`errors.${error}`) : null;

  if (step === "email") {
    return (
      <div ref={rootRef} className={styles.step}>
        <div className={styles.intro}>
          <Heading className={styles.heading}>
            {variant === "login" ? t("loginTitle") : tInvite("emailTitle")}
          </Heading>
          {variant === "login" ? <p className={styles.lead}>{t("loginLead")}</p> : null}
        </div>
        <form key="email" className={styles.form} action={requestCode} noValidate>
          <TextField
            id={`${ids}-email`}
            label={t("emailLabel")}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={email}
            error={error ? errorText : undefined}
          />
          {variant === "login" ? (
            <Checkbox
              name="rememberMe"
              defaultChecked={rememberMe}
              label={t("rememberMe")}
              hint={t("rememberMeHint")}
            />
          ) : (
            <p className={styles.small}>{t("rememberMeInline")}</p>
          )}
          <Button type="submit" block loading={busy} loadingLabel={t("sendingCode")}>
            {t("sendCode")}
          </Button>
        </form>
        {variant === "login" ? <p className={styles.small}>{t("newHere")}</p> : null}
      </div>
    );
  }

  if (step === "code") {
    const locked = codeStatus === "locked";
    return (
      <div ref={rootRef} className={styles.step}>
        {codeIllustration ? <div className={styles.illustration}>{codeIllustration}</div> : null}
        <div className={styles.intro}>
          <Heading className={styles.heading}>{t("codeTitle")}</Heading>
          <p className={styles.lead}>
            {t.rich("codeSentTo", {
              email,
              b: (chunks) => <strong className={styles.email}>{chunks}</strong>,
            })}{" "}
            <button
              type="button"
              className={styles.inlineLink}
              onClick={() => {
                setStep("email");
                setCode("");
                setCodeStatus("idle");
                setError(null);
              }}
            >
              {t("otherEmail")}
            </button>
          </p>
        </div>
        <form
          key="code"
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (locked) void requestNewCode();
            else if (code.length === CODE_LENGTH) void verifyCode(normalizeCode(code));
            else codeRef.current?.focus();
          }}
          noValidate
        >
          <CodeField
            ref={codeRef}
            id={`${ids}-code`}
            label={t("codeLabel")}
            hint={t("codeHint", { email })}
            value={code}
            onChange={onCodeChange}
            status={codeStatus}
            error={errorText}
            checkingLabel={t("checkingCode")}
            successLabel={t("codeConfirmed")}
          />
          <Button
            type="submit"
            block
            loading={codeStatus === "checking" || busy}
            aria-disabled={codeStatus === "success" || undefined}
          >
            {locked ? t("requestNewCode") : t("verify")}
          </Button>
        </form>
        <div className={styles.help}>
          <p className={styles.small}>{t("spamHint")}</p>
          <p className={styles.small}>{t("magicHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={styles.step}>
      <form key="name" className={styles.form} action={submitName} noValidate>
        <Heading className={styles.heading}>{t("nameTitle")}</Heading>
        <TextField
          ref={nameRef}
          id={`${ids}-name`}
          label={t("nameLabel")}
          type="text"
          name="name"
          autoComplete="nickname"
          maxLength={40}
          required
          defaultValue={name}
          error={error ? errorText : undefined}
        />
        <Button
          type="submit"
          block
          loading={busy}
          loadingLabel={variant === "invite" ? tInvite("joining") : t("saving")}
        >
          {variant === "invite" ? tInvite("confirmJoin") : t("saveName")}
        </Button>
      </form>
    </div>
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
