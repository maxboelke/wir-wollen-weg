"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { detectPlatform } from "@/lib/pwa";
import { submitBetaCode, type BetaCodeState } from "../actions";
import { installPath } from "../paths";
import styles from "../beta.module.css";

/**
 * W23 A.3 – `/beta` step 1 «Beta-Code». Checked on the server before any mail; errors at the
 * field with focus (ux-spec §5.1). A code in the link fragment (`#code=…`, never in server
 * logs) pre-fills the field – it is NOT submitted automatically.
 */
export function BetaCodeForm({ next, product }: { next: string | undefined; product: string }) {
  const t = useTranslations("beta");
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState<BetaCodeState, FormData>(submitBetaCode, {});
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    const match = /(?:^|&)code=([^&]*)/.exec(window.location.hash.slice(1));
    if (match?.[1] && inputRef.current && !inputRef.current.value) {
      try {
        inputRef.current.value = decodeURIComponent(match[1]);
      } catch {
        // malformed fragment – leave the field empty
      }
    }
    const info = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- user agent only readable after mounting
    setInApp(info.platform === "ios" && info.inApp !== null);
  }, []);

  useEffect(() => {
    if (state.error) {
      inputRef.current?.focus();
      if (state.error === "wrong") inputRef.current?.select();
    }
  }, [state]);

  const error =
    state.error === "rate"
      ? t("code.errorRate", { min: state.minutes ?? 1 })
      : state.error === "empty"
        ? t("code.errorEmpty")
        : state.error === "wrong"
          ? t("code.errorWrong")
          : state.error === "full"
            ? t("code.errorFull")
            : state.error
              ? t("code.errorWrong")
              : null;

  return (
    <div className={styles.step}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>{t("code.heading")}</h1>
        <p className={styles.lead}>{t("code.intro", { product })}</p>
      </div>
      <form action={action} className={styles.form} noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <TextField
          ref={inputRef}
          id={`${id}-code`}
          name="code"
          label={t("code.label")}
          hint={t("code.hint")}
          error={error}
          defaultValue={state.value}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
        />
        <Button type="submit" block loading={pending} loadingLabel={t("code.checking")}>
          {t("code.submit")}
        </Button>
      </form>
      <Link
        className={styles.textLink}
        href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
      >
        {t("code.haveAccount")}
      </Link>
      {inApp ? (
        <p className={styles.note} role="note">
          {t("code.inAppTip")}{" "}
          <Link className={styles.inlineLink} href={installPath()}>
            {t("code.inAppHow")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
