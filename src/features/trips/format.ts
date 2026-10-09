import { diffDays, formatDateRange, type IsoDate } from "@/lib/dates";

/** «Kemal, Sara und Jonas» – longer lists end with «und 3 weitere» (ux-spec §10.3). */
export function nameList(
  names: string[],
  locale: string,
  more: (count: number) => string,
  max = 4,
) {
  const list =
    names.length > max ? [...names.slice(0, max - 1), more(names.length - (max - 1))] : names;
  return new Intl.ListFormat(locale, { type: "conjunction", style: "long" }).format(list);
}

export interface NightsLabels {
  nights: (count: number) => string;
  range: (min: number, max: number) => string;
}

/** «4–5 Nächte» or «4 Nächte». */
export function nightsText(min: number, preferred: number | null, labels: NightsLabels): string {
  return preferred && preferred !== min ? labels.range(min, preferred) : labels.nights(min);
}

/** Range text of a trip, e.g. «1. Mai – 30. Juni 2027». */
export function rangeText(start: IsoDate, end: IsoDate, intl: string, today: IsoDate): string {
  return formatDateRange(start, end, intl, { today });
}

export function rangeNights(start: IsoDate, end: IsoDate): number {
  return diffDays(start, end);
}
