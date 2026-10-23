import type { TripTab } from "@/lib/trip-status";

/** URLs of a trip (sitemap §3). */
export function tripPath(
  publicId: string,
  tab: TripTab | "invite" | "settings" | "pollNew" | "costs" = "overview",
) {
  const base = `/trips/${publicId}`;
  switch (tab) {
    case "overview":
      return base;
    case "poll":
      return `${base}/poll`;
    case "pollNew":
      return `${base}/poll/new`;
    default:
      return `${base}/${tab}`;
  }
}

/** Cost pages (W19 D): list, settle up, new expense, edit expense. */
export function costsPath(
  publicId: string,
  page: "list" | "balances" | "new" | { edit: string } = "list",
): string {
  const base = `/trips/${publicId}/costs`;
  if (page === "list") return base;
  if (page === "balances") return `${base}/balances`;
  if (page === "new") return `${base}/new`;
  return `${base}/${encodeURIComponent(page.edit)}/edit`;
}

/**
 * Travel details (W20 H): area, new request, one request. URLs carry ids only – never fields or
 * values (R.9 Verschlüsselung Nr. 5).
 */
export function travelDataPath(publicId: string, page: "area" | "new" | string = "area"): string {
  const base = `/trips/${publicId}/travel-data`;
  if (page === "area") return base;
  if (page === "new") return `${base}/new`;
  return `${base}/${encodeURIComponent(page)}`;
}
