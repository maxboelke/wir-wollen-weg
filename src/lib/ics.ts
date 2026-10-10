import { addDays, type IsoDate } from "./dates";

/**
 * «Zum Kalender hinzufügen» (F-012, Flow D.3 #4): an all-day event from the arrival to the
 * departure day. iCalendar all-day events end EXCLUSIVELY, so DTEND is the day after the
 * departure. Works with the Apple calendar, Outlook and Google (RFC 5545, CRLF, folded lines).
 */

export interface CalendarEvent {
  /** Stable id per trip and range (a new range replaces nothing – it is a new event). */
  uid: string;
  title: string;
  start: IsoDate;
  end: IsoDate;
  /** Link back to the trip. */
  url: string;
  description?: string | undefined;
  /** Creation time (DTSTAMP). */
  stamp: Date;
}

const compact = (date: IsoDate) => date.replaceAll("-", "");

/** Escapes TEXT values (RFC 5545 §3.3.11): backslash, semicolon, comma, newlines. */
export function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Folds a content line at 75 octets (RFC 5545 §3.1), never inside a UTF-8 sequence. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + bytes > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += bytes;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function stampOf(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

export function buildIcs(event: CalendarEvent, productName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeIcsText(productName)}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stampOf(event.stamp)}`,
    `DTSTART;VALUE=DATE:${compact(event.start)}`,
    `DTEND;VALUE=DATE:${compact(addDays(event.end, 1))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeIcsText(event.description)}`] : []),
    `URL:${event.url}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

/** Google Calendar «create event» link – same exclusive end as the ICS file. */
export function googleCalendarUrl(event: Omit<CalendarEvent, "uid" | "stamp">): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compact(event.start)}/${compact(addDays(event.end, 1))}`,
    details: event.description ? `${event.description}\n${event.url}` : event.url,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** File name «lissabon-2027.ics» (ASCII, safe for Content-Disposition). */
export function icsFileName(tripName: string): string {
  const slug = tripName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "trip"}.ics`;
}
