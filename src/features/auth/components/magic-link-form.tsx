"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";
import ui from "@/components/ui.module.css";
import { redeemMagicLink, type MagicLinkResult } from "../actions";
import styles from "./email-access-form.module.css";

interface MagicLinkFormProps {
  token: string;
  /** Validated internal path to continue at (e.g. `/i/<token>` or `/trips`). */
  next: string;
  /** Where "Get a new code" leads: the invite (`/i/<token>`) or `/login?next=…`. */
  requestNewHref: string;
  /** Trip name when the link belongs to an invite (H.5 #1). */
  tripName?: string | undefined;
  /** Name of the account that is signed in right now (H.5 3d). */
  signedInAs?: string | undefined;
}

/**
 * Magic-link landing card (Flow H.5, W02, R-006). A real `<form method="post">` bound to a
 * Server Action: works before hydration and without JS, no auto-submit. The token is only
 * checked after the tap; an invalid token switches the card to the error state.
 */
export function MagicLinkForm({
  token,
  next,
  requestNewHref,
  tripName,
  signedInAs,
}: MagicLinkFormProps) {
  const t = useTranslations("magic");
  const [state, formAction, pending] = useActionState<MagicLinkResult, FormData>(
    redeemMagicLink,
    {},
  );
  const invalidHeadingRef = useRef<HTMLHeadingElement>(null);

  // Announce the error state by moving focus to its heading (W02 A11y).
  useEffect(() => {
    if (state.error === "invalid") invalidHeadingRef.current?.focus();
  }, [state.error]);

  if (state.error === "invalid") {
    return (
      <div className={ui.stack}>
        <h1 ref={invalidHeadingRef} tabIndex={-1}>
          {t("invalidHeading")}
        </h1>
        <p>{t("invalid")}</p>
        <p>
          <a className={ui.button} href={requestNewHref}>
            {t("requestNew")}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={ui.stack}>
      <h1>{t("heading")}</h1>
      <p>{t("lead")}</p>
      {tripName ? (
        <p className={ui.card} role="note">
          {t("joining", { trip: tripName })}
        </p>
      ) : null}
      {signedInAs ? (
        <p className={ui.muted} role="note">
          {t("otherAccount", { name: signedInAs })}
        </p>
      ) : null}
      <form className={styles.form} action={formAction} method="post">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="next" value={next} />
        {state.error === "generic" ? (
          <p className={ui.error} role="alert">
            {t("failed")}
          </p>
        ) : null}
        <button className={ui.button} type="submit" disabled={pending} aria-busy={pending}>
          {pending ? t("pending") : t("continue")}
        </button>
      </form>
      <p className={ui.muted}>
        {t("useCodeLead")} <a href={requestNewHref}>{t("useCode")}</a>
      </p>
    </div>
  );
}
