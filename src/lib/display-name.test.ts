import { describe, expect, it } from "vitest";
import { cleanDisplayName, firstName, isNameTaken, suggestName } from "./display-name";

describe("display names in a trip (F-003)", () => {
  it("cleans and compares case-insensitively", () => {
    expect(cleanDisplayName("  Kemal   Bayram ")).toBe("Kemal Bayram");
    expect(isNameTaken("kemal", ["Lena", "Kemal"])).toBe(true);
    expect(isNameTaken("René", ["Rene"])).toBe(false);
  });

  it("only the first name for the invite preview", () => {
    expect(firstName("Anna Schmidt")).toBe("Anna");
    expect(firstName("")).toBe("");
  });

  it("suggests «Kemal B.» from the full name, else a number", () => {
    expect(suggestName("Kemal", ["Kemal"], "Kemal Bayram")).toBe("Kemal B.");
    expect(suggestName("Kemal", ["Kemal", "Kemal B."], "Kemal Bayram")).toBe("Kemal 2");
    expect(suggestName("Kemal", ["Kemal", "Kemal 2"])).toBe("Kemal 3");
    expect(Array.from(suggestName("x".repeat(40), ["x".repeat(40)])).length).toBeLessThanOrEqual(
      40,
    );
  });
});
