import { computeBalances, ownRowsFirst, settleUp, type Transfer } from "@/lib/costs";
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

/** «Deine Ausgleiche» (debts first, then claims) and «Weitere Ausgleiche» (W19 D.7). */
export function splitRows(transfers: readonly Transfer[], me: string) {
  const ordered = ownRowsFirst(transfers, me);
  return {
    yours: ordered.filter((t) => t.from === me || t.to === me),
    others: ordered.filter((t) => t.from !== me && t.to !== me),
  };
}

/** Everybody in balances: active people (also 0) + former members ≠ 0; me first, then seq. */
export function balanceRows(
  people: readonly CostPersonView[],
  balances: ReadonlyMap<string, number>,
): CostPersonView[] {
  return people
    .filter((p) => p.active || (balances.get(p.key) ?? 0) !== 0)
    .sort((a, b) => (a.me ? -1 : b.me ? 1 : a.seq - b.seq));
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
