import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { ButtonLink } from "@/components/ui/button-link";
import { loadPoll, shortLabels } from "@/features/poll/load";
import { PollView } from "@/features/poll/components/poll-view";
import styles from "@/features/poll/components/poll.module.css";
import { TripShell } from "@/features/trips/components/trip-shell";
import { nameList } from "@/features/trips/format";
import { loadTripView, openNames, type TripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { pollShareTexts, tripLink } from "@/features/trips/share-texts";
import { diffDays, formatDate } from "@/lib/dates";

type Params = PageProps<"/trips/[id]/poll">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([
    getTranslations("trip"),
    loadTripView(id, `/trips/${id}/poll`),
  ]);
  return { title: `${t("tabs.poll")} · ${view.trip.name}` };
}

/** Phase 1: nothing to vote on yet (W10 «Leerzustände Tab Abstimmen»). */
async function EmptyPoll({ view }: { view: TripView }) {
  const t = await getTranslations("poll");
  const tTrip = await getTranslations("trip");
  const { trip, isOrganizer, members, format } = view;
  const orga = members.find((m) => m.role === "organizer")?.displayName ?? "";
  const open = openNames(view);
  return (
    <section className={styles.empty}>
      <Illustration name="vote-waiting" width={180} />
      {isOrganizer ? (
        <>
          <h1>{t("emptyOrgaTitle")}</h1>
          <p className={styles.lead}>{t("emptyOrgaText")}</p>
          {open.length > 0 ? (
            <p className={styles.muted}>
              {t("emptyOrgaOpen", {
                names: nameList(open, format.locale, (count) => tTrip("kpiMore", { count })),
              })}
            </p>
          ) : null}
          <ButtonLink href={tripPath(trip.publicId, "pollNew")} icon="vote">
            {t("emptyOrgaAction")}
          </ButtonLink>
        </>
      ) : (
        <>
          <h1>{t("emptyMemberTitle")}</h1>
          <p className={styles.lead}>{t("emptyMemberText", { orga })}</p>
          <ButtonLink href={tripPath(trip.publicId, "group")} variant="secondary" size="md">
            {t("emptyMemberAction")}
          </ButtonLink>
        </>
      )}
    </section>
  );
}

/**
 * W10 «Abstimmen» (F-011, F-012, F-017). The poll data goes through `loadPoll`, which applies
 * the visibility rule Q13 a on the server: results of options the viewer has not answered are
 * not part of the HTML or the RSC payload (the organiser and – after fixing – everybody sees
 * all). Phase 1 shows the empty states.
 */
export default async function PollPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const view = await loadTripView(id, `/trips/${id}/poll`);
  const { trip, phase, members, format, today, isOrganizer, progress, me } = view;
  if (phase === "collect" || (phase === "past" && trip.phase === "collecting")) {
    return (
      <TripShell view={view} tab="poll">
        <EmptyPoll view={view} />
      </TripShell>
    );
  }
  const t = await getTranslations("poll");
  const { cards, poll, order, people } = await loadPoll(view);
  const orgaName = members.find((m) => m.role === "organizer")?.displayName ?? "";
  const pollLink = tripLink(tripPath(trip.publicId, "poll"));
  const texts = await pollShareTexts({
    tripName: trip.name,
    link: pollLink,
    count: cards.length,
    deadline: trip.pollDeadline,
    senderCountry: format.country,
  });
  let deadline: { value: string; until: string; passed: boolean } | null = null;
  if (trip.pollDeadline) {
    const left = diffDays(today, trip.pollDeadline);
    deadline = {
      value:
        left < 0
          ? t("kpiDeadlinePassed")
          : left === 0
            ? t("kpiDeadlineToday")
            : t("kpiDeadline", { count: left }),
      until: t("kpiDeadlineUntil", {
        date: formatDate(trip.pollDeadline, format.intl, { weekday: true, year: false }),
      }),
      passed: left < 0,
    };
  }
  const voting = phase === "vote";
  const done = progress ?? {
    done: members.filter((m) => m.votedAt).length,
    total: members.length,
  };

  return (
    <TripShell view={view} tab="poll">
      <PollView
        publicId={trip.publicId}
        isOrganizer={isOrganizer}
        phase={voting ? "vote" : phase === "fixed" ? "fixed" : "past"}
        cards={cards}
        poll={poll}
        order={order}
        progress={done}
        voted={members.filter((m) => m.votedAt).map((m) => m.displayName)}
        open={members.filter((m) => !m.votedAt).map((m) => m.displayName)}
        deadline={voting ? deadline : null}
        orgaName={orgaName}
        fixed={
          trip.fixedStart && trip.fixedEnd ? { start: trip.fixedStart, end: trip.fixedEnd } : null
        }
        overviewHref={tripPath(trip.publicId)}
        celebrationPending={view.celebrate}
        started={query.started === "1"}
        share={{ link: pollLink, texts, defaultLocale: format.locale, tripName: trip.name }}
        add={
          isOrganizer && voting
            ? {
                rangeStart: trip.rangeStart,
                rangeEnd: trip.rangeEnd,
                minNights: trip.minNights,
                today: trip.rangeStart > today ? trip.rangeStart : today,
                labels: shortLabels(view),
                people: people.people,
              }
            : null
        }
        seal={<Illustration name="seal" width={20} />}
        key={me.userId}
      />
    </TripShell>
  );
}
