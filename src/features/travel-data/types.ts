import type { Locale } from "@/i18n/config";
import type { CopyField, TravelField } from "@/lib/travel-data";

/**
 * Serialisable view models of the travel-details area (W20 H). Built on the server per viewer
 * and right (R.9 «Rechte»): the «Bucht» view carries MASKS only – values come exclusively from
 * the logged actions «Anzeigen»/«Kopieren»; the person's own values appear only on their own
 * cards. Nothing here is ever written to logs, titles or URLs.
 */

export type AnswerState = "open" | "released" | "declined" | "expired";

/** One own value for the person themself (already formatted for display). */
export interface OwnValue {
  field: CopyField;
  value: string;
  /** Document number: masked on the server, «Anzeigen» fetches it (Schulterblick, W20 H.6). */
  masked?: boolean;
}

export interface AccessLine {
  /** «view» | «copy» + field – grouped per action, field and day (W20 H.8). */
  action: "view" | "copy";
  field: CopyField | null;
  count: number;
  /** «heute, 14:32» / «3. Mai, 09:10» – formatted on the server in the app time zone. */
  when: string;
}

export interface ToMeCard {
  requestId: string;
  byKey: string;
  byName: string;
  byIsBooker: boolean;
  purpose: string;
  fields: TravelField[];
  /** «28. April» */
  askedOn: string;
  state: AnswerState;
  /** Why an «erloschen» card says what it says. */
  expiredReason:
    "closedByBooker" | "bookerRevoked" | "requesterLeft" | "unfixed" | "expired" | null;
  released: {
    /** «am 3. Mai» */
    on: string;
    values: OwnValue[];
    access: AccessLine[];
    /** Expiry before the return (only for the person, W20 H.5). */
    expiresBeforeReturn: string | null;
    expired: boolean;
  } | null;
  /** The trip is over (Danach): «nur nötig, wenn … noch nachbuchen muss». */
  afterTrip: boolean;
}

export interface PersonCard {
  recipientId: string;
  key: string;
  name: string;
  isBooker: boolean;
  state: "released" | "open" | "declined" | "placeholder";
  /** «geändert am 3. Mai» – only for the asking «Bucht» on their own request. */
  changedOn: string | null;
  /** Server-side masks (W20 H.7) – only for released answers of the viewer's own request. */
  masks: Partial<Record<CopyField, string>> | null;
}

export interface OwnRequest {
  requestId: string;
  purpose: string;
  fields: TravelField[];
  askedOn: string;
  released: number;
  total: number;
  /** All members asked have answered (W20 H.7 «Alles gebucht? Anfrage abschließen»). */
  allAnswered: boolean;
  hasDocument: boolean;
  persons: PersonCard[];
  /** Members/placeholders not asked yet («Personen hinzufügen …»). */
  addable: { key: string; name: string; placeholder: boolean }[];
  /** Members who joined after the request and are not asked (W20 H.10 «Neu dabei»). */
  newMembers: { key: string; name: string }[];
  closed: { on: string; reason: "done" | "other" } | null;
}

export interface CountCard {
  requestId: string;
  byName: string;
  purpose: string;
  released: number;
  total: number;
  persons: { key: string; name: string; state: PersonCard["state"] }[];
}

export interface TravelRemindPerson {
  key: string;
  name: string;
  texts: Record<Locale, string>;
  /**
   * Open placeholder and the viewer is NOT the organiser: the text goes to the organiser
   * («{orga} Bescheid geben») – personal links only reach the organiser (F-007, R-082, R-083).
   */
  viaOrga?: string;
}

export interface TravelRemindData {
  defaultLocale: Locale;
  requests: {
    requestId: string;
    purpose: string;
    open: TravelRemindPerson[];
    declined: { key: string; name: string }[];
    /** Open placeholders – personal link (organiser) or «{orga} Bescheid geben», not in «Alle erinnern». */
    pending: TravelRemindPerson[];
    allTexts: Record<Locale, string> | null;
  }[];
}

export interface TravelPageModel {
  publicId: string;
  tripName: string;
  demo: boolean;
  /** «Sa., 26. Juni» */
  deleteOn: string;
  deleted: boolean;
  afterTrip: boolean;
  isBooker: boolean;
  isOrganizer: boolean;
  /** `[+ Anfrage]` is offered (Bucht, not Danach); `limitReached` → aria-disabled + snackbar. */
  canRequest: boolean;
  limitReached: boolean;
  newHref: string;
  hints: {
    /** «Lena hat dich als „Bucht“ markiert …» (once). */
    marked: string | null;
    /** «Du bist nicht mehr als „Bucht“ markiert …» (once). */
    revoked: boolean;
    /** Member: «Eure Reise hat neue Daten …» */
    datesMember: boolean;
    /** «Bucht»: «Euer Termin hat sich geändert ({range}) …» */
    datesBooker: string | null;
  };
  toMe: ToMeCard[];
  mine: OwnRequest[];
  others: CountCard[];
  /** «Wenn {Namen} für eine Buchung deine Daten braucht …» (empty state of members). */
  bookerNames: string;
  bookerCount: number;
  remind: TravelRemindData | null;
}

export interface BookerPerson {
  userId: string;
  name: string;
  organizer: boolean;
  me: boolean;
  booker: boolean;
}

/** Step «Wer bucht?» (W20 H.2) – organiser only, phase 3. */
export interface BookerSheetData {
  publicId: string;
  /** Area on → intro mentions travel details; off → `booking.sheet.introNoData`. */
  travelData: boolean;
  people: BookerPerson[];
  placeholders: { id: string; name: string }[];
}
