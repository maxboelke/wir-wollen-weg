"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { signOut } from "@/features/account/actions";
import { setLanguage } from "@/features/locale/actions";
import type { Locale } from "@/i18n/config";
import { DURATION, EASING, enter, SCALE } from "@/lib/motion";
import styles from "./account-menu.module.css";

interface AccountMenuProps {
  userId: string;
  name: string;
  locale: Locale;
  helpHref: string;
}

/**
 * Avatar menu for signed-in users (sitemap §5): Meine Reisen · Konto · Sprache · Hilfe ·
 * Abmelden – always in this order (SC 3.2.6). Disclosure pattern (button + list of links),
 * Esc and outside click close it, focus returns to the button.
 */
export function AccountMenu({ userId, name, locale, helpHref }: AccountMenuProps) {
  const t = useTranslations();
  const id = useId();
  const [open, setOpen] = useState(false);
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
    <div className={styles.menu}>
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
          <li>
            <a className={styles.item} href={helpHref}>
              <Icon name="help" size={20} />
              <span>{t("menu.help")}</span>
            </a>
          </li>
          <li>
            <form action={signOut}>
              <button type="submit" className={styles.item}>
                <Icon name="logout" size={20} />
                <span>{t("menu.signOut")}</span>
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
