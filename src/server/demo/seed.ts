// Demo seed data (deployment.md §0.4, §0.7): synthetic people (@demo.test) and trips in every
// phase, dates relative to today. Shared by `scripts/seed-demo.ts` (local demo, Vercel build)
// and the «Demo zurücksetzen» action of the online preview (/demo/postfach).
// Self-contained on purpose (relative imports only, no `server-only`): runs with plain Node.
//
// Demo seed (deployment.md §0.4): synthetic data only (@demo.test), idempotent.
// Increment 2: real trips in different phases with several members (F-001 ff.). Dates are
// relative to today, so the demo always looks current. Increment 3: marked days (F-005) for
// everyone who submitted plus a draft, comments and placeholders (F-007). Increment 4: hand-made
// patterns for «Lissabon 2027» so the group calendar (F-008) shows clear suggestions (F-009):
// two «Alle dabei» periods and three «Fast alle dabei» periods (without Ben / David / Greta).
// Increment 5: «JGA Tim» has a running vote (F-010/F-011: 3 options, deadline, some votes, Anna
// has answered one option only – so Q13 a is visible: results only where she voted), «Familien-
// treffen Harz» has fixed dates (F-012) – everyone but Anna still gets the celebration once.
// Increment 6: Ben cancelled the vote of «Skiurlaub Arlberg» (Q21 – the others see the notice
// once in «Abstimmen»), «Kroatien Segeln» is deleted automatically in 10 days (F-013 banner for
// Anna), ida@demo.test organises «Städtetrip Wien» (with others) and a solo trip (F-043).
// Feedback-Runde 1 (ux-spec §14): more «Nächster Schritt» rows for Anna – «Kochkurs Toskana»
// (only the organiser Hanna is open → N1-11 «Hanna erinnern»), «Surfcamp Algarve» (Anna
// organises, all members in, placeholder Paul open → N1-6), «Silvester Prag» (everyone voted →
// Anna N2-9 «Ben Bescheid geben», Ben N2-6; Ben had fixed and reopened the dates, so Anna sees
// «Ben hat den Termin wieder geöffnet» once).
// Increment 8 (F-053 «Reiseverlauf», F-033 Infos): «Familientreffen Harz» (Vorbereitung, Anna
// organises – «Allen Bescheid geben» still due, placeholder Opa Klaus, infos filled),
// «Roadtrip Schottland» (Unterwegs, today is the arrival day – small celebration UX-8 and the
// meeting point as today's plan), «Gardasee» (Danach, back for 9 days, with infos).
// Increment 9 (F-031 «Unterkünfte», features.md R.7 Demo-Seed): «Kroatien 2027» (Vorbereitung,
// Ben organises, Anna is a member with 2 of 6 rated → V3 «du bist dran», ranking locked; one
// suggestion without image, one by a former member, notes), «Familientreffen Harz» (Anna
// organises, everybody rated 4 suggestions → V3 «Festlegen», favourite «Ferienhaus
// Brockenblick»), «Roadtrip Schottland» (picked and booked → tile), «Gardasee» (V3 «ohne App
// erledigt»). Images: our own demo images under /demo/stays, links on `*.example` (RFC 2606).
// Increment 10 (F-035/F-036 «Kosten teilen», features.md R.8 Demo-Seed): «Kroatien 2027»
// (Vorbereitung, 3 expenses incl. placeholder Lotte, «nach Beträgen» and a rest cent – Anna is
// owed), «Roadtrip Schottland» (Unterwegs, GBP, 8 expenses – Emma owes ≥ 50 £ → A1, Ben with a
// sample IBAN, Carla «PayPal: carla.demo»), «Gardasee» (Danach – Anna owes Felix → D1, Greta
// already paid, a former member still owes Felix), «Kroatien Segeln» (all square and closed).
// IBANs are well-known sample IBANs marked «(Demo)», never real accounts.
// Increment 11 (F-056 «Bucht», F-054 Reisedaten, features.md R.9 Demo-Seed): every fixed trip
// gives its organiser the default marking; «Kroatien 2027» – Ben handed it to David (Ben is
// organiser WITHOUT «Bucht», sees status only), David asks «Fähre Split – Hvar»: Carla shared,
// Anna open (V4 «du bist dran»), Emma «klärt es direkt», placeholder Lotte; «Familientreffen
// Harz» – Anna asks «Bahntickets Hannover – Braunlage»: Hanna shared (2 log rows), Greta open,
// Opa Klaus not joined; «Roadtrip Schottland» – Ben asks «Flüge nach Edinburgh» WITH the document:
// Anna, Carla, Emma shared (Emma's passport expires before the return); «Gardasee» – Felix's
// request is gone after the deletion date (D3 done). All names, dates and numbers are made up;
// document numbers start with DEMO; releases are encrypted through the app's cipher module.
import { randomBytes, randomInt } from "node:crypto";
import type { ClientBase } from "pg";
import { addDays, todayIso } from "../../lib/dates.ts";
import { CONSENT_VERSION, TRAVEL_SCHEMA_VERSION } from "../../lib/travel-data.ts";
import { currentKeyRing, sealRecord } from "../travel-data/cipher.ts";

export const DEMO_DOMAIN = "@demo.test";

// Same formats as src/lib/tokens.ts (kept self-contained: scripts run without the app build).
const PUBLIC_ID_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const publicId = () =>
  Array.from({ length: 10 }, () => PUBLIC_ID_ALPHABET.charAt(randomInt(32))).join("");
const inviteToken = () => randomBytes(32).toString("base64url");

/**
 * Deterministic demo pattern for one member (F-005): a few blocks of «geht nicht» and some
 * «zur Not» days, different per person – enough for a lively heatmap later.
 */
function demoDays(rangeStart: string, rangeEnd: string, seed: number): [string, string][] {
  const out: [string, string][] = [];
  const start = new Date(`${rangeStart}T00:00:00Z`);
  const end = new Date(`${rangeEnd}T00:00:00Z`);
  for (let i = 0, d = new Date(start); d <= end; i++, d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if ((i + seed * 7) % 17 < 3) out.push([iso, "no"]);
    else if ((i + seed * 5) % 13 === 0 && d.getUTCDay() !== 0 && d.getUTCDay() !== 6)
      out.push([iso, "maybe"]);
  }
  return out;
}

/** Explicit pattern: «geht nicht» ranges and «zur Not» days as offsets from the range start. */
interface DayPattern {
  no: [number, number][];
  maybe: number[];
}

function patternDays(rangeStart: string, pattern: DayPattern): [string, string][] {
  const at = (offset: number) => {
    const date = new Date(`${rangeStart}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const out: [string, string][] = [];
  for (const [from, to] of pattern.no) {
    for (let offset = from; offset <= to; offset++) out.push([at(offset), "no"]);
  }
  for (const offset of pattern.maybe) out.push([at(offset), "maybe"]);
  return out;
}

/** ISO date `days` from today (calendar day in the app time zone, R-072). */
function day(days: number): string {
  return addDays(todayIso(), days);
}

interface Person {
  key: string;
  name: string;
  locale: "de" | "en";
  country: string;
  subdivision?: string;
}

const PEOPLE: Person[] = [
  { key: "anna", name: "Anna Schmidt", locale: "de", country: "DE", subdivision: "DE-BY" },
  { key: "ben", name: "Ben Wagner", locale: "de", country: "DE", subdivision: "DE-BE" },
  { key: "carla", name: "Carla Rossi", locale: "en", country: "GB" },
  { key: "david", name: "David Huber", locale: "de", country: "AT" },
  { key: "emma", name: "Emma Brown", locale: "en", country: "US" },
  { key: "felix", name: "Felix Meier", locale: "de", country: "CH" },
  { key: "greta", name: "Greta Lind", locale: "de", country: "DE" },
  { key: "hanna", name: "Hanna Koch", locale: "de", country: "DE", subdivision: "DE-NW" },
  // Increment 6: account to play through «Konto löschen» (F-043) – organises a trip with
  // others (hand-over or delete) and a solo trip (deleted with the account).
  { key: "ida", name: "Ida Vogel", locale: "de", country: "DE", subdivision: "DE-HH" },
];

interface MemberSeed {
  person: string;
  /** Display name in this trip (first name by default). */
  name?: string;
  organizer?: boolean;
  submitted?: boolean;
  voted?: boolean;
  /** Marked days although not submitted yet (draft, F-005). */
  draft?: boolean;
  comment?: string;
  /** Hand-made days instead of the generic demo pattern. */
  pattern?: DayPattern;
  /** Answers per option index (F-011). */
  votes?: ("yes" | "maybe" | "no" | null)[];
  /** Has already seen «Es geht los!» for the fixed range (F-012). */
  celebrated?: boolean;
  /** Celebrated a range that was unfixed again – reopen notice still due (ux-spec §14.4). */
  celebratedRange?: [string, string];
}

/** A suggested place to stay (F-031) – demo images of our own, links on `*.example`. */
interface StaySeed {
  title: string;
  url: string;
  site?: string;
  /** Total price in whole currency units. */
  price?: number;
  note?: string;
  /** File name under /public/demo/stays (without .svg) – none = placeholder card. */
  image?: string;
  /** Person key of the author – null = «ehemaliges Mitglied». */
  by: string | null;
  /** Days ago the suggestion was made. */
  daysAgo: number;
  ratings: Record<string, "like" | "nope">;
  chosen?: boolean;
  booked?: boolean;
}

/**
 * Cost splitting (F-035/F-036). People: member keys, `ph:<placeholder name>` or `former<n>`
 * (a member who left). Amounts in whole/decimal currency units (converted to cents).
 */
interface CostSeed {
  /** Former members – parties without an account («ehemaliges Mitglied n»). */
  formers?: number;
  expenses: {
    title: string;
    amount: number;
    payer: string;
    /** «all» = every member, placeholder and former member of this seed. */
    for: "all" | string[];
    /** «nach Beträgen» (sum must equal the amount). */
    amounts?: Record<string, number>;
    category?: "accommodation" | "travel" | "food" | "activities" | "other";
    /** Days relative to today. */
    day: number;
    note?: string;
    /** Member key of the creator (default: payer, else the organiser). */
    by?: string;
  }[];
  settlements?: { from: string; to: string; amount: number; by: string; daysAgo: number }[];
  payInfo?: Record<string, { iban?: string; note?: string }>;
  closedBy?: string;
}

/** Travel details (Increment 11): values per person – made up, numbers start with DEMO. */
interface TravelValuesSeed {
  givenNames: string;
  familyNames: string;
  birthDate: string;
  sex?: "F" | "M" | "X";
  nationality?: string;
  documentType?: "passport" | "id_card";
  documentNumber?: string;
  documentExpiry?: string;
  issuingCountry?: string;
}

interface TravelRequestSeed {
  by: string;
  purpose: string;
  fields: string[];
  daysAgo: number;
  /** Member keys or `ph:<placeholder name>` → state; released people need `values`. */
  answers: Record<string, "open" | "released" | "declined" | "expired">;
  values?: Record<string, TravelValuesSeed>;
  /** Access log rows of the asking person per released member. */
  access?: Record<string, { action: "view" | "copy"; field?: string; hoursAgo: number }[]>;
  closed?: { reason: "done" | "expired"; daysAgo: number };
}

interface TravelSeed {
  /** Member keys with the marking «Bucht» (default: the organiser). */
  bookers?: string[];
  requests?: TravelRequestSeed[];
}

interface TripSeed {
  name: string;
  description?: string;
  rangeStart: string;
  rangeEnd: string;
  minNights: number;
  preferredNights?: number;
  deadline?: string;
  country: string;
  subdivision?: string;
  locale: "de" | "en";
  phase: "collecting" | "voting" | "fixed";
  fixedStart?: string;
  fixedEnd?: string;
  joinOpen?: boolean;
  members: MemberSeed[];
  /** Expected people who have not joined yet (F-007). */
  placeholders?: string[];
  /** Vote options as [arrival, departure] (F-010). */
  options?: [string, string][];
  pollDeadline?: string;
  /** Days ago the dates were fixed (start of the «Vorfreude» ring). */
  fixedDaysAgo?: number;
  /** Q21: the vote was cancelled a day ago by this person – the others see the notice once. */
  pollCanceledBy?: string;
  /** Infos of the fixed trip (F-033) – last edited by the organiser. */
  info?: {
    stayName?: string;
    address?: string;
    checkIn?: string;
    checkOut?: string;
    meetingPoint?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    notes?: string;
  };
  /** Places to stay (F-031, Increment 9). */
  stays?: StaySeed[];
  /** UX-9: V3 «ohne App erledigt» set by this person. */
  stayWithoutAppBy?: string;
  /** Cost splitting (Increment 10). */
  costs?: CostSeed;
  /** «Bucht» + travel details (Increment 11). */
  travel?: TravelSeed;
}

const TRIPS: TripSeed[] = [
  {
    name: "Lissabon 2027",
    description: "Sonne, Pastéis, Surfen. Wer ist dabei?",
    rangeStart: day(30),
    rangeEnd: day(90),
    minNights: 4,
    preferredNights: 5,
    deadline: day(14),
    country: "DE",
    subdivision: "DE-BY",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "anna", organizer: true, draft: true },
      {
        person: "ben",
        submitted: true,
        comment: "Im Januar nur mit Kindern",
        pattern: {
          no: [
            [0, 4],
            [16, 20],
            [50, 60],
          ],
          maybe: [10, 45],
        },
      },
      {
        person: "carla",
        submitted: true,
        pattern: {
          no: [
            [5, 9],
            [22, 26],
          ],
          maybe: [15],
        },
      },
      {
        person: "david",
        submitted: true,
        pattern: {
          no: [
            [0, 2],
            [16, 23],
            [46, 49],
          ],
          maybe: [38],
        },
      },
      {
        person: "emma",
        submitted: true,
        comment: "Flights from London are cheaper midweek",
        pattern: {
          no: [
            [3, 6],
            [24, 30],
            [52, 55],
          ],
          maybe: [],
        },
      },
      { person: "felix" },
      {
        person: "greta",
        submitted: true,
        pattern: {
          no: [
            [7, 9],
            [27, 37],
          ],
          maybe: [12],
        },
      },
    ],
    placeholders: ["Mia", "Tom"],
  },
  {
    name: "Skiurlaub Arlberg",
    rangeStart: day(60),
    rangeEnd: day(120),
    minNights: 5,
    country: "AT",
    locale: "de",
    phase: "collecting",
    pollCanceledBy: "ben",
    members: [
      { person: "ben", organizer: true, submitted: true },
      { person: "anna", submitted: true },
      { person: "david", submitted: true },
      { person: "hanna", submitted: true },
    ],
  },
  {
    name: "JGA Tim",
    description: "Ein Wochenende, eine Stadt, viel Quatsch.",
    rangeStart: day(20),
    rangeEnd: day(75),
    minNights: 2,
    preferredNights: 3,
    country: "DE",
    locale: "de",
    phase: "voting",
    options: [
      [day(27), day(30)],
      [day(34), day(37)],
      [day(48), day(51)],
    ],
    pollDeadline: day(5),
    members: [
      { person: "carla", organizer: true, submitted: true, votes: ["yes", "maybe", "no"] },
      { person: "anna", submitted: true, votes: ["yes", null, null] },
      { person: "ben", submitted: true, votes: ["yes", "yes", "maybe"] },
      { person: "felix", submitted: true, votes: ["maybe", "yes", "no"] },
      { person: "greta", submitted: true },
    ],
  },
  {
    name: "Familientreffen Harz",
    rangeStart: day(10),
    rangeEnd: day(70),
    minNights: 3,
    country: "DE",
    subdivision: "DE-NW",
    locale: "de",
    phase: "fixed",
    fixedStart: day(41),
    fixedEnd: day(45),
    fixedDaysAgo: 6,
    options: [
      [day(41), day(45)],
      [day(55), day(59)],
    ],
    placeholders: ["Opa Klaus"],
    travel: {
      requests: [
        {
          by: "anna",
          purpose: "Bahntickets Hannover – Braunlage",
          fields: ["legal_name", "birth_date"],
          daysAgo: 3,
          answers: { hanna: "released", greta: "open", "ph:Opa Klaus": "open" },
          values: {
            hanna: { givenNames: "Hanna Sophie", familyNames: "Koch", birthDate: "1991-05-23" },
          },
          access: {
            hanna: [
              { action: "view", hoursAgo: 26 },
              { action: "copy", field: "birth_date", hoursAgo: 25 },
            ],
          },
        },
      ],
    },
    info: {
      stayName: "Ferienhaus Brockenblick",
      address: "Am Kurpark 12\n38700 Braunlage",
      checkIn: "15:00",
      checkOut: "10:00",
      meetingPoint:
        "Treffpunkt 9:00 Uhr am Hauptbahnhof Hannover, Gleis 8\nWir fahren mit zwei Autos.",
      emergencyName: "Vermieterin Frau Krüger",
      emergencyPhone: "+49 5520 123456",
      notes:
        "Bettwäsche ist dabei, Handtücher bitte selbst mitbringen.\nWanderkarte: https://www.harzinfo.de",
    },
    stays: [
      {
        title: "Ferienhaus Brockenblick",
        url: "https://ferienhaus.example/harz/brockenblick",
        site: "Ferienhaus Example",
        price: 980,
        note: "Sauna im Keller, Platz für alle",
        image: "demo-chalet-berge",
        by: "anna",
        daysAgo: 5,
        ratings: { anna: "like", hanna: "like", greta: "like" },
      },
      {
        title: "Blockhaus am Oderteich",
        url: "https://unterkunft.example/blockhaus-oderteich",
        price: 860,
        image: "demo-holzhuette-see",
        by: "hanna",
        daysAgo: 4,
        ratings: { anna: "like", hanna: "like", greta: "nope" },
      },
      {
        title: "Pension Harzblick",
        url: "https://booking.example/hotel/pension-harzblick",
        site: "Booking Example",
        price: 720,
        by: "greta",
        daysAgo: 4,
        ratings: { anna: "nope", hanna: "like", greta: "nope" },
      },
      {
        title: "Mobilheim am Kurpark",
        url: "https://camping.example/kurpark/mobilheim-7",
        price: 540,
        image: "demo-mobilheim-camping",
        by: "anna",
        daysAgo: 3,
        ratings: { anna: "nope", hanna: "nope", greta: "nope" },
      },
    ],
    members: [
      {
        person: "anna",
        organizer: true,
        submitted: true,
        votes: ["yes", "maybe"],
        celebrated: true,
        // Offsets from the range start (day 10): fixed range = 31–35, option 2 = 45–49.
        pattern: { no: [[0, 5]], maybe: [46, 47] },
      },
      {
        person: "hanna",
        submitted: true,
        votes: ["yes", "no"],
        pattern: {
          no: [
            [10, 14],
            [44, 50],
          ],
          maybe: [33],
        },
      },
      {
        person: "greta",
        submitted: true,
        votes: ["yes", "yes"],
        pattern: { no: [[20, 24]], maybe: [] },
      },
    ],
  },
  {
    name: "Wanderwoche Dolomiten",
    rangeStart: day(45),
    rangeEnd: day(150),
    minNights: 6,
    preferredNights: 7,
    country: "CH",
    locale: "de",
    phase: "collecting",
    joinOpen: false,
    members: [
      { person: "felix", organizer: true },
      { person: "anna" },
      { person: "emma", submitted: true, comment: "Only in September" },
    ],
    placeholders: ["Jule"],
  },
  {
    name: "Malle 2026",
    rangeStart: day(-120),
    rangeEnd: day(-40),
    minNights: 4,
    country: "DE",
    locale: "de",
    phase: "fixed",
    fixedStart: day(-60),
    fixedEnd: day(-55),
    members: [
      { person: "anna", organizer: true, submitted: true, voted: true },
      { person: "ben", submitted: true, voted: true },
    ],
  },
  // Increment 6 (F-013): fixed trip that ended 80 days ago → automatic deletion in 10 days,
  // Anna (Orga) sees the banner «Wird am … gelöscht» in «Meine Reisen».
  {
    name: "Kroatien Segeln",
    rangeStart: day(-160),
    rangeEnd: day(-70),
    minNights: 5,
    country: "DE",
    locale: "de",
    phase: "fixed",
    fixedStart: day(-87),
    fixedEnd: day(-80),
    members: [
      { person: "anna", organizer: true, submitted: true, voted: true, celebrated: true },
      { person: "hanna", submitted: true, voted: true, celebrated: true },
    ],
    costs: {
      expenses: [
        {
          title: "Bootscharter",
          amount: 800,
          payer: "anna",
          for: "all",
          category: "activities",
          day: -87,
        },
        {
          title: "Hafengebühren",
          amount: 60,
          payer: "hanna",
          for: "all",
          category: "travel",
          day: -84,
        },
      ],
      settlements: [{ from: "hanna", to: "anna", amount: 370, by: "hanna", daysAgo: 75 }],
      closedBy: "anna",
    },
  },
  // Feedback-Runde 1 (ux-spec §14.1): Anna is in, only the organiser is open (N1-11).
  {
    name: "Kochkurs Toskana",
    rangeStart: day(35),
    rangeEnd: day(95),
    minNights: 3,
    preferredNights: 4,
    deadline: day(10),
    country: "DE",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "hanna", organizer: true },
      { person: "anna", submitted: true },
      { person: "ben", submitted: true },
    ],
  },
  // Anna organises; every member is in, only the placeholder Paul is open (N1-6).
  {
    name: "Surfcamp Algarve",
    description: "Wellen, Sonne, Bohnen aus der Dose.",
    rangeStart: day(50),
    rangeEnd: day(110),
    minNights: 5,
    country: "DE",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "anna", organizer: true, submitted: true },
      { person: "carla", submitted: true },
      { person: "david", submitted: true },
    ],
    placeholders: ["Paul"],
  },
  // Everyone voted (Anna N2-9, Ben N2-6); Ben reopened fixed dates – Anna sees the notice once.
  {
    name: "Silvester Prag",
    rangeStart: day(25),
    rangeEnd: day(80),
    minNights: 2,
    preferredNights: 3,
    country: "DE",
    locale: "de",
    phase: "voting",
    options: [
      [day(30), day(33)],
      [day(44), day(47)],
    ],
    members: [
      { person: "ben", organizer: true, submitted: true, votes: ["yes", "maybe"] },
      {
        person: "anna",
        submitted: true,
        votes: ["yes", "no"],
        celebratedRange: [day(30), day(33)],
      },
      { person: "greta", submitted: true, votes: ["maybe", "yes"] },
    ],
  },
  // Increment 8: travelling – today is the arrival day (UX-8 small celebration, H-7).
  {
    name: "Roadtrip Schottland",
    rangeStart: day(-60),
    rangeEnd: day(30),
    minNights: 6,
    country: "GB",
    locale: "de",
    phase: "fixed",
    fixedStart: day(0),
    fixedEnd: day(7),
    fixedDaysAgo: 40,
    info: {
      stayName: "Glen Coe Cottages",
      address: "Glencoe, Ballachulish PH49 4HX, Schottland",
      checkIn: "16:00",
      checkOut: "10:30",
      meetingPoint:
        "Treffpunkt 7:30 Uhr · Flughafen Edinburgh, Mietwagen-Schalter\nBen holt den Wagen.",
      notes: "Linksverkehr! Regenjacke einpacken.",
    },
    stays: [
      {
        title: "Glen Coe Cottages",
        url: "https://cottages.example/glencoe",
        site: "Cottages Example",
        price: 1650,
        image: "demo-holzhuette-see",
        by: "ben",
        daysAgo: 35,
        ratings: { ben: "like", anna: "like", carla: "like", emma: "like" },
        chosen: true,
        booked: true,
      },
      {
        title: "Highland Lodge Fort William",
        url: "https://booking.example/hotel/highland-lodge",
        price: 1920,
        image: "demo-chalet-berge",
        by: "carla",
        daysAgo: 34,
        ratings: { ben: "nope", anna: "like", carla: "like", emma: "nope" },
      },
    ],
    members: [
      { person: "ben", organizer: true, submitted: true, voted: true, celebrated: true },
      { person: "anna", submitted: true, voted: true, celebrated: true },
      { person: "carla", submitted: true, voted: true, celebrated: true },
      { person: "emma", submitted: true, voted: true, celebrated: true },
    ],
    travel: {
      requests: [
        {
          by: "ben",
          purpose: "Flüge nach Edinburgh",
          fields: [
            "legal_name",
            "birth_date",
            "nationality",
            "document",
            "document_expiry",
            "issuing_country",
          ],
          daysAgo: 30,
          answers: { anna: "released", carla: "released", emma: "released" },
          values: {
            anna: {
              givenNames: "Anna Lena",
              familyNames: "Schmidt",
              birthDate: "1993-02-11",
              nationality: "DE",
              documentType: "passport",
              documentNumber: "DEMO4711A",
              documentExpiry: day(900),
              issuingCountry: "DE",
            },
            carla: {
              givenNames: "Carla Maria",
              familyNames: "Rossi",
              birthDate: "1994-03-15",
              nationality: "IT",
              documentType: "id_card",
              documentNumber: "DEMOCA2741",
              documentExpiry: day(1200),
              issuingCountry: "IT",
            },
            emma: {
              givenNames: "Emma Jane",
              familyNames: "Brown",
              birthDate: "1996-09-30",
              nationality: "US",
              documentType: "passport",
              documentNumber: "DEMO550193",
              documentExpiry: day(5),
              issuingCountry: "US",
            },
          },
          access: { anna: [{ action: "view", hoursAgo: 700 }] },
        },
      ],
    },
    costs: {
      expenses: [
        {
          title: "Glen Coe Cottages",
          amount: 1650,
          payer: "ben",
          for: "all",
          category: "accommodation",
          day: -35,
        },
        {
          title: "Mietwagen",
          amount: 680,
          payer: "anna",
          for: "all",
          category: "travel",
          day: -20,
          note: "Inkl. Zusatzfahrerin",
        },
        {
          title: "Tankstelle Edinburgh",
          amount: 68.4,
          payer: "carla",
          for: "all",
          category: "travel",
          day: 0,
        },
        { title: "Supermarkt", amount: 54.2, payer: "anna", for: "all", category: "food", day: 0 },
        { title: "Parkgebühren", amount: 12, payer: "ben", for: "all", category: "other", day: 0 },
        {
          title: "Fish & Chips",
          amount: 46.8,
          payer: "emma",
          for: "all",
          category: "food",
          day: 0,
        },
        {
          title: "Fähre Isle of Skye",
          amount: 96,
          payer: "ben",
          for: ["ben", "anna", "carla"],
          category: "travel",
          day: 0,
        },
        {
          title: "Whisky-Tasting",
          amount: 75,
          payer: "carla",
          for: ["carla", "emma"],
          category: "activities",
          day: 0,
        },
      ],
      payInfo: {
        ben: { iban: "GB82WEST12345698765432", note: "(Demo)" },
        carla: { note: "PayPal: carla.demo" },
      },
    },
  },
  // Increment 8: back for 9 days («Danach», H-5b, deletion hint).
  {
    name: "Gardasee",
    rangeStart: day(-90),
    rangeEnd: day(-5),
    minNights: 5,
    country: "DE",
    locale: "de",
    phase: "fixed",
    fixedStart: day(-16),
    fixedEnd: day(-9),
    fixedDaysAgo: 70,
    info: {
      stayName: "Casa Limone",
      address: "Via Nanzello 4, 25010 Limone sul Garda, Italien",
      checkIn: "15:00",
      checkOut: "10:00",
    },
    stayWithoutAppBy: "felix",
    travel: {
      requests: [
        {
          by: "felix",
          purpose: "Fähre Limone – Malcesine",
          fields: ["legal_name", "birth_date"],
          daysAgo: 30,
          // Deleted by the retention job on the deletion date (departure + 7) – only the hull.
          answers: { anna: "expired", greta: "declined" },
          closed: { reason: "expired", daysAgo: 1 },
        },
      ],
    },
    members: [
      { person: "felix", organizer: true, submitted: true, voted: true, celebrated: true },
      { person: "anna", submitted: true, voted: true, celebrated: true },
      { person: "greta", submitted: true, voted: true, celebrated: true },
    ],
    costs: {
      formers: 1,
      expenses: [
        {
          title: "Casa Limone",
          amount: 1200,
          payer: "felix",
          for: "all",
          category: "accommodation",
          day: -16,
        },
        {
          title: "Bootstour Limone",
          amount: 160,
          payer: "anna",
          for: "all",
          category: "activities",
          day: -13,
        },
        {
          title: "Abendessen am Hafen",
          amount: 220,
          payer: "greta",
          for: "all",
          category: "food",
          day: -11,
          note: "Inkl. Trinkgeld",
        },
      ],
      settlements: [{ from: "greta", to: "felix", amount: 175, by: "greta", daysAgo: 5 }],
      payInfo: { felix: { iban: "DE89370400440532013000", note: "(Demo)" } },
    },
  },
  // Increment 9 (F-031): Anna is a member, 2 of 6 places rated – V3 «du bist dran», ranking
  // locked; Ben organises. Placeholder Lotte counts for «≈ … pro Person» (Q35).
  {
    name: "Kroatien 2027",
    description: "Eine Woche Sonne, Meer und Altstadt – wer bucht was?",
    rangeStart: day(30),
    rangeEnd: day(100),
    minNights: 7,
    country: "DE",
    locale: "de",
    phase: "fixed",
    fixedStart: day(60),
    fixedEnd: day(67),
    fixedDaysAgo: 12,
    options: [[day(60), day(67)]],
    placeholders: ["Lotte"],
    travel: {
      bookers: ["david"],
      requests: [
        {
          by: "david",
          purpose: "Fähre Split – Hvar",
          fields: ["legal_name", "birth_date"],
          daysAgo: 2,
          answers: {
            ben: "open",
            anna: "open",
            carla: "released",
            emma: "declined",
            "ph:Lotte": "open",
          },
          values: {
            carla: { givenNames: "Carla Maria", familyNames: "Rossi", birthDate: "1994-03-15" },
          },
        },
      ],
    },
    members: [
      { person: "ben", organizer: true, submitted: true, votes: ["yes"], celebrated: true },
      { person: "anna", submitted: true, votes: ["yes"], celebrated: true },
      { person: "carla", submitted: true, votes: ["yes"], celebrated: true },
      { person: "david", submitted: true, votes: ["yes"], celebrated: true },
      { person: "emma", submitted: true, votes: ["yes"], celebrated: true },
    ],
    costs: {
      expenses: [
        {
          title: "Anzahlung Fähre",
          amount: 180,
          payer: "david",
          for: "all",
          category: "travel",
          day: -5,
        },
        {
          title: "Mietwagen-Anzahlung",
          amount: 150,
          payer: "anna",
          for: ["ben", "anna", "carla", "david"],
          amounts: { ben: 40, anna: 30, carla: 40, david: 40 },
          category: "travel",
          day: -3,
        },
        {
          title: "Kleinkram",
          amount: 10,
          payer: "ben",
          for: ["ben", "anna", "emma"],
          category: "other",
          day: -1,
        },
      ],
    },
    stays: [
      {
        title: "Villa Mare mit Pool",
        url: "https://booking.example/hotel/hr/villa-mare",
        site: "Booking Example",
        price: 2380,
        image: "demo-villa-pool",
        by: "ben",
        daysAgo: 9,
        ratings: { ben: "like", anna: "like", carla: "like", david: "nope" },
      },
      {
        title: "Apartment Lavanda – Altstadt",
        url: "https://ferienwohnung.example/split/lavanda",
        price: 1690,
        image: "demo-altstadtwohnung",
        by: "carla",
        daysAgo: 8,
        ratings: { ben: "nope", anna: "nope", carla: "like", david: "like" },
      },
      {
        title: "Kamena Kuća – Steinhaus",
        url: "https://unterkunft.example/rooms/kamena-kuca",
        price: 2050,
        note: "5 Min. zum Zlatni Rat",
        by: "david",
        daysAgo: 4,
        ratings: { ben: "like", carla: "like", david: "like" },
      },
      {
        title: "Casa Azul am Hafen",
        url: "https://booking.example/hotel/hr/casa-azul",
        site: "Booking Example",
        image: "demo-apartment-hafen",
        by: "ben",
        daysAgo: 3,
        ratings: { ben: "like", carla: "nope" },
      },
      {
        title: "Ferienwohnung Bačvice",
        url: "https://ferienwohnung.example/split/bacvice",
        price: 1420,
        image: "demo-strandhaus-duenen",
        by: null,
        daysAgo: 3,
        ratings: { ben: "nope", carla: "like" },
      },
      {
        title: "Haus Galeb – Meerblick & Terrasse",
        url: "https://ferienhaus.example/hr/haus-galeb",
        site: "Ferienhaus Example",
        price: 1840,
        note: "Terrasse mit Grill, 2 Bäder",
        image: "demo-steinhaus-meerblick",
        by: "emma",
        daysAgo: 1,
        ratings: { ben: "like" },
      },
    ],
  },
  // Increment 6 (F-043): Ida organises a trip with others and a solo trip.
  {
    name: "Städtetrip Wien",
    rangeStart: day(40),
    rangeEnd: day(100),
    minNights: 3,
    country: "AT",
    locale: "de",
    phase: "collecting",
    members: [
      { person: "ida", organizer: true, submitted: true },
      { person: "carla", submitted: true },
      { person: "ben" },
    ],
  },
  {
    name: "Idas Testreise",
    rangeStart: day(30),
    rangeEnd: day(60),
    minNights: 2,
    country: "DE",
    locale: "de",
    phase: "collecting",
    members: [{ person: "ida", organizer: true }],
  },
];

/** «Gleich» (R.8 rule 3): rest cents to the first parties by seq (order of `parties`). */
function splitEqualCents(amount: number, parties: string[]): Map<string, number> {
  const base = Math.floor(amount / parties.length);
  const rest = amount - base * parties.length;
  return new Map(parties.map((p, i) => [p, base + (i < rest ? 1 : 0)]));
}

/** Parties (in fixed order), expenses with shares, settlements, payment details, closing. */
async function seedCosts(
  client: Pick<ClientBase, "query">,
  tripId: string,
  seed: TripSeed,
  ids: Map<string, string>,
  placeholderIds: Map<string, string>,
): Promise<void> {
  const costs = seed.costs;
  if (!costs) return;
  const orga = seed.members.find((m) => m.organizer)?.person ?? "";
  const order = [
    ...seed.members.map((m) => m.person),
    ...(seed.placeholders ?? []).map((name) => `ph:${name}`),
    ...Array.from({ length: costs.formers ?? 0 }, (_, i) => `former${String(i + 1)}`),
  ];
  const party = new Map<string, string>();
  for (const [index, key] of order.entries()) {
    const former = key.startsWith("former");
    const row = await client.query<{ id: string }>(
      `insert into trip_cost_party (trip_id, seq, user_id, placeholder_id, former_at, former_no)
       values ($1, $2, $3, $4, case when $5::boolean then now() - interval '6 days' end, $6)
       returning id`,
      [
        tripId,
        index + 1,
        key.startsWith("ph:") || former ? null : (ids.get(key) ?? null),
        key.startsWith("ph:") ? (placeholderIds.get(key.slice(3)) ?? null) : null,
        former,
        former ? Number(key.slice(6)) : null,
      ],
    );
    party.set(key, row.rows[0]?.id ?? "");
  }
  for (const [position, expense] of costs.expenses.entries()) {
    const cents = Math.round(expense.amount * 100);
    const members = expense.for === "all" ? order : order.filter((k) => expense.for.includes(k));
    const shares = expense.amounts
      ? new Map(Object.entries(expense.amounts).map(([k, v]) => [k, Math.round(v * 100)]))
      : splitEqualCents(cents, members);
    const by = expense.by ?? (ids.has(expense.payer) ? expense.payer : orga);
    const row = await client.query<{ id: string }>(
      `insert into trip_expense (trip_id, title, note, amount_cents, currency, category, spent_on,
         payer_party_id, split_mode, created_by, updated_by, created_at, updated_at)
       select $1, $2, $3, $4, t.currency, $5, $6, $7, $8, $9, $9,
         now() - make_interval(mins => $10), now() - make_interval(mins => $10)
       from trip t where t.id = $1 returning id`,
      [
        tripId,
        expense.title,
        expense.note ?? null,
        cents,
        expense.category ?? null,
        day(expense.day),
        party.get(expense.payer),
        expense.amounts ? "amounts" : "equal",
        ids.get(by) ?? null,
        (costs.expenses.length - position) * 30,
      ],
    );
    for (const [key, share] of shares) {
      await client.query(
        `insert into trip_expense_share (expense_id, trip_id, party_id, share_cents)
         values ($1, $2, $3, $4)`,
        [row.rows[0]?.id, tripId, party.get(key), share],
      );
    }
  }
  for (const s of costs.settlements ?? []) {
    await client.query(
      `insert into trip_settlement (trip_id, from_party_id, to_party_id, amount_cents, marked_by,
         marked_at) values ($1, $2, $3, $4, $5, now() - make_interval(days => $6))`,
      [
        tripId,
        party.get(s.from),
        party.get(s.to),
        Math.round(s.amount * 100),
        ids.get(s.by),
        s.daysAgo,
      ],
    );
  }
  for (const [key, info] of Object.entries(costs.payInfo ?? {})) {
    await client.query(
      `update trip_member set payment_iban = $3, payment_note = $4,
         payment_updated_at = now() - interval '3 days' where trip_id = $1 and user_id = $2`,
      [tripId, ids.get(key), info.iban ?? null, info.note ?? null],
    );
  }
  if (costs.closedBy) {
    await client.query(
      `update trip set costs_closed_at = now() - interval '70 days', costs_closed_by = $2
       where id = $1`,
      [tripId, ids.get(costs.closedBy)],
    );
  }
}

/** True if at least one demo person exists (the build seeds only an empty preview). */
/**
 * «Bucht» + travel details (Increment 11, R.9 Demo-Seed): the default marking (organiser) or the
 * seed's `bookers`, requests with recipients, ENCRYPTED releases (same cipher module as the app,
 * same AAD) and access-log rows. Without a key (no BETTER_AUTH_SECRET/TRAVEL_DATA_KEYS) released
 * answers stay «offen» – nothing is ever stored in plain text.
 */
async function seedTravel(
  client: Pick<ClientBase, "query">,
  tripId: string,
  seed: TripSeed,
  ids: Map<string, string>,
  placeholders: Map<string, string>,
): Promise<void> {
  const orga = seed.members.find((m) => m.organizer)?.person;
  const bookers = seed.travel?.bookers ?? (orga ? [orga] : []);
  for (const [position, key] of bookers.entries()) {
    await client.query(
      `update trip_member set booker_since = now() - make_interval(days => $3), booker_set_by = $4
       where trip_id = $1 and user_id = $2`,
      [tripId, ids.get(key), 10 - position, orga ? (ids.get(orga) ?? null) : null],
    );
  }
  await client.query(
    `update trip set booker_defaulted_at = now() - interval '10 days' where id = $1`,
    [tripId],
  );
  const ring = currentKeyRing(process.env);
  for (const request of seed.travel?.requests ?? []) {
    const inserted = await client.query<{ id: string }>(
      `insert into travel_data_request (trip_id, requester_id, purpose, fields, created_at,
         closed_at, closed_reason, used_at)
       values ($1, $2, $3, $4::text[], now() - make_interval(days => $5),
         case when $6::int is not null then now() - make_interval(days => $6::int) end, $7,
         case when $8::boolean then now() - interval '1 day' end)
       returning id`,
      [
        tripId,
        ids.get(request.by),
        request.purpose,
        request.fields,
        request.daysAgo,
        request.closed?.daysAgo ?? null,
        request.closed?.reason ?? null,
        Object.keys(request.access ?? {}).length > 0,
      ],
    );
    const requestId = inserted.rows[0]?.id ?? "";
    for (const [who, wanted] of Object.entries(request.answers)) {
      const placeholderId = who.startsWith("ph:") ? placeholders.get(who.slice(3)) : undefined;
      const userId = placeholderId ? undefined : ids.get(who);
      const values = userId ? request.values?.[who] : undefined;
      const state = wanted === "released" && !(values && ring) ? "open" : wanted;
      const recipient = await client.query<{ id: string }>(
        `insert into travel_data_recipient (request_id, trip_id, user_id, placeholder_id, state,
           responded_at, updated_at)
         values ($1, $2, $3, $4, $5, case when $5 in ('released', 'declined') then now() - make_interval(days => $6) end,
           now() - make_interval(days => $6))
         returning id`,
        [
          requestId,
          tripId,
          userId ?? null,
          placeholderId ?? null,
          state,
          Math.max(0, request.daysAgo - 1),
        ],
      );
      const recipientId = recipient.rows[0]?.id ?? "";
      if (state !== "released" || !values || !ring || !userId) continue;
      const record = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined),
      );
      const sealed = sealRecord(ring, record, {
        tripId,
        requestId,
        userId,
        schemaVersion: TRAVEL_SCHEMA_VERSION,
      });
      await client.query(
        `insert into travel_data_release (recipient_id, ciphertext, nonce, key_id, schema_version,
           consent_at, consent_version, consent_locale, created_at, updated_at)
         values ($1, $2, $3, $4, $5, now() - make_interval(days => $6), $7, 'de',
           now() - make_interval(days => $6), now() - make_interval(days => $6))`,
        [
          recipientId,
          sealed.ciphertext,
          sealed.nonce,
          sealed.keyId,
          TRAVEL_SCHEMA_VERSION,
          Math.max(0, request.daysAgo - 1),
          CONSENT_VERSION,
        ],
      );
      for (const entry of request.access?.[who] ?? []) {
        await client.query(
          `insert into travel_data_access (recipient_id, actor_id, action, field, at)
           values ($1, $2, $3, $4, now() - make_interval(hours => $5))`,
          [recipientId, ids.get(request.by), entry.action, entry.field ?? null, entry.hoursAgo],
        );
      }
    }
  }
}

export async function hasDemoData(client: Pick<ClientBase, "query">): Promise<boolean> {
  const row = await client.query<{ found: boolean }>(
    `select exists (select 1 from "user" where email like $1) as found`,
    [`%${DEMO_DOMAIN}`],
  );
  return row.rows[0]?.found === true;
}

export interface SeedResult {
  people: string[];
  /** One line per trip with its link and invite link (for the console). */
  trips: string[];
}

/**
 * Replaces the demo data: removes demo people and every trip they are in, then inserts the
 * people and trips anew – in ONE transaction (idempotent; other accounts stay untouched).
 */
export async function seedDemo(
  client: Pick<ClientBase, "query">,
  appUrl: string,
): Promise<SeedResult> {
  const base = appUrl.replace(/\/+$/, "");
  await client.query("begin");
  try {
    // 1. Clear previous demo data: trips with a demo member, then the demo users
    //    (cascades to sessions, accounts, memberships).
    await client.query(
      `delete from trip where id in (
         select m.trip_id from trip_member m join "user" u on u.id = m.user_id where u.email like $1)`,
      [`%${DEMO_DOMAIN}`],
    );
    await client.query(`delete from "user" where email like $1`, [`%${DEMO_DOMAIN}`]);

    // 2. People.
    const ids = new Map<string, string>();
    for (const person of PEOPLE) {
      const row = await client.query<{ id: string }>(
        `insert into "user" (name, email, email_verified, locale, country, subdivision)
         values ($1, $2, true, $3, $4, $5) returning id`,
        [
          person.name,
          `${person.key}${DEMO_DOMAIN}`,
          person.locale,
          person.country,
          person.subdivision ?? null,
        ],
      );
      ids.set(person.key, row.rows[0]?.id ?? "");
    }

    // 3. Trips with members.
    const lines: string[] = [];
    for (const [index, seed] of TRIPS.entries()) {
      const token = inviteToken();
      const id = publicId();
      const row = await client.query<{ id: string }>(
        `insert into trip (public_id, name, description, range_start, range_end, min_nights,
           preferred_nights, deadline, holiday_country, holiday_subdivision, locale, invite_token,
           join_open, phase, fixed_start, fixed_end, updated_at, poll_deadline, poll_started_at,
           fixed_at, poll_canceled_at, poll_canceled_by)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now() - make_interval(hours => $17),
           $18, case when $19::boolean then now() - interval '2 days' end,
           case when $20::int is not null then now() - make_interval(days => $20::int) end,
           case when $21::uuid is not null then now() - interval '1 day' end, $21::uuid)
         returning id`,
        [
          id,
          seed.name,
          seed.description ?? null,
          seed.rangeStart,
          seed.rangeEnd,
          seed.minNights,
          seed.preferredNights ?? null,
          seed.deadline ?? null,
          seed.country,
          seed.subdivision ?? null,
          seed.locale,
          token,
          seed.joinOpen ?? true,
          seed.phase,
          seed.fixedStart ?? null,
          seed.fixedEnd ?? null,
          index,
          seed.pollDeadline ?? null,
          seed.phase !== "collecting",
          seed.fixedDaysAgo ?? null,
          seed.pollCanceledBy ? (ids.get(seed.pollCanceledBy) ?? null) : null,
        ],
      );
      const tripId = row.rows[0]?.id;
      // Currency from the holiday region (R.7), last fixed range for «Termin geändert» (W18 E.8).
      await client.query(
        `update trip set currency = case holiday_country when 'GB' then 'GBP' when 'CH' then 'CHF'
           when 'US' then 'USD' else 'EUR' end,
           last_fixed_range = case when fixed_start is not null
             then fixed_start::text || '/' || fixed_end::text end
         where id = $1`,
        [tripId],
      );
      const optionIds: string[] = [];
      for (const [position, [start, end]] of (seed.options ?? []).entries()) {
        const option = await client.query<{ id: string }>(
          `insert into poll_option (trip_id, start_date, end_date, created_at)
           values ($1, $2, $3, now() - make_interval(secs => $4)) returning id`,
          [tripId, start, end, 100 - position],
        );
        optionIds.push(option.rows[0]?.id ?? "");
      }
      for (const [position, member] of seed.members.entries()) {
        const person = PEOPLE.find((p) => p.key === member.person);
        const submittedAt = member.submitted
          ? new Date(Date.now() - (position + 1) * 3_600_000)
          : null;
        // «abgestimmt» = an answer on every option (Flow D.2 #4).
        const votedAll =
          optionIds.length > 0 &&
          (member.votes ?? []).filter((v) => v !== null).length === optionIds.length;
        await client.query(
          `insert into trip_member (trip_id, user_id, display_name, role, joined_at, submitted_at,
             voted_at, availability_updated_at, comment, celebrated_for, reopen_notice_due)
           values ($1, $2, $3, $4, now() - make_interval(days => $5), $6, $7, $8, $9, $10, $11)`,
          [
            tripId,
            ids.get(member.person),
            member.name ?? person?.name.split(" ")[0] ?? member.person,
            member.organizer ? "organizer" : "member",
            20 - position,
            submittedAt,
            member.voted || votedAll ? new Date(Date.now() - (position + 1) * 1_800_000) : null,
            submittedAt ?? (member.draft ? new Date() : null),
            member.comment ?? null,
            member.celebrated && seed.fixedStart && seed.fixedEnd
              ? `${seed.fixedStart}/${seed.fixedEnd}`
              : member.celebratedRange
                ? member.celebratedRange.join("/")
                : null,
            // Celebrated a range that was unfixed since → notice still due (R-069).
            Boolean(member.celebratedRange) && seed.phase === "voting",
          ],
        );
        for (const [optionIndex, choice] of (member.votes ?? []).entries()) {
          const optionId = optionIds[optionIndex];
          if (!choice || !optionId) continue;
          await client.query(
            `insert into poll_vote (option_id, trip_id, user_id, choice) values ($1, $2, $3, $4)`,
            [optionId, tripId, ids.get(member.person), choice],
          );
        }
        if (member.submitted || member.draft) {
          const days = member.pattern
            ? patternDays(seed.rangeStart, member.pattern)
            : demoDays(seed.rangeStart, seed.rangeEnd, index + position);
          for (const [dayIso, state] of days) {
            await client.query(
              `insert into availability (trip_id, user_id, day, state) values ($1, $2, $3, $4)`,
              [tripId, ids.get(member.person), dayIso, state],
            );
          }
        }
      }
      if (seed.info) {
        const orgaKey = seed.members.find((m) => m.organizer)?.person;
        const info = seed.info;
        await client.query(
          `insert into trip_info (trip_id, stay_name, address, check_in, check_out, meeting_point,
             emergency_name, emergency_phone, notes, updated_by, updated_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now() - interval '2 days')`,
          [
            tripId,
            info.stayName ?? null,
            info.address ?? null,
            info.checkIn ?? null,
            info.checkOut ?? null,
            info.meetingPoint ?? null,
            info.emergencyName ?? null,
            info.emergencyPhone ?? null,
            info.notes ?? null,
            orgaKey ? (ids.get(orgaKey) ?? null) : null,
          ],
        );
      }
      const placeholderIds = new Map<string, string>();
      for (const [position, name] of (seed.placeholders ?? []).entries()) {
        const inserted = await client.query<{ id: string }>(
          `insert into trip_placeholder (trip_id, display_name, invite_token, created_at)
           values ($1, $2, $3, now() - make_interval(secs => $4)) returning id`,
          [tripId, name, inviteToken(), 100 - position],
        );
        placeholderIds.set(name, inserted.rows[0]?.id ?? "");
      }
      if (seed.costs && tripId) {
        await seedCosts(client, tripId, seed, ids, placeholderIds);
      }
      if (seed.phase === "fixed" && tripId) {
        await seedTravel(client, tripId, seed, ids, placeholderIds);
      }
      for (const stay of seed.stays ?? []) {
        const orgaKey = seed.members.find((m) => m.organizer)?.person;
        const inserted = await client.query<{ id: string }>(
          `insert into trip_stay (trip_id, url, url_normalized, title, price_cents, currency, note,
             preview_image_url, preview_site_name, preview_status, created_by, created_at, updated_at,
             chosen_at, chosen_by, booked_at, booked_by)
           select $1, $2, $3, $4, $5, t.currency, $6, $7, $8, $9, $10,
             now() - make_interval(days => $11), now() - make_interval(days => $11),
             case when $12::boolean then now() - interval '2 days' end,
             case when $12::boolean then $13::uuid end,
             case when $14::boolean then now() - interval '1 day' end,
             case when $14::boolean then $13::uuid end
           from trip t where t.id = $1
           returning id`,
          [
            tripId,
            stay.url,
            stay.url.replace(/^https:\/\/(www\.)?/, ""),
            stay.title,
            stay.price === undefined ? null : stay.price * 100,
            stay.note ?? null,
            stay.image ? `/demo/stays/${stay.image}.svg` : null,
            stay.site ?? null,
            stay.image || stay.site ? "ok" : "none",
            stay.by ? (ids.get(stay.by) ?? null) : null,
            stay.daysAgo,
            stay.chosen === true,
            orgaKey ? (ids.get(orgaKey) ?? null) : null,
            stay.booked === true,
          ],
        );
        const stayId = inserted.rows[0]?.id;
        for (const [person, value] of Object.entries(stay.ratings)) {
          await client.query(
            `insert into trip_stay_rating (stay_id, trip_id, user_id, value, rated_at)
             values ($1, $2, $3, $4, now() - make_interval(days => $5) + interval '2 hours')`,
            [stayId, tripId, ids.get(person), value, stay.daysAgo],
          );
        }
      }
      if (seed.stayWithoutAppBy) {
        await client.query(
          `insert into trip_station_marks (trip_id, station, set_by, set_at)
           values ($1, 'V3', $2, now() - interval '20 days')`,
          [tripId, ids.get(seed.stayWithoutAppBy)],
        );
      }
      const orga = seed.members.find((m) => m.organizer)?.person ?? "?";
      lines.push(
        `  • ${seed.name} (${seed.phase}${seed.joinOpen === false ? ", join closed" : ""}) – Orga ${orga}${DEMO_DOMAIN}\n` +
          `      trip:   ${base}/trips/${id}\n      invite: ${base}/i/${token}`,
      );
    }
    await client.query("commit");
    return { people: PEOPLE.map((p) => p.key + DEMO_DOMAIN), trips: lines };
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}
