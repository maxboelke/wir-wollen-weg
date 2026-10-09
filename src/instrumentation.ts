/**
 * Runs once when the server starts (not during `next build`). Fails fast on configuration
 * that would otherwise only break – or silently weaken – the first auth request.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { deriveEmailLimitKey } = await import("./server/auth/email-limit-key");
  // R-028: outside development/CI a missing BETTER_AUTH_SECRET is a start error.
  deriveEmailLimitKey({
    appEnv: process.env.APP_ENV || undefined,
    secret: process.env.BETTER_AUTH_SECRET || undefined,
  });
}
