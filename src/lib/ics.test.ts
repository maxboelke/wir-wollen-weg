import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldIcsLine, googleCalendarUrl, icsFileName } from "./ics";

const event = {
  uid: "abc-2027-05-05-2027-05-10@wir-wollen-weg",
  title: "Lissabon, 2027; mit Freunden",
  start: "2027-05-05",
  end: "2027-05-10",
  url: "https://example.org/trips/abc",
  description: "Geplant mit Wir wollen weg",
  stamp: new Date("2027-04-01T10:20:30Z"),
};

describe("ICS (F-012 «Zum Kalender hinzufügen»)", () => {
  it("is an all-day event from arrival to departure (exclusive end = day after)", () => {
    const ics = buildIcs(event, "Wir wollen weg");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270505\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20270511\r\n");
    expect(ics).toContain("DTSTAMP:20270401T102030Z\r\n");
    expect(ics).toContain("SUMMARY:Lissabon\\, 2027\\; mit Freunden\r\n");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it("escapes text and folds long lines at 75 octets without splitting characters", () => {
    expect(escapeIcsText("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
    const long = `SUMMARY:${"ä".repeat(60)}`;
    const folded = foldIcsLine(long);
    for (const line of folded.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replaceAll("\r\n ", "")).toBe(long);
  });

  it("Google link uses the same exclusive end", () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20270505/20270511");
    expect(url.searchParams.get("text")).toBe(event.title);
  });

  it("file names are safe ASCII", () => {
    expect(icsFileName("Lissabon 2027 – Ärger & Spaß!")).toBe("lissabon-2027-arger-spa.ics");
    expect(icsFileName("🙂")).toBe("trip.ics");
  });
});
