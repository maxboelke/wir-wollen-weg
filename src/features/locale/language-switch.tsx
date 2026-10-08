import { getLocale, getTranslations } from "next-intl/server";
import ui from "@/components/ui.module.css";
import { setLanguage } from "./actions";

/** One-tap switch to the other language, labelled in the target language (Flow F.2). */
export async function LanguageSwitch() {
  const locale = await getLocale();
  const other = locale === "de" ? "en" : "de";
  const t = await getTranslations("common");
  return (
    <form action={setLanguage}>
      <input type="hidden" name="locale" value={other} />
      <button type="submit" className={ui.textButton} lang={other}>
        {t("switchLanguage")}
      </button>
    </form>
  );
}
