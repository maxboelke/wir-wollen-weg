import { redirect } from "next/navigation";
import { resolveRequestLocale } from "@/i18n/request";
import { getSession } from "@/server/session";

/** `/` → signed in: /trips; otherwise landing in the negotiated language (sitemap §4). */
export default async function RootRedirect() {
  const session = await getSession();
  if (session) redirect("/trips");
  redirect(`/${await resolveRequestLocale()}`);
}
