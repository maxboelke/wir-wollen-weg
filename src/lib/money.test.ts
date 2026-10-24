import { describe, expect, it } from "vitest";
import { formatExact } from "./costs";
import { currencySymbol, formatMoneyExact, formatMoneyShort, moneyLocale } from "./money";
import { formatMoney } from "./stays";

const NBSP = " ";

describe("moneyLocale (W19 E.0 #7)", () => {
  it("maps the app language, never the region", () => {
    expect(moneyLocale("de")).toBe("de-DE");
    expect(moneyLocale("de-DE")).toBe("de-DE");
    expect(moneyLocale("de-AT")).toBe("de-DE");
    expect(moneyLocale("de-CH")).toBe("de-DE");
    expect(moneyLocale("en")).toBe("en-GB");
    expect(moneyLocale("en-US")).toBe("en-GB");
    expect(moneyLocale("en-GB")).toBe("en-GB");
  });
});

describe("formatMoneyExact", () => {
  it("German: «630,00 €», «1.200,00 €» – also for a Swiss or Austrian account", () => {
    for (const tag of ["de", "de-DE", "de-CH", "de-AT"]) {
      expect(formatMoneyExact(63_000, "EUR", tag)).toBe(`630,00${NBSP}€`);
      expect(formatMoneyExact(120_000, "EUR", tag)).toBe(`1.200,00${NBSP}€`);
    }
  });

  it("never prints the code form or Swiss grouping (the reported bug)", () => {
    const text = formatMoneyExact(120_000, "EUR", "de-CH");
    expect(text).not.toContain("EUR");
    expect(text).not.toContain("'");
    expect(text).not.toContain("’");
  });

  it("English: «€630.00», «€1,200.00» – also for a US account", () => {
    for (const tag of ["en", "en-GB", "en-US"]) {
      expect(formatMoneyExact(63_000, "EUR", tag)).toBe("€630.00");
      expect(formatMoneyExact(120_000, "EUR", tag)).toBe("€1,200.00");
    }
  });

  it("other currencies of the trip", () => {
    expect(formatMoneyExact(5_000, "GBP", "en-GB")).toBe("£50.00");
    expect(formatMoneyExact(5_000, "GBP", "de-CH")).toBe(`50,00${NBSP}£`);
    expect(formatMoneyExact(123_456, "CHF", "de")).toBe(`1.234,56${NBSP}CHF`);
    expect(formatMoneyExact(1, "EUR", "de")).toBe(`0,01${NBSP}€`);
  });

  it("is what the cost module re-exports", () => {
    expect(formatExact).toBe(formatMoneyExact);
  });
});

describe("formatMoneyShort", () => {
  it("decimals only with cents", () => {
    expect(formatMoneyShort(205_000, "EUR", "de-CH")).toBe(`2.050${NBSP}€`);
    expect(formatMoneyShort(184_050, "EUR", "de-AT")).toBe(`1.840,50${NBSP}€`);
    expect(formatMoneyShort(205_000, "GBP", "en-US")).toBe("£2,050");
  });

  it("is what the stays module re-exports", () => {
    expect(formatMoney).toBe(formatMoneyShort);
  });
});

describe("currencySymbol", () => {
  it("position follows the language", () => {
    expect(currencySymbol("EUR", "de-CH")).toEqual({ symbol: "€", before: false });
    expect(currencySymbol("EUR", "en-US")).toEqual({ symbol: "€", before: true });
    expect(currencySymbol("GBP", "en")).toEqual({ symbol: "£", before: true });
  });
});
