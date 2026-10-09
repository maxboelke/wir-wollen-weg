"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { FLASH_COOKIE, parseFlash } from "@/lib/flash";

/**
 * One-shot snackbars across a redirect (Flow H.2: «Du bist abgemeldet.» on the landing
 * page; Flow J: «Du hast „Lissabon 2027“ verlassen.» on «Meine Reisen»). The Server Action
 * sets a short-lived cookie; this reads and deletes it.
 */
export function FlashToast() {
  const t = useTranslations("common");
  const toast = useToast();
  useEffect(() => {
    const match = new RegExp(`(?:^|;\\s*)${FLASH_COOKIE}=([^;]*)`).exec(document.cookie);
    if (!match) return;
    document.cookie = `${FLASH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    const flash = parseFlash(match[1]);
    if (!flash) return;
    if (flash.kind === "signed-out") toast({ message: t("signedOut") });
    if (flash.kind === "trip-left") toast({ message: t("tripLeft", { trip: flash.detail }) });
    if (flash.kind === "trip-deleted") toast({ message: t("tripDeleted", { trip: flash.detail }) });
  }, [t, toast]);
  return null;
}
