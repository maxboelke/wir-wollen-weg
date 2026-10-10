"use client";

import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Icon, type IconName } from "@/components/ui/icon";
import { daySummary, type DayTally } from "@/lib/heatmap";
import styles from "./group.module.css";

export interface DetailPerson {
  key: string;
  name: string;
  me?: boolean | undefined;
  comment?: string | null | undefined;
  placeholder?: boolean | undefined;
}

interface DayDetailProps {
  /** Spoken with the counts when paging days (the sheet title changes silently). */
  dateLabel: string;
  tally: DayTally;
  people: ReadonlyMap<string, DetailPerson>;
  pending: DetailPerson[];
  hidden: DetailPerson[];
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Day detail (Flow C.3, W09, design-system §9.16): ‹ › day by day, count line «5 von 5: Geht»,
 * summary (U-4), then who works / only if needed / can't / is still open (dashed avatars, U-13).
 * Comments are shown as text – the only reasons we show (F-008).
 */
export function DayDetail(props: DayDetailProps) {
  const t = useTranslations("group.detail");
  const { tally } = props;
  const summary = daySummary(tally);
  const names = (ids: string[]) => ids.map((id) => props.people.get(id)?.name ?? "").join(", ");

  const groups: { key: string; icon: IconName | null; title: string; list: DetailPerson[] }[] = [
    {
      key: "yes",
      icon: "check",
      title: t("yes", { count: tally.yes.length }),
      list: tally.yes.flatMap((id) => props.people.get(id) ?? []),
    },
    {
      key: "maybe",
      icon: "maybe",
      title: t("maybeGroup", { count: tally.maybe.length }),
      list: tally.maybe.flatMap((id) => props.people.get(id) ?? []),
    },
    {
      key: "no",
      icon: "cross",
      title: t("noGroup", { count: tally.no.length }),
      list: tally.no.flatMap((id) => props.people.get(id) ?? []),
    },
  ];

  return (
    <div className={styles.detail}>
      <div className={styles.detailNav}>
        <button
          type="button"
          className={styles.squareButton}
          aria-label={t("prev")}
          aria-disabled={!props.canPrev || undefined}
          onClick={() => {
            if (props.canPrev) props.onPrev();
          }}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <div className={styles.detailHead} aria-live="polite" aria-atomic="true">
          <span className="visually-hidden">{props.dateLabel}</span>
          {tally.n === 0 ? (
            <p className={styles.detailCount}>{t("nodata")}</p>
          ) : (
            <>
              <p className={styles.detailCount}>{t("count", { x: tally.x, n: tally.n })}</p>
              <p className={styles.detailSummary} data-kind={summary.kind}>
                {summary.kind === "all" ? (
                  <>
                    <Icon name="check" size={16} />
                    {t("all")}
                  </>
                ) : summary.kind === "maybe" ? (
                  <>
                    <Icon name="maybe" size={16} />
                    {t("maybe", { count: summary.count })}
                  </>
                ) : summary.kind === "no" ? (
                  <>
                    <Icon name="cross" size={16} />
                    {summary.ids.length <= 3
                      ? t("no", { names: names(summary.ids) })
                      : t("noCount", { count: summary.ids.length })}
                  </>
                ) : null}
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          className={styles.squareButton}
          aria-label={t("next")}
          aria-disabled={!props.canNext || undefined}
          onClick={() => {
            if (props.canNext) props.onNext();
          }}
        >
          <Icon name="chevron-right" size={20} />
        </button>
      </div>

      {tally.n > 0
        ? groups.map((group) => (
            <section key={group.key} className={styles.detailGroup} data-group={group.key}>
              <h3 className={styles.detailGroupTitle}>
                {group.icon ? (
                  <span className={styles.detailTile} data-group={group.key} aria-hidden="true">
                    <Icon name={group.icon} size={18} />
                  </span>
                ) : null}
                {group.title}
              </h3>
              {group.list.length === 0 ? (
                <p className={styles.detailNobody}>{t("nobody")}</p>
              ) : (
                <PersonList
                  list={group.list}
                  youLabel={t("you")}
                  commentOf={(name) => t("comment", { name })}
                />
              )}
            </section>
          ))
        : null}
      {props.pending.length > 0 ? (
        <section className={styles.detailGroup} data-group="open">
          <h3 className={styles.detailGroupTitle}>
            <span className={styles.detailTile} data-group="open" aria-hidden="true">
              <Icon name="clock" size={18} />
            </span>
            {t("open", { count: props.pending.length })}
          </h3>
          <PersonList
            list={props.pending}
            open
            youLabel={t("you")}
            placeholderLabel={t("placeholder")}
            commentOf={(name) => t("comment", { name })}
          />
        </section>
      ) : null}
      {props.hidden.length > 0 ? (
        <section className={styles.detailGroup} data-group="hidden">
          <h3 className={styles.detailGroupTitle}>
            <span className={styles.detailTile} data-group="open" aria-hidden="true">
              <Icon name="eye-off" size={18} />
            </span>
            {t("hidden", { count: props.hidden.length })}
          </h3>
          <PersonList
            list={props.hidden}
            open
            youLabel={t("you")}
            commentOf={(name) => t("comment", { name })}
          />
        </section>
      ) : null}
    </div>
  );
}

function PersonList({
  list,
  open = false,
  youLabel,
  placeholderLabel,
  commentOf,
}: {
  list: DetailPerson[];
  open?: boolean;
  youLabel: string;
  placeholderLabel?: string;
  commentOf: (name: string) => string;
}) {
  return (
    <ul className={styles.people}>
      {list.map((person) => (
        <li key={person.key} className={styles.person}>
          <Avatar id={person.key} name={person.name} size="sm" open={open} />
          <span className={styles.personText}>
            <span className={open ? styles.personOpen : undefined}>
              {person.name}
              {person.me ? ` (${youLabel})` : ""}
              {person.placeholder && placeholderLabel ? ` · ${placeholderLabel}` : ""}
            </span>
            {person.comment ? (
              <span className={styles.personComment}>
                <Icon name="comment" size={14} label={commentOf(person.name)} />
                <q>{person.comment}</q>
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
