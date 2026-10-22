import type { TileTone } from "@/components/ui/card";
import type { IconName } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import type { StationState } from "@/lib/trip-route";

/**
 * Serialisable view model of the «Reiseverlauf» cockpit (W16 v2): every text is resolved on
 * the server (viewer's language and region), the client only renders, animates and opens
 * sheets. Personal invite links only reach organiser views (F-007).
 */

export type CockpitSheet = "decided" | "members";

export type CockpitLink = { kind: "sheet"; sheet: CockpitSheet } | { kind: "path"; href: string };

export type CockpitAction =
  | CockpitLink
  | { kind: "announce" }
  | { kind: "withoutApp"; placeholderId: string; name: string; on: boolean };

export interface StationView {
  id: string;
  kind: "station" | "task" | "plan";
  state: StationState;
  /** Visible state word / chip («Du bist dran», «Termin heute», «Du bist dran · Infos»). */
  label: string;
  title: string;
  status: string;
  /** «{Zustand}: {Titel}. {Status}» (W16 v2.9). */
  ariaLabel: string;
  link: CockpitLink;
  icon: IconName;
  tone: Exclude<TileTone, "brand">;
  primary?: { label: string; action: CockpitAction; variant: "primary" | "secondary" };
  remind?: { occasion: "placeholder" | "orga"; keys: string[]; label: string; name: string };
  textActions?: { label: string; action: CockpitAction }[];
  offline?: boolean;
  unused?: boolean;
}

export interface GoalView {
  /** «Ziel · Sa., 12. Juni» */
  label: string;
  title: string;
  status: string;
  ariaLabel: string;
  link: CockpitLink | null;
  icon: IconName;
  button?: { label: string; href: string };
  note?: string;
}

export interface TileView {
  area: string;
  title: string;
  status: string;
  ariaLabel: string;
  href: string;
  icon: IconName;
  tone: Exclude<TileTone, "brand">;
}

export interface RouteView {
  /** Key for «einmal je Sitzung» (UM-2/UM-3) and «Neu erledigt» (localStorage). */
  sessionKey: string;
  wayTitle: string;
  meta: string | null;
  done: StationView[];
  /** Summary of the collapsed done row (server default, «Neu erledigt» is added in the client). */
  doneSummary: string;
  heute: { short: string; long: string; sentence: string; items: StationView[] };
  waiting: StationView[];
  next: StationView | null;
  later: StationView[];
  goal: GoalView;
  tiles: TileView[];
  more: {
    decided: { title: string; sub: string };
    members: { title: string; sub: string };
  };
}

export interface TicketView {
  /** Phase line of row 1 («Steht fest · noch 41 Tage»). */
  phaseText: string;
  /** «Noch 41 Tage bis zur Abreise.» – right after h1, screen readers only. */
  srSentence: string;
  ring:
    | { kind: "count"; count: number; unit: string }
    | { kind: "day"; day: number; top: string; of: string }
    | { kind: "bye"; text: string };
  percent: number;
  ringName: string;
  range: string;
  crew: { avatars: { id: string; name: string }[]; more: number; text: string };
  calendar: { icsHref: string; googleHref: string } | null;
  celebrate: boolean;
  departureDue: boolean;
}

export interface SheetPerson {
  key: string;
  name: string;
  organizer: boolean;
  me: boolean;
}

export interface SheetPlaceholder {
  id: string;
  name: string;
  withoutApp: boolean;
  /** Organiser: «Hey Mia, hier ist dein persönlicher Link …» (personal link). */
  texts: Record<Locale, string> | null;
  /** Members: «Hey Lena, Mia fehlt noch …» (link to the trip, no personal link). */
  orgaTexts: Record<Locale, string> | null;
}

export interface DecidedView {
  /** Trip description as a quote line on top (CEO 2026-10-22, ux-spec §14.4), if any. */
  description: string | null;
  fixedBy: string;
  range: string;
  places: { label: string; range: string; votes: string; fixed: boolean }[];
  noVotes: boolean;
  pollHref: string;
  groupHref: string;
  searched: string;
}

export interface CockpitSheetData {
  publicId: string;
  tripName: string;
  isOrganizer: boolean;
  orgaName: string;
  defaultLocale: Locale;
  members: SheetPerson[];
  placeholders: SheetPlaceholder[];
  /** «Allen Bescheid geben» (V1, organiser only) – share texts «Fix! …». */
  announce: { link: string; texts: Record<Locale, string> } | null;
  decided: DecidedView;
  inviteHref: string | null;
  manageHref: string | null;
}
