/**
 * Deleting an account (F-043, Flow I.3): what happens to each trip of the person.
 *
 * - Member of a trip → the membership goes (with days, votes, comment – cascade).
 * - Organiser, nobody else in the trip → the trip is deleted with the account.
 * - Organiser with other members → the person decided per trip: hand the «Orga» role to a
 *   member («Orga übergeben an …», suggestion: longest member) or delete the trip for all.
 *
 * Pure functions – the server resolves the plan again inside the transaction with the trip
 * rows locked, so a choice made on a stale page (someone joined, the role was handed over
 * meanwhile) never leaves a trip without organiser (`planOutdated`).
 */

export interface DeletionTripState {
  tripId: string;
  publicId: string;
  name: string;
  role: "organizer" | "member";
  /** The OTHER members of the trip, any order. */
  others: { userId: string; displayName: string; joinedAt: Date }[];
}

export type DeletionChoice = { action: "transfer"; to: string } | { action: "delete" };

export type DeletionStep =
  | { kind: "leave"; tripId: string }
  | { kind: "transfer"; tripId: string; to: string }
  | { kind: "deleteTrip"; tripId: string; publicId: string; name: string };

export type DeletionPlan =
  { ok: true; steps: DeletionStep[] } | { ok: false; reason: "planOutdated" };

/** Other members, longest first (joined earliest; name as tie-breaker) – W13 pre-selection. */
export function successorsOf(trip: Pick<DeletionTripState, "others">) {
  return [...trip.others].sort(
    (a, b) =>
      a.joinedAt.getTime() - b.joinedAt.getTime() || a.displayName.localeCompare(b.displayName),
  );
}

/** The trips that need a decision before the account can go (organiser + other members). */
export function tripsNeedingChoice<T extends DeletionTripState>(trips: readonly T[]): T[] {
  return trips.filter((trip) => trip.role === "organizer" && trip.others.length > 0);
}

/** Organiser trips without anybody else – deleted together with the account. */
export function soloTrips<T extends DeletionTripState>(trips: readonly T[]): T[] {
  return trips.filter((trip) => trip.role === "organizer" && trip.others.length === 0);
}

/**
 * Turns the person's choices (by public trip id) into steps. `"auto"` is used by the
 * inactivity deletion (F-043): the role goes to the longest member. Any trip that needs a
 * choice but has none – or whose chosen successor is no longer a member – makes the whole
 * plan outdated; nothing is deleted then.
 */
export function resolveDeletionPlan(
  trips: readonly DeletionTripState[],
  choices: Readonly<Record<string, DeletionChoice | undefined>> | "auto",
): DeletionPlan {
  const steps: DeletionStep[] = [];
  for (const trip of trips) {
    if (trip.role === "member") {
      steps.push({ kind: "leave", tripId: trip.tripId });
      continue;
    }
    if (trip.others.length === 0) {
      steps.push({
        kind: "deleteTrip",
        tripId: trip.tripId,
        publicId: trip.publicId,
        name: trip.name,
      });
      continue;
    }
    if (choices === "auto") {
      const [first] = successorsOf(trip);
      if (!first) return { ok: false, reason: "planOutdated" };
      steps.push({ kind: "transfer", tripId: trip.tripId, to: first.userId });
      continue;
    }
    const choice = Object.hasOwn(choices, trip.publicId) ? choices[trip.publicId] : undefined;
    if (!choice) return { ok: false, reason: "planOutdated" };
    if (choice.action === "delete") {
      steps.push({
        kind: "deleteTrip",
        tripId: trip.tripId,
        publicId: trip.publicId,
        name: trip.name,
      });
      continue;
    }
    if (!trip.others.some((other) => other.userId === choice.to)) {
      return { ok: false, reason: "planOutdated" };
    }
    steps.push({ kind: "transfer", tripId: trip.tripId, to: choice.to });
  }
  return { ok: true, steps };
}

/** Validates untrusted choices from the client: `{ [publicId]: {action, to?} }`. */
export function parseDeletionChoices(input: unknown): Record<string, DeletionChoice> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const out: Record<string, DeletionChoice> = {};
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > 100) return null;
  for (const [publicId, raw] of entries) {
    if (!/^[a-z0-9]{10}$/.test(publicId)) return null;
    if (typeof raw !== "object" || raw === null) return null;
    const { action, to } = raw as { action?: unknown; to?: unknown };
    if (action === "delete") out[publicId] = { action: "delete" };
    else if (
      action === "transfer" &&
      typeof to === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(to)
    ) {
      out[publicId] = { action: "transfer", to: to.toLowerCase() };
    } else return null;
  }
  return out;
}
