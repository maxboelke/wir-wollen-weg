import { getLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { helpHref } from "@/lib/help";
import { LanguageSegment } from "./language-segment";
import styles from "./site-footer.module.css";

/**
 * Footer of every page (R-018, sitemap §5, F-051): «Hilfe» always at the same place
 * (WCAG 2.2 SC 3.2.6 consistent help) and the language segment. Privacy policy and imprint
 * join here with the legal pages (placeholders until go-live, Q14/Q16).
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
          </ul>
        </nav>
        <LanguageSegment locale={locale} alternateHref={alternateHref} />
      </div>
    </footer>
  );
}
