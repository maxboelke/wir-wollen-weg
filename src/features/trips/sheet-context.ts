import { helpHref } from "@/lib/help";
import type { TripTab } from "@/lib/trip-status";
import { anyoneToRemind } from "@/lib/remind";
import type { TripSheetContext } from "./components/trip-sheet";
import type { TripView } from "./load";
import { balancesOf, loadCostsRaw } from "@/server/costs/db";
import { costsPath } from "./paths";
import { remindPhase, tripRemindGroups } from "./remind";

/** Data the trip menu / management dialogs need (serialisable for client components). */
export async function sheetContext(
  view: TripView,
  tab?: TripTab | null,
): Promise<TripSheetContext> {
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
    costs: await costsContext(view),
  };
}

/**
 * Costs for «Reise verlassen» / «Mitglied entfernen» (W19 D.10, R.8 I10-04): balance per member
 * (only members with a party), whether the viewer has payment details. Also in phase 2 – the
 * data stays after «Festlegung aufheben». Null when the trip never used costs.
 */
async function costsContext(view: TripView): Promise<TripSheetContext["costs"]> {
  const raw = await loadCostsRaw(view.trip.id);
  if (raw.parties.length === 0) return null;
  const balances = balancesOf(raw);
  const byUser: Record<string, number> = {};
  for (const party of raw.parties) {
    if (party.userId) byUser[party.userId] = balances.get(party.id) ?? 0;
  }
  const mine = raw.payInfos.find((p) => p.userId === view.me.userId);
  return {
    currency: view.trip.currency,
    closed: raw.closed !== null,
    balances: byUser,
    payInfo: Boolean(mine?.iban ?? mine?.note),
    balancesHref: costsPath(view.trip.publicId, "balances"),
  };
}

function canRemind(view: TripView): boolean {
  const phase = remindPhase(view);
  return phase !== null && anyoneToRemind(tripRemindGroups(view, phase));
}
