import { type NextRequest } from "next/server";
import { z } from "zod";
import type { LimitRule } from "@/lib/invite-limits";
import { takeLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { stayImageForMember } from "@/server/stays/db";
import { fetchStayImage, previewKey } from "@/server/stays/preview";
import { verifyPreviewToken } from "@/server/stays/preview-token";
import { isMember } from "@/server/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const IMAGE_LIMIT: LimitRule = { kind: "stay-image", limit: 600, windowMs: 10 * 60_000 };

/** Security headers of every answer (R.7 I9-04) – also of the errors. */
const BASE_HEADERS = {
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; sandbox",
  "cross-origin-resource-policy": "same-origin",
} as const;

function fail(status: number): Response {
  return new Response(null, { status, headers: { ...BASE_HEADERS, "cache-control": "no-store" } });
}

/**
 * Image proxy (R.7 I9-04, Q34): the browser never talks to third-party servers. NOT an open
 * proxy – it takes no URL, only the id of a stored suggestion (`?s=`, membership checked) or a
 * signed preview token (`?t=`, before saving; trip membership checked too). The image is
 * fetched with the SSRF-safe fetcher, typed by magic bytes (no SVG), ≤ 4 MB, and never stored
 * on our side – only the browser may cache it privately for a day.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session) return fail(401);
  const params = request.nextUrl.searchParams;
  let imageUrl: string | null = null;
  const stayId = z.uuid().safeParse(params.get("s"));
  if (stayId.success) {
    imageUrl = await stayImageForMember(stayId.data, session.user.id);
  } else {
    const claims = verifyPreviewToken(previewKey(), params.get("t"));
    if (claims && (await isMember(claims.trip, session.user.id))) imageUrl = claims.image;
  }
  if (!imageUrl?.startsWith("https://")) return fail(404);
  if ((await takeLimit(IMAGE_LIMIT, `stay-image:${session.user.id}`)).limited) return fail(429);
  const image = await fetchStayImage(imageUrl);
  if (!image) return fail(404);
  return new Response(new Uint8Array(image.body), {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "content-type": image.type,
      "content-length": String(image.body.length),
      "cache-control": "private, max-age=86400",
    },
  });
}
