import { after } from "next/server";

/**
 * Runs work after the response without the caller waiting for it (e.g. mails whose timing
 * must not reveal whether an account exists – F-041). On serverless hosts (Vercel preview,
 * PRD Q25) a bare un-awaited promise is frozen once the response is sent, so the work is
 * handed to Next's `after()`, which keeps the function alive until it settles. Outside a
 * request scope (scripts, tests) `after()` throws – then the promise simply runs on.
 */
export function runAfterResponse(work: Promise<unknown>): void {
  const settled = work.then(
    () => undefined,
    () => undefined,
  );
  try {
    after(settled);
  } catch {
    // No request scope: nothing keeps the process alive anyway, the promise runs on.
  }
}
