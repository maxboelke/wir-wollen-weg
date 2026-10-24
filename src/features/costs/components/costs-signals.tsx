"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect } from "react";
import { useToast } from "@/components/ui/toast";

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
