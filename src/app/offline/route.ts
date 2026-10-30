import { createTranslator } from "next-intl";
import { offlinePageHtml, type OfflineTexts } from "@/lib/offline-page";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";

/** `/offline` – static offline page, both languages in one file (W23 C.2) [always]. */
export const dynamic = "force-static";

function texts(locale: "de" | "en"): OfflineTexts {
  const messages = locale === "de" ? de : en;
  const t = createTranslator({ locale, messages, namespace: "pwa.offline" });
  const product = messages.app.name;
  return {
    lang: locale,
    title: t("title"),
    heading: t("heading"),
    text: t("text", { product }),
    retry: t("retry"),
    retrying: t("retrying"),
    auto: t("auto"),
  };
}

export function GET(): Response {
  return new Response(offlinePageHtml(texts("de"), texts("en")), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
