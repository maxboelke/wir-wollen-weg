"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Chip } from "@/components/ui/chip";
import { Icon, type IconName } from "@/components/ui/icon";
import { DURATION, EASING, SCALE, STAGGER, animate, enter, spring } from "@/lib/motion";
import { VOTE_CHOICES, type OptionResult, type VoteChoice } from "@/lib/poll";
import type { OptionCardModel } from "../load";
import styles from "./poll.module.css";

const ICONS: Record<VoteChoice, IconName> = { yes: "check", maybe: "maybe", no: "cross" };

export interface OptionCardProps {
  card: OptionCardModel;
  mine: VoteChoice | null;
  result: OptionResult | null;
  top: boolean;
  /** Vote closed (phase 3 / past): answers locked, the chosen option is highlighted. */
  locked: boolean;
  chosen: boolean;
  /** Results are always visible for this viewer (organiser / fixed) – no reveal motion. */
  seesAll: boolean;
  onVote: (choice: VoteChoice) => void;
}

/**
 * Option card W10 (F-011, design-system §9.11): date, nights, «laut Kalender», segments
 * Ja/Vielleicht/Nein as a radio group (roving focus, arrows move and choose). Unconfirmed
 * suggestion from the own days = dashed «Nein?» (accessible name without «?», D-34). Result
 * only when the server released it (Q13 a) – otherwise «Stimm ab, um das Ergebnis zu sehen.»
 * Motion: W10-04 (fill grows, tick pops), W10-05 (bars grow on the first own vote; numbers jump,
 * G-16), «Platz 1» pops in.
 */
export function OptionCard(props: OptionCardProps) {
  const t = useTranslations("poll");
  const { card, mine, result } = props;
  const titleId = `option-${card.id}-title`;
  const ghostId = `option-${card.id}-ghost`;
  const segRefs = useRef(new Map<VoteChoice, HTMLButtonElement>());
  const resultRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLSpanElement>(null);
  const hadResult = useRef(result !== null);
  const hadTop = useRef(props.top);
  const ghost = mine === null && !props.locked ? card.suggested : null;

  // W10-05: the result appears after the first own vote – bars grow from the left in turn.
  useLayoutEffect(() => {
    const had = hadResult.current;
    hadResult.current = result !== null;
    if (had || result === null || props.seesAll) return;
    const root = resultRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-choice]").forEach((bar, index) => {
      animate(bar, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: DURATION.base,
        delay: index * STAGGER.item,
        easing: EASING.standard,
        fill: "backwards",
      });
    });
    enter(root.querySelector("[data-numbers]"), { duration: DURATION.base, delay: 80 });
  }, [result, props.seesAll]);

  useEffect(() => {
    const had = hadTop.current;
    hadTop.current = props.top;
    if (had || !props.top) return;
    animate(
      rankRef.current,
      [
        { opacity: 0, transform: `scale(${String(SCALE.pop)})` },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: DURATION.base, easing: spring("soft") },
    );
  }, [props.top]);

  function choose(choice: VoteChoice) {
    if (props.locked) return;
    if (choice === mine) return;
    props.onVote(choice);
    // W10-04: the Indigo fill grows from the centre, the tick corner pops 60 ms later.
    const segment = segRefs.current.get(choice);
    const soft = spring("soft");
    animate(
      segment?.querySelector("[data-fill]"),
      [
        { opacity: 0, transform: "scale(0.92)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: DURATION.base, easing: soft },
    );
    animate(
      segment?.querySelector("[data-icon]"),
      [{ transform: `scale(${String(SCALE.pop)})` }, { transform: "scale(1)" }],
      { duration: DURATION.fast, easing: soft },
    );
    animate(
      segment?.querySelector("[data-tick]"),
      [
        { opacity: 0, transform: `scale(${String(SCALE.pop)})` },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: DURATION.base, delay: 60, easing: soft, fill: "backwards" },
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const step = keys[event.key];
    if (step === undefined || props.locked) return;
    event.preventDefault();
    const current = VOTE_CHOICES.findIndex(
      (choice) => segRefs.current.get(choice) === document.activeElement,
    );
    const next = VOTE_CHOICES[(current + step + VOTE_CHOICES.length) % VOTE_CHOICES.length];
    if (!next) return;
    segRefs.current.get(next)?.focus();
    choose(next);
  }

  const tabbable: VoteChoice = mine ?? ghost ?? "yes";
  const total = result ? result.tally.yes + result.tally.maybe + result.tally.no : 0;
  const can =
    card.participants === 0
      ? t("nobodySubmitted")
      : card.cannot.length === 0
        ? t("everyoneCan")
        : t("canWithout", { count: card.can, names: card.cannot.join(", ") });

  return (
    <li className={styles.card} data-option-card={card.id} data-chosen={props.chosen || undefined}>
      <div className={styles.cardHead}>
        <h2 id={titleId} className={styles.cardTitle} tabIndex={-1}>
          {card.range}
        </h2>
        {props.top ? (
          <span ref={rankRef} className={styles.rank}>
            <Icon name="star" size={15} />
            {t("topChoice")}
          </span>
        ) : null}
        {props.chosen ? (
          <Chip tone="yes" icon="check">
            {t("fixedChosen")}
          </Chip>
        ) : null}
      </div>
      <p className={styles.meta}>
        <span className={styles.metaItem}>
          <Icon name="nights" size={16} />
          {t("create.nightsCount", { count: card.nights })}
        </span>
        <span className={styles.metaItem}>
          <Icon name="sun" size={16} />
          {t("create.vacation", { count: card.vacationDays })}
        </span>
      </p>
      <p className={styles.availability}>{t("byCalendar", { text: can })}</p>

      {ghost ? (
        <p className={styles.ghostLabel} id={ghostId}>
          {t("suggestedLabel")}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={titleId}
        aria-disabled={props.locked || undefined}
        className={styles.segments}
        data-locked={props.locked || undefined}
      >
        {VOTE_CHOICES.map((choice) => {
          const label = t(`segment.${choice}`);
          const isGhost = ghost === choice;
          return (
            <button
              key={choice}
              ref={(element) => {
                if (element) segRefs.current.set(choice, element);
                else segRefs.current.delete(choice);
              }}
              type="button"
              role="radio"
              className={styles.segment}
              aria-checked={mine === choice}
              aria-disabled={props.locked || undefined}
              aria-label={label}
              aria-describedby={isGhost ? ghostId : undefined}
              data-ghost={isGhost || undefined}
              data-choice-button={choice}
              tabIndex={choice === tabbable ? 0 : -1}
              onClick={() => {
                choose(choice);
              }}
              onKeyDown={onKeyDown}
            >
              <span className={styles.fill} data-fill="" aria-hidden="true" />
              <span className={styles.tick} data-tick="" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
              <span className={styles.segIcon} data-icon="" aria-hidden="true">
                <Icon name={ICONS[choice]} size={20} />
              </span>
              <span className={styles.segLabel} aria-hidden="true">
                {isGhost ? t("segmentGhost", { label }) : label}
              </span>
            </button>
          );
        })}
      </div>
      {props.locked ? (
        <p className={styles.muted}>
          <Icon name="lock" size={14} /> {t("fixedLocked")}
        </p>
      ) : null}

      <div className={styles.result} ref={resultRef} data-result={result ? "shown" : "hidden"}>
        {result ? (
          <>
            <div className={styles.bar} aria-hidden="true">
              {total === 0 ? <span className={styles.barEmpty} /> : null}
              {VOTE_CHOICES.filter((choice) => result.tally[choice] > 0).map((choice) => (
                <span
                  key={choice}
                  data-choice={choice}
                  style={{ flex: `${String(result.tally[choice])} 1 0` }}
                />
              ))}
            </div>
            <p className={styles.numbers} data-numbers="">
              <span className="visually-hidden">
                {t("resultSr", {
                  yes: result.tally.yes,
                  maybe: result.tally.maybe,
                  no: result.tally.no,
                })}
              </span>
              {VOTE_CHOICES.map((choice) => (
                <span key={choice} className={styles.number} aria-hidden="true">
                  <Icon name={ICONS[choice]} size={16} />
                  {result.tally[choice]}
                </span>
              ))}
              {result.names.no.length > 0 ? (
                <Chip tone="no" icon="cross">
                  {t("without", { names: result.names.no.join(", ") })}
                </Chip>
              ) : null}
            </p>
            <details className={styles.who}>
              <summary>
                {t("whoVoted")}
                <Icon name="chevron-down" size={20} className={styles.chevron} />
              </summary>
              {total === 0 ? (
                <p className={styles.muted}>{t("whoVotedNone")}</p>
              ) : (
                <ul className={styles.whoList}>
                  {VOTE_CHOICES.filter((choice) => result.names[choice].length > 0).map(
                    (choice) => (
                      <li key={choice}>
                        <b>{`${t(`segment.${choice}`)}:`}</b> {result.names[choice].join(", ")}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </details>
          </>
        ) : (
          <p className={styles.muted}>{t("voteToSee")}</p>
        )}
      </div>
    </li>
  );
}
