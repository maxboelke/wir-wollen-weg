/** Demo inbox of the online preview (PRD Q25, deployment.md §0.7) – shared constants and helpers. */

/** Path of the inbox page. */
export const DEMO_INBOX_PATH = "/demo/postfach";

/** Mails are kept 24 hours. */
export const DEMO_INBOX_TTL_MS = 24 * 60 * 60 * 1000;

/** At most this many mails are listed (newest first). */
export const DEMO_INBOX_LIMIT = 50;

/** Address filter from the query string: trimmed, lower case; empty/odd values = no filter. */
export function normalizeInboxFilter(raw: string | string[] | undefined): string | undefined {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (!value || value.length > 254 || !value.includes("@")) return undefined;
  return value;
}

/** Link to the inbox, filtered to one address if given. */
export function demoInboxHref(email?: string): string {
  const address = normalizeInboxFilter(email);
  return address ? `${DEMO_INBOX_PATH}?to=${encodeURIComponent(address)}` : DEMO_INBOX_PATH;
}
