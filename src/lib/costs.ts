import { addDays, type IsoDate } from "./dates";
import { parsePrice } from "./stays";
import { cleanInfoText, textLength } from "./trip-info";

/**
 * Cost splitting (F-035 + F-036 stage 1, Increment 10 – features.md R.8, W19 D). Pure: shared
 * by the form (client), the Server Actions (server), the cockpit adapter and the tests.
 *
 * Money is ALWAYS an integer number of cents (smallest unit of the trip currency) – never a
 * float (R.8 rule 1). Sums over many expenses stay far below 2^53.
 */

/** Limits (R.8 rules 2, I10-02, I10-07) – the database checks the same numbers (migration 0011). */
export const COST_LIMITS = {
  /** 1 000 000,00 in the trip currency (like the price of a place to stay). */
  amountMaxCents: 100_000_000,
  title: 60,
  /** Optional note per expense (CEO 2026-10-23, W19 D.5.1). */
  note: 200,
  /** «Anderer Weg» of the payment details. */
  payNote: 100,
  ibanMax: 34,
  /** Technical cap against abuse (not communicated as a limit, Q36). */
  perTrip: 10_000,
  /** List page size (W19 D.4.1). */
  pageSize: 100,
} as const;

/** Counters appear from these lengths on (W19 D.5.1 / D.8.4). */
export const COST_TITLE_COUNTER_FROM = 50;
export const COST_NOTE_COUNTER_FROM = 160;
export const PAY_NOTE_COUNTER_FROM = 80;

export const COST_CATEGORIES = ["accommodation", "travel", "food", "activities", "other"] as const;
export type CostCategory = (typeof COST_CATEGORIES)[number];

export const SPLIT_MODES = ["equal", "amounts"] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

/** Allowed trip currencies (R.8 rule 8) – exactly those of `currencyForCountry()`. */
export const COST_CURRENCIES = [
  "EUR",
  "GBP",
  "CHF",
  "USD",
  "DKK",
  "SEK",
  "NOK",
  "PLN",
  "CZK",
  "HUF",
  "CAD",
  "AUD",
] as const;
export type CostCurrency = (typeof COST_CURRENCIES)[number];

export function isCostCurrency(value: unknown): value is CostCurrency {
  return typeof value === "string" && (COST_CURRENCIES as readonly string[]).includes(value);
}

/** Threshold of task A1 in whole units (R.8 rule 7, ≈ 50 €). */
const THRESHOLD_UNITS: Record<CostCurrency, number> = {
  EUR: 50,
  USD: 50,
  GBP: 50,
  CHF: 50,
  CAD: 50,
  AUD: 50,
  DKK: 500,
  SEK: 500,
  NOK: 500,
  PLN: 200,
  CZK: 1_250,
  HUF: 20_000,
};

/** A1 threshold in cents; unknown currencies fall back to 50 units. */
export function debtThresholdCents(currency: string): number {
  return (isCostCurrency(currency) ? THRESHOLD_UNITS[currency] : 50) * 100;
}

/** Order of the currency sheet (W19 D.4.4): the current one first, then the fixed order. */
export function currencyChoices(current: string): string[] {
  return [current, ...COST_CURRENCIES.filter((c) => c !== current)];
}

/* ------------------------------------------------------------------------------------------ */
/* Amounts                                                                                      */
/* ------------------------------------------------------------------------------------------ */

export type AmountError = "amountMissing" | "amountFormat" | "amountMax";
export type AmountCheck = { ok: true; cents: number } | { ok: false; error: AmountError };

/**
 * Amount as typed (W19 D.5.2): the price parser of I9-02 with its extension («12.50» on DE),
 * required, > 0, ≤ 1 000 000, at most two decimals (never rounded).
 */
export function parseAmount(input: unknown, locale: string): AmountCheck {
  const parsed = parsePrice(typeof input === "string" ? input : input == null ? "" : input, locale);
  if (!parsed.ok)
    return { ok: false, error: parsed.error === "priceMax" ? "amountMax" : "amountFormat" };
  if (parsed.cents === null) return { ok: false, error: "amountMissing" };
  return { ok: true, cents: parsed.cents };
}

/** Optional amount of one person in «Nach Beträgen» (empty = 0 = not included). */
export function parseShareAmount(
  input: unknown,
  locale: string,
): AmountCheck | { ok: true; cents: 0 } {
  if (typeof input !== "string" || input.trim() === "") return { ok: true, cents: 0 };
  const parsed = parseAmount(input, locale);
  return parsed;
}

/** Amount for the edit field: «1840,50» / «1840.50» – no grouping, always two decimals. */
export function amountInput(cents: number, locale: string): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${String(whole)}${locale.startsWith("de") ? "," : "."}${fraction}`;
}

/** Exact amount for balances/settling up – the shared formatter of src/lib/money.ts. */
export { formatMoneyExact as formatExact } from "./money";

/* ------------------------------------------------------------------------------------------ */
/* Splitting (R.8 rules 3–4)                                                                    */
/* ------------------------------------------------------------------------------------------ */

export interface PartyRef {
  id: string;
  /** Fixed order in the trip (creation order) – rest cents and ties. */
  seq: number;
}

export interface Share {
  party: string;
  cents: number;
}

const bySeq = (a: PartyRef, b: PartyRef) =>
  a.seq - b.seq || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * «Gleich»: base = ⌊amount ÷ n⌋, rest r = amount − n × base; the FIRST r participants in fixed
 * order (seq ascending) get one cent more. 100,00 on 3 → 33,34 · 33,33 · 33,33. The result is in
 * seq order; the sum always equals the amount exactly.
 */
export function splitEqual(amountCents: number, parties: readonly PartyRef[]): Share[] {
  const sorted = [...parties].sort(bySeq);
  const n = sorted.length;
  if (n === 0) return [];
  const base = Math.floor(amountCents / n);
  const rest = amountCents - base * n;
  return sorted.map((p, i) => ({ party: p.id, cents: base + (i < rest ? 1 : 0) }));
}

/** The parties paying one cent more in an equal split (W19 D.5.3 live line). */
export function extraCentParties(amountCents: number, parties: readonly PartyRef[]): string[] {
  const n = parties.length;
  if (n === 0) return [];
  const rest = amountCents - Math.floor(amountCents / n) * n;
  return [...parties]
    .sort(bySeq)
    .slice(0, rest)
    .map((p) => p.id);
}

/** «Noch 12,00 € zu verteilen» (> 0) / «3,00 € zu viel verteilt» (< 0) / passt (0). */
export function remainderCents(amountCents: number, shares: readonly { cents: number }[]): number {
  return amountCents - shares.reduce((sum, s) => sum + s.cents, 0);
}

/**
 * «Auf leere Felder verteilen» (W19 D.5.3): the rest goes equally to the empty fields, rest
 * cents by fixed order. Returns the new amounts of the empty fields only.
 */
export function fillEmpty(restCents: number, empty: readonly PartyRef[]): Share[] {
  if (restCents <= 0) return [];
  return splitEqual(restCents, empty);
}

/* ------------------------------------------------------------------------------------------ */
/* Balances and settling up (R.8 «Begriffe», rules 5–6)                                         */
/* ------------------------------------------------------------------------------------------ */

export interface ExpenseInput {
  payer: string;
  amountCents: number;
  shares: readonly Share[];
  /** Soft-deleted expenses never count (rule 5). */
  deleted?: boolean;
}

export interface SettlementInput {
  from: string;
  to: string;
  cents: number;
}

/**
 * Balance per party = paid − own shares + settlements sent − settlements received. Positive =
 * «bekommt», negative = «schuldet». Every party of `parties` is in the result (also 0); unknown
 * ids in expenses are added. The sum of all balances is 0 (invariant, tests).
 */
export function computeBalances(
  parties: readonly string[],
  expenses: readonly ExpenseInput[],
  settlements: readonly SettlementInput[],
): Map<string, number> {
  const balances = new Map<string, number>(parties.map((id) => [id, 0]));
  const add = (id: string, cents: number) => balances.set(id, (balances.get(id) ?? 0) + cents);
  for (const expense of expenses) {
    if (expense.deleted) continue;
    add(expense.payer, expense.amountCents);
    for (const share of expense.shares) add(share.party, -share.cents);
  }
  for (const s of settlements) {
    add(s.from, s.cents);
    add(s.to, -s.cents);
  }
  return balances;
}

/**
 * Stored shares grouped by expense in ONE pass (R.8 rule 6f). A `filter` per expense is
 * quadratic: 10 000 expenses with 30 people each took ~30 s instead of milliseconds.
 */
export function sharesByExpense(
  rows: readonly { expenseId: string; partyId: string; shareCents: number }[],
): Map<string, Share[]> {
  const grouped = new Map<string, Share[]>();
  for (const row of rows) {
    const share = { party: row.partyId, cents: row.shareCents };
    const list = grouped.get(row.expenseId);
    if (list) list.push(share);
    else grouped.set(row.expenseId, [share]);
  }
  return grouped;
}

export interface Transfer {
  from: string;
  to: string;
  cents: number;
}

interface Open {
  id: string;
  seq: number;
  cents: number;
}

const openOrder = (a: Open, b: Open) =>
  b.cents - a.cents || a.seq - b.seq || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Settle-up proposal (R.8 rule 6 – «exakte Paare + Greedy»): deterministic and independent of
 * the input order.
 * a. Only parties with a balance ≠ 0; debtors and creditors each by amount descending, ties by
 *    seq ascending.
 * b. Exact pairs: every debtor (in that order) pays the first creditor with exactly the same
 *    amount.
 * c. Greedy: the biggest debtor pays the biggest creditor the smaller of both; re-sort, repeat.
 * At most (parties with balance ≠ 0) − 1 transfers; everybody only pays or only receives.
 * The input must sum to 0 (otherwise the leftover stays unsettled).
 */
export function settleUp(
  balances: readonly { id: string; seq: number; cents: number }[],
): Transfer[] {
  let debtors: Open[] = balances
    .filter((b) => b.cents < 0)
    .map((b) => ({ id: b.id, seq: b.seq, cents: -b.cents }))
    .sort(openOrder);
  let creditors: Open[] = balances
    .filter((b) => b.cents > 0)
    .map((b) => ({ ...b }))
    .sort(openOrder);
  const transfers: Transfer[] = [];

  // b. exact pairs
  const pairedDebtors = new Set<string>();
  const pairedCreditors = new Set<string>();
  for (const debtor of debtors) {
    const match = creditors.find((c) => !pairedCreditors.has(c.id) && c.cents === debtor.cents);
    if (!match) continue;
    transfers.push({ from: debtor.id, to: match.id, cents: debtor.cents });
    pairedDebtors.add(debtor.id);
    pairedCreditors.add(match.id);
  }
  debtors = debtors.filter((d) => !pairedDebtors.has(d.id));
  creditors = creditors.filter((c) => !pairedCreditors.has(c.id));

  // c. greedy
  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort(openOrder);
    creditors.sort(openOrder);
    const debtor = debtors[0] as Open;
    const creditor = creditors[0] as Open;
    const cents = Math.min(debtor.cents, creditor.cents);
    transfers.push({ from: debtor.id, to: creditor.id, cents });
    debtor.cents -= cents;
    creditor.cents -= cents;
    if (debtor.cents === 0) debtors.shift();
    if (creditor.cents === 0) creditors = creditors.filter((c) => c !== creditor);
  }
  return transfers;
}

/**
 * Server check before booking a settlement (R.8 I10-06, instead of a version): A currently owes,
 * B is currently owed and the amount ≤ min(|balance A|, balance B). Two parallel taps on the
 * same row → exactly one booking (the second sees the new balances).
 */
export function settlementAllowed(
  balances: ReadonlyMap<string, number>,
  from: string,
  to: string,
  cents: number,
): boolean {
  if (from === to || !Number.isSafeInteger(cents) || cents <= 0) return false;
  const a = balances.get(from) ?? 0;
  const b = balances.get(to) ?? 0;
  return a < 0 && b > 0 && cents <= Math.min(-a, b);
}

/* ------------------------------------------------------------------------------------------ */
/* Rights (R.8 table – the server checks the same functions)                                    */
/* ------------------------------------------------------------------------------------------ */

export interface CostViewer {
  userId: string;
  /** Own party in this trip (null: never used in costs yet). */
  partyId: string | null;
  organizer: boolean;
}

/** Edit/delete/restore an expense: creator, payer (own party) or the organiser. */
export function canEditExpense(
  viewer: CostViewer,
  expense: { createdBy: string | null; payerParty: string },
): boolean {
  if (viewer.organizer) return true;
  if (expense.createdBy !== null && expense.createdBy === viewer.userId) return true;
  return viewer.partyId !== null && expense.payerParty === viewer.partyId;
}

export interface SettleSide {
  party: string;
  /** Active member with an account (not a placeholder, not a former member). */
  account: boolean;
}

/**
 * «Als bezahlt/erhalten markieren» (CEO a): the paying or the receiving side; the organiser
 * additionally ONLY when neither side is a member with an account (placeholder/former on both
 * sides) – never for two members with an account.
 */
export function canMarkSettlement(viewer: CostViewer, from: SettleSide, to: SettleSide): boolean {
  if (viewer.partyId !== null && (viewer.partyId === from.party || viewer.partyId === to.party)) {
    return true;
  }
  return viewer.organizer && !from.account && !to.account;
}

/** Take back a settlement: paying side, receiving side, whoever marked it, or the organiser. */
export function canUndoSettlement(
  viewer: CostViewer,
  settlement: { from: string; to: string; markedBy: string | null },
): boolean {
  if (viewer.organizer) return true;
  if (settlement.markedBy !== null && settlement.markedBy === viewer.userId) return true;
  return (
    viewer.partyId !== null &&
    (viewer.partyId === settlement.from || viewer.partyId === settlement.to)
  );
}

/** Who may mark a row – for «Markieren können {a} oder {b}.» (W19 D.8.1). */
export function whoMarks(from: SettleSide, to: SettleSide): "both" | "from" | "to" | "orga" {
  if (from.account && to.account) return "both";
  if (from.account) return "from";
  if (to.account) return "to";
  return "orga";
}

/**
 * How a debtor can be reminded (W16 v2.15, R-082): members with an account → text with the
 * balances link; placeholders → their PERSONAL link, but only for the organiser (F-007) –
 * everyone else gets «{orga} Bescheid geben» (ux-spec §14.2). Never the trip's general invite
 * link: joining through it would create a second person and lose the placeholder's balance.
 * Former members and the viewer themself cannot be reminded.
 */
export function costReminderChannel(
  debtor: { kind: "member" | "placeholder" | "former"; me: boolean } | undefined,
  isOrganizer: boolean,
): "balances" | "personal" | "orga" | null {
  if (!debtor || debtor.kind === "former" || debtor.me) return null;
  if (debtor.kind === "member") return "balances";
  return isOrganizer ? "personal" : "orga";
}

/* ------------------------------------------------------------------------------------------ */
/* IBAN (R.8 I10-07, ISO 13616)                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** IBAN length per country (SEPA countries + GB, CH and further IBAN countries). */
export const IBAN_LENGTHS: Readonly<Record<string, number>> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
};

/** Spaces removed, upper case («de89 3704 …» → «DE893704…»). */
export function normalizeIban(input: string): string {
  return input.replace(/[\s  -]+/g, "").toUpperCase();
}

/** ISO 13616 check digits: move the first four characters to the end, letters → 10–35, mod 97. */
function mod97(iban: string): number {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let rest = 0;
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    const value = code >= 65 ? String(code - 55) : char;
    for (const digit of value) rest = (rest * 10 + Number(digit)) % 97;
  }
  return rest;
}

export type IbanCheck = { ok: true; iban: string } | { ok: false };

/**
 * IBAN validation (R.8 I10-07): normalise; format `^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$`; length
 * matching the country (unknown country → rejected); check digits mod 97 = 1.
 */
export function checkIban(input: unknown): IbanCheck {
  if (typeof input !== "string") return { ok: false };
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) return { ok: false };
  const length = IBAN_LENGTHS[iban.slice(0, 2)];
  if (length === undefined || iban.length !== length) return { ok: false };
  if (mod97(iban) !== 1) return { ok: false };
  return { ok: true, iban };
}

/** «DE89 3704 0044 0532 0130 00» – groups of four. */
export function ibanGroups(iban: string): string[] {
  const clean = normalizeIban(iban);
  const groups: string[] = [];
  for (let i = 0; i < clean.length; i += 4) groups.push(clean.slice(i, i + 4));
  return groups;
}

/**
 * Masked display (R.8 I10-07): country code + check digits + last four, the groups in between
 * as «••••» – «DE89 •••• •••• •••• •••• 3000». The visible end is always the last 4 characters.
 */
export function maskIban(iban: string): { head: string; masked: number; last4: string } {
  const clean = normalizeIban(iban);
  const groups = Math.ceil(clean.length / 4);
  return { head: clean.slice(0, 4), masked: Math.max(0, groups - 2), last4: clean.slice(-4) };
}

/* ------------------------------------------------------------------------------------------ */
/* Texts and form values                                                                        */
/* ------------------------------------------------------------------------------------------ */

/** Single-line text (title, note, «anderer Weg»): control characters removed, spaces collapsed. */
export function cleanCostText(value: unknown): string | null {
  return cleanInfoText(value, false);
}

/** Allowed dates of an expense (R.8 I10-02): arrival − 365 days … departure + 90 days. */
export function expenseDateWindow(start: IsoDate, end: IsoDate): { min: IsoDate; max: IsoDate } {
  return { min: addDays(start, -365), max: addDays(end, 90) };
}

export type ExpenseField = "amount" | "title" | "for" | "split" | "date" | "note" | "payer";
export type ExpenseFieldError =
  | AmountError
  | "titleMissing"
  | "tooLong"
  | "forMissing"
  | "splitSum"
  | "dateMissing"
  | "dateRange"
  | "payer";
export type ExpenseErrors = Partial<Record<ExpenseField, ExpenseFieldError>>;

export interface ExpenseFormInput {
  amount: unknown;
  title: unknown;
  note: unknown;
  category: unknown;
  payer: unknown;
  /** Participants (party keys) – «Für wen?». */
  participants: unknown;
  mode: unknown;
  /** «Nach Beträgen»: party key → typed amount. */
  amounts: unknown;
  date: unknown;
}

export interface ExpenseValues {
  amountCents: number;
  title: string;
  note: string | null;
  category: CostCategory | null;
  payer: string;
  mode: SplitMode;
  /** Shares in seq order – equal: computed; amounts: as typed (0 = not included, dropped). */
  shares: Share[];
  date: IsoDate;
}

export interface ExpenseContext {
  locale: string;
  /** Parties that may be chosen (active ones + former ones already in this expense). */
  parties: readonly PartyRef[];
  /** Parties that may be payer (active + the former payer of this expense, if any). */
  payers: readonly string[];
  window: { min: IsoDate; max: IsoDate };
}

function isDate(value: unknown): value is IsoDate {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

/**
 * Validates an expense (client on blur/submit, server again before saving – R.8 I10-02). The
 * server passes ONLY parties of this trip, so foreign ids are rejected as «nobody selected».
 */
export function validateExpense(
  input: ExpenseFormInput,
  ctx: ExpenseContext,
): { ok: true; values: ExpenseValues } | { ok: false; errors: ExpenseErrors } {
  const errors: ExpenseErrors = {};
  const amount = parseAmount(input.amount, ctx.locale);
  if (!amount.ok) errors.amount = amount.error;
  const title = cleanCostText(input.title);
  if (!title) errors.title = "titleMissing";
  else if (textLength(title) > COST_LIMITS.title) errors.title = "tooLong";
  const note = cleanCostText(input.note);
  if (note && textLength(note) > COST_LIMITS.note) errors.note = "tooLong";
  const category =
    typeof input.category === "string" &&
    (COST_CATEGORIES as readonly string[]).includes(input.category)
      ? (input.category as CostCategory)
      : null;
  const payer =
    typeof input.payer === "string" && ctx.payers.includes(input.payer) ? input.payer : null;
  if (!payer) errors.payer = "payer";
  const known = new Map(ctx.parties.map((p) => [p.id, p]));
  const chosenIds = Array.isArray(input.participants)
    ? [...new Set(input.participants.filter((id): id is string => typeof id === "string"))]
    : [];
  const chosen = chosenIds.map((id) => known.get(id)).filter((p): p is PartyRef => p !== undefined);
  const mode: SplitMode = input.mode === "amounts" ? "amounts" : "equal";
  let date: IsoDate | null = null;
  if (!isDate(input.date)) errors.date = "dateMissing";
  else if (input.date < ctx.window.min || input.date > ctx.window.max) errors.date = "dateRange";
  else date = input.date;

  let shares: Share[] = [];
  if (chosen.length === 0 || chosen.length !== chosenIds.length) {
    errors.for = "forMissing";
  } else if (mode === "equal") {
    if (amount.ok) shares = splitEqual(amount.cents, chosen);
  } else {
    const typed = (
      typeof input.amounts === "object" && input.amounts !== null ? input.amounts : {}
    ) as Record<string, unknown>;
    let bad = false;
    const parsed: Share[] = [];
    for (const p of [...chosen].sort(bySeq)) {
      const value = parseShareAmount(typed[p.id], ctx.locale);
      if (value.ok) parsed.push({ party: p.id, cents: value.cents });
      else bad = true;
    }
    shares = parsed.filter((s) => s.cents > 0);
    if (bad || shares.length === 0 || (amount.ok && remainderCents(amount.cents, shares) !== 0)) {
      errors.split = "splitSum";
    }
  }
  if (Object.keys(errors).length > 0 || !amount.ok || !title || !payer || !date) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    values: { amountCents: amount.cents, title, note, category, payer, mode, shares, date },
  };
}

export type PayInfoErrors = Partial<Record<"iban" | "note", "iban" | "tooLong">>;

/** Payment details (R.8 I10-07): optional checked IBAN + optional «anderer Weg» ≤ 100. */
export function validatePayInfo(input: {
  iban: unknown;
  note: unknown;
}): { ok: true; iban: string | null; note: string | null } | { ok: false; errors: PayInfoErrors } {
  const errors: PayInfoErrors = {};
  const rawIban = typeof input.iban === "string" ? normalizeIban(input.iban) : "";
  let iban: string | null = null;
  if (rawIban !== "") {
    const checked = checkIban(rawIban);
    if (checked.ok) iban = checked.iban;
    else errors.iban = "iban";
  }
  const note = cleanCostText(input.note);
  if (note && textLength(note) > COST_LIMITS.payNote) errors.note = "tooLong";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, iban, note };
}

/* ------------------------------------------------------------------------------------------ */
/* People of the settlement                                                                     */
/* ------------------------------------------------------------------------------------------ */

export interface PartyInfo extends PartyRef {
  kind: "member" | "placeholder" | "former";
  /** Display name (member/placeholder); null for former members. */
  name: string | null;
  userId: string | null;
  formerNo: number | null;
}

/**
 * Numbers of former members (W19 D.10): among the former parties that appear anywhere, in the
 * order they left – «ehemaliges Mitglied 1», «… 2»; only one → no number (null).
 */
export function formerNumbers(
  parties: readonly PartyInfo[],
  relevant: ReadonlySet<string>,
): Map<string, number | null> {
  const formers = parties
    .filter((p) => p.kind === "former" && relevant.has(p.id))
    .sort((a, b) => (a.formerNo ?? Infinity) - (b.formerNo ?? Infinity) || a.seq - b.seq);
  return new Map(formers.map((p, i) => [p.id, formers.length > 1 ? i + 1 : null]));
}

/**
 * Order of people in chips, selects and balances (W19 D.5.1 / I10-05): the viewer first, then
 * by seq. Parties not used yet (no seq) come after in member/placeholder order.
 */
export function viewerFirst<T extends { id: string; seq: number }>(
  items: readonly T[],
  me: string | null,
): T[] {
  return [...items].sort((a, b) => {
    if (a.id === me) return -1;
    if (b.id === me) return 1;
    return a.seq - b.seq;
  });
}

/** Proposal rows: the viewer's rows first (debts before claims), the rest in proposal order. */
export function ownRowsFirst(transfers: readonly Transfer[], me: string | null): Transfer[] {
  const debts = transfers.filter((t) => t.from === me);
  const claims = transfers.filter((t) => t.to === me);
  const others = transfers.filter((t) => t.from !== me && t.to !== me);
  return [...debts, ...claims, ...others];
}
