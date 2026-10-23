"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { SharePanel } from "@/features/trips/components/share-panel";
import type { Locale } from "@/i18n/config";
import styles from "@/features/stays/components/stays.module.css";

/**
 * One-shot signals in the URL of the cost pages (removed right away, a reload stays quiet):
 * `?notice=closed` – redirected from «Ausgabe hinzufügen/bearbeiten» (W19 D.1); `?saved=<id>`
 * – back from the form: focus on h1 (D.5.6), the row is tinted once (W19-09).
 */
export function CostsSignals() {
  const t = useTranslations("costs");
  const toast = useToast();
  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    const notice = url.searchParams.get("notice");
    const saved = url.searchParams.get("saved");
    if (!notice && !saved) return;
    if (notice === "closed") toast({ message: t("closed.redirect") });
    if (saved) document.getElementById("costs-title")?.focus();
    url.searchParams.delete("notice");
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [t, toast]);
  return null;
}

/** `[Teilen]` in row 1 (W19 D.3/D.11): outline, icon only below 400 px, opens the share sheet. */
export function CostsShareButton({
  link,
  texts,
  defaultLocale,
  tripName,
}: {
  link: string;
  texts: Record<Locale, string>;
  defaultLocale: Locale;
  tripName: string;
}) {
  const t = useTranslations("costs");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={styles.suggest}
        aria-label={t("shareName")}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
      >
        <Icon name="share" size={20} />
        <span className={styles.suggestLabel} aria-hidden="true">
          {t("share")}
        </span>
      </button>
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t("shareTitle")}
        closeLabel={tCommon("close")}
      >
        <SharePanel link={link} texts={texts} defaultLocale={defaultLocale} tripName={tripName} />
      </BottomSheet>
    </>
  );
}
