import { describe, expect, it } from "vitest";
import {
  checkStayUrl,
  completeUrl,
  favouriteOf,
  formatMoney,
  isDoneRating,
  newSince,
  normalizeStayUrl,
  parsePrice,
  perPersonCents,
  priceInput,
  rankingVisible,
  rankStays,
  safeHref,
  travellerCount,
  validateStayForm,
  type RankInput,
} from "./stays";

describe("completeUrl (W17 F.2: missing scheme is added silently)", () => {
  it("adds https:// to input without a scheme", () => {
    expect(completeUrl("booking.com/hotel/x")).toBe("https://booking.com/hotel/x");
    expect(completeUrl("  www.airbnb.de/rooms/1 ")).toBe("https://www.airbnb.de/rooms/1");
    expect(completeUrl("example.org:8443/x")).toBe("https://example.org:8443/x");
  });
  it("keeps explicit schemes (also http → error later)", () => {
    expect(completeUrl("http://booking.com")).toBe("http://booking.com");
    expect(completeUrl("https://booking.com")).toBe("https://booking.com");
    expect(completeUrl("javascript:alert(1)")).toBe("javascript:alert(1)");
    expect(completeUrl("")).toBe("");
  });
});

describe("checkStayUrl (R.7 I9-02)", () => {
  it("accepts https links with a real host name", () => {
    const result = checkStayUrl("https://www.Booking.com/hotel/hr/villa.html?aid=1");
    expect(result).toEqual({
      ok: true,
      url: "https://www.booking.com/hotel/hr/villa.html?aid=1",
      host: "booking.com",
    });
    expect(checkStayUrl("https://ferienhaus.example:443/a").ok).toBe(true);
  });
  it.each([
    ["", "missing"],
    ["   ", "missing"],
    [42, "missing"],
    ["http://booking.com/x", "invalid"],
    ["ftp://booking.com/x", "invalid"],
    ["javascript:alert(1)", "invalid"],
    ["not a link", "invalid"],
    ["https://user:pass@booking.com/", "unusable"],
    ["https://booking.com:8443/", "unusable"],
    ["https://127.0.0.1/", "unusable"],
    ["https://2130706433/", "unusable"],
    ["https://0x7f.1/", "unusable"],
    ["https://[::1]/", "unusable"],
    ["https://localhost/", "unusable"],
    ["https://db/", "unusable"],
    ["https://mailpit/", "unusable"],
    ["https://printer.local/", "unusable"],
    ["https://host.docker.internal/", "unusable"],
    [`https://booking.com/${"a".repeat(2050)}`, "unusable"],
  ])("%s → %s", (input, error) => {
    expect(checkStayUrl(input)).toEqual({ ok: false, error });
  });
});

describe("normalizeStayUrl (duplicates, R.7 I9-02)", () => {
  it("Booking: tracking, session and search parameters do not matter", () => {
    const a = normalizeStayUrl(
      "https://www.booking.com/hotel/hr/villa-mare.de.html?aid=304142&label=gen173nr-1FCAE&sid=abc&checkin=2027-06-12&checkout=2027-06-19&group_adults=6#availability",
    );
    const b = normalizeStayUrl("https://booking.com/hotel/hr/villa-mare.de.html/");
    expect(a).toBe("booking.com/hotel/hr/villa-mare.de.html");
    expect(b).toBe(a);
  });
  it("Airbnb: impression/search ids and dates are dropped, the room id stays", () => {
    const a = normalizeStayUrl(
      "https://www.airbnb.de/rooms/12345?adults=4&check_in=2027-06-12&check_out=2027-06-19&source_impression_id=p3_1&previous_page_section_name=1000&federated_search_id=f1",
    );
    expect(a).toBe("airbnb.de/rooms/12345");
    expect(normalizeStayUrl("https://www.airbnb.de/rooms/99999")).not.toBe(a);
  });
  it("holiday homes: utm_* removed, identifying parameters kept and sorted", () => {
    const a = normalizeStayUrl(
      "https://www.fewo-direkt.de/ferienwohnung-ferienhaus/p1234567?utm_source=x&utm_medium=y&arrival=2027-06-12&departure=2027-06-19&unitId=2&adults=4",
    );
    const b = normalizeStayUrl(
      "https://fewo-direkt.de/ferienwohnung-ferienhaus/p1234567/?unitId=2&fbclid=abc",
    );
    expect(a).toBe("fewo-direkt.de/ferienwohnung-ferienhaus/p1234567?unitId=2");
    expect(b).toBe(a);
    expect(normalizeStayUrl("https://ferienhaus.example/a?b=2&a=1")).toBe(
      "ferienhaus.example/a?a=1&b=2",
    );
  });
});

describe("safeHref", () => {
  it("renders only https links", () => {
    expect(safeHref("https://booking.com/x")).toBe("https://booking.com/x");
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("http://booking.com")).toBeNull();
    expect(safeHref("nonsense")).toBeNull();
  });
});

describe("parsePrice (W17 F.2)", () => {
  it.each([
    ["1.840", "de", 184_000],
    ["1840", "de", 184_000],
    ["1840,50", "de", 184_050],
    ["1.840,5", "de", 184_050],
    ["2.050 €", "de", 205_000],
    ["1,840", "en", 184_000],
    ["1840.50", "en", 184_050],
    ["£1,840.50", "en", 184_050],
    ["1.000.000", "de", 100_000_000],
  ])("%s (%s) → %i cents", (input, locale, cents) => {
    expect(parsePrice(input, locale)).toEqual({ ok: true, cents });
  });
  it("empty is «no price»", () => {
    expect(parsePrice("", "de")).toEqual({ ok: true, cents: null });
    expect(parsePrice("  ", "en")).toEqual({ ok: true, cents: null });
    expect(parsePrice(null, "en")).toEqual({ ok: true, cents: null });
  });
  it.each([
    ["18.5", "de", "price"],
    ["1840.50", "de", "price"],
    ["1,840.505", "en", "price"],
    ["0", "de", "price"],
    ["-5", "en", "price"],
    ["abc", "en", "price"],
    ["1.000.001", "de", "priceMax"],
    ["2000000", "en", "priceMax"],
  ])("%s (%s) → %s", (input, locale, error) => {
    expect(parsePrice(input, locale)).toEqual({ ok: false, error });
  });
  it("priceInput round-trips", () => {
    expect(priceInput(184_050, "de")).toBe("1840,50");
    expect(priceInput(184_050, "en")).toBe("1840.50");
    expect(priceInput(184_000, "de")).toBe("1840");
    expect(priceInput(null, "de")).toBe("");
    expect(parsePrice(priceInput(184_005, "de"), "de")).toEqual({ ok: true, cents: 184_005 });
  });
});

describe("per person (R.7 I9-02)", () => {
  it("rounds half up to whole units", () => {
    expect(perPersonCents(205_000, 6)).toBe(34_200); // 341.67 → 342
    expect(perPersonCents(184_000, 6)).toBe(30_700); // 306.67 → 307
    expect(perPersonCents(1_500, 2)).toBe(800); // 7.50 → 8
    expect(perPersonCents(1_400, 3)).toBe(500); // 4.67 → 5
    expect(perPersonCents(1_000, 0)).toBe(1_000);
  });
  it("travellers = members + open placeholders, or the organiser's override", () => {
    expect(travellerCount(5, 1, null)).toBe(6);
    expect(travellerCount(5, 1, 4)).toBe(4);
    expect(travellerCount(5, 1, 0)).toBe(6);
    expect(travellerCount(5, 1, 51)).toBe(6);
  });
  it("formats money in the viewer's format", () => {
    expect(formatMoney(205_000, "EUR", "de-DE")).toBe("2.050 €");
    expect(formatMoney(184_050, "EUR", "de-DE")).toBe("1.840,50 €");
    expect(formatMoney(205_000, "GBP", "en-GB")).toBe("£2,050");
  });
});

describe("validateStayForm", () => {
  it("cleans and checks", () => {
    expect(
      validateStayForm({ title: "  Villa\u0007 Mare  ", price: "1.840", note: "" }, "de"),
    ).toEqual({ ok: true, values: { title: "Villa Mare", priceCents: 184_000, note: null } });
    expect(validateStayForm({ title: "", price: "x", note: "a".repeat(201) }, "de")).toEqual({
      ok: false,
      errors: { title: "titleMissing", price: "price", note: "tooLong" },
    });
    expect(validateStayForm({ title: "a".repeat(81), price: "", note: null }, "en")).toEqual({
      ok: false,
      errors: { title: "tooLong" },
    });
  });
});

describe("rankStays (R.7 I9-06, W18 E.6.2)", () => {
  const stay = (id: string, likes: number, nopes: number, perPerson: number | null, at = 0) =>
    ({ id, likes, nopes, perPerson, createdAt: at }) satisfies RankInput;

  it("sorts by ♥, then fewest ✕, then price per person (none last), then age", () => {
    const ranked = rankStays([
      stay("a", 3, 1, 300, 1),
      stay("b", 4, 2, 500, 2),
      stay("c", 3, 0, null, 3),
      stay("d", 3, 0, 200, 4),
      stay("e", 3, 1, 300, 0),
      stay("f", 3, 1, null, 5),
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["b", "d", "c", "e", "a", "f"]);
  });
  it("ranks only by ♥ and ✕: ties share a rank (1, 2, 2, 4)", () => {
    const ranked = rankStays([
      stay("a", 5, 0, null),
      stay("b", 3, 1, 100),
      stay("c", 3, 1, 200),
      stay("d", 1, 0, null),
    ]);
    expect(ranked.map((r) => [r.id, r.rank, r.tied, r.first])).toEqual([
      ["a", 1, false, true],
      ["b", 2, true, false],
      ["c", 2, true, false],
      ["d", 4, false, false],
    ]);
  });
  it("«Platz 1» only with at least one ♥; tie at the top marks all", () => {
    expect(rankStays([stay("a", 0, 2, null), stay("b", 0, 3, null)])[0]?.first).toBe(false);
    const tie = rankStays([stay("a", 2, 0, 900), stay("b", 2, 0, 100)]);
    expect(tie.map((r) => [r.id, r.first, r.tied])).toEqual([
      ["b", true, true],
      ["a", true, true],
    ]);
    const titles = new Map([
      ["a", "Villa"],
      ["b", "Haus"],
    ]);
    const likes = new Map([
      ["a", 2],
      ["b", 2],
    ]);
    expect(favouriteOf(tie, titles, likes)).toEqual({ titles: ["Haus", "Villa"], likes: 2 });
    expect(favouriteOf(rankStays([stay("a", 0, 0, null)]), titles, likes)).toBeNull();
  });
});

describe("visibility (Q33)", () => {
  it("done = rated every current suggestion", () => {
    expect(isDoneRating(["a", "b"], new Set(["a", "b", "x"]))).toBe(true);
    expect(isDoneRating(["a", "b"], new Set(["a"]))).toBe(false);
    expect(isDoneRating([], new Set())).toBe(true);
  });
  it("organiser always, members when done, everybody once picked", () => {
    expect(rankingVisible({ organizer: true, done: false, chosen: false })).toBe(true);
    expect(rankingVisible({ organizer: false, done: false, chosen: false })).toBe(false);
    expect(rankingVisible({ organizer: false, done: true, chosen: false })).toBe(true);
    expect(rankingVisible({ organizer: false, done: false, chosen: true })).toBe(true);
  });
  it("«Neu» = unrated and created after the latest own rating", () => {
    const stays = [
      { id: "a", createdAt: 10 },
      { id: "b", createdAt: 30 },
      { id: "c", createdAt: 40 },
    ];
    expect(newSince(stays, new Set(["a"]), 20)).toEqual(["b", "c"]);
    expect(newSince(stays, new Set(["a", "c"]), 35)).toEqual([]);
    expect(newSince(stays, new Set(), null)).toEqual([]);
  });
});
