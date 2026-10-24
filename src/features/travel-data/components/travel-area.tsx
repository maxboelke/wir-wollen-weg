"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-styles";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import type { CopyField } from "@/lib/travel-data";
import { copyText } from "@/lib/clipboard";
import {
  addRecipientsAction,
  closeRequestAction,
  copyAction,
  declineAction,
  dismissExpiredAction,
  hintSeenAction,
  ownDocumentAction,
  removeRecipientAction,
  revealAction,
  withdrawAction,
  type TravelActionError,
} from "../actions";
import type {
  AccessLine,
  CountCard,
  OwnRequest,
  PersonCard,
  ToMeCard,
  TravelPageModel,
} from "../types";
import { BookerChip, DeleteLine, DemoNote, ShieldBox, StatusChip } from "./bits";
import {
  isTravelRemindDetail,
  TravelRemindBody,
  useTravelRemindTitle,
  type TravelRemindStep,
} from "./travel-remind";
import { TravelReauth } from "./travel-reauth";
import styles from "./travel-data.module.css";

export type TravelFlash =
  | { kind: "sent"; count: number; requestId: string }
  | { kind: "released"; requestId: string; name: string }
  | { kind: "closedByBooker" | "noLongerBooker"; name: string };

interface Art {
  seal40: ReactNode;
  seal20: ReactNode;
  /** The same seal wrapped in `SealMotion` (pop after the server confirmed, UM-20). */
  sealPop: ReactNode;
  empty: ReactNode;
  deleted: ReactNode;
}

type Sheet =
  | { kind: "withdraw"; card: ToMeCard }
  | { kind: "close"; request: OwnRequest }
  | { kind: "menu"; request: OwnRequest }
  | { kind: "add"; request: OwnRequest; preselect: string[] }
  | { kind: "remove"; request: OwnRequest; person?: PersonCard | undefined }
  | { kind: "remind"; step: TravelRemindStep }
  | { kind: "reauth"; retry: () => void };

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useOffline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );
}

/** Moves the focus to an element once it exists (after a refresh). */
function focusLater(id: string) {
  let tries = 0;
  const run = () => {
    const el = document.getElementById(id);
    if (el) {
      el.focus({ preventScroll: false });
      return;
    }
    if (tries++ < 20) window.setTimeout(run, 50);
  };
  window.setTimeout(run, 0);
}

/**
 * Area «Reisedaten» (W20 H.3): demo notice, one-off notices, «Anfragen an dich», «Deine
 * Anfragen» («Bucht»: masks from the server, «Anzeigen»/«Kopieren» per Server Action with an
 * access-log row, re-authentication for document numbers), other requests as numbers,
 * «Wer sieht was?». Values that were shown live only in this component's state – leaving the
 * page or switching apps hides them again (W20 H.7).
 */
export function TravelArea({
  model,
  flash,
  art,
  email,
}: {
  model: TravelPageModel;
  flash: TravelFlash | null;
  art: Art;
  email: string;
}) {
  const t = useTranslations("travelData");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const offline = useOffline();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [lastSheet, setLastSheet] = useState<Sheet | null>(null);
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const shown = sheet ?? lastSheet;
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<string | null>(
    flash?.kind === "released" ? flash.requestId : null,
  );
  const [closedHints, setClosedHints] = useState<Set<string>>(new Set());
  const remindTitle = useTravelRemindTitle(model.remind);
  const flashed = useRef(false);

  // Snackbar + focus after a navigation back to the area (W20 H.4/H.5), then a clean URL.
  useEffect(() => {
    if (!flash || flashed.current) return;
    flashed.current = true;
    if (flash.kind === "sent") {
      toast({ message: t("request.sent", { count: flash.count }) });
      focusLater(`td-req-${flash.requestId}`);
    } else if (flash.kind === "released") {
      toast({ message: t("consent.released", { name: flash.name }) });
      focusLater(`td-card-${flash.requestId}`);
    }
    router.replace(pathname, { scroll: false });
  }, [flash, pathname, router, t, toast]);

  const errorText = useCallback(
    (error: string) => (error === "limited" ? t("limited") : t("generic")),
    [t],
  );

  /** Runs an action; on success a snackbar and a refresh (states change «beim Neuladen»). */
  const run = useCallback(
    async (work: () => Promise<{ ok: boolean; error?: string }>, done: () => void) => {
      if (offline) {
        toast({ message: t("offline") });
        return;
      }
      setBusy(true);
      try {
        const result = await work();
        if (result.ok) {
          setSheet(null);
          done();
          router.refresh();
        } else {
          toast({ message: errorText(result.error ?? "generic") });
          router.refresh();
        }
      } catch {
        toast({ message: t("generic") });
      } finally {
        setBusy(false);
      }
    },
    [errorText, offline, router, t, toast],
  );

  const decline = useCallback(
    (card: ToMeCard) => {
      void run(
        () => declineAction(model.publicId, card.requestId, true),
        () => {
          toast({
            message: t("declined", { name: card.byName }),
            action: {
              label: tCommon("undo"),
              onAction: () => {
                void declineAction(model.publicId, card.requestId, false).then(() => {
                  router.refresh();
                });
              },
            },
          });
        },
      );
    },
    [model.publicId, router, run, t, tCommon, toast],
  );

  const hideHint = (hint: "booker" | "dates", key: string) => {
    setClosedHints((prev) => new Set(prev).add(key));
    void hintSeenAction(model.publicId, hint);
  };

  if (model.deleted) {
    return (
      <div className={styles.page}>
        <div className={styles.empty} data-travel-deleted="">
          {art.deleted}
          <h2 className={styles.h2}>{t("deleted.title")}</h2>
          <p className={styles.muted}>{t("deleted.body", { date: model.deleteOn })}</p>
        </div>
      </div>
    );
  }

  const openOwn = model.mine.filter((r) => r.closed === null);
  const closedOwn = model.mine.filter((r) => r.closed !== null);
  const hasToMe = model.toMe.length > 0;
  const showMemberEmpty = !hasToMe && !model.isBooker && model.others.length === 0;
  const firstOpenToMe = model.toMe.find((c) => c.state === "open");

  return (
    <div className={styles.page} data-wide={model.isBooker && openOwn.length > 0}>
      <p className={styles.printOnly}>{t("print")}</p>
      {model.demo ? <DemoNote tag={t("demo.tag")}>{t("demo.area")}</DemoNote> : null}

      {model.hints.marked && !closedHints.has("marked") ? (
        <Banner
          tone="info"
          role="status"
          action={
            <CloseHint
              label={t("closeHint")}
              onClose={() => {
                hideHint("booker", "marked");
              }}
            />
          }
        >
          {t("hints.marked", { name: model.hints.marked })}
        </Banner>
      ) : null}
      {model.hints.revoked && !closedHints.has("revoked") ? (
        <Banner
          tone="info"
          role="status"
          action={
            <CloseHint
              label={t("closeHint")}
              onClose={() => {
                hideHint("booker", "revoked");
              }}
            />
          }
        >
          {t("hints.revoked")}
        </Banner>
      ) : null}
      {model.hints.datesBooker && !closedHints.has("datesBooker") ? (
        <div className={styles.warn} role="status">
          <Icon name="clock" size={18} />
          <div className={styles.compact}>
            <p>
              {t("datesChanged.booker", { range: model.hints.datesBooker, date: model.deleteOn })}
            </p>
            <CloseHint
              label={t("closeHint")}
              onClose={() => {
                hideHint("dates", "datesBooker");
              }}
            />
          </div>
        </div>
      ) : null}

      {hasToMe ? (
        <section className={cx(styles.section, styles.noPrint)} aria-labelledby="td-to-me">
          <h2 id="td-to-me" className={styles.h2}>
            {t("toMe.title")}
          </h2>
          {model.toMe.map((card) => (
            <ToMeCardView
              key={card.requestId}
              card={card}
              model={model}
              art={art}
              fresh={fresh === card.requestId}
              primary={card === firstOpenToMe}
              offline={offline}
              datesHint={
                model.hints.datesMember &&
                card.state === "released" &&
                !closedHints.has("datesMember")
                  ? () => {
                      hideHint("dates", "datesMember");
                    }
                  : null
              }
              onDecline={() => {
                decline(card);
              }}
              onUndoDecline={() => {
                router.push(`${pathname}/${card.requestId}`);
              }}
              onWithdraw={() => {
                setFresh(null);
                setSheet({ kind: "withdraw", card });
              }}
              onDismiss={() => {
                void dismissExpiredAction(model.publicId, card.requestId).then(() => {
                  router.refresh();
                });
              }}
            />
          ))}
        </section>
      ) : null}

      {model.isBooker && model.mine.length > 0 ? (
        <section className={cx(styles.section, styles.noPrint)} aria-labelledby="td-mine">
          <h2 id="td-mine" className={styles.h2}>
            {t("mine.title")}
          </h2>
          <Banner tone="info">{t("booker.note")}</Banner>
          {openOwn.map((request) => (
            <OwnRequestView
              key={request.requestId}
              request={request}
              model={model}
              offline={offline}
              onMenu={() => {
                setSheet({ kind: "menu", request });
              }}
              onAddNew={() => {
                setSheet({
                  kind: "add",
                  request,
                  preselect: request.newMembers.map((m) => m.key),
                });
              }}
              onClose={() => {
                setSheet({ kind: "close", request });
              }}
              onRemind={() => {
                setSheet({ kind: "remind", step: { requestId: request.requestId } });
              }}
              onReauth={(retry) => {
                setSheet({ kind: "reauth", retry });
              }}
            />
          ))}
          {closedOwn.length > 0 ? (
            <details className={styles.details}>
              <summary>{t("mine.closedGroup", { count: closedOwn.length })}</summary>
              <ul className={styles.statusList}>
                {closedOwn.map((r) => (
                  <li key={r.requestId}>
                    <span>{`„${r.purpose}“`}</span>
                    <span className={styles.small}>
                      {r.closed?.reason === "done"
                        ? t("mine.closed", { date: r.closed.on })
                        : t("mine.expired")}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {model.canRequest && openOwn.length === 0 ? (
            <p className={styles.compact}>
              <span className={styles.muted}>{t("mine.none")}</span>
              <Link className={styles.textButton} href={model.newHref}>
                {t("mine.noneAction")}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {model.isBooker && model.mine.length === 0 && model.canRequest ? (
        hasToMe ? (
          <p className={cx(styles.compact, styles.noPrint)}>
            <span className={styles.muted}>{t("mine.none")}</span>
            <Link className={styles.textButton} href={model.newHref}>
              {t("mine.noneAction")}
            </Link>
          </p>
        ) : (
          <section className={cx(styles.empty, styles.noPrint)} aria-labelledby="td-empty">
            {art.empty}
            <h2 id="td-empty" className={styles.h2}>
              {t("emptyBooker.title")}
            </h2>
            <p className={styles.muted}>{t("emptyBooker.text")}</p>
            <Link className={buttonClassName({ size: "lg" })} href={model.newHref}>
              <Icon name="id-card" size={20} />
              <span>{t("emptyBooker.cta")}</span>
            </Link>
          </section>
        )
      ) : null}

      {model.others.length > 0 ? (
        <section className={cx(styles.section, styles.noPrint)} aria-labelledby="td-others">
          <h2 id="td-others" className={styles.h2}>
            {t("others.title")}
          </h2>
          {model.others.map((card) => (
            <CountCardView key={card.requestId} card={card} />
          ))}
        </section>
      ) : null}

      {showMemberEmpty ? (
        <section className={styles.empty} aria-labelledby="td-nothing">
          {art.empty}
          <h2 id="td-nothing" className={styles.h2}>
            {t("emptyMember.title")}
          </h2>
          <p className={styles.muted}>
            {model.bookerCount > 0
              ? t("emptyMember.text", { names: model.bookerNames, count: model.bookerCount })
              : t("emptyMember.textNobody")}
          </p>
        </section>
      ) : null}

      <details className={cx(styles.details, styles.noPrint)}>
        <summary>
          <Icon name="shield" size={18} />
          <span>{t("who.title")}</span>
        </summary>
        <ul>
          <li>{t("who.s1")}</li>
          <li>{t("who.s2")}</li>
          <li>{t("who.s3")}</li>
          <li>{t("who.s4", { date: model.deleteOn })}</li>
        </ul>
      </details>

      <BottomSheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
        }}
        title={shown ? sheetTitle(shown, t, remindTitle) : ""}
        closeLabel={tCommon("close")}
        focusKey={
          shown
            ? shown.kind +
              (shown.kind === "remind"
                ? `${shown.step.requestId ?? ""}${shown.step.key ?? ""}`
                : "") +
              (shown.kind === "remove" ? (shown.person?.recipientId ?? "") : "")
            : ""
        }
        back={
          shown?.kind === "remind" && isTravelRemindDetail(shown.step)
            ? {
                label: tCommon("back"),
                onClick: () => {
                  setSheet({ kind: "remind", step: { requestId: shown.step.requestId } });
                },
              }
            : shown?.kind === "remove" && shown.person
              ? {
                  label: tCommon("back"),
                  onClick: () => {
                    setSheet({ kind: "remove", request: shown.request });
                  },
                }
              : undefined
        }
      >
        {shown ? (
          <SheetBody
            sheet={shown}
            model={model}
            busy={busy}
            email={email}
            onCancel={() => {
              setSheet(null);
            }}
            onSheet={setSheet}
            onWithdraw={(card) => {
              void run(
                () => withdrawAction(model.publicId, card.requestId),
                () => {
                  toast({ message: t("revoke.done") });
                  focusLater(`td-card-${card.requestId}`);
                },
              );
            }}
            onCloseRequest={(request) => {
              void run(
                () => closeRequestAction(model.publicId, request.requestId),
                () => {
                  toast({ message: t("close.done") });
                },
              );
            }}
            onAdd={(request, users, placeholders) => {
              void run(
                () =>
                  addRecipientsAction(model.publicId, request.requestId, { users, placeholders }),
                () => {
                  toast({
                    message: t("addPeople.done", { count: users.length + placeholders.length }),
                  });
                },
              );
            }}
            onRemove={(request, person) => {
              void run(
                () => removeRecipientAction(model.publicId, request.requestId, person.recipientId),
                () => {
                  toast({ message: t("removePerson.done", { name: person.name }) });
                },
              );
            }}
          />
        ) : null}
      </BottomSheet>
    </div>
  );
}

function sheetTitle(
  sheet: Sheet,
  t: ReturnType<typeof useTranslations<"travelData">>,
  remindTitle: (step: TravelRemindStep) => string,
): string {
  switch (sheet.kind) {
    case "withdraw":
      return t("revoke.title");
    case "close":
      return t("close.title");
    case "menu":
      return t("mine.menu", { purpose: sheet.request.purpose });
    case "add":
      return t("addPeople.title");
    case "remove":
      return sheet.person
        ? t("removePerson.confirmTitle", { name: sheet.person.name })
        : t("removePerson.title");
    case "remind":
      return remindTitle(sheet.step);
    case "reauth":
      return t("reauth.title");
  }
}

function CloseHint({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <button type="button" className={styles.copy} aria-label={label} onClick={onClose}>
      <Icon name="close" size={20} />
    </button>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Requests to me (W20 H.6)                                                                    */
/* ------------------------------------------------------------------------------------------ */

function ToMeCardView({
  card,
  model,
  art,
  fresh,
  primary,
  offline,
  datesHint,
  onDecline,
  onUndoDecline,
  onWithdraw,
  onDismiss,
}: {
  card: ToMeCard;
  model: TravelPageModel;
  art: Art;
  fresh: boolean;
  primary: boolean;
  offline: boolean;
  datesHint: (() => void) | null;
  onDecline: () => void;
  onUndoDecline: () => void;
  onWithdraw: () => void;
  onDismiss: () => void;
}) {
  const t = useTranslations("travelData");
  const titleId = `td-card-${card.requestId}`;
  const answerHref = `${model.newHref.replace(/\/new$/, "")}/${card.requestId}`;
  const head = (
    <div className={styles.cardHead}>
      <Avatar id={card.byKey} name={card.byName} size="sm" />
      <strong>{card.byName}</strong>
      {card.byIsBooker ? <BookerChip label={t("chip")} large /> : null}
      <span className={cx(styles.small, styles.cardHeadEnd)}>{card.askedOn}</span>
    </div>
  );

  if (card.state === "expired") {
    const text =
      card.expiredReason === "closedByBooker"
        ? t("expiredCard.closedByBooker", { name: card.byName })
        : card.expiredReason === "bookerRevoked"
          ? t("expiredCard.bookerRevoked", { name: card.byName, purpose: card.purpose })
          : card.expiredReason === "requesterLeft"
            ? t("expiredCard.requesterLeft", { name: card.byName })
            : card.expiredReason === "unfixed"
              ? t("expiredCard.unfixed")
              : t("expiredCard.expired", { purpose: card.purpose });
    return (
      <Banner
        tone="info"
        action={
          <button type="button" className={styles.textButton} onClick={onDismiss}>
            {t("expiredCard.hide")}
          </button>
        }
      >
        <span id={titleId} tabIndex={-1}>
          {text}
        </span>
      </Banner>
    );
  }

  if (card.state === "declined") {
    return (
      <article className={styles.card} aria-labelledby={titleId} data-travel-card="declined">
        {head}
        <h3 id={titleId} className={styles.h3} tabIndex={-1}>
          {t("declinedCard.title", { name: card.byName })}
        </h3>
        <p className={styles.muted}>
          {t("declinedCard.text", { purpose: card.purpose, name: card.byName })}
        </p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="md"
            aria-disabled={offline || undefined}
            onClick={onUndoDecline}
          >
            {t("declinedCard.undo")}
          </Button>
        </div>
      </article>
    );
  }

  if (card.state === "released" && card.released) {
    const released = card.released;
    return (
      <article className={styles.card} aria-labelledby={titleId} data-travel-card="released">
        {datesHint ? (
          <Banner
            tone="info"
            role="status"
            action={<CloseHint label={t("closeHint")} onClose={datesHint} />}
          >
            {t("datesChanged.member", { date: model.deleteOn })}
          </Banner>
        ) : null}
        <div className={styles.withSeal}>
          {fresh ? art.sealPop : art.seal40}
          <h3 id={titleId} className={styles.h3} tabIndex={-1}>
            {t("released.title", { name: card.byName })}
          </h3>
        </div>
        <p className={styles.muted}>
          {t("released.meta", { purpose: card.purpose, date: released.on })}
        </p>
        <OwnValues card={card} publicId={model.publicId} offline={offline} />
        {released.expiresBeforeReturn ? (
          <div className={styles.warn}>
            <Icon name="clock" size={18} />
            <p>
              {released.expired
                ? t("released.expiredDoc")
                : t("released.expiresSoon", { date: released.expiresBeforeReturn })}
            </p>
          </div>
        ) : null}
        <DeleteLine>{t("released.deleteOn", { date: model.deleteOn })}</DeleteLine>
        <AccessLog lines={released.access} name={card.byName} />
        <div className={styles.actions}>
          <Link
            className={buttonClassName({ variant: "secondary", size: "sm" })}
            href={`${answerHref}?change=1`}
            aria-disabled={offline || undefined}
          >
            <Icon name="edit" size={16} />
            <span>{t("released.change")}</span>
          </Link>
          <button
            type="button"
            className={cx(styles.textButton, styles.quiet)}
            onClick={onWithdraw}
            aria-haspopup="dialog"
          >
            <Icon name="trash" size={16} />
            <span>{t("released.withdraw")}</span>
          </button>
        </div>
      </article>
    );
  }

  // A – open
  return (
    <article className={styles.card} aria-labelledby={titleId} data-travel-card="open">
      {head}
      <h3 id={titleId} className={styles.h3} tabIndex={-1}>
        {t("member.asks", { name: card.byName, purpose: card.purpose })}
      </h3>
      <p className={styles.muted}>{t("member.asksFor", { name: card.byName })}</p>
      <ul className={styles.list}>
        {card.fields.map((field) => (
          <li key={field}>{t(`fields.${field}`)}</li>
        ))}
      </ul>
      {card.fields.includes("document") ? (
        <p className={styles.keyNote}>
          <Icon name="key" size={16} />
          <span>{t("member.docNote", { name: card.byName })}</span>
        </p>
      ) : null}
      {card.afterTrip ? (
        <p className={styles.small}>{t("member.afterTrip", { name: card.byName })}</p>
      ) : null}
      <ShieldBox title={t("member.onlyFor", { name: card.byName, date: model.deleteOn })} />
      <div className={styles.footer}>
        <Link
          className={buttonClassName({
            variant: primary ? "primary" : "secondary",
            size: "lg",
            block: true,
          })}
          href={answerHref}
        >
          <span>{t("member.enter")}</span>
        </Link>
        <button
          type="button"
          className={styles.textButton}
          onClick={onDecline}
          aria-disabled={offline || undefined}
        >
          {t("decline", { name: card.byName })}
        </button>
      </div>
    </article>
  );
}

function OwnValues({
  card,
  publicId,
  offline,
}: {
  card: ToMeCard;
  publicId: string;
  offline: boolean;
}) {
  const t = useTranslations("travelData");
  const [document, setDocument] = useState<string | null>(null);
  const values = card.released?.values ?? [];
  return (
    <dl className={styles.values}>
      {values.map((v) => (
        <div key={v.field}>
          <dt>{t(`values.${v.field}`)}</dt>
          <dd>
            {v.masked ? (
              document ? (
                <span className={styles.value}>{document}</span>
              ) : (
                <span className={styles.compact}>
                  <span className={styles.mask} aria-hidden="true">
                    {v.value}
                  </span>
                  <span className="visually-hidden">{t("hidden")}</span>
                  <button
                    type="button"
                    className={styles.textButton}
                    aria-disabled={offline || undefined}
                    onClick={() => {
                      if (offline) return;
                      void ownDocumentAction(publicId, card.requestId).then((result) => {
                        if (result.ok) setDocument(result.value);
                      });
                    }}
                  >
                    <Icon name="eye" size={16} />
                    <span>{t("reveal")}</span>
                  </button>
                </span>
              )
            ) : (
              v.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AccessLog({ lines, name }: { lines: AccessLine[]; name: string }) {
  const t = useTranslations("travelData");
  const [all, setAll] = useState(false);
  const id = useId();
  const visible = all ? lines : lines.slice(0, 5);
  return (
    <section className={styles.stack} aria-labelledby={`${id}-log`}>
      <h4 id={`${id}-log`} className={cx(styles.h4, styles.logHead)}>
        <Icon name="history" size={18} />
        <span>{t("log.title")}</span>
      </h4>
      <ul className={styles.log} id={`${id}-list`} data-travel-log="">
        {lines.length === 0 ? (
          <li>
            <span className={styles.logIcon} aria-hidden="true">
              <Icon name="history" size={16} />
            </span>
            <span className={styles.muted}>{t("log.empty", { name })}</span>
          </li>
        ) : (
          visible.map((line) => {
            const field = line.field ? t(`values.${line.field}`) : "";
            return (
              <li key={`${line.action}-${line.field ?? ""}-${line.when}`}>
                <span className={styles.logIcon} aria-hidden="true">
                  <Icon name={line.action === "view" ? "eye" : "copy"} size={16} />
                </span>
                <span>
                  {line.action === "view"
                    ? line.count > 1
                      ? t("log.viewedMany", { name, count: line.count, when: line.when })
                      : t("log.viewed", { name, when: line.when })
                    : line.count > 1
                      ? t("log.copiedMany", { name, field, count: line.count, when: line.when })
                      : t("log.copied", { name, field, when: line.when })}
                </span>
              </li>
            );
          })
        )}
      </ul>
      {lines.length > 5 ? (
        <button
          type="button"
          className={styles.textButton}
          aria-expanded={all}
          aria-controls={`${id}-list`}
          onClick={() => {
            setAll(!all);
          }}
        >
          <span>{t("log.showAll")}</span>
          <Icon name="chevron-down" size={16} />
        </button>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* «Bucht»: own requests (W20 H.7)                                                             */
/* ------------------------------------------------------------------------------------------ */

function OwnRequestView({
  request,
  model,
  offline,
  onMenu,
  onAddNew,
  onClose,
  onRemind,
  onReauth,
}: {
  request: OwnRequest;
  model: TravelPageModel;
  offline: boolean;
  onMenu: () => void;
  onAddNew: () => void;
  onClose: () => void;
  onRemind: () => void;
  onReauth: (retry: () => void) => void;
}) {
  const t = useTranslations("travelData");
  const titleId = `td-req-${request.requestId}`;
  const remindable = model.remind?.requests.some((r) => r.requestId === request.requestId);
  const percent = request.total > 0 ? Math.round((request.released / request.total) * 100) : 0;
  return (
    <div className={styles.section} data-travel-request={request.requestId}>
      <article className={styles.card} aria-labelledby={titleId}>
        <div className={styles.cardHead}>
          <p className={styles.eyebrow}>{t("mine.header", { date: request.askedOn })}</p>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={t("mine.menu", { purpose: request.purpose })}
            aria-haspopup="dialog"
            onClick={onMenu}
          >
            <Icon name="more" size={22} />
          </button>
        </div>
        <h3 id={titleId} className={styles.h3} tabIndex={-1}>
          {request.purpose}
        </h3>
        <p className={styles.muted}>
          {request.hasDocument ? <Icon name="key" size={14} /> : null}{" "}
          {request.fields.map((f) => t(`fields.${f}`)).join(" · ")}
        </p>
        <p className={styles.count}>
          {t("mine.count", { released: request.released, total: request.total })}
        </p>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ width: `${String(percent)}%` }} />
        </div>
        <DeleteLine>{t("mine.deleteOn", { date: model.deleteOn })}</DeleteLine>
      </article>
      <ul className={styles.persons}>
        {request.persons.map((person) => (
          <PersonCardView
            key={person.recipientId}
            person={person}
            request={request}
            publicId={model.publicId}
            offline={offline}
            onReauth={onReauth}
          />
        ))}
      </ul>
      {request.newMembers.length > 0 ? (
        <p className={styles.compact}>
          <span className={styles.muted}>
            {t("mine.newMembers", { names: request.newMembers.map((m) => m.name).join(", ") })}
          </span>
          <button type="button" className={styles.textButton} onClick={onAddNew}>
            {t("mine.addNew")}
          </button>
        </p>
      ) : null}
      <div className={styles.actions}>
        {remindable ? (
          <Button
            variant="secondary"
            size="md"
            icon="remind"
            aria-label={t("mine.remindName", { purpose: request.purpose })}
            aria-haspopup="dialog"
            aria-disabled={offline || undefined}
            onClick={onRemind}
          >
            {t("mine.remind")}
          </Button>
        ) : null}
        {request.allAnswered ? (
          <Button variant="secondary" size="md" aria-haspopup="dialog" onClick={onClose}>
            {t("mine.closeAll")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

const STATE_LABEL = {
  released: "status.released",
  open: "status.open",
  declined: "status.declined",
  placeholder: "status.placeholder",
} as const;

function PersonCardView({
  person,
  request,
  publicId,
  offline,
  onReauth,
}: {
  person: PersonCard;
  request: OwnRequest;
  publicId: string;
  offline: boolean;
  onReauth: (retry: () => void) => void;
}) {
  const t = useTranslations("travelData");
  const toast = useToast();
  const router = useRouter();
  const [values, setValues] = useState<Partial<Record<CopyField, string>> | null>(null);
  const [copied, setCopied] = useState<CopyField | null>(null);
  const [announce, setAnnounce] = useState("");
  const headId = `td-person-${person.recipientId}`;

  // Leaving the tab/app hides the values again – tapping again logs again (W20 H.7).
  useEffect(() => {
    if (!values) return;
    const hide = () => {
      if (document.visibilityState === "hidden") setValues(null);
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
    };
  }, [values]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(null);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const failed = (error: TravelActionError, retry: () => void) => {
    if (error === "reauth") {
      onReauth(retry);
      return;
    }
    if (
      error === "notBooker" ||
      error === "notAllowed" ||
      error === "expired" ||
      error === "gone"
    ) {
      toast({ message: t("loadFailed") });
      router.refresh();
      return;
    }
    toast({ message: error === "limited" ? t("limited") : t("loadFailed") });
  };

  const reveal = () => {
    if (offline) {
      toast({ message: t("offline") });
      return;
    }
    if (values) {
      setValues(null);
      setAnnounce(t("hiddenAnnounce", { name: person.name }));
      return;
    }
    void revealAction(publicId, request.requestId, person.recipientId)
      .then((result) => {
        if (result.ok) {
          setValues(result.values);
          setAnnounce(t("shown", { name: person.name }));
        } else failed(result.error, reveal);
      })
      .catch(() => {
        toast({ message: t("loadFailed") });
      });
  };

  const copy = (field: CopyField) => {
    if (offline) {
      toast({ message: t("offline") });
      return;
    }
    const fetchValue = async (): Promise<string | null> => {
      const result = await copyAction(publicId, request.requestId, person.recipientId, field);
      if (result.ok) return result.value;
      failed(result.error, () => {
        copy(field);
      });
      return null;
    };
    void (async () => {
      let ok = false;
      // Safari keeps the user gesture only for a ClipboardItem with a pending promise.
      if (
        typeof ClipboardItem !== "undefined" &&
        window.isSecureContext &&
        typeof navigator.clipboard.write === "function"
      ) {
        const holder: { value: string | null } = { value: null };
        try {
          const blob = fetchValue().then((v) => {
            holder.value = v;
            if (v === null) throw new Error("no value");
            return new Blob([v], { type: "text/plain" });
          });
          await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
          ok = true;
        } catch {
          if (holder.value !== null) ok = await copyText(holder.value);
          else return;
        }
      } else {
        const value = await fetchValue();
        if (value === null) return;
        ok = await copyText(value);
      }
      if (ok) {
        setCopied(field);
        toast({ message: t("copied") });
      } else toast({ message: t("copyBlocked") });
    })();
  };

  if (person.state !== "released") {
    return (
      <li className={styles.person} data-travel-person={person.state}>
        <div className={styles.personHead}>
          <Avatar id={person.key} name={person.name} size="sm" />
          <h4 id={headId} className={styles.h4}>
            {person.name}
          </h4>
          {person.isBooker ? <BookerChip label={t("chip")} /> : null}
          <span className={styles.cardHeadEnd}>
            <StatusChip state={person.state} label={t(STATE_LABEL[person.state])} />
          </span>
        </div>
        {person.state === "placeholder" ? (
          <p className={styles.small}>{t("mine.placeholderInfo", { name: person.name })}</p>
        ) : null}
      </li>
    );
  }

  const fields = Object.keys(person.masks ?? {}) as CopyField[];
  return (
    <li className={styles.person} data-travel-person="released" data-revealed={values !== null}>
      <div className={styles.personHead}>
        <Avatar id={person.key} name={person.name} size="sm" />
        <h4 id={headId} className={styles.h4}>
          {person.name}
        </h4>
        {person.isBooker ? <BookerChip label={t("chip")} /> : null}
        <span className={cx(styles.cardHeadEnd, styles.compact)}>
          {values ? (
            <span className={styles.visible}>
              <Icon name="eye" size={14} />
              <span>{t("visibleTag")}</span>
            </span>
          ) : null}
          <StatusChip state="released" label={t("status.released")} />
        </span>
      </div>
      <dl className={styles.fields}>
        {fields.map((field) => {
          const shown = values?.[field];
          const label = t(`values.${field}`);
          return (
            <div key={field}>
              <dt>{label}</dt>
              <dd>
                {shown !== undefined ? (
                  <span className={styles.value} data-travel-value="">
                    {shown}
                  </span>
                ) : (
                  <>
                    <span className={styles.mask} aria-hidden="true" data-travel-mask="">
                      {person.masks?.[field]}
                    </span>
                    <span className="visually-hidden">{t("hidden")}</span>
                  </>
                )}
              </dd>
              <dd>
                <button
                  type="button"
                  className={cx(styles.copy, copied === field && styles.copyDone)}
                  aria-label={t("copy", { field: label, name: person.name })}
                  aria-disabled={offline || undefined}
                  onClick={() => {
                    copy(field);
                  }}
                >
                  <Icon name={copied === field ? "check" : "copy"} size={20} />
                </button>
              </dd>
            </div>
          );
        })}
      </dl>
      <div className={styles.personFoot}>
        <Button
          variant="secondary"
          size="sm"
          icon={values ? "eye-off" : "eye"}
          aria-pressed={values !== null}
          aria-label={
            values ? t("hideName", { name: person.name }) : t("revealName", { name: person.name })
          }
          aria-disabled={offline || undefined}
          onClick={reveal}
        >
          {values ? t("hide") : t("reveal")}
        </Button>
        {person.changedOn ? (
          <span className={styles.small}>{t("mine.changedOn", { date: person.changedOn })}</span>
        ) : null}
      </div>
      <span className="visually-hidden" aria-live="polite">
        {announce}
      </span>
    </li>
  );
}

function CountCardView({ card }: { card: CountCard }) {
  const t = useTranslations("travelData");
  const id = `td-count-${card.requestId}`;
  return (
    <article className={styles.card} aria-labelledby={id} data-travel-count="">
      <h3 id={id} className={styles.h3}>
        {t("others.card", { name: card.byName, purpose: card.purpose })}
      </h3>
      <p className={styles.count}>
        {t("mine.count", { released: card.released, total: card.total })}
      </p>
      <ul className={styles.statusList}>
        {card.persons.map((p) => (
          <li key={p.key}>
            <Avatar id={p.key} name={p.name} size="sm" />
            <span>{p.name}</span>
            <StatusChip state={p.state} label={t(STATE_LABEL[p.state])} />
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Sheets                                                                                      */
/* ------------------------------------------------------------------------------------------ */

function SheetBody({
  sheet,
  model,
  busy,
  email,
  onCancel,
  onSheet,
  onWithdraw,
  onCloseRequest,
  onAdd,
  onRemove,
}: {
  sheet: Sheet;
  model: TravelPageModel;
  busy: boolean;
  email: string;
  onCancel: () => void;
  onSheet: (sheet: Sheet) => void;
  onWithdraw: (card: ToMeCard) => void;
  onCloseRequest: (request: OwnRequest) => void;
  onAdd: (request: OwnRequest, users: string[], placeholders: string[]) => void;
  onRemove: (request: OwnRequest, person: PersonCard) => void;
}) {
  const t = useTranslations("travelData");
  const tCommon = useTranslations("common");
  switch (sheet.kind) {
    case "withdraw":
      return (
        <div className={styles.stack}>
          <p className={styles.text}>{t("revoke.body", { name: sheet.card.byName })}</p>
          <div className={styles.actions}>
            <Button variant="secondary" size="md" data-autofocus="" onClick={onCancel}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={busy}
              onClick={() => {
                onWithdraw(sheet.card);
              }}
            >
              {t("revoke.confirm")}
            </Button>
          </div>
        </div>
      );
    case "close":
      return (
        <div className={styles.stack}>
          <p className={styles.text}>{t("close.body", { purpose: sheet.request.purpose })}</p>
          <div className={styles.actions}>
            <Button variant="secondary" size="md" data-autofocus="" onClick={onCancel}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={busy}
              onClick={() => {
                onCloseRequest(sheet.request);
              }}
            >
              {t("close.confirm")}
            </Button>
          </div>
        </div>
      );
    case "menu":
      return (
        <div className={styles.stack}>
          <ul className={styles.sheetMenu}>
            {sheet.request.addable.length > 0 ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSheet({ kind: "add", request: sheet.request, preselect: [] });
                  }}
                >
                  <Icon name="plus" size={20} />
                  <span>{t("mine.addPeople")}</span>
                </button>
              </li>
            ) : null}
            {sheet.request.persons.length > 0 ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSheet({ kind: "remove", request: sheet.request });
                  }}
                >
                  <Icon name="user" size={20} />
                  <span>{t("mine.removePerson")}</span>
                </button>
              </li>
            ) : null}
            <li>
              <button
                type="button"
                onClick={() => {
                  onSheet({ kind: "close", request: sheet.request });
                }}
              >
                <Icon name="trash" size={20} />
                <span>{t("mine.close")}</span>
              </button>
            </li>
          </ul>
          <p className={styles.small}>{t("mine.noEdit")}</p>
        </div>
      );
    case "add":
      return (
        <AddPeople
          key={sheet.request.requestId}
          request={sheet.request}
          preselect={sheet.preselect}
          busy={busy}
          onAdd={onAdd}
        />
      );
    case "remove":
      if (sheet.person) {
        const person = sheet.person;
        return (
          <div className={styles.stack}>
            {person.state === "released" ? (
              <p className={styles.text}>{t("removePerson.body")}</p>
            ) : null}
            <div className={styles.actions}>
              <Button variant="secondary" size="md" data-autofocus="" onClick={onCancel}>
                {tCommon("cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={busy}
                onClick={() => {
                  onRemove(sheet.request, person);
                }}
              >
                {t("removePerson.confirm")}
              </Button>
            </div>
          </div>
        );
      }
      return (
        <ul className={styles.sheetMenu}>
          {sheet.request.persons.map((person) => (
            <li key={person.recipientId}>
              <button
                type="button"
                onClick={() => {
                  onSheet({ kind: "remove", request: sheet.request, person });
                }}
              >
                <Avatar id={person.key} name={person.name} size="sm" />
                <span>{person.name}</span>
                <StatusChip state={person.state} label={t(STATE_LABEL[person.state])} />
              </button>
            </li>
          ))}
        </ul>
      );
    case "remind":
      return model.remind ? (
        <TravelRemindBody
          data={model.remind}
          step={sheet.step}
          onStep={(step) => {
            onSheet({ kind: "remind", step });
          }}
        />
      ) : null;
    case "reauth":
      return (
        <TravelReauth
          email={email}
          onConfirmed={() => {
            onCancel();
            sheet.retry();
          }}
        />
      );
  }
}

function AddPeople({
  request,
  preselect,
  busy,
  onAdd,
}: {
  request: OwnRequest;
  preselect: string[];
  busy: boolean;
  onAdd: (request: OwnRequest, users: string[], placeholders: string[]) => void;
}) {
  const t = useTranslations("travelData");
  const [picked, setPicked] = useState<Set<string>>(new Set(preselect));
  const [error, setError] = useState(false);
  return (
    <form
      className={styles.stack}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (picked.size === 0) {
          setError(true);
          return;
        }
        const users = request.addable.filter((p) => !p.placeholder && picked.has(p.key));
        const placeholders = request.addable.filter((p) => p.placeholder && picked.has(p.key));
        onAdd(
          request,
          users.map((p) => p.key),
          placeholders.map((p) => p.key),
        );
      }}
    >
      <ul className={styles.peopleChips}>
        {request.addable.map((p) => (
          <li key={p.key}>
            <button
              type="button"
              className={styles.personChip}
              aria-pressed={picked.has(p.key)}
              onClick={() => {
                setError(false);
                setPicked((prev) => {
                  const next = new Set(prev);
                  if (next.has(p.key)) next.delete(p.key);
                  else next.add(p.key);
                  return next;
                });
              }}
            >
              <Avatar id={p.key} name={p.name} size="sm" />
              <span>{p.name}</span>
              {p.placeholder ? (
                <span className={styles.chipSub}>{t("request.afterJoin")}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p className={styles.error} role="alert">
          <Icon name="warning" size={16} />
          <span>{t("request.whoError")}</span>
        </p>
      ) : null}
      <Button type="submit" size="md" loading={busy}>
        {t("addPeople.submit")}
      </Button>
    </form>
  );
}
