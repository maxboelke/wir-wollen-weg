/**
 * Operating logs of the travel-details area: anonymous counters with FIXED names only
 * (deployment.md §0.11.9, R.9 I11-10) – never ids of people, trips, requests or fields, never
 * key ids related to rows, never values.
 */
export type TravelCounter =
  | "travel_data.request ok"
  | "travel_data.release ok"
  | "travel_data.decline ok"
  | "travel_data.withdraw ok"
  | "travel_data.reveal ok"
  | "travel_data.reveal denied"
  | "travel_data.copy ok"
  | "travel_data.copy denied"
  | "travel_data.reauth required"
  | "travel_data.close ok"
  | "travel_data.booker changed"
  | "travel_data.decrypt_failed"
  | "travel_data.decrypt_unknown_key";

export function logCounter(name: TravelCounter): void {
  console.info(name);
}

/** Retention: number of purged releases (only the count). */
export function logPurged(count: number): void {
  console.info(`travel_data.retention purged=${String(count)}`);
}
