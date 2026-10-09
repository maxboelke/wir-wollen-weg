/**
 * One-shot snackbars across a redirect: a Server Action sets the short-lived cookie
 * `ww-flash`, the next page shows the message and deletes it (FlashToast).
 * Value: `<kind>` or `<kind>:<url-encoded detail>` (e.g. the name of a trip just left).
 */
export const FLASH_COOKIE = "ww-flash";

export const FLASH_KINDS = ["signed-out", "trip-left", "trip-deleted"] as const;
export type FlashKind = (typeof FLASH_KINDS)[number];

export function flashValue(kind: FlashKind, detail?: string): string {
  return detail === undefined ? kind : `${kind}:${encodeURIComponent(detail.slice(0, 120))}`;
}

export function parseFlash(raw: string | undefined): { kind: FlashKind; detail: string } | null {
  if (!raw) return null;
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const index = value.indexOf(":");
  const kind = index === -1 ? value : value.slice(0, index);
  let detail = index === -1 ? "" : value.slice(index + 1);
  try {
    detail = decodeURIComponent(detail);
  } catch {
    return null;
  }
  return (FLASH_KINDS as readonly string[]).includes(kind)
    ? { kind: kind as FlashKind, detail }
    : null;
}
