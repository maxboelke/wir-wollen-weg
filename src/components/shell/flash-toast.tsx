"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

const FLASH_COOKIE = "ww-flash";

/**
 * One-shot snackbars across a redirect (Flow H.2: «Du bist abgemeldet.» on the landing
 * page). The Server Action sets a short-lived cookie; this reads and deletes it.
 */
export function FlashToast() {
  const t = useTranslations("common");
  const toast = useToast();
  useEffect(() => {
    const match = new RegExp(`(?:^|;\\s*)${FLASH_COOKIE}=([^;]*)`).exec(document.cookie);
    if (!match) return;
    document.cookie = `${FLASH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    if (match[1] === "signed-out") toast({ message: t("signedOut") });
  }, [t, toast]);
  return null;
}
