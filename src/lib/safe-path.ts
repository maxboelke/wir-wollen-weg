/**
 * Accepts only relative, same-origin paths as redirect targets
 * (open-redirect protection for `?next=` and magic-link callbacks, sitemap §4).
 * Returns `fallback` for anything else.
 */
export function toSafeInternalPath(candidate: string | null | undefined, fallback = "/"): string {
  if (!candidate) return fallback;
  // Must start with exactly one slash; reject protocol-relative ("//", "/\") and control chars.
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\\]/.test(candidate)) return fallback;

  try {
    const base = "http://internal.invalid";
    const url = new URL(candidate, base);
    if (url.origin !== base) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    // Dot segments can normalise into a protocol-relative path ("/..//evil.example" → "//evil.example").
    if (path.startsWith("//")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

/** Extracts the invite token from an internal path like `/i/<token>` (null if none). */
export function inviteTokenFromPath(path: string): string | null {
  const match = /^\/i\/([A-Za-z0-9_-]{16,64})(?:[/?#]|$)/.exec(path);
  return match?.[1] ?? null;
}
