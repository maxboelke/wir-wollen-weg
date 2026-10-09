import "server-only";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/config";
import { formattingLocale, isCountry, regionFromAcceptLanguage, type Country } from "@/lib/region";
import type { Session } from "./session";

export interface ViewerFormat {
  locale: Locale;
  country: Country;
  /** BCP 47 tag for Intl, e.g. "de-DE", "en-US" (ux-spec §9). */
  intl: string;
  /** Default holiday region for new trips: account subdivision or country (F-016). */
  region: string;
}

/** Language and region of the viewer – account settings, otherwise the browser (Flow F.1). */
export async function viewerFormat(session: Session | null): Promise<ViewerFormat> {
  const raw = await getLocale();
  const locale: Locale = isLocale(raw) ? raw : "en";
  let country: Country;
  let subdivision: string | null = null;
  if (session && isCountry(session.user.country)) {
    country = session.user.country;
    subdivision = typeof session.user.subdivision === "string" ? session.user.subdivision : null;
  } else {
    country = regionFromAcceptLanguage((await headers()).get("accept-language"), locale);
  }
  return {
    locale,
    country,
    intl: formattingLocale(locale, country),
    region: subdivision ?? country,
  };
}
