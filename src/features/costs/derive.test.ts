import { describe, expect, it } from "vitest";
import { computeBalances, settleUp } from "@/lib/costs";
import { settleSections, shortNames, standOf } from "./derive";

// W19 E.4/E.5 (Increment 11a): «Dein Stand» with its way of working it out, the sections of
// «Ausgleichen» and the short recipient line. Same numbers as the server's pure functions.

const expenses = [
  // Lena paid 60 for Lena, Max, Kemal (20 each).
  { payer: "lena", amountCents: 6_000, shares: [lena(2_000), max(2_000), kemal(2_000)] },
  // Max paid 150 for all three (50 each).
  { payer: "max", amountCents: 15_000, shares: [lena(5_000), max(5_000), kemal(5_000)] },
];
function lena(cents: number) {
  return { party: "lena", cents };
}
function max(cents: number) {
  return { party: "max", cents };
}
function kemal(cents: number) {
  return { party: "kemal", cents };
}

describe("standOf (W19 E.4 «So rechnen wir»)", () => {
  it("paid − own parts + sent − received = the balance of computeBalances", () => {
    const settlements = [{ from: "kemal", to: "max", cents: 3_000 }];
    const stand = standOf("max", expenses, settlements);
    expect(stand).toEqual({ paid: 15_000, share: 7_000, sent: 0, received: 3_000, balance: 5_000 });
    const balances = computeBalances(["lena", "max", "kemal"], expenses, settlements);
    for (const id of ["lena", "max", "kemal"]) {
      expect(standOf(id, expenses, settlements).balance).toBe(balances.get(id));
    }
  });

  it("sent counts for the payer («Schon zurückgezahlt»)", () => {
    const stand = standOf("kemal", expenses, [{ from: "kemal", to: "max", cents: 3_000 }]);
    expect(stand).toMatchObject({ paid: 0, share: 7_000, sent: 3_000, received: 0 });
    expect(stand.balance).toBe(-4_000);
  });

  it("not in any expense → all zero", () => {
    expect(standOf("mia", expenses, [])).toEqual({
      paid: 0,
      share: 0,
      sent: 0,
      received: 0,
      balance: 0,
    });
  });
});

describe("settleSections (W19 E.5)", () => {
  const people = [
    { key: "lena", account: true },
    { key: "max", account: true },
    { key: "kemal", account: true },
    { key: "mia", account: false },
    { key: "former", account: false },
  ];
  const transfers = [
    { from: "kemal", to: "max", cents: 7_000 },
    { from: "lena", to: "max", cents: 1_000 },
    { from: "mia", to: "former", cents: 2_000 },
    { from: "mia", to: "lena", cents: 500 },
  ];

  it("own out/in, organiser-only rows (no account on either side), everybody else", () => {
    const max = settleSections(transfers, "max", people);
    expect(max.out).toEqual([]);
    expect(max.in.map((t) => t.from)).toEqual(["kemal", "lena"]);
    expect(max.orga).toEqual([{ from: "mia", to: "former", cents: 2_000 }]);
    expect(max.others).toEqual([{ from: "mia", to: "lena", cents: 500 }]);
    const kemal = settleSections(transfers, "kemal", people);
    expect(kemal.out).toEqual([{ from: "kemal", to: "max", cents: 7_000 }]);
    expect(kemal.others.map((t) => `${t.from}>${t.to}`)).toEqual(["lena>max", "mia>lena"]);
  });

  it("a person only pays OR receives in the proposal – one own group at most", () => {
    const balances = computeBalances(["lena", "max", "kemal"], expenses, []);
    const proposal = settleUp(
      ["lena", "max", "kemal"].map((id, seq) => ({ id, seq, cents: balances.get(id) ?? 0 })),
    );
    for (const me of ["lena", "max", "kemal"]) {
      const s = settleSections(proposal, me, people);
      expect(s.out.length === 0 || s.in.length === 0).toBe(true);
    }
  });
});

describe("shortNames (W19 E.4 «An Lena und Kemal.» / «An 3 Personen.»)", () => {
  it("at most two names, otherwise a count", () => {
    expect(shortNames(["Lena"], "de")).toEqual({ kind: "names", names: "Lena" });
    expect(shortNames(["Lena", "Kemal"], "de")).toEqual({
      kind: "names",
      names: "Lena und Kemal",
    });
    expect(shortNames(["Lena", "Kemal"], "en")).toEqual({
      kind: "names",
      names: "Lena and Kemal",
    });
    expect(shortNames(["Lena", "Kemal", "Sara"], "de")).toEqual({ kind: "count", count: 3 });
  });
});
