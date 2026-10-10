"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import type { IsoDate } from "@/lib/dates";
import { toParticipant } from "@/lib/heatmap";
import { DURATION, SCALE, STAGGER, animate, enter, spring } from "@/lib/motion";
import {
  MAX_OPTIONS,
  periodKey,
  type Period,
  type ViewerOption,
  type ViewerPoll,
  type VoteChoice,
} from "@/lib/poll";
import { SharePanel } from "../../trips/components/share-panel";
import {
  addOptionAction,
  fixDatesAction,
  voteAction,
  type PollError,
  type VoteActionResult,
} from "../actions";
import type { OptionCardModel } from "../load";
import { FixSheet } from "./fix-sheet";
import { OptionCard } from "./option-card";
import { PeriodSheet } from "./period-sheet";
import styles from "./poll.module.css";

export interface PollViewProps {
  publicId: string;
  isOrganizer: boolean;
  /** "vote" = open; "fixed"/"past" = closed, read-only with the full result. */
  phase: "vote" | "fixed" | "past";
  cards: OptionCardModel[];
  poll: ViewerPoll;
  order: string[];
  progress: { done: number; total: number };
  voted: string[];
  open: string[];
  /** «noch 3 Tage» etc. – null without deadline (F-017). */
  deadline: { value: string; until: string; passed: boolean } | null;
  orgaName: string;
  fixed: Period | null;
  overviewHref: string;
  /** The cockpit banner «Der Termin steht fest! [Ansehen]» is already shown (not celebrated). */
  celebrationPending: boolean;
  started: boolean;
  share: { link: string; texts: Record<Locale, string>; defaultLocale: Locale; tripName: string };
  add: {
    rangeStart: IsoDate;
    rangeEnd: IsoDate;
    minNights: number;
    today: IsoDate;
    labels: Record<IsoDate, string>;
    people: { key: string; name: string; entries: [IsoDate, "no" | "maybe"][] }[];
  } | null;
  /** Seal (server-rendered illustration) for «Alle haben abgestimmt». */
  seal: ReactNode;
}

type SaveState = "idle" | "saving" | "saved" | "failed";

/**
 * W10 B «Abstimmen» (F-011; Flow D.2; ux-spec §4.10 tiles; motion W10-04 … W10-09). Answers
 * save at once (optimistic, queued in order, 3 retries); results only arrive from the server
 * after the own vote (Q13 a). Cards never re-sort while the page is open (W10-08) – the order
 * from the server stays, options added later go to the end. Organiser: «+ Option hinzufügen»
 * and «Abstimmung beenden & festlegen» (F-012).
 */
export function PollView(props: PollViewProps) {
  const t = useTranslations("poll");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [options, setOptions] = useState<ViewerOption[]>(props.poll.options);
  const [top, setTop] = useState<string[]>(props.poll.top);
  const [progress, setProgress] = useState(props.progress);
  const [voters, setVoters] = useState({ voted: props.voted, open: props.open });
  const [order, setOrder] = useState<string[]>(props.order);
  const [save, setSave] = useState<SaveState>("idle");
  const [conflict, setConflict] = useState(false);
  const [votersOpen, setVotersOpen] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [fixBusy, setFixBusy] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(props.started && props.isOrganizer);
  const [announcement, setAnnouncement] = useState("");
  const queue = useRef<Promise<void>>(Promise.resolve());
  const inflight = useRef(0);
  const failed = useRef<{ optionId: string; choice: VoteChoice }[]>([]);
  const infoRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // A server refresh (option added) brings new props: take them, keep the order (W10-08).
  const [lastPoll, setLastPoll] = useState(props.poll);
  if (lastPoll !== props.poll) {
    setLastPoll(props.poll);
    setOptions(props.poll.options);
    setTop(props.poll.top);
    setProgress(props.progress);
    setVoters({ voted: props.voted, open: props.open });
    setOrder((current) => [
      ...current.filter((id) => props.poll.options.some((option) => option.id === id)),
      ...props.poll.options.map((option) => option.id).filter((id) => !current.includes(id)),
    ]);
  }

  const cardById = useMemo(
    () => new Map(props.cards.map((card) => [card.id, card])),
    [props.cards],
  );
  const optionById = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const visible = order.filter((id) => cardById.has(id) && optionById.has(id));
  const voting = props.phase === "vote" && !conflict;
  const seesAll = props.isOrganizer || props.phase !== "vote";
  const openCount = options.filter((option) => option.mine === null).length;
  const ghosts = voting
    ? options.filter((o) => o.mine === null && cardById.get(o.id)?.suggested)
    : [];
  const allVoted = progress.total > 0 && progress.done === progress.total;
  const fixedKey = props.fixed ? periodKey(props.fixed) : null;

  function applyResult(result: VoteActionResult) {
    if (!result.ok) return;
    setProgress({ done: result.done, total: result.total });
    setVoters({ voted: result.voted, open: result.open });
    setTop(result.poll.top);
    setOptions((current) =>
      result.poll.options.map((option) => {
        // Answers still on their way keep the local value (no flicker back).
        const local = current.find((o) => o.id === option.id);
        return inflight.current > 0 && local ? { ...option, mine: local.mine } : option;
      }),
    );
  }

  function send(votes: { optionId: string; choice: VoteChoice }[], previous: ViewerOption[]) {
    inflight.current++;
    setSave("saving");
    queue.current = queue.current.then(async () => {
      let result: VoteActionResult | null = null;
      for (let attempt = 0; attempt < 3 && !result; attempt++) {
        try {
          result = await voteAction(props.publicId, votes);
        } catch {
          // network: retry with back-off (ux-spec §6), keep the local answer meanwhile
          await new Promise((resolve) => window.setTimeout(resolve, 400 * 2 ** attempt));
        }
      }
      inflight.current--;
      if (!result) {
        failed.current = [...failed.current, ...votes];
        setSave("failed");
        return;
      }
      if (!result.ok) {
        // Rejected by the server: roll back (ux-spec §6); a closed vote shows the conflict.
        setOptions(previous);
        setSave("idle");
        if (result.error === "phase") setConflict(true);
        return;
      }
      applyResult(result);
      if (inflight.current === 0) setSave("saved");
    });
  }

  function vote(optionId: string, choice: VoteChoice) {
    if (!voting) return;
    const previous = options;
    const next = options.map((o) => (o.id === optionId ? { ...o, mine: choice } : o));
    setOptions(next);
    const card = cardById.get(optionId);
    if (card) setAnnouncement(t("votedFor", { range: card.range, choice: t(`segment.${choice}`) }));
    send([{ optionId, choice }], previous);
    afterVote(next);
  }

  /** W10-07: confirm every suggestion; visible cards fill one after the other. */
  function acceptAll() {
    if (!voting || ghosts.length === 0) return;
    const votes = ghosts.flatMap((o) => {
      const suggested = cardById.get(o.id)?.suggested;
      return suggested ? [{ optionId: o.id, choice: suggested }] : [];
    });
    const previous = options;
    const next = options.map((o) => {
      const match = votes.find((v) => v.optionId === o.id);
      return match ? { ...o, mine: match.choice } : o;
    });
    setOptions(next);
    votes.forEach((v, index) => {
      const fill = document.querySelector(
        `[data-option-card="${v.optionId}"] [data-choice-button="${v.choice}"] [data-fill]`,
      );
      animate(
        fill,
        [
          { opacity: 0, transform: "scale(0.92)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        {
          duration: DURATION.base,
          delay: index * STAGGER.card,
          easing: spring("soft"),
          fill: "backwards",
        },
      );
    });
    send(votes, previous);
    // The box disappears: keep the focus on something meaningful.
    if (infoRef.current?.contains(document.activeElement)) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-option-card] [role="radio"][aria-checked="true"]`)
          ?.focus();
      });
    }
    afterVote(next);
  }

  /** W10-08: the status line turns into «Danke …», the check pops – no re-sorting. */
  function afterVote(next: ViewerOption[]) {
    const wasOpen = options.some((o) => o.mine === null);
    const nowOpen = next.some((o) => o.mine === null);
    if (wasOpen && !nowOpen) {
      window.requestAnimationFrame(() => {
        enter(statusRef.current, { duration: DURATION.base });
        animate(
          statusRef.current?.querySelector("[data-ok]"),
          [{ transform: `scale(${String(SCALE.pop)})` }, { transform: "scale(1)" }],
          { duration: DURATION.base, easing: spring("soft") },
        );
      });
    }
  }

  function retry() {
    const votes = failed.current;
    failed.current = [];
    if (votes.length > 0) send(votes, options);
  }

  // Share sheet «Abstimmung läuft!» right after the start (W10-03); drop ?started afterwards.
  useEffect(() => {
    if (!props.started) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("started");
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }, [props.started]);

  function errorText(error: PollError): string {
    if (error === "tooShort")
      return t("create.errors.tooShort", { min: props.add?.minNights ?? 1 });
    if (
      error === "duplicate" ||
      error === "outsideRange" ||
      error === "past" ||
      error === "tooLong" ||
      error === "full"
    ) {
      return t(`create.errors.${error}`);
    }
    if (error === "phase") return t("phaseChanged");
    return t("create.errors.invalid");
  }

  const participants = useMemo(
    () => (props.add ? props.add.people.map((p) => toParticipant(p.key, p.entries)) : []),
    [props.add],
  );
  const names = useMemo(
    () => (props.add ? Object.fromEntries(props.add.people.map((p) => [p.key, p.name])) : {}),
    [props.add],
  );
  const taken = useMemo(() => new Set(props.cards.map((card) => periodKey(card))), [props.cards]);

  const deadlineTile = props.deadline ? (
    <div className={styles.kpi} data-tone={props.deadline.passed ? "warning" : undefined}>
      <span aria-hidden="true">
        <Icon name={props.deadline.passed ? "warning" : "clock"} size={22} />
      </span>
      <span className={styles.kpiText}>
        <span className={styles.kpiValue}>{props.deadline.value}</span>
        <span className={styles.kpiLabel}>{props.deadline.until}</span>
      </span>
    </div>
  ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>{voting ? t("open") : t("closed")}</h1>
        <div className={styles.kpis}>
          {deadlineTile}
          <button
            type="button"
            className={styles.kpi}
            aria-haspopup="dialog"
            onClick={() => {
              setVotersOpen(true);
            }}
          >
            <span aria-hidden="true">
              {allVoted ? (
                <span className={styles.kpiSeal}>{props.seal}</span>
              ) : (
                <Icon name="users" size={22} />
              )}
            </span>
            <span className={styles.kpiText}>
              <span className={styles.kpiValue}>
                {allVoted
                  ? t("kpiAllVoted")
                  : t("kpiVoted", { done: progress.done, total: progress.total })}
              </span>
              <span className={styles.kpiLabel}>
                {allVoted ? t("kpiVotersHint") : t("kpiVotedLabel")}
              </span>
            </span>
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </div>

      {conflict ? (
        <Banner
          tone="warning"
          role="alert"
          action={
            <ButtonLink href={props.overviewHref} variant="secondary" size="sm">
              {t("conflictAction")}
            </ButtonLink>
          }
        >
          {t("conflict", { orga: props.orgaName })}
        </Banner>
      ) : null}

      {voting && props.deadline?.passed ? (
        props.isOrganizer ? (
          <Banner
            tone="warning"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFixOpen(true);
                }}
              >
                {t("deadlinePassedOrgaAction")}
              </Button>
            }
          >
            {t("deadlinePassedOrga")}
          </Banner>
        ) : (
          <Banner tone="warning">{t("deadlinePassedMember", { orga: props.orgaName })}</Banner>
        )
      ) : null}

      {props.phase !== "vote" && props.fixed && !props.celebrationPending ? (
        <Banner
          tone="success"
          action={
            <ButtonLink href={props.overviewHref} variant="secondary" size="sm">
              {t("conflictAction")}
            </ButtonLink>
          }
        >
          {t("fixedBanner")}
        </Banner>
      ) : null}

      {ghosts.length > 0 ? (
        <div className={styles.info} ref={infoRef}>
          <p>{t("prefillInfo")}</p>
          <Button variant="secondary" size="md" onClick={acceptAll}>
            {t("prefillAll")}
          </Button>
        </div>
      ) : null}

      <ol className={styles.cards}>
        {visible.map((id) => {
          const card = cardById.get(id);
          const option = optionById.get(id);
          if (!card || !option) return null;
          return (
            <OptionCard
              key={id}
              card={card}
              mine={option.mine}
              result={option.result}
              top={top.includes(id)}
              locked={!voting}
              chosen={fixedKey !== null && periodKey(card) === fixedKey}
              seesAll={seesAll}
              onVote={(choice) => {
                vote(id, choice);
              }}
            />
          );
        })}
      </ol>

      {voting ? (
        <p className={styles.status} role="status" ref={statusRef}>
          {openCount > 0 ? (
            t("statusOpen", { count: openCount })
          ) : (
            <>
              <span className={styles.statusOk} data-ok="">
                <Icon name="check" size={20} />
              </span>
              {t("statusDone")}
            </>
          )}
        </p>
      ) : null}
      {save === "failed" ? (
        <Banner
          tone="warning"
          role="alert"
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              {t("retry")}
            </Button>
          }
        >
          {t("saveFailed")}
        </Banner>
      ) : (
        <p className={styles.muted} aria-live="polite" data-save-state={save}>
          {save === "saving" ? t("saving") : save === "saved" ? t("saved") : ""}
        </p>
      )}

      {voting && props.isOrganizer ? (
        <>
          <div className={styles.orgaTools}>
            <Button
              variant="secondary"
              size="md"
              icon="share"
              onClick={() => {
                setShareOpen(true);
              }}
            >
              {t("sharePoll")}
            </Button>
            {options.length < MAX_OPTIONS && props.add ? (
              <Button
                variant="secondary"
                size="md"
                icon="plus"
                onClick={() => {
                  setAddError(null);
                  setAddOpen(true);
                }}
              >
                {t("addOption")}
              </Button>
            ) : null}
          </div>
          <div className={styles.sticky}>
            <Button
              block
              icon="check"
              onClick={() => {
                setFixError(null);
                setFixOpen(true);
              }}
            >
              {t("fixButton")}
            </Button>
            <p className={styles.stickyNote}>{t("fixOrgaOnly")}</p>
          </div>
        </>
      ) : null}

      <p className="visually-hidden" role="status">
        {announcement}
      </p>

      <BottomSheet
        open={votersOpen}
        onClose={() => {
          setVotersOpen(false);
        }}
        title={t("votersTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.voters}>
          <p className={styles.muted}>{t("votersNote")}</p>
          <h3>{t("votersDone", { count: voters.voted.length })}</h3>
          {voters.voted.length > 0 ? (
            <ul className={styles.voterList}>
              {voters.voted.map((name) => (
                <li key={name}>
                  <Icon name="check" size={16} />
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>{t("votersNone")}</p>
          )}
          <h3>{t("votersOpen", { count: voters.open.length })}</h3>
          {voters.open.length > 0 ? (
            <ul className={styles.voterList}>
              {voters.open.map((name) => (
                <li key={name}>
                  <Icon name="clock" size={16} />
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>{t("kpiAllVoted")}</p>
          )}
        </div>
      </BottomSheet>

      {props.isOrganizer && voting ? (
        <FixSheet
          open={fixOpen}
          onClose={() => {
            setFixOpen(false);
          }}
          choices={visible.flatMap((id) => {
            const card = cardById.get(id);
            const option = optionById.get(id);
            return card && option
              ? [
                  {
                    id,
                    range: card.range,
                    tally: option.result?.tally ?? null,
                    without: option.result?.names.no ?? [],
                  },
                ]
              : [];
          })}
          missing={voters.open.join(", ")}
          busy={fixBusy}
          error={fixError}
          onConfirm={(optionId) => {
            setFixBusy(true);
            setFixError(null);
            void fixDatesAction(props.publicId, optionId)
              .then((result) => {
                if (result.ok) {
                  // The celebration plays on the overview; focus goes to «Es geht los!».
                  router.push(`${props.overviewHref}?fixed=1`);
                  return;
                }
                setFixBusy(false);
                setFixError(
                  result.error === "phase"
                    ? t("conflict", { orga: props.orgaName })
                    : t("phaseChanged"),
                );
              })
              .catch(() => {
                setFixBusy(false);
                setFixError(tCommon("genericError"));
              });
          }}
        />
      ) : null}

      {props.add ? (
        <PeriodSheet
          open={addOpen}
          onClose={() => {
            setAddOpen(false);
          }}
          title={t("period.titleAdd")}
          note={t("addOptionNote")}
          rangeStart={props.add.rangeStart}
          rangeEnd={props.add.rangeEnd}
          minNights={props.add.minNights}
          today={props.add.today}
          labels={props.add.labels}
          participants={participants}
          names={names}
          taken={taken}
          busy={addBusy}
          error={addError}
          onAdd={(period) => {
            setAddBusy(true);
            setAddError(null);
            void addOptionAction(props.publicId, period)
              .then((result) => {
                setAddBusy(false);
                if (result.ok) {
                  setAddOpen(false);
                  setAnnouncement(t("addOptionDone"));
                  router.refresh();
                  return;
                }
                setAddError(errorText(result.error));
              })
              .catch(() => {
                setAddBusy(false);
                setAddError(tCommon("genericError"));
              });
          }}
        />
      ) : null}

      <BottomSheet
        open={shareOpen}
        onClose={() => {
          setShareOpen(false);
        }}
        title={t("shareTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.sheet}>
          <p className={styles.muted}>{t("shareLead")}</p>
          <SharePanel
            link={props.share.link}
            texts={props.share.texts}
            defaultLocale={props.share.defaultLocale}
            tripName={props.share.tripName}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
