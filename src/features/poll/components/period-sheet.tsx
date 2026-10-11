"use client";

import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { addDays, type IsoDate } from "@/lib/dates";
import type { Participant } from "@/lib/heatmap";
import { checkOption, nightsOf, optionAvailability, type Period } from "@/lib/poll";
import styles from "./poll.module.css";

export interface PeriodSheetProps {
  open: boolean;
  onClose: () => void;
  /** Sheet title: «Eigener Zeitraum» (create) or «Option hinzufügen» (after the start). */
  title: string;
  /** Extra note, e.g. «Bestehende Optionen bleiben unverändert …» (Flow D.1). */
  note?: string | undefined;
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  minNights: number;
  today: IsoDate;
  labels: Record<IsoDate, string>;
  participants: readonly Participant[];
  names: Readonly<Record<string, string>>;
  /** Keys «start/end» already in the list – duplicates are refused. */
  taken: ReadonlySet<string>;
  busy?: boolean | undefined;
  /** Server error to show (e.g. after «Option hinzufügen»). */
  error?: string | null | undefined;
  onAdd: (period: Period) => void;
}

/**
 * «Eigener Zeitraum» (Flow D.1 #2): arrival and departure as native date fields (ux-spec §4.7 –
 * robust, accessible, system picker), limited to the search range; live summary «Fr., 21. Mai –
 * Di., 25. Mai · 4 Nächte · ⚠ Lena, Paul können nicht» (allowed, F-010).
 */
export function PeriodSheet(props: PeriodSheetProps) {
  const t = useTranslations("poll");
  const tCommon = useTranslations("common");
  const ids = useId();
  const earliest = props.rangeStart > props.today ? props.rangeStart : props.today;
  const defaultEnd = addDays(earliest, Math.max(1, props.minNights));
  const [start, setStart] = useState<IsoDate>(earliest);
  const [end, setEnd] = useState<IsoDate>(
    defaultEnd > props.rangeEnd ? props.rangeEnd : defaultEnd,
  );
  const [touched, setTouched] = useState(false);
  const period = { start, end };
  const problem = useMemo(
    () =>
      checkOption(period, {
        rangeStart: props.rangeStart,
        rangeEnd: props.rangeEnd,
        minNights: props.minNights,
        today: props.today,
      }) ?? (props.taken.has(`${start}/${end}`) ? "duplicate" : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start, end, props.rangeStart, props.rangeEnd, props.minNights, props.today, props.taken],
  );
  const availability = problem ? null : optionAvailability(period, props.participants);
  const label = (date: IsoDate) => props.labels[date] ?? date;
  const errorText =
    problem === null
      ? null
      : problem === "tooShort"
        ? t("create.errors.tooShort", { min: props.minNights })
        : t(`create.errors.${problem}`);

  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      closeLabel={tCommon("close")}
    >
      <form
        className={styles.sheet}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (problem || props.busy) return;
          props.onAdd(period);
        }}
      >
        {props.note ? <p className={styles.muted}>{props.note}</p> : null}
        <p className={styles.muted} id={`${ids}-hint`}>
          {t("period.hint", { start: label(props.rangeStart), end: label(props.rangeEnd) })}
        </p>
        <div className={styles.dates}>
          <div className={styles.field}>
            <label htmlFor={`${ids}-start`}>{t("period.start")}</label>
            <input
              id={`${ids}-start`}
              className={styles.dateInput}
              type="date"
              value={start}
              min={earliest}
              max={addDays(props.rangeEnd, -1)}
              aria-describedby={`${ids}-hint`}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                setStart(value);
                // Keep the length when the arrival moves past the departure.
                if (value >= end) {
                  const next = addDays(value, Math.max(1, props.minNights));
                  setEnd(next > props.rangeEnd ? props.rangeEnd : next);
                }
              }}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${ids}-end`}>{t("period.end")}</label>
            <input
              id={`${ids}-end`}
              className={styles.dateInput}
              type="date"
              value={end}
              min={addDays(start, 1)}
              max={props.rangeEnd}
              aria-describedby={`${ids}-hint`}
              aria-invalid={touched && problem !== null ? true : undefined}
              onChange={(event) => {
                if (event.target.value) setEnd(event.target.value);
              }}
            />
          </div>
        </div>
        <div role="status" className={styles.sheet}>
          {problem === null ? (
            <>
              <p className={styles.availability}>
                {t("period.summary", {
                  range: t("create.range", { start: label(start), end: label(end) }),
                  nights: nightsOf(period),
                })}
              </p>
              {availability && availability.cannot.length > 0 ? (
                <p className={styles.warn}>
                  <Icon name="warning" size={18} />
                  {t("period.cannot", {
                    names: availability.cannot.map((id) => props.names[id] ?? "?").join(", "),
                  })}
                </p>
              ) : props.participants.length > 0 ? (
                <p className={styles.muted}>{t("period.everyone")}</p>
              ) : null}
            </>
          ) : touched || problem === "duplicate" ? (
            <p className={styles.warn}>
              <Icon name="warning" size={18} />
              {errorText}
            </p>
          ) : null}
        </div>
        {props.error ? (
          <Banner tone="danger" role="alert">
            {props.error}
          </Banner>
        ) : null}
        <div className={styles.sheetActions}>
          <Button variant="secondary" size="md" onClick={props.onClose}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" size="md" icon="plus" loading={props.busy}>
            {t("period.add")}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
