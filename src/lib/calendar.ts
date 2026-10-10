import { addDays, addMonths, diffDays, toUtcDate, type IsoDate } from "./dates";

/**
 * Month grid of a trip's search range (F-005, F-016, F-046 week start; ux-spec §7.3).
 * Pure – shared by the «Meine Tage» editor, the heatmap later and the tests.
 */

/** 0 = Sunday … 6 = Saturday (UTC calendar day). */
export function weekdayOf(date: IsoDate): number {
  return toUtcDate(date).getUTCDay();
}

/** Weekend = Saturday + Sunday in every supported region (ux-spec §9). */
export function isWeekend(date: IsoDate): boolean {
  const day = weekdayOf(date);
  return day === 0 || day === 6;
}

/** Monday–Friday, independent of the week start (F-046: «Mo–Fr» stays correct). */
export function isWorkday(date: IsoDate): boolean {
  return !isWeekend(date);
}

/** Column order of the weekdays, e.g. [1,2,3,4,5,6,0] for a Monday start. */
export function weekdayColumns(firstDay: 0 | 1): number[] {
  return Array.from({ length: 7 }, (_, i) => (firstDay + i) % 7);
}

/** Every day from `start` to `end` (inclusive); empty when end < start. */
export function datesBetween(start: IsoDate, end: IsoDate): IsoDate[] {
  const days = diffDays(start, end);
  if (days < 0) return [];
  return Array.from({ length: days + 1 }, (_, i) => addDays(start, i));
}

/** Range between two days in date order – like a text selection (Flow B.2). */
export function orderedRange(a: IsoDate, b: IsoDate): IsoDate[] {
  return a <= b ? datesBetween(a, b) : datesBetween(b, a);
}

export interface CalendarMonth {
  /** "2027-05" – stable key / id fragment. */
  key: string;
  year: number;
  /** 1–12 */
  month: number;
  /** First day of the month (for formatting the heading). */
  first: IsoDate;
  /** Rows of 7 cells in column order; `null` = padding outside this month. */
  weeks: (IsoDate | null)[][];
}

function monthStart(date: IsoDate): IsoDate {
  return `${date.slice(0, 7)}-01`;
}

/**
 * All months touched by the search range, each as full weeks starting on `firstDay`. Days of
 * the month outside the range stay in the grid (shown greyed, not selectable, Flow B.1).
 */
export function buildMonths(start: IsoDate, end: IsoDate, firstDay: 0 | 1): CalendarMonth[] {
  if (end < start) return [];
  const months: CalendarMonth[] = [];
  for (let first = monthStart(start); first <= end; first = addMonths(first, 1)) {
    const last = addDays(addMonths(first, 1), -1);
    const lead = (weekdayOf(first) - firstDay + 7) % 7;
    const cells: (IsoDate | null)[] = [
      ...Array.from({ length: lead }, () => null),
      ...datesBetween(first, last),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (IsoDate | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    months.push({
      key: first.slice(0, 7),
      year: Number(first.slice(0, 4)),
      month: Number(first.slice(5, 7)),
      first,
      weeks,
    });
  }
  return months;
}

/** Days that can be marked: inside the search range and not in the past (Flow B.1). */
export interface EditableWindow {
  first: IsoDate;
  last: IsoDate;
}

export function editableWindow(
  rangeStart: IsoDate,
  rangeEnd: IsoDate,
  today: IsoDate,
): EditableWindow | null {
  const first = rangeStart > today ? rangeStart : today;
  return first <= rangeEnd ? { first, last: rangeEnd } : null;
}

export function isInWindow(date: IsoDate, window: EditableWindow | null): boolean {
  return window !== null && date >= window.first && date <= window.last;
}

export type CalendarKey =
  "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End" | "PageUp" | "PageDown";

/**
 * Keyboard movement in the grid (ux-spec §7.3): ←/→ day, ↑/↓ week, Home/End start/end of
 * the week (by week start), Page ↑/↓ same day in the previous/next month, Ctrl/Cmd+Home/End
 * first/last selectable day. Targets outside the editable window are clamped to its edge.
 */
export function moveInCalendar(
  current: IsoDate,
  key: CalendarKey,
  window: EditableWindow,
  firstDay: 0 | 1,
  modifier = false,
): IsoDate {
  let target: IsoDate;
  switch (key) {
    case "ArrowLeft":
      target = addDays(current, -1);
      break;
    case "ArrowRight":
      target = addDays(current, 1);
      break;
    case "ArrowUp":
      target = addDays(current, -7);
      break;
    case "ArrowDown":
      target = addDays(current, 7);
      break;
    case "Home":
      target = modifier
        ? window.first
        : addDays(current, -((weekdayOf(current) - firstDay + 7) % 7));
      break;
    case "End":
      target = modifier
        ? window.last
        : addDays(current, 6 - ((weekdayOf(current) - firstDay + 7) % 7));
      break;
    case "PageUp":
      target = addMonths(current, -1);
      break;
    case "PageDown":
      target = addMonths(current, 1);
      break;
  }
  if (target < window.first) return window.first;
  if (target > window.last) return window.last;
  return target;
}
