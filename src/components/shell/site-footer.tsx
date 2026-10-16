import { getLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { helpHref } from "@/lib/help";
import { IMPRINT_PATHS, PRIVACY_PATHS } from "@/lib/legal";
import { LanguageSegment } from "./language-segment";
import styles from "./site-footer.module.css";

/**
 * Footer of every page (R-018, sitemap §5, F-051): «Hilfe · Datenschutz · Impressum» always
 * at the same place and in the same order (WCAG 2.2 SC 3.2.6 consistent help) and the language
 * segment. The legal pages are placeholders until go-live (Q14/Q16).
 */
export async function SiteFooter({ alternateHref }: { alternateHref?: string | undefined }) {
  const [rawLocale, t] = await Promise.all([getLocale(), getTranslations("common")]);
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav aria-label={t("footerLabel")}>
          <ul className={styles.links}>
            <li>
              <a className={styles.link} href={helpHref(locale)}>
                {t("help")}
              </a>
            </li>
            <li>
              <a className={styles.link} href={PRIVACY_PATHS[locale]}>
                {t("privacy")}
              </a>
            </li>
            <li>
              <a className={styles.link} href={IMPRINT_PATHS[locale]}>
                {t("imprint")}
              </a>
            </li>
          </ul>
        </nav>
        <LanguageSegment locale={locale} alternateHref={alternateHref} />
      </div>
    </footer>
  );
}
