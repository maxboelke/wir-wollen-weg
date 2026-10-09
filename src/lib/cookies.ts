/** Reads one cookie from a raw `Cookie` header (decoded), or undefined. */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    const raw = part.slice(index + 1).trim();
    try {
      return raw ? decodeURIComponent(raw) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
