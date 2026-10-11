import { describe, expect, it } from "vitest";
import de from "../../messages/de.json";
import en from "../../messages/en.json";
import { findPlaceholderMarkers, IMPRINT_PATHS, PRIVACY_PATHS, PRIVACY_SECTIONS } from "./legal";

describe("legal pages (F-013, compliance-checklist §0a)", () => {
  it("uses the sitemap routes", () => {
    expect(PRIVACY_PATHS).toEqual({ de: "/de/datenschutz", en: "/en/privacy" });
    expect(IMPRINT_PATHS).toEqual({ de: "/de/impressum", en: "/en/imprint" });
  });

  it("finds placeholder markers with their message paths", () => {
    expect(
      findPlaceholderMarkers({ a: "ok", b: { c: "[PLATZHALTER: Name]", d: ["[PLACEHOLDER: x]"] } }),
    ).toEqual(["b.c", "b.d.0"]);
    expect(findPlaceholderMarkers({ a: "Platzhalter ohne Klammer" })).toEqual([]);
  });

  it("marks the missing operator data in both languages – and only in the legal texts", () => {
    for (const catalog of [de, en]) {
      const found = findPlaceholderMarkers(catalog);
      expect(found.length).toBeGreaterThan(0);
      expect(found.every((path) => path.startsWith("legal."))).toBe(true);
      expect(found).toContain("legal.imprint.provider");
      expect(found).toContain("legal.privacy.sections.controller.body");
    }
  });

  it("has a title and body for every privacy section (compliance-checklist §2)", () => {
    for (const section of PRIVACY_SECTIONS) {
      expect(de.legal.privacy.sections[section].title).not.toBe("");
      expect(en.legal.privacy.sections[section].body).not.toBe("");
    }
  });

  it("credits date-holidays under CC BY 3.0 (licence notice)", () => {
    expect(de.legal.imprint.holidays).toContain("Creative Commons BY 3.0");
    expect(en.legal.imprint.holidays).toContain("Creative Commons BY 3.0");
  });
});
