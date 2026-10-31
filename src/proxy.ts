import { NextResponse, type NextRequest } from "next/server";
import { APP_ENVS, canonicalRedirect, previewPasswordOk, resolveAppEnv } from "@/lib/app-env";
import { BASIC_AUTH_REALM, basicAuthMatches, isOpenPath } from "@/lib/basic-auth";

/**
 * Next.js 16 Proxy (formerly Middleware; Node.js runtime by default). Active with APP_ENV=beta
 * (canonical host, noindex – see below) and APP_ENV=preview – the password-protected online preview (PRD Q25, deployment.md §0.7):
 * every page and API route needs the HTTP Basic Auth password PREVIEW_ACCESS_PASSWORD
 * (user name: anything). Without a valid password configured the preview is closed (503)
 * – fail closed, even if the start guard in instrumentation.ts did not run in this instance.
 */
const NOINDEX = "noindex, nofollow";

function plain(status: number, body: string, headers: Record<string, string> = {}): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": NOINDEX,
      ...headers,
    },
  });
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const appEnv = resolveAppEnv();
  // Friends beta (deployment.md §0.12.4 Nr. 9, 10): no Basic Auth – the beta code guards the
  // sign-up instead –, one canonical host (308 to APP_URL, except cron and health) and never
  // indexed.
  if (appEnv === "beta") {
    const target = canonicalRedirect(process.env, {
      host: request.headers.get("host"),
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
    });
    if (target) {
      return new NextResponse(null, {
        status: 308,
        headers: { location: target, "x-robots-tag": NOINDEX, "cache-control": "no-store" },
      });
    }
    const response = NextResponse.next();
    response.headers.set("x-robots-tag", NOINDEX);
    return response;
  }
  // Unknown/misspelt APP_ENV (e.g. «Preview») is treated like preview: protected, and closed
  // without password – the start guard refuses it too, but must not be the only barrier.
  if (appEnv !== "preview" && (APP_ENVS as readonly string[]).includes(appEnv)) {
    return NextResponse.next();
  }
  if (isOpenPath(request.nextUrl.pathname)) {
    const open = NextResponse.next();
    open.headers.set("x-robots-tag", NOINDEX);
    return open;
  }
  const password = process.env.PREVIEW_ACCESS_PASSWORD;
  if (!previewPasswordOk(password)) {
    return plain(503, "Preview not configured (PREVIEW_ACCESS_PASSWORD missing).");
  }
  if (!(await basicAuthMatches(request.headers.get("authorization"), password))) {
    return plain(
      401,
      "Private Vorschau – bitte mit dem Zugangspasswort anmelden.\nPrivate preview – please sign in with the access password.",
      { "www-authenticate": `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"` },
    );
  }
  const response = NextResponse.next();
  response.headers.set("x-robots-tag", NOINDEX);
  return response;
}

export const config = {
  // Static build output and public assets without secrets are served without the proxy
  // (fewer function invocations on Vercel); everything else – pages, API, Server Actions – runs
  // through it.
  matcher: [
    "/((?!_next/static|_next/image|fonts/|favicon\\.|icon-|icons\\.svg|apple-touch-icon).*)",
  ],
};
