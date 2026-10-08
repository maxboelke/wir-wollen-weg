import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { isDemo } from "@/server/env";
import styles from "./page-shell.module.css";

interface PageShellProps {
  /** Link target of the brand name (landing or "My trips"). */
  homeHref: string;
  /** Language switch element (prefix link on public pages, cookie form in the app). */
  languageSwitch?: ReactNode;
  children: ReactNode;
}

/** Minimal page frame for the scaffold; the real header/footer follows in Increment 1. */
export async function PageShell({ homeHref, languageSwitch, children }: PageShellProps) {
  const t = await getTranslations();
  return (
    <>
      <a className={styles.skipLink} href="#content">
        {t("common.skipToContent")}
      </a>
      {isDemo() ? (
        <p className={styles.demoBanner} role="note">
          {t("common.demoBanner")}
        </p>
      ) : null}
      <header className={styles.header}>
        <a className={styles.brand} href={homeHref}>
          {t("app.name")}
        </a>
        {languageSwitch}
      </header>
      <main id="content" className={styles.main}>
        {children}
      </main>
    </>
  );
}
