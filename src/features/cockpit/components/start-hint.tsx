"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { START_PARAM } from "@/lib/start-trip";

const KEY = "ww-start-hint:";

/**
 * One-off hint after the app opened the running trip by itself (W16 v2.18): snackbar
 * «Deine laufende Reise ist direkt geöffnet …» + «Meine Reisen», once per trip (only the trip id
 * is stored). Removes the `?start=1` flag so a reload stays quiet; no focus move.
 */
export function StartHint({ publicId }: { publicId: string }) {
  const t = useTranslations("start");
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(START_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    let seen = false;
    try {
      seen = window.localStorage.getItem(KEY + publicId) === "1";
      window.localStorage.setItem(KEY + publicId, "1");
    } catch {
      // storage blocked – show the hint (it is harmless)
    }
    if (seen) return;
    toast({
      message: t("hint"),
      action: {
        label: t("action"),
        onAction: () => {
          router.push("/trips");
        },
      },
    });
  }, [publicId, router, t, toast]);
  return null;
}
