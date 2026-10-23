import "server-only";

/**
 * CSRF guard of our JSON route handlers: the browser's `Origin` must be our own host (same
 * check as Server Actions: `x-forwarded-host` behind a proxy, otherwise `host`). Requests
 * without an `Origin` are rejected – every browser sends it on POST.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return host !== null && new URL(origin).host === host.split(",")[0]?.trim();
  } catch {
    return false;
  }
}
