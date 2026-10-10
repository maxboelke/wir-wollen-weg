/**
 * Legend state of the group calendar (U-6): open on the first visit, stays closed once the
 * person closes it – remembered per device. Stored in a cookie (not localStorage) so the server
 * renders the right state in the first HTML (no jump after hydration, same pattern as the
 * `ww-motion` cookie). A UI preference only, no tracking.
 */
export const LEGEND_COOKIE = "ww-hm-legend";
const MAX_AGE = 60 * 60 * 24 * 365;

export function storeLegendState(open: boolean): void {
  document.cookie = open
    ? `${LEGEND_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
    : `${LEGEND_COOKIE}=closed; Path=/; Max-Age=${String(MAX_AGE)}; SameSite=Lax`;
}
