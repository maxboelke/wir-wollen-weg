import { addDays, diffDays, isIsoDate, type IsoDate } from "./dates";

/**
 * Personal travel details (F-054 stage 1 + F-056, features.md R.9, W20 H) – pure rules shared by
 * the Server Actions, the forms and the unit tests: field list, input checks and normalisation,
 * masks, deletion date. Never logs or formats values for anything but the person's own screen.
 */

/** Field codes of a request in the fixed order of the forms (R.9 «Felder»). */
export const TRAVEL_FIELDS = [
  "legal_name",
  "birth_date",
  "sex",
  "nationality",
  "document",
  "document_expiry",
  "issuing_country",
] as const;
export type TravelField = (typeof TRAVEL_FIELDS)[number];

/** Default of a new request: name (always) + date of birth (W20 H.4). */
export const DEFAULT_REQUEST_FIELDS: readonly TravelField[] = ["legal_name", "birth_date"];

/** Fields that only make sense together with the document (R.9). */
export const DOCUMENT_DEPENDENT: readonly TravelField[] = ["document_expiry", "issuing_country"];

/** Schema version of the encrypted record – part of the AAD (R.9 Verschlüsselung Nr. 1). */
export const TRAVEL_SCHEMA_VERSION = 1;
/** Version of the consent text `travelData.consent` (W20 H.16, proof Art. 7 Abs. 1 DSGVO). */
export const CONSENT_VERSION = 1;

/** Limits (R.9 «Rate-Limits», technische Obergrenzen). */
export const TRAVEL_LIMITS = {
  purposeMax: 60,
  nameMax: 100,
  openRequestsPerBooker: 3,
  recipientsPerRequest: 50,
  accessLogPerRelease: 1000,
  bookersPerTrip: 3,
  /** Deletion: days after the departure day (Q31). */
  deleteAfterDays: 7,
  /** «Festlegung aufgehoben» – shared details are deleted after this many days without a new fixing. */
  unfixedDays: 30,
  /** Re-authentication for document numbers (R.9 I11-08). */
  reauthHours: 12,
  /** Oldest plausible date of birth. */
  maxAgeYears: 120,
} as const;

export type Sex = "F" | "M" | "X";
export type DocumentType = "passport" | "id_card";
export const SEXES: readonly Sex[] = ["F", "M", "X"];
export const DOCUMENT_TYPES: readonly DocumentType[] = ["passport", "id_card"];

/**
 * The values of one release – exactly the requested fields (R.9). This record is what gets
 * encrypted; it never leaves the server except to the person themself or the asking «Bucht».
 */
export interface TravelValues {
  givenNames?: string;
  familyNames?: string;
  birthDate?: IsoDate;
  sex?: Sex;
  nationality?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  documentExpiry?: IsoDate;
  issuingCountry?: string;
}

/** Single values that can be shown/copied one by one (access log `field`, W20 H.7). */
export const COPY_FIELDS = [
  "given_name",
  "family_name",
  "birth_date",
  "sex",
  "nationality",
  "document_type",
  "document_number",
  "document_expiry",
  "issuing_country",
] as const;
export type CopyField = (typeof COPY_FIELDS)[number];

const COPY_KEY: Record<CopyField, keyof TravelValues> = {
  given_name: "givenNames",
  family_name: "familyNames",
  birth_date: "birthDate",
  sex: "sex",
  nationality: "nationality",
  document_type: "documentType",
  document_number: "documentNumber",
  document_expiry: "documentExpiry",
  issuing_country: "issuingCountry",
};

/** Single values a request field consists of, in display order. */
export function copyFieldsOf(fields: readonly TravelField[]): CopyField[] {
  const out: CopyField[] = [];
  for (const field of TRAVEL_FIELDS) {
    if (!fields.includes(field)) continue;
    switch (field) {
      case "legal_name":
        out.push("given_name", "family_name");
        break;
      case "document":
        out.push("document_type", "document_number");
        break;
      default:
        out.push(field);
    }
  }
  return out;
}

export function valueOf(values: TravelValues, field: CopyField): string | undefined {
  return values[COPY_KEY[field]];
}

export function isCopyField(value: unknown): value is CopyField {
  return typeof value === "string" && (COPY_FIELDS as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------------------------------ */
/* Requests                                                                                    */
/* ------------------------------------------------------------------------------------------ */

/**
 * Field selection of a new request: only known codes, name always, dependent fields only with
 * the document (R.9 I11-04). Returns null for anything else (no silent repair of a tampered
 * request – the server rejects it).
 */
export function normalizeRequestFields(input: unknown): TravelField[] | null {
  if (!Array.isArray(input)) return null;
  const set = new Set<TravelField>();
  for (const item of input) {
    if (typeof item !== "string" || !(TRAVEL_FIELDS as readonly string[]).includes(item)) {
      return null;
    }
    set.add(item as TravelField);
  }
  if (!set.has("legal_name")) return null;
  if (DOCUMENT_DEPENDENT.some((field) => set.has(field)) && !set.has("document")) return null;
  return TRAVEL_FIELDS.filter((field) => set.has(field));
}

/** Control and format characters (also bidi overrides) – never part of a stored text. */
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]/g;

/** «Wofür?» (R.9 I11-04): text only, control characters removed, spaces collapsed, 1–60. */
export function cleanPurpose(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const clean = input.replace(CONTROL, " ").replace(/\s+/g, " ").trim();
  if (clean.length === 0 || [...clean].length > TRAVEL_LIMITS.purposeMax) return null;
  return clean;
}

/* ------------------------------------------------------------------------------------------ */
/* Values                                                                                      */
/* ------------------------------------------------------------------------------------------ */

/** ISO 3166-1 alpha-2 (officially assigned codes) – nationality and issuing country. */
// prettier-ignore
export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

const COUNTRY_SET: ReadonlySet<string> = new Set(COUNTRY_CODES);

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && COUNTRY_SET.has(value);
}

/**
 * Names as on the ID (R.9): letters of all scripts incl. combining marks, spaces, hyphen,
 * apostrophe, full stop – no digits, no control characters; must start with a letter.
 */
const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;

export function cleanName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const clean = input.normalize("NFC").replace(/\s+/g, " ").trim();
  if (clean.length === 0 || [...clean].length > TRAVEL_LIMITS.nameMax) return null;
  return NAME.test(clean) ? clean : null;
}

/** Document number: upper case, spaces removed, A–Z/0–9 only, 5–20 characters. */
export function normalizeDocumentNumber(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const clean = input.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z0-9]{5,20}$/.test(clean) ? clean : null;
}

/** Demo and preview: only made-up numbers starting with DEMO (R.9 I11-12, server-enforced). */
export const DEMO_DOCUMENT_PREFIX = "DEMO";

/** «07», «4», «1995» → «1995-04-07» – null for impossible dates (31 April) or bad parts. */
export function datePartsToIso(day: unknown, month: unknown, year: unknown): IsoDate | null {
  const parts = [day, month, year].map((part) =>
    typeof part === "string" ? part.trim() : typeof part === "number" ? String(part) : "",
  );
  const [d, m, y] = parts;
  if (!d || !m || !y || !/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return null;
  }
  const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return isIsoDate(iso) ? iso : null;
}

/**
 * Pasting a whole date into the first field (W20 H.5): «07.04.1995», «7/4/1995», «1995-04-07»,
 * «07 04 1995». `monthFirst` (en-US) reads «04/07/1995» as April 7th. Returns the three parts
 * or null when the text is not a date.
 */
export function splitPastedDate(
  text: string,
  monthFirst = false,
): { day: string; month: string; year: string } | null {
  const trimmed = text.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) return { year: iso[1] ?? "", month: iso[2] ?? "", day: iso[3] ?? "" };
  const local = /^(\d{1,2})[./\s-]+(\d{1,2})[./\s-]+(\d{4})$/.exec(trimmed);
  if (!local) return null;
  const [a, b, year] = [local[1] ?? "", local[2] ?? "", local[3] ?? ""];
  return monthFirst ? { month: a, day: b, year } : { day: a, month: b, year };
}

export type ValueError =
  | "givenRequired"
  | "givenInvalid"
  | "familyRequired"
  | "familyInvalid"
  | "dateIncomplete"
  | "dateInvalid"
  | "dateFuture"
  | "dateYear"
  | "sexRequired"
  | "nationalityRequired"
  | "documentTypeRequired"
  | "documentNumberInvalid"
  | "documentDemo"
  | "expiryIncomplete"
  | "expiryInvalid"
  | "countryRequired";

export type ValueErrors = Partial<Record<keyof TravelValues, ValueError>>;

/** Raw form input: dates as their three parts (W20 H.0), everything else as text. */
export interface TravelInput {
  givenNames?: unknown;
  familyNames?: unknown;
  birthDay?: unknown;
  birthMonth?: unknown;
  birthYear?: unknown;
  sex?: unknown;
  nationality?: unknown;
  documentType?: unknown;
  documentNumber?: unknown;
  expiryDay?: unknown;
  expiryMonth?: unknown;
  expiryYear?: unknown;
  issuingCountry?: unknown;
}

function blank(...values: unknown[]): boolean {
  return values.every((value) => typeof value !== "string" || value.trim() === "");
}

/**
 * Checks and normalises the answer to a request (R.9 «Felder», W20 H.5) – client and server use
 * the same rules. Every requested field is required; fields that were NOT requested are dropped
 * (never stored, even if a tampered client sends them).
 */
export function validateTravelValues(
  input: TravelInput,
  fields: readonly TravelField[],
  options: { today: IsoDate; demo: boolean },
): { ok: true; values: TravelValues } | { ok: false; errors: ValueErrors } {
  const errors: ValueErrors = {};
  const values: TravelValues = {};
  if (fields.includes("legal_name")) {
    const given = cleanName(input.givenNames);
    const family = cleanName(input.familyNames);
    if (given) values.givenNames = given;
    else errors.givenNames = blank(input.givenNames) ? "givenRequired" : "givenInvalid";
    if (family) values.familyNames = family;
    else errors.familyNames = blank(input.familyNames) ? "familyRequired" : "familyInvalid";
  }
  if (fields.includes("birth_date")) {
    const parts = [input.birthDay, input.birthMonth, input.birthYear];
    const iso = datePartsToIso(...(parts as [unknown, unknown, unknown]));
    if (parts.some((part) => blank(part))) errors.birthDate = "dateIncomplete";
    else if (!iso) errors.birthDate = "dateInvalid";
    else if (iso > options.today) errors.birthDate = "dateFuture";
    else if (diffDays(iso, options.today) > TRAVEL_LIMITS.maxAgeYears * 366) {
      errors.birthDate = "dateYear";
    } else values.birthDate = iso;
  }
  if (fields.includes("sex")) {
    if (SEXES.includes(input.sex as Sex)) values.sex = input.sex as Sex;
    else errors.sex = "sexRequired";
  }
  if (fields.includes("nationality")) {
    if (isCountryCode(input.nationality)) values.nationality = input.nationality;
    else errors.nationality = "nationalityRequired";
  }
  if (fields.includes("document")) {
    if (DOCUMENT_TYPES.includes(input.documentType as DocumentType)) {
      values.documentType = input.documentType as DocumentType;
    } else errors.documentType = "documentTypeRequired";
    const number = normalizeDocumentNumber(input.documentNumber);
    if (!number) errors.documentNumber = "documentNumberInvalid";
    else if (options.demo && !number.startsWith(DEMO_DOCUMENT_PREFIX)) {
      errors.documentNumber = "documentDemo";
    } else values.documentNumber = number;
  }
  if (fields.includes("document_expiry")) {
    const parts = [input.expiryDay, input.expiryMonth, input.expiryYear];
    const iso = datePartsToIso(...(parts as [unknown, unknown, unknown]));
    if (parts.some((part) => blank(part))) errors.documentExpiry = "expiryIncomplete";
    else if (!iso || diffDays(options.today, iso) > 30 * 366) {
      errors.documentExpiry = "expiryInvalid";
    } else values.documentExpiry = iso;
  }
  if (fields.includes("issuing_country")) {
    if (isCountryCode(input.issuingCountry)) values.issuingCountry = input.issuingCountry;
    else errors.issuingCountry = "countryRequired";
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}

/** Values of another own release that fit this request (W20 H.5 «übernehmen», same trip only). */
export function overlappingValues(
  values: TravelValues,
  fields: readonly TravelField[],
): TravelValues {
  const out: TravelValues = {};
  for (const field of copyFieldsOf(fields)) {
    const key = COPY_KEY[field];
    const value = values[key];
    if (value !== undefined) (out as Record<string, string>)[key] = value;
  }
  return out;
}

/** The decrypted record must contain exactly the requested fields – anything else is rejected. */
export function parseStoredValues(
  record: unknown,
  fields: readonly TravelField[],
): TravelValues | null {
  if (typeof record !== "object" || record === null || Array.isArray(record)) return null;
  const allowed = new Set<string>(copyFieldsOf(fields).map((field) => COPY_KEY[field]));
  const out: TravelValues = {};
  for (const [key, value] of Object.entries(record)) {
    if (!allowed.has(key) || typeof value !== "string") return null;
    (out as Record<string, string>)[key] = value;
  }
  return out;
}

/* ------------------------------------------------------------------------------------------ */
/* Masks (server-side, W20 H.7 / design-system §9.23.5)                                          */
/* ------------------------------------------------------------------------------------------ */

const DOTS = "•••";

/** «Maria Luisa» → «M••• L•••» (first letter per word, fixed length). */
export function maskName(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${[...word][0] ?? ""}${DOTS}`)
    .join(" ");
}

/** «C01X4F7R7» → «C••••7». */
export function maskDocumentNumber(value: string): string {
  const chars = [...value];
  return `${chars[0] ?? ""}••••${chars.at(-1) ?? ""}`;
}

export const DATE_MASK = "••.••.••••";

/** Mask of one single value – everything is masked alike (W20 H.7: one rule). */
export function maskValue(field: CopyField, value: string): string {
  switch (field) {
    case "given_name":
    case "family_name":
      return maskName(value);
    case "birth_date":
    case "document_expiry":
      return DATE_MASK;
    case "document_number":
      return maskDocumentNumber(value);
    default:
      return DOTS;
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Lifecycle (Q31, R.9 I11-10)                                                                   */
/* ------------------------------------------------------------------------------------------ */

/** Deletion date: departure day + 7 (end of that day in APP_TIME_ZONE). */
export function travelDeleteOn(fixedEnd: IsoDate): IsoDate {
  return addDays(fixedEnd, TRAVEL_LIMITS.deleteAfterDays);
}

/** The deletion date has passed – values must not be read any more, the job deletes them. */
export function travelDataExpired(fixedEnd: IsoDate | null, today: IsoDate): boolean {
  return fixedEnd !== null && today > travelDeleteOn(fixedEnd);
}

const DAY_MS = 86_400_000;

/** «Festlegung aufgehoben» longer than 30 days ago (R.9 I11-10). */
export function unfixedTooLong(unfixedAt: Date | null, now: Date): boolean {
  return (
    unfixedAt !== null && now.getTime() - unfixedAt.getTime() >= TRAVEL_LIMITS.unfixedDays * DAY_MS
  );
}

/** A new request is possible until the departure day (R.9 I11-04, W20 H.1). */
export function canRequestOn(fixedEnd: IsoDate, today: IsoDate): boolean {
  return today <= fixedEnd;
}

/** The document expires before the return trip (W20 H.5 – Should, only for the person). */
export function expiresBeforeReturn(expiry: IsoDate | undefined, fixedEnd: IsoDate): boolean {
  return expiry !== undefined && expiry < fixedEnd;
}

/** Genitive of a name in German («Saras», «Jonas’») – W20 H.16. */
export function genitiveDe(name: string): string {
  return /[sßxz]$/i.test(name) || /ce$/i.test(name) ? `${name}’` : `${name}s`;
}
