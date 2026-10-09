import { describe, expect, it } from "vitest";
import de from "../../messages/de.json";
import en from "../../messages/en.json";
import { HELP_ANCHORS, HELP_TOPICS, helpHref } from "./help";

describe("help links (F-051)", () => {
  it("points to /de/hilfe and /en/help with the documented anchors", () => {
    expect(helpHref("de")).toBe("/de/hilfe");
    expect(helpHref("en")).toBe("/en/help");
    expect(helpHref("de", "code")).toBe("/de/hilfe#code");
    expect(helpHref("de", "motion")).toBe("/de/hilfe#bewegung");
    expect(helpHref("en", "motion")).toBe("/en/help#motion");
  });

  it("has unique anchors and texts for every topic in both languages", () => {
    for (const locale of ["de", "en"] as const) {
      const anchors = HELP_TOPICS.map((topic) => HELP_ANCHORS[topic][locale]);
      expect(new Set(anchors).size).toBe(anchors.length);
    }
    for (const topic of HELP_TOPICS) {
      expect(de.help.topics[topic].q).not.toBe("");
      expect(en.help.topics[topic].a).not.toBe("");
    }
  });
});
