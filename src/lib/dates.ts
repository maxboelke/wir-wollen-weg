/**
 * Calendar-day helpers on ISO dates ("2027-05-01"). All trip days are calendar days
 * without time (ux-spec §8 "Zeit & Datum"); computing in UTC avoids DST and time-zone
 * shifts. Pure – shared by server, client and tests.
 */

export type IsoDate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** True for a real calendar date in ISO form (rejects "2027-02-30"). */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string") return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function toUtcDate(value: IsoDate): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function fromUtcDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: IsoDate, days: number): IsoDate {
  return fromUtcDate(new Date(toUtcDate(value).getTime() + days * DAY_MS));
}

/**
 * Adds calendar months; the day is clamped to the end of the target month
 * (31 Jan + 1 month = 28/29 Feb).
 */
export function addMonths(value: IsoDate, months: number): IsoDate {
  const date = toUtcDate(value);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return fromUtcDate(new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay))));
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / DAY_MS);
}

/** Today as ISO date in the local time zone of the runtime (browser: the viewer's). */
export function todayIso(now: Date = new Date()): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Quick picks for the search range (W05: «Nächste 3 Monate · 6 Monate · Sommer 2027»). */
export type RangePreset = "next3" | "next6" | "summer";

/** Summer = 1 June – 31 August: this year's, or next year's once June has begun. */
export function summerYear(today: IsoDate): number {
  const year = Number(today.slice(0, 4));
  return today >= `${String(year)}-06-01` ? year + 1 : year;
}

export function presetRange(preset: RangePreset, today: IsoDate): { start: IsoDate; end: IsoDate } {
  switch (preset) {
    case "next3":
      return { start: today, end: addDays(addMonths(today, 3), -1) };
    case "next6":
      return { start: today, end: addDays(addMonths(today, 6), -1) };
    case "summer": {
      const year = String(summerYear(today));
      return { start: `${year}-06-01`, end: `${year}-08-31` };
    }
  }
}

/**
 * Date range in the viewer's format, en dash between (ux-spec §8): «1. Mai – 30. Juni 2027»,
 * same month short «5.–10. Mai». Year only when needed (not this year or crossing a year).
 */
export function formatDateRange(
  start: IsoDate,
  end: IsoDate,
  formattingLocale: string,
  options: { weekday?: boolean; today?: IsoDate } = {},
): string {
  const thisYear = (options.today ?? todayIso()).slice(0, 4);
  const showYear =
    start.slice(0, 4) !== thisYear ||
    end.slice(0, 4) !== thisYear ||
    start.slice(0, 4) !== end.slice(0, 4);
  const format = new Intl.DateTimeFormat(formattingLocale, {
    day: "numeric",
    month: "long",
    ...(showYear ? { year: "numeric" } : {}),
    ...(options.weekday ? { weekday: "short" } : {}),
    timeZone: "UTC",
  });
  return format.formatRange(toUtcDate(start), toUtcDate(end));
}

/** One date in the viewer's format, e.g. «Sa., 1. Mai 2027» / «Sat 1 May 2027». */
export function formatDate(
  value: IsoDate,
  formattingLocale: string,
  options: { weekday?: boolean; year?: boolean } = { weekday: true, year: true },
): string {
  return new Intl.DateTimeFormat(formattingLocale, {
    day: "numeric",
    month: "long",
    ...(options.year === false ? {} : { year: "numeric" }),
    ...(options.weekday === false ? {} : { weekday: "short" }),
    timeZone: "UTC",
  }).format(toUtcDate(value));
}
