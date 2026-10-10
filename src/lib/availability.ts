import { isWeekend } from "./calendar";
import { isIsoDate, type IsoDate } from "./dates";

/**
 * Painting days in «Meine Tage» (F-005, Flow B.2) – pure state logic shared by the editor,
 * the server validation and the tests. «Geht» is the default and never stored: a day without
 * an entry counts as «geht» once submitted.
 */

export const DAY_STATES = ["no", "maybe", "yes"] as const;
/** Brush order = keys 1/2/3 (ux-spec §7.3): «Geht nicht», «Zur Not», «Geht». */
export type DayState = (typeof DAY_STATES)[number];
export type StoredState = Exclude<DayState, "yes">;
export type StateMap = Readonly<Partial<Record<IsoDate, StoredState>>>;

export function isDayState(value: unknown): value is DayState {
  return typeof value === "string" && (DAY_STATES as readonly string[]).includes(value);
}

export function stateOf(map: StateMap, date: IsoDate): DayState {
  return map[date] ?? "yes";
}

/**
 * «Erster Tag entscheidet» (Flow B.2): tapping or dragging from a day that already has the
 * brush's state resets the range to «geht»; otherwise the brush is applied. The «Geht» brush
 * always resets.
 */
export function paintTarget(startState: DayState, brush: DayState): DayState {
  if (brush === "yes") return "yes";
  return startState === brush ? "yes" : brush;
}

export interface DayChange {
  date: IsoDate;
  from: DayState;
  to: DayState;
}

/** Sets every date to `to`; returns the new map and only the days that really changed. */
export function paint(
  map: StateMap,
  dates: readonly IsoDate[],
  to: DayState,
): { map: StateMap; changes: DayChange[] } {
  return paintEach(
    map,
    dates.map((date) => [date, to] as const),
  );
}

/** Per-day target states (quick actions mix targets: weekdays «zur Not», weekends «geht»). */
export function paintEach(
  map: StateMap,
  targets: readonly (readonly [IsoDate, DayState])[],
): { map: StateMap; changes: DayChange[] } {
  const next = new Map(Object.entries(map) as [IsoDate, StoredState][]);
  const changes: DayChange[] = [];
  for (const [date, to] of targets) {
    const from = next.get(date) ?? "yes";
    if (from === to) continue;
    if (to === "yes") next.delete(date);
    else next.set(date, to);
    changes.push({ date, from, to });
  }
  return { map: Object.fromEntries(next), changes };
}

/** Undo (back to `from`) or redo (forward to `to`) of one step. */
export function replay(map: StateMap, changes: readonly DayChange[], undo: boolean): StateMap {
  return paintEach(
    map,
    changes.map((change) => [change.date, undo ? change.from : change.to] as const),
  ).map;
}

/** The undo history keeps the last 20 steps of the session (Flow B.2). */
export const UNDO_LIMIT = 20;

export function pushHistory<T>(stack: readonly T[], step: T, limit = UNDO_LIMIT): T[] {
  return [...stack, step].slice(-limit);
}

export type QuickAction = "workdaysMaybe" | "weekendsYes" | "holidaysYes" | "reset";

/**
 * Quick actions (Flow B.2): «Alle Werktage Mo–Fr auf ‚zur Not‘» (holidays excluded, only
 * days still unmarked – existing «geht nicht» stays), «Alle Wochenenden auf ‚geht‘»,
 * «Feiertage auf ‚geht‘», «Alles zurücksetzen». Only editable days are passed in.
 */
export function quickActionTargets(
  action: QuickAction,
  map: StateMap,
  days: readonly IsoDate[],
  holidays: ReadonlySet<IsoDate>,
): [IsoDate, DayState][] {
  switch (action) {
    case "workdaysMaybe":
      return days
        .filter((d) => !isWeekend(d) && !holidays.has(d) && stateOf(map, d) === "yes")
        .map((d) => [d, "maybe"]);
    case "weekendsYes":
      return days.filter((d) => isWeekend(d)).map((d) => [d, "yes"]);
    case "holidaysYes":
      return days.filter((d) => holidays.has(d)).map((d) => [d, "yes"]);
    case "reset":
      return days.map((d) => [d, "yes"]);
  }
}

/** Sorted `[date, state]` pairs – the wire format of the save action. */
export type AvailabilityEntry = [IsoDate, StoredState];

export function toEntries(map: StateMap, filter?: (date: IsoDate) => boolean): AvailabilityEntry[] {
  return Object.entries(map)
    .filter((entry): entry is [IsoDate, StoredState] => entry[1] !== undefined)
    .filter(([date]) => !filter || filter(date))
    .sort(([a], [b]) => a.localeCompare(b));
}

export function fromEntries(entries: readonly AvailabilityEntry[]): StateMap {
  return Object.fromEntries(entries);
}

/** Comment per member (F-005): optional, ≤ 200 characters; counter from 160 (ux-spec §5.2). */
export const COMMENT_MAX = 200;
export const COMMENT_COUNTER_FROM = 160;

/** Length in characters (code points) – like PostgreSQL `char_length`, emoji count once. */
export function charCount(value: string): number {
  return Array.from(value).length;
}

export function cleanComment(value: string): string | null {
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed === "" ? null : trimmed;
}

/** One-off feedback after submitting (F-005, A3/A7). */
export const IMPORT_FEEDBACK = ["apple", "google", "outlook", "other", "none", "skipped"] as const;
export type ImportFeedback = (typeof IMPORT_FEEDBACK)[number];

export function isImportFeedback(value: unknown): value is ImportFeedback {
  return typeof value === "string" && (IMPORT_FEEDBACK as readonly string[]).includes(value);
}

/** Upper bound of entries per save (search range ≤ 12 months, F-001). */
export const MAX_ENTRIES = 400;

export type EntriesCheck =
  | { ok: true; entries: AvailabilityEntry[] }
  | { ok: false; reason: "shape" | "outsideRange" | "duplicate" };

/**
 * Server-side validation of a save (F-005): well-formed pairs, real calendar dates, only
 * days of the trip's search range, no duplicates. Untrusted input – never throws.
 */
export function checkEntries(
  input: unknown,
  range: { start: IsoDate; end: IsoDate },
): EntriesCheck {
  if (!Array.isArray(input) || input.length > MAX_ENTRIES) return { ok: false, reason: "shape" };
  const seen = new Set<IsoDate>();
  const entries: AvailabilityEntry[] = [];
  for (const item of input as unknown[]) {
    if (!Array.isArray(item) || item.length !== 2) return { ok: false, reason: "shape" };
    const [date, state] = item as unknown[];
    if (!isIsoDate(date) || (state !== "maybe" && state !== "no")) {
      return { ok: false, reason: "shape" };
    }
    if (date < range.start || date > range.end) return { ok: false, reason: "outsideRange" };
    if (seen.has(date)) return { ok: false, reason: "duplicate" };
    seen.add(date);
    entries.push([date, state]);
  }
  return { ok: true, entries };
}
