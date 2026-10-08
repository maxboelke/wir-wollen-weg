export const AVATAR_TONES = 8;

/**
 * Pastel tone 1…8 for an avatar (design-system §4.4): meaningless, stable per member –
 * derived from a hash of the member id (FNV-1a).
 */
export function avatarTone(id: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % AVATAR_TONES) + 1;
}

/** "Lena" → "LE", "Anna Schmidt" → "AS", "  " → "?". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "?";
  const second = words[1];
  const letters = second
    ? graphemes(first).slice(0, 1).concat(graphemes(second).slice(0, 1))
    : graphemes(first).slice(0, 2);
  return letters.join("").toLocaleUpperCase();
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), (part) => part.segment);
}
