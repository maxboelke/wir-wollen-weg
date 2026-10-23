import "server-only";
import { travelDeleteOn } from "@/lib/travel-data";
import type { TravelDataStatus } from "@/lib/trip-route";
import type { RawRecipient, RawRequest, TravelRaw } from "@/server/travel-data/db";
import type { TripView } from "../trips/load";

/**
 * Adapter `travelDataStatus()` of W16 v2.16: numbers and states of the travel-detail requests
 * for ONE viewer – never values, never per-person states of requests the viewer may not see
 * (R.9 «Rechte»: members see their own answer and numbers; organiser and «Bucht» see states).
 */

export function memberName(view: TripView, userId: string | null): string | null {
  if (!userId) return null;
  return view.members.find((m) => m.userId === userId)?.displayName ?? null;
}

/** Asked members with an account (the counting base, W20 H.1 – no placeholders). */
export function memberRecipients(raw: TravelRaw, requestId: string): RawRecipient[] {
  return raw.recipients.filter((r) => r.requestId === requestId && r.userId !== null);
}

export interface RequestCounts {
  released: number;
  total: number;
  open: RawRecipient[];
  declined: number;
  placeholders: RawRecipient[];
}

export function countsOf(raw: TravelRaw, requestId: string): RequestCounts {
  const members = memberRecipients(raw, requestId);
  return {
    released: members.filter((r) => r.state === "released").length,
    total: members.length,
    open: members.filter((r) => r.state === "open"),
    declined: members.filter((r) => r.state === "declined").length,
    placeholders: raw.recipients.filter(
      (r) => r.requestId === requestId && r.placeholderId !== null,
    ),
  };
}

export function deleted(view: TripView): boolean {
  return view.trip.fixedEnd !== null && view.today > travelDeleteOn(view.trip.fixedEnd);
}

/** Null when there are no fixed dates (the area only exists in phase «fixed»). */
export function travelDataStatus(view: TripView, raw: TravelRaw): TravelDataStatus | null {
  const { trip, me, isOrganizer } = view;
  if (trip.phase !== "fixed" || !trip.fixedEnd) return null;
  const isBooker = me.bookerSince !== null;
  const gone = deleted(view);
  const byId = new Map<string, RawRequest>(raw.requests.map((r) => [r.id, r]));
  const name = (userId: string | null) => memberName(view, userId) ?? "";

  const toMe = raw.recipients
    .filter((r) => r.userId === me.userId)
    .flatMap((r) => {
      const request = byId.get(r.requestId);
      if (!request || request.closedAt) return [];
      return [
        {
          requestId: request.id,
          byName: name(request.requesterId),
          purpose: request.purpose,
          fieldKeys: request.fields,
          state: r.state,
        },
      ];
    });

  const mine = raw.requests
    .filter((request) => request.requesterId === me.userId)
    .map((request) => {
      const counts = countsOf(raw, request.id);
      const complete = counts.total > 0 && counts.open.length === 0;
      return {
        requestId: request.id,
        purpose: request.purpose,
        released: counts.released,
        total: counts.total,
        open: counts.open.map((r) => ({ key: r.userId ?? r.id, name: name(r.userId) })),
        complete,
        usedSinceComplete: complete && request.usedAt !== null,
        closed: request.closedAt !== null,
      };
    });

  const others =
    isOrganizer || isBooker
      ? raw.requests
          .filter((request) => request.requesterId !== me.userId && request.closedAt === null)
          .map((request) => {
            const counts = countsOf(raw, request.id);
            return {
              byName: name(request.requesterId),
              purpose: request.purpose,
              released: counts.released,
              total: counts.total,
              complete: counts.total > 0 && counts.open.length === 0,
            };
          })
      : [];

  // D3 (W16 v2.16): an active release of mine at the end of the trip, or «Bucht» with an open
  // request that had at least one release. After the deletion the hull remembers it: answers
  // that were «freigegeben» are «erloschen» in requests closed by the deletion date.
  const expiredByDate = (request: RawRequest | undefined) => request?.closedReason === "expired";
  const affected = gone
    ? raw.recipients.some(
        (r) =>
          r.userId === me.userId && r.state === "expired" && expiredByDate(byId.get(r.requestId)),
      ) ||
      raw.requests.some(
        (request) =>
          request.requesterId === me.userId &&
          request.closedReason === "expired" &&
          raw.recipients.some((r) => r.requestId === request.id && r.state === "expired"),
      )
    : toMe.some((r) => r.state === "released") || mine.some((r) => !r.closed && r.released > 0);

  return {
    deleteOn: travelDeleteOn(trip.fixedEnd),
    deleted: gone,
    affected,
    toMe,
    mine,
    others,
  };
}
