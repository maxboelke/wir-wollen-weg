"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { Stepper } from "@/components/ui/stepper";
import { Tile } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { SharePanel } from "@/features/trips/components/share-panel";
import type { Locale } from "@/i18n/config";
import { cx } from "@/lib/cx";
import { DISTANCE, DURATION, EASING, enter, sealPop } from "@/lib/motion";
import type { StayRatingValue } from "@/lib/stays";
import {
  chooseStayAction,
  deleteStayAction,
  dismissDatesNoticeAction,
  partySizeAction,
  rateStayAction,
  setBookedAction,
  stayWithoutAppAction,
  unchooseStayAction,
  type StayError,
} from "../actions";
import type { ChosenStay, RankedItem, StayItem, StaysModel } from "../load";
import type { StayRemindData } from "../remind-types";
import { StayImage } from "./stay-image";
import { StayRemindBody, useStayRemindTitle, type StayRemindStep } from "./stay-remind";
import { StayRow } from "./stay-row";
import { StayWithoutAppConfirm } from "./without-app-confirm";
import styles from "./stays.module.css";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useOffline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );
}

/** «Lena, Kemal und dir» – the viewer last, max. 4 names then «und n weitere» (§10.3). */
function listNames(names: string[], locale: string, more: (n: number) => string): string {
  const list = names.length > 4 ? [...names.slice(0, 3), more(names.length - 3)] : names;
  return new Intl.ListFormat(locale, { type: "conjunction", style: "long" }).format(list);
}

export interface StaysViewProps {
  publicId: string;
  tripName: string;
  model: StaysModel;
  /** «12.–19. Juni» for the «Termin geändert» notice. */
  rangeText: string;
  remind: StayRemindData | null;
  share: { link: string; texts: Record<Locale, string> } | null;
  /** Organiser: name differs from the infos → «Name in die Infos übernehmen» (W22 D). */
  info: { copyHref: string | null; viewHref: string };
  defaultLocale: Locale;
  seal: ReactNode;
  sealSmall: ReactNode;
  emptyIllustration: ReactNode;
}

type Sheet =
  | { kind: "delete"; item: StayItem }
  | { kind: "fix"; item: StayItem }
  | { kind: "unfix" }
  | { kind: "withoutApp" }
  | { kind: "party" }
  | { kind: "share" }
  | { kind: "remind"; step: StayRemindStep };

const CHOSEN_FLAG = "ww-stay-chosen";

/**
 * `/trips/{id}/stays` (W18 E.3): notices, «Eure Unterkunft», swipe prompt, ranking (free) or
 * lock notice, «Alle Vorschläge» (locked only), footer. All numbers and names of other people
 * come from the server ONLY when the viewer's ranking is free (Q33). Own ratings change at
 * once (optimistic, counts jump, no re-sort until the next load – M-U3, E.6.2).
 */
export function StaysView({
  publicId,
  tripName,
  model,
  rangeText,
  remind,
  share,
  info,
  defaultLocale,
  seal,
  sealSmall,
  emptyIllustration,
}: StaysViewProps) {
  const t = useTranslations("stays");
  const tCommon = useTranslations("common");
  const tTrip = useTranslations("trip");
  const tRemind = useTranslations("remind");
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const offline = useOffline();
  const base = `/trips/${publicId}`;
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [lastSheet, setLastSheet] = useState<Sheet>({ kind: "unfix" });
  const [pending, setPending] = useState(false);
  const [ratings, setRatings] = useState<Record<string, StayRatingValue | null>>({});
  const [booked, setBookedState] = useState<boolean | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const rankingRef = useRef<HTMLHeadingElement>(null);
  const chosenRef = useRef<HTMLElement>(null);
  const chosenHeading = useRef<HTMLHeadingElement>(null);
  const bookedFocus = useRef<"mark" | "unmark" | null>(null);
  const markRef = useRef<HTMLButtonElement>(null);
  const unmarkRef = useRef<HTMLButtonElement>(null);
  const remindTitle = useStayRemindTitle(
    remind ?? {
      tripName,
      orgaName: model.orgaName,
      isOrganizer: model.isOrganizer,
      defaultLocale,
      swipeHref: "",
      progress: { done: 0, total: 0 },
      open: [],
      done: [],
      allTexts: null,
      fix: null,
      book: null,
    },
  );
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const shown = sheet ?? lastSheet;

  // Server props changed (refresh after a write) → local optimistic state is obsolete.
  const [seenModel, setSeenModel] = useState(model);
  if (seenModel !== model) {
    setSeenModel(model);
    setRatings({});
    setBookedState(null);
  }

  const more = (count: number) => tTrip("kpiMore", { count });
  const error = useCallback(
    (code: StayError | "generic") => {
      const key =
        code === "limited"
          ? "error.limited"
          : code === "chosen"
            ? "error.chosen"
            : code === "gone"
              ? "error.gone"
              : "error.generic";
      toast({ message: t(key) });
    },
    [t, toast],
  );

  const close = useCallback(() => {
    setSheet(null);
    const back = trigger.current;
    trigger.current = null;
    if (back?.isConnected) {
      requestAnimationFrame(() => {
        back.focus();
      });
    }
  }, []);

  // W18-11: after «Das wird's» the organiser sees the card enter, the seal plop and the focus.
  useLayoutEffect(() => {
    const chosen = model.chosen;
    if (!chosen) return;
    let flag: string | null = null;
    try {
      flag = sessionStorage.getItem(CHOSEN_FLAG);
      if (flag === chosen.id) sessionStorage.removeItem(CHOSEN_FLAG);
    } catch {
      flag = null;
    }
    if (flag !== chosen.id) return;
    chosenHeading.current?.focus({ preventScroll: false });
    enter(chosenRef.current, {
      y: DISTANCE.md,
      duration: DURATION.slow,
      easing: EASING.emphasized,
    });
    sealPop(chosenRef.current?.querySelector("[data-seal='chosen']"), 40);
  }, [model.chosen]);

  // M-U14: the focus follows the replaced button («Als gebucht markieren» ↔ «Doch nicht gebucht»).
  useEffect(() => {
    const target = bookedFocus.current;
    if (!target) return;
    bookedFocus.current = null;
    (target === "unmark" ? unmarkRef : markRef).current?.focus();
    if (target === "unmark") {
      sealPop(chosenRef.current?.querySelector("[data-seal='booked']"), 20);
    }
  }, [booked]);

  // `/stays#ranking` (from the swipe end or the cockpit «Festlegen»): focus the ranking heading.
  useEffect(() => {
    if (window.location.hash === "#ranking") rankingRef.current?.focus();
  }, []);

  const myRating = (item: StayItem) =>
    item.id in ratings ? (ratings[item.id] ?? null) : item.myRating;
  const withRating = <T extends StayItem>(item: T): T => ({ ...item, myRating: myRating(item) });

  const rate = (item: StayItem, value: StayRatingValue) => {
    const previous = myRating(item);
    const next = previous === value ? null : value;
    setRatings((current) => ({ ...current, [item.id]: next }));
    void rateStayAction(publicId, item.id, next)
      .then((result) => {
        if (!result.ok) {
          setRatings((current) => ({ ...current, [item.id]: previous }));
          error(result.error);
          return;
        }
        if (next === null) {
          toast({
            message: result.locked ? t("rate.clearedLocked") : t("rate.cleared"),
            action: {
              label: tCommon("undo"),
              onAction: () => {
                rate({ ...item, myRating: null }, value);
              },
            },
          });
        }
      })
      .catch(() => {
        setRatings((current) => ({ ...current, [item.id]: previous }));
        toast({ message: t("rate.error") });
      });
  };

  const run = (
    work: () => Promise<{ ok: true } | { ok: false; error: StayError }>,
    done: () => void,
  ) => {
    if (offline) {
      toast({ message: t("error.offline") });
      return;
    }
    setPending(true);
    void work()
      .then((result) => {
        if (result.ok) done();
        else error(result.error);
      })
      .catch(() => {
        error("generic");
      })
      .finally(() => {
        setPending(false);
      });
  };

  const open = (next: Sheet, from?: HTMLElement | null) => {
    trigger.current = from ?? (document.activeElement as HTMLElement | null);
    setSheet(next);
  };

  const isBooked = booked ?? model.chosen?.booked !== null;
  const setBooked = (value: boolean, withUndo: boolean) => {
    const previous = isBooked;
    setBookedState(value);
    bookedFocus.current = value ? "unmark" : "mark";
    void setBookedAction(publicId, value)
      .then((result) => {
        if (!result.ok) {
          setBookedState(previous);
          error(result.error);
          return;
        }
        if (withUndo) {
          toast({
            message: value ? t("chosen.bookedToast") : t("chosen.unbookedToast"),
            action: {
              label: tCommon("undo"),
              onAction: () => {
                setBooked(!value, false);
              },
            },
          });
        }
        router.refresh();
      })
      .catch(() => {
        setBookedState(previous);
        error("generic");
      });
  };

  const empty = model.total === 0;
  const chosen = model.chosen ? withRating(model.chosen) : null;
  const canWrite = !model.chosen;
  const myUnrated = canWrite
    ? model.total -
      (model.ranking ?? model.all ?? []).filter((item) => myRating(item) !== null).length
    : 0;
  const myRated = model.total - myUnrated;

  const rankingRow = (item: RankedItem) => {
    const current = myRating(item);
    const delta = (value: StayRatingValue) =>
      (current === value ? 1 : 0) - (item.myRating === value ? 1 : 0);
    const likes = item.likes + delta("like");
    const names = [...item.likedBy.names, ...(current === "like" ? [t("ranking.dir")] : [])];
    const ranked: RankedItem = {
      ...item,
      myRating: current,
      likes,
      nopes: item.nopes + delta("nope"),
    };
    return (
      <StayRow
        key={item.id}
        item={ranked}
        ranked={ranked}
        canRate={canWrite}
        canFix={canWrite && model.isOrganizer}
        editHref={`${base}/stays/${item.id}/edit`}
        offline={offline}
        likedByText={names.length > 0 ? listNames(names, locale, more) : undefined}
        onRate={rate}
        onDelete={(target, from) => {
          open({ kind: "delete", item: target }, from);
        }}
        onFix={(target, from) => {
          open({ kind: "fix", item: target }, from);
        }}
      />
    );
  };

  const withoutAppButton =
    model.isOrganizer && canWrite && !model.withoutApp ? (
      <button
        type="button"
        className={styles.textButton}
        aria-haspopup="dialog"
        onClick={(event) => {
          open({ kind: "withoutApp" }, event.currentTarget);
        }}
      >
        {t("withoutApp.action")}
      </button>
    ) : null;

  const notices = (
    <>
      {model.datesChanged ? (
        <div className={cx(styles.notice, styles.warning)} role="status">
          <Icon name="warning" size={20} />
          <div className={styles.noticeText}>
            <p>{t("datesChanged", { range: rangeText })}</p>
            {model.datesChanged.rebook ? <p>{t("datesChangedUnbooked")}</p> : null}
          </div>
          {model.isOrganizer ? (
            <button
              type="button"
              className={styles.close}
              aria-label={t("datesChangedClose")}
              onClick={() => {
                run(
                  () => dismissDatesNoticeAction(publicId),
                  () => {
                    router.refresh();
                  },
                );
              }}
            >
              <Icon name="close" size={20} />
            </button>
          ) : null}
        </div>
      ) : null}
      {model.withoutApp ? (
        <div className={cx(styles.notice, styles.info)} role="status">
          <Icon name="success" size={20} />
          <div className={styles.noticeText}>
            <p>
              {model.withoutApp.name
                ? t("withoutApp.notice", { orga: model.withoutApp.name })
                : t("withoutApp.noticeUnknown")}
            </p>
            {model.isOrganizer ? (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  run(
                    () => stayWithoutAppAction(publicId, false),
                    () => {
                      toast({ message: t("withoutApp.undone") });
                      router.refresh();
                    },
                  );
                }}
              >
                {t("withoutApp.undo")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );

  const chosenCard = chosen ? (
    <ChosenCard
      ref={chosenRef}
      headingRef={chosenHeading}
      chosen={chosen}
      booked={isBooked}
      model={model}
      share={share}
      info={info}
      seal={seal}
      sealSmall={sealSmall}
      pending={pending}
      offline={offline}
      markRef={markRef}
      unmarkRef={unmarkRef}
      onBooked={(value) => {
        setBooked(value, true);
      }}
      onShare={(from) => {
        open({ kind: "share" }, from);
      }}
      onUnfix={(from) => {
        open({ kind: "unfix" }, from);
      }}
    />
  ) : null;

  const prompt =
    canWrite && myUnrated > 0 ? (
      <section className={cx(styles.card, styles.section)} aria-labelledby="stays-prompt">
        <div className={styles.promptHead}>
          <Tile icon="heart" tone="lavender" size="sm" />
          <h2 id="stays-prompt" className={styles.h2} tabIndex={-1}>
            {t("prompt.title", { count: myUnrated })}
          </h2>
        </div>
        <p className={styles.muted}>
          {model.myNew > 0
            ? t("prompt.new", { count: model.myNew })
            : t("prompt.progress", { rated: myRated, total: model.total })}
        </p>
        <span className={styles.bar} aria-hidden="true">
          <span
            className={styles.barFill}
            style={{ transform: `scaleX(${String(model.total ? myRated / model.total : 0)})` }}
          />
        </span>
        <ButtonLink href={`${base}/stays/swipe`} size="lg" block>
          {t("prompt.cta", { count: myUnrated })}
        </ButtonLink>
      </section>
    ) : null;

  const basedOn =
    model.rankingFree && model.openNames && (model.openNames.length > 0 || model.meOpen) ? (
      <div className={cx(styles.notice, styles.info)}>
        <Icon name="info" size={20} />
        <div className={styles.noticeText}>
          <p>
            {t("ranking.basedOn", {
              done: model.membersDone,
              total: model.membersTotal,
              names: listNames(
                [...(model.meOpen ? [t("ranking.you")] : []), ...model.openNames],
                locale,
                more,
              ),
            })}
          </p>
          {model.meOpen && canWrite ? (
            <Link className={styles.textButton} href={`${base}/stays/swipe`}>
              {t("ranking.swipeNow")}
            </Link>
          ) : null}
          {remind && model.openNames.length > 0 && canWrite ? (
            <button
              type="button"
              className={styles.textButton}
              aria-haspopup="dialog"
              onClick={(event) => {
                open({ kind: "remind", step: { occasion: "stay-rate" } }, event.currentTarget);
              }}
            >
              {t("ranking.remind")}
            </button>
          ) : null}
        </div>
      </div>
    ) : null;

  const topRanked = model.ranking?.filter((r) => r.first) ?? [];
  const ranking = empty ? null : (
    <section className={styles.section} aria-labelledby="ranking">
      <h2 id="ranking" ref={rankingRef} className={styles.h2} tabIndex={-1}>
        {t("ranking.title")}
      </h2>
      {model.ranking ? (
        <>
          <p className={styles.small}>{t("ranking.sort")}</p>
          <p className={styles.small}>
            {t("ranking.party", { count: model.travellers })}
            {model.isOrganizer && canWrite ? (
              <>
                {" "}
                <button
                  type="button"
                  className={styles.textButton}
                  aria-haspopup="dialog"
                  aria-label={t("ranking.changeName")}
                  onClick={(event) => {
                    open({ kind: "party" }, event.currentTarget);
                  }}
                >
                  {t("ranking.change")}
                </button>
              </>
            ) : null}
          </p>
          {basedOn}
          {model.isOrganizer && canWrite && topRanked.length > 1 ? (
            <p className={styles.muted}>{t("ranking.tieOrga")}</p>
          ) : null}
          {model.isOrganizer && canWrite && topRanked.length === 0 ? (
            <p className={styles.muted}>{t("ranking.noFavourite")}</p>
          ) : null}
          <ol className={styles.list}>{model.ranking.map(rankingRow)}</ol>
          {withoutAppButton}
        </>
      ) : (
        <div className={styles.locked}>
          <Icon name="lock" size={20} />
          <div>
            <p className={styles.lockedTitle}>{t("locked.title")}</p>
            <p className={styles.muted}>{t("locked.text", { count: myUnrated })}</p>
          </div>
        </div>
      )}
    </section>
  );

  const allList =
    model.all && !empty ? (
      <section className={styles.section} aria-labelledby="stays-all">
        <h2 id="stays-all" className={styles.h2} tabIndex={-1}>
          {t("all.title", { count: model.total })}
        </h2>
        <ul className={styles.list}>
          {model.all.map((item) => (
            <StayRow
              key={item.id}
              item={withRating(item)}
              canRate={canWrite}
              canFix={false}
              editHref={`${base}/stays/${item.id}/edit`}
              offline={offline}
              onRate={rate}
              onDelete={(target, from) => {
                open({ kind: "delete", item: target }, from);
              }}
              onFix={() => undefined}
            />
          ))}
        </ul>
        {withoutAppButton}
      </section>
    ) : null;

  const sheetTitle = (() => {
    switch (shown.kind) {
      case "delete":
        return t("delete.title", { title: shown.item.title });
      case "fix":
        return t("fixSheet.title", { title: shown.item.title });
      case "unfix":
        return t("unfix.title");
      case "withoutApp":
        return t("withoutApp.title");
      case "party":
        return t("party.title");
      case "share":
        return t("chosen.shareTitle");
      case "remind":
        return remindTitle(shown.step);
    }
  })();

  return (
    <>
      {empty ? (
        <div className={styles.page}>
          {notices}
          <section className={styles.empty} aria-labelledby="stays-empty">
            {emptyIllustration}
            <h2 id="stays-empty" className={styles.h2}>
              {t("empty.title")}
            </h2>
            <p className={styles.muted}>{t("empty.text")}</p>
            {canWrite ? (
              <ButtonLink href={`${base}/stays/new`} size="lg" icon="plus">
                {t("empty.action")}
              </ButtonLink>
            ) : null}
            {withoutAppButton}
          </section>
        </div>
      ) : (
        // DOM order = W18 E.3 (mobile order, also for screen readers); ≥ 960 px the ranking
        // moves into the right column (grid placement, E.11).
        <div className={cx(styles.page, styles.twoCols)}>
          {model.datesChanged || model.withoutApp ? (
            <div className={cx(styles.left, styles.stack)}>{notices}</div>
          ) : null}
          {chosenCard ? <div className={styles.left}>{chosenCard}</div> : null}
          {prompt ? <div className={styles.left}>{prompt}</div> : null}
          <div className={styles.aside}>{ranking}</div>
          {allList ? <div className={styles.left}>{allList}</div> : null}
        </div>
      )}
      {!empty ? (
        <p className={styles.small} style={{ marginTop: "var(--ww-space-5)" }}>
          {canWrite ? `${t("footer")} ` : ""}
          {t("footerImages")}
        </p>
      ) : null}

      <BottomSheet
        open={sheet !== null}
        onClose={close}
        title={sheetTitle}
        closeLabel={tCommon("close")}
        focusKey={shown.kind + (shown.kind === "remind" ? (shown.step.key ?? "") : "")}
        back={
          shown.kind === "remind" && shown.step.key
            ? {
                label: tRemind("back"),
                onClick: () => {
                  setSheet({ kind: "remind", step: { occasion: "stay-rate" } });
                },
              }
            : undefined
        }
      >
        {shown.kind === "delete" ? (
          <Confirm
            text={t("delete.text")}
            confirm={t("delete.confirm")}
            danger
            pending={pending}
            onCancel={close}
            onConfirm={() => {
              run(
                () => deleteStayAction(publicId, shown.item.id),
                () => {
                  setSheet(null);
                  trigger.current = null;
                  toast({ message: t("delete.done") });
                  router.refresh();
                  requestAnimationFrame(() => {
                    document.getElementById(model.all ? "stays-all" : "ranking")?.focus();
                  });
                },
              );
            }}
          />
        ) : null}
        {shown.kind === "fix" ? (
          <Confirm
            text={t("fixSheet.text")}
            extra={
              model.membersTotal - model.membersDone > 0
                ? t("fixSheet.open", { count: model.membersTotal - model.membersDone })
                : null
            }
            confirm={t("fix")}
            pending={pending}
            onCancel={close}
            onConfirm={() => {
              const item = shown.item;
              run(
                () => chooseStayAction(publicId, item.id),
                () => {
                  setSheet(null);
                  trigger.current = null;
                  try {
                    sessionStorage.setItem(CHOSEN_FLAG, item.id);
                  } catch {
                    // no storage – no plop, the card still appears
                  }
                  router.refresh();
                  toast({
                    message: t("fixed.toast", { title: item.title }),
                    ...(share
                      ? {
                          action: {
                            label: t("fixed.share"),
                            onAction: () => {
                              open({ kind: "share" }, null);
                            },
                          },
                        }
                      : {}),
                  });
                },
              );
            }}
          />
        ) : null}
        {shown.kind === "unfix" && chosen ? (
          <Confirm
            text={t("unfix.text", { title: chosen.title })}
            extra={isBooked ? t("unfix.booked") : null}
            confirm={t("unfix.confirm")}
            pending={pending}
            onCancel={close}
            onConfirm={() => {
              run(
                () => unchooseStayAction(publicId),
                () => {
                  setSheet(null);
                  trigger.current = null;
                  toast({ message: t("unfix.done") });
                  router.refresh();
                  requestAnimationFrame(() => rankingRef.current?.focus());
                },
              );
            }}
          />
        ) : null}
        {shown.kind === "withoutApp" ? (
          <StayWithoutAppConfirm
            pending={pending}
            onCancel={close}
            onConfirm={() => {
              run(
                () => stayWithoutAppAction(publicId, true),
                () => {
                  setSheet(null);
                  toast({ message: t("withoutApp.done") });
                  router.refresh();
                },
              );
            }}
          />
        ) : null}
        {shown.kind === "party" ? (
          <PartySize
            model={model}
            pending={pending}
            onSave={(size) => {
              run(
                () => partySizeAction(publicId, size),
                () => {
                  setSheet(null);
                  toast({ message: t("party.saved") });
                  router.refresh();
                },
              );
            }}
          />
        ) : null}
        {shown.kind === "share" && share ? (
          <SharePanel
            link={share.link}
            texts={share.texts}
            defaultLocale={defaultLocale}
            tripName={tripName}
          />
        ) : null}
        {shown.kind === "remind" && remind ? (
          <StayRemindBody
            data={remind}
            step={shown.step}
            onStep={(step) => {
              setSheet({ kind: "remind", step });
            }}
          />
        ) : null}
      </BottomSheet>
    </>
  );
}

function Confirm({
  text,
  extra,
  confirm,
  danger = false,
  pending,
  onCancel,
  onConfirm,
}: {
  text: string;
  extra?: string | null;
  confirm: string;
  danger?: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const tCommon = useTranslations("common");
  return (
    <div className={styles.sheetBody}>
      <p>{text}</p>
      {extra ? <p className={styles.muted}>{extra}</p> : null}
      <div className={styles.sheetActions}>
        <Button variant="secondary" size="md" data-autofocus="" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          size="md"
          loading={pending}
          onClick={onConfirm}
        >
          {confirm}
        </Button>
      </div>
    </div>
  );
}

function PartySize({
  model,
  pending,
  onSave,
}: {
  model: StaysModel;
  pending: boolean;
  onSave: (size: number | null) => void;
}) {
  const t = useTranslations("stays.party");
  const automatic = model.partyOverride === null ? model.travellers : null;
  const [value, setValue] = useState(String(model.partyOverride ?? model.travellers));
  const defaultCount = automatic ?? model.travellers;
  return (
    <div className={styles.sheetBody}>
      <Stepper
        id="stay-party"
        name="party"
        label={t("label")}
        value={value}
        onChange={setValue}
        min={1}
        max={50}
        unit={t("unit", { count: Number(value) || 2 })}
        decreaseLabel={t("decrease")}
        increaseLabel={t("increase")}
      />
      <p className={styles.muted}>{t("help", { count: defaultCount })}</p>
      <div className={styles.sheetActions}>
        <Button
          variant="text"
          size="md"
          onClick={() => {
            onSave(null);
          }}
        >
          {t("auto")}
        </Button>
        <Button
          size="md"
          loading={pending}
          onClick={() => {
            const size = Number(value);
            onSave(Number.isInteger(size) && size >= 1 && size <= 50 ? size : null);
          }}
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function ChosenCard({
  ref,
  headingRef,
  chosen,
  booked,
  model,
  share,
  info,
  seal,
  sealSmall,
  pending,
  offline,
  markRef,
  unmarkRef,
  onBooked,
  onShare,
  onUnfix,
}: {
  ref: React.RefObject<HTMLElement | null>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  chosen: ChosenStay;
  booked: boolean;
  model: StaysModel;
  share: StaysViewProps["share"];
  info: StaysViewProps["info"];
  seal: ReactNode;
  sealSmall: ReactNode;
  pending: boolean;
  offline: boolean;
  markRef: React.RefObject<HTMLButtonElement | null>;
  unmarkRef: React.RefObject<HTMLButtonElement | null>;
  onBooked: (value: boolean) => void;
  onShare: (from: HTMLElement) => void;
  onUnfix: (from: HTMLElement) => void;
}) {
  const t = useTranslations("stays");
  const author = chosen.author ?? t("row.formerMember");
  return (
    <section ref={ref} className={cx(styles.card, styles.chosen)} aria-labelledby="stays-chosen">
      <div className={styles.chosenMedia}>
        <StayImage src={chosen.image} className={styles.chosenImage} lazy={false} />
        <span className={styles.chosenSeal} data-seal="chosen" aria-hidden="true">
          {seal}
        </span>
      </div>
      <div className={styles.chosenBody}>
        <h2 id="stays-chosen" ref={headingRef} className={styles.h2} tabIndex={-1}>
          {t("chosen.title")}
        </h2>
        <h3 className={styles.chosenTitle}>{chosen.title}</h3>
        <p className={styles.meta}>{`${chosen.site} · ${t("row.by", { name: author })}`}</p>
        <p className={styles.price}>
          {chosen.price
            ? `${chosen.price} · ${t("row.perPerson", { amount: chosen.perPerson ?? "" })}`
            : t("row.noPrice")}
          {` · ${t("chosen.likes", { count: chosen.likes })}`}
        </p>
        {chosen.note ? (
          <p className={styles.muted}>{t("swipe.note", { note: chosen.note, name: author })}</p>
        ) : null}
        <div className={styles.statusRow}>
          {booked ? (
            <>
              <span className={cx(styles.statusChip, styles.booked)}>
                <span className={styles.chipSeal} data-seal="booked" aria-hidden="true">
                  {sealSmall}
                </span>
                {t("chosen.booked")}
              </span>
              {chosen.booked ? (
                <span className={styles.small}>
                  {chosen.booked.by
                    ? t("chosen.bookedBy", { date: chosen.booked.on, name: chosen.booked.by })
                    : t("chosen.bookedOn", { date: chosen.booked.on })}
                </span>
              ) : null}
            </>
          ) : (
            <span className={cx(styles.statusChip, styles.notBooked)}>
              <Icon name="clock" size={15} />
              {t("chosen.notBooked")}
            </span>
          )}
        </div>
        {!booked && !model.isOrganizer ? (
          <p className={styles.muted}>{t("chosen.waitMember", { orga: model.orgaName })}</p>
        ) : null}
        {model.isOrganizer ? (
          booked ? (
            <button
              ref={unmarkRef}
              type="button"
              className={styles.textButton}
              aria-disabled={offline || undefined}
              onClick={() => {
                if (!offline) onBooked(false);
              }}
            >
              {t("chosen.unbook")}
            </button>
          ) : (
            <Button
              ref={markRef}
              size="lg"
              block
              aria-disabled={offline || pending || undefined}
              onClick={() => {
                if (!offline) onBooked(true);
              }}
            >
              {t("chosen.markBooked")}
            </Button>
          )
        ) : null}
        <div className={styles.buttonRow}>
          {chosen.href ? (
            <a
              className={styles.extLink}
              href={chosen.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("view")}
              <Icon name="external" size={16} />
              <span className="visually-hidden">{` ${t("newTab")}`}</span>
            </a>
          ) : null}
          {share ? (
            <Button
              variant="secondary"
              size="sm"
              icon="share"
              aria-haspopup="dialog"
              onClick={(event) => {
                onShare(event.currentTarget);
              }}
            >
              {t("fixed.share")}
            </Button>
          ) : null}
        </div>
        {info.copyHref ? (
          <Link className={styles.textButton} href={info.copyHref}>
            {`${t("chosen.toInfo")} ›`}
          </Link>
        ) : (
          <Link className={styles.textButton} href={info.viewHref}>
            {`${t("chosen.seeInfo")} ›`}
          </Link>
        )}
        {model.isOrganizer ? (
          <button
            type="button"
            className={styles.textButton}
            aria-haspopup="dialog"
            onClick={(event) => {
              onUnfix(event.currentTarget);
            }}
          >
            {t("unfix.action")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
