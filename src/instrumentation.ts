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
  // Start guard (compliance-checklist §0a, deployment.md §0.6): production never runs with the
  // placeholder legal texts of the offline demo.
  if (process.env.APP_ENV === "production") {
    const { findPlaceholderMarkers } = await import("./lib/legal");
    const [de, en] = await Promise.all([
      import("../messages/de.json"),
      import("../messages/en.json"),
    ]);
    const left = [...findPlaceholderMarkers(de.default), ...findPlaceholderMarkers(en.default)];
    if (left.length > 0) {
      throw new Error(
        `APP_ENV=production: placeholder texts left (${left.slice(0, 5).join(", ")}${left.length > 5 ? ", …" : ""}) – compliance-checklist §0a`,
      );
    }
  }
}
