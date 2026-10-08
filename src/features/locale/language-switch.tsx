import { getLocale, getTranslations } from "next-intl/server";
import {
  languageSwitchClassName,
  LanguageSwitchContent,
  type LanguageSwitchTone,
} from "@/components/ui/language-switch";
import { setLanguage } from "./actions";

/** One-tap switch to the other language on app routes (cookie), labelled in the target language (Flow F.2). */
export async function LanguageSwitch({ tone = "light" }: { tone?: LanguageSwitchTone }) {
  const locale = await getLocale();
  const other = locale === "de" ? "en" : "de";
  const t = await getTranslations("common");
  return (
    <form action={setLanguage}>
      <input type="hidden" name="locale" value={other} />
      <button type="submit" className={languageSwitchClassName(tone)} lang={other}>
        <LanguageSwitchContent>{t("switchLanguage")}</LanguageSwitchContent>
      </button>
    </form>
  );
}

/** Public pages with locale prefix (/de ↔ /en): a plain link. */
export async function LanguageSwitchLink({
  href,
  locale,
  tone = "light",
}: {
  href: string;
  locale: string;
  tone?: LanguageSwitchTone;
}) {
  const t = await getTranslations("common");
  return (
    <a className={languageSwitchClassName(tone)} href={href} hrefLang={locale} lang={locale}>
      <LanguageSwitchContent>{t("switchLanguage")}</LanguageSwitchContent>
    </a>
  );
}
