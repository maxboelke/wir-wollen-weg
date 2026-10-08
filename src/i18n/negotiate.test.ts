import { describe, expect, it } from "vitest";
import { negotiateLocale, parseAcceptLanguage } from "./negotiate";

describe("negotiateLocale", () => {
  it("prefers an explicit cookie choice", () => {
    expect(negotiateLocale({ cookie: "en", acceptLanguage: "de-DE,de;q=0.9" })).toBe("en");
  });

  it("ignores invalid cookie values", () => {
    expect(negotiateLocale({ cookie: "fr", acceptLanguage: "de-AT" })).toBe("de");
  });

  it.each([
    ["de-DE,de;q=0.9,en;q=0.8", "de"],
    ["de-CH", "de"],
    ["en-GB,en;q=0.9", "en"],
    ["fr-FR,fr;q=0.9", "en"],
    ["fr-FR,de;q=0.5", "de"],
    ["en;q=0.4,de;q=0.8", "de"],
  ] as const)("maps Accept-Language %s → %s", (header, expected) => {
    expect(negotiateLocale({ acceptLanguage: header })).toBe(expected);
  });

  it("falls back to en without any signal", () => {
    expect(negotiateLocale({})).toBe("en");
    expect(negotiateLocale({ acceptLanguage: "" })).toBe("en");
  });
});

describe("parseAcceptLanguage", () => {
  it("orders by q-value and drops wildcard and q=0", () => {
    expect(parseAcceptLanguage("en;q=0.5, de-DE, *;q=0.1, fr;q=0")).toEqual(["de-DE", "en"]);
  });
});
