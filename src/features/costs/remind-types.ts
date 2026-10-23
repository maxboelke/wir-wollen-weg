import type { Locale } from "@/i18n/config";

/** Reminders of the costs (W16 v2.15 / W19 D.11): `settle` (own debtors), `settle-all` (orga). */
export type CostOccasion = "settle" | "settle-all";

export interface CostRemindRow {
  /** Debtor's party id. */
  key: string;
  name: string;
  /** Recipient (settle-all rows). */
  to: string;
  /** «23,50 €» in the viewer's format. */
  amount: string;
  /**
   * Text per language – null when the debtor cannot be reminded (former member) or is a
   * placeholder and the viewer is not the organiser (R-082, F-007).
   */
  texts: Record<Locale, string> | null;
  /**
   * Non-organisers, placeholder debtors: «Hey {orga}, {name} fehlt noch …» (ux-spec §14.2) –
   * no amounts, no payment details, no invite link (R-082).
   */
  orgaTexts: Record<Locale, string> | null;
}

export interface CostRemindData {
  tripName: string;
  orgaName: string;
  defaultLocale: Locale;
  /** People who owe me (proposal rows to me, no former members). */
  mine: CostRemindRow[];
  /** All open rows (organiser only, debtor = member with account or placeholder). */
  all: CostRemindRow[];
  /** «Hey ihr, bei {trip} sind noch n Ausgleiche offen …» (organiser only). */
  allTexts: Record<Locale, string> | null;
}
