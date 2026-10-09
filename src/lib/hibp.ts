import { createHash } from "node:crypto";

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/";
const HIBP_TIMEOUT_MS = 3000;

/** How often a SHA-1 suffix appears in a HIBP range response ("SUFFIX:COUNT" lines). */
export function countInRange(body: string, suffix: string): number {
  for (const line of body.split("\n")) {
    const [lineSuffix, count] = line.trim().split(":");
    if (lineSuffix?.toUpperCase() === suffix) return Number(count) || 0;
  }
  return 0;
}

/**
 * k-anonymity lookup at "Have I Been Pwned" (no account needed; only the first 5 hex chars
 * of the SHA-1 leave the server, padded responses). Fails open: network problems → false.
 */
export async function isPwnedOnline(
  password: string,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const sha1 = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  try {
    const response = await fetcher(`${HIBP_RANGE_URL}${sha1.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(HIBP_TIMEOUT_MS),
    });
    if (!response.ok) return false;
    return countInRange(await response.text(), sha1.slice(5)) > 0;
  } catch {
    return false;
  }
}
