import { addDays, addMonths, diffDays, isIsoDate, type IsoDate } from "./dates";
import { COUNTRIES, isCountry, isSubdivisionOf, type Country } from "./region";

/**
 * Trip form (F-001, W05/W12) – parsing and validation shared by the form (live, on blur and
 * submit) and the Server Actions (authoritative). Rules and texts: ux-spec §5.2.
 */

export const TRIP_NAME_MAX = 80;
export const DESCRIPTION_MAX = 500;
/** Counter shows from 400 characters on (ux-spec §5.2). */
export const DESCRIPTION_COUNTER_FROM = 400;
export const NIGHTS_MIN = 1;
export const NIGHTS_MAX = 30;
export const DEFAULT_MIN_NIGHTS = 4;
export const RANGE_MAX_MONTHS = 12;

/** Raw values as they come from the form (strings, numbers may be empty). */
export interface TripDraft {
  name: string;
  rangeStart: string;
  rangeEnd: string;
  minNights: string;
  preferredNights: string;
  description: string;
  deadline: string;
  /** "DE" (nationwide) or "DE-BY" (country + subdivision). */
  holidayRegion: string;
}

export interface TripValues {
  name: string;
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  minNights: number;
  preferredNights: number | null;
  description: string | null;
  deadline: IsoDate | null;
  holidayCountry: Country;
  holidaySubdivision: string | null;
}

export type TripField = keyof TripDraft;

/** Message keys under `tripForm.errors.<key>`. */
export type TripErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "startRequired"
  | "startInPast"
  | "endRequired"
  | "endBeforeStart"
  | "endInPast"
  | "rangeTooLong"
  | "rangeTooShort"
  | "nightsRange"
  | "preferredTooShort"
  | "descriptionTooLong"
  | "deadlineInPast"
  | "deadlineAfterEnd"
  | "regionInvalid";

export interface TripError {
  key: TripErrorKey;
  values?: Record<string, number>;
}

export type TripErrors = Partial<Record<TripField, TripError>>;

/** Field order = order of the form (focus goes to the first faulty field, ux-spec §5.1). */
export const TRIP_FIELDS: readonly TripField[] = [
  "name",
  "rangeStart",
  "rangeEnd",
  "minNights",
  "preferredNights",
  "description",
  "holidayRegion",
  "deadline",
];

export function emptyDraft(holidayRegion: string): TripDraft {
  return {
    name: "",
    rangeStart: "",
    rangeEnd: "",
    minNights: String(DEFAULT_MIN_NIGHTS),
    preferredNights: "",
    description: "",
    deadline: "",
    holidayRegion,
  };
}

/** Reads a draft from FormData (missing fields become ""). */
export function draftFromFormData(formData: FormData): TripDraft {
  const read = (field: TripField) => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
  };
  return {
    name: read("name"),
    rangeStart: read("rangeStart"),
    rangeEnd: read("rangeEnd"),
    minNights: read("minNights"),
    preferredNights: read("preferredNights"),
    description: read("description"),
    deadline: read("deadline"),
    holidayRegion: read("holidayRegion"),
  };
}

/** Accepts a stored draft only if it has the right shape (sessionStorage is untrusted input). */
export function parseStoredDraft(value: unknown): TripDraft | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const draft = {} as TripDraft;
  for (const field of TRIP_FIELDS) {
    const entry = record[field];
    if (typeof entry !== "string" || entry.length > 1000) return null;
    draft[field] = entry;
  }
  return draft;
}

function parseNights(value: string): number | null {
  if (!/^\d{1,3}$/.test(value.trim())) return null;
  return Number(value.trim());
}

/** Region value for the select: "DE" or "DE-BY". */
export function regionValue(country: string, subdivision: string | null | undefined): string {
  return subdivision ?? country;
}

export function parseRegion(
  value: string,
): { country: Country; subdivision: string | null } | null {
  const country = value.slice(0, 2);
  if (!isCountry(country)) return null;
  if (value === country) return { country, subdivision: null };
  return isSubdivisionOf(country, value) ? { country, subdivision: value } : null;
}

export const SUPPORTED_COUNTRIES = COUNTRIES;

interface ValidateOptions {
  /** Earliest allowed start (the viewer's today; the server allows one day of tolerance). */
  today: IsoDate;
  /** When editing: an unchanged start date may lie in the past (trip already running). */
  originalStart?: IsoDate | undefined;
  /** When editing: an unchanged deadline may lie in the past (it has expired, R-040). */
  originalDeadline?: IsoDate | null | undefined;
  /**
   * When editing after the vote has started (phase ≠ «collecting»): the end must not be moved
   * before this date (the real today) – otherwise the trip would tip into «Vergangen» and end
   * the running vote (R-055, ux-spec §13.1 b). An unchanged end is kept as it is.
   */
  endNotBefore?: IsoDate | undefined;
  /** When editing: the end before the change (exempt from `endNotBefore`). */
  originalEnd?: IsoDate | undefined;
}

/**
 * Validates a draft. Returns normalised values or one error per field (the most relevant
 * one – e.g. «Das Ende muss nach dem Start liegen» before the length checks).
 */
export function validateTrip(
  draft: TripDraft,
  { today, originalStart, originalDeadline, endNotBefore, originalEnd }: ValidateOptions,
): { ok: true; values: TripValues } | { ok: false; errors: TripErrors } {
  const errors: TripErrors = {};
  const name = draft.name.trim();
  if (name.length === 0) errors.name = { key: "nameRequired" };
  else if (Array.from(name).length > TRIP_NAME_MAX) errors.name = { key: "nameTooLong" };

  const minNights = parseNights(draft.minNights);
  if (minNights === null || minNights < NIGHTS_MIN || minNights > NIGHTS_MAX) {
    errors.minNights = { key: "nightsRange" };
  }

  let preferredNights: number | null = null;
  if (draft.preferredNights.trim() !== "") {
    preferredNights = parseNights(draft.preferredNights);
    if (preferredNights === null || preferredNights < NIGHTS_MIN || preferredNights > NIGHTS_MAX) {
      errors.preferredNights = { key: "nightsRange" };
    } else if (minNights !== null && preferredNights < minNights) {
      errors.preferredNights = { key: "preferredTooShort", values: { nights: minNights } };
    }
  }

  const start = draft.rangeStart.trim();
  const end = draft.rangeEnd.trim();
  const startValid = isIsoDate(start);
  if (!startValid) errors.rangeStart = { key: "startRequired" };
  else if (start < today && start !== originalStart) errors.rangeStart = { key: "startInPast" };

  if (!isIsoDate(end)) errors.rangeEnd = { key: "endRequired" };
  else if (endNotBefore !== undefined && end < endNotBefore && end !== originalEnd) {
    errors.rangeEnd = { key: "endInPast" };
  } else if (startValid) {
    if (end <= start) errors.rangeEnd = { key: "endBeforeStart" };
    else if (end > addDays(addMonths(start, RANGE_MAX_MONTHS), -1)) {
      errors.rangeEnd = { key: "rangeTooLong" };
    } else if (minNights !== null && !errors.minNights && diffDays(start, end) < minNights) {
      // n nights need n + 1 days incl. arrival and departure.
      errors.rangeEnd = {
        key: "rangeTooShort",
        values: { nights: minNights, days: minNights + 1 },
      };
    }
  }

  const description = draft.description.trim();
  if (Array.from(description).length > DESCRIPTION_MAX)
    errors.description = { key: "descriptionTooLong" };

  const deadline = draft.deadline.trim();
  if (deadline !== "") {
    if (!isIsoDate(deadline) || (deadline < today && deadline !== originalDeadline)) {
      errors.deadline = { key: "deadlineInPast" };
    } else if (isIsoDate(end) && deadline > end) errors.deadline = { key: "deadlineAfterEnd" };
  }

  const region = parseRegion(draft.holidayRegion);
  if (!region) errors.holidayRegion = { key: "regionInvalid" };

  if (Object.keys(errors).length > 0 || !region || minNights === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    values: {
      name,
      rangeStart: start,
      rangeEnd: end,
      minNights,
      preferredNights,
      description: description === "" ? null : description,
      deadline: deadline === "" ? null : deadline,
      holidayCountry: region.country,
      holidaySubdivision: region.subdivision,
    },
  };
}

/** First faulty field in form order (focus target after submit). */
export function firstErrorField(errors: TripErrors): TripField | undefined {
  return TRIP_FIELDS.find((field) => errors[field]);
}
