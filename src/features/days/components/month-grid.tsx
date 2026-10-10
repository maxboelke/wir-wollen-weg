"use client";

import { memo } from "react";
import { Icon } from "@/components/ui/icon";
import type { DayState } from "@/lib/availability";
import type { IsoDate } from "@/lib/dates";
import styles from "./days.module.css";

export interface DayMonth {
  key: string;
  /** «Mai 2027» */
  heading: string;
  /** Accessible name of the holiday list: «Feiertage im Mai». */
  holidaysLabel: string;
  weeks: (IsoDate | null)[][];
}

export interface WeekdayHeader {
  short: string;
  long: string;
  weekend: boolean;
}

export interface CellModel {
  date: IsoDate;
  day: number;
  /** Shown state (incl. a running preview). */
  state: DayState;
  editable: boolean;
  /** In the search range (past days stay visible with their state). */
  inRange: boolean;
  today: boolean;
  weekend: boolean;
  holiday: boolean;
  /** Preview outline of the drag / selection with open ends at row breaks (W08). */
  preview: boolean;
  edgeStart: boolean;
  edgeEnd: boolean;
  anchor: boolean;
  tabbable: boolean;
  label: string;
}

/**
 * One calendar day (ux-spec §7.3, design-system §6.4): a button for selectable days, plain
 * text for past/outside days. Date top left (+ «heute» ring), dog-ear for holidays, the state
 * as surface + pattern + symbol plaque (never colour alone). Memoised – while dragging only
 * the cells whose props change re-render.
 */
export const DayCell = memo(function DayCell(cell: CellModel) {
  const content = (
    <>
      <span className={styles.num} aria-hidden="true">
        {cell.day}
      </span>
      <span className={styles.plaque} aria-hidden="true">
        {cell.state === "no" ? <Icon name="cross" size={13} /> : null}
        {cell.state === "maybe" ? <Icon name="maybe" size={13} /> : null}
      </span>
    </>
  );
  const data = {
    "data-state": cell.inRange ? cell.state : undefined,
    "data-holiday": cell.holiday ? "" : undefined,
    "data-today": cell.today ? "" : undefined,
    "data-preview": cell.preview ? "" : undefined,
    "data-edge-start": cell.preview && cell.edgeStart ? "" : undefined,
    "data-edge-end": cell.preview && cell.edgeEnd ? "" : undefined,
    "data-anchor": cell.anchor ? "" : undefined,
  };
  return (
    <td role="gridcell" className={cell.weekend ? styles.weekendCell : styles.dayCell}>
      {cell.editable ? (
        <button
          type="button"
          className={styles.cell}
          data-date={cell.date}
          tabIndex={cell.tabbable ? 0 : -1}
          aria-label={cell.label}
          {...data}
        >
          {content}
        </button>
      ) : (
        <span className={styles.cellStatic} aria-disabled="true" data-out="" {...data}>
          {content}
          <span className="visually-hidden">{cell.label}</span>
        </span>
      )}
    </td>
  );
});

interface MonthGridProps {
  month: DayMonth;
  weekdays: WeekdayHeader[];
  cells: Map<IsoDate, CellModel>;
  helpId: string;
  holidays: { date: IsoDate; text: string }[];
  readOnly: boolean;
}

/** One month as `<table role="grid">` (ux-spec §7.3) plus its holiday list (U-11). */
export function MonthGrid({ month, weekdays, cells, helpId, holidays, readOnly }: MonthGridProps) {
  const headingId = `m-${month.key}`;
  return (
    <section className={styles.month} aria-labelledby={headingId} id={`month-${month.key}`}>
      <h2 id={headingId} className={styles.monthHeading}>
        {month.heading}
      </h2>
      <table
        role="grid"
        className={styles.grid}
        aria-labelledby={headingId}
        aria-describedby={helpId}
        aria-readonly={readOnly ? "true" : undefined}
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
                return <DayCell key={cell.date} {...cell} />;
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
