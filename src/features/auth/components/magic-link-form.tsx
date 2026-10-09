"use client";

import { unstable_rethrow } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-styles";
import { FieldError } from "@/components/ui/field";
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
  /** Decorative illustration, rendered on the server. */
  illustration?: ReactNode;
}

/**
 * Magic-link landing card (Flow H.5, W02, R-006). A real form bound to a Server Action:
 * works before hydration and without JS (React renders method/encType itself – setting
 * `method` here caused the hydration warning R-015). With JS the submit is intercepted so
 * that a network failure shows inline above the button instead of the error page (R-013).
 */
export function MagicLinkForm({
  token,
  next,
  requestNewHref,
  tripName,
  signedInAs,
  illustration,
}: MagicLinkFormProps) {
  const t = useTranslations("magic");
  const ids = useId();
  const [serverState, formAction, formPending] = useActionState<MagicLinkResult, FormData>(
    redeemMagicLink,
    {},
  );
  const [clientState, setClientState] = useState<MagicLinkResult>({});
  const [pending, startTransition] = useTransition();
  const invalidHeadingRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const state = clientState.error ? clientState : serverState;
  const busy = pending || formPending;

  // Announce the error state by moving focus to its heading (W02 A11y).
  useEffect(() => {
    if (state.error === "invalid") invalidHeadingRef.current?.focus();
  }, [state.error]);

  if (state.error === "invalid") {
    return (
      <div className={styles.step}>
        {illustration ? <div className={styles.illustration}>{illustration}</div> : null}
        <div className={styles.intro}>
          <h1 ref={invalidHeadingRef} tabIndex={-1} className={styles.heading}>
            {t("invalidHeading")}
          </h1>
          <p className={styles.lead}>{t("invalid")}</p>
        </div>
        <a className={buttonClassName({ block: true })} href={requestNewHref}>
          {t("requestNew")}
        </a>
      </div>
    );
  }

  const errorId = `${ids}-error`;
  return (
    <div className={styles.step}>
      {illustration ? <div className={styles.illustration}>{illustration}</div> : null}
      <div className={styles.intro}>
        <h1 className={styles.heading}>{t("heading")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
      </div>
      {tripName ? (
        <Banner tone="info" role="note">
          {t("joining", { trip: tripName })}
        </Banner>
      ) : null}
      {signedInAs ? (
        <Banner tone="warning" role="note">
          {t("otherAccount", { name: signedInAs })}
        </Banner>
      ) : null}
      <form
        className={styles.form}
        action={formAction}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setClientState({});
          startTransition(async () => {
            try {
              const result = await redeemMagicLink({}, formData);
              setClientState(result);
            } catch (error) {
              // Redirects (success) are handled by Next.js – only real failures stay here.
              unstable_rethrow(error);
              setClientState({ error: "generic" });
              buttonRef.current?.focus();
            }
          });
        }}
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="next" value={next} />
        {state.error === "generic" ? <FieldError id={errorId}>{t("failed")}</FieldError> : null}
        <Button
          ref={buttonRef}
          type="submit"
          block
          loading={busy}
          loadingLabel={t("pending")}
          aria-describedby={state.error === "generic" ? errorId : undefined}
        >
          {state.error === "generic" ? t("retry") : t("continue")}
        </Button>
      </form>
      <p className={styles.small}>
        {t("useCodeLead")} <a href={requestNewHref}>{t("useCode")}</a>
      </p>
    </div>
  );
}
