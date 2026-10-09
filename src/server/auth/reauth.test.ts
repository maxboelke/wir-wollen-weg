import { describe, expect, it } from "vitest";
import {
  isReauthenticatedIn,
  MAILBOX_SIGN_IN_PATHS,
  markReauthenticatedIn,
  REAUTH_TTL_MS,
  type VerificationStore,
} from "./reauth";

function memoryStore(): VerificationStore & { rows: Map<string, Date> } {
  const rows = new Map<string, Date>();
  return {
    rows,
    findVerificationValue: (identifier) => {
      const expiresAt = rows.get(identifier);
      return Promise.resolve(expiresAt ? { expiresAt } : null);
    },
    deleteVerificationByIdentifier: (identifier) => {
      rows.delete(identifier);
      return Promise.resolve();
    },
    createVerificationValue: ({ identifier, expiresAt }) => {
      rows.set(identifier, expiresAt);
      return Promise.resolve(undefined);
    },
  };
}

describe("re-authentication marker (R-023)", () => {
  const NOW = 1_800_000_000_000;

  it("is valid for 10 minutes per session", async () => {
    const store = memoryStore();
    expect(await isReauthenticatedIn(store, "s1", NOW)).toBe(false);
    await markReauthenticatedIn(store, "s1", NOW);
    expect(await isReauthenticatedIn(store, "s1", NOW + REAUTH_TTL_MS - 1)).toBe(true);
    expect(await isReauthenticatedIn(store, "s1", NOW + REAUTH_TTL_MS)).toBe(false);
    // Another session of the same account is not confirmed.
    expect(await isReauthenticatedIn(store, "s2", NOW)).toBe(false);
  });

  it("marking again extends instead of duplicating", async () => {
    const store = memoryStore();
    await markReauthenticatedIn(store, "s1", NOW);
    await markReauthenticatedIn(store, "s1", NOW + 5 * 60_000);
    expect(store.rows.size).toBe(1);
    expect(await isReauthenticatedIn(store, "s1", NOW + REAUTH_TTL_MS + 60_000)).toBe(true);
  });

  it("only code and magic-link sign-ins count as a fresh confirmation", () => {
    expect(MAILBOX_SIGN_IN_PATHS.has("/sign-in/email-otp")).toBe(true);
    expect(MAILBOX_SIGN_IN_PATHS.has("/magic-link/verify")).toBe(true);
    expect(MAILBOX_SIGN_IN_PATHS.has("/sign-in/email")).toBe(false);
  });
});
