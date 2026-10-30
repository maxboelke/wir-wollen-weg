"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { clearAppCaches } from "@/components/service-worker";
import { signOut } from "@/features/account/actions";
import { setLanguage } from "@/features/locale/actions";
import type { Locale } from "@/i18n/config";
import { Feedback } from "@/features/beta/components/feedback";
import { installPath } from "@/features/beta/paths";
import type { FeedbackConfig } from "@/lib/beta-config";
import { isStandalone } from "@/lib/use-standalone";
import { DURATION, EASING, enter, SCALE } from "@/lib/motion";
import styles from "./account-menu.module.css";

interface AccountMenuProps {
  userId: string;
  name: string;
  locale: Locale;
  helpHref: string;
  /** Friends beta: «Feedback geben» (W23 D.2) – null/absent = no entry. */
  feedback?: FeedbackConfig | null | undefined;
}

/**
 * Avatar menu for signed-in users (sitemap §5): Meine Reisen · Konto · Sprache · Hilfe ·
 * Abmelden – always in this order (SC 3.2.6). Disclosure pattern (button + list of links),
 * Esc and outside click close it, focus returns to the button. Tabbing out of button and
 * panel closes it too, without moving focus (R-031, WCAG 2.4.11 – the panel must not cover
 * the newly focused element).
 */
export function AccountMenu({ userId, name, locale, helpHref, feedback }: AccountMenuProps) {
  const t = useTranslations();
  const id = useId();
  const [open, setOpen] = useState(false);
  // «App installieren» (W23 B.5): touch devices outside the installed app only.
  const [installable, setInstallable] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- media queries only readable after mounting
    setInstallable(!isStandalone() && window.matchMedia("(pointer: coarse)").matches);
  }, []);
  const hasFeedback = Boolean(feedback && (feedback.whatsapp || feedback.email));
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const other: Locale = locale === "de" ? "en" : "de";

  useEffect(() => {
    if (!open) return;
    // W11-05 pattern: menu scales in from the button; reduced = fade.
    enter(panelRef.current, { scale: SCALE.enter, duration: DURATION.fast, easing: EASING.enter });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      className={styles.menu}
      onBlur={(event) => {
        // Only when focus moves to another element outside (null = window/tab switch or a
        // click on nothing focusable – the pointer handler covers clicks outside).
        const next = event.relatedTarget;
        if (open && next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={t("menu.open", { name })}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <Avatar id={userId} name={name} size="md" />
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </button>
      <div ref={panelRef} id={`${id}-panel`} className={styles.panel} hidden={!open}>
        <ul className={styles.list}>
          <li>
            <Link className={styles.item} href="/trips">
              <Icon name="plane" size={20} />
              <span>{t("menu.myTrips")}</span>
            </Link>
          </li>
          <li>
            <Link className={styles.item} href="/account">
              <Icon name="user" size={20} />
              <span>{t("menu.account")}</span>
            </Link>
          </li>
          <li>
            <form action={setLanguage}>
              <input type="hidden" name="locale" value={other} />
              <button type="submit" className={styles.item} lang={other}>
                <Icon name="language" size={20} />
                <span>{t("common.switchLanguage")}</span>
              </button>
            </form>
          </li>
          {installable ? (
            <li>
              <Link className={styles.item} href={installPath("/trips")}>
                <Icon name="plus" size={20} />
                <span>{t("menu.install")}</span>
              </Link>
            </li>
          ) : null}
          {hasFeedback ? (
            <li>
              <button
                type="button"
                className={styles.item}
                onClick={() => {
                  setOpen(false);
                  setFeedbackOpen(true);
                }}
              >
                <Icon name="comment" size={20} />
                <span>{t("menu.feedback")}</span>
              </button>
            </li>
          ) : null}
          <li>
            <a className={styles.item} href={helpHref}>
              <Icon name="help" size={20} />
              <span>{t("menu.help")}</span>
            </a>
          </li>
          <li>
            <form
              action={signOut}
              onSubmit={() => {
                // No personal data is cached, but sign-out leaves nothing behind (§0.12.6 Nr. 6).
                void clearAppCaches().catch(() => undefined);
              }}
            >
              <button type="submit" className={styles.item}>
                <Icon name="logout" size={20} />
                <span>{t("menu.signOut")}</span>
              </button>
            </form>
          </li>
        </ul>
      </div>
      {hasFeedback && feedback ? (
        <Feedback
          config={feedback}
          open={feedbackOpen}
          onClose={() => {
            setFeedbackOpen(false);
            buttonRef.current?.focus();
          }}
        />
      ) : null}
    </div>
  );
}
