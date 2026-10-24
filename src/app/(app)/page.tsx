import { redirect } from "next/navigation";
import { resolveRequestLocale } from "@/i18n/request";
import { todayIso } from "@/lib/dates";
import { START_PARAM, startTrip } from "@/lib/start-trip";
import { tripPath } from "@/features/trips/paths";
import { getSession } from "@/server/session";
import { listTripsForUser } from "@/server/trips";

/**
 * `/` – the app start (home-screen icon, bookmark, login without `next`). Signed in: the ONE
 * trip running today opens directly (W16 v2.18), otherwise «Meine Reisen»; signed out: landing
 * in the negotiated language (sitemap §4). Only this route redirects – `/trips` never does, and
 * deep links (invites, reminders, `next`) never pass through here.
 */
export default async function RootRedirect() {
  const session = await getSession();
  if (session) {
    const items = await listTripsForUser(session.user.id);
    const target = startTrip(
      items.map(({ trip }) => ({
        publicId: trip.publicId,
        name: trip.name,
        phase: trip.phase,
        fixedStart: trip.fixedStart,
        fixedEnd: trip.fixedEnd,
      })),
      todayIso(),
    );
    redirect(target.kind === "trip" ? `${tripPath(target.publicId)}?${START_PARAM}=1` : "/trips");
  }
  redirect(`/${await resolveRequestLocale()}`);
}
