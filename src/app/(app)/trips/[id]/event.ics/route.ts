import { getTranslations } from "next-intl/server";
import { tripPath } from "@/features/trips/paths";
import { tripLink } from "@/features/trips/share-texts";
import { buildIcs, icsFileName } from "@/lib/ics";
import { getSession } from "@/server/session";
import { findMembership } from "@/server/trips";

export const dynamic = "force-dynamic";

/**
 * «Zum Kalender hinzufügen → Kalenderdatei» (F-012, Flow D.3): all-day event from arrival to
 * departure. Only for signed-in members of a trip with fixed dates – everybody else gets the
 * same 404 (no difference between "does not exist" and "no access", sitemap §4).
 */
export async function GET(_request: Request, { params }: RouteContext<"/trips/[id]/event.ics">) {
  const { id } = await params;
  const session = await getSession();
  const found = session ? await findMembership(id, session.user.id) : null;
  const trip = found?.trip;
  if (!trip || trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd) {
    return new Response("Not found", { status: 404 });
  }
  const t = await getTranslations("poll.result");
  const tApp = await getTranslations("app");
  const body = buildIcs(
    {
      uid: `${trip.publicId}-${trip.fixedStart}-${trip.fixedEnd}@wir-wollen-weg`,
      title: trip.name,
      start: trip.fixedStart,
      end: trip.fixedEnd,
      url: tripLink(tripPath(trip.publicId)),
      description: t("calendarDescription"),
      stamp: trip.fixedAt ?? new Date(),
    },
    tApp("name"),
  );
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${icsFileName(trip.name)}"`,
      "cache-control": "private, no-store",
    },
  });
}
