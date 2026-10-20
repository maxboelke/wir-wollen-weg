import type { Locale } from "@/i18n/config";
import type { RemindPhase, RemindTarget } from "@/lib/remind";

/** One row of «Fehlt noch» / «Eingetragen» (ux-spec §14.2) – serialisable for the client. */
export interface RemindPersonView {
  key: string;
  name: string;
  kind: "member" | "placeholder";
  organizer: boolean;
  me: boolean;
  done: boolean;
  /** Status line, e.g. «eingetragen · 12. Mai» / «noch nicht beigetreten». */
  status: string;
  /**
   * Ready texts of «{name} erinnern» per text language. Null for the viewer, people who are
   * done, and placeholders when the viewer is not the organiser (personal links stay in
   * organiser views only, F-007).
   */
  texts: Record<Locale, string> | null;
  /** Non-organisers, placeholder rows: «Hey {orga}, {name} fehlt noch …» (§14.2). */
  orgaTexts: Record<Locale, string> | null;
}

/** Templates of «Alle erinnern» – the client inserts the chosen names at NAMES_TOKEN. */
export interface RemindAllTemplates {
  one: string;
  many: string;
  /** «{count} weitere» with `#` for the count (name lists from 5 names on, §10.3). */
  more: string;
}

export interface RemindSheetData {
  phase: RemindPhase;
  tripName: string;
  orgaName: string;
  isOrganizer: boolean;
  defaultLocale: Locale;
  progress: { done: number; total: number };
  /** Own row: «Tage eintragen» / «Abstimmen». */
  ownHref: string;
  open: RemindPersonView[];
  done: RemindPersonView[];
  all: Record<Locale, RemindAllTemplates>;
  /** «{orga} Bescheid geben» (N1-9, N1-10, N2-9, N2-10) – only for non-organisers. */
  nudge: Record<Locale, string> | null;
}

export type RemindOpen = (target: RemindTarget, trigger?: HTMLElement | null) => void;
