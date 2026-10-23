"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLayoutEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import styles from "./stays.module.css";

/**
 * One-shot signals in the URL of `/stays` (removed right away, so a reload stays quiet):
 * `?notice=fixed|limit` – redirected from «Vorschlagen» (W17 F.1); `?focus=…` – focus target
 * after saving (W17 F.1 step 6 / F.4).
 */
export function PageSignals() {
  const t = useTranslations("stays");
  const toast = useToast();
  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    const notice = url.searchParams.get("notice");
    const focus = url.searchParams.get("focus");
    if (!notice && !focus) return;
    if (notice === "fixed") toast({ message: t("error.chosen") });
    if (notice === "limit") toast({ message: t("limit") });
    if (focus) {
      const target =
        document.getElementById(focus) ??
        document.querySelector<HTMLElement>(`[data-stay-row="${CSS.escape(focus)}"] h3`);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
      }
    }
    url.searchParams.delete("notice");
    url.searchParams.delete("focus");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [t, toast]);
  return null;
}

/**
 * Row-1 button `[+ Vorschlagen]` (W18 E.3): outline, 44 px, only the icon below 400 px (name
 * «Unterkunft vorschlagen»). At 30 suggestions `aria-disabled` – a tap explains why.
 */
export function SuggestButton({ href, full }: { href: string; full: boolean }) {
  const t = useTranslations("stays");
  const toast = useToast();
  if (full) {
    return (
      <button
        type="button"
        className={styles.suggest}
        aria-disabled="true"
        aria-label={t("suggestName")}
        onClick={() => {
          toast({ message: t("limit") });
        }}
      >
        <Icon name="plus" size={20} />
        <span className={styles.suggestLabel} aria-hidden="true">
          {t("suggest")}
        </span>
      </button>
    );
  }
  return (
    <Link className={styles.suggest} href={href} aria-label={t("suggestName")}>
      <Icon name="plus" size={20} />
      <span className={styles.suggestLabel} aria-hidden="true">
        {t("suggest")}
      </span>
    </Link>
  );
}
