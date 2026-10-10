import { addDays, diffDays, isIsoDate, type IsoDate } from "./dates";
import type { Participant } from "./heatmap";

/**
 * Vote logic (F-010, F-011, F-012; Flow D; W10/W11) – pure functions shared by the server
 * (validation, the visibility rule Q13 a) and the client (rank, status line), so the rules
 * have one tested source of truth.
 */

export type VoteChoice = "yes" | "maybe" | "no";
export const VOTE_CHOICES: readonly VoteChoice[] = ["yes", "maybe", "no"];

export function isVoteChoice(value: unknown): value is VoteChoice {
  return value === "yes" || value === "maybe" || value === "no";
}

/** 2–6 options per vote (F-010, ux-spec §5.2). */
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
/** Upper limit of nights of one option – the search range is the real bound. */
export const MAX_OPTION_NIGHTS = 60;

export interface Period {
  start: IsoDate;
  end: IsoDate;
}

export function periodKey(period: Period): string {
  return `${period.start}/${period.end}`;
}

export function nightsOf(period: Period): number {
  return diffDays(period.start, period.end);
}

// ---------------------------------------------------------------------------
// F-010: options
// ---------------------------------------------------------------------------

export interface OptionRules {
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  minNights: number;
  /** Earliest arrival day (the server allows one day before its own today, time zones). */
  today: IsoDate;
}

export type OptionProblem =
  "invalid" | "outsideRange" | "past" | "tooShort" | "tooLong" | "duplicate";

/**
 * One option: real dates, end after start, inside the search range, not in the past, at
 * least the trip's minimum number of nights («Mindestdauer», F-001/F-009).
 */
export function checkOption(value: unknown, rules: OptionRules): OptionProblem | null {
  if (typeof value !== "object" || value === null) return "invalid";
  const { start, end } = value as Partial<Period>;
  if (!isIsoDate(start) || !isIsoDate(end) || end <= start) return "invalid";
  if (start < rules.rangeStart || end > rules.rangeEnd) return "outsideRange";
  if (start < rules.today) return "past";
  const nights = diffDays(start, end);
  if (nights < Math.max(1, rules.minNights)) return "tooShort";
  if (nights > MAX_OPTION_NIGHTS) return "tooLong";
  return null;
}

export type OptionsCheck =
  { ok: true; options: Period[] } | { ok: false; reason: "count" | OptionProblem; index?: number };

/** The full list when starting a vote: 2–6 valid options without duplicates. */
export function checkOptions(
  value: unknown,
  rules: OptionRules,
  { min = MIN_OPTIONS, max = MAX_OPTIONS }: { min?: number; max?: number } = {},
): OptionsCheck {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    return { ok: false, reason: "count" };
  }
  const seen = new Set<string>();
  const options: Period[] = [];
  for (const [index, item] of (value as unknown[]).entries()) {
    const problem = checkOption(item, rules);
    if (problem) return { ok: false, reason: problem, index };
    const period = { start: (item as Period).start, end: (item as Period).end };
    const key = periodKey(period);
    if (seen.has(key)) return { ok: false, reason: "duplicate", index };
    seen.add(key);
    options.push(period);
  }
  return { ok: true, options };
}

/** Optional voting deadline (F-017): empty = none; otherwise a date from today on. */
export function checkDeadline(
  value: unknown,
  today: IsoDate,
): { ok: true; deadline: IsoDate | null } | { ok: false } {
  if (value === null || value === undefined || value === "") return { ok: true, deadline: null };
  if (!isIsoDate(value) || value < today) return { ok: false };
  return { ok: true, deadline: value };
}

/** A suggestion span (F-009) as a concrete option in the wished length (F-010 Vorauswahl). */
export function concreteWindow(span: Period, nights: number): Period {
  const length = Math.max(1, Math.min(Math.floor(nights), nightsOf(span)));
  return { start: span.start, end: addDays(span.start, length) };
}

/**
 * «‹ früher / später ›» (Flow D.1 #1): shifts the option by one day inside its span; returns
 * null at the edge. «Nächte −/+» keeps the arrival day and stays inside the span.
 */
export function shiftWindow(option: Period, span: Period, direction: 1 | -1): Period | null {
  const start = addDays(option.start, direction);
  const end = addDays(option.end, direction);
  if (start < span.start || end > span.end) return null;
  return { start, end };
}

export function resizeWindow(option: Period, span: Period, nights: number): Period | null {
  if (nights < 1) return null;
  const end = addDays(option.start, nights);
  if (end > span.end) return null;
  return { start: option.start, end };
}

export interface OptionAvailability {
  /** Ids of participants without «Geht nicht» in the period («können», glossary). */
  can: string[];
  /** Ids with at least one «Geht nicht» day («⚠ Jonas kann nicht»). */
  cannot: string[];
  /** «◐ 2× zur Not»: «Zur Not» person-days of the people who can. */
  maybeDays: number;
}

/** «laut Kalender: 7 können · ohne Jonas» (F-010 «Jede Option zeigt, wer … kann/nicht kann»). */
export function optionAvailability(
  period: Period,
  participants: readonly Participant[],
): OptionAvailability {
  const can: string[] = [];
  const cannot: string[] = [];
  let maybeDays = 0;
  for (const person of participants) {
    let blocked = false;
    let maybe = 0;
    for (let day = period.start; day <= period.end; day = addDays(day, 1)) {
      if (person.no.has(day)) {
        blocked = true;
        break;
      }
      if (person.maybe.has(day)) maybe++;
    }
    if (blocked) cannot.push(person.id);
    else {
      can.push(person.id);
      maybeDays += maybe;
    }
  }
  return { can, cannot, maybeDays };
}

// ---------------------------------------------------------------------------
// F-011: voting
// ---------------------------------------------------------------------------

/**
 * Pre-filled answer from the own days (F-011): a «Geht nicht» day → «Nein», a «Zur Not» day →
 * «Vielleicht», otherwise no suggestion. Only a suggestion – it counts once confirmed.
 */
export function suggestedChoice(
  period: Period,
  own: { no: ReadonlySet<IsoDate>; maybe: ReadonlySet<IsoDate> },
): VoteChoice | null {
  let maybe = false;
  for (let day = period.start; day <= period.end; day = addDays(day, 1)) {
    if (own.no.has(day)) return "no";
    if (own.maybe.has(day)) maybe = true;
  }
  return maybe ? "maybe" : null;
}

export interface Tally {
  yes: number;
  maybe: number;
  no: number;
}

export interface VoteRow {
  optionId: string;
  userId: string;
  choice: VoteChoice;
}

export function tallyOf(votes: readonly Pick<VoteRow, "choice">[]): Tally {
  const tally: Tally = { yes: 0, maybe: 0, no: 0 };
  for (const vote of votes) tally[vote.choice]++;
  return tally;
}

/** Rank order (F-011): (1) more «Ja», (2) more «Vielleicht», (3) fewer «Nein». */
export function compareTallies(a: Tally, b: Tally): number {
  if (a.yes !== b.yes) return b.yes - a.yes;
  if (a.maybe !== b.maybe) return b.maybe - a.maybe;
  return a.no - b.no;
}

export function sameTally(a: Tally, b: Tally): boolean {
  return compareTallies(a, b) === 0;
}

/**
 * Option ids in rank order (stable: equal tallies keep the creation order) and the ids on
 * place 1 – several on a tie («Platz 1» for all of them, U-9). No votes at all: no place 1.
 */
export function rankOptions(options: readonly { id: string; tally: Tally }[]): {
  order: string[];
  top: string[];
} {
  const sorted = options
    .map((option, index) => ({ option, index }))
    .sort((a, b) => compareTallies(a.option.tally, b.option.tally) || a.index - b.index)
    .map((entry) => entry.option);
  const first = sorted[0];
  if (!first || first.tally.yes + first.tally.maybe + first.tally.no === 0) {
    return { order: sorted.map((o) => o.id), top: [] };
  }
  return {
    order: sorted.map((o) => o.id),
    top: sorted.filter((o) => sameTally(o.tally, first.tally)).map((o) => o.id),
  };
}

/** Status «abgestimmt» (F-007/F-011, Flow D.2 #4): a confirmed answer on EVERY option. */
export function hasVotedAll(optionIds: readonly string[], ownVotes: ReadonlySet<string>): boolean {
  return optionIds.length > 0 && optionIds.every((id) => ownVotes.has(id));
}

export interface PollOptionData extends Period {
  id: string;
}

export interface OptionResult {
  tally: Tally;
  /** Names per answer – «Nach der eigenen Stimme sind Stimmen namentlich sichtbar». */
  names: Record<VoteChoice, string[]>;
}

export interface ViewerOption extends PollOptionData {
  /** Own confirmed answer or null. */
  mine: VoteChoice | null;
  /** Result – only present when the viewer may see it (Q13 a), otherwise null. */
  result: OptionResult | null;
}

export interface ViewerPoll {
  options: ViewerOption[];
  /** Place-1 ids – only when the viewer may see every result (else it would leak). */
  top: string[];
  /** Rank order – same condition as `top`. */
  order: string[] | null;
}

/**
 * Who sees every result (Q13 a): the organiser, and everybody once the dates are fixed – the
 * STORED phase decides. A vote that simply ran out of time (derived «past» without fixed
 * dates) never unlocks the results for members (R-055).
 */
export function seesAllResults(input: {
  isOrganizer: boolean;
  storedPhase: "collecting" | "voting" | "fixed";
}): boolean {
  return input.isOrganizer || input.storedPhase === "fixed";
}

/**
 * Position of an option relative to the CURRENT search range (ux-spec §13.1 b – the range may
 * change while options and votes stay): "inside", "partly" (overlaps) or "outside".
 */
export function periodInRange(
  period: Period,
  range: { rangeStart: IsoDate; rangeEnd: IsoDate },
): "inside" | "partly" | "outside" {
  if (period.start >= range.rangeStart && period.end <= range.rangeEnd) return "inside";
  if (period.end < range.rangeStart || period.start > range.rangeEnd) return "outside";
  return "partly";
}

/**
 * Q13 a (F-011), enforced on the server: the result of an option (counts AND names) only
 * leaves the server when the viewer has answered THIS option, is the organiser, or the dates
 * are fixed («Nach Festlegung sehen alle Mitglieder das vollständige Ergebnis»). Rank and
 * «Platz 1» need all results, so they are only shown once every result is visible.
 */
export function pollForViewer(input: {
  options: readonly PollOptionData[];
  votes: readonly VoteRow[];
  names: ReadonlyMap<string, string>;
  viewerId: string;
  seeAll: boolean;
}): ViewerPoll {
  const byOption = new Map<string, VoteRow[]>();
  for (const vote of input.votes) {
    const list = byOption.get(vote.optionId) ?? [];
    list.push(vote);
    byOption.set(vote.optionId, list);
  }
  const full = input.options.map((option) => {
    const votes = byOption.get(option.id) ?? [];
    const names: Record<VoteChoice, string[]> = { yes: [], maybe: [], no: [] };
    for (const vote of votes) names[vote.choice].push(input.names.get(vote.userId) ?? "?");
    for (const choice of VOTE_CHOICES) names[choice].sort((a, b) => a.localeCompare(b));
    const mine = votes.find((vote) => vote.userId === input.viewerId)?.choice ?? null;
    return { option, mine, result: { tally: tallyOf(votes), names } };
  });
  const options: ViewerOption[] = full.map(({ option, mine, result }) => ({
    ...option,
    mine,
    result: input.seeAll || mine !== null ? result : null,
  }));
  const allVisible = options.every((option) => option.result !== null);
  if (!allVisible) return { options, top: [], order: null };
  const { order, top } = rankOptions(
    options.map((option) => ({ id: option.id, tally: option.result?.tally ?? tallyOf([]) })),
  );
  return { options, top, order };
}

/**
 * Card order on opening the tab (Flow D.2 #6, W10-08): creation order while the viewer has
 * not answered everything (no jumping cards), afterwards by rank. Never re-sorted while the
 * page is open – the client keeps this order.
 */
export function initialOrder(poll: ViewerPoll): string[] {
  const created = poll.options.map((option) => option.id);
  const votedAll = poll.options.every((option) => option.mine !== null);
  return votedAll && poll.order ? poll.order : created;
}

// ---------------------------------------------------------------------------
// F-012: fixing
// ---------------------------------------------------------------------------

/**
 * Pre-selection in «Termin festlegen» (W11): place 1, unless several share it – then the
 * organiser has to choose actively (null).
 */
export function preselectWinner(top: readonly string[]): string | null {
  return top.length === 1 ? (top[0] ?? null) : null;
}

export type Countdown =
  { kind: "days"; count: number } | { kind: "today" } | { kind: "during" } | { kind: "past" };

/** «noch 23 Tage» · «noch 1 Tag» · «Heute geht's los!» · «Gute Reise!» (W11, D-24). */
export function countdown(period: Period, today: IsoDate): Countdown {
  if (today < period.start) return { kind: "days", count: diffDays(today, period.start) };
  if (today === period.start) return { kind: "today" };
  if (today <= period.end) return { kind: "during" };
  return { kind: "past" };
}

/** Minimum fill of the «Vorfreude» ring – it never looks empty (design-system §9.12). */
export const RING_MIN_PERCENT = 4;

/**
 * Fill of the «Vorfreude» ring in % (design-system §9.12): the part of the anticipation time
 * (fixed → arrival) that has passed, at least 4 %, 100 % from the arrival day on.
 */
export function ringPercent(fixedOn: IsoDate, start: IsoDate, today: IsoDate): number {
  const total = diffDays(fixedOn, start);
  if (total <= 0 || today >= start) return 100;
  const passed = Math.max(0, diffDays(fixedOn, today));
  const percent = (passed / total) * 100;
  return Math.round(Math.min(100, Math.max(RING_MIN_PERCENT, percent)) * 10) / 10;
}

/**
 * The celebration «Es geht los!» (F-012, Q17 b) is due when the member has not seen it for
 * THIS fixed range – once per person and fixing; the same range fixed again does not count.
 */
export function celebrationDue(
  fixed: Period | null,
  celebratedFor: string | null | undefined,
): boolean {
  return fixed !== null && celebratedFor !== periodKey(fixed);
}
