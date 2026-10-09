import type { TripTab } from "@/lib/trip-status";

/** URLs of a trip (sitemap §3). */
export function tripPath(publicId: string, tab: TripTab | "invite" | "settings" = "overview") {
  const base = `/trips/${publicId}`;
  switch (tab) {
    case "overview":
      return base;
    case "poll":
      return `${base}/poll`;
    default:
      return `${base}/${tab}`;
  }
}
