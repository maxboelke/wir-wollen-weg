import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { signOut } from "@/features/auth/actions";
import { getSession } from "@/server/session";
import { listTripsForUser } from "@/server/trips";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trips");
  return { title: t("title") };
}

/** Placeholder "My trips" (F-044 comes in Increment 2) – proves session + join. */
export default async function TripsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/trips");
  const t = await getTranslations("trips");
  const trips = await listTripsForUser(session.user.id);

  return (
    <PageShell homeHref="/trips">
      <div className={ui.stack}>
        <h1>{t("title")}</h1>
        <p className={ui.muted}>{t("signedInAs", { name: session.user.name })}</p>
        {trips.length === 0 ? (
          <p>{t("empty")}</p>
        ) : (
          <ul>
            {trips.map((trip) => (
              <li key={trip.id}>{trip.name}</li>
            ))}
          </ul>
        )}
        <form action={signOut}>
          <button type="submit" className={ui.textButton}>
            {t("signOut")}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
