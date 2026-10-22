import { helpHref } from "@/lib/help";
import type { TripTab } from "@/lib/trip-status";
import { anyoneToRemind } from "@/lib/remind";
import type { TripSheetContext } from "./components/trip-sheet";
import type { TripView } from "./load";
import { remindPhase, tripRemindGroups } from "./remind";

/** Data the trip menu / management dialogs need (serialisable for client components). */
export function sheetContext(view: TripView, tab?: TripTab | null): TripSheetContext {
  return {
    publicId: view.trip.publicId,
    tripName: view.trip.name,
    isOrganizer: view.isOrganizer,
    canInvite: view.isOrganizer || (view.trip.joinOpen && !view.full),
    myName: view.me.displayName,
    myUserId: view.me.userId,
    members: view.members.map((m) => ({
      userId: m.userId,
      displayName: m.displayName,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    intl: view.format.intl,
    helpHref: helpHref(view.format.locale),
    canUnfix: view.isOrganizer && view.phase === "fixed",
    // Q21: only in the tab «Abstimmen» (ux-spec §13.1 a) and only while the vote runs.
    canCancelPoll: view.isOrganizer && view.phase === "vote" && tab === "poll",
    // ux-spec §14.2: «Gruppe erinnern» for ALL members, phase 1/2, while somebody else is open.
    canRemind: canRemind(view),
  };
}

function canRemind(view: TripView): boolean {
  const phase = remindPhase(view);
  return phase !== null && anyoneToRemind(tripRemindGroups(view, phase));
}
