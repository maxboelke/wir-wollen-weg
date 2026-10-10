import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { formatDate, formatDateRange, type IsoDate } from "@/lib/dates";
import type { Progress, TripTodo, UiPhase } from "@/lib/trip-status";
import { tripPath } from "../paths";
import { OrgaChip } from "./orga-chip";
import { PhaseChip } from "./phase-chip";
import styles from "./trip-list-card.module.css";

export interface TripListCardData {
  publicId: string;
  name: string;
  phase: UiPhase;
  organizer: boolean;
  progress: Progress | null;
  todo: TripTodo | null;
  deadline: IsoDate | null;
  /** Voting deadline (F-017) – shown in phase 2. */
  pollDeadline: IsoDate | null;
  fixedStart: IsoDate | null;
  fixedEnd: IsoDate | null;
  daysToGo: number | null;
  href: string;
}

const TODO_TARGET: Record<TripTodo, "days" | "poll" | "pollNew"> = {
  addDates: "days",
  vote: "poll",
  startVote: "pollNew",
  fixDates: "poll",
};

/**
 * Trip card in «Meine Reisen» (F-044, W04, design-system §9.6): to-do line, name as the
 * card's single link (stretched), phase chip with text, «Orga» chip, progress bar + text;
 * the to-do action is a second, separate focus target (ux-spec §4.8).
 */
export async function TripListCard({
  trip,
  intl,
  today,
}: {
  trip: TripListCardData;
  intl: string;
  today: IsoDate;
}) {
  const t = await getTranslations("trips");
  const phaseLabel =
    trip.phase === "fixed" && trip.fixedStart && trip.fixedEnd
      ? t("phase.fixed", {
          range: formatDateRange(trip.fixedStart, trip.fixedEnd, intl, { today }),
        })
      : t(`phase.${trip.phase}`);
  return (
    <Card as="li" interactive className={styles.card} data-stagger>
      {trip.todo ? (
        <p className={styles.todo}>
          <span>{t(`todo.${trip.todo}`)}</span>
          <Icon name="arrow-right" size={16} />
        </p>
      ) : null}
      <h3 className={styles.name}>
        <Link className={styles.link} href={trip.href}>
          {trip.name}
        </Link>
      </h3>
      <div className={styles.chips}>
        <PhaseChip phase={trip.phase} label={phaseLabel} />
        {trip.organizer ? <OrgaChip label={t("organizer")} /> : null}
      </div>
      {trip.progress ? (
        <div className={styles.progress}>
          <span className={styles.bar} aria-hidden="true">
            <span
              className={styles.fill}
              style={{
                transform: `scaleX(${String(trip.progress.total ? trip.progress.done / trip.progress.total : 0)})`,
              }}
            />
          </span>
          <span className={styles.meta}>
            {t(trip.phase === "vote" ? "progressVoted" : "progressSubmitted", {
              done: trip.progress.done,
              total: trip.progress.total,
            })}
          </span>
        </div>
      ) : null}
      {trip.phase === "fixed" && trip.daysToGo !== null ? (
        <p className={styles.meta}>
          {trip.daysToGo > 0
            ? t("daysToGo", { count: trip.daysToGo })
            : trip.daysToGo === 0
              ? t("startsToday")
              : t("underway")}
        </p>
      ) : null}
      {trip.deadline && trip.deadline >= today && trip.phase === "collect" ? (
        <p className={styles.meta}>
          <Icon name="clock" size={16} />
          <span>
            {t("deadline", {
              date: formatDate(trip.deadline, intl, { weekday: true, year: false }),
            })}
          </span>
        </p>
      ) : null}
      {trip.pollDeadline && trip.pollDeadline >= today && trip.phase === "vote" ? (
        <p className={styles.meta}>
          <Icon name="clock" size={16} />
          <span>
            {t("voteDeadline", {
              date: formatDate(trip.pollDeadline, intl, { weekday: true, year: false }),
            })}
          </span>
        </p>
      ) : null}
      {trip.todo ? (
        <div className={styles.action}>
          <ButtonLink
            href={tripPath(trip.publicId, TODO_TARGET[trip.todo])}
            variant="secondary"
            size="sm"
          >
            {t(`action.${trip.todo}`)}
          </ButtonLink>
        </div>
      ) : null}
    </Card>
  );
}
