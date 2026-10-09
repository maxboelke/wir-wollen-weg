"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import {
  isLocale,
  LOCALE_CHOSEN_COOKIE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "@/i18n/config";
import { db } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { getSession } from "@/server/session";

const COOKIE_OPTIONS = {
  maxAge: LOCALE_COOKIE_MAX_AGE,
  sameSite: "lax",
  httpOnly: true,
  path: "/",
} as const;

/**
 * An explicit language choice (Flow F.3): stored in this browser (cookie `lang` + time of
 * the choice) and – when signed in – in the account, so it applies on every device. The
 * time lets the latest explicit choice win at the next sign-in.
 */
export async function chooseLanguage(locale: Locale): Promise<void> {
  const now = new Date();
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  store.set(LOCALE_CHOSEN_COOKIE, String(now.getTime()), COOKIE_OPTIONS);
  const session = await getSession();
  if (session) {
    await db()
      .update(user)
      .set({ locale, localeChosenAt: now })
      .where(eq(user.id, session.user.id));
  }
}

/** Form variant (header/footer switch, avatar menu) – works without JavaScript. */
export async function setLanguage(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  await chooseLanguage(locale);
}
