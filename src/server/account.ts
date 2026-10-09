import "server-only";
import { and, eq, isNotNull } from "drizzle-orm";
import { auth } from "./auth";
import { hashPassword, verifyPassword } from "./auth/password-hash";
import { db } from "./db/client";
import { account } from "./db/schema";

/** Re-authentication stays valid this long (Flow I.2: e-mail change; later account deletion). */
export const REAUTH_TTL_MS = 10 * 60 * 1000;

const reauthIdentifier = (sessionId: string) => `reauth-${sessionId}`;

async function context() {
  return auth().$context;
}

export async function hasPassword(userId: string): Promise<boolean> {
  const [row] = await db()
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, "credential"),
        isNotNull(account.password),
      ),
    )
    .limit(1);
  return row !== undefined;
}

/** Sets or replaces the password (Argon2id) – the credential account is created if needed. */
export async function storePassword(userId: string, password: string): Promise<void> {
  const ctx = await context();
  const hash = await hashPassword(password);
  const existing = await ctx.internalAdapter.findCredentialAccount(userId);
  if (existing) await ctx.internalAdapter.updatePassword(userId, hash);
  else {
    await ctx.internalAdapter.linkAccount({
      userId,
      providerId: "credential",
      accountId: userId,
      password: hash,
    });
  }
}

/** Back to passwordless (F-042): removes the credential account. */
export async function removePassword(userId: string): Promise<void> {
  await db()
    .delete(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));
}

export async function checkPassword(userId: string, password: string): Promise<boolean> {
  const ctx = await context();
  const credential = await ctx.internalAdapter.findCredentialAccount(userId);
  return credential?.password ? verifyPassword(credential.password, password) : false;
}

/** Marks the current session as freshly re-authenticated (code or password). */
export async function markReauthenticated(sessionId: string): Promise<void> {
  const ctx = await context();
  await ctx.internalAdapter.deleteVerificationByIdentifier(reauthIdentifier(sessionId));
  await ctx.internalAdapter.createVerificationValue({
    identifier: reauthIdentifier(sessionId),
    value: "1",
    expiresAt: new Date(Date.now() + REAUTH_TTL_MS),
  });
}

export async function isReauthenticated(sessionId: string): Promise<boolean> {
  const ctx = await context();
  const row = await ctx.internalAdapter.findVerificationValue(reauthIdentifier(sessionId));
  return row ? row.expiresAt > new Date() : false;
}

export async function clearReauthentication(sessionId: string): Promise<void> {
  const ctx = await context();
  await ctx.internalAdapter.deleteVerificationByIdentifier(reauthIdentifier(sessionId));
}
