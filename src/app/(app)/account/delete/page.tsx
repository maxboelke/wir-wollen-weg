import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { DeleteAccountFlow } from "@/features/account/components/delete-account-flow";
import { soloTrips, successorsOf, tripsNeedingChoice } from "@/lib/account-deletion";
import { hasPassword } from "@/server/account";
import { deletionOverview } from "@/server/account-deletion";
import { getSession } from "@/server/session";
import { viewerFormat } from "@/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.delete");
  return { title: t("title") };
}

/** W13 «Konto löschen» (F-043, Flow I.3). */
export default async function DeleteAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/delete");
  const [trips, passwordSet, format] = await Promise.all([
    deletionOverview(session.user.id),
    hasPassword(session.user.id),
    viewerFormat(session),
  ]);
  return (
    <PageShell>
      <DeleteAccountFlow
        email={session.user.email}
        canUsePassword={passwordSet}
        organized={tripsNeedingChoice(trips).map((trip) => ({
          publicId: trip.publicId,
          name: trip.name,
          memberCount: trip.memberCount,
          successors: successorsOf(trip).map((other) => ({
            userId: other.userId,
            displayName: other.displayName,
            joinedAt: other.joinedAt.toISOString(),
          })),
        }))}
        solo={soloTrips(trips).map((trip) => trip.name)}
        memberOf={trips.filter((trip) => trip.role === "member").length}
        intl={format.intl}
      />
    </PageShell>
  );
}
