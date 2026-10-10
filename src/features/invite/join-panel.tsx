"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, TextField } from "@/components/ui/field";
import { signOutOnInvite } from "@/features/account/actions";
import { DISPLAY_NAME_MAX } from "@/lib/display-name";
import type { ActionResult } from "../auth/actions";
import styles from "./join-panel.module.css";

interface JoinPanelProps {
  token: string;
  /** Account name (shown in «Angemeldet als …»). */
  name: string;
  /** Name for this trip – the placeholder's name on a personal link (F-007), else `name`. */
  joinName?: string | undefined;
  email: string;
  /** Server action (token bound) – works before hydration as a plain form. */
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
}

/**
 * Signed in, not yet a member (Flow A.3, W03 Z4b): «Angemeldet als Lena (lena@…) · Nicht du?
 * Abmelden», «Du trittst als Lena bei. [Name für diese Reise ändern]», one tap on
 * «Mitmachen». A taken name opens the name field with a suggestion (F-003).
 */
export function JoinPanel({ token, name, joinName = name, email, action }: JoinPanelProps) {
  const t = useTranslations("invite");
  const tAuth = useTranslations("auth");
  const ids = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action, {});
  const [editing, setEditing] = useState(!joinName);
  const [value, setValue] = useState(joinName);
  const showField = editing || state.error === "nameTaken" || state.error === "nameRequired";
  const error = state.error
    ? tAuth(`errors.${state.error}`, { minutes: state.minutes ?? 1 })
    : undefined;

  return (
    <div className={styles.panel}>
      <form className={styles.who} action={signOutOnInvite.bind(null, token)}>
        <p>
          {t.rich("signedInAs", {
            name,
            email,
            b: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <button type="submit" className={styles.inline}>
          {t("notYou")}
        </button>
      </form>
      <form className={styles.form} action={formAction} noValidate>
        {showField ? (
          <TextField
            ref={nameRef}
            id={`${ids}-name`}
            name="name"
            label={t("nameForTrip")}
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_MAX}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            error={
              state.error === "nameTaken" || state.error === "nameRequired" ? error : undefined
            }
          />
        ) : (
          <p className={styles.as}>
            <span>{t("joinAs", { name: joinName })}</span>{" "}
            <button
              type="button"
              className={styles.inline}
              onClick={() => {
                setEditing(true);
                requestAnimationFrame(() => nameRef.current?.focus());
              }}
            >
              {t("changeName")}
            </button>
            <input type="hidden" name="name" value={joinName} />
          </p>
        )}
        {state.suggestion ? (
          <div className={styles.suggestion} role="status">
            <p>{t("nameTakenHint", { suggestion: state.suggestion })}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setValue(state.suggestion ?? value);
                nameRef.current?.focus();
              }}
            >
              {t("useSuggestion")}
            </Button>
          </div>
        ) : null}
        {error && state.error !== "nameTaken" && state.error !== "nameRequired" ? (
          <FieldError id={`${ids}-error`}>{error}</FieldError>
        ) : null}
        <Button type="submit" block loading={pending} loadingLabel={t("joining")}>
          {t("joinCta")}
        </Button>
      </form>
    </div>
  );
}
