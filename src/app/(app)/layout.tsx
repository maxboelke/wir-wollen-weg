import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import "@/styles/globals.css";

// Root layout for language-neutral app routes (/login, /i/<token>, /trips, /auth/…).
// Locale: cookie `lang` → Accept-Language → en (src/i18n/request.ts). Never indexed.

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return {
    title: { default: t("name"), template: `%s · ${t("name")}` },
    robots: { index: false, follow: false },
  };
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
