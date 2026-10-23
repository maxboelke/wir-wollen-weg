import { describe, expect, it } from "vitest";
import {
  amountInput,
  canEditExpense,
  canMarkSettlement,
  canUndoSettlement,
  checkIban,
  computeBalances,
  costReminderChannel,
  COST_CURRENCIES,
  currencyChoices,
  debtThresholdCents,
  expenseDateWindow,
  extraCentParties,
  fillEmpty,
  formatExact,
  formerNumbers,
  ibanGroups,
  maskIban,
  ownRowsFirst,
  parseAmount,
  remainderCents,
  settlementAllowed,
  settleUp,
  sharesByExpense,
  splitEqual,
  validateExpense,
  validatePayInfo,
  viewerFirst,
  whoMarks,
  type ExpenseInput,
  type PartyInfo,
  type SettlementInput,
} from "./costs";
import { currencyForCountry } from "./stays";

/** Small deterministic PRNG (mulberry32) – property tests with a fixed seed. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

const parties = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, seq: i + 1 }));
const sum = (values: readonly { cents: number }[]) => values.reduce((s, v) => s + v.cents, 0);

describe("splitEqual (R.8 rule 3)", () => {
  it("100,00 on 3 → 33,34 · 33,33 · 33,33 (rest cent to the first by seq)", () => {
    expect(splitEqual(10_000, parties(3)).map((s) => s.cents)).toEqual([3334, 3333, 3333]);
  });
  it("10,00 on 3 → 3,34 · 3,33 · 3,33; the extra cent goes by seq, not input order", () => {
    const input = [
      { id: "c", seq: 3 },
      { id: "a", seq: 1 },
      { id: "b", seq: 2 },
    ];
    expect(splitEqual(1_000, input)).toEqual([
      { party: "a", cents: 334 },
      { party: "b", cents: 333 },
      { party: "c", cents: 333 },
    ]);
    expect(extraCentParties(1_000, input)).toEqual(["a"]);
    expect(extraCentParties(1_001, input)).toEqual(["a", "b"]);
    expect(extraCentParties(999, input)).toEqual([]);
  });
  it("1 cent on 3 → 1 · 0 · 0", () => {
    expect(splitEqual(1, parties(3)).map((s) => s.cents)).toEqual([1, 0, 0]);
  });
  it("property: sum of shares = amount for n = 1…30 and 1 … 100 000 000 cents", () => {
    const r = rng(42);
    for (let n = 1; n <= 30; n++) {
      const amounts = [1, n - 1, n, n + 1, 99, 100_000_000, 99_999_999];
      for (let i = 0; i < 40; i++) amounts.push(int(r, 1, 100_000_000));
      for (const amount of amounts.filter((a) => a >= 1)) {
        const shares = splitEqual(amount, parties(n));
        expect(sum(shares)).toBe(amount);
        const values = shares.map((s) => s.cents);
        expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
        expect(values.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
      }
    }
  });
});

describe("remainder and fill (W19 D.5.3)", () => {
  it("live line values", () => {
    expect(remainderCents(6_000, [{ cents: 2_000 }, { cents: 1_000 }])).toBe(3_000);
    expect(remainderCents(6_000, [{ cents: 6_300 }])).toBe(-300);
    expect(remainderCents(6_000, [{ cents: 6_000 }])).toBe(0);
  });
  it("«Auf leere Felder verteilen» splits the rest equally by seq", () => {
    expect(
      fillEmpty(1_000, [
        { id: "x", seq: 5 },
        { id: "y", seq: 2 },
      ]),
    ).toEqual([
      { party: "y", cents: 500 },
      { party: "x", cents: 500 },
    ]);
    expect(fillEmpty(0, parties(2))).toEqual([]);
  });
});

describe("parseAmount (W19 D.5.2)", () => {
  it.each([
    ["12,50", "de", 1_250],
    ["12.50", "de", 1_250],
    ["12.5", "de", 1_250],
    ["1.840", "de", 184_000],
    ["1840,5", "de", 184_050],
    ["12.50", "en", 1_250],
    ["12,50", "en", 1_250],
    ["1,840", "en", 184_000],
    ["0,01", "de", 1],
    ["1.000.000", "de", 100_000_000],
  ])("%s (%s) → %i", (input, locale, cents) => {
    expect(parseAmount(input, locale)).toEqual({ ok: true, cents });
  });
  it.each([
    ["", "de", "amountMissing"],
    [null, "de", "amountMissing"],
    ["12,505", "de", "amountFormat"],
    ["abc", "en", "amountFormat"],
    ["0", "de", "amountFormat"],
    ["-3", "de", "amountFormat"],
    ["1.000.000,01", "de", "amountMax"],
  ])("%s (%s) → %s", (input, locale, error) => {
    expect(parseAmount(input, locale)).toEqual({ ok: false, error });
  });
  it("amountInput round-trips without grouping", () => {
    expect(amountInput(184_050, "de")).toBe("1840,50");
    expect(amountInput(184_000, "en")).toBe("1840.00");
    expect(parseAmount(amountInput(5, "de"), "de")).toEqual({ ok: true, cents: 5 });
  });
  it("formatExact always shows two decimals", () => {
    expect(formatExact(8_600, "EUR", "de-DE")).toBe("86,00\u00a0€");
    expect(formatExact(123_456, "EUR", "en-GB")).toBe("€1,234.56");
    expect(formatExact(5_000, "GBP", "en-GB")).toBe("£50.00");
  });
});

/** Random trip: expenses (some soft-deleted) and settlements following the proposal. */
function randomTrip(r: () => number, n: number) {
  const ps = parties(n);
  const ids = ps.map((p) => p.id);
  const expenses: ExpenseInput[] = [];
  const settlements: SettlementInput[] = [];
  const steps = int(r, 1, 60);
  for (let i = 0; i < steps; i++) {
    const action = r();
    if (action < 0.55 || expenses.length === 0) {
      const chosen = ps.filter(() => r() < 0.7);
      const who = chosen.length > 0 ? chosen : [ps[0] as (typeof ps)[number]];
      const amount = int(r, 1, 500_000);
      let shares;
      if (r() < 0.5) shares = splitEqual(amount, who);
      else {
        // «nach Beträgen»: random cut points, rest to the last
        let left = amount;
        shares = who.map((p, j) => {
          const cents = j === who.length - 1 ? left : int(r, 0, left);
          left -= cents;
          return { party: p.id, cents };
        });
      }
      expenses.push({ payer: ids[int(r, 0, n - 1)] as string, amountCents: amount, shares });
    } else if (action < 0.7) {
      // edit: new amount, equal split
      const index = int(r, 0, expenses.length - 1);
      const old = expenses[index] as ExpenseInput;
      const amount = int(r, 1, 300_000);
      expenses[index] = {
        ...old,
        amountCents: amount,
        shares: splitEqual(
          amount,
          old.shares.map((s) => ps.find((p) => p.id === s.party) as never),
        ),
      };
    } else if (action < 0.8) {
      const index = int(r, 0, expenses.length - 1);
      const old = expenses[index] as ExpenseInput;
      expenses[index] = { ...old, deleted: !old.deleted };
    } else {
      const balances = computeBalances(ids, expenses, settlements);
      const proposal = settleUp(ps.map((p) => ({ ...p, cents: balances.get(p.id) ?? 0 })));
      const pick = proposal[int(r, 0, Math.max(0, proposal.length - 1))];
      if (pick && settlementAllowed(balances, pick.from, pick.to, pick.cents)) {
        settlements.push({ from: pick.from, to: pick.to, cents: pick.cents });
      } else if (settlements.length > 0 && r() < 0.5) {
        settlements.splice(int(r, 0, settlements.length - 1), 1); // undo
      }
    }
  }
  return { ps, ids, expenses, settlements };
}

describe("computeBalances (R.8 «Begriffe»)", () => {
  it("paid − share + sent − received; deleted expenses do not count", () => {
    const b = computeBalances(
      ["a", "b", "c"],
      [
        {
          payer: "a",
          amountCents: 9_000,
          shares: splitEqual(
            9_000,
            parties(3).map((p, i) => ({ ...p, id: "abc"[i] as string })),
          ),
        },
        { payer: "b", amountCents: 5_000, shares: [{ party: "c", cents: 5_000 }], deleted: true },
      ],
      [{ from: "b", to: "a", cents: 3_000 }],
    );
    expect(Object.fromEntries(b)).toEqual({ a: 3_000, b: 0, c: -3_000 });
  });
  it("property: the sum of all balances is 0 after any sequence of add/edit/delete/settle", () => {
    const r = rng(7);
    for (let run = 0; run < 400; run++) {
      const { ids, expenses, settlements } = randomTrip(r, int(r, 1, 30));
      const balances = computeBalances(ids, expenses, settlements);
      expect([...balances.values()].reduce((s, v) => s + v, 0)).toBe(0);
    }
  });
});

describe("settleUp (R.8 rule 6)", () => {
  const bal = (entries: [string, number, number][]) =>
    entries.map(([id, seq, cents]) => ({ id, seq, cents }));

  it("W19 prototype: Lena +64, Kemal +42, Max −86, Mia −22 → exact pair first, then greedy", () => {
    const transfers = settleUp(
      bal([
        ["lena", 1, 6_400],
        ["max", 2, -8_600],
        ["kemal", 3, 4_200],
        ["mia", 6, -2_000],
      ]),
    );
    expect(transfers).toEqual([
      { from: "max", to: "lena", cents: 6_400 },
      { from: "max", to: "kemal", cents: 2_200 },
      { from: "mia", to: "kemal", cents: 2_000 },
    ]);
  });
  it("exact pairs win over greedy", () => {
    const transfers = settleUp(
      bal([
        ["a", 1, -5_000],
        ["b", 2, -3_000],
        ["c", 3, 3_000],
        ["d", 4, 5_000],
      ]),
    );
    expect(transfers).toEqual([
      { from: "a", to: "d", cents: 5_000 },
      { from: "b", to: "c", cents: 3_000 },
    ]);
  });
  it("ties by seq; nothing to do when everybody is square", () => {
    expect(
      settleUp(
        bal([
          ["x", 2, 1_000],
          ["y", 1, 1_000],
          ["z", 3, -2_000],
        ]),
      ),
    ).toEqual([
      { from: "z", to: "y", cents: 1_000 },
      { from: "z", to: "x", cents: 1_000 },
    ]);
    expect(settleUp(bal([["a", 1, 0]]))).toEqual([]);
    expect(settleUp([])).toEqual([]);
  });
  it("property: settles everything, ≤ n−1 transfers, pay XOR receive, order-independent", () => {
    const r = rng(2026);
    for (let run = 0; run < 500; run++) {
      const { ps, ids, expenses, settlements } = randomTrip(r, int(r, 1, 30));
      const balances = computeBalances(ids, expenses, settlements);
      const input = ps.map((p) => ({ ...p, cents: balances.get(p.id) ?? 0 }));
      const transfers = settleUp(input);
      const nonZero = input.filter((b) => b.cents !== 0).length;
      expect(transfers.length).toBeLessThanOrEqual(Math.max(0, nonZero - 1));
      const after = new Map(input.map((b) => [b.id, b.cents]));
      for (const t of transfers) {
        expect(t.cents).toBeGreaterThan(0);
        after.set(t.from, (after.get(t.from) ?? 0) + t.cents);
        after.set(t.to, (after.get(t.to) ?? 0) - t.cents);
      }
      expect([...after.values()].every((v) => v === 0)).toBe(true);
      const payers = new Set(transfers.map((t) => t.from));
      expect(transfers.some((t) => payers.has(t.to))).toBe(false);
      const shuffled = [...input].sort(() => r() - 0.5);
      expect(settleUp(shuffled)).toEqual(transfers);
    }
  });
  it("30 people and 10 000 expenses in well under 100 ms", () => {
    const r = rng(99);
    const ps = parties(30);
    const ids = ps.map((p) => p.id);
    const expenses: ExpenseInput[] = Array.from({ length: 10_000 }, () => {
      const who = ps.filter(() => r() < 0.6);
      const chosen = who.length > 0 ? who : ps;
      const amount = int(r, 1, 100_000);
      return {
        payer: ids[int(r, 0, 29)] as string,
        amountCents: amount,
        shares: splitEqual(amount, chosen),
      };
    });
    const started = performance.now();
    const balances = computeBalances(ids, expenses, []);
    const transfers = settleUp(ps.map((p) => ({ ...p, cents: balances.get(p.id) ?? 0 })));
    const elapsed = performance.now() - started;
    expect(transfers.length).toBeLessThanOrEqual(29);
    expect(elapsed).toBeLessThan(100);
  });
  it("groups stored share rows in one pass – the server path stays under 100 ms (R.8 6f)", () => {
    const r = rng(7);
    const ps = parties(30);
    const ids = ps.map((p) => p.id);
    // Rows as the database returns them: flat, 30 per expense (300 000 rows).
    const rows: { expenseId: string; partyId: string; shareCents: number }[] = [];
    const stored = Array.from({ length: 10_000 }, (_, i) => {
      const amount = int(r, 1, 100_000);
      for (const share of splitEqual(amount, ps)) {
        rows.push({ expenseId: `e${String(i)}`, partyId: share.party, shareCents: share.cents });
      }
      return { id: `e${String(i)}`, payer: ids[int(r, 0, 29)] as string, amount };
    });
    const started = performance.now();
    const grouped = sharesByExpense(rows);
    const balances = computeBalances(
      ids,
      stored.map((e) => ({
        payer: e.payer,
        amountCents: e.amount,
        shares: grouped.get(e.id) ?? [],
      })),
      [],
    );
    const elapsed = performance.now() - started;
    expect(grouped.get("e0")?.length).toBe(30);
    expect([...balances.values()].reduce((sum, v) => sum + v, 0)).toBe(0);
    expect(elapsed).toBeLessThan(100);
  });
});

describe("settlementAllowed (R.8 I10-06)", () => {
  const balances = new Map([
    ["a", -5_000],
    ["b", 3_000],
    ["c", 2_000],
  ]);
  it("accepts up to min(|debt|, claim)", () => {
    expect(settlementAllowed(balances, "a", "b", 3_000)).toBe(true);
    expect(settlementAllowed(balances, "a", "b", 3_001)).toBe(false);
  });
  it("rejects wrong direction, same party, zero, unknown", () => {
    expect(settlementAllowed(balances, "b", "a", 1)).toBe(false);
    expect(settlementAllowed(balances, "a", "a", 1)).toBe(false);
    expect(settlementAllowed(balances, "a", "b", 0)).toBe(false);
    expect(settlementAllowed(balances, "x", "b", 1)).toBe(false);
    expect(settlementAllowed(balances, "a", "b", 1.5)).toBe(false);
  });
  it("a double tap books once: after the first booking the second is refused", () => {
    const after = computeBalances(
      ["a", "b"],
      [{ payer: "b", amountCents: 1_000, shares: [{ party: "a", cents: 1_000 }] }],
      [{ from: "a", to: "b", cents: 1_000 }],
    );
    expect(settlementAllowed(after, "a", "b", 1_000)).toBe(false);
  });
});

describe("thresholds and currencies (R.8 rules 7–8)", () => {
  it("A1 thresholds per currency", () => {
    expect(debtThresholdCents("EUR")).toBe(5_000);
    expect(debtThresholdCents("GBP")).toBe(5_000);
    expect(debtThresholdCents("DKK")).toBe(50_000);
    expect(debtThresholdCents("PLN")).toBe(20_000);
    expect(debtThresholdCents("CZK")).toBe(125_000);
    expect(debtThresholdCents("HUF")).toBe(2_000_000);
  });
  it("allowed currencies = those of currencyForCountry()", () => {
    const fromCountries = new Set(
      ["DE", "GB", "CH", "US", "DK", "SE", "NO", "PL", "CZ", "HU", "CA", "AU"].map(
        currencyForCountry,
      ),
    );
    expect(new Set(COST_CURRENCIES)).toEqual(fromCountries);
    expect(currencyChoices("GBP")[0]).toBe("GBP");
    expect(currencyChoices("GBP")).toHaveLength(12);
  });
});

describe("rights (R.8 table)", () => {
  const member = { userId: "u1", partyId: "p1", organizer: false };
  const orga = { userId: "u9", partyId: "p9", organizer: true };
  it("edit: creator, payer or organiser", () => {
    expect(canEditExpense(member, { createdBy: "u1", payerParty: "p2" })).toBe(true);
    expect(canEditExpense(member, { createdBy: "u2", payerParty: "p1" })).toBe(true);
    expect(canEditExpense(member, { createdBy: "u2", payerParty: "p2" })).toBe(false);
    expect(canEditExpense(member, { createdBy: null, payerParty: "p2" })).toBe(false);
    expect(
      canEditExpense({ ...member, partyId: null }, { createdBy: null, payerParty: "p2" }),
    ).toBe(false);
    expect(canEditExpense(orga, { createdBy: "u2", payerParty: "p2" })).toBe(true);
  });
  it("mark: own side; organiser only when no side has an account (CEO a)", () => {
    const acc = (party: string) => ({ party, account: true });
    const none = (party: string) => ({ party, account: false });
    expect(canMarkSettlement(member, acc("p1"), acc("p2"))).toBe(true);
    expect(canMarkSettlement(member, acc("p2"), acc("p1"))).toBe(true);
    expect(canMarkSettlement(member, acc("p2"), acc("p3"))).toBe(false);
    expect(canMarkSettlement(member, none("p2"), none("p3"))).toBe(false);
    expect(canMarkSettlement(orga, acc("p2"), acc("p3"))).toBe(false);
    expect(canMarkSettlement(orga, none("p2"), acc("p3"))).toBe(false);
    expect(canMarkSettlement(orga, none("p2"), none("p3"))).toBe(true);
    expect(whoMarks(acc("a"), acc("b"))).toBe("both");
    expect(whoMarks(none("a"), acc("b"))).toBe("to");
    expect(whoMarks(acc("a"), none("b"))).toBe("from");
    expect(whoMarks(none("a"), none("b"))).toBe("orga");
  });
  it("undo: either side, who marked it, organiser", () => {
    expect(canUndoSettlement(member, { from: "p1", to: "p2", markedBy: "u5" })).toBe(true);
    expect(canUndoSettlement(member, { from: "p3", to: "p2", markedBy: "u1" })).toBe(true);
    expect(canUndoSettlement(member, { from: "p3", to: "p2", markedBy: "u5" })).toBe(false);
    expect(canUndoSettlement(orga, { from: "p3", to: "p2", markedBy: null })).toBe(true);
  });
});

describe("IBAN (R.8 I10-07)", () => {
  it.each([
    "DE89 3704 0044 0532 0130 00",
    "de89370400440532013000",
    "GB82 WEST 1234 5698 7654 32",
    "CH93 0076 2011 6238 5295 7",
    "AT61 1904 3002 3457 3201",
    "NL91ABNA0417164300",
    "FR14 2004 1010 0505 0001 3M02 606",
    "NO93 8601 1117 947",
  ])("valid: %s", (iban) => {
    expect(checkIban(iban).ok).toBe(true);
  });
  it.each([
    "DE89 3704 0044 0532 0130 01", // check digits
    "DE89 3704 0044 0532 0130", // length for DE
    "XX89 3704 0044 0532 0130 00", // unknown country
    "DE8937040044053201300!",
    "",
    "1234",
  ])("invalid: %s", (iban) => {
    expect(checkIban(iban).ok).toBe(false);
  });
  it("normalised form, groups and mask", () => {
    expect(checkIban("de89 3704 0044 0532 0130 00")).toEqual({
      ok: true,
      iban: "DE89370400440532013000",
    });
    expect(ibanGroups("DE89370400440532013000").join(" ")).toBe("DE89 3704 0044 0532 0130 00");
    expect(maskIban("DE89370400440532013000")).toEqual({ head: "DE89", masked: 4, last4: "3000" });
    expect(maskIban("GB82WEST12345698765432").last4).toBe("5432");
  });
  it("payment details: optional IBAN + other way ≤ 100", () => {
    expect(validatePayInfo({ iban: "", note: "  PayPal: lena.k " })).toEqual({
      ok: true,
      iban: null,
      note: "PayPal: lena.k",
    });
    expect(validatePayInfo({ iban: "DE00", note: "" })).toEqual({
      ok: false,
      errors: { iban: "iban" },
    });
    expect(validatePayInfo({ iban: null, note: "x".repeat(101) })).toEqual({
      ok: false,
      errors: { note: "tooLong" },
    });
  });
});

describe("validateExpense (R.8 I10-02, W19 D.5)", () => {
  const ps = parties(3);
  const ctx = {
    locale: "de",
    parties: ps,
    payers: ps.map((p) => p.id),
    window: expenseDateWindow("2027-06-12", "2027-06-19"),
  };
  const base = {
    amount: "100,00",
    title: " Abendessen\u0007 am Hafen ",
    note: "",
    category: "food",
    payer: "p1",
    participants: ["p2", "p0", "p1"],
    mode: "equal",
    amounts: {},
    date: "2027-06-14",
  };
  it("equal: shares by seq with the rest cent, cleaned title", () => {
    const result = validateExpense(base, ctx);
    expect(result).toEqual({
      ok: true,
      values: {
        amountCents: 10_000,
        title: "Abendessen am Hafen",
        note: null,
        category: "food",
        payer: "p1",
        mode: "equal",
        shares: [
          { party: "p0", cents: 3_334 },
          { party: "p1", cents: 3_333 },
          { party: "p2", cents: 3_333 },
        ],
        date: "2027-06-14",
      },
    });
  });
  it("amounts: must add up exactly; 0/empty = not included", () => {
    const wrong = validateExpense(
      { ...base, mode: "amounts", amounts: { p0: "50", p1: "40" } },
      ctx,
    );
    expect(wrong).toEqual({ ok: false, errors: { split: "splitSum" } });
    const right = validateExpense(
      { ...base, mode: "amounts", amounts: { p0: "60", p1: "40", p2: "" } },
      ctx,
    );
    expect(right.ok && right.values.shares).toEqual([
      { party: "p0", cents: 6_000 },
      { party: "p1", cents: 4_000 },
    ]);
  });
  it("rejects foreign parties, empty selection, bad payer, dates outside the window", () => {
    expect(validateExpense({ ...base, participants: ["p0", "evil"] }, ctx)).toMatchObject({
      ok: false,
      errors: { for: "forMissing" },
    });
    expect(validateExpense({ ...base, participants: [] }, ctx)).toMatchObject({
      ok: false,
      errors: { for: "forMissing" },
    });
    expect(validateExpense({ ...base, payer: "evil" }, ctx)).toMatchObject({
      ok: false,
      errors: { payer: "payer" },
    });
    expect(validateExpense({ ...base, date: "2026-06-11" }, ctx)).toMatchObject({
      ok: false,
      errors: { date: "dateRange" },
    });
    expect(validateExpense({ ...base, date: "2027-09-18" }, ctx)).toMatchObject({
      ok: false,
      errors: { date: "dateRange" },
    });
    expect(validateExpense({ ...base, date: "" }, ctx)).toMatchObject({
      ok: false,
      errors: { date: "dateMissing" },
    });
    expect(validateExpense({ ...base, title: "x".repeat(61) }, ctx)).toMatchObject({
      ok: false,
      errors: { title: "tooLong" },
    });
    expect(validateExpense({ ...base, note: "x".repeat(201) }, ctx)).toMatchObject({
      ok: false,
      errors: { note: "tooLong" },
    });
    expect(validateExpense({ ...base, amount: "" }, ctx)).toMatchObject({
      ok: false,
      errors: { amount: "amountMissing" },
    });
    expect(validateExpense({ ...base, category: "<b>" }, ctx)).toMatchObject({
      ok: true,
      values: { category: null },
    });
  });
  it("date window: arrival − 365 … departure + 90", () => {
    expect(expenseDateWindow("2027-06-12", "2027-06-19")).toEqual({
      min: "2026-06-12",
      max: "2027-09-17",
    });
  });
});

describe("people order and former numbers (W19 D.10, I10-05)", () => {
  const info = (
    id: string,
    seq: number,
    kind: PartyInfo["kind"],
    formerNo: number | null = null,
  ): PartyInfo => ({
    id,
    seq,
    kind,
    name: kind === "former" ? null : id,
    userId: null,
    formerNo,
  });
  it("one former member → no number; several → numbered by leaving order", () => {
    const ps = [info("a", 1, "member"), info("f1", 2, "former", 2), info("f2", 3, "former", 1)];
    expect(formerNumbers(ps, new Set(["f1"]))).toEqual(new Map([["f1", null]]));
    expect(formerNumbers(ps, new Set(["f1", "f2"]))).toEqual(
      new Map([
        ["f2", 1],
        ["f1", 2],
      ]),
    );
  });
  it("viewer first, then seq; own proposal rows first", () => {
    expect(viewerFirst(parties(3), "p2").map((p) => p.id)).toEqual(["p2", "p0", "p1"]);
    expect(
      ownRowsFirst(
        [
          { from: "a", to: "b", cents: 1 },
          { from: "me", to: "c", cents: 2 },
          { from: "d", to: "me", cents: 3 },
        ],
        "me",
      ).map((t) => t.cents),
    ).toEqual([2, 3, 1]);
  });
});

describe("costReminderChannel (W16 v2.15, R-082)", () => {
  const member = { kind: "member" as const, me: false };
  const placeholder = { kind: "placeholder" as const, me: false };
  it("members with an account get the balances link – for everyone", () => {
    expect(costReminderChannel(member, false)).toBe("balances");
    expect(costReminderChannel(member, true)).toBe("balances");
  });
  it("placeholders: personal link only for the organiser, members tell the organiser", () => {
    expect(costReminderChannel(placeholder, true)).toBe("personal");
    expect(costReminderChannel(placeholder, false)).toBe("orga");
  });
  it("former members, the viewer and unknown parties cannot be reminded", () => {
    expect(costReminderChannel({ kind: "former", me: false }, true)).toBeNull();
    expect(costReminderChannel({ kind: "member", me: true }, false)).toBeNull();
    expect(costReminderChannel(undefined, true)).toBeNull();
  });
});
