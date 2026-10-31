/**
 * Runs once when the server starts (not during `next build`). Fails fast on configuration
 * that would otherwise only break – or silently weaken – the first request.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { onVercel, resolveAppEnv, resolveAuthUrl, startupProblems } =
    await import("./lib/app-env");
  const appEnv = resolveAppEnv();
  const { deriveEmailLimitKey } = await import("./server/auth/email-limit-key");
  // R-028: outside development/CI a missing BETTER_AUTH_SECRET is a start error.
  deriveEmailLimitKey({ appEnv, secret: process.env.BETTER_AUTH_SECRET || undefined });

  // Start guard (compliance-checklist §0a, deployment.md §0.6/§0.7, R-064): production never
  // runs with the placeholder legal texts of the offline demo; preview/staging/production only
  // with https; the online preview only with its access password.
  let placeholders: string[] = [];
  if (appEnv === "production" || appEnv === "beta") {
    const { findPlaceholderMarkers } = await import("./lib/legal");
    const [de, en] = await Promise.all([
      import("../messages/de.json"),
      import("../messages/en.json"),
    ]);
    // production: every text. beta: only what the beta delivers instead of the demo legal pages
    // – privacy notice, contact page, mail footer, sign-up texts (deployment.md §0.12.4 Nr. 8).
    const delivered = (catalog: typeof de.default) =>
      appEnv === "production"
        ? catalog
        : { beta: catalog.beta, legalBeta: catalog.legalBeta, mail: catalog.mail };
    placeholders = [
      ...findPlaceholderMarkers(delivered(de.default)),
      ...findPlaceholderMarkers(delivered(en.default)),
    ];
  }
  const problems = startupProblems({
    appEnv,
    authUrl: resolveAuthUrl(),
    previewPassword: process.env.PREVIEW_ACCESS_PASSWORD || undefined,
    mailTransport: process.env.MAIL_TRANSPORT || undefined,
    onVercel: onVercel(),
    placeholders,
    env: process.env,
  });
  if (problems.length > 0) throw new Error(`Start refused: ${problems.join(" · ")}`);
  if (appEnv === "beta") {
    const { betaStartupWarnings } = await import("./lib/beta-config");
    for (const warning of betaStartupWarnings(process.env)) console.warn(`beta: ${warning}`);
  }
}
