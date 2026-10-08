import { describe, expect, it } from "vitest";
import de from "../../messages/de.json";
import en from "../../messages/en.json";
import { compareCatalogs, flattenMessages } from "./message-keys";

describe("compareCatalogs", () => {
  it("reports missing and empty keys", () => {
    const issues = compareCatalogs({
      de: { a: "A", b: { c: "C" } },
      en: { a: " ", b: {} },
    });
    expect(issues).toEqual([
      { locale: "en", key: "a", problem: "empty" },
      { locale: "en", key: "b.c", problem: "missing" },
    ]);
  });

  it("flattens nested catalogs", () => {
    expect([...flattenMessages({ x: { y: "1" }, z: "2" }).keys()]).toEqual(["x.y", "z"]);
  });

  it("shipped DE and EN catalogs are complete", () => {
    expect(compareCatalogs({ de, en })).toEqual([]);
  });

  it("uses the product name per language (Q11, 2026-10-08)", () => {
    expect(de.app.name).toBe("Wir wollen weg");
    expect(en.app.name).toBe("When do we go?");
  });
});
