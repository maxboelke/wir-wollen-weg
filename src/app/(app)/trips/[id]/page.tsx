import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { SealMotion } from "@/components/seal-motion";
import { Illustration } from "@/components/illustrations/illustration";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { KpiBox } from "@/components/ui/cockpit";
import { Icon } from "@/components/ui/icon";
import { CancelNotice } from "@/features/poll/components/cancel-notice";
import { FocusHeading } from "@/features/trips/components/focus-heading";
import { HubTile, HubTiles } from "@/features/trips/components/hub-tile";
import { MemberList } from "@/features/trips/components/member-list";
import { RemindButton, RemindKpiButton } from "@/features/trips/components/remind-sheet";
import { RingDraw } from "@/features/trips/components/ring-draw";
import { TripShell } from "@/features/trips/components/trip-shell";
import { WelcomeHint } from "@/features/trips/components/welcome-hint";
import { nameList, nightsText, rangeText } from "@/features/trips/format";
import { loadTripView, openNames, type TripView } from "@/features/trips/load";
import { tripModules } from "@/features/trips/modules";
import { tripPath } from "@/features/trips/paths";
import { orgaName, remindPhase, tripNextStep, tripRemindGroups } from "@/features/trips/remind";
import { sheetContext } from "@/features/trips/sheet-context";
import { CountdownRing } from "@/features/poll/components/countdown-ring";
import { ResultCard } from "@/features/poll/components/result-card";
import { resultShareTexts, tripLink } from "@/features/trips/share-texts";
import { formatDate, formatDateRange, fromUtcDate } from "@/lib/dates";
import { googleCalendarUrl } from "@/lib/ics";
import { countdown, nightsOf, reopenNoticeDue, ringPercent, type Countdown } from "@/lib/poll";
import { remindTarget } from "@/lib/remind";
import type { NextAction, NextStep, NextStepId } from "@/lib/trip-status";
import styles from "./overview.module.css";

type Params = PageProps<"/trips/[id]">;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [t, view] = await Promise.all([getTranslations("trip"), loadTripView(id, `/trips/${id}`)]);
  return { title: `${t("tabs.overview")} · ${view.trip.name}` };
}

/** Day the dates were fixed – start of the «Vorfreude» ring (older rows: last change). */
function fixedOn(view: TripView): string {
  return fromUtcDate(view.trip.fixedAt ?? view.trip.updatedAt);
}

/** «noch 23 Tage» · «noch 1 Tag» · «Heute geht's los!» · «Gute Reise!» (W11, D-24). */
async function countdownText(value: Countdown): Promise<string> {
  const t = await getTranslations("poll.result");
  switch (value.kind) {
    case "days":
      return t("days", { count: value.count });
    case "today":
      return t("today");
    case "during":
      return t("during");
    case "past":
      return t("past");
  }
}

/**
 * KPI of the overview (ux-spec §4.10, §14.2): phase 1 «x von n haben eingetragen», phase 2
 * votes (+ deadline). While somebody is open the whole box is a button → «Wer hat
 * eingetragen?». Phase 3: the «Vorfreude» ring with the countdown (W11; never counts up, G-16).
 */
async function OverviewKpi({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const tResult = await getTranslations("poll.result");
  const { phase, progress, trip, today, format } = view;
  if ((phase === "collect" || phase === "vote") && progress) {
    const open = openNames(view);
    const allDone = open.length === 0;
    const names = nameList(open, format.locale, (count) => t("kpiMore", { count }));
    const status = allDone
      ? t(phase === "vote" ? "kpiAllVoted" : "kpiAllDone")
      : t("kpiOpen", { names });
    const deadline =
      phase === "vote" && trip.pollDeadline
        ? t("kpiVoteDeadline", {
            date: formatDate(trip.pollDeadline, format.intl, { weekday: true, year: false }),
          })
        : null;
    const title = t(phase === "vote" ? "kpiVoted" : "kpiSubmitted", {
      done: progress.done,
      total: progress.total,
    });
    const box = (
      <KpiBox
        value={progress.done}
        max={progress.total}
        title={title}
        chevron={!allDone}
        text={
          deadline ? (
            <>
              {status}
              <br />
              {deadline}
            </>
          ) : (
            status
          )
        }
      />
    );
    return (
      <RingDraw sessionKey={`kpi:${trip.publicId}:${phase}`}>
        {allDone ? (
          box
        ) : (
          <RemindKpiButton
            label={`${title}. ${status}${deadline ? `. ${deadline}` : ""}. ${t("kpiListOpen")}`}
          >
            {box}
          </RemindKpiButton>
        )}
      </RingDraw>
    );
  }
  if (phase === "fixed" && trip.fixedStart && trip.fixedEnd) {
    const period = { start: trip.fixedStart, end: trip.fixedEnd };
    const value = countdown(period, today);
    return (
      <CountdownRing
        percent={ringPercent(fixedOn(view), trip.fixedStart, today)}
        celebrate={view.celebrate}
        label={
          value.kind === "days"
            ? tResult.rich("ringLabel", {
                count: value.count,
                n: (chunks) => <b>{chunks}</b>,
              })
            : await countdownText(value)
        }
      />
    );
  }
  return null;
}

/** W11 result card (phase 3) with calendar links and the share text «Fix! …». */
async function Result({
  view,
  focusHeading,
  footer,
}: {
  view: TripView;
  focusHeading: boolean;
  footer: ReactNode;
}) {
  const t = await getTranslations("trip");
  const tResult = await getTranslations("poll.result");
  const { trip, format, today, members } = view;
  if (!trip.fixedStart || !trip.fixedEnd) return null;
  const period = { start: trip.fixedStart, end: trip.fixedEnd };
  const nights = nightsOf(period);
  const link = tripLink(tripPath(trip.publicId));
  const [texts, value] = await Promise.all([
    resultShareTexts({
      tripName: trip.name,
      link,
      start: period.start,
      end: period.end,
      nights,
      senderCountry: format.country,
    }),
    countdownText(countdown(period, today)),
  ]);
  return (
    <ResultCard
      publicId={trip.publicId}
      tripName={trip.name}
      dateText={formatDateRange(period.start, period.end, format.intl, { weekday: true, today })}
      nightsText={t("nightsFact", { count: nights })}
      goingText={tResult("going", { count: members.length })}
      countdownText={value}
      isOrganizer={view.isOrganizer}
      celebrate={view.celebrate}
      focusHeading={focusHeading && view.isOrganizer}
      percent={ringPercent(fixedOn(view), period.start, today)}
      icsHref={`${tripPath(trip.publicId)}/event.ics`}
      googleHref={googleCalendarUrl({
        title: trip.name,
        start: period.start,
        end: period.end,
        url: link,
        description: tResult("calendarDescription"),
      })}
      shareLink={link}
      shareTexts={texts}
      defaultLocale={format.locale}
      footer={footer}
    />
  );
}

const STEPS = ["collect", "vote", "fixed"] as const;

async function PhaseSteps({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const currentStep = view.phase === "past" ? "fixed" : view.phase;
  return (
    <ol className={styles.steps} aria-label={t("stepsLabel")}>
      {STEPS.map((step, index) => {
        const state =
          STEPS.indexOf(currentStep) > index ? "done" : step === currentStep ? "current" : "next";
        return (
          <li
            key={step}
            className={styles.step}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span
              className={styles.stepBar}
              aria-hidden="true"
              data-step-bar={state === "current" ? "current" : undefined}
            />
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
  );
}

/**
 * Phase-3 hub (ux-spec §14.4): docking slot «Als Nächstes» (no modules in the MVP → nothing
 * rendered) and «So habt ihr entschieden» with the read-only sub-pages.
 */
async function Hub({ view }: { view: TripView }) {
  const t = await getTranslations("trip");
  const { trip, members, format, today } = view;
  const modules = tripModules();
  const nights = nightsText(trip.minNights, trip.preferredNights, {
    nights: (count) => t("nightsFact", { count }),
    range: (min, max) => t("nightsRangeFact", { min, max }),
  });
  return (
    <>
      {modules.length > 0 ? (
        <section className={styles.hub} aria-labelledby="hub-next">
          <h2 id="hub-next" className={styles.hubTitle}>
            {t("hub.upNext")}
          </h2>
          <HubTiles>
            {modules.map((module) => (
              <HubTile
                key={module.id}
                href={module.href}
                icon={module.icon}
                tone={module.tone}
                title={module.title}
                meta={module.status}
                todo={module.todo}
              />
            ))}
          </HubTiles>
        </section>
      ) : null}
      <section className={styles.hub} aria-labelledby="hub-decided">
        <h2 id="hub-decided" className={styles.hubTitle}>
          {t("hub.decidedTitle")}
        </h2>
        <HubTiles>
          <HubTile
            href={tripPath(trip.publicId, "poll")}
            icon="vote"
            tone="lavender"
            title={t("hub.pollTitle")}
            meta={t("hub.pollMeta", {
              voted: members.filter((m) => m.votedAt).length,
              total: members.length,
            })}
          />
          <HubTile
            href={`${tripPath(trip.publicId, "group")}?view=calendar`}
            icon="calendar"
            tone="mint"
            title={t("hub.groupTitle")}
            meta={t("hub.groupMeta")}
          />
        </HubTiles>
        <p className={styles.searched} suppressHydrationWarning>
          {t("hub.searched", {
            range: rangeText(trip.rangeStart, trip.rangeEnd, format.intl, today),
            nights,
          })}
        </p>
      </section>
    </>
  );
}

/**
 * W07 «Übersicht» (F-007, F-004, ux-spec §14): phase 1/2 – facts, phase steps, «Nächster
 * Schritt», people grouped by status with [Erinnern]. Phase 3 (no tabs) – the trip hub:
 * result card, description, «So habt ihr entschieden», «Wer ist dabei?».
 */
export default async function TripOverviewPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const view = await loadTripView(id, `/trips/${id}`);
  const t = await getTranslations("trip");
  const { trip, me, members, phase, format, today, isOrganizer } = view;
  // Stored phase «fixed» = hub without tabs, also once the trip is over (§14.4).
  const settled = trip.phase === "fixed";
  const fixed = phase === "fixed";
  const nights = nightsText(trip.minNights, trip.preferredNights, {
    nights: (count) => t("nightsFact", { count }),
    range: (min, max) => t("nightsRangeFact", { min, max }),
  });
  const canInvite = trip.joinOpen && !view.full;
  const step = tripNextStep(view);
  const rphase = remindPhase(view);

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
          {reopenNoticeDue(trip, me) ? (
            <CancelNotice
              publicId={trip.publicId}
              kind="reopen"
              text={t("reopenedNotice", { orga: orgaName(view) })}
            />
          ) : null}
          {fixed ? (
            <Result
              view={view}
              focusHeading={query.fixed === "1"}
              footer={<PhaseSteps view={view} />}
            />
          ) : null}
          {fixed ? (
            trip.description ? (
              <p className={styles.quote}>{trip.description}</p>
            ) : null
          ) : (
            <div className={styles.intro}>
              {settled ? (
                <h1 className={styles.name}>{trip.name}</h1>
              ) : (
                <FocusHeading focus={query.unfixed === "1"} param="unfixed" className={styles.name}>
                  {trip.name}
                </FocusHeading>
              )}
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
                        date: formatDate(trip.deadline, format.intl, {
                          weekday: true,
                          year: false,
                        }),
                      })}
                    </span>
                  </span>
                ) : null}
              </p>
              {trip.description ? <p className={styles.description}>{trip.description}</p> : null}
            </div>
          )}

          {fixed ? null : <PhaseSteps view={view} />}

          {step ? (
            <Card as="section" aria-labelledby="next-step" className={styles.next}>
              <h2 id="next-step" className={styles.nextTitle}>
                {t("nextTitle")}
              </h2>
              <NextStepCard
                view={view}
                step={step}
                remind={rphase ? remindTarget(tripRemindGroups(view, rphase), isOrganizer) : null}
              />
            </Card>
          ) : null}

          {settled ? <Hub view={view} /> : null}
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
                  // F-007: «eingetragen» with the date of the last change (viewer's format).
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
              ownHref={tripPath(trip.publicId, phase === "vote" ? "poll" : "days")}
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

/** Message key of a matrix row – «mit Frist» rows have their own text (§14.1). */
function nextKey(step: NextStep) {
  const keys = {
    "N1-1": "n1_1",
    "N1-2": "n1_2",
    "N1-3": "n1_3",
    "N1-4": "n1_4",
    "N1-5": "n1_5",
    "N1-6": "n1_6",
    "N1-7": "n1_7",
    "N1-8": "n1_8",
    "N1-9": "n1_9",
    "N1-10": "n1_10",
    "N1-11": "n1_11",
    "N1-12": "n1_12",
    "N2-1": "n2_1",
    "N2-2": "n2_2",
    "N2-3": "n2_3",
    "N2-4": "n2_4",
    "N2-5": "n2_5",
    "N2-6": "n2_6",
    "N2-7": "n2_7",
    "N2-8": "n2_8",
    "N2-9": "n2_9",
    "N2-10": "n2_10",
    "N2-11": "n2_11",
    "N2-12": "n2_12",
    past: "past",
    pastOpen: "pastOpen",
  } as const satisfies Record<NextStepId, string>;
  if (step.params.deadline && step.id === "N2-5") return "n2_5Deadline" as const;
  if (step.params.deadline && step.id === "N2-12") return "n2_12Deadline" as const;
  return keys[step.id];
}

/**
 * «Nächster Schritt» (ux-spec §14.1): Wo stehen wir? → Wer ist dran? → Was kann ich tun?
 * At most one primary action; order primary → secondary → text button.
 */
async function NextStepCard({
  view,
  step,
  remind,
}: {
  view: TripView;
  step: NextStep;
  remind: ReturnType<typeof remindTarget> | null;
}) {
  const t = await getTranslations("trip");
  const { trip, format, members } = view;
  const orga = orgaName(view);
  const orgaId = members.find((m) => m.role === "organizer")?.userId;
  const text = t(`next.${nextKey(step)}`, {
    orga,
    count: step.params.count ?? 0,
    names: nameList(step.params.names ?? [], format.locale, (count) => t("kpiMore", { count })),
    date: step.params.deadline
      ? formatDate(step.params.deadline, format.intl, { weekday: true, year: false })
      : "",
  });
  const id = trip.publicId;
  const link = (action: NextAction, href: string, label: string) => (
    <ButtonLink key={action.kind} href={href} variant={action.variant} size="md">
      {label}
    </ButtonLink>
  );
  const button = (action: NextAction) => {
    switch (action.kind) {
      case "addDates":
        return link(action, tripPath(id, "days"), t("nextAction.addDates"));
      case "startVote":
        return link(action, tripPath(id, "pollNew"), t("nextAction.startVote"));
      case "suggestions":
        return link(action, tripPath(id, "group"), t("nextAction.suggestions"));
      case "vote":
        return link(action, tripPath(id, "poll"), t("nextAction.vote"));
      case "fixDates":
        return link(action, `${tripPath(id, "poll")}?fix=1`, t("nextAction.fixDates"));
      case "poll":
        return link(action, tripPath(id, "poll"), t("nextAction.poll"));
      case "results":
        return link(action, tripPath(id, "poll"), t("nextAction.results"));
      case "newTrip":
        return link(action, "/trips/new", t("nextAction.newTrip"));
      case "editTrip":
        return link(action, tripPath(id, "settings"), t("nextAction.editTrip"));
      case "remind":
        return remind ? (
          <RemindButton key={action.kind} target={remind} variant={action.variant} icon="remind">
            {t("nextAction.remind")}
          </RemindButton>
        ) : null;
      case "remindOrga":
        return orgaId ? (
          <RemindButton
            key={action.kind}
            target={{ step: "single", key: orgaId }}
            variant={action.variant}
            icon="remind"
          >
            {t("nextAction.remindOrga", { orga })}
          </RemindButton>
        ) : null;
      case "nudgeOrga":
        return (
          <RemindButton key={action.kind} target={{ step: "orga" }} variant="text">
            {t("nextAction.nudgeOrga", { orga })}
          </RemindButton>
        );
    }
  };
  return (
    <>
      <p data-next-step={step.id}>{text}</p>
      <div className={styles.nextActions}>{step.actions.map(button)}</div>
    </>
  );
}
