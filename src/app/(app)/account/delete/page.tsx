import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { DeleteAccountFlow } from "@/features/account/components/delete-account-flow";
import { soloTrips, successorsOf, tripsNeedingChoice } from "@/lib/account-deletion";
import { hasPassword } from "@/server/account";
import { costsPath } from "@/features/trips/paths";
import { deletionOverview } from "@/server/account-deletion";
import { userBalances } from "@/server/costs/db";
import { getSession } from "@/server/session";
import { travelFootprint } from "@/server/travel-data/db";
import { viewerFormat } from "@/server/viewer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.delete");
  return { title: t("title") };
}

/** W13 «Konto löschen» (F-043, Flow I.3). */
export default async function DeleteAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/delete");
  const [trips, passwordSet, format, travel] = await Promise.all([
    deletionOverview(session.user.id),
    hasPassword(session.user.id),
    viewerFormat(session),
    travelFootprint(session.user.id),
  ]);
  const balances = await userBalances(
    session.user.id,
    trips.map((trip) => trip.tripId),
  );
  const openCosts = trips.flatMap((trip) => {
    const own = balances.get(trip.tripId);
    return own && own.cents !== 0 && !own.closed
      ? [
          {
            name: trip.name,
            href: costsPath(trip.publicId, "balances"),
            cents: own.cents,
            currency: own.currency,
          },
        ]
      : [];
  });
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
        travel={travel}
        memberOf={trips.filter((trip) => trip.role === "member").length}
        intl={format.intl}
        openCosts={openCosts}
      />
    </PageShell>
  );
}
