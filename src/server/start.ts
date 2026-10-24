import "server-only";
import { tripPath } from "@/features/trips/paths";
import { todayIso } from "@/lib/dates";
import { START_PARAM, startTrip } from "@/lib/start-trip";
import { listTripsForUser } from "./trips";

/**
 * Where the app start `/` leads a signed-in account (W16 v2.18): the one trip running today
 * (with the one-off hint flag) or «Meine Reisen». Also used by sign-in steps that would
 * otherwise redirect to `/` first (one redirect instead of two).
 */
export async function startTargetFor(userId: string): Promise<string> {
  const items = await listTripsForUser(userId);
  const target = startTrip(
    items.map(({ trip }) => ({
      publicId: trip.publicId,
      name: trip.name,
      phase: trip.phase,
      fixedStart: trip.fixedStart,
      fixedEnd: trip.fixedEnd,
    })),
    todayIso(),
  );
  return target.kind === "trip" ? `${tripPath(target.publicId)}?${START_PARAM}=1` : "/trips";
}
