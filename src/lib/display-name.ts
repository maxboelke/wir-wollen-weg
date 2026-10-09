/**
 * Display names in a trip (F-003, ux-spec §5.2): 1–40 characters after trimming, unique per
 * trip. A duplicate is not an error but a hint with a suggestion («Kemal B.»).
 */

export const DISPLAY_NAME_MAX = 40;

/** Trim and collapse inner whitespace. */
export function cleanDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Comparison key: case-insensitive, accents kept («Lena» = «lena», «René» ≠ «Rene»). */
export function nameKey(name: string): string {
  return cleanDisplayName(name).toLocaleLowerCase();
}

export function isNameTaken(name: string, taken: readonly string[]): boolean {
  const key = nameKey(name);
  return taken.some((other) => nameKey(other) === key);
}

/** First word of a name – the only name the invite preview shows (F-003, ux-spec §11). */
export function firstName(name: string): string {
  return cleanDisplayName(name).split(" ")[0] ?? "";
}

/**
 * Free alternative for a taken name: «Kemal Bayram» → «Kemal B.», otherwise «Kemal 2»,
 * «Kemal 3», … (always within the 40-character limit).
 */
export function suggestName(name: string, taken: readonly string[], fullName?: string): string {
  const clean = cleanDisplayName(name);
  const candidates: string[] = [];
  const words = cleanDisplayName(fullName ?? name).split(" ");
  const last = words.at(-1);
  if (words.length > 1 && last) {
    const initial = Array.from(last)[0] ?? "";
    candidates.push(`${words[0] ?? clean} ${initial.toLocaleUpperCase()}.`);
  }
  for (let n = 2; n < 100; n++) {
    const suffix = ` ${String(n)}`;
    candidates.push(
      `${Array.from(clean)
        .slice(0, DISPLAY_NAME_MAX - suffix.length)
        .join("")}${suffix}`,
    );
  }
  return candidates.find((candidate) => !isNameTaken(candidate, taken)) ?? clean;
}
