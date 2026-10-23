"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { currencyChoices } from "@/lib/costs";
import { changeCurrencyAction } from "../actions";
import styles from "./costs.module.css";

function currencyName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * «Währung der Reise» (W19 D.4.4, R.8 I10-08 – organiser, only without expenses and
 * settlements): the 12 allowed currencies, the current one first. A refusal by the server
 * (someone added an expense meanwhile) shows the reason and locks the button.
 */
export function CurrencySheet({
  publicId,
  current,
  locale,
  onDone,
}: {
  publicId: string;
  current: string;
  locale: string;
  onDone: () => void;
}) {
  const t = useTranslations("costs");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const ids = useId();
  const [value, setValue] = useState(current);
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <div className={styles.sheetBody}>
      <p className={styles.muted}>{t("currency.hint")}</p>
      {locked ? (
        <Banner tone="warning" role="alert">
          {t("currency.locked")}
        </Banner>
      ) : null}
      <fieldset className={styles.radioList}>
        <legend className="visually-hidden">{t("currency.title")}</legend>
        {currencyChoices(current).map((code) => (
          <label key={code} className={styles.radioItem}>
            <input
              type="radio"
              name={`${ids}-currency`}
              value={code}
              checked={value === code}
              onChange={() => {
                setValue(code);
              }}
            />
            <span>{`${currencyName(code, locale)} (${code})`}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.sheetActions}>
        <Button variant="secondary" size="md" onClick={onDone}>
          {tCommon("cancel")}
        </Button>
        <Button
          size="md"
          loading={pending}
          aria-disabled={locked || undefined}
          onClick={() => {
            if (value === current) {
              onDone();
              return;
            }
            setPending(true);
            void changeCurrencyAction(publicId, value)
              .then((result) => {
                if (result.ok) {
                  toast({
                    message: t("currency.done", { name: currencyName(value, locale), code: value }),
                  });
                  onDone();
                } else if (result.error === "hasExpenses") {
                  setLocked(true);
                } else {
                  toast({ message: t("error") });
                }
              })
              .catch(() => {
                toast({ message: t("error") });
              })
              .finally(() => {
                setPending(false);
              });
          }}
        >
          {t("currency.save")}
        </Button>
      </div>
    </div>
  );
}
