/**
 * Re-authentication marker per session (Flow I.2, R-023): a verification row
 * `reauth-<sessionId>` that is valid for 10 minutes. Changing how the account signs in
 * (e-mail, password set/change/remove) requires it.
 *
 * Kept free of `auth()` so the Better Auth session hook can use it (no import cycle).
 */

/** Re-authentication stays valid this long (e-mail change, password; later deletion). */
export const REAUTH_TTL_MS = 10 * 60 * 1000;

/**
 * Sign-ins that prove the mailbox just now (code, magic link) count as a fresh
 * confirmation – so the optional password in the sign-up name step needs no extra step.
 * A password sign-in does not: it is exactly what a stolen password would give.
 */
export const MAILBOX_SIGN_IN_PATHS: ReadonlySet<string> = new Set([
  "/sign-in/email-otp",
  "/magic-link/verify",
]);

export const reauthIdentifier = (sessionId: string) => `reauth-${sessionId}`;

/** The part of Better Auth's internal adapter used here. */
export interface VerificationStore {
  findVerificationValue: (identifier: string) => Promise<{ expiresAt: Date } | null | undefined>;
  deleteVerificationByIdentifier: (identifier: string) => Promise<void>;
  createVerificationValue: (data: {
    identifier: string;
    value: string;
    expiresAt: Date;
  }) => Promise<unknown>;
}

export async function markReauthenticatedIn(
  store: VerificationStore,
  sessionId: string,
  now = Date.now(),
): Promise<void> {
  await store.deleteVerificationByIdentifier(reauthIdentifier(sessionId));
  await store.createVerificationValue({
    identifier: reauthIdentifier(sessionId),
    value: "1",
    expiresAt: new Date(now + REAUTH_TTL_MS),
  });
}

export async function isReauthenticatedIn(
  store: VerificationStore,
  sessionId: string,
  now = Date.now(),
): Promise<boolean> {
  const row = await store.findVerificationValue(reauthIdentifier(sessionId));
  return row ? row.expiresAt.getTime() > now : false;
}

/**
 * Re-authentication for travel-detail document numbers (F-054, R.9 I11-08): a separate marker
 * per session, valid 12 hours, set by a code/magic-link sign-in or a confirmed code – a password
 * does not count (same reason as above).
 */
export const TRAVEL_REAUTH_TTL_MS = 12 * 60 * 60 * 1000;

export const travelReauthIdentifier = (sessionId: string) => `travel-reauth-${sessionId}`;

export async function markTravelReauthenticatedIn(
  store: VerificationStore,
  sessionId: string,
  now = Date.now(),
): Promise<void> {
  await store.deleteVerificationByIdentifier(travelReauthIdentifier(sessionId));
  await store.createVerificationValue({
    identifier: travelReauthIdentifier(sessionId),
    value: "1",
    expiresAt: new Date(now + TRAVEL_REAUTH_TTL_MS),
  });
}
