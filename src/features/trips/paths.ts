import type { TripTab } from "@/lib/trip-status";

/** URLs of a trip (sitemap §3). */
export function tripPath(
  publicId: string,
  tab: TripTab | "invite" | "settings" | "pollNew" = "overview",
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
