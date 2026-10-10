import { isWeekend } from "./calendar";
import { addDays, diffDays, type IsoDate } from "./dates";
import type { Participant } from "./heatmap";

/**
 * Candidate periods (F-009, Flow C.2) – a pure, deterministic function, independent of the
 * viewer's language and region (holidays only decorate the cards, see `vacationDays`).
 *
 * - A window of d nights covers d + 1 consecutive days. A participant CAN make a window when
 *   none of its days is «Geht nicht» («Zur Not» is allowed).
 * - «Alle dabei» (U-14): maximal spans (overlapping windows merged) in which everybody can,
 *   with at least `minNights` nights.
 * - «Fast alle dabei»: maximal spans in which everybody except a fixed set S of 1…`tolerance`
 *   people can – and every person in S really has a «Geht nicht» in the span (otherwise the span
 *   belongs to a smaller set). Spans of different sets may overlap; that is intended («ohne
 *   Jonas: 13.–19. Mai», «ohne Tim: 1.–19. Juni»).
 * - Order per group: (1) fewer missing, (2) fewer «Zur Not» person-days, (3) length closer to /
 *   at least the target length, (4) earlier start; then end and the missing ids (determinism).
 *
 * Only submitted members are passed in (the caller also drops locally hidden people, F-008).
 * Bitmasks keep 30 members × 365 days × up to C(30, 3) sets far below 500 ms.
 */

export type SuggestionGroup = "all" | "almost";

export interface Suggestion {
  group: SuggestionGroup;
  start: IsoDate;
  end: IsoDate;
  nights: number;
  /** Ids of the participants who cannot make it (empty for «Alle dabei»). */
  missing: string[];
  /** «◐ 2× zur Not»: «Zur Not» person-days of the people who come. */
  maybeDays: number;
}

export interface SuggestionInput {
  /** First day a window may start (max(search start, today)). */
  from: IsoDate;
  /** Last day of the search range. */
  to: IsoDate;
  participants: readonly Participant[];
  /** Minimum nights m (≥ 1). */
  minNights: number;
  /** Target nights w (wish, ≥ 1) – only for the order. */
  targetNights: number;
  /** k people may be missing in «Fast alle dabei» (0–3). */
  tolerance: number;
}

export interface SuggestionResult {
  all: Suggestion[];
  almost: Suggestion[];
}

export const MAX_TOLERANCE = 3;
/** The bitmasks hold one bit per participant (trips have at most 30 members). */
const MAX_PARTICIPANTS = 32;

/**
 * Effective minimum when the viewer changes the local «Dauer» filter (Flow C.1): the filter is
 * the target length; going below the trip's minimum also lowers the minimum («Mit 4 statt 5
 * Nächten gäbe es 3 Optionen»).
 */
export function effectiveMinNights(tripMin: number, duration: number): number {
  return Math.max(1, Math.min(tripMin, duration));
}

function bit(index: number): number {
  return (1 << index) >>> 0;
}

function popcount(mask: number): number {
  let count = 0;
  for (let value = mask >>> 0; value !== 0; value = (value & (value - 1)) >>> 0) count++;
  return count;
}

/** All subsets of `items` (bit indices) with 1…k elements, as masks. */
function subsets(items: readonly number[], k: number): number[] {
  const out: number[] = [];
  const walk = (start: number, size: number, mask: number) => {
    if (size > 0) out.push(mask);
    if (size === k) return;
    for (let i = start; i < items.length; i++) {
      walk(i + 1, size + 1, (mask | bit(items[i] ?? 0)) >>> 0);
    }
  };
  walk(0, 0, 0);
  return out;
}

export function compareSuggestions(a: Suggestion, b: Suggestion, targetNights: number): number {
  if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
  if (a.maybeDays !== b.maybeDays) return a.maybeDays - b.maybeDays;
  const short = (s: Suggestion) => Math.max(0, targetNights - s.nights);
  if (short(a) !== short(b)) return short(a) - short(b);
  if (a.start !== b.start) return a.start < b.start ? -1 : 1;
  if (a.end !== b.end) return a.end < b.end ? -1 : 1;
  const ka = a.missing.join(",");
  const kb = b.missing.join(",");
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

export function computeSuggestions(input: SuggestionInput): SuggestionResult {
  const { participants, from, to } = input;
  const minNights = Math.max(1, Math.floor(input.minNights));
  // At least one person must come: with n participants at most n − 1 may miss out (a span
  // «0 können · ohne Lena» is no suggestion – reachable when the viewer hides people locally).
  const tolerance = Math.min(
    MAX_TOLERANCE,
    Math.max(0, Math.floor(input.tolerance)),
    Math.max(0, participants.length - 1),
  );
  const length = diffDays(from, to) + 1;
  if (participants.length === 0 || length < minNights + 1) return { all: [], almost: [] };
  if (participants.length > MAX_PARTICIPANTS) {
    throw new Error(`suggestions: at most ${String(MAX_PARTICIPANTS)} participants`);
  }

  const days: IsoDate[] = Array.from({ length }, (_, i) => addDays(from, i));
  const noMask = new Uint32Array(length);
  const maybeMask = new Uint32Array(length);
  days.forEach((day, d) => {
    participants.forEach((person, p) => {
      if (person.no.has(day)) noMask[d] = ((noMask[d] ?? 0) | bit(p)) >>> 0;
      else if (person.maybe.has(day)) maybeMask[d] = ((maybeMask[d] ?? 0) | bit(p)) >>> 0;
    });
  });

  const spansFor = (allowed: number): Suggestion[] => {
    const found: Suggestion[] = [];
    let runStart = -1;
    let seen = 0;
    const close = (endIndex: number) => {
      const nights = endIndex - runStart;
      if (runStart >= 0 && nights >= minNights && seen === allowed) {
        let maybeDays = 0;
        for (let d = runStart; d <= endIndex; d++) {
          maybeDays += popcount(((maybeMask[d] ?? 0) & ~allowed) >>> 0);
        }
        const missing: string[] = [];
        participants.forEach((person, p) => {
          if ((allowed & bit(p)) !== 0) missing.push(person.id);
        });
        found.push({
          group: allowed === 0 ? "all" : "almost",
          start: days[runStart] ?? from,
          end: days[endIndex] ?? to,
          nights,
          missing,
          maybeDays,
        });
      }
      runStart = -1;
      seen = 0;
    };
    for (let d = 0; d < length; d++) {
      const blocked = noMask[d] ?? 0;
      if ((blocked & ~allowed) >>> 0 === 0) {
        if (runStart < 0) runStart = d;
        seen = (seen | blocked) >>> 0;
      } else if (runStart >= 0) {
        close(d - 1);
      }
    }
    if (runStart >= 0) close(length - 1);
    return found;
  };

  const all = spansFor(0);
  const blockers: number[] = [];
  participants.forEach((_, p) => {
    if (noMask.some((mask) => (mask & bit(p)) !== 0)) blockers.push(p);
  });
  const almost = tolerance === 0 ? [] : subsets(blockers, tolerance).flatMap(spansFor);

  const sort = (list: Suggestion[]) =>
    list.sort((a, b) => compareSuggestions(a, b, input.targetNights));
  return { all: sort(all), almost: sort(almost) };
}

export function suggestionCount(result: SuggestionResult): number {
  return result.all.length + result.almost.length;
}

export interface NoMatchHints {
  /** «Mit 4 statt 5 Nächten gäbe es 3 Optionen». */
  shorter: { nights: number; count: number } | null;
  /** «Wenn 1 Person fehlen darf: 2 Optionen». */
  tolerance: { tolerance: number; count: number } | null;
}

/** Concrete ways out when nothing fits (F-009, Flow C.2 «Keine Treffer»). */
export function noMatchHints(input: SuggestionInput): NoMatchHints {
  let shorter: NoMatchHints["shorter"] = null;
  for (let nights = Math.floor(input.minNights) - 1; nights >= 1; nights--) {
    const count = suggestionCount(computeSuggestions({ ...input, minNights: nights }));
    if (count > 0) {
      shorter = { nights, count };
      break;
    }
  }
  let tolerance: NoMatchHints["tolerance"] = null;
  for (let k = Math.floor(input.tolerance) + 1; k <= MAX_TOLERANCE; k++) {
    if (k > input.participants.length - 1) break;
    const count = suggestionCount(computeSuggestions({ ...input, tolerance: k }));
    if (count > 0) {
      tolerance = { tolerance: k, count };
      break;
    }
  }
  return { shorter, tolerance };
}

/**
 * «ca. 3 Urlaubstage» (Flow C.2, F-016): working days Mon–Fri in the span minus the viewer's
 * public holidays – the info tooltip says exactly that.
 */
export function vacationDays(start: IsoDate, end: IsoDate, holidays: ReadonlySet<IsoDate>): number {
  let count = 0;
  for (let day = start; day <= end; day = addDays(day, 1)) {
    if (!isWeekend(day) && !holidays.has(day)) count++;
  }
  return count;
}

/** Holidays inside a span, in date order («inkl. Christi Himmelfahrt»). */
export function holidaysIn<T extends { date: IsoDate }>(
  start: IsoDate,
  end: IsoDate,
  holidays: readonly T[],
): T[] {
  return holidays.filter((holiday) => holiday.date >= start && holiday.date <= end);
}
