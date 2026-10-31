/** Routes of the friends beta and the PWA install guide (W23, sitemap). */

/** `/beta` step 1 (code) or 2 (`privacy`), carrying an internal `next` along. */
export function betaPath(step?: "code" | "privacy", next?: string): string {
  const params = new URLSearchParams();
  if (step) params.set("step", step);
  if (next) params.set("next", next);
  const query = params.toString();
  return query ? `/beta?${query}` : "/beta";
}

/**
 * `/install` (W23 B): `first` = the one-off step right after sign-up (only «Später», no back
 * link); otherwise opened from the menu or help (back link, no «Später»).
 */
export function installPath(next?: string, first = false): string {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (first) params.set("first", "1");
  const query = params.toString();
  return query ? `/install?${query}` : "/install";
}

/** sessionStorage key: e-mail taken from W23 A.5 to /beta and back to /login (never a URL). */
export const BETA_EMAIL_STORAGE_KEY = "ww-beta-email";
