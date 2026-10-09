import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { brandMetadata, brandViewport, DocumentHead } from "@/components/document-head";
import { MotionPreferenceSync } from "@/components/motion-preference-sync";
import { ToastProvider } from "@/components/ui/toast";
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
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <DocumentHead />
      </head>
      <body>
        <NextIntlClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
        <MotionPreferenceSync />
      </body>
    </html>
  );
}
