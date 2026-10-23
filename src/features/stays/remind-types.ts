import type { Locale } from "@/i18n/config";

/** Reminders of the places to stay (W16 v2.14 «Erinnern»): `stay-rate`, `stay-fix`, `stay-book`. */
export type StayOccasion = "stay-rate" | "stay-fix" | "stay-book";

export interface StayRemindPerson {
  key: string;
  name: string;
  me: boolean;
  organizer: boolean;
  /** Unrated suggestions of this person (0 = «alles bewertet»). */
  left: number;
  /** «Hey {name}, bei {trip} warten …» per text language – null for the viewer and done people. */
  texts: Record<Locale, string> | null;
}

export interface StayRemindData {
  tripName: string;
  orgaName: string;
  isOrganizer: boolean;
  defaultLocale: Locale;
  swipeHref: string;
  progress: { done: number; total: number };
  /** Members (no placeholders – they do not rate) with open suggestions; the viewer last. */
  open: StayRemindPerson[];
  done: StayRemindPerson[];
  /** «Hey ihr, …» – only when somebody else is open. */
  allTexts: Record<Locale, string> | null;
  /** To the organiser: «alle haben bewertet – du kannst festlegen» (members only). */
  fix: Record<Locale, string> | null;
  /** To the organiser: «{stay} steht fest – magst du buchen?» (members only). */
  book: { title: string; texts: Record<Locale, string> } | null;
}
