import "server-only";
import { fromUtcDate, isoDateInZone, type IsoDate } from "@/lib/dates";
import { compareTallies, rankOptions, tallyOf, type Tally } from "@/lib/poll";
import { effectiveDeletionDate, TRIP_NOTICE_DAYS, tripDeletionDate } from "@/lib/retention";
import { firstLine } from "@/lib/trip-info";
import { tripRoute, type InfoStatus, type TripRoute } from "@/lib/trip-route";
import { getTripInfo, type TripInfoView } from "@/server/cockpit";
import { listOptions, listVotes } from "@/server/poll";
import type { TripView } from "../trips/load";
import { orgaName } from "../trips/remind";

/** One place of «So habt ihr entschieden» (I8-08) – everyone sees all results once fixed. */
export interface DecidedPlace {
  rank: number;
  start: IsoDate;
  end: IsoDate;
  tally: Tally;
  fixed: boolean;
}

export interface CockpitData {
  route: TripRoute;
  info: TripInfoView | null;
  /** Places 1 and 2 of the vote (fixed range first if it is not place 1). */
  places: DecidedPlace[];
  fixedOn: IsoDate;
  /**
   * UX-8 (I8-07): arrival day, not yet celebrated by this person and the big celebration W11
   * does not play today (no double confetti).
   */
  departureDue: boolean;
}

/** Info status for the way (adapter of the area «Infos», W16 v2.10). */
export function infoStatus(info: TripInfoView | null): InfoStatus {
  return {
    meeting: firstLine(info?.meetingPoint ?? null),
    checkIn: info?.checkIn ?? null,
    checkOut: info?.checkOut ?? null,
    hasAddress: Boolean(info?.address),
  };
}

/** Everything the phase-3 cockpit needs – only call for a trip in the stored phase «fixed». */
export async function loadCockpit(view: TripView): Promise<CockpitData> {
  const { trip, me, members, placeholders, today, isOrganizer } = view;
  const start = trip.fixedStart ?? today;
  const end = trip.fixedEnd ?? today;
  const [info, options, votes] = await Promise.all([
    getTripInfo(trip.id),
    listOptions(trip.id),
    listVotes(trip.id),
  ]);
  const tallies = options.map((option) => ({
    ...option,
    tally: tallyOf(votes.filter((vote) => vote.optionId === option.id)),
  }));
  const { order } = rankOptions(tallies.map((o) => ({ id: o.id, tally: o.tally })));
  const ranked = order
    .map((id) => {
      const option = tallies.find((o) => o.id === id);
      return option
        ? {
            // Ties share the place («Platz 1» for both, U-9).
            rank: 1 + tallies.filter((o) => compareTallies(o.tally, option.tally) < 0).length,
            start: option.start,
            end: option.end,
            tally: option.tally,
            fixed: option.start === start && option.end === end,
          }
        : null;
    })
    .filter((place): place is DecidedPlace => place !== null);
  const fixedPlace = ranked.find((place) => place.fixed) ?? null;
  const places = ranked.slice(0, 2);
  if (fixedPlace && !places.includes(fixedPlace)) places.unshift(fixedPlace);

  // Day of the fixing in the app time zone (R-072) – «festgelegt am …», ring start, V1 7 days.
  const fixedOn = isoDateInZone(trip.fixedAt ?? trip.updatedAt);
  const deletion = effectiveDeletionDate(
    tripDeletionDate({ phase: trip.phase, fixedEnd: trip.fixedEnd, lastActivity: trip.updatedAt })
      .at,
    trip.deletionNoticeSentAt,
    TRIP_NOTICE_DAYS,
  );
  const route = tripRoute(
    {
      start,
      end,
      fixedOn,
      announced: trip.fixedAnnouncedAt !== null,
      orgaName: orgaName(view),
      memberCount: members.length,
      yesVotes: fixedPlace ? fixedPlace.tally.yes : null,
      deletionDate: fromUtcDate(deletion),
    },
    { role: isOrganizer ? "organizer" : "member" },
    {
      group: {
        placeholders: placeholders.map((p) => ({
          id: p.id,
          name: p.displayName,
          withoutApp: p.withoutApp,
        })),
      },
      info: infoStatus(info),
    },
    today,
  );
  return {
    route,
    info,
    places,
    fixedOn,
    departureDue: route.departureDay && !view.celebrate && me.departureCelebratedOn !== start,
  };
}
