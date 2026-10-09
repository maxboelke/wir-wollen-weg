import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import { Enter } from "@/components/enter";
import { Illustration } from "@/components/illustrations/illustration";
import { PageShell } from "@/components/page-shell";
import { Banner } from "@/components/ui/banner";
import { ButtonLink } from "@/components/ui/button-link";
import { Tile } from "@/components/ui/card";
import { EmailAccessForm } from "@/features/auth/components/email-access-form";
import { joinTrip, joinTripFormAction } from "@/features/invite/actions";
import { JoinGate } from "@/features/invite/join-gate";
import { JoinPanel } from "@/features/invite/join-panel";
import { TripCard } from "@/features/invite/trip-card";
import { nightsText, rangeText } from "@/features/trips/format";
import { tripPath } from "@/features/trips/paths";
import { isLocale } from "@/i18n/config";
import { formatDate, todayIso } from "@/lib/dates";
import { INVITE_MISS_LIMIT } from "@/lib/invite-limits";
import { defaultTab, uiPhase } from "@/lib/trip-status";
import { MAX_TRIP_MEMBERS } from "@/server/db/schema";
import { checkLimit, recordEvent, requestLimitSubject } from "@/server/rate-limit";
import { getSession } from "@/server/session";
import { findInvite, findMembership } from "@/server/trips";
import { viewerFormat } from "@/server/viewer";
import styles from "./invite.module.css";

type Params = PageProps<"/i/[token]">;

/**
 * One lookup per request for metadata and page. A valid token is always delivered – the
 * miss limit never blocks it, also not from a shared address that has hit it (R-036, CEO
 * decision (a)). Misses are counted per IP (IPv6: /64); beyond the limit they are no longer
 * recorded and only logged (database protection, no further writes) – the visitor sees the
 * same «link not valid» page either way (Flow A.3). Without a resolvable IP misses are not
 * counted at all (no shared bucket). The token never appears in logs.
 */
const lookup = cache(async (token: string) => {
  const preview = await findInvite(token);
  if (preview) return { kind: "ok" as const, preview };
  const subject = await requestLimitSubject();
  if (subject) {
    const limit = await checkLimit(INVITE_MISS_LIMIT, subject);
    if (limit.limited) console.warn("invite: miss limit reached – possible token scanning");
    else await recordEvent(INVITE_MISS_LIMIT, subject);
  }
  return { kind: "invalid" as const };
});

/**
 * Link preview (F-002, sitemap §4): trip name + product name in the language of the trip's
 * creation (crawlers send no language), never member names or dates.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const result = await lookup(token);
  const t = await getTranslations("invite");
  if (result.kind !== "ok") return { title: t("invalidTitle") };
  const tripLocale = isLocale(result.preview.locale) ? result.preview.locale : "en";
  const product = (await getTranslations({ locale: tripLocale, namespace: "app" }))("name");
  return {
    title: result.preview.name,
    openGraph: {
      title: `${result.preview.name} · ${product}`,
      siteName: product,
      type: "website",
    },
  };
}

/**
 * Invite (W03 B, F-003, Flow A): trip card (organiser's first name, number of members – no
 * names, no dates of others), facts, then the join step: signed out → e-mail → code → name
 * (= join); signed in → one tap. Members go straight to their trip. Invalid, renewed and
 * deleted links share one message (A.3).
 */
export default async function InvitePage({ params }: Params) {
  const { token } = await params;
  const t = await getTranslations("invite");
  const [result, session] = await Promise.all([lookup(token), getSession()]);

  if (result.kind === "invalid") {
    // R-007: the invalid state has a level-1 heading.
    return (
      <PageShell enter={false}>
        <Enter className={styles.invalid}>
          <Illustration name="error" width={200} />
          <h1>{t("invalidTitle")}</h1>
          <p className={styles.lead}>{t("invalid")}</p>
          <ButtonLink href={session ? "/trips" : "/trips/new"} variant="primary" block>
            {session ? t("myTrips") : t("planOwn")}
          </ButtonLink>
        </Enter>
      </PageShell>
    );
  }

  const { preview } = result;
  if (session) {
    const membership = await findMembership(preview.publicId, session.user.id);
    if (membership) {
      // Already in: straight to the trip (Flow A.3), its default tab (sitemap §2).
      const phase = uiPhase(membership.trip, todayIso());
      redirect(tripPath(preview.publicId, defaultTab(phase, membership.member)));
    }
  }

  const format = await viewerFormat(session);
  const today = todayIso();
  const phase = uiPhase(preview, today);
  const orga = preview.organizerFirstName;
  // A free placeholder already counts – taking it over needs no extra spot (F-007).
  const claiming = preview.placeholder && !preview.placeholder.claimed ? preview.placeholder : null;
  const full = !claiming && preview.memberCount + preview.placeholderCount >= MAX_TRIP_MEMBERS;
  const sameYear = preview.rangeStart.slice(0, 4) === preview.rangeEnd.slice(0, 4);
  const nights = nightsText(preview.minNights, preview.preferredNights, {
    nights: (count) => t("nights", { count }),
    range: (min, max) => t("nightsRange", { min, max }),
  });

  return (
    <PageShell enter={false}>
      <div className={styles.page}>
        <div className={styles.preview}>
          <Enter variant="card">
            <TripCard
              name={preview.name}
              organizerFirstName={orga}
              memberCount={preview.memberCount}
            />
          </Enter>
          <ul className={styles.facts} aria-label={t("factsLabel")}>
            <li className={styles.fact}>
              <Tile icon="calendar" tone="lavender" size="sm" />
              <span suppressHydrationWarning>
                {t("rangeFact", {
                  start: formatDate(preview.rangeStart, format.intl, {
                    weekday: false,
                    year: !sameYear,
                  }),
                  end: formatDate(preview.rangeEnd, format.intl, { weekday: false, year: true }),
                })}
              </span>
            </li>
            <li className={styles.fact}>
              <Tile icon="nights" tone="sun" size="sm" />
              <span>{nights}</span>
            </li>
            {preview.description ? (
              <li className={styles.fact}>
                <Tile icon="comment" tone="mint" size="sm" />
                <span className={styles.description}>{preview.description}</span>
              </li>
            ) : null}
          </ul>
          {claiming ? (
            <p className={styles.hello}>{t("placeholderHello", { name: claiming.name, orga })}</p>
          ) : null}
          {preview.placeholder?.claimed ? (
            <Banner tone="info" role="status">
              {t("placeholderUsed")}
            </Banner>
          ) : null}
          {phase === "vote" ? <Banner tone="info">{t("phaseVote")}</Banner> : null}
          {phase === "fixed" && preview.fixedStart && preview.fixedEnd ? (
            <Banner tone="info">
              {t("phaseFixed", {
                range: rangeText(preview.fixedStart, preview.fixedEnd, format.intl, today),
              })}
            </Banner>
          ) : null}
        </div>

        {full || !preview.joinOpen ? (
          <div className={styles.blocked}>
            <Banner tone="info" role="status">
              {full ? t("full", { orga }) : t("closed", { orga })}
            </Banner>
            <ButtonLink href={session ? "/trips" : "/trips/new"} variant="secondary" size="md">
              {session ? t("myTrips") : t("planOwn")}
            </ButtonLink>
          </div>
        ) : session ? (
          <JoinPanel
            token={token}
            name={session.user.name}
            joinName={claiming?.name}
            email={session.user.email}
            action={joinTripFormAction.bind(null, token)}
          />
        ) : (
          <JoinGate
            origin={`/i/${token}`}
            cta={t("joinCta")}
            notes={
              <>
                <p>{t("joinNote")}</p>
                <p>{t("accountNote")}</p>
              </>
            }
          >
            <EmailAccessForm
              returnTo={`/i/${token}`}
              variant="invite"
              onNameSubmit={joinTrip.bind(null, token)}
              tripName={preview.name}
              defaultName={claiming?.name}
              codeIllustration={<Illustration name="code-sent" />}
            />
          </JoinGate>
        )}
      </div>
    </PageShell>
  );
}
