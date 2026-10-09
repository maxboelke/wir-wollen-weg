"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition, type SubmitEvent } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordField } from "@/components/ui/password-field";
import { useToast } from "@/components/ui/toast";
import { formString } from "@/lib/form";
import { checkPassword } from "@/lib/password-policy";
import { deletePassword, savePassword, type AccountResult } from "../actions";
import { useAccountErrorMessage } from "./account-errors";
import { ReauthStep } from "./reauth-step";
import styles from "./account.module.css";

const PROBLEM_ERRORS = {
  tooShort: "passwordTooShort",
  tooLong: "passwordTooLong",
  common: "passwordCommon",
} as const;

interface PasswordSettingsProps {
  email: string;
  passwordSet: boolean;
  /** Confirmed within the last 10 minutes (code/password or a code/magic-link sign-in). */
  confirmed: boolean;
}

/**
 * /account/password (W13, F-042): set/change and remove (back to passwordless). Needs a
 * fresh confirmation first (R-023) – same step as for the e-mail change.
 */
export function PasswordSettings({
  email,
  passwordSet,
  confirmed: initiallyConfirmed,
}: PasswordSettingsProps) {
  const t = useTranslations("account.password");
  const tAll = useTranslations();
  const errorMessage = useAccountErrorMessage();
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<AccountResult>({});
  const [pending, startTransition] = useTransition();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);
  const reauthRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // After switching between confirmation and form, focus follows (never lost on <body>).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (confirmed) inputRef.current?.focus();
    else reauthRef.current?.focus();
  }, [confirmed]);
  const [expired, setExpired] = useState(false);

  /** The confirmation ran out meanwhile: ask again (the form keeps nothing secret). */
  function askAgain() {
    setConfirmRemove(false);
    setResult({});
    setExpired(true);
    setConfirmed(false);
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = formString(form, "password");
    const problem = checkPassword(password, email);
    if (problem) {
      setResult({ error: PROBLEM_ERRORS[problem] });
      inputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const saved = await savePassword(password);
      if (saved.error === "reauthExpired") {
        askAgain();
        return;
      }
      setResult(saved);
      if (saved.ok) {
        toast({ message: t("saved") });
        router.push("/account");
      } else inputRef.current?.focus();
    });
  }

  return (
    <div className={styles.page}>
      <Link className={`${styles.textLink} ${styles.backLink}`} href="/account">
        {tAll("account.back")}
      </Link>
      <h1>{passwordSet ? t("titleChange") : t("titleSet")}</h1>
      {confirmed ? null : (
        <div ref={reauthRef} tabIndex={-1}>
          <Card className={styles.card}>
            <ReauthStep
              currentEmail={email}
              canUsePassword={passwordSet}
              expired={expired}
              onConfirmed={() => {
                setExpired(false);
                setConfirmed(true);
              }}
            />
          </Card>
        </div>
      )}
      {confirmed ? (
        <Card className={styles.card}>
          <p className={styles.muted}>{t("lead")}</p>
          <form className={styles.form} onSubmit={onSubmit} action={() => undefined} noValidate>
            <PasswordField
              ref={inputRef}
              id={`${id}-password`}
              name="password"
              label={t("label")}
              hint={t("hint")}
              autoComplete="new-password"
              required
              error={errorMessage(result) ?? undefined}
              showLabel={tCommon("showPassword")}
              hideLabel={tCommon("hidePassword")}
            />
            {/* Lets password managers store the new password for the right account. */}
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={email}
              readOnly
              hidden
            />
            <Button type="submit" size="md" loading={pending} className={styles.backLink}>
              {tCommon("save")}
            </Button>
          </form>
        </Card>
      ) : null}
      {confirmed && passwordSet ? (
        <>
          <Button
            variant="dangerQuiet"
            size="md"
            icon="trash"
            className={styles.backLink}
            onClick={() => {
              setConfirmRemove(true);
            }}
          >
            {t("remove")}
          </Button>
          <BottomSheet
            open={confirmRemove}
            onClose={() => {
              setConfirmRemove(false);
            }}
            title={t("removeTitle")}
            closeLabel={tCommon("close")}
          >
            <div className={styles.form}>
              <p>{t("removeText")}</p>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setConfirmRemove(false);
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  loading={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const removed = await deletePassword();
                      if (removed.error === "reauthExpired") {
                        askAgain();
                        return;
                      }
                      setConfirmRemove(false);
                      toast({ message: t("removed") });
                      router.push("/account");
                    });
                  }}
                >
                  {t("remove")}
                </Button>
              </div>
            </div>
          </BottomSheet>
        </>
      ) : null}
    </div>
  );
}
