"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { Stepper } from "@/components/ui/stepper";
import { addDays, type IsoDate } from "@/lib/dates";
import { toParticipant } from "@/lib/heatmap";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  nightsOf,
  optionAvailability,
  periodKey,
  resizeWindow,
  shiftWindow,
  type Period,
} from "@/lib/poll";
import { DISTANCE, DURATION, EASING, animate, enter } from "@/lib/motion";
import { vacationDays } from "@/lib/suggestions";
import { startPollAction, type PollError } from "../actions";
import { PeriodSheet } from "./period-sheet";
import styles from "./poll.module.css";

export interface DraftOption extends Period {
  /** The suggestion span the option may move in («‹ früher / später ›»); custom = itself. */
  span: Period;
}

export interface CreatePollProps {
  publicId: string;
  today: IsoDate;
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  minNights: number;
  labels: Record<IsoDate, string>;
  holidays: IsoDate[];
  people: { key: string; name: string; entries: [IsoDate, "no" | "maybe"][] }[];
  initial: DraftOption[];
  cancelHref: string;
  pollHref: string;
  intl: string;
}

interface Row extends DraftOption {
  key: number;
}

/**
 * W10 A «Abstimmung erstellen» (F-010, F-017; Flow D.1): pre-filled with the top 3
 * suggestions in the wished length (or the ones ticked in «Gruppe»), each option shows who can
 * by the calendar, can move inside its span and change its nights; own periods via the sheet;
 * optional deadline. Validation: 2–6 options, no duplicates (the server checks again).
 * Motion W10-01/-02: date line glides 8 px, removed cards fade, new ones rise (reduced: fade).
 */
export function CreatePoll(props: CreatePollProps) {
  const t = useTranslations("poll");
  const tCard = useTranslations("group.card");
  const router = useRouter();
  const ids = useId();
  const nextKey = useRef(props.initial.length);
  const [rows, setRows] = useState<Row[]>(() =>
    props.initial.map((option, index) => ({ ...option, key: index })),
  );
  const [deadline, setDeadline] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [pending, startTransition] = useTransition();
  const cardRefs = useRef(new Map<number, HTMLElement>());

  const participants = useMemo(
    () => props.people.map((p) => toParticipant(p.key, p.entries)),
    [props.people],
  );
  const names = useMemo(
    () => Object.fromEntries(props.people.map((p) => [p.key, p.name])),
    [props.people],
  );
  const holidays = useMemo(() => new Set(props.holidays), [props.holidays]);
  const label = (date: IsoDate) => props.labels[date] ?? date;
  const rangeLabel = (period: Period) =>
    t("create.range", { start: label(period.start), end: label(period.end) });

  const keys = rows.map(periodKey);
  const duplicates = new Set(keys.filter((key, index) => keys.indexOf(key) !== index));
  const taken = useMemo(() => new Set(rows.map(periodKey)), [rows]);
  const blocker =
    rows.length < MIN_OPTIONS
      ? t("create.minOptions")
      : rows.length > MAX_OPTIONS
        ? t("create.maxOptions")
        : duplicates.size > 0
          ? t("create.duplicate")
          : null;

  function update(key: number, next: Period, direction: 1 | -1 | 0) {
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...next } : row)));
    const index = rows.findIndex((row) => row.key === key);
    setAnnouncement(t("create.shifted", { n: index + 1, range: rangeLabel(next) }));
    // W10-01: the date line glides 8 px in the shift direction and fades in.
    const title = cardRefs.current.get(key)?.querySelector("[data-range]");
    if (direction !== 0) {
      animate(
        title,
        [
          { opacity: 0.2, transform: `translateX(${String(-direction * DISTANCE.sm)}px)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: DURATION.fast, easing: EASING.standard },
      );
    }
  }

  function remove(key: number) {
    const index = rows.findIndex((row) => row.key === key);
    setRows((list) => list.filter((row) => row.key !== key));
    setAnnouncement(t("create.removed"));
    // Focus never gets lost: next card's remove button, else the «own period» button.
    window.requestAnimationFrame(() => {
      const next = rows[index + 1] ?? rows[index - 1];
      const target = next
        ? cardRefs.current.get(next.key)?.querySelector<HTMLElement>("h2")
        : document.getElementById(`${ids}-custom`);
      target?.focus();
    });
  }

  function add(period: Period) {
    const key = nextKey.current++;
    setRows((list) => [...list, { ...period, span: period, key }]);
    setSheetOpen(false);
    setAnnouncement(t("create.added"));
    window.requestAnimationFrame(() => {
      const card = cardRefs.current.get(key);
      // W10-02: the new card rises at the bottom.
      enter(card, { y: DISTANCE.md, duration: DURATION.slow, easing: EASING.emphasized });
      card?.querySelector<HTMLElement>("h2")?.focus();
    });
  }

  function submit() {
    if (blocker || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await startPollAction(
        props.publicId,
        rows.map(({ start, end }) => ({ start, end })),
        deadline || null,
      );
      if (result.ok) {
        router.replace(`${props.pollHref}?started=1`);
        return;
      }
      setError(errorText(result.error));
    });
  }

  function errorText(error: PollError): string {
    switch (error) {
      case "tooShort":
        return t("create.errors.tooShort", { min: props.minNights });
      case "count":
      case "duplicate":
      case "outsideRange":
      case "past":
      case "tooLong":
      case "phase":
      case "full":
        return t(`create.errors.${error}`);
      case "notAllowed":
      case "signedOut":
        return t("create.errors.invalid");
      default:
        return t("create.errors.invalid");
    }
  }

  const in3 = addDays(props.today, 3);
  const in7 = addDays(props.today, 7);
  const deadlineText = deadline
    ? new Intl.DateTimeFormat(props.intl, {
        weekday: "short",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(`${deadline}T00:00:00Z`))
    : null;

  return (
    <>
      <form
        className={styles.page}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={styles.head}>
          <h1>{t("create.title")}</h1>
          <p className={styles.lead}>{t("create.lead")}</p>
        </div>

        {rows.length === 0 ? (
          <p className={styles.muted}>
            {props.people.length === 0 ? t("create.noSuggestions") : t("create.empty")}
          </p>
        ) : (
          <ol className={styles.cards} aria-label={t("create.title")}>
            {rows.map((row, index) => {
              const availability = optionAvailability(row, participants);
              const nights = nightsOf(row);
              const canShift = nightsOf(row.span) > nights;
              const earlier = shiftWindow(row, row.span, -1);
              const later = shiftWindow(row, row.span, 1);
              const cannot = availability.cannot.map((id) => names[id] ?? "?");
              const titleId = `${ids}-opt-${String(row.key)}`;
              return (
                <li
                  key={row.key}
                  ref={(element) => {
                    if (element) cardRefs.current.set(row.key, element);
                    else cardRefs.current.delete(row.key);
                  }}
                  className={styles.card}
                  data-option=""
                  aria-labelledby={titleId}
                >
                  <h2 className={styles.optionLabel} tabIndex={-1} id={titleId}>
                    {t("create.option", { n: index + 1 })}
                  </h2>
                  <p className={styles.cardTitle} data-range="" aria-live="off">
                    <b>{rangeLabel(row)}</b>
                  </p>
                  <p className={styles.meta}>
                    <span className={styles.metaItem}>
                      <Icon name="nights" size={16} />
                      {t("create.nightsCount", { count: nights })}
                    </span>
                    <span className={styles.metaItem}>
                      <Icon name="sun" size={16} />
                      {t("create.vacation", {
                        count: vacationDays(row.start, row.end, holidays),
                      })}
                    </span>
                  </p>
                  {props.people.length === 0 ? (
                    <p className={styles.muted}>
                      {t("byCalendar", { text: t("nobodySubmitted") })}
                    </p>
                  ) : cannot.length === 0 ? (
                    <p className={styles.availability}>
                      {tCard("can", { count: availability.can.length })}
                      {availability.maybeDays > 0
                        ? ` · ${t("create.maybe", { count: availability.maybeDays })}`
                        : ""}
                    </p>
                  ) : (
                    <p className={styles.warn}>
                      <Icon name="warning" size={18} />
                      {t("create.warnCannot", { names: cannot.join(", ") })}
                    </p>
                  )}
                  {duplicates.has(periodKey(row)) ? (
                    <p className={styles.warn} role="alert">
                      <Icon name="warning" size={18} />
                      {t("create.duplicate")}
                    </p>
                  ) : null}
                  <div className={styles.controls}>
                    {canShift ? (
                      <div className={styles.shift}>
                        <Button
                          variant="tool"
                          size="sm"
                          icon="chevron-left"
                          aria-disabled={!earlier || undefined}
                          aria-describedby={titleId}
                          onClick={() => {
                            if (earlier) update(row.key, earlier, -1);
                          }}
                        >
                          {t("create.earlier")}
                        </Button>
                        <Button
                          variant="tool"
                          size="sm"
                          iconEnd="chevron-right"
                          aria-disabled={!later || undefined}
                          aria-describedby={titleId}
                          onClick={() => {
                            if (later) update(row.key, later, 1);
                          }}
                        >
                          {t("create.later")}
                        </Button>
                      </div>
                    ) : null}
                    <div>
                      <Stepper
                        id={`${titleId}-nights`}
                        name={`nights-${String(row.key)}`}
                        label={t("create.nights")}
                        value={String(nights)}
                        min={Math.max(1, props.minNights)}
                        max={Math.max(nights, nightsOf({ start: row.start, end: props.rangeEnd }))}
                        unit={t("create.nightsUnit", { count: nights })}
                        decreaseLabel={t("create.fewer")}
                        increaseLabel={t("create.more")}
                        onChange={(value) => {
                          const next = resizeWindow(
                            row,
                            { start: row.start, end: props.rangeEnd },
                            Number(value),
                          );
                          if (next && Number(value) >= props.minNights) update(row.key, next, 0);
                        }}
                      />
                    </div>
                    <Button
                      variant="dangerQuiet"
                      size="sm"
                      icon="trash"
                      aria-label={t("create.removeLabel", { n: index + 1 })}
                      onClick={() => {
                        remove(row.key);
                      }}
                    >
                      {t("create.remove")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div>
          <Button
            id={`${ids}-custom`}
            variant="secondary"
            size="md"
            icon="plus"
            aria-disabled={rows.length >= MAX_OPTIONS || undefined}
            onClick={() => {
              if (rows.length < MAX_OPTIONS) setSheetOpen(true);
            }}
          >
            {t("create.custom")}
          </Button>
          {rows.length >= MAX_OPTIONS ? (
            <p className={styles.muted}>{t("create.maxOptions")}</p>
          ) : null}
        </div>

        <fieldset className={styles.fieldset}>
          <legend>{t("create.deadline")}</legend>
          <input
            className={styles.dateInput}
            type="date"
            aria-label={t("create.deadline")}
            value={deadline}
            min={props.today}
            onChange={(event) => {
              setDeadline(event.target.value);
            }}
          />
          <div className={styles.quick}>
            <Button
              variant="secondary"
              size="sm"
              aria-pressed={deadline === in3}
              onClick={() => {
                setDeadline(in3);
              }}
            >
              {t("create.deadlineIn3")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-pressed={deadline === in7}
              onClick={() => {
                setDeadline(in7);
              }}
            >
              {t("create.deadlineIn7")}
            </Button>
            {deadline ? (
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  setDeadline("");
                }}
              >
                {t("create.deadlineClear")}
              </Button>
            ) : null}
          </div>
          {deadlineText ? (
            <p className={styles.muted}>{t("create.deadlineShown", { date: deadlineText })}</p>
          ) : null}
        </fieldset>

        {error ? (
          <Banner tone="danger" role="alert">
            {error}
          </Banner>
        ) : null}

        <div className={styles.sticky}>
          <Button
            type="submit"
            block
            icon="vote"
            loading={pending}
            loadingLabel={t("create.busy")}
            aria-disabled={blocker !== null || undefined}
            aria-describedby={blocker ? `${ids}-blocker` : undefined}
          >
            {t("create.submit")}
          </Button>
          {blocker ? (
            <p id={`${ids}-blocker`} className={styles.stickyNote}>
              {blocker}
            </p>
          ) : null}
          <ButtonLink href={props.cancelHref} variant="text" size="sm">
            {t("create.cancel")}
          </ButtonLink>
        </div>

        <p className="visually-hidden" role="status">
          {announcement}
        </p>
      </form>

      <PeriodSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
        }}
        title={t("period.title")}
        rangeStart={props.rangeStart}
        rangeEnd={props.rangeEnd}
        minNights={props.minNights}
        today={props.today}
        labels={props.labels}
        participants={participants}
        names={names}
        taken={taken}
        onAdd={add}
      />
    </>
  );
}
