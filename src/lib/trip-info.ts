/**
 * Infos of a fixed trip (F-033, W22 C, Increment 8): field rules, cleaning and display helpers.
 * Pure – shared by the form (client), the Server Action (server) and the tests.
 */

/** Field limits (W22 C) – the database checks the same numbers (migration 0009). */
export const INFO_LIMITS = {
  stayName: 80,
  address: 200,
  meetingPoint: 300,
  emergencyName: 60,
  emergencyPhone: 20,
  notes: 2000,
} as const;

/** «Gut zu wissen»: the counter appears from 1 800 characters on (W22 B). */
export const NOTES_COUNTER_FROM = 1800;

export const INFO_FIELDS = [
  "stayName",
  "address",
  "checkIn",
  "checkOut",
  "meetingPoint",
  "emergencyName",
  "emergencyPhone",
  "notes",
] as const;
export type InfoField = (typeof INFO_FIELDS)[number];
export type InfoValues = Record<InfoField, string | null>;
export type InfoErrors = Partial<Record<InfoField, "tooLong" | "time" | "phone">>;

const MULTILINE: ReadonlySet<InfoField> = new Set(["address", "meetingPoint", "notes"]);
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
/** Only `+`, digits, spaces, `/`, `-`, `(` and `)` (W22 C). */
const PHONE = /^[+0-9 /()-]+$/;

/**
 * Removes control characters (except line breaks in multi-line fields), normalises line
 * breaks, trims; empty → null («Löschen = Feld leeren», W22 C).
 */
export function cleanInfoText(value: unknown, multiline: boolean): string | null {
  if (typeof value !== "string") return null;
  let text = value.replace(/\r\n?/g, "\n");
  text = text.replace(
    multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g,
    "",
  );
  text = multiline
    ? text
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : text.replace(/\s+/g, " ").trim();
  return text === "" ? null : text;
}

/** Characters as the person sees them (code points, so emoji count once like `maxLength`). */
export function textLength(value: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    // A surrogate pair is one code point (like PostgreSQL's char_length).
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < value.length) i++;
    count++;
  }
  return count;
}

/** Cleans and checks all fields (client on blur/submit, server again before saving). */
export function validateInfo(
  input: Partial<Record<InfoField, unknown>>,
): { ok: true; values: InfoValues } | { ok: false; errors: InfoErrors; values: InfoValues } {
  const values = Object.fromEntries(
    INFO_FIELDS.map((field) => [field, cleanInfoText(input[field], MULTILINE.has(field))]),
  ) as InfoValues;
  const errors: InfoErrors = {};
  for (const field of INFO_FIELDS) {
    const value = values[field];
    if (value === null) continue;
    if (field === "checkIn" || field === "checkOut") {
      if (!TIME.test(value)) errors[field] = "time";
      continue;
    }
    if (textLength(value) > INFO_LIMITS[field]) {
      errors[field] = "tooLong";
      continue;
    }
    if (field === "emergencyPhone" && !PHONE.test(value)) errors[field] = "phone";
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors, values } : { ok: true, values };
}

/** True when nothing is filled in (W22 «Leerzustand»). */
export function isInfoEmpty(values: InfoValues): boolean {
  return INFO_FIELDS.every((field) => values[field] === null);
}

/** First line of «Treffpunkt & Anreise» – the cockpit's goal status and meeting card. */
export function firstLine(value: string | null): string | null {
  if (!value) return null;
  const line = value.split("\n").find((part) => part.trim() !== "");
  return line ? line.trim() : null;
}

/** `tel:` target – only `+` and digits (W22 C); null when there are no digits. */
export function telHref(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^+0-9]/g, "").replace(/(?!^)\+/g, "");
  return /[0-9]/.test(digits) ? `tel:${digits}` : null;
}

/** «In Karten öffnen» – a plain link, nothing embedded or loaded in advance (W22 C). */
export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\s+/g, " ").trim())}`;
}

export type TextPart =
  { kind: "text"; text: string } | { kind: "link"; href: string; text: string };

/**
 * Splits free text into text and links: ONLY `https://` URLs become links (no `http:`, no
 * `javascript:`, no HTML/Markdown – W22 B). Trailing punctuation stays text.
 */
export function linkParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /https:\/\/[^\s<>"]+/gi;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    let url = match[0];
    const trailing = /[.,;:!?)\]}'»“”]+$/.exec(url);
    if (trailing) url = url.slice(0, -trailing[0].length);
    const start = match.index;
    if (!isSafeHttps(url)) continue;
    if (start > last) parts.push({ kind: "text", text: text.slice(last, start) });
    parts.push({ kind: "link", href: url, text: url });
    last = start + url.length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

function isSafeHttps(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

/**
 * Who may edit the infos (W22 C, R.1): in Increment 8 the organiser; Increment 11 (F-056)
 * adds people marked «bucht». Checked on the server for every save.
 */
export function canEditTripInfo(member: { role: "organizer" | "member" }): boolean {
  return member.role === "organizer";
}

/** «15:00» in the viewer's format («15:00» / «3:00 PM») – the stored value is HH:MM. */
export function formatTime(value: string, intl: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (hours === undefined || minutes === undefined || Number.isNaN(hours + minutes)) return value;
  return new Intl.DateTimeFormat(intl, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}
