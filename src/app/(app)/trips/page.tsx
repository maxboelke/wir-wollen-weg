import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { IllustrationMotion } from "@/components/illustrations/illustration-motion";
import { PageShell } from "@/components/page-shell";
import { StaggerEnter } from "@/components/stagger-enter";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { TripListCard, type TripListCardData } from "@/features/trips/components/trip-list-card";
import { tripPath } from "@/features/trips/paths";
import { isoDateInZone, todayIso } from "@/lib/dates";
import { runningTrips } from "@/lib/start-trip";
import {
  compareTrips,
  daysUntil,
  defaultTab,
  phaseProgress,
  uiPhase,
  viewerTodo,
} from "@/lib/trip-status";
import { getSession } from "@/server/session";
import {
  effectiveDeletionDate,
  inNoticeWindow,
  TRIP_NOTICE_DAYS,
  tripDeletionDate,
} from "@/lib/retention";
import { listTripsForUser, type TripListItem } from "@/server/trips";
import { viewerFormat } from "@/server/viewer";
import styles from "./trips.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trips");
  return { title: t("title") };
}

function toCard(
  item: TripListItem,
  today: string,
): TripListCardData & { updatedAt: string; start: string } {
  const { trip, me, memberCount, submittedCount, votedCount, placeholderCount } = item;
  const phase = uiPhase(trip, today);
  // Counters from the database; only the shape `phaseProgress` needs.
  const members = Array.from({ length: memberCount }, (_, i) => ({
    role: "member" as const,
    submittedAt: i < submittedCount ? "x" : null,
    votedAt: i < votedCount ? "x" : null,
  }));
  const progress = phaseProgress(phase, members, placeholderCount);
  const todo = viewerTodo(phase, me, progress, {
    deadlinePassed: trip.pollDeadline !== null && trip.pollDeadline < today,
    collectDeadlinePassed: trip.deadline !== null && trip.deadline < today,
  });
  return {
    publicId: trip.publicId,
    name: trip.name,
    phase,
    organizer: me.role === "organizer",
    progress,
    todo,
    deadline: phase === "vote" ? trip.pollDeadline : trip.deadline,
    pollDeadline: trip.pollDeadline,
    fixedStart: trip.fixedStart,
    fixedEnd: trip.fixedEnd,
    daysToGo: trip.fixedStart ? daysUntil(trip.fixedStart, today) : null,
    href: tripPath(trip.publicId, defaultTab(phase, me)),
    updatedAt: trip.updatedAt.toISOString(),
    start: trip.fixedStart ?? trip.rangeStart,
    deletion: me.role === "organizer" ? deletionNotice(trip, item.lastActivity) : null,
  };
}

/**
 * Banner «Wird am … gelöscht» for the organiser from 14 days before the automatic deletion on
 * (F-013, Flow J) – same rule and date as the notice mail (src/server/retention.ts).
 */
function deletionNotice(
  trip: TripListItem["trip"],
  lastActivity: Date,
): TripListCardData["deletion"] {
  const due = tripDeletionDate({ phase: trip.phase, fixedEnd: trip.fixedEnd, lastActivity });
  const now = new Date();
  if (!inNoticeWindow(due.at, now)) return null;
  const at = effectiveDeletionDate(due.at, trip.deletionNoticeSentAt, TRIP_NOTICE_DAYS);
  return { date: isoDateInZone(at), reason: due.reason };
}

/**
 * «Meine Reisen» (F-044, W04, Flow E): to-dos first, then current trips by next event,
 * past trips folded away. Cards rise in a stagger on client navigation (W04-01), never for
 * server-painted HTML (R-017).
 */
export default async function TripsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/trips");
  const t = await getTranslations("trips");
  const today = todayIso();
  const [items, format] = await Promise.all([
    listTripsForUser(session.user.id),
    viewerFormat(session),
  ]);
  const cards = items.map((item) => toCard(item, today)).sort((a, b) => compareTrips(a, b, today));
  const todo = cards.filter((card) => card.todo && card.phase !== "past");
  const running = cards.filter((card) => !card.todo && card.phase !== "past");
  const past = cards.filter((card) => card.phase === "past");
  // W16 v2.18: with two or more trips running today the start does not guess – they stand on
  // top as big cards («Läuft gerade»). One running trip opens directly from `/` instead.
  const runningNow = runningTrips(
    items.map(({ trip }) => ({
      publicId: trip.publicId,
      name: trip.name,
      phase: trip.phase,
      fixedStart: trip.fixedStart,
      fixedEnd: trip.fixedEnd,
    })),
    today,
  );

  return (
    <PageShell width="wide">
      <div className={styles.page}>
        <div className={styles.head}>
          <h1>{t("title")}</h1>
          {cards.length > 0 ? (
            <ButtonLink href="/trips/new" variant="secondary" size="md" icon="plus">
              {t("newTrip")}
            </ButtonLink>
          ) : null}
        </div>
        {cards.length === 0 ? (
          <section className={styles.empty} aria-labelledby="trips-empty">
            <IllustrationMotion choreography="empty" sessionKey="trips-empty">
              <Illustration name="empty-trips" width={200} />
            </IllustrationMotion>
            <h2 id="trips-empty">{t("emptyTitle")}</h2>
            <p className={styles.muted}>{t("emptyText")}</p>
            <ButtonLink href="/trips/new" icon="plus">
              {t("newTrip")}
            </ButtonLink>
          </section>
        ) : (
          <StaggerEnter sessionKey="trips-list" className={styles.sections}>
            {runningNow.length > 1 ? (
              <section aria-labelledby="trips-now" className={styles.section}>
                <h2 id="trips-now">{t("runningNow")}</h2>
                <ul className={styles.list}>
                  {runningNow.map((trip) => (
                    <li key={trip.publicId}>
                      <Link
                        className={styles.nowCard}
                        href={tripPath(trip.publicId)}
                        data-running-now={trip.publicId}
                      >
                        <span className={styles.nowText}>
                          <span className={styles.nowName}>{trip.name}</span>
                          <span className={styles.nowDay}>
                            {t("runningDay", { day: trip.day, total: trip.total })}
                          </span>
                        </span>
                        <Icon name="arrow-right" size={24} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {todo.length > 0 ? (
              <section aria-labelledby="trips-todo" className={styles.section}>
                <h2 id="trips-todo">{t("todoTitle", { count: todo.length })}</h2>
                <ul className={styles.list}>
                  {todo.map((card) => (
                    <TripListCard
                      key={card.publicId}
                      trip={card}
                      intl={format.intl}
                      today={today}
                    />
                  ))}
                </ul>
              </section>
            ) : null}
            <section aria-labelledby="trips-running" className={styles.section}>
              <h2 id="trips-running">{t("runningTitle")}</h2>
              {running.length > 0 ? (
                <ul className={styles.list}>
                  {running.map((card) => (
                    <TripListCard
                      key={card.publicId}
                      trip={card}
                      intl={format.intl}
                      today={today}
                    />
                  ))}
                </ul>
              ) : todo.length === 0 ? (
                <p className={styles.muted}>{t("emptyRunning")}</p>
              ) : null}
            </section>
            {past.length > 0 ? (
              // Open when a past trip is about to be deleted – the banner must be seen (F-013).
              <details
                className={styles.past}
                open={past.some((card) => card.deletion) || undefined}
              >
                <summary className={styles.pastSummary}>
                  <span className={styles.pastTitle}>{t("pastTitle", { count: past.length })}</span>
                  <Icon name="chevron-down" size={20} className={styles.chevron} />
                </summary>
                <ul className={styles.list}>
                  {past.map((card) => (
                    <TripListCard
                      key={card.publicId}
                      trip={card}
                      intl={format.intl}
                      today={today}
                    />
                  ))}
                </ul>
              </details>
            ) : null}
          </StaggerEnter>
        )}
      </div>
    </PageShell>
  );
}
