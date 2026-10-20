import Link from "next/link";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitch, LanguageSwitchLink } from "@/features/locale/language-switch";
import { isLocale, type Locale } from "@/i18n/config";
import { inboxEnabled } from "@/lib/app-env";
import { DEMO_INBOX_PATH } from "@/lib/demo-inbox";
import { cx } from "@/lib/cx";
import { helpHref } from "@/lib/help";
import { isDemo } from "@/server/env";
import { getSession } from "@/server/session";
import { Wordmark } from "./brand/logo";
import { Enter } from "./enter";
import { AccountMenu } from "./shell/account-menu";
import { PendingAuthBanner } from "./shell/pending-auth-banner";
import { SiteFooter } from "./shell/site-footer";
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

/**
 * Demo banner (deployment.md §0.1) – APP_ENV=demo and the online preview (§0.7); with the demo
 * inbox (MAIL_TRANSPORT=inbox) it links there, so codes are one tap away on every page.
 */
export async function DemoBanner() {
  if (!isDemo()) return null;
  const t = await getTranslations("common");
  return (
    <p className={styles.demoBanner} role="note">
      {t("demoBanner")}
      {inboxEnabled() ? (
        <>
          {" "}
          <a className={styles.demoBannerLink} href={DEMO_INBOX_PATH}>
            {t("demoInboxLink")}
          </a>
        </>
      ) : null}
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
  children: ReactNode;
  className?: string | undefined;
  /**
   * Public pages with locale prefix (help, later legal pages): header switch and footer
   * segment link to this counterpart; no session lookup (stays static and indexable).
   */
  alternate?: { href: string; locale: Locale } | undefined;
  /** Content entrance on client navigation (G-01); off for pages that animate themselves. */
  enter?: boolean | undefined;
  /** "wide": up to 1040 px for card grids (W04 «Meine Reisen» from 600 px two columns). */
  width?: "narrow" | "wide" | undefined;
}

/**
 * Calm page frame for sign-in, invite, account and help pages (light, no cockpit –
 * design-system §1): skip link, header (signed out: language switch · signed in: avatar
 * menu), `pendingAuth` banner, `<main>` and the footer with help link and language segment.
 */
export async function PageShell({
  children,
  className,
  alternate,
  enter = true,
  width = "narrow",
}: PageShellProps) {
  const session = alternate ? null : await getSession();
  const rawLocale = await getLocale();
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const content = enter ? <Enter>{children}</Enter> : children;
  return (
    <>
      <SkipLink />
      <DemoBanner />
      <header className={cx(styles.header, width === "wide" && styles.wide)}>
        <BrandLink href={session ? "/trips" : alternate ? `/${locale}` : "/"} />
        <div className={styles.headerActions}>
          {session ? (
            <AccountMenu
              userId={session.user.id}
              name={session.user.name || session.user.email}
              locale={locale}
              helpHref={helpHref(locale)}
            />
          ) : alternate ? (
            <LanguageSwitchLink href={alternate.href} locale={alternate.locale} />
          ) : (
            <LanguageSwitch />
          )}
        </div>
      </header>
      {session ? null : <PendingAuthBanner />}
      <main id="content" className={cx(styles.main, width === "wide" && styles.wide, className)}>
        {content}
      </main>
      <SiteFooter alternateHref={alternate?.href} />
    </>
  );
}
