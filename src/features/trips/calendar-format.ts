import "server-only";
import { getTranslations } from "next-intl/server";
import { buildMonths, weekdayColumns, type CalendarMonth } from "@/lib/calendar";
import { addDays, addMonths, toUtcDate, type IsoDate } from "@/lib/dates";
import { holidaysInRange, type Holiday } from "@/lib/holidays";
import { firstDayOfWeek, isWeekStart } from "@/lib/region";
import type { TripView } from "./load";

export interface FormattedMonth {
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

export interface TripCalendar {
  months: FormattedMonth[];
  raw: CalendarMonth[];
  weekdays: WeekdayHeader[];
  firstDay: 0 | 1;
  /** Long date per grid day, e.g. «Donnerstag, 6. Mai 2027». */
  dateLabels: Record<IsoDate, string>;
  /** Viewer's public holidays in the grid (own region, F-016). */
  holidays: Holiday[];
  /** Holidays of the trip's region when it differs from the own one, else null. */
  tripHolidays: Holiday[] | null;
  /** Short dates of the holidays for the lists, e.g. «6.5.» / «6 May». */
  shortDates: Record<IsoDate, string>;
  ownRegion: string;
  tripRegion: string;
  regionName: (code: string) => string;
  gridStart: IsoDate;
  gridEnd: IsoDate;
}

export function utcFormat(intl: string, options: Intl.DateTimeFormatOptions) {
  const format = new Intl.DateTimeFormat(intl, { ...options, timeZone: "UTC" });
  return (date: IsoDate) => format.format(toUtcDate(date));
}

/**
 * Everything formatted for a trip calendar (W08, W09): the server prepares month headings,
 * weekday names, accessible day names and holiday names in the viewer's language and region, so
 * the client never formats differently during hydration (Intl data of Node and browsers differ).
 */
export async function tripCalendar(view: TripView) {
  const t = await getTranslations("days");
  const tRegions = await getTranslations("regions");
  const { trip, format, session } = view;

  const weekStart = isWeekStart(session.user.weekStart) ? session.user.weekStart : "auto";
  const firstDay = firstDayOfWeek(weekStart, format.country);
  const raw = buildMonths(trip.rangeStart, trip.rangeEnd, firstDay);
  const gridStart = raw[0]?.first ?? trip.rangeStart;
  const gridEnd = addDays(addMonths(raw.at(-1)?.first ?? trip.rangeEnd, 1), -1);

  const monthName = utcFormat(format.intl, { month: "long" });
  const monthHeading = utcFormat(format.intl, { month: "long", year: "numeric" });
  const longDate = utcFormat(format.intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const shortDate = utcFormat(
    format.intl,
    format.locale === "de"
      ? { day: "numeric", month: "numeric" }
      : { day: "numeric", month: "short" },
  );

  const months: FormattedMonth[] = raw.map((month) => ({
    key: month.key,
    heading: monthHeading(month.first),
    holidaysLabel: t("holidaysIn", { month: monthName(month.first) }),
    weeks: month.weeks,
  }));
  // 2027-07-04 is a Sunday – weekday names from a known week.
  const weekdayShort = utcFormat(format.intl, { weekday: "short" });
  const weekdayLong = utcFormat(format.intl, { weekday: "long" });
  const weekdays: WeekdayHeader[] = weekdayColumns(firstDay).map((day) => {
    const sample = addDays("2027-07-04", day);
    return {
      short: weekdayShort(sample),
      long: weekdayLong(sample),
      weekend: day === 0 || day === 6,
    };
  });
  const dateLabels: Record<IsoDate, string> = {};
  for (const month of raw) {
    for (const date of month.weeks.flat()) if (date) dateLabels[date] = longDate(date);
  }

  const ownRegion = format.region;
  const tripRegion = trip.holidaySubdivision ?? trip.holidayCountry;
  const holidays = holidaysInRange(ownRegion, gridStart, gridEnd, format.locale);
  const tripHolidays =
    tripRegion !== ownRegion
      ? holidaysInRange(tripRegion, gridStart, gridEnd, format.locale)
      : null;
  const shortDates: Record<IsoDate, string> = {};
  for (const holiday of [...holidays, ...(tripHolidays ?? [])]) {
    shortDates[holiday.date] = shortDate(holiday.date);
  }
  const regionName = (code: string) =>
    code.includes("-")
      ? tRegions(`subdivisions.${code}` as never)
      : tRegions(`countries.${code}` as never);

  return {
    months,
    raw,
    weekdays,
    firstDay,
    dateLabels,
    holidays,
    tripHolidays,
    shortDates,
    ownRegion,
    tripRegion,
    regionName,
    gridStart,
    gridEnd,
  } satisfies TripCalendar;
}
