import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { negotiateLocale } from "./negotiate";

/** Resolves the locale for routes without prefix (/login, /i/…, /trips …). */
export async function resolveRequestLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return negotiateLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export default getRequestConfig(async (params) => {
  // Public content pages (/de, /en …) pass their prefix via setRequestLocale();
  // all app routes are language-neutral and negotiate the locale per request.
  // next-intl 4.14 marks `requestLocale`/`setRequestLocale` as deprecated in favour of
  // `next/root-params`; root params are not yet detected with our two root layouts
  // (Next 16.4) – migration tracked in docs/ops/spike-auth.md §6.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const requested = await params.requestLocale;
  const locale = isLocale(requested) ? requested : await resolveRequestLocale();

  return {
    locale,
    messages: (await loadMessages(locale)).default,
  };
});

function loadMessages(locale: Locale) {
  return locale === "de" ? import("../../messages/de.json") : import("../../messages/en.json");
}
