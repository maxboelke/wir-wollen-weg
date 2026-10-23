import type { MemberView } from "@/server/trips";

/**
 * People with the marking «Bucht» (F-056, W16 v2.16 `RouteTrip.bookerNames`): organiser first,
 * then in the order they were marked. Pure – works on the member list of a `TripView`.
 */
export function bookersOf(members: readonly MemberView[]): MemberView[] {
  return members
    .filter((m) => m.bookerSince !== null)
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "organizer" ? -1 : 1;
      return (a.bookerSince?.getTime() ?? 0) - (b.bookerSince?.getTime() ?? 0);
    });
}

/** May edit the infos and mark the place as booked (R.9 I11-02): organiser or «Bucht». */
export function canBook(member: { role: "organizer" | "member"; bookerSince: Date | null }) {
  return member.role === "organizer" || member.bookerSince !== null;
}
