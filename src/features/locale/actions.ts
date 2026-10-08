"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/config";

/** Explicit language choice on language-neutral routes (Flow F.3). */
export async function setLanguage(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  });
  // Account language (signed-in users) is stored in Increment 1 (F-046).
}
