import "server-only";
import { getTranslations } from "next-intl/server";
import { datesBetween } from "@/lib/calendar";
import { type IsoDate } from "@/lib/dates";
import { toParticipant, type Participant } from "@/lib/heatmap";
import { holidaysInRange } from "@/lib/holidays";
import {
  initialOrder,
  nightsOf,
  optionAvailability,
  periodInRange,
  pollForViewer,
  seesAllResults,
  suggestedChoice,
  type Period,
  type ViewerPoll,
  type VoteChoice,
} from "@/lib/poll";
import { vacationDays } from "@/lib/suggestions";
import { listOwnAvailability, listSubmittedAvailability } from "@/server/availability";
import { listOptions, listVotes } from "@/server/poll";
import { utcFormat } from "../trips/calendar-format";
import type { TripView } from "../trips/load";

/** Card data of one option – everything formatted on the server (no hydration drift). */
export interface OptionCardModel extends Period {
  id: string;
  /** «Mi., 5. Mai – Mo., 10. Mai» */
  range: string;
  nights: number;
  vacationDays: number;
  /** Submitted members (F-008 counting rule) – «laut Kalender». */
  participants: number;
  can: number;
  cannot: string[];
  maybeDays: number;
  /** Pre-filled answer from the viewer's own days (F-011) – a suggestion, not a vote. */
  suggested: VoteChoice | null;
  /**
   * Position against the CURRENT search range (ux-spec §13.1 b): the range may have changed
   * after the option was created – the card then shows «Liegt außerhalb …» as info.
   */
  inRange: "inside" | "partly" | "outside";
}

export interface PollPeople {
  /** Submitted members with their marked days (the same data the «Gruppe» tab shows). */
  people: { key: string; name: string; entries: [IsoDate, "no" | "maybe"][] }[];
  participants: Participant[];
  names: Map<string, string>;
}

/** Days of everyone who submitted (drafts never leave the server, F-008 U-4). */
export async function pollPeople(view: TripView): Promise<PollPeople> {
  const rows = await listSubmittedAvailability(view.trip.id);
  const byUser = new Map<string, [IsoDate, "no" | "maybe"][]>();
  for (const row of rows) {
    const list = byUser.get(row.userId) ?? [];
    list.push([row.day, row.state]);
    byUser.set(row.userId, list);
  }
  const people = view.members
    .filter((m) => m.submittedAt)
    .map((m) => ({ key: m.userId, name: m.displayName, entries: byUser.get(m.userId) ?? [] }));
  return {
    people,
    participants: people.map((p) => toParticipant(p.key, p.entries)),
    names: new Map(view.members.map((m) => [m.userId, m.displayName])),
  };
}

/**
 * «Mi., 5. Mai» for any date (year only when it is not this year) – independent of the search
 * range, so options outside a later shrunk range still read as dates (R-055).
 */
export function shortLabelFormatter(view: TripView): (date: IsoDate) => string {
  const { format, today } = view;
  const thisYear = today.slice(0, 4);
  const withYear = utcFormat(format.intl, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const withoutYear = utcFormat(format.intl, { weekday: "short", day: "numeric", month: "long" });
  return (date) => (date.slice(0, 4) === thisYear ? withoutYear(date) : withYear(date));
}

/**
 * Labels per date of the search range – the client formats option ranges from these while the
 * organiser shifts them (W10 A; new options always lie inside the range).
 */
export function shortLabels(view: TripView): Record<IsoDate, string> {
  const label = shortLabelFormatter(view);
  const labels: Record<IsoDate, string> = {};
  for (const date of datesBetween(view.trip.rangeStart, view.trip.rangeEnd)) {
    labels[date] = label(date);
  }
  return labels;
}

/** Public holidays of the viewer in the search range («ca. 3 Urlaubstage», F-016). */
export function viewerHolidays(view: TripView): IsoDate[] {
  return holidaysInRange(
    view.format.region,
    view.trip.rangeStart,
    view.trip.rangeEnd,
    view.format.locale,
  ).map((h) => h.date);
}

export interface PollData {
  cards: OptionCardModel[];
  poll: ViewerPoll;
  order: string[];
  people: PollPeople;
}

/**
 * The vote as THIS viewer may see it (Q13 a, enforced here – `pollForViewer` drops every
 * result the viewer has not unlocked; the organiser and everybody after fixing see all).
 */
export async function loadPoll(view: TripView): Promise<PollData> {
  const t = await getTranslations("group.card");
  const [options, votes, people, own] = await Promise.all([
    listOptions(view.trip.id),
    listVotes(view.trip.id),
    pollPeople(view),
    listOwnAvailability(view.trip.id, view.me.userId),
  ]);
  const label = shortLabelFormatter(view);
  // Holidays over the search range AND every option (options may lie outside a changed range).
  const span = options.reduce(
    (acc, option) => ({
      start: option.start < acc.start ? option.start : acc.start,
      end: option.end > acc.end ? option.end : acc.end,
    }),
    { start: view.trip.rangeStart, end: view.trip.rangeEnd },
  );
  const holidays = new Set(
    holidaysInRange(view.format.region, span.start, span.end, view.format.locale).map(
      (h) => h.date,
    ),
  );
  const ownNo = new Set(own.filter(([, state]) => state === "no").map(([day]) => day));
  const ownMaybe = new Set(own.filter(([, state]) => state === "maybe").map(([day]) => day));
  const cards = options.map((option) => {
    const availability = optionAvailability(option, people.participants);
    return {
      ...option,
      range: t("range", { start: label(option.start), end: label(option.end) }),
      nights: nightsOf(option),
      vacationDays: vacationDays(option.start, option.end, holidays),
      participants: people.participants.length,
      can: availability.can.length,
      cannot: availability.cannot.map((id) => people.names.get(id) ?? "?"),
      maybeDays: availability.maybeDays,
      suggested: suggestedChoice(option, { no: ownNo, maybe: ownMaybe }),
      inRange: periodInRange(option, view.trip),
    };
  });
  // Stored phase, not the derived one: a vote that ran out of time stays private (R-055).
  const seeAll = seesAllResults({ isOrganizer: view.isOrganizer, storedPhase: view.trip.phase });
  const poll = pollForViewer({
    options,
    votes,
    names: people.names,
    viewerId: view.me.userId,
    seeAll,
  });
  return { cards, poll, order: initialOrder(poll), people };
}
