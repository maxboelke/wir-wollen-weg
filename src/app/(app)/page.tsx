import { redirect } from "next/navigation";
import { resolveRequestLocale } from "@/i18n/request";
import { getSession } from "@/server/session";
import { startTargetFor } from "@/server/start";

/**
 * `/` – the app start (home-screen icon, bookmark, login without `next`). Signed in: the ONE
 * trip running today opens directly (W16 v2.18), otherwise «Meine Reisen»; signed out: landing
 * in the negotiated language (sitemap §4). Only this route redirects – `/trips` never does, and
 * deep links (invites, reminders, `next`) never pass through here.
 */
export default async function RootRedirect() {
  const session = await getSession();
  if (session) redirect(await startTargetFor(session.user.id));
  redirect(`/${await resolveRequestLocale()}`);
}
