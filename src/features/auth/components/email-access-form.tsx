"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type SubmitEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { Checkbox, TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { PasswordField } from "@/components/ui/password-field";
import { savePassword } from "@/features/account/actions";
import { isLocale } from "@/i18n/config";
import { CODE_LENGTH, normalizeCode } from "@/lib/code";
import { helpHref } from "@/lib/help";
import { formString } from "@/lib/form";
import { DISTANCE, enter } from "@/lib/motion";
import { checkPassword } from "@/lib/password-policy";
import {
  clearPendingAuth,
  isInAppBrowser,
  loadPendingAuth,
  pendingOrigin,
  resendSecondsLeft,
  savePendingAuth,
} from "@/lib/pending-auth";
import type { ActionResult } from "../actions";
import {
  EMAIL_PATTERN,
  postAuth,
  readAuthError,
  type AuthError,
  type AuthErrorKey,
} from "../auth-errors";
import styles from "./email-access-form.module.css";
import { NoMailHelp } from "./no-mail-help";
import { ResendCode } from "./resend-code";

type Step = "email" | "code" | "name";
type SendState = "sending" | "sent";

/** Success state stays visible this long before the next step (W02-05: ≤ 450 ms). */
export const SUCCESS_HOLD_MS = 450;

const STEP_ORDER: Record<Step, number> = { email: 0, code: 1, name: 2 };
const STEP_PARAM = "step";
const PASSWORD_PROBLEMS = {
  tooShort: "passwordTooShort",
  tooLong: "passwordTooLong",
  common: "passwordCommon",
} as const satisfies Record<string, AuthErrorKey>;

interface EmailAccessFormProps {
  /** Internal path to continue at after sign-in (e.g. `/i/<token>` or `/trips`). */
  returnTo: string;
  /**
   * "login": own h1 + visible remember-me checkbox; "invite": h2 below the trip card;
   * "createTrip": h2 below the trip summary, signing in creates the trip (Flow G #4).
   */
  variant: "login" | "invite" | "createTrip";
  /** Name step for new accounts – on invites this is the join step (Flow A.1 #6). */
  onNameSubmit: (name: string) => Promise<ActionResult>;
  /** createTrip: an existing account is signed in – create the trip now. */
  onSignedIn?: (() => Promise<ActionResult>) | undefined;
  /** Decorative "code sent" illustration, rendered on the server (W02/W03). */
  codeIllustration?: ReactNode;
  /** Trip of the invite – for the `pendingAuth` banner on other pages (A.4). */
  tripName?: string | undefined;
  /** Hint above the form when a protected page sent the user here (H.1). */
  notice?: ReactNode;
  /** Pre-filled name of the name step – the placeholder's name on a personal link (F-007). */
  defaultName?: string | undefined;
}

function urlWithStep(step: Step | null): string {
  const url = new URL(window.location.href);
  if (step) url.searchParams.set(STEP_PARAM, step);
  else url.searchParams.delete(STEP_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

function formText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * E-mail → 6-digit code → (new accounts) name, all on the same URL via fetch, so the invite
 * token survives the whole registration (tech-stack.md §3.4). Complete per Flow A/H:
 * optimistic code step (M-U5), `pendingAuth` restore (A.4), resend countdown, remaining
 * attempts, locked state, per-address rate limits, «Noch nichts da?» help, optional
 * password sign-in and optional password on sign-up. Motion W02-01 … W02-08.
 */
export function EmailAccessForm({
  returnTo,
  variant,
  onNameSubmit,
  codeIllustration,
  tripName,
  notice,
  onSignedIn,
  defaultName,
}: EmailAccessFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tInvite = useTranslations("invite");
  const tTripForm = useTranslations("tripForm");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const router = useRouter();
  const ids = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const previousStep = useRef<Step>("email");
  const origin = pendingOrigin(variant, returnTo);

  const [step, setStep] = useState<Step>("email");
  const [mode, setMode] = useState<"code" | "password">("code");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState(defaultName ?? "");
  const [rememberMe, setRememberMe] = useState(true);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeStatus, setCodeStatus] = useState<CodeFieldStatus>("idle");
  const [sendState, setSendState] = useState<SendState>("sending");
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [resent, setResent] = useState(false);
  const [restored, setRestored] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // W02-01: the new step fades in from the right (back: from the left); reduced = fade.
  useLayoutEffect(() => {
    const before = previousStep.current;
    previousStep.current = step;
    if (before === step) return;
    const direction = STEP_ORDER[step] > STEP_ORDER[before] ? 1 : -1;
    enter(rootRef.current, { x: direction * DISTANCE.sm });
  }, [step]);

  // Focus moves into the new step (R-003); the optimistic switch already focused
  // synchronously, this covers restore and back navigation.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
    if (step === "name") nameRef.current?.focus();
  }, [step]);

  // A.4: restore a pending flow of THIS page (reload, in-app browser, app switch).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- browser storage is only readable after mounting */
    setInApp(isInAppBrowser(navigator.userAgent));
    const pending = loadPendingAuth();
    if (pending && pending.origin === origin) {
      setEmail(pending.email);
      setSentAt(pending.requestedAt);
      setSendState("sent");
      setRestored(true);
      setStep("code");
      window.history.replaceState(window.history.state, "", urlWithStep("code"));
    } else if (new URL(window.location.href).searchParams.has(STEP_PARAM)) {
      window.history.replaceState(window.history.state, "", urlWithStep(null));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [origin]);

  // Browser back from the code step returns to the e-mail step (ux-spec §3), e-mail stays.
  useEffect(() => {
    const onPop = () => {
      const wanted = new URL(window.location.href).searchParams.get(STEP_PARAM);
      setStep((current) => {
        if (wanted === "code" && current === "email" && email) return "code";
        if (!wanted && current === "code") return "email";
        return current;
      });
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, [email]);

  // Countdown tick (only on the code step, once per second, no animation – G-16).
  const ticking = step === "code" && resendSecondsLeft(sentAt, now) > 0;
  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [ticking]);
  const secondsLeft =
    sendState === "sent" ? resendSecondsLeft(sentAt, now) : resendSecondsLeft(null, now);

  async function requestCode(value: string): Promise<AuthError | null> {
    try {
      const response = await postAuth("/email-access/request", {
        email: value,
        callbackURL: returnTo,
        locale,
      });
      return response.ok ? null : await readAuthError(response);
    } catch {
      return { key: "generic" };
    }
  }

  function codeSent(value: string) {
    const at = Date.now();
    setSentAt(at);
    setNow(at);
    setSendState("sent");
    savePendingAuth({ origin, email: value, step: "code", requestedAt: at, tripName });
  }

  /** Back to the e-mail step with the message at the field (A.1 #3, W02-01). */
  function backToEmail(problem: AuthError | null) {
    flushSync(() => {
      setStep("email");
      setError(problem);
      setCode("");
      setCodeStatus("idle");
      setRestored(false);
    });
    window.history.replaceState(window.history.state, "", urlWithStep(null));
    emailRef.current?.focus();
  }

  function onEmailSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = formText(formData, "email").toLowerCase();
    const remember = variant === "login" ? formData.get("rememberMe") === "on" : true;
    setEmail(value);
    setRememberMe(remember);
    setError(null);
    if (!EMAIL_PATTERN.test(value)) {
      setError({ key: "invalidEmail" });
      emailRef.current?.focus();
      return;
    }
    if (mode === "password") {
      void signInWithPassword(value, formString(formData, "password"), remember);
      return;
    }
    // Optimistic (M-U5): switch and focus in the same tap, so iOS opens the keyboard.
    flushSync(() => {
      setStep("code");
      setSendState("sending");
      setSentAt(null);
      setCode("");
      setCodeStatus("idle");
      setResent(false);
      setRestored(false);
    });
    codeRef.current?.focus();
    void (async () => {
      const problem = await requestCode(value);
      if (problem) {
        backToEmail(problem);
        return;
      }
      codeSent(value);
      window.history.pushState(window.history.state, "", urlWithStep("code"));
    })();
  }

  async function signInWithPassword(value: string, password: string, remember: boolean) {
    setBusy(true);
    try {
      const response = await postAuth("/sign-in/email", {
        email: value,
        password,
        rememberMe: remember,
      });
      if (!response.ok) {
        const problem = await readAuthError(response);
        // Locked (R-021): the way in is a code mail – its link always works.
        setError(problem.key === "locked" ? { ...problem, key: "lockedPassword" } : problem);
        return;
      }
      clearPendingAuth();
      continueSignedIn();
    } catch {
      setError({ key: "generic" });
    } finally {
      setBusy(false);
    }
  }

  /**
   * Signed in by fetch: the root layout (language of the account, "reduce motion" of the
   * account) must render anew – a full load instead of a client navigation. On the invite
   * page a refresh swaps the form for the join step.
   */
  function continueSignedIn() {
    if (variant === "invite") router.refresh();
    else if (variant === "createTrip" && onSignedIn) {
      setBusy(true);
      void onSignedIn()
        .then((result) => {
          if (result.error) setError({ key: result.error });
        })
        .catch(() => {
          setError({ key: "generic" });
        })
        .finally(() => {
          setBusy(false);
        });
    } else window.location.assign(returnTo);
  }

  /** «Neuen Code senden» – after the countdown, in the help box and when locked. */
  async function resendCode() {
    setError(null);
    setBusy(true);
    const problem = await requestCode(email);
    setBusy(false);
    if (problem) {
      setError(problem);
      return;
    }
    codeSent(email);
    setResent(true);
    setCode("");
    setCodeStatus("idle");
    codeRef.current?.focus();
  }

  async function verifyCode(value: string) {
    setError(null);
    setCodeStatus("checking");
    try {
      const response = await postAuth("/sign-in/email-otp", { email, otp: value, rememberMe });
      if (!response.ok) {
        const read = await readAuthError(response);
        // Address locked (R-021): entering codes is paused, the link in the mail still works.
        const problem: AuthError = read.key === "locked" ? { key: "lockedUseLink" } : read;
        setError(problem);
        const locked =
          problem.key === "tooManyAttempts" ||
          problem.key === "expired" ||
          problem.key === "lockedUseLink";
        setCodeStatus(locked ? "locked" : problem.key === "generic" ? "idle" : "error");
        // Locked: the field is disabled – focus goes to «Neuen Code senden» (the only action).
        if (locked) requestAnimationFrame(() => submitRef.current?.focus());
        // Keep the value selected for quick overwriting, focus stays (ux-spec §4.4).
        if (!locked) {
          requestAnimationFrame(() => {
            codeRef.current?.focus();
            codeRef.current?.select();
          });
        }
        return;
      }
      const { user } = (await response.json()) as { user: { name: string } };
      clearPendingAuth();
      setCodeStatus("success");
      window.setTimeout(() => {
        window.history.replaceState(window.history.state, "", urlWithStep(null));
        if (!user.name) setStep("name");
        else continueSignedIn();
      }, SUCCESS_HOLD_MS);
    } catch {
      setError({ key: "generic" });
      setCodeStatus("idle");
    }
  }

  function onCodeChange(value: string) {
    if (codeStatus === "error") {
      setCodeStatus("idle");
      setError(null);
    }
    setCode(value);
    // Auto-submit at 6 digits (ux-spec §4.4) – only once the code is on its way.
    if (value.length === CODE_LENGTH && codeStatus !== "checking") void verifyCode(value);
  }

  async function onNameFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    const value = formText(formData, "name");
    const password = formString(formData, "password");
    setName(value);
    if (!value) {
      setError({ key: "nameRequired" });
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      // Optional password right at sign-up (F-040, W02 step 3): checked here and on the server.
      if (password !== "") {
        const problem = checkPassword(password, email);
        if (problem) {
          setError({ key: PASSWORD_PROBLEMS[problem] });
          return;
        }
        const saved = await savePassword(password);
        if (saved.error) {
          setError({
            key: saved.error.startsWith("password") ? (saved.error as AuthErrorKey) : "generic",
          });
          return;
        }
      }
      const result = await onNameSubmit(value);
      setSuggestion(result.suggestion ?? null);
      if (result.error) {
        setError({ key: result.error, ...(result.minutes ? { minutes: result.minutes } : {}) });
        nameRef.current?.focus();
      }
    } catch {
      setError({ key: "generic" });
    } finally {
      setBusy(false);
    }
  }

  const Heading = variant === "login" ? "h1" : "h2";
  const errorText = error
    ? t(`errors.${error.key}`, { minutes: error.minutes ?? 1, count: error.count ?? 0 })
    : null;
  const passwordError = error?.key.startsWith("password") ? errorText : null;

  if (step === "email") {
    const passwordMode = mode === "password";
    return (
      <div ref={rootRef} className={styles.step}>
        <div className={styles.intro}>
          <Heading className={styles.heading}>
            {variant === "login"
              ? t("loginTitle")
              : variant === "createTrip"
                ? tTripForm("authTitle")
                : tInvite("emailTitle")}
          </Heading>
          {notice}
          {variant === "login" ? <p className={styles.lead}>{t("loginLead")}</p> : null}
        </div>
        <form
          key="email"
          className={styles.form}
          onSubmit={onEmailSubmit}
          action={() => undefined}
          noValidate
        >
          <TextField
            ref={emailRef}
            id={`${ids}-email`}
            label={t("emailLabel")}
            type="email"
            name="email"
            autoComplete={passwordMode ? "username" : "email"}
            inputMode="email"
            required
            defaultValue={email}
            error={error && !passwordMode ? errorText : undefined}
          />
          {passwordMode ? (
            <PasswordField
              id={`${ids}-password`}
              name="password"
              label={t("passwordLabel")}
              autoComplete="current-password"
              required
              hint={t("noPasswordHint")}
              error={errorText ?? undefined}
              showLabel={tCommon("showPassword")}
              hideLabel={tCommon("hidePassword")}
            />
          ) : null}
          {passwordMode ? (
            <Link
              className={styles.textLink}
              href="/login/reset"
              onClick={(event) => {
                // Take the address along (WCAG 3.3.7: no redundant entry).
                const typed = emailRef.current?.value.trim();
                if (!typed) return;
                event.preventDefault();
                router.push(`/login/reset?email=${encodeURIComponent(typed)}`);
              }}
            >
              {t("forgotPassword")}
            </Link>
          ) : null}
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
          <Button
            type="submit"
            block
            loading={busy}
            loadingLabel={passwordMode ? t("signingIn") : t("sendingCode")}
          >
            {passwordMode ? t("signInPassword") : t("sendCode")}
          </Button>
        </form>
        <button
          type="button"
          className={styles.textLink}
          onClick={() => {
            setMode(passwordMode ? "code" : "password");
            setError(null);
          }}
        >
          {passwordMode ? t("withCode") : t("withPassword")}
        </button>
        {variant === "login" && !passwordMode ? (
          <p className={styles.small}>{t("newHere")}</p>
        ) : null}
      </div>
    );
  }

  if (step === "code") {
    const locked = codeStatus === "locked";
    const sending = sendState === "sending";
    return (
      <div ref={rootRef} className={styles.step}>
        {codeIllustration ? <div className={styles.illustration}>{codeIllustration}</div> : null}
        <div className={styles.intro}>
          <Heading className={styles.heading}>{t("codeTitle")}</Heading>
          {restored ? <p className={styles.notice}>{t("welcomeBack")}</p> : null}
          <p className={styles.lead}>
            {t.rich(sending ? "codeSendingTo" : "codeSentTo", {
              email,
              b: (chunks) => <strong className={styles.email}>{chunks}</strong>,
            })}{" "}
            <button
              type="button"
              className={styles.inlineLink}
              onClick={() => {
                backToEmail(null);
              }}
            >
              {t("otherEmail")}
            </button>
          </p>
          {/* Visible while sending and after a resend; «sent» is only announced (the lead says it). */}
          <p className={sending || resent ? styles.status : "visually-hidden"} role="status">
            {sending ? t("statusSending") : resent ? t("resent") : t("statusSent", { email })}
          </p>
        </div>
        <form
          key="code"
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (locked) void resendCode();
            else if (code.length === CODE_LENGTH) void verifyCode(normalizeCode(code));
            else {
              setError({ key: "codeLength" });
              codeRef.current?.focus();
            }
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
            ref={submitRef}
            type="submit"
            block
            loading={codeStatus === "checking" || busy}
            aria-disabled={codeStatus === "success" || undefined}
          >
            {locked ? t("requestNewCode") : t("verify")}
          </Button>
        </form>
        <div className={styles.help}>
          {locked ? null : (
            <ResendCode secondsLeft={secondsLeft} busy={busy} onResend={() => void resendCode()} />
          )}
          <p className={styles.small}>{t("spamHint")}</p>
          {inApp ? <p className={styles.small}>{t("inAppTip")}</p> : null}
          <p className={styles.small}>{t("magicHint")}</p>
          <NoMailHelp
            email={email}
            sentAt={sentAt}
            helpHref={helpHref(locale, "code")}
            canResend={secondsLeft === 0 && !busy}
            onChangeEmail={() => {
              backToEmail(null);
            }}
            onResend={() => void resendCode()}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={styles.step}>
      <form
        key="name"
        className={styles.form}
        onSubmit={(event) => void onNameFormSubmit(event)}
        action={() => undefined}
        noValidate
      >
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
          error={error && !passwordError ? errorText : undefined}
        />
        {suggestion ? (
          <div className={styles.suggestion} role="status">
            <p>{tInvite("nameTakenHint", { suggestion })}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (nameRef.current) nameRef.current.value = suggestion;
                setName(suggestion);
                setSuggestion(null);
                setError(null);
                nameRef.current?.focus();
              }}
            >
              {tInvite("useSuggestion")}
            </Button>
          </div>
        ) : null}
        {variant === "login" ? (
          <details className={styles.optional} open={passwordError ? true : undefined}>
            <summary className={styles.noMailSummary}>
              <span>{t("optionalPassword")}</span>
              <Icon name="chevron-down" size={18} className={styles.chevron} />
            </summary>
            <PasswordField
              id={`${ids}-new-password`}
              name="password"
              label={t("passwordLabel")}
              autoComplete="new-password"
              hint={t("optionalPasswordHint")}
              error={passwordError ?? undefined}
              showLabel={tCommon("showPassword")}
              hideLabel={tCommon("hidePassword")}
            />
          </details>
        ) : null}
        <Button
          type="submit"
          block
          loading={busy}
          loadingLabel={
            variant === "invite"
              ? tInvite("joining")
              : variant === "createTrip"
                ? tTripForm("submitting")
                : t("saving")
          }
        >
          {variant === "invite"
            ? tInvite("confirmJoin")
            : variant === "createTrip"
              ? tTripForm("submit")
              : t("saveName")}
        </Button>
      </form>
    </div>
  );
}
