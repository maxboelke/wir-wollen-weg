import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { brandMetadata, brandViewport, DocumentHead } from "@/components/document-head";
import { MotionPreferenceSync } from "@/components/motion-preference-sync";
import { FlashToast } from "@/components/shell/flash-toast";
import { ToastProvider } from "@/components/ui/toast";
import { getSession } from "@/server/session";
import "@/styles/globals.css";

// Root layout for language-neutral app routes (/login, /i/<token>, /trips, /auth/…).
// Locale: cookie `lang` → Accept-Language → en (src/i18n/request.ts). Never indexed.

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("app"), getLocale()]);
  return {
    title: { default: t("name"), template: `%s · ${t("name")}` },
    robots: { index: false, follow: false },
    ...brandMetadata(locale),
  };
}

export const viewport = brandViewport;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  const accountReduces = session ? session.user.reduceMotion === true : undefined;
  return (
    // Signed in, the account's "Reduce motion" applies from the server HTML on (F-052).
    <html
      lang={locale}
      data-motion={accountReduces ? "reduce" : undefined}
      suppressHydrationWarning
    >
      <head>
        <DocumentHead />
      </head>
      <body>
        <NextIntlClientProvider>
          <ToastProvider>
            {children}
            <FlashToast />
          </ToastProvider>
        </NextIntlClientProvider>
        <MotionPreferenceSync account={accountReduces} />
      </body>
    </html>
  );
}
