"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import { DURATION, enter } from "@/lib/motion";
import { useWasServerPainted } from "@/lib/use-hydration";
import { SharePanel } from "../../trips/components/share-panel";
import { celebratedAction } from "../actions";
import type { Celebration } from "../celebration";
import styles from "./result.module.css";

export interface ResultCardProps {
  publicId: string;
  tripName: string;
  /** «Mi., 5. Mai – Mo., 10. Mai 2027» in the viewer's format. */
  dateText: string;
  nightsText: string;
  goingText: string;
  /** «noch 23 Tage» – the countdown as TEXT (D-24); the ring only decorates. */
  countdownText: string;
  isOrganizer: boolean;
  /** Celebration due for this member and range (F-012, Q17 b). */
  celebrate: boolean;
  /** Organiser right after «Termin festlegen»: focus goes to the heading (M-U10). */
  focusHeading: boolean;
  percent: number;
  icsHref: string;
  googleHref: string;
  shareLink: string;
  shareTexts: Record<Locale, string>;
  defaultLocale: Locale;
}

/** In-app browsers (WhatsApp, Instagram, Facebook …) often block downloads (Flow D.3). */
function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)|GSA\//.test(userAgent);
}

/**
 * W11 result card «Es geht los!» (F-012, design-system §9.6) with «Zum Kalender hinzufügen»
 * (ICS + Google) and the share sheet «Fix! …». Runs the celebration once per person and fixing
 * (Q17 b): the marker is set when it visibly starts (ux-spec §7.5); the celebration code is
 * loaded on demand (F-052). Text and buttons never wait for it.
 */
export function ResultCard(props: ResultCardProps) {
  const t = useTranslations("poll.result");
  const tCommon = useTranslations("common");
  const ids = useId();
  const cardRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const serverPainted = useWasServerPainted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [inApp, setInApp] = useState(false);

  // M-U10: the organiser's focus lands on «Es geht los!» at once – before any animation.
  useLayoutEffect(() => {
    if (!props.focusHeading) return;
    headingRef.current?.focus({ preventScroll: false });
    // Do not focus again on reload.
    const url = new URL(window.location.href);
    url.searchParams.delete("fixed");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [props.focusHeading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser detection
    setInApp(isInAppBrowser(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!props.celebrate) return;
    let handle: Celebration | null = null;
    let cancelled = false;
    let started = false;
    const start = () => {
      if (started || document.visibilityState !== "visible") return;
      started = true;
      document.removeEventListener("visibilitychange", start);
      // Seen as soon as it visibly starts – also with reduced motion (F-012).
      void celebratedAction(props.publicId);
      void import("../celebration").then(({ celebrate }) => {
        if (cancelled) return;
        const ring = document.querySelector<HTMLElement>("[data-countdown-ring]");
        if (!ring) return;
        handle = celebrate({
          ring,
          card: cardRef.current,
          bar: document.querySelector<HTMLElement>("[data-step-bar='current']"),
          percent: props.percent,
          animateCard: !serverPainted,
        });
      });
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", start);
      handle?.finish();
    };
    // Once per mount – the props of one fixing do not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    enter(menuRef.current, { scale: 0.96, duration: DURATION.fast });
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        (menuRef.current?.contains(event.target as Node) ||
          menuButtonRef.current?.contains(event.target as Node))
      ) {
        return;
      }
      setMenuOpen(false);
      if (event instanceof KeyboardEvent) menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!downloaded) return;
    const timer = window.setTimeout(() => {
      setDownloaded(false);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [downloaded]);

  const calendar = (
    <div className={styles.menu}>
      <Button
        ref={menuButtonRef}
        variant={props.isOrganizer ? "secondary" : "primary"}
        size={props.isOrganizer ? "md" : "lg"}
        block
        icon="calendar-download"
        iconEnd="chevron-down"
        aria-expanded={menuOpen}
        aria-controls={`${ids}-menu`}
        onClick={() => {
          setMenuOpen((open) => !open);
        }}
      >
        {downloaded ? t("downloaded") : t("addToCalendar")}
      </Button>
      {menuOpen ? (
        <ul id={`${ids}-menu`} ref={menuRef} className={styles.menuList}>
          <li>
            <a
              className={styles.menuItem}
              href={props.icsHref}
              download
              onClick={() => {
                setMenuOpen(false);
                setDownloaded(true);
              }}
            >
              <Icon name="calendar-download" size={20} />
              {t("icsFile")}
            </a>
          </li>
          <li>
            <a
              className={styles.menuItem}
              href={props.googleHref}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              <Icon name="calendar" size={20} />
              {t("google")}
            </a>
          </li>
        </ul>
      ) : null}
    </div>
  );
  const share = (
    <Button
      variant={props.isOrganizer ? "primary" : "secondary"}
      size={props.isOrganizer ? "lg" : "md"}
      block
      icon="share"
      onClick={() => {
        setShareOpen(true);
      }}
    >
      {props.isOrganizer ? t("tellEveryone") : t("share")}
    </Button>
  );

  return (
    <section ref={cardRef} className={styles.card} aria-labelledby={`${ids}-title`}>
      <p className={styles.eyebrow}>
        <Icon name="check" size={16} />
        {t("eyebrow")}
      </p>
      <h1
        ref={headingRef}
        id={`${ids}-title`}
        className={styles.title}
        tabIndex={-1}
        aria-describedby={`${ids}-date`}
      >
        {t("title")}
      </h1>
      <p id={`${ids}-date`} className={styles.date}>
        {props.dateText}
      </p>
      <p className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon name="nights" size={18} />
          {props.nightsText}
        </span>
        <span className={styles.metaItem}>
          <Icon name="users" size={18} />
          {props.goingText}
        </span>
        <span className={styles.metaItem} data-countdown-text="">
          <Icon name="clock" size={18} />
          {props.countdownText}
        </span>
      </p>
      <div className={styles.actions}>
        {props.isOrganizer ? (
          <>
            {share}
            {calendar}
          </>
        ) : (
          <>
            {calendar}
            {share}
          </>
        )}
      </div>
      {inApp ? (
        <p className={styles.hint}>
          <Icon name="info" size={16} /> {t("inAppHint")}
        </p>
      ) : null}
      <p className="visually-hidden" role="status">
        {downloaded ? t("downloaded") : ""}
      </p>
      <BottomSheet
        open={shareOpen}
        onClose={() => {
          setShareOpen(false);
        }}
        title={t("tellEveryone")}
        closeLabel={tCommon("close")}
      >
        <SharePanel
          link={props.shareLink}
          texts={props.shareTexts}
          defaultLocale={props.defaultLocale}
          tripName={props.tripName}
        />
      </BottomSheet>
    </section>
  );
}
