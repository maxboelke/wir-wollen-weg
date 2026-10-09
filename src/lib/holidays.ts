import Holidays from "date-holidays";
import type { Locale } from "@/i18n/config";
import type { IsoDate } from "./dates";
import { COUNTRIES, SUBDIVISIONS, isCountry, type Country } from "./region";

/**
 * Public holidays (F-016) from the maintained open-source library `date-holidays`
 * (tech-stack.md: ISC code, CC-BY-3.0 data – credit on the licences page before M2).
 * Released regions = the account regions (src/lib/region.ts: DE incl. 16 states, AT, CH incl.
 * cantons, GB nations, US federal); more can be added there without touching this file.
 * Only type "public" counts – observances (Valentine's Day), bank-only days (Christmas Eve in
 * DE) and school days are not days off. Names come in the viewer's language where the library
 * has them (DE/EN for all released regions). Used on the server only (bundle size).
 */

export interface Holiday {
  date: IsoDate;
  name: string;
}

/** «DE-BY» → ["DE", "BY"], «DE» → ["DE"]; unknown or unreleased regions → null. */
export function parseRegion(region: string | null | undefined): [Country, string?] | null {
  if (!region) return null;
  const [country, ...rest] = region.split("-");
  if (!isCountry(country)) return null;
  if (rest.length === 0) return [country];
  if (!SUBDIVISIONS[country].includes(region)) return null;
  return [country, rest.join("-")];
}

const instances = new Map<string, Holidays>();

function calendarFor(country: Country, state: string | undefined): Holidays {
  const key = `${country}-${state ?? ""}`;
  let calendar = instances.get(key);
  if (!calendar) {
    calendar = state ? new Holidays(country, state) : new Holidays(country);
    instances.set(key, calendar);
  }
  return calendar;
}

/**
 * Public holidays of `region` between `start` and `end` (inclusive), sorted by date. Several
 * holidays on one day are joined («Ostersonntag / Pfingstsonntag» cannot happen, but e.g. US
 * substitute days can coincide with observances – only public ones are kept anyway).
 */
export function holidaysInRange(
  region: string | null | undefined,
  start: IsoDate,
  end: IsoDate,
  locale: Locale,
): Holiday[] {
  const parsed = parseRegion(region);
  if (!parsed || end < start) return [];
  const [country, state] = parsed;
  const calendar = calendarFor(country, state);
  const byDate = new Map<IsoDate, string[]>();
  for (let year = Number(start.slice(0, 4)); year <= Number(end.slice(0, 4)); year++) {
    for (const holiday of calendar.getHolidays(year, locale)) {
      if (holiday.type !== "public") continue;
      const date = holiday.date.slice(0, 10);
      if (date < start || date > end) continue;
      const names = byDate.get(date) ?? [];
      if (!names.includes(holiday.name)) names.push(holiday.name);
      byDate.set(date, names);
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, names]) => ({ date, name: names.join(" / ") }));
}

/** Every released region code (for tests and configuration checks). */
export function releasedRegions(): string[] {
  return COUNTRIES.flatMap((country) => [country, ...SUBDIVISIONS[country]]);
}
