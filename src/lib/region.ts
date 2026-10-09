import { parseAcceptLanguage } from "@/i18n/negotiate";
import type { Locale } from "@/i18n/config";

/**
 * Region of an account (F-046, Flow F.1): separate from the language. It drives date
 * formats, the first day of the week and – from Increment 3 on – public holidays (F-016).
 * Codes follow ISO 3166-1 / ISO 3166-2, which is also what `date-holidays` expects.
 */
export const COUNTRIES = ["DE", "AT", "CH", "GB", "US"] as const;
export type Country = (typeof COUNTRIES)[number];

/** Subdivisions for regional holidays (W13: only DE/AT/CH/UK). Message keys: `regions.subdivisions.<code>`. */
export const SUBDIVISIONS: Readonly<Record<Country, readonly string[]>> = {
  DE: [
    "DE-BW",
    "DE-BY",
    "DE-BE",
    "DE-BB",
    "DE-HB",
    "DE-HH",
    "DE-HE",
    "DE-MV",
    "DE-NI",
    "DE-NW",
    "DE-RP",
    "DE-SL",
    "DE-SN",
    "DE-ST",
    "DE-SH",
    "DE-TH",
  ],
  AT: ["AT-1", "AT-2", "AT-3", "AT-4", "AT-5", "AT-6", "AT-7", "AT-8", "AT-9"],
  CH: [
    "CH-AG",
    "CH-AI",
    "CH-AR",
    "CH-BE",
    "CH-BL",
    "CH-BS",
    "CH-FR",
    "CH-GE",
    "CH-GL",
    "CH-GR",
    "CH-JU",
    "CH-LU",
    "CH-NE",
    "CH-NW",
    "CH-OW",
    "CH-SG",
    "CH-SH",
    "CH-SO",
    "CH-SZ",
    "CH-TG",
    "CH-TI",
    "CH-UR",
    "CH-VD",
    "CH-VS",
    "CH-ZG",
    "CH-ZH",
  ],
  GB: ["GB-ENG", "GB-NIR", "GB-SCT", "GB-WLS"],
  US: [],
};

export const WEEK_STARTS = ["auto", "mon", "sun"] as const;
export type WeekStart = (typeof WEEK_STARTS)[number];

export function isCountry(value: unknown): value is Country {
  return typeof value === "string" && (COUNTRIES as readonly string[]).includes(value);
}

export function isWeekStart(value: unknown): value is WeekStart {
  return typeof value === "string" && (WEEK_STARTS as readonly string[]).includes(value);
}

/** A subdivision is only valid together with its country; empty = nationwide holidays only. */
export function isSubdivisionOf(country: Country, value: unknown): value is string {
  return typeof value === "string" && SUBDIVISIONS[country].includes(value);
}

/** Country when the account has none yet: language without region → DE for de, GB for en (Flow F.1). */
export function defaultCountry(locale: Locale): Country {
  return locale === "de" ? "DE" : "GB";
}

/**
 * Pre-fills the region from `Accept-Language` (`de-AT` → AT, `en-US` → US) – silently at
 * sign-up, changeable in the account (Flow F.1). Unsupported regions fall back by language.
 */
export function regionFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
  locale: Locale,
): Country {
  for (const tag of parseAcceptLanguage(acceptLanguage ?? "")) {
    const region = tag.split("-")[1]?.toUpperCase();
    if (isCountry(region)) return region;
    if (region === "UK") return "GB";
  }
  return defaultCountry(locale);
}

/** BCP 47 tag for `Intl` formatting: UI language + account region, e.g. "de-AT", "en-US". */
export function formattingLocale(locale: Locale, country: Country): string {
  return `${locale}-${country}`;
}

/** 1 = Monday, 0 = Sunday. "auto": Sunday for the US, Monday elsewhere (ux-spec §9). */
export function firstDayOfWeek(weekStart: WeekStart, country: Country): 0 | 1 {
  if (weekStart === "mon") return 1;
  if (weekStart === "sun") return 0;
  return country === "US" ? 0 : 1;
}

/** Sample date for the account preview ("So sehen Daten aus"): a Friday in July. */
export const PREVIEW_DATE = new Date(Date.UTC(2027, 6, 2));

/** Long date with weekday, e.g. "Fr., 2. Juli 2027" · "Fri 2 July 2027" · "Fri, July 2, 2027". */
export function formatLongDate(date: Date, locale: Locale, country: Country): string {
  return new Intl.DateTimeFormat(formattingLocale(locale, country), {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Weekday name for a day index (0 = Sunday), in the UI language. */
export function weekdayName(day: 0 | 1, locale: Locale): string {
  // 2027-07-04 is a Sunday, 2027-07-05 a Monday.
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2027, 6, 4 + day)),
  );
}
