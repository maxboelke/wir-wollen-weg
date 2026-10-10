import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SealMotion } from "@/components/seal-motion";
import { Illustration } from "@/components/illustrations/illustration";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { KpiBox } from "@/components/ui/cockpit";
import { Icon } from "@/components/ui/icon";
import { MemberList } from "@/features/trips/components/member-list";
import { RingDraw } from "@/features/trips/components/ring-draw";
import { TripShell } from "@/features/trips/components/trip-shell";
import { WelcomeHint } from "@/features/trips/components/welcome-hint";
import { nameList, nightsText, rangeText } from "@/features/trips/format";
import { loadTripView, type TripView } from "@/features/trips/load";
import { tripPath } from "@/features/trips/paths";
import { sheetContext } from "@/features/trips/sheet-context";
import { formatDate } from "@/lib/dates";
import { daysUntil, viewerTodo } from "@/lib/trip-status";
import styles from "./overview.module.css";

type Params = PageProps<"/trips/[id]">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([getTranslations("trip"), loadTripView(id, `/trips/${id}`)]);
  return { title: `${t("tabs.overview")} · ${view.trip.name}` };
}

/** KPI of the overview (ux-spec §4.10): phase 1 submissions, phase 2 votes, phase 3 countdown. */
async function OverviewKpi({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const { phase, progress, members, trip, today, format } = view;
  if ((phase === "collect" || phase === "vote") && progress) {
    const open = members
      .filter((m) => !(phase === "vote" ? m.votedAt : m.submittedAt))
      .map((m) => m.displayName);
    return (
      <RingDraw sessionKey={`kpi:${trip.publicId}:${phase}`}>
        <KpiBox
          value={progress.done}
          max={progress.total}
          title={t(phase === "vote" ? "kpiVoted" : "kpiSubmitted", {
            done: progress.done,
            total: progress.total,
          })}
          text={
            open.length === 0
              ? t("kpiAllDone")
              : t("kpiOpen", {
                  names: nameList(open, format.locale, (count) => t("kpiMore", { count })),
                })
          }
        />
      </RingDraw>
    );
  }
  if (phase === "fixed" && trip.fixedStart) {
    const days = daysUntil(trip.fixedStart, today);
    return (
      <KpiBox
        value={1}
        max={1}
        title={
          days > 0
            ? t("kpiFixed", { count: days })
            : rangeText(trip.fixedStart, trip.fixedEnd ?? trip.fixedStart, format.intl, today)
        }
      />
    );
  }
  return null;
}

const STEPS = ["collect", "vote", "fixed"] as const;

/**
 * W07 «Übersicht» (F-007, F-004): trip facts, phase steps, «Nächster Schritt», member list
 * with status (phase 1 without availability yet: everyone «noch offen»), invite card.
 */
export default async function TripOverviewPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const view = await loadTripView(id, `/trips/${id}`);
  const t = await getTranslations("trip");
  const { trip, me, members, phase, progress, format, today, isOrganizer } = view;
  const todo = viewerTodo(phase, me, progress);
  const open = members
    .filter((m) => !m.submittedAt && m.userId !== me.userId)
    .map((m) => m.displayName);
  const nights = nightsText(trip.minNights, trip.preferredNights, {
    nights: (count) => t("nightsFact", { count }),
    range: (min, max) => t("nightsRangeFact", { min, max }),
  });
  const currentStep = phase === "past" ? "fixed" : phase;
  const canInvite = trip.joinOpen && !view.full;

  return (
    <TripShell view={view} tab="overview" kpi={<OverviewKpi view={view} />}>
      <div className={styles.grid}>
        <div className={styles.main}>
          {query.welcome === "1" ? (
            <WelcomeHint
              title={t("welcomeTitle")}
              text={t("welcomeText")}
              closeLabel={t("welcomeClose")}
              seal={
                <SealMotion size="md">
                  <Illustration name="seal" width={40} />
                </SealMotion>
              }
            />
          ) : null}
          <div className={styles.intro}>
            <h1 className={styles.name}>{trip.name}</h1>
            <p className={styles.facts}>
              <span className={styles.fact}>
                <Icon name="calendar" size={18} />
                <span suppressHydrationWarning>
                  {rangeText(trip.rangeStart, trip.rangeEnd, format.intl, today)}
                </span>
              </span>
              <span className={styles.fact}>
                <Icon name="nights" size={18} />
                <span>{nights}</span>
              </span>
              {trip.deadline && phase === "collect" ? (
                <span className={styles.fact}>
                  <Icon name="clock" size={18} />
                  <span>
                    {t("deadlineFact", {
                      date: formatDate(trip.deadline, format.intl, { weekday: true, year: false }),
                    })}
                  </span>
                </span>
              ) : null}
            </p>
            {trip.description ? <p className={styles.description}>{trip.description}</p> : null}
          </div>

          <ol className={styles.steps} aria-label={t("stepsLabel")}>
            {STEPS.map((step, index) => {
              const state =
                STEPS.indexOf(currentStep) > index
                  ? "done"
                  : step === currentStep
                    ? "current"
                    : "next";
              return (
                <li
                  key={step}
                  className={styles.step}
                  data-state={state}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <span className={styles.stepBar} aria-hidden="true" />
                  <span className={styles.stepLabel}>
                    {state === "done" ? (
                      <Icon name="check" size={14} />
                    ) : (
                      <span aria-hidden="true">{String(index + 1)}</span>
                    )}
                    {t(`steps.${step}`)}
                  </span>
                </li>
              );
            })}
          </ol>

          <Card as="section" aria-labelledby="next-step" className={styles.next}>
            <h2 id="next-step" className={styles.nextTitle}>
              {t("nextTitle")}
            </h2>
            <NextStep view={view} todo={todo} open={open} />
          </Card>
        </div>

        <div className={styles.side}>
          <Card as="div" className={styles.members}>
            <MemberList
              phase={phase}
              members={members.map((m) => {
                const changed = m.availabilityUpdatedAt ?? m.submittedAt;
                return {
                  userId: m.userId,
                  displayName: m.displayName,
                  role: m.role,
                  joinedAt: m.joinedAt.toISOString(),
                  submitted: m.submittedAt !== null,
                  voted: m.votedAt !== null,
                  // F-007: «abgegeben» with the date of the last change (viewer's format).
                  changedOn: changed
                    ? formatDate(changed.toISOString().slice(0, 10), format.intl, {
                        weekday: false,
                        year: false,
                      })
                    : undefined,
                  comment: m.submittedAt ? m.comment : null,
                };
              })}
              placeholders={view.placeholders.map((p) => ({
                id: p.id,
                displayName: p.displayName,
              }))}
              manageHref={
                isOrganizer ? `${tripPath(trip.publicId, "invite")}#placeholders` : undefined
              }
              context={sheetContext(view)}
            />
            <div className={styles.invite}>
              {isOrganizer || canInvite ? (
                <ButtonLink
                  href={tripPath(trip.publicId, "invite")}
                  variant="secondary"
                  size="md"
                  icon="plus"
                  block
                >
                  {t("invite")}
                </ButtonLink>
              ) : (
                <p className={styles.muted}>
                  <Icon name="lock" size={16} />
                  <span>
                    {view.full ? t("inviteFull", { count: members.length }) : t("inviteClosed")}
                  </span>
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </TripShell>
  );
}

async function NextStep({
  view,
  todo,
  open,
}: {
  view: TripView;
  todo: ReturnType<typeof viewerTodo>;
  open: string[];
}) {
  const t = await getTranslations("trip");
  const { trip, phase, progress, format, today } = view;
  const link = (href: string, label: string, variant: "primary" | "secondary" = "primary") => (
    <ButtonLink href={href} variant={variant} size="md">
      {label}
    </ButtonLink>
  );
  if (todo === "addDates") {
    return (
      <>
        <p>{t("next.addDates")}</p>
        {link(tripPath(trip.publicId, "days"), t("nextAction.addDates"))}
      </>
    );
  }
  if (todo === "startVote") {
    return (
      <>
        <p>{t("next.startVote")}</p>
        {link(tripPath(trip.publicId, "poll"), t("nextAction.startVote"))}
      </>
    );
  }
  if (todo === "vote") {
    return (
      <>
        <p>{t("next.vote")}</p>
        {link(tripPath(trip.publicId, "poll"), t("nextAction.vote"))}
      </>
    );
  }
  if (phase === "collect") {
    return (
      <>
        <p>
          {open.length > 0
            ? t("next.waiting", {
                names: nameList(open, format.locale, (count) => t("kpiMore", { count })),
              })
            : t("next.waitingAll")}
        </p>
        {link(tripPath(trip.publicId, "group"), t("nextAction.suggestions"), "secondary")}
      </>
    );
  }
  if (phase === "vote" && progress) {
    return <p>{t("next.voteDone", { done: progress.done, total: progress.total })}</p>;
  }
  if (phase === "fixed" && trip.fixedStart) {
    return (
      <p>
        {t("next.fixed", {
          range: rangeText(trip.fixedStart, trip.fixedEnd ?? trip.fixedStart, format.intl, today),
        })}
      </p>
    );
  }
  return (
    <>
      <p>{t("next.past")}</p>
      {link("/trips/new", t("nextAction.newTrip"), "secondary")}
    </>
  );
}
