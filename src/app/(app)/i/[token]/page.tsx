import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import ui from "@/components/ui.module.css";
import { joinTrip, joinTripFormAction } from "@/features/auth/actions";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { JoinForm } from "@/features/invite/join-form";
import { LanguageSwitch } from "@/features/locale/language-switch";
import { getSession } from "@/server/session";
import { countMembers, findTripByInviteToken, isMember } from "@/server/trips";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite");
  return { title: t("title") };
}

/**
 * Minimal invite route for the auth spike (P1-0a): preview → e-mail → code → name/join,
 * all on this URL so the invite token survives registration. Full F-002/F-003 in Increment 2.
 */
export default async function InvitePage({ params }: PageProps<"/i/[token]">) {
  const { token } = await params;
  const t = await getTranslations("invite");
  const trip = await findTripByInviteToken(token);

  if (!trip) {
    return (
      <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
        <p role="status">{t("invalid")}</p>
      </PageShell>
    );
  }

  const session = await getSession();
  if (session && (await isMember(trip.id, session.user.id))) redirect("/trips");
  const memberCount = await countMembers(trip.id);
  const join = joinTrip.bind(null, token);

  return (
    <PageShell homeHref="/" languageSwitch={<LanguageSwitch />}>
      <div className={ui.stack}>
        <section className={ui.card} aria-labelledby="trip-heading">
          <h1 id="trip-heading">{trip.name}</h1>
          <p>{t("invitedBy", { trip: trip.name })}</p>
          <p className={ui.muted}>{t("memberCount", { count: memberCount })}</p>
        </section>
        {session ? (
          <JoinForm currentName={session.user.name} action={joinTripFormAction.bind(null, token)} />
        ) : (
          <EmailAccessForm returnTo={`/i/${token}`} variant="invite" onNameSubmit={join} />
        )}
      </div>
    </PageShell>
  );
}
