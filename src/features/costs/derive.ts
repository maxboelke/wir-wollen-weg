import { computeBalances, settleUp, type Transfer } from "@/lib/costs";
import type { CostExpenseView, CostPersonView, CostsModel } from "./load";

/**
 * Client-safe derivations of the cost model (W19 D): balances and the proposal from the
 * effective data (server data ± optimistic steps), name helpers. Same pure functions as the
 * server (src/lib/costs.ts) – the server stays the truth after every refresh.
 */

export interface EffectiveSettlement {
  /** Server id – or a temporary id while the server has not answered yet. */
  id: string;
  from: string;
  to: string;
  cents: number;
}

export function balancesFor(
  model: Pick<CostsModel, "people">,
  expenses: readonly CostExpenseView[],
  settlements: readonly EffectiveSettlement[],
): Map<string, number> {
  return computeBalances(
    model.people.map((p) => p.key),
    expenses.map((e) => ({ payer: e.payer, amountCents: e.amountCents, shares: e.shares })),
    settlements.map((s) => ({ from: s.from, to: s.to, cents: s.cents })),
  );
}

export function proposalFor(
  model: Pick<CostsModel, "people">,
  balances: ReadonlyMap<string, number>,
): Transfer[] {
  return settleUp(
    model.people.map((p) => ({ id: p.key, seq: p.seq, cents: balances.get(p.key) ?? 0 })),
  );
}

export const rowKey = (t: { from: string; to: string }) => `${t.from}->${t.to}`;

/**
 * Sections of «Ausgleichen» (W19 E.5): the viewer's own transfers – out (I pay) and in (I get;
 * `settleUp` lets a person only pay OR receive, so one of both is empty) –, the rows only the
 * organiser may mark (no account on either side, block 5) and everybody else's (block 6), each
 * in proposal order.
 */
export function settleSections(
  transfers: readonly Transfer[],
  me: string,
  people: readonly Pick<CostPersonView, "key" | "account">[],
) {
  const account = new Map(people.map((p) => [p.key, p.account]));
  const orgaOnly = (t: Transfer) => !account.get(t.from) && !account.get(t.to);
  const others = transfers.filter((t) => t.from !== me && t.to !== me);
  return {
    out: transfers.filter((t) => t.from === me),
    in: transfers.filter((t) => t.to === me),
    orga: others.filter(orgaOnly),
    others: others.filter((t) => !orgaOnly(t)),
  };
}

/** «Dein Stand» with its way of working it out (W19 E.4) – all in cents of the trip currency. */
export interface StandNumbers {
  /** «Du hast für die Gruppe ausgelegt». */
  paid: number;
  /** «Auf dich entfällt» – the viewer's parts of all expenses. */
  share: number;
  /** «Schon zurückgezahlt» – settlements the viewer sent. */
  sent: number;
  /** «Schon zurückbekommen» – settlements the viewer received. */
  received: number;
  /** paid − share + sent − received: > 0 gets back, < 0 pays back (= the balance). */
  balance: number;
}

export function standOf(
  me: string,
  expenses: readonly Pick<CostExpenseView, "payer" | "amountCents" | "shares">[],
  settlements: readonly Pick<EffectiveSettlement, "from" | "to" | "cents">[],
): StandNumbers {
  let paid = 0;
  let share = 0;
  for (const e of expenses) {
    if (e.payer === me) paid += e.amountCents;
    share += e.shares.find((s) => s.party === me)?.cents ?? 0;
  }
  let sent = 0;
  let received = 0;
  for (const s of settlements) {
    if (s.from === me) sent += s.cents;
    if (s.to === me) received += s.cents;
  }
  return { paid, share, sent, received, balance: paid - share + sent - received };
}

/** «An Lena.» · «An Lena und Kemal.» · «An 3 Personen.» – at most two names (W19 E.4). */
export function shortNames(
  names: readonly string[],
  locale: string,
): { kind: "names"; names: string } | { kind: "count"; count: number } {
  if (names.length > 2) return { kind: "count", count: names.length };
  return {
    kind: "names",
    names: new Intl.ListFormat(locale, { type: "conjunction" }).format(names),
  };
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

/**
 * Name of a person: «Lena», «Mia», «Ehemaliges Mitglied 2» (capital at the start of a line or
 * sentence) / «ehemaliges Mitglied 2» (inside a sentence). The viewer as «Du» when `you`.
 */
export function personLabel(
  person: CostPersonView | undefined,
  t: Translate,
  options: { inline?: boolean; you?: boolean } = {},
): string {
  if (person?.me && options.you) return t("you");
  if (person?.name) return person.name;
  const no = person?.formerNo ?? null;
  if (options.inline) return no === null ? t("formerInline") : t("formerInlineNo", { n: no });
  return no === null ? t("former") : t("formerNo", { n: no });
}

/** Day groups of the list (newest first, already ordered by the server). */
export function dayGroups(expenses: readonly CostExpenseView[]) {
  const groups: { date: string; items: CostExpenseView[]; sum: number }[] = [];
  for (const e of expenses) {
    const last = groups[groups.length - 1];
    if (last?.date === e.date) {
      last.items.push(e);
      last.sum += e.amountCents;
    } else {
      groups.push({ date: e.date, items: [e], sum: e.amountCents });
    }
  }
  return groups;
}
