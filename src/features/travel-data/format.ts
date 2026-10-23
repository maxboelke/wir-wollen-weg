import { toUtcDate, type IsoDate } from "@/lib/dates";
import type { CopyField, TravelValues } from "@/lib/travel-data";

/**
 * Display of single travel-detail values – only ever for the person themself or for the asking
 * «Bucht» after «Anzeigen»/«Kopieren». Dates in the numeric format of the viewer's region
 * («07.04.1995», «07/04/1995», «04/07/1995»), names exactly as entered, countries by name.
 */

export interface ValueLabels {
  sex: (code: "F" | "M" | "X") => string;
  documentType: (type: "passport" | "id_card") => string;
}

export function numericDate(value: IsoDate, intl: string): string {
  return new Intl.DateTimeFormat(intl, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(value));
}

export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function displayValue(
  field: CopyField,
  values: TravelValues,
  format: { intl: string; locale: string; labels: ValueLabels },
): string | undefined {
  switch (field) {
    case "given_name":
      return values.givenNames;
    case "family_name":
      return values.familyNames;
    case "birth_date":
      return values.birthDate ? numericDate(values.birthDate, format.intl) : undefined;
    case "document_expiry":
      return values.documentExpiry ? numericDate(values.documentExpiry, format.intl) : undefined;
    case "sex":
      return values.sex ? format.labels.sex(values.sex) : undefined;
    case "nationality":
      return values.nationality ? countryName(values.nationality, format.locale) : undefined;
    case "issuing_country":
      return values.issuingCountry ? countryName(values.issuingCountry, format.locale) : undefined;
    case "document_type":
      return values.documentType ? format.labels.documentType(values.documentType) : undefined;
    case "document_number":
      return values.documentNumber;
  }
}
