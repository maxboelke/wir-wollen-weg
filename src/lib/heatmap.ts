import type { IsoDate } from "./dates";

/**
 * Group calendar (F-008, ux-spec §4.9, design-system §6.2) – pure counting rule shared by the
 * heatmap, the day detail, the suggestions (F-009) and the tests.
 *
 * Counting rule (U-4): only members who SUBMITTED their dates take part (drafts and placeholders
 * never count). A day without an entry counts as «geht» for them.
 *   x = number of «Geht» · n = number of participants · «Zur Not» does not count in x, only half
 *   in the intensity (score) and through ◐ · ✓ «Alle: Geht» exactly when x = n ≥ 1.
 */

export interface Participant {
  /** Stable key (never shown). */
  id: string;
  /** Days marked «Geht nicht». */
  no: ReadonlySet<IsoDate>;
  /** Days marked «Zur Not». */
  maybe: ReadonlySet<IsoDate>;
}

export type HeatLevel = "nodata" | "none" | "few" | "some" | "many" | "all";

/** Intensity levels of the «Indigo-Rampe» in ascending order (legend, tests). */
export const HEAT_LEVELS: readonly HeatLevel[] = ["nodata", "none", "few", "some", "many", "all"];

export interface DayTally {
  /** Participant ids per state, in participant order. */
  yes: string[];
  maybe: string[];
  no: string[];
  /** x = «Geht» count. */
  x: number;
  /** n = participants (submitted, not hidden). */
  n: number;
  /** (geht + ½ · zur Not) / n – 0 when n = 0. */
  score: number;
  level: HeatLevel;
  /** ✓ «Alle: Geht» (x = n ≥ 1). Never together with `anyMaybe`. */
  allYes: boolean;
  /** ◐ at least one «Zur Not». */
  anyMaybe: boolean;
  /** Nobody has «Geht nicht» (n ≥ 1) – the day fits «Alle dabei» (F-009). */
  noneBlocked: boolean;
}

/** Level of a day from its counts (design-system §6.2 thresholds). */
export function heatLevel(yes: number, maybe: number, n: number): HeatLevel {
  if (n <= 0) return "nodata";
  if (yes === n) return "all";
  const score = (yes + maybe / 2) / n;
  if (score <= 0) return "none";
  if (score < 0.5) return "few";
  if (score < 0.75) return "some";
  return "many";
}

export function tallyDay(date: IsoDate, participants: readonly Participant[]): DayTally {
  const yes: string[] = [];
  const maybe: string[] = [];
  const no: string[] = [];
  for (const person of participants) {
    if (person.no.has(date)) no.push(person.id);
    else if (person.maybe.has(date)) maybe.push(person.id);
    else yes.push(person.id);
  }
  const n = participants.length;
  const x = yes.length;
  return {
    yes,
    maybe,
    no,
    x,
    n,
    score: n === 0 ? 0 : (x + maybe.length / 2) / n,
    level: heatLevel(x, maybe.length, n),
    allYes: n > 0 && x === n,
    anyMaybe: maybe.length > 0,
    noneBlocked: n > 0 && no.length === 0,
  };
}

/**
 * Count shown in the cell (ux-spec §4.9): «x/n» – on phones only «x» from n ≥ 10 (n stands in
 * the KPI box); «–» without data.
 */
export function cellCount(tally: Pick<DayTally, "x" | "n">, compact: boolean): string {
  if (tally.n === 0) return "–";
  return compact && tally.n >= 10 ? String(tally.x) : `${String(tally.x)}/${String(tally.n)}`;
}

/** Day-detail summary (U-4): ✓ all · ◐ everyone's in, k only if needed · ✕ who can't. */
export type DaySummary =
  | { kind: "nodata" }
  | { kind: "all" }
  | { kind: "maybe"; count: number }
  | { kind: "no"; ids: string[] };

export function daySummary(tally: DayTally): DaySummary {
  if (tally.n === 0) return { kind: "nodata" };
  if (tally.allYes) return { kind: "all" };
  if (tally.noneBlocked) return { kind: "maybe", count: tally.maybe.length };
  return { kind: "no", ids: tally.no };
}

/** Builds participants from stored entries (`[day, state]` pairs per member). */
export function toParticipant(
  id: string,
  entries: readonly (readonly [IsoDate, "no" | "maybe"])[],
): Participant {
  const no = new Set<IsoDate>();
  const maybe = new Set<IsoDate>();
  for (const [day, state] of entries) (state === "no" ? no : maybe).add(day);
  return { id, no, maybe };
}
