import { getTranslations } from "next-intl/server";
import { setLanguage } from "@/features/locale/actions";
import { locales, type Locale } from "@/i18n/config";
import styles from "./site-footer.module.css";

interface LanguageSegmentProps {
  locale: Locale;
  /** Public pages with locale prefix: link to the counterpart (/de/hilfe ↔ /en/help). */
  alternateHref?: string | undefined;
}

/**
 * Footer segment «Deutsch | English» (Flow F.2, design-system §9.19): the current language
 * is marked, the other one is a single tap. App routes: cookie/account via Server Action
 * (works without JavaScript); prefixed pages: a plain link.
 */
export async function LanguageSegment({ locale, alternateHref }: LanguageSegmentProps) {
  const t = await getTranslations("common");
  return (
    <div className={styles.segment} role="group" aria-label={t("languageLabel")}>
      {locales.map((option) => {
        const label = t(`languages.${option}`);
        const current = option === locale;
        if (alternateHref) {
          return current ? (
            <span key={option} className={styles.segmentItem} aria-current="true" lang={option}>
              {label}
            </span>
          ) : (
            <a
              key={option}
              className={styles.segmentItem}
              href={alternateHref}
              hrefLang={option}
              lang={option}
            >
              {label}
            </a>
          );
        }
        // App routes: both items stay buttons, so focus remains on the tapped one after
        // the page re-renders in the new language (Flow F.3).
        return (
          <form key={option} action={setLanguage} className={styles.segmentForm}>
            <input type="hidden" name="locale" value={option} />
            <button
              type="submit"
              className={styles.segmentItem}
              aria-current={current ? "true" : undefined}
              lang={option}
            >
              {label}
            </button>
          </form>
        );
      })}
    </div>
  );
}
