import { PENDING_AUTH_MAX_AGE_MS, type StorageLike } from "./pending-auth";
import { parseStoredDraft, type TripDraft } from "./trip-input";

/**
 * «Reise anlegen» without an account (Flow G #4): the form data survives the sign-in steps,
 * reloads and in-app browsers – next to `pendingAuth`, in sessionStorage AND localStorage,
 * for at most 30 minutes. Only trip data, nothing secret.
 */
export const TRIP_DRAFT_KEY = "ww.tripDraft";

interface Stored {
  draft: TripDraft;
  savedAt: number;
}

function storages(): StorageLike[] {
  if (typeof window === "undefined") return [];
  const result: StorageLike[] = [];
  for (const get of [() => window.sessionStorage, () => window.localStorage]) {
    try {
      result.push(get());
    } catch {
      // blocked (private mode, in-app browser)
    }
  }
  return result;
}

export function saveTripDraft(draft: TripDraft, now = Date.now(), list = storages()): void {
  const raw = JSON.stringify({ draft, savedAt: now } satisfies Stored);
  for (const storage of list) {
    try {
      storage.setItem(TRIP_DRAFT_KEY, raw);
    } catch {
      // quota/blocked
    }
  }
}

/**
 * Newest valid draft from either storage. Expired or broken entries are removed, so trip
 * data does not linger in localStorage on shared devices beyond the 30 minutes (R-041).
 */
export function loadTripDraft(now = Date.now(), list = storages()): TripDraft | null {
  let best: Stored | null = null;
  for (const storage of list) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(TRIP_DRAFT_KEY);
    } catch {
      continue;
    }
    if (raw === null) continue;
    let valid: Stored | null = null;
    try {
      const parsed = JSON.parse(raw) as Partial<Stored> | null;
      const draft = parseStoredDraft(parsed?.draft);
      const savedAt = parsed?.savedAt;
      if (
        draft &&
        typeof savedAt === "number" &&
        now - savedAt >= 0 &&
        now - savedAt <= PENDING_AUTH_MAX_AGE_MS
      ) {
        valid = { draft, savedAt };
      }
    } catch {
      // broken entry – removed below
    }
    if (!valid) {
      try {
        storage.removeItem(TRIP_DRAFT_KEY);
      } catch {
        // ignore
      }
      continue;
    }
    if (!best || valid.savedAt > best.savedAt) best = valid;
  }
  return best?.draft ?? null;
}

export function clearTripDraft(list = storages()): void {
  for (const storage of list) {
    try {
      storage.removeItem(TRIP_DRAFT_KEY);
    } catch {
      // ignore
    }
  }
}
