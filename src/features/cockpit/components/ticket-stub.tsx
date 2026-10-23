"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { DURATION, enter } from "@/lib/motion";
import type { TicketView } from "../types";
import { useCockpit } from "./cockpit-provider";
import styles from "./ticket.module.css";

/** Crew in the ticket stub (W16 v2.2): 3 avatars + «+3» + «6 dabei · 7 Nächte» → «Wer ist dabei?». */
export function CrewButton({ crew }: { crew: TicketView["crew"] }) {
  const cockpit = useCockpit();
  return (
    <button
      type="button"
      className={styles.crew}
      aria-haspopup="dialog"
      onClick={() => {
        cockpit?.open({ kind: "members" });
      }}
    >
      <span className={styles.stack} aria-hidden="true">
        {crew.avatars.map((person) => (
          <Avatar key={person.id} id={person.id} name={person.name} size="md" />
        ))}
        {crew.more > 0 ? <span className={styles.more}>{`+${String(crew.more)}`}</span> : null}
      </span>
      <span>{crew.text}</span>
    </button>
  );
}

/** «Kalender» (outline on Indigo, D-36) → ICS file or Google Calendar (as W11). */
export function CalendarButton({ icsHref, googleHref }: { icsHref: string; googleHref: string }) {
  const t = useTranslations("route");
  const tResult = useTranslations("poll.result");
  const ids = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    enter(menuRef.current, { scale: 0.96, duration: DURATION.fast });
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        (menuRef.current?.contains(event.target as Node) ||
          buttonRef.current?.contains(event.target as Node))
      ) {
        return;
      }
      setOpen(false);
      if (event instanceof KeyboardEvent) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <div className={styles.actions}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.headButton}
        aria-expanded={open}
        aria-controls={`${ids}-menu`}
        aria-label={tResult("addToCalendar")}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        <Icon name="calendar" size={20} />
        <span>{t("calendar")}</span>
      </button>
      {open ? (
        <ul id={`${ids}-menu`} ref={menuRef} className={styles.menuList}>
          <li>
            <a
              className={styles.menuItem}
              href={icsHref}
              download
              onClick={() => {
                setOpen(false);
              }}
            >
              <Icon name="calendar-download" size={20} />
              {tResult("icsFile")}
            </a>
          </li>
          <li>
            <a
              className={styles.menuItem}
              href={googleHref}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Icon name="calendar" size={20} />
              {tResult("google")}
            </a>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Cost head buttons (W16 v2.15): Unterwegs «+ Ausgabe» → new expense (back to the cockpit after
 * saving), Danach «Ausgleichen» → settle up. Outline on Indigo like «Kalender» (never primary).
 */
export function CostHeadButtons({
  addExpense,
  settle,
}: {
  addExpense: string | null;
  settle: string | null;
}) {
  const t = useTranslations("route");
  // Back from «Ausgabe speichern» (W19 D.5.6): focus on «+ Ausgabe», then drop the parameter.
  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("focus") !== "add-expense") return;
    document.querySelector<HTMLElement>('[data-head-action="add-expense"]')?.focus();
    url.searchParams.delete("focus");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  if (!addExpense && !settle) return null;
  return (
    <div className={styles.actions}>
      {addExpense ? (
        <Link
          className={styles.headButton}
          href={addExpense}
          aria-label={t("addExpenseName")}
          data-head-action="add-expense"
        >
          <Icon name="plus" size={20} />
          <span>{t("addExpense")}</span>
        </Link>
      ) : null}
      {settle ? (
        <Link className={styles.headButton} href={settle} data-head-action="settle">
          <Icon name="wallet" size={20} />
          <span>{t("settle")}</span>
        </Link>
      ) : null}
    </div>
  );
}
