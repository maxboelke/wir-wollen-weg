import { helpHref } from "@/lib/help";
import type { TripSheetContext } from "./components/trip-sheet";
import type { TripView } from "./load";

/** Data the trip menu / management dialogs need (serialisable for client components). */
export function sheetContext(view: TripView): TripSheetContext {
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
  };
}
