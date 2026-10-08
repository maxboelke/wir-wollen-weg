import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { cx } from "@/lib/cx";
import { isDemo } from "@/server/env";
import { Wordmark } from "./brand/logo";
import styles from "./page-shell.module.css";

/** First focusable element on every page (ux-spec §7.1). */
export async function SkipLink() {
  const t = await getTranslations("common");
  return (
    <a className={styles.skipLink} href="#content">
      {t("skipToContent")}
    </a>
  );
}

/** Demo banner (deployment.md §0.1) – only with APP_ENV=demo. */
export async function DemoBanner() {
  if (!isDemo()) return null;
  const t = await getTranslations("common");
  return (
    <p className={styles.demoBanner} role="note">
      {t("demoBanner")}
    </p>
  );
}

/** Brand link: mark + word mark in the UI language; accessible name = product name only. */
export async function BrandLink({
  href,
  tone = "auto",
}: {
  href: string;
  tone?: "auto" | "onBrand";
}) {
  const t = await getTranslations("app");
  return (
    <Link className={cx(styles.brand, tone === "onBrand" && styles.brandOnBrand)} href={href}>
      <Wordmark lead={t("nameLead")} accent={t("nameAccent")} tone={tone} />
    </Link>
  );
}

interface PageShellProps {
  /** Link target of the brand (landing or "My trips"). */
  homeHref: string;
  /** Language switch (prefix link on public pages, cookie form in the app). */
  languageSwitch?: ReactNode;
  /** Extra header actions (e.g. sign out). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}

/** Calm page frame for sign-in, invite and account pages (light, no cockpit – design-system §1). */
export function PageShell({
  homeHref,
  languageSwitch,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <>
      <SkipLink />
      <DemoBanner />
      <header className={styles.header}>
        <BrandLink href={homeHref} />
        <div className={styles.headerActions}>
          {languageSwitch}
          {actions}
        </div>
      </header>
      <main id="content" className={cx(styles.main, className)}>
        {children}
      </main>
    </>
  );
}
