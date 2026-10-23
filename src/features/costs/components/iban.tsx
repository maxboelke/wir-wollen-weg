"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ibanGroups, maskIban } from "@/lib/costs";
import { animate, DURATION, EASING } from "@/lib/motion";
import { CopyButton } from "./copy-button";
import styles from "./costs.module.css";

/**
 * IBAN of a recipient (R.8 I10-07, W19 D.8.4): masked by default – «DE89 •••• •••• •••• ••••
 * 3000», screen readers hear «IBAN von Kemal, endet auf 3000». `[Anzeigen]` shows it in full
 * on this device until the page is left (state only – never stored); `[Kopieren]` copies it
 * WITHOUT spaces. Masking protects against shoulder surfing and screenshots, not access.
 */
export function IbanLine({
  iban,
  owner,
  mine = false,
}: {
  iban: string;
  owner: string;
  mine?: boolean;
}) {
  const t = useTranslations("payInfo");
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // W19-13: the whole line cross-fades – no digit-by-digit reveal.
    animate(ref.current, [{ opacity: 0.35 }, { opacity: 1 }], {
      duration: DURATION.fade,
      easing: EASING.standard,
    });
  }, [visible]);
  const mask = maskIban(iban);
  const sr = mine
    ? t("ibanMineSr", { last4: mask.last4 })
    : t("ibanSr", { name: owner, last4: mask.last4 });
  return (
    <span className={styles.payLine}>
      <span ref={ref} className={styles.iban} data-iban={visible ? "full" : "masked"}>
        {`${t("ibanLabel")} `}
        {visible ? (
          ibanGroups(iban).map((group, i) => (
            <span key={`${group}-${String(i)}`} className={styles.ibanGroup}>
              {i > 0 ? " " : ""}
              {group}
            </span>
          ))
        ) : (
          <>
            <span aria-hidden="true">
              <span className={styles.ibanGroup}>{mask.head}</span>
              {Array.from({ length: mask.masked }, (_, i) => (
                <span key={i} className={styles.ibanGroup}>
                  {" "}
                  <span className={styles.mask}>{"••••"}</span>
                </span>
              ))}
              <span className={styles.ibanGroup}>{` ${mask.last4}`}</span>
            </span>
            <span className="visually-hidden">{sr}</span>
          </>
        )}
      </span>
      <Button
        variant="text"
        size="sm"
        icon={visible ? "eye-off" : "eye"}
        aria-pressed={visible}
        aria-label={visible ? t("hideName", { name: owner }) : t("showName", { name: owner })}
        onClick={() => {
          setVisible((v) => !v);
        }}
      >
        {visible ? t("hide") : t("show")}
      </Button>
      <CopyButton
        text={iban}
        label={t("copy")}
        name={t("copyIbanName", { name: owner })}
        done={() => {
          toast({ message: t("ibanCopied") });
        }}
      />
    </span>
  );
}
