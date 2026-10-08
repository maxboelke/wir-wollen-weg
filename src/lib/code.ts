export const CODE_LENGTH = 6;

/**
 * Normalises pasted/typed one-time codes: strips spaces, dashes and any non-digit,
 * caps at 6 digits (ux-spec §4.4).
 */
export function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
}
