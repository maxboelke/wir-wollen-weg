/**
 * HTTP Basic Auth of the online preview (APP_ENV=preview, PRD Q25, deployment.md §0.7).
 *
 * Any user name is accepted (people type «demo» or their name) – only the password counts.
 * Comparison in constant time over SHA-256 digests, so neither the length nor the first
 * differing character of the password leaks through timing. Web Crypto only: works in the
 * Node.js and in the Edge runtime.
 */

/** Paths that stay reachable without the password (no personal data, own protection). */
const OPEN_PATHS = new Set([
  "/api/health", // uptime check, answers «ok»/«error» only
  "/api/internal/retention", // retention job: own bearer token (Vercel Cron)
  "/robots.txt", // crawlers must read «Disallow: /»
]);

/** True if `pathname` is reachable without the preview password. */
export function isOpenPath(pathname: string): boolean {
  return OPEN_PATHS.has(pathname) || /^\/manifest-(de|en)\.webmanifest$/.test(pathname);
}

/** Password from an `Authorization: Basic …` header, or `undefined` if absent/malformed. */
export function basicAuthPassword(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header);
  if (!match?.[1]) return undefined;
  let decoded: string;
  try {
    const binary = atob(match[1]);
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(binary, (char) => char.charCodeAt(0)),
    );
  } catch {
    return undefined;
  }
  const colon = decoded.indexOf(":");
  return colon < 0 ? undefined : decoded.slice(colon + 1);
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

/** Constant-time comparison of two secrets (via their SHA-256 digests). */
export async function secretsEqual(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** True if the `Authorization` header carries the expected password (any user name). */
export async function basicAuthMatches(header: string | null, expected: string): Promise<boolean> {
  const given = basicAuthPassword(header);
  // Always hash once more, so «no header» and «wrong password» take the same time.
  return (await secretsEqual(given ?? "", expected)) && given !== undefined;
}

/** Realm shown by some browsers; ASCII only (header values must be Latin-1). */
export const BASIC_AUTH_REALM = "Wir wollen weg - Vorschau";
