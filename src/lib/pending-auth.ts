/**
 * `pendingAuth` (user-flows A.4): the sign-in/registration flow survives reloads, app
 * switches and in-app browsers that drop the tab. Stored in sessionStorage AND
 * localStorage for max. 30 minutes – e-mail, step and where the flow started, never the code.
 */
export const PENDING_AUTH_KEY = "ww.pendingAuth";
export const PENDING_AUTH_MAX_AGE_MS = 30 * 60 * 1000;
/** "Send a new code" becomes available 30 s after a code was sent (F-040). */
export const RESEND_DELAY_MS = 30 * 1000;
/** The "Nothing there yet?" help opens by itself after 60 s on the code step (Flow A.2). */
export const NO_MAIL_HELP_DELAY_MS = 60 * 1000;

export interface PendingAuth {
  /** Internal path where the flow started, e.g. "/i/<token>" or "/login?next=%2Ftrips". */
  origin: string;
  email: string;
  step: "code";
  /** Epoch ms when the server confirmed sending the code. */
  requestedAt: number;
  /** Trip name in the invite context – for the banner on other pages. */
  tripName?: string | undefined;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStorages(): StorageLike[] {
  if (typeof window === "undefined") return [];
  const result: StorageLike[] = [];
  // In-app browsers may block either storage (private mode) – use what works.
  for (const get of [() => window.sessionStorage, () => window.localStorage]) {
    try {
      const storage = get();
      result.push(storage);
    } catch {
      // blocked
    }
  }
  return result;
}

function parse(raw: string | null, now: number): PendingAuth | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PendingAuth>;
    if (
      typeof value.origin !== "string" ||
      !value.origin.startsWith("/") ||
      value.origin.startsWith("//") ||
      typeof value.email !== "string" ||
      value.step !== "code" ||
      typeof value.requestedAt !== "number"
    ) {
      return null;
    }
    const age = now - value.requestedAt;
    if (age < 0 || age > PENDING_AUTH_MAX_AGE_MS) return null;
    return {
      origin: value.origin,
      email: value.email,
      step: "code",
      requestedAt: value.requestedAt,
      ...(typeof value.tripName === "string" ? { tripName: value.tripName } : {}),
    };
  } catch {
    return null;
  }
}

export function savePendingAuth(pending: PendingAuth, storages = browserStorages()): void {
  const raw = JSON.stringify(pending);
  for (const storage of storages) {
    try {
      storage.setItem(PENDING_AUTH_KEY, raw);
    } catch {
      // quota/blocked – the other storage may still work
    }
  }
}

/** Newest valid entry from either storage; expired or broken entries are removed. */
export function loadPendingAuth(
  now = Date.now(),
  storages = browserStorages(),
): PendingAuth | null {
  let best: PendingAuth | null = null;
  for (const storage of storages) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(PENDING_AUTH_KEY);
    } catch {
      continue;
    }
    const parsed = parse(raw, now);
    if (!parsed && raw) {
      try {
        storage.removeItem(PENDING_AUTH_KEY);
      } catch {
        // ignore
      }
    }
    if (parsed && (!best || parsed.requestedAt > best.requestedAt)) best = parsed;
  }
  return best;
}

export function clearPendingAuth(storages = browserStorages()): void {
  for (const storage of storages) {
    try {
      storage.removeItem(PENDING_AUTH_KEY);
    } catch {
      // ignore
    }
  }
}

/** Where a flow starts: the invite itself, or /login with its return target. */
export function pendingOrigin(variant: "login" | "invite", returnTo: string): string {
  return variant === "invite" ? returnTo : `/login?next=${encodeURIComponent(returnTo)}`;
}

/** Seconds until "send a new code" is available again (0 = now). */
export function resendSecondsLeft(sentAt: number | null, now: number): number {
  if (sentAt === null) return Math.ceil(RESEND_DELAY_MS / 1000);
  return Math.max(0, Math.ceil((sentAt + RESEND_DELAY_MS - now) / 1000));
}

/** "0:27" – countdown text (tabular, no animation, G-16). */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** In-app browsers of chat/social apps (best effort, A.4 rule 7) – only for a hint, never to block. */
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Snapchat|Line\/|Telegram|TikTok|musical_ly|; wv\)/i.test(
    userAgent,
  );
}
