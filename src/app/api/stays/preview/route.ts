import { NextResponse, type NextRequest } from "next/server";
import type { LimitRule } from "@/lib/invite-limits";
import { canSuggestStay, checkStayUrl, normalizeStayUrl } from "@/lib/stays";
import { takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findDuplicate, stayGate } from "@/server/stays/db";
import { fetchLinkPreview, previewKey } from "@/server/stays/preview";
import { PREVIEW_TOKEN_TTL_MS, signPreviewToken } from "@/server/stays/preview-token";
import { sameOrigin } from "@/server/stays/same-origin";
import { findMembership } from "@/server/trips";

// deployment.md §0.8: Node runtime (dns, tls, undici, zlib), dynamic, bounded duration.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const MINUTE = 60_000;
const PREVIEW_SHORT: LimitRule = { kind: "stay-preview", limit: 20, windowMs: 10 * MINUTE };
const PREVIEW_HOUR: LimitRule = { kind: "stay-preview-hour", limit: 60, windowMs: 60 * MINUTE };

type PreviewAnswer =
  | { ok: true; title: string | null; site: string | null; image: string | null; token: string }
  | { ok: false; duplicate?: { name: string | null; own: boolean } };

const json = (body: PreviewAnswer, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * Link preview for «Unterkunft vorschlagen» (R.7 I9-03): members of a trip in phase «fixed»
 * only – not an open service. Every failure (blocked, timeout, too big, no metadata, unsafe
 * address, rate limit) gives the same neutral `{ ok: false }` → placeholder card; no details.
 * The result travels as an encrypted token (R-076); images are shown through our own proxy.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!sameOrigin(request)) return json({ ok: false }, 403);
  const session = await getSession();
  if (!session) return json({ ok: false }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const { trip: publicId, url } = (body ?? {}) as { trip?: unknown; url?: unknown };
  if (typeof publicId !== "string") return json({ ok: false }, 404);
  const found = await findMembership(publicId, session.user.id);
  if (!found || found.trip.phase !== "fixed") return json({ ok: false }, 404);
  // R-077: no outbound request (and no duplicate details) once suggesting is closed – place
  // picked or 30 suggestions reached. Same neutral answer as every other failure.
  const gate = await stayGate(found.trip.id);
  if (!canSuggestStay({ phase: found.trip.phase, ...gate })) return json({ ok: false });
  const link = checkStayUrl(url);
  if (!link.ok) return json({ ok: false });
  const normalized = normalizeStayUrl(link.url);
  const duplicate = await findDuplicate(found.trip.id, normalized);
  if (duplicate) {
    return json({
      ok: false,
      duplicate: {
        name: duplicate.authorName,
        own: duplicate.authorId === session.user.id,
      },
    });
  }
  const subject = `stay-preview:${session.user.id}`;
  if ((await takeLimit(PREVIEW_HOUR, subject)).limited) return json({ ok: false });
  if ((await takeLimit(PREVIEW_SHORT, subject)).limited) return json({ ok: false });
  const meta = await fetchLinkPreview(link.url, found.trip.locale);
  if (!meta) return json({ ok: false });
  const token = signPreviewToken(previewKey(), {
    trip: found.trip.id,
    url: normalized,
    image: meta.imageUrl,
    site: meta.siteName,
    exp: Date.now() + PREVIEW_TOKEN_TTL_MS,
  });
  return json({
    ok: true,
    title: meta.title,
    site: meta.siteName,
    image: meta.imageUrl ? `/api/stays/image?t=${encodeURIComponent(token)}` : null,
    token,
  });
}
