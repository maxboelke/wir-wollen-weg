import { describe, expect, it } from "vitest";
import { holidaysInRange, parseRegion, releasedRegions } from "./holidays";

describe("parseRegion", () => {
  it("accepts released countries and subdivisions only", () => {
    expect(parseRegion("DE-BY")).toEqual(["DE", "BY"]);
    expect(parseRegion("AT-9")).toEqual(["AT", "9"]);
    expect(parseRegion("GB-SCT")).toEqual(["GB", "SCT"]);
    expect(parseRegion("US")).toEqual(["US"]);
    expect(parseRegion("FR")).toBeNull();
    expect(parseRegion("DE-XX")).toBeNull();
    expect(parseRegion(null)).toBeNull();
  });
});

describe("holidaysInRange (F-016)", () => {
  it("Bavaria May 2027 in German (W08 example) – only public holidays", () => {
    expect(holidaysInRange("DE-BY", "2027-05-01", "2027-05-31", "de")).toEqual([
      { date: "2027-05-01", name: "Maifeiertag" },
      { date: "2027-05-06", name: "Christi Himmelfahrt" },
      { date: "2027-05-17", name: "Pfingstmontag" },
      { date: "2027-05-27", name: "Fronleichnam" },
    ]);
  });

  it("names follow the viewer's language", () => {
    const en = holidaysInRange("DE-BY", "2027-05-17", "2027-05-17", "en");
    expect(en).toEqual([{ date: "2027-05-17", name: "Whit Monday" }]);
  });

  it("nationwide Germany has no Fronleichnam; Berlin has no Epiphany", () => {
    expect(holidaysInRange("DE", "2027-05-27", "2027-05-27", "de")).toEqual([]);
    expect(holidaysInRange("DE-BE", "2027-01-06", "2027-01-06", "de")).toEqual([]);
    expect(holidaysInRange("DE-BW", "2027-01-06", "2027-01-06", "de")).toHaveLength(1);
  });

  it("UK bank holidays incl. substitute days, US federal holidays", () => {
    const eng = holidaysInRange("GB-ENG", "2027-12-24", "2027-12-31", "en").map((h) => h.date);
    expect(eng).toEqual(["2027-12-25", "2027-12-26", "2027-12-27", "2027-12-28"]);
    const us = holidaysInRange("US", "2027-07-01", "2027-07-31", "en");
    expect(us.map((h) => h.date)).toEqual(["2027-07-04", "2027-07-05"]);
    expect(holidaysInRange("US", "2027-02-14", "2027-02-14", "en")).toEqual([]); // Valentine's
  });

  it("works across the year change and for every released region", () => {
    const range = holidaysInRange("AT", "2027-12-20", "2028-01-10", "de").map((h) => h.date);
    expect(range).toEqual(["2027-12-25", "2027-12-26", "2028-01-01", "2028-01-06"]);
    for (const region of releasedRegions()) {
      expect(holidaysInRange(region, "2027-01-01", "2027-12-31", "de").length).toBeGreaterThan(4);
    }
  });

  it("returns nothing for unknown regions or empty ranges", () => {
    expect(holidaysInRange("FR", "2027-01-01", "2027-12-31", "de")).toEqual([]);
    expect(holidaysInRange("DE", "2027-12-31", "2027-01-01", "de")).toEqual([]);
  });
});
