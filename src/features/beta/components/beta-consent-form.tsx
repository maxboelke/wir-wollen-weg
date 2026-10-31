"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, FieldError } from "@/components/ui/field";
import { isLocale } from "@/i18n/config";
import { PRIVACY_PATHS } from "@/lib/legal";
import { submitBetaConsent, type BetaConsentState } from "../actions";
import { betaPath } from "../paths";
import styles from "../beta.module.css";
import { PrivacySummary } from "./privacy-summary";

/**
 * W23 A.4 – `/beta?step=privacy` «Kurz zum Datenschutz»: short notice (compliance §13.6), link to
 * the full notice in the SAME window (the pass cookie keeps the state, W23 C.5), consent
 * checkbox never pre-ticked, «Weiter» always active – a missing tick is an error at the field.
 */
export function BetaConsentForm({ next }: { next: string | undefined }) {
  const t = useTranslations("beta");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const id = useId();
  const boxRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState<BetaConsentState, FormData>(
    submitBetaConsent,
    {},
  );

  useEffect(() => {
    if (state.error === "consent") boxRef.current?.focus();
  }, [state]);

  if (state.error === "expired") {
    // The pass expired (24 h) or the code was rotated meanwhile: back to step 1.
    return (
      <div className={styles.step}>
        <p role="alert">{t("signup.missingHeading")}</p>
        <Link className={styles.textLink} href={betaPath("code", next)}>
          {t("signup.missingCta")}
        </Link>
      </div>
    );
  }

  const errorId = `${id}-consent-error`;
  return (
    <div className={styles.step}>
      <Link className={styles.back} href={betaPath("code", next)}>
        <Icon name="arrow-left" size={20} />
        {t("back")}
      </Link>
      <h1 className={styles.heading}>{t("privacy.heading")}</h1>
      <PrivacySummary />
      <p className={styles.small}>
        {t.rich("privacy.more", {
          link: (chunks) => (
            <Link className={styles.inlineLink} href={PRIVACY_PATHS[locale]}>
              {chunks}
            </Link>
          ),
        })}
      </p>
      <form action={action} className={styles.form} noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <Checkbox
            ref={boxRef}
            name="consent"
            label={t("privacy.consent")}
            aria-invalid={state.error === "consent" ? true : undefined}
            aria-describedby={state.error === "consent" ? errorId : undefined}
          />
          {state.error === "consent" ? (
            <FieldError id={errorId}>{t("privacy.errorConsent")}</FieldError>
          ) : null}
        </div>
        <Button type="submit" block loading={pending}>
          {t("privacy.submit")}
        </Button>
      </form>
    </div>
  );
}
