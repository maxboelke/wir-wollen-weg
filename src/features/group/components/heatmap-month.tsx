"use client";

import { memo } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import type { FormattedMonth, WeekdayHeader } from "@/features/trips/calendar-format";
import type { IsoDate } from "@/lib/dates";
import type { HeatLevel } from "@/lib/heatmap";
import styles from "./group.module.css";

export interface HeatCellModel {
  date: IsoDate;
  day: number;
  /** "open" = selectable day with data · "past" / "outside" = static text. */
  kind: "open" | "past" | "outside";
  level: HeatLevel;
  /** «4/5» (and «4» for phones from n ≥ 10). */
  count: string;
  countShort: string;
  many: boolean;
  /** ◐ count (0 = none) and ✓ «Alle: Geht». */
  maybe: number;
  allYes: boolean;
  /** Filled segments of the 4-step gauge (≥ 600 px). */
  gauge: number;
  today: boolean;
  weekend: boolean;
  holiday: boolean;
  selected: boolean;
  tabbable: boolean;
  label: string;
  /** Band of the chosen suggestion in the row gap (U-2): rank only on the arrival day. */
  band: boolean;
  bandStart: boolean;
  bandEnd: boolean;
  rank: number | null;
  highlight: boolean;
  highlightStart: boolean;
  highlightEnd: boolean;
}

/**
 * One heatmap day (ux-spec §4.9, design-system §6.1–§6.3): fixed places – date (+ today ring)
 * top left, holiday dog-ear top right, count in the middle, ◐ bottom left, ✓ seal bottom right,
 * gauge ≥ 600 px. Level = surface + pattern; the information is in number and symbols, never in
 * colour alone (1.4.1). Past/outside days are text only (aria-disabled).
 */
export const HeatCell = memo(function HeatCell(cell: HeatCellModel) {
  const tdData = {
    "data-band": cell.band ? "" : undefined,
    "data-band-start": cell.band && cell.bandStart ? "" : undefined,
    "data-band-end": cell.band && cell.bandEnd ? "" : undefined,
    "data-highlight": cell.highlight ? "" : undefined,
    "data-highlight-start": cell.highlight && cell.highlightStart ? "" : undefined,
    "data-highlight-end": cell.highlight && cell.highlightEnd ? "" : undefined,
  };
  const className = cx(styles.day, cell.weekend ? styles.weekendCell : styles.dayCell);
  if (cell.kind !== "open") {
    return (
      <td role="gridcell" aria-disabled="true" className={className} {...tdData}>
        <span
          className={styles.cellStatic}
          data-holiday={cell.holiday ? "" : undefined}
          data-today={cell.today ? "" : undefined}
        >
          <span className={styles.num} aria-hidden="true">
            {cell.day}
          </span>
          <span className="visually-hidden">{cell.label}</span>
        </span>
      </td>
    );
  }
  return (
    <td role="gridcell" className={className} {...tdData}>
      <button
        type="button"
        className={styles.cell}
        data-date={cell.date}
        data-level={cell.level}
        data-holiday={cell.holiday ? "" : undefined}
        data-today={cell.today ? "" : undefined}
        data-selected={cell.selected ? "" : undefined}
        data-many={cell.many ? "" : undefined}
        tabIndex={cell.tabbable ? 0 : -1}
        aria-label={cell.label}
      >
        <span className={styles.num} aria-hidden="true">
          {cell.day}
        </span>
        <span className={styles.count} aria-hidden="true">
          <span className={styles.countFull}>{cell.count}</span>
          <span className={styles.countShort}>{cell.countShort}</span>
        </span>
        {cell.maybe > 0 ? (
          <span className={styles.maybe} aria-hidden="true" data-anim="maybe">
            <Icon name="maybe" size={11} />
            <span className={styles.maybeCount}>{cell.maybe}</span>
          </span>
        ) : null}
        {cell.allYes ? (
          <span className={styles.seal} aria-hidden="true" data-anim="seal">
            <Icon name="check" size={10} />
          </span>
        ) : null}
        {cell.level !== "nodata" ? (
          <span className={styles.gauge} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} data-on={i < cell.gauge ? "" : undefined} />
            ))}
          </span>
        ) : null}
      </button>
      {cell.band && cell.bandStart && cell.rank !== null ? (
        <span className={styles.rank} aria-hidden="true">
          {cell.rank}
        </span>
      ) : null}
    </td>
  );
});

interface HeatMonthProps {
  month: FormattedMonth;
  weekdays: WeekdayHeader[];
  cells: ReadonlyMap<IsoDate, HeatCellModel>;
  helpId: string;
  holidays: { date: IsoDate; text: string }[];
}

/** One month as `<table role="grid">` (ux-spec §7.3) plus its holiday list (U-11). */
export function HeatMonth({ month, weekdays, cells, helpId, holidays }: HeatMonthProps) {
  const headingId = `hm-${month.key}`;
  return (
    <section className={styles.month} aria-labelledby={headingId} id={`hm-month-${month.key}`}>
      <h3 id={headingId} className={styles.monthHeading}>
        {month.heading}
      </h3>
      <table
        role="grid"
        className={styles.grid}
        aria-labelledby={headingId}
        aria-describedby={helpId}
        aria-readonly="true"
      >
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th
                key={weekday.long}
                scope="col"
                abbr={weekday.long}
                className={weekday.weekend ? styles.weekendHead : undefined}
              >
                {weekday.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week, row) => (
            <tr key={`${month.key}-${String(row)}`}>
              {week.map((date, column) => {
                const cell = date ? cells.get(date) : undefined;
                if (!cell) {
                  return (
                    <td
                      key={`pad-${String(column)}`}
                      className={weekdays[column]?.weekend ? styles.weekendPad : undefined}
                      aria-hidden="true"
                    />
                  );
                }
                return <HeatCell key={cell.date} {...cell} />;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {holidays.length > 0 ? (
        <ul className={styles.holidayList} aria-label={month.holidaysLabel}>
          {holidays.map((holiday) => (
            <li key={`${holiday.date}-${holiday.text}`}>
              <span className={styles.earMini} aria-hidden="true" />
              {holiday.text}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
