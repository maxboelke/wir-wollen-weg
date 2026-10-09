import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Enter } from "@/components/enter";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { joinTrip, joinTripFormAction } from "@/features/auth/actions";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { JoinForm } from "@/features/invite/join-form";
import { TripCard } from "@/features/invite/trip-card";
import { getSession } from "@/server/session";
import {
  countMembers,
  findOrganizerFirstName,
  findTripByInviteToken,
  isMember,
} from "@/server/trips";
import styles from "./invite.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite");
  return { title: t("title") };
}

/**
 * Invite route (W03): preview → e-mail → code → name/join, all on this URL so the invite
 * token survives registration. Full F-002/F-003 (join button step, limits) in Increment 2.
 */
export default async function InvitePage({ params }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const t = await getTranslations("invite");
  const [trip, session] = await Promise.all([findTripByInviteToken(token), getSession()]);

  if (!trip) {
    // One shared text for invalid/renewed/deleted links – reveals nothing (Flow A.3, R-007: h1).
    return (
      <PageShell enter={false}>
        <Enter className={styles.invalid}>
          <Illustration name="error" width={200} />
          <h1>{t("invalidTitle")}</h1>
          <p className={styles.lead}>{t("invalid")}</p>
          <ButtonLink href="/trips" variant="primary" block>
            {session ? t("myTrips") : t("planOwn")}
          </ButtonLink>
        </Enter>
      </PageShell>
    );
  }

  if (session && (await isMember(trip.id, session.user.id))) redirect("/trips");
  const [memberCount, organizer] = await Promise.all([
    countMembers(trip.id),
    findOrganizerFirstName(trip.id),
  ]);
  const join = joinTrip.bind(null, token);

  return (
    <PageShell enter={false}>
      <div className={styles.page}>
        <Enter variant="card">
          <TripCard
            tripId={trip.id}
            name={trip.name}
            organizerFirstName={organizer}
            memberCount={memberCount}
          />
        </Enter>
        {session ? (
          <JoinForm currentName={session.user.name} action={joinTripFormAction.bind(null, token)} />
        ) : (
          <EmailAccessForm
            returnTo={`/i/${token}`}
            variant="invite"
            onNameSubmit={join}
            tripName={trip.name}
            codeIllustration={<Illustration name="code-sent" />}
          />
        )}
      </div>
    </PageShell>
  );
}
