"use client";

import { useTranslations } from "next-intl";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./group.module.css";

export interface SuggestionCardModel {
  index: number;
  rank: number;
  range: string;
  nights: number;
  vacationDays: number;
  maybeDays: number;
  /** «4 können» – only for «Fast alle dabei». */
  can: number | null;
  missing: string[];
  holidays: string[];
  hidden: string[];
  /** «2027-05-05~2027-05-12» – the span handed to «Abstimmung erstellen» (W10 A). */
  pickKey: string;
}

interface SuggestionCardProps {
  card: SuggestionCardModel;
  selected: boolean;
  onShow: (index: number) => void;
  /** Organiser in phase 1: checkbox «Zur Abstimmung» (W09, design-system §9.10). */
  pick?: { checked: boolean; disabled: boolean; onChange: (on: boolean) => void } | undefined;
}

/**
 * Suggestion card (Flow C.2, design-system §9.10): range, «bis zu 5 Nächte · ca. 3
 * Urlaubstage ⓘ», chips «◐ 2× zur Not» · «✕ ohne Jonas» · «inkl. Pfingstmontag», action «Im
 * Kalender zeigen». Selected = 2 px frame (never hover only). Focusable (tabIndex −1) so the
 * suggestion bar can move the focus here («in der Liste zeigen»).
 */
export function SuggestionCard({ card, selected, onShow, pick }: SuggestionCardProps) {
  const t = useTranslations("group.card");
  const tGroup = useTranslations("group");
  const titleId = `suggestion-${String(card.index)}-title`;
  return (
    <li>
      <article
        id={`suggestion-${String(card.index)}`}
        className={cx(styles.card, (selected || pick?.checked) && styles.cardSelected)}
        aria-labelledby={titleId}
        tabIndex={-1}
        data-card=""
      >
        <p className={styles.cardRank}>
          <span className={styles.rankPill} aria-hidden="true">
            {card.rank}
          </span>
          <span className="visually-hidden">{t("rank", { rank: card.rank })}</span>
        </p>
        <h3 id={titleId} className={styles.cardTitle}>
          {card.range}
        </h3>
        <p className={styles.cardMeta}>
          {card.can !== null ? (
            <>
              <span>{t("can", { count: card.can })}</span>
              <span aria-hidden="true">{" · "}</span>
            </>
          ) : null}
          <span className={styles.metaItem}>
            <Icon name="nights" size={16} />
            {t("nights", { count: card.nights })}
          </span>
          <span aria-hidden="true">{" · "}</span>
          <span className={styles.metaItem}>
            <Icon name="sun" size={16} />
            {t("vacation", { count: card.vacationDays })}
            <span className={styles.info} title={t("vacationInfo")}>
              <Icon name="info" size={16} label={t("vacationInfo")} />
            </span>
          </span>
        </p>
        {card.maybeDays > 0 ||
        card.missing.length > 0 ||
        card.holidays.length > 0 ||
        card.hidden.length > 0 ? (
          <p className={styles.cardChips}>
            {card.missing.length > 0 ? (
              <Chip tone="no" icon="cross">
                {t("without", { names: card.missing.join(", ") })}
              </Chip>
            ) : null}
            {card.maybeDays > 0 ? (
              <Chip tone="maybe" icon="maybe">
                {t("maybe", { count: card.maybeDays })}
              </Chip>
            ) : null}
            {card.holidays.map((name) => (
              <Chip key={name} tone="holiday">
                {t("holiday", { name })}
              </Chip>
            ))}
            {card.hidden.length > 0 ? (
              <span className={styles.hiddenNote}>
                {t("hiddenNote", { names: card.hidden.join(", ") })}
              </span>
            ) : null}
          </p>
        ) : null}
        <button
          type="button"
          className={styles.textButton}
          aria-describedby={titleId}
          onClick={() => {
            onShow(card.index);
          }}
        >
          <Icon name="calendar" size={18} />
          {t("show")}
        </button>
        {pick ? (
          <label className={styles.pick}>
            <input
              type="checkbox"
              checked={pick.checked}
              disabled={pick.disabled}
              aria-describedby={titleId}
              onChange={(event) => {
                pick.onChange(event.target.checked);
              }}
            />
            <span>{tGroup("pick")}</span>
          </label>
        ) : null}
      </article>
    </li>
  );
}
