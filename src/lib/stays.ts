import { cleanInfoText, textLength } from "./trip-info";

/**
 * Places to stay (F-031 stage 1, Increment 9 – features.md R.7, W17 F, W18 E): field rules,
 * link checks and normalisation, prices, ranking and visibility. Pure – shared by the forms
 * (client), the Server Actions / route handlers (server) and the tests.
 */

/** Limits (R.7 I9-02) – the database checks the same numbers (migration 0010). */
export const STAY_LIMITS = {
  url: 2048,
  title: 80,
  note: 200,
  siteName: 80,
  /** 1 000 000 in the trip currency. */
  priceMax: 1_000_000,
  /** Suggestions per trip (deleted ones do not count). */
  perTrip: 30,
  /** Travellers for «≈ … pro Person» (Should: organiser override). */
  partyMin: 1,
  partyMax: 50,
} as const;

/** Counters appear from these lengths on (W17 F.2). */
export const TITLE_COUNTER_FROM = 70;
export const NOTE_COUNTER_FROM = 160;

export type StayRatingValue = "like" | "nope";

/* ------------------------------------------------------------------------------------------ */
/* Links                                                                                        */
/* ------------------------------------------------------------------------------------------ */

export type LinkError = "missing" | "invalid" | "unusable";
export type LinkCheck = { ok: true; url: string; host: string } | { ok: false; error: LinkError };

/** Host names that never point to the public internet (R.7 Nr. 2, deployment.md §0.8). */
export function isReservedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host.includes(".")) return true; // `localhost`, `db`, `mailpit`, `app` …
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".home.arpa") ||
    host.endsWith(".arpa")
  );
}

/** IPv4 literal (the WHATWG parser already normalises `0x7f.1`, `2130706433` …) or IPv6. */
export function isIpLiteral(hostname: string): boolean {
  return hostname.startsWith("[") || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

/**
 * Adds `https://` to input without a scheme («booking.com/hotel/…», W17 F.2: «still
 * ergänzt»). Input that already names a scheme (also `http://`) stays as it is.
 */
export function completeUrl(input: string): string {
  const value = input.trim();
  if (value === "") return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[^:/]+\.[^:/]+:\d/.test(value)) return value;
  return `https://${value.replace(/^\/+/, "")}`;
}

/**
 * Link of a suggestion (R.7 I9-02): only `https://`, ≤ 2 048 characters, a real host name (no
 * IP address, no `localhost`/`*.local`/`*.internal`, no name without a dot), no credentials,
 * port 443 only. «invalid» = not a full https link, «unusable» = parseable but not allowed.
 */
export function checkStayUrl(input: unknown): LinkCheck {
  if (typeof input !== "string" || input.trim() === "") return { ok: false, error: "missing" };
  const raw = input.trim();
  if (/[\u0000- \u007F]/.test(raw)) return { ok: false, error: "invalid" };
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "invalid" };
  }
  if (url.protocol !== "https:") return { ok: false, error: "invalid" };
  if (url.hostname === "") return { ok: false, error: "invalid" };
  if (raw.length > STAY_LIMITS.url || url.href.length > STAY_LIMITS.url) {
    return { ok: false, error: "unusable" };
  }
  if (url.username !== "" || url.password !== "") return { ok: false, error: "unusable" };
  if (url.port !== "" && url.port !== "443") return { ok: false, error: "unusable" };
  if (isIpLiteral(url.hostname) || isReservedHostname(url.hostname)) {
    return { ok: false, error: "unusable" };
  }
  return { ok: true, url: url.href, host: displayHost(url.hostname) };
}

/** Domain shown on every card: lower case, without `www.` («booking.com»). */
export function displayHost(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

/** Domain of a stored link (empty for broken data – never throws). */
export function hostOf(url: string): string {
  try {
    return displayHost(new URL(url).hostname);
  } catch {
    return "";
  }
}

/** Links in the UI: only `https:` – checked again when rendering (no `javascript:`, R.7). */
export function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

/**
 * Query parameters that do not identify a place (R.7 I9-02): tracking/affiliate parameters
 * and the search context (dates, guests, positions in result lists). Best effort – portals
 * with different URLs for the same place are not detected (accepted).
 */
const DROP_PARAMS = new Set([
  // general tracking
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "msclkid",
  "yclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "_ga",
  "_gl",
  "ref",
  "ref_",
  "ref_src",
  "si",
  "share",
  // Booking.com
  "aid",
  "label",
  "sid",
  "srpvid",
  "srepoch",
  "sr_order",
  "ucfs",
  "sb",
  "sb_price_type",
  "all_sr_blocks",
  "highlighted_blocks",
  "matching_block_id",
  "hpos",
  "hapos",
  "dest_id",
  "dest_type",
  "dist",
  "type",
  "from",
  "group_adults",
  "group_children",
  "no_rooms",
  "req_adults",
  "req_children",
  "room1",
  "checkin",
  "checkout",
  // Airbnb
  "source_impression_id",
  "previous_page_section_name",
  "federated_search_id",
  "search_mode",
  "check_in",
  "check_out",
  "adults",
  "children",
  "infants",
  "pets",
  "guests",
  "photo_id",
  "location",
  // holiday-home portals (FeWo-direkt, Traum-Ferienwohnungen, HomeToGo …)
  "arrival",
  "departure",
  "startdate",
  "enddate",
  "persons",
  "partner",
  "affiliate",
  "campaign",
]);

function dropParam(name: string): boolean {
  const key = name.toLowerCase();
  return key.startsWith("utm_") || DROP_PARAMS.has(key);
}

/**
 * Key for duplicate detection (R.7 I9-02): host in lower case without `www.`, no fragment, no
 * trailing `/`, query without tracking/search parameters (remaining ones sorted). Input must
 * have passed `checkStayUrl`.
 */
export function normalizeStayUrl(url: string): string {
  const parsed = new URL(url);
  const host = displayHost(parsed.hostname);
  const path = parsed.pathname.replace(/\/+$/, "");
  const params = [...parsed.searchParams.entries()]
    .filter(([name]) => !dropParam(name))
    .sort(([a, x], [b, y]) => (a === b ? x.localeCompare(y) : a.localeCompare(b)));
  const query = new URLSearchParams(params).toString();
  return `${host}${path}${query ? `?${query}` : ""}`;
}

/* ------------------------------------------------------------------------------------------ */
/* Prices                                                                                       */
/* ------------------------------------------------------------------------------------------ */

export type PriceError = "price" | "priceMax";
export type PriceCheck = { ok: true; cents: number | null } | { ok: false; error: PriceError };

/**
 * Total price as typed (W17 F.2): separators by the UI language – DE «1.840» = 1 840,
 * «1840,50»; EN «1,840», «1840.50». Currency signs and spaces are ignored. Empty → no price.
 * Stored as cents (integer). > 0, ≤ 1 000 000, at most two decimals.
 *
 * W19 D.5.2 (also for W17): a SINGLE separator that is the «other» one (DE «.», EN «,») with
 * one or two digits at the end is the decimal separator – DE «12.5» = 12,50, EN «12,50» = 12.50
 * (Android keyboards often only offer «.» for `inputmode=decimal`). With exactly three digits
 * it stays a group separator («1.840» = 1 840).
 */
export function parsePrice(input: unknown, locale: string): PriceCheck {
  if (input === null || input === undefined) return { ok: true, cents: null };
  if (typeof input !== "string") return { ok: false, error: "price" };
  let value = input.replace(
    /[\s  €$£]|CHF|EUR|USD|GBP|DKK|SEK|NOK|PLN|CZK|HUF|CAD|AUD|kr|zł|Kč|Ft/gi,
    "",
  );
  if (value === "") return { ok: true, cents: null };
  const de = locale.startsWith("de");
  const other = de ? "." : ",";
  if (/^\d+[.,]\d{1,2}$/.test(value) && value.includes(other)) {
    value = value.replace(other, de ? "," : ".");
  }
  const group = de ? "." : ",";
  const groupRe = de ? "\\." : ",";
  const decimalRe = de ? "," : "\\.";
  const pattern = new RegExp(`^(\\d{1,3}(?:${groupRe}\\d{3})+|\\d+)(?:${decimalRe}(\\d{1,2}))?$`);
  const match = pattern.exec(value);
  if (!match) return { ok: false, error: "price" };
  const whole = Number((match[1] ?? "").split(group).join(""));
  const fraction = match[2] ? Number(match[2].padEnd(2, "0")) : 0;
  if (!Number.isSafeInteger(whole)) return { ok: false, error: "priceMax" };
  const cents = whole * 100 + fraction;
  if (cents <= 0) return { ok: false, error: "price" };
  if (cents > STAY_LIMITS.priceMax * 100) return { ok: false, error: "priceMax" };
  return { ok: true, cents };
}

/** Price for the edit form: «1840» / «1840,50» (DE) / «1840.50» (EN) – no grouping. */
export function priceInput(cents: number | null, locale: string): string {
  if (cents === null) return "";
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  if (fraction === 0) return String(whole);
  return `${String(whole)}${locale.startsWith("de") ? "," : "."}${String(fraction).padStart(2, "0")}`;
}

/** «2.050 €» / «£2,050» / «1.840,50 €» – the shared formatter of src/lib/money.ts. */
export { formatMoneyShort as formatMoney } from "./money";

/**
 * «≈ X pro Person» (R.7 I9-02): total ÷ travellers, rounded half up to whole currency units –
 * in cents, exact integer arithmetic.
 */
export function perPersonCents(totalCents: number, travellers: number): number {
  const count = Math.max(1, Math.floor(travellers));
  return Math.floor((totalCents + count * 50) / (count * 100)) * 100;
}

/**
 * Travellers for «pro Person»: members + placeholders that have not joined (also «ohne App»,
 * Q35) – or the organiser's override (1–50).
 */
export function travellerCount(members: number, openPlaceholders: number, override: number | null) {
  if (override !== null && override >= STAY_LIMITS.partyMin && override <= STAY_LIMITS.partyMax) {
    return override;
  }
  return Math.max(1, members + openPlaceholders);
}

/* ------------------------------------------------------------------------------------------ */
/* Form values                                                                                  */
/* ------------------------------------------------------------------------------------------ */

export interface StayFormInput {
  title: unknown;
  price: unknown;
  note: unknown;
}

export interface StayFormValues {
  title: string;
  priceCents: number | null;
  note: string | null;
}

export type StayFieldError = "titleMissing" | "tooLong" | PriceError;
export type StayFormErrors = Partial<Record<"title" | "price" | "note", StayFieldError>>;

/** Single-line text (title, note, site name): control characters removed, spaces collapsed. */
export function cleanLine(value: unknown): string | null {
  return cleanInfoText(value, false);
}

/** Cuts to `max` characters (code points) – for texts from a link preview. */
export function cutText(value: string, max: number): string {
  // Code points on purpose (like PostgreSQL's char_length and `textLength`).
  const chars = Array.from(value);
  return chars.length <= max ? value : chars.slice(0, max).join("");
}

/** Title, price and note of a suggestion (client on blur/submit, server again before saving). */
export function validateStayForm(
  input: StayFormInput,
  locale: string,
): { ok: true; values: StayFormValues } | { ok: false; errors: StayFormErrors } {
  const errors: StayFormErrors = {};
  const title = cleanLine(input.title);
  const note = cleanLine(input.note);
  if (!title) errors.title = "titleMissing";
  else if (textLength(title) > STAY_LIMITS.title) errors.title = "tooLong";
  if (note && textLength(note) > STAY_LIMITS.note) errors.note = "tooLong";
  const price = parsePrice(input.price, locale);
  if (!price.ok) errors.price = price.error;
  if (Object.keys(errors).length > 0 || !title || !price.ok) return { ok: false, errors };
  return { ok: true, values: { title, priceCents: price.cents, note } };
}

/* ------------------------------------------------------------------------------------------ */
/* Ranking & visibility (Q33, R.7 I9-06, W18 E.6)                                              */
/* ------------------------------------------------------------------------------------------ */

export interface RankInput {
  id: string;
  likes: number;
  nopes: number;
  /** Price per person in cents – null = no price (behind all with a price). */
  perPerson: number | null;
  /** Creation time (ms) – earlier first on a full tie. */
  createdAt: number;
}

export interface Ranked {
  id: string;
  /** Same ♥ AND same ✕ = same rank (1, 2, 2, 4) – W18 E.6.2. */
  rank: number;
  /** Another suggestion has the same rank. */
  tied: boolean;
  /** «Platz 1» chip: rank 1 with at least one ♥. */
  first: boolean;
}

export function compareStays(a: RankInput, b: RankInput): number {
  if (a.likes !== b.likes) return b.likes - a.likes;
  if (a.nopes !== b.nopes) return a.nopes - b.nopes;
  if (a.perPerson !== b.perPerson) {
    if (a.perPerson === null) return 1;
    if (b.perPerson === null) return -1;
    return a.perPerson - b.perPerson;
  }
  return a.createdAt - b.createdAt;
}

/** Ranking (R.7 I9-06): ♥ ↓, ✕ ↑, price per person ↑ (none last), older first. */
export function rankStays(items: readonly RankInput[]): Ranked[] {
  const sorted = [...items].sort(compareStays);
  return sorted.map((item) => {
    const better = items.filter(
      (other) =>
        other.likes > item.likes || (other.likes === item.likes && other.nopes < item.nopes),
    ).length;
    const tied = items.some(
      (other) => other.id !== item.id && other.likes === item.likes && other.nopes === item.nopes,
    );
    const rank = better + 1;
    return { id: item.id, rank, tied, first: rank === 1 && item.likes >= 1 };
  });
}

/**
 * «Fertig» (R.7 I9-06): the person has rated EVERY current suggestion. Nothing to rate →
 * done (vacuously; there is no ranking without suggestions).
 */
export function isDoneRating(stayIds: readonly string[], ratedIds: ReadonlySet<string>): boolean {
  return stayIds.every((id) => ratedIds.has(id));
}

/**
 * May anyone suggest a place (and fetch a link preview) right now? R.7 rights table: phase
 * «fixed», no place picked yet, fewer than 30 suggestions. Checked by the preview route BEFORE
 * any outbound request (R-077); `createStay` repeats it under the trip lock.
 */
export function canSuggestStay(state: { phase: string; chosen: boolean; count: number }): boolean {
  return state.phase === "fixed" && !state.chosen && state.count < STAY_LIMITS.perTrip;
}

/**
 * Q33 – may this person see counts, names and the order of other people's ratings? The
 * organiser always; members once they rated all current suggestions; everybody once a place
 * is picked (swiping is over).
 */
export function rankingVisible(viewer: { organizer: boolean; done: boolean; chosen: boolean }) {
  return viewer.organizer || viewer.done || viewer.chosen;
}

/**
 * «Neu» (W18 E.5.6): unrated suggestions created after the viewer's latest rating. Without
 * any rating nothing is «new».
 */
export function newSince(
  stays: readonly { id: string; createdAt: number }[],
  ratedIds: ReadonlySet<string>,
  lastRatedAt: number | null,
): string[] {
  if (lastRatedAt === null) return [];
  return stays.filter((s) => !ratedIds.has(s.id) && s.createdAt > lastRatedAt).map((s) => s.id);
}

/** Favourite for V3 (W16 v2.14): the first places of the ranking, or null without any ♥. */
export function favouriteOf(
  ranked: readonly Ranked[],
  titles: ReadonlyMap<string, string>,
  likes: ReadonlyMap<string, number>,
): { titles: string[]; likes: number } | null {
  const top = ranked.filter((r) => r.first);
  if (top.length === 0) return null;
  return {
    titles: top.map((r) => titles.get(r.id) ?? ""),
    likes: likes.get(top[0]?.id ?? "") ?? 0,
  };
}

/** Euro area (ISO 3166-1) – currency of a new trip from its holiday region (R.7 Datenhaltung). */
const EURO_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
  "AD",
  "MC",
  "SM",
  "VA",
  "ME",
  "XK",
]);
const OTHER_CURRENCIES: Record<string, string> = {
  GB: "GBP",
  CH: "CHF",
  LI: "CHF",
  US: "USD",
  DK: "DKK",
  SE: "SEK",
  NO: "NOK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  CA: "CAD",
  AU: "AUD",
};

export function currencyForCountry(country: string): string {
  const code = country.toUpperCase();
  if (EURO_COUNTRIES.has(code)) return "EUR";
  return OTHER_CURRENCIES[code] ?? "EUR";
}
