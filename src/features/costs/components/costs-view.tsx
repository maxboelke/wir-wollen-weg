"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SealMotion } from "@/components/seal-motion";
import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Chip } from "@/components/ui/chip";
import { Icon, type IconName } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { SharePanel } from "@/features/trips/components/share-panel";
import { costsPath } from "@/features/trips/paths";
import type { Locale } from "@/i18n/config";
import { formatExact } from "@/lib/costs";
import { cx } from "@/lib/cx";
import { formatDate } from "@/lib/dates";
import { animate, DURATION, EASING, prefersReducedMotion } from "@/lib/motion";
import {
  closeCostsAction,
  deleteExpenseAction,
  markSettlementAction,
  restoreExpenseAction,
  undoSettlementAction,
} from "../actions";
import {
  balancesFor,
  dayGroups,
  personLabel,
  proposalFor,
  rowKey,
  settleSections,
  shortNames,
  standOf,
  type EffectiveSettlement,
  type StandNumbers,
} from "../derive";
import type { CostExpenseView, CostPersonView, CostsModel } from "../load";
import type { CostRemindData } from "../remind-types";
import { CloseCostsBody } from "./close-costs";
import {
  CostRemindBody,
  firstCostStep,
  useCostRemindTitle,
  type CostRemindStep,
} from "./cost-remind";
import { CurrencySheet } from "./currency-sheet";
import { CopyButton } from "./copy-button";
import { IbanLine } from "./iban";
import { PayInfoCard } from "./pay-info";
import styles from "./costs.module.css";

const CATEGORY_ICON: Record<string, IconName> = {
  accommodation: "bed",
  travel: "car",
  food: "food",
  activities: "ticket",
  other: "tag",
};

/** Transfer marked in THIS view (W19-A `recentlyPaid`) – stays at its place until unmount. */
interface RecentRow {
  key: string;
  from: string;
  to: string;
  cents: number;
  section: "mine" | "orga";
  index: number;
  /** Temporary id until the server answered, then the settlement id. */
  id: string;
}

type Sheet =
  | { kind: "detail"; id: string }
  | { kind: "remind"; step: CostRemindStep }
  | { kind: "close" }
  | { kind: "currency" }
  | { kind: "share" };

export interface CostsShare {
  link: string;
  texts: Record<Locale, string>;
  defaultLocale: Locale;
  tripName: string;
}

interface CostsViewProps {
  model: CostsModel;
  view: "list" | "balances";
  remind: CostRemindData | null;
  /** W19-09: id of the expense saved just before (tint once). */
  freshId: string | null;
  /** «Übersicht teilen» on `/balances` (W19 E.5 block 8) – null without expenses. */
  share: CostsShare | null;
  sealSmall: ReactNode;
  sealLarge: ReactNode;
  emptyIllustration: ReactNode;
}

type Name = (key: string, options?: { inline?: boolean; you?: boolean }) => string;

/** Text cross-fade W19-01 (0,35 → 1, 140 ms) – only when the text really changed. */
function useTextFade<T extends HTMLElement>(text: string) {
  const ref = useRef<T>(null);
  const last = useRef(text);
  useLayoutEffect(() => {
    if (last.current === text) return;
    last.current = text;
    animate(ref.current, [{ opacity: 0.35 }, { opacity: 1 }], {
      duration: DURATION.fade,
      easing: EASING.standard,
    });
  }, [text]);
  return ref;
}

const SEEN_KEY = "ww-costs-seen";
const SEEN_EVENT = "ww-costs-seen";

function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseSeen(raw: string): ReadonlySet<string> {
  try {
    return new Set<string>(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function subscribeSeen(onChange: () => void) {
  window.addEventListener(SEEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SEEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * «Kosten» `/costs` and «Ausgleichen» `/costs/balances` (W19 E, v2 after the client's feedback):
 * three levels, three questions, visibly separated – «Dein Stand» (me, tinted card, one
 * sentence + «So rechnen wir» on demand) · «Ausgaben der Gruppe» (neutral list) · «Ausgleichen»
 * (own page: own transfers in detail, the others' compact and folded, with amounts). Deleting
 * and marking are optimistic (with undo); balances and the proposal are recomputed in the
 * client with the server's pure functions. ≥ 960 px: `/costs` two columns.
 */
export function CostsView({
  model,
  view,
  remind,
  freshId,
  share,
  sealSmall,
  sealLarge,
  emptyIllustration,
}: CostsViewProps) {
  const t = useTranslations("costs");
  const tb = useTranslations("balances");
  const tCommon = useTranslations("common");
  const tClose = useTranslations("closeCosts");
  const router = useRouter();
  const toast = useToast();
  const { intl, currency, me } = model;
  const closed = model.closed !== null;

  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const [added, setAdded] = useState<EffectiveSettlement[]>([]);
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set());
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [banner, setBanner] = useState<{ text: string; retry?: () => void } | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [lastSheet, setLastSheet] = useState<Sheet>({ kind: "close" });
  const [showAll, setShowAll] = useState(false);
  const [moment, setMoment] = useState<"none" | "me" | "all">("none");
  const [pending, setPending] = useState(false);
  const seenRaw = useSyncExternalStore(subscribeSeen, readSeen, () => null);
  const seen = useMemo(() => (seenRaw === null ? null : parseSeen(seenRaw)), [seenRaw]);
  const focusAfter = useRef<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const shown = sheet ?? lastSheet;

  const money = useCallback(
    (cents: number) => formatExact(cents, currency, intl),
    [currency, intl],
  );
  const byKey = useMemo(() => new Map(model.people.map((p) => [p.key, p])), [model.people]);
  const name = useCallback<Name>(
    (key, options = {}) =>
      personLabel(byKey.get(key), t as unknown as Parameters<typeof personLabel>[1], options),
    [byKey, t],
  );

  // Effective data = server data ± optimistic steps (until the refresh brings the truth).
  const expenses = useMemo(
    () => model.expenses.filter((e) => !deleted.has(e.id)),
    [model.expenses, deleted],
  );
  const serverIds = useMemo(() => new Set(model.settlements.map((s) => s.id)), [model.settlements]);
  const settlements = useMemo<EffectiveSettlement[]>(
    () => [
      ...model.settlements.filter((s) => !removed.has(s.id)),
      ...added.filter((a) => !serverIds.has(a.id)),
    ],
    [model.settlements, removed, added, serverIds],
  );
  const balances = useMemo(
    () => balancesFor(model, expenses, settlements),
    [model, expenses, settlements],
  );
  const proposal = useMemo(() => proposalFor(model, balances), [model, balances]);
  const stand = standOf(me, expenses, settlements);
  const allSettled = [...balances.values()].every((v) => v === 0);
  const total = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const sections = useMemo(
    () => settleSections(proposal, me, model.people),
    [proposal, me, model.people],
  );

  useLayoutEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    document.querySelector<HTMLElement>(target)?.focus();
  });

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const showBanner = useCallback((text: string, retry?: () => void) => {
    setBanner(retry ? { text, retry } : { text });
    requestAnimationFrame(() => bannerRef.current?.focus());
  }, []);

  const errorText = useCallback(
    (error: string) =>
      error === "changed" || error === "gone" || error === "conflict"
        ? t("changed")
        : error === "closed"
          ? t("closed.redirect")
          : error === "limited"
            ? t("limited")
            : t("error"),
    [t],
  );

  /* ---------------- delete / restore (W19-10) ---------------- */
  // Strg/Cmd+Z undoes the last delete while its snackbar is up (D.4.3).
  const undoRef = useRef<{ until: number; run: () => void } | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      const undo = undoRef.current;
      if (!undo || Date.now() > undo.until) return;
      event.preventDefault();
      undoRef.current = null;
      undo.run();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function unhide(id: string) {
    setDeleted((set) => {
      const copy = new Set(set);
      copy.delete(id);
      return copy;
    });
  }

  function remove(expense: CostExpenseView) {
    setSheet(null);
    // W19-10: the row fades out (opacity + scale only) while the sheet closes, then goes.
    const element = document.querySelector(`[data-expense-row="${CSS.escape(expense.id)}"]`);
    const exit = animate(
      element,
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "scale(0.98)" },
      ],
      { duration: DURATION.fast, delay: 120, easing: EASING.exit, fill: "forwards" },
    );
    const hide = () => {
      setDeleted((set) => new Set(set).add(expense.id));
    };
    if (exit) {
      exit.onfinish = () => {
        hide();
        exit.cancel();
      };
    } else {
      hide();
    }
    // Focus: the next row, otherwise the list heading (D.4.3).
    const rows = [...document.querySelectorAll<HTMLElement>("[data-expense-row]")];
    const index = rows.findIndex((el) => el.dataset.expenseRow === expense.id);
    const next = rows[index + 1] ?? rows[index - 1];
    focusAfter.current = next
      ? `[data-expense-row="${next.dataset.expenseRow ?? ""}"]`
      : "#costs-title";
    const restore = () => {
      unhide(expense.id);
      void restoreExpenseAction(model.publicId, expense.id).then((result) => {
        if (!result.ok) showBanner(errorText(result.error));
        refresh();
      });
    };
    void deleteExpenseAction(model.publicId, expense.id, expense.version)
      .then((result) => {
        if (result.ok) {
          undoRef.current = { until: Date.now() + 6000, run: restore };
          toast({
            message: t("deleted", { title: expense.title }),
            action: { label: t("undo"), onAction: restore },
          });
          refresh();
        } else {
          unhide(expense.id);
          showBanner(errorText(result.error));
          refresh();
        }
      })
      .catch(() => {
        unhide(expense.id);
        showBanner(t("error"));
      });
  }

  /* ---------------- mark / take back (W19-02 … W19-08, E.5) ---------------- */
  function markedText(tr: { from: string; to: string; cents: number }): string {
    const amount = money(tr.cents);
    if (tr.from === me) return tb("markedOut", { name: name(tr.to, { inline: true }), amount });
    if (tr.to === me) return tb("markedIn", { name: name(tr.from, { inline: true }), amount });
    return tb("markedOrga", { from: name(tr.from), to: name(tr.to, { inline: true }), amount });
  }

  function mark(tr: { from: string; to: string; cents: number }, section: RecentRow["section"]) {
    const temp = `tmp-${String(Date.now())}-${String(Math.random()).slice(2, 8)}`;
    const key = rowKey(tr);
    const beforeMine = balances.get(me) ?? 0;
    const list = section === "mine" ? [...sections.out, ...sections.in] : sections.orga;
    const index = Math.max(
      0,
      list.findIndex((x) => rowKey(x) === key),
    );
    setAdded((rows) => [...rows, { id: temp, ...tr }]);
    setRecent((rows) => [...rows, { key, ...tr, section, index, id: temp }]);
    focusAfter.current = `[data-undo-row="${CSS.escape(key)}"]`;
    const after = balancesFor(model, expenses, [...settlements, { id: temp, ...tr }]);
    const nowAllSettled = [...after.values()].every((v) => v === 0);
    const message = markedText(tr);
    void markSettlementAction(model.publicId, tr.from, tr.to, tr.cents)
      .then((result) => {
        if (result.ok) {
          setAdded((rows) => rows.map((a) => (a.id === temp ? { ...a, id: result.id } : a)));
          setRecent((rows) => rows.map((r) => (r.id === temp ? { ...r, id: result.id } : r)));
          if (nowAllSettled) setMoment("all");
          else if (beforeMine !== 0 && (after.get(me) ?? 0) === 0) setMoment("me");
          toast({
            message,
            action: {
              label: t("undo"),
              onAction: () => {
                takeBack(result.id, key);
              },
            },
          });
          refresh();
        } else {
          setAdded((rows) => rows.filter((a) => a.id !== temp));
          setRecent((rows) => rows.filter((r) => r.id !== temp));
          showBanner(errorText(result.error));
          refresh();
        }
      })
      .catch(() => {
        setAdded((rows) => rows.filter((a) => a.id !== temp));
        setRecent((rows) => rows.filter((r) => r.id !== temp));
        showBanner(t("error"), () => {
          setBanner(null);
          mark(tr, section);
        });
      });
  }

  function takeBack(id: string, key: string | null) {
    if (id.startsWith("tmp-")) return;
    const recentRow = recent.find((r) => r.id === id);
    const server = model.settlements.find((s) => s.id === id);
    const settlement = recentRow ?? server ?? added.find((a) => a.id === id);
    setRemoved((set) => new Set(set).add(id));
    setAdded((rows) => rows.filter((a) => a.id !== id));
    setRecent((rows) => rows.filter((r) => r.id !== id));
    setMoment("none");
    if (key) focusAfter.current = `[data-mark-row="${CSS.escape(key)}"]`;
    const restore = () => {
      setRemoved((set) => {
        const copy = new Set(set);
        copy.delete(id);
        return copy;
      });
    };
    void undoSettlementAction(model.publicId, id)
      .then((result) => {
        if (result.ok) {
          toast({
            message: tb("unmarked"),
            ...(settlement
              ? {
                  action: {
                    label: t("undo"),
                    onAction: () => {
                      void markSettlementAction(
                        model.publicId,
                        settlement.from,
                        settlement.to,
                        settlement.cents,
                      ).then((again) => {
                        if (!again.ok) showBanner(errorText(again.error));
                        refresh();
                      });
                    },
                  },
                }
              : {}),
          });
        } else {
          restore();
          showBanner(errorText(result.error));
        }
        refresh();
      })
      .catch(() => {
        restore();
        showBanner(t("error"));
      });
  }

  /* ---------------- close / reopen (W19-11) ---------------- */
  function setClosed(close: boolean) {
    setPending(true);
    void closeCostsAction(model.publicId, close)
      .then((result) => {
        if (result.ok) {
          setSheet(null);
          toast({
            message: tClose(close ? "done" : "reopened"),
            ...(close
              ? {}
              : {
                  action: {
                    label: t("undo"),
                    onAction: () => {
                      void closeCostsAction(model.publicId, true).then(refresh);
                    },
                  },
                }),
          });
          focusAfter.current = "#costs-title";
        } else {
          showBanner(errorText(result.error));
        }
        refresh();
      })
      .catch(() => {
        showBanner(t("error"));
      })
      .finally(() => {
        setPending(false);
      });
  }

  /* ---------------- «an dich überwiesen» (D.8.3 / E.2, M-U18) ---------------- */
  const paidToMe =
    seen === null || closed
      ? []
      : model.settlements.filter(
          (s) => s.to === me && !s.markedByMe && !seen.has(s.id) && !removed.has(s.id),
        );
  const paidToMeNames = [...new Set(paidToMe.map((s) => name(s.from)))].join(", ");
  const paidToMeCount = new Set(paidToMe.map((s) => s.from)).size;
  const paidToMeAmount = money(paidToMe.reduce((sum, s) => sum + s.cents, 0));
  const dismissPaid = () => {
    const next = new Set(seen ?? []);
    for (const s of paidToMe) next.add(s.id);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...next].slice(-500)));
    } catch {
      // storage blocked – the notice simply shows again next time
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
  };

  const detail =
    shown.kind === "detail" ? model.expenses.find((e) => e.id === shown.id) : undefined;
  const remindTitle = useCostRemindTitle(
    remind ?? {
      tripName: "",
      orgaName: "",
      defaultLocale: "en",
      mine: [],
      all: [],
      allTexts: null,
    },
  );
  const hasData = model.expenses.length > 0 || model.settlements.length > 0;
  const balancesHref = costsPath(model.publicId, "balances");
  const canClose = model.isOrganizer && !closed;

  const closedBanner = model.closed ? (
    <Banner
      tone="info"
      role="note"
      action={
        model.isOrganizer ? (
          <Button
            variant="text"
            size="sm"
            loading={pending}
            onClick={() => {
              setClosed(false);
            }}
          >
            {t("closed.reopen")}
          </Button>
        ) : null
      }
    >
      {t("closed.note", {
        orga: model.closed.byName ?? t("former"),
        date: formatDate(model.closed.on, intl, { weekday: false }),
      })}
    </Banner>
  ) : null;

  const errorBanner = banner ? (
    <div ref={bannerRef} tabIndex={-1}>
      <Banner
        tone="warning"
        role="alert"
        action={
          banner.retry ? (
            <Button variant="secondary" size="sm" onClick={banner.retry}>
              {t("retry")}
            </Button>
          ) : null
        }
      >
        {banner.text}
      </Banner>
    </div>
  ) : null;

  const standCard = hasData ? (
    <Stand
      stand={stand}
      money={money}
      closed={closed}
      allSettled={allSettled}
      othersOpen={sections.others.length + sections.orga.length}
      seal={sealSmall}
      pop={moment === "me"}
      extra={
        view === "list" ? (
          <StandListExtras
            model={model}
            stand={stand}
            allSettled={allSettled}
            othersOpen={sections.others.length + sections.orga.length}
            out={sections.out.map((x) => name(x.to, { inline: true }))}
            incoming={sections.in.map((x) => name(x.from, { inline: true }))}
            balancesHref={balancesHref}
            canClose={canClose}
            paidToMe={
              paidToMe.length > 0
                ? t("mine.paidToYou", {
                    names: paidToMeNames,
                    count: paidToMeCount,
                    amount: paidToMeAmount,
                  })
                : null
            }
          />
        ) : null
      }
    />
  ) : null;

  const sheetNode = (
    <BottomSheet
      open={sheet !== null}
      onClose={() => {
        setSheet(null);
      }}
      title={
        shown.kind === "detail"
          ? (detail?.title ?? "")
          : shown.kind === "remind"
            ? remindTitle(shown.step)
            : shown.kind === "close"
              ? tClose("title")
              : shown.kind === "share"
                ? t("shareTitle")
                : t("currency.title")
      }
      closeLabel={tCommon("close")}
      focusKey={
        shown.kind +
        (shown.kind === "detail" ? shown.id : "") +
        (shown.kind === "remind" ? (shown.step.key ?? "") : "")
      }
      back={
        shown.kind === "remind" &&
        shown.step.key &&
        remind &&
        firstCostStep(remind, "settle").key === undefined
          ? {
              label: tCommon("back"),
              onClick: () => {
                setSheet({ kind: "remind", step: { occasion: "settle" } });
              },
            }
          : undefined
      }
    >
      {shown.kind === "detail" && detail ? (
        <ExpenseDetail
          expense={detail}
          model={model}
          money={money}
          name={name}
          closed={closed}
          onDelete={() => {
            remove(detail);
          }}
        />
      ) : null}
      {shown.kind === "remind" && remind ? (
        <CostRemindBody
          data={remind}
          step={shown.step}
          onStep={(step) => {
            setSheet({ kind: "remind", step });
          }}
        />
      ) : null}
      {shown.kind === "close" ? (
        <CloseCostsBody
          open={proposal.length}
          pending={pending}
          onConfirm={() => {
            setClosed(true);
          }}
          onCancel={() => {
            setSheet(null);
          }}
        />
      ) : null}
      {shown.kind === "currency" ? (
        <CurrencySheet
          publicId={model.publicId}
          current={currency}
          locale={model.locale}
          onDone={() => {
            setSheet(null);
            refresh();
          }}
        />
      ) : null}
      {shown.kind === "share" && share ? (
        <SharePanel
          link={share.link}
          texts={share.texts}
          defaultLocale={share.defaultLocale}
          tripName={share.tripName}
        />
      ) : null}
    </BottomSheet>
  );

  if (view === "balances") {
    return (
      <>
        <div className={styles.balancesPage}>
          {errorBanner}
          {closedBanner}
          {paidToMe.length > 0 ? (
            <Banner
              tone="info"
              role="status"
              action={
                <Button variant="text" size="sm" icon="close" onClick={dismissPaid}>
                  <span className="visually-hidden">{t("paidToYouClose")}</span>
                </Button>
              }
            >
              {t("paidToYou", {
                names: paidToMeNames,
                count: paidToMeCount,
                amount: paidToMeAmount,
              })}
            </Banner>
          ) : null}
          {standCard}
          {hasData ? (
            <Settle
              model={model}
              sections={sections}
              recent={recent}
              settlements={settlements}
              stand={stand}
              allSettled={allSettled}
              closed={closed}
              money={money}
              name={name}
              moment={moment}
              sealLarge={sealLarge}
              remind={remind}
              onMark={mark}
              onTakeBack={takeBack}
              onRemind={(key) => {
                if (remind) setSheet({ kind: "remind", step: { occasion: "settle", key } });
              }}
              onClose={() => {
                setSheet({ kind: "close" });
              }}
            />
          ) : (
            <p className={styles.muted}>{t("empty.title")}</p>
          )}
          {share ? (
            <Button
              variant="text"
              size="md"
              icon="share"
              className={styles.shareButton}
              aria-haspopup="dialog"
              aria-label={tb("shareName")}
              onClick={() => {
                setSheet({ kind: "share" });
              }}
            >
              {tb("share")}
            </Button>
          ) : null}
        </div>
        {sheetNode}
      </>
    );
  }

  const groups = dayGroups(expenses);
  const shownGroups = showAll ? groups : limitGroups(groups, 100);
  const hidden = expenses.length - shownGroups.reduce((n, g) => n + g.items.length, 0);
  const activeCount = model.people.filter((p) => p.active).length;

  return (
    <>
      <div className={styles.page}>
        <div className={styles.top}>
          {errorBanner}
          {closedBanner}
          {standCard}
          {hasData && (sections.out.length > 0 || sections.in.length > 0) ? (
            <OwnCompact
              rows={[...sections.out, ...sections.in]}
              me={me}
              money={money}
              name={name}
              byKey={byKey}
            />
          ) : null}
        </div>

        <div className={styles.listCol}>
          {model.expenses.length === 0 ? (
            <Empty
              model={model}
              closed={closed}
              illustration={emptyIllustration}
              onCurrency={() => {
                setSheet({ kind: "currency" });
              }}
            />
          ) : (
            <section className={styles.groupLevel} aria-labelledby="costs-group">
              <h2 className={styles.h2} id="costs-group" tabIndex={-1}>
                {t("group.title")}
              </h2>
              <p className={styles.groupTotal}>{t("group.total", { total: money(total) })}</p>
              {shownGroups.map((group) => (
                <div key={group.date} className={styles.day}>
                  <h3 className={styles.dayHead} id={`day-${group.date}`} tabIndex={-1}>
                    {formatDate(group.date, intl, { weekday: true, year: false })}
                  </h3>
                  <ul className={styles.card}>
                    {group.items.map((e) => (
                      <li key={e.id}>
                        <ExpenseRow
                          expense={e}
                          me={me}
                          activeCount={activeCount}
                          money={money}
                          name={name}
                          fresh={e.id === freshId}
                          onOpen={() => {
                            setSheet({ kind: "detail", id: e.id });
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {hidden > 0 ? (
                <Button
                  variant="secondary"
                  size="md"
                  className={styles.more}
                  onClick={() => {
                    setShowAll(true);
                  }}
                >
                  {t("more", { count: hidden })}
                </Button>
              ) : null}
            </section>
          )}
          <p className={styles.footer}>
            {t("footer", { currency: currencyName(currency, model.locale) })}
          </p>
          {!closed && model.expenses.length > 0 ? (
            <div className={styles.actionBar}>
              <ButtonLink href={costsPath(model.publicId, "new")} icon="plus" size="lg" block>
                {t("add")}
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </div>
      {sheetNode}
    </>
  );
}

/** First page of the list (≈ 100 entries, whole days). */
function limitGroups<T extends { items: unknown[] }>(groups: T[], max: number): T[] {
  const result: T[] = [];
  let count = 0;
  for (const group of groups) {
    if (count >= max) break;
    result.push(group);
    count += group.items.length;
  }
  return result;
}

export function currencyName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Accordion button with a turning chevron (UM-27: standard accordion, reduced = instant). */
function Disclosure({
  open,
  onToggle,
  controls,
  className,
  children,
  ...rest
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  className?: string | undefined;
  children: ReactNode;
} & Record<`data-${string}`, string>) {
  return (
    <button
      type="button"
      className={cx(styles.disclosure, className)}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      {...rest}
    >
      <span>{children}</span>
      <span className={styles.chevron} aria-hidden="true">
        <Icon name="chevron-down" size={20} />
      </span>
    </button>
  );
}

/* ---------------- «Dein Stand» (W19 E.4, D-82) ---------------- */

function Stand({
  stand,
  money,
  closed,
  allSettled,
  othersOpen,
  seal,
  pop,
  extra,
}: {
  stand: StandNumbers;
  money: (cents: number) => string;
  closed: boolean;
  allSettled: boolean;
  othersOpen: number;
  seal: ReactNode;
  pop: boolean;
  extra: ReactNode;
}) {
  const t = useTranslations("costs");
  const ids = useId();
  const [calcOpen, setCalcOpen] = useState(false);
  const balance = stand.balance;
  const sentence =
    balance > 0
      ? t("mine.owed", { amount: money(balance) })
      : balance < 0
        ? t("mine.owe", { amount: money(-balance) })
        : allSettled && othersOpen === 0
          ? t("mine.allSquare")
          : t("mine.square");
  const sentenceRef = useTextFade<HTMLParagraphElement>(sentence);
  const tone = balance > 0 ? "owed" : balance < 0 ? "owe" : "square";
  return (
    <section className={cx(styles.stand, styles[`stand-${tone}`])} aria-labelledby={`${ids}-h`}>
      <h2 className={styles.eyebrow} id={`${ids}-h`}>
        {t("mine.label")}
      </h2>
      {closed ? (
        <span className={styles.closedChip}>
          <Chip icon="lock">{t("closed.chip")}</Chip>
        </span>
      ) : null}
      <div className={styles.standMain}>
        {balance === 0 ? (
          pop ? (
            <SealMotion size="sm" className={styles.standSeal}>
              {seal}
            </SealMotion>
          ) : (
            <span className={cx(styles.standSeal, styles.noSparks)} aria-hidden="true">
              {seal}
            </span>
          )
        ) : null}
        <p
          ref={sentenceRef}
          className={cx(
            styles.balanceSentence,
            balance > 0 ? styles.owed : balance < 0 ? styles.owe : styles.square,
          )}
          data-balance-sentence=""
        >
          {sentence}
        </p>
      </div>
      {extra}
      <Disclosure
        open={calcOpen}
        onToggle={() => {
          setCalcOpen((v) => !v);
        }}
        controls={`${ids}-calc`}
        className={styles.calcToggle}
      >
        {t("calc.toggle")}
      </Disclosure>
      <div id={`${ids}-calc`} className={styles.calc} hidden={!calcOpen}>
        <dl>
          <div>
            <dt>{t("calc.paid")}</dt>
            <dd>{money(stand.paid)}</dd>
          </div>
          <div>
            <dt>{t("calc.share")}</dt>
            <dd>
              <span className="visually-hidden">{`${t("calc.minus")} `}</span>
              <span aria-hidden="true">{"− "}</span>
              {money(stand.share)}
            </dd>
          </div>
          {stand.sent !== 0 ? (
            <div>
              <dt>{t("calc.sent")}</dt>
              <dd>
                <span className="visually-hidden">{`${t("calc.plus")} `}</span>
                <span aria-hidden="true">{"+ "}</span>
                {money(stand.sent)}
              </dd>
            </div>
          ) : null}
          {stand.received !== 0 ? (
            <div>
              <dt>{t("calc.received")}</dt>
              <dd>
                <span className="visually-hidden">{`${t("calc.minus")} `}</span>
                <span aria-hidden="true">{"− "}</span>
                {money(stand.received)}
              </dd>
            </div>
          ) : null}
          <div className={styles.calcSum}>
            <dt>
              <strong>
                {balance > 0 ? t("calc.owed") : balance < 0 ? t("calc.owe") : t("calc.square")}
              </strong>
            </dt>
            <dd>
              <strong>{money(Math.abs(balance))}</strong>
            </dd>
          </div>
        </dl>
        <p>{t("calc.hint")}</p>
      </div>
    </section>
  );
}

/** `/costs` only: recipients/senders, «Ausgleichen ›», the one-line «als überwiesen markiert». */
function StandListExtras({
  model,
  stand,
  allSettled,
  othersOpen,
  out,
  incoming,
  balancesHref,
  canClose,
  paidToMe,
}: {
  model: CostsModel;
  stand: StandNumbers;
  allSettled: boolean;
  othersOpen: number;
  out: string[];
  incoming: string[];
  balancesHref: string;
  canClose: boolean;
  paidToMe: string | null;
}) {
  const t = useTranslations("costs");
  const balance = stand.balance;
  let line: string | null = null;
  if (balance < 0 && out.length > 0) {
    const short = shortNames(out, model.locale);
    line =
      short.kind === "names"
        ? t("mine.to", { names: short.names })
        : t("mine.toCount", { count: short.count });
  } else if (balance > 0 && incoming.length > 0) {
    const short = shortNames(incoming, model.locale);
    line =
      short.kind === "names"
        ? t("mine.from", { names: short.names })
        : t("mine.fromCount", { count: short.count });
  } else if (balance === 0 && othersOpen > 0) {
    line = t("mine.othersOpen", { count: othersOpen });
  }
  return (
    <>
      {line ? <p className={styles.standShort}>{line}</p> : null}
      {paidToMe ? (
        <Link className={styles.textLink} href={balancesHref} data-paid-to-me="">
          {paidToMe}
          <Icon name="chevron-right" size={18} />
        </Link>
      ) : null}
      {balance !== 0 || othersOpen > 0 ? (
        <ButtonLink
          href={balancesHref}
          variant="secondary"
          size="lg"
          block
          className={styles.settleButton}
        >
          {t("mine.settle")}
          <Icon name="chevron-right" size={20} />
        </ButtonLink>
      ) : allSettled && canClose ? (
        <Link className={styles.textLink} href={`${balancesHref}#close`}>
          {t("mine.closeLink")}
          <Icon name="chevron-right" size={18} />
        </Link>
      ) : null}
    </>
  );
}

/** ≥ 960 px beside the list: own transfers, compact, without payment details (W19 E.10). */
function OwnCompact({
  rows,
  me,
  money,
  name,
  byKey,
}: {
  rows: { from: string; to: string; cents: number }[];
  me: string;
  money: (cents: number) => string;
  name: Name;
  byKey: Map<string, CostPersonView>;
}) {
  const tb = useTranslations("balances");
  return (
    <ul className={styles.ownCompact}>
      {rows.map((row) => {
        const other = row.from === me ? row.to : row.from;
        const label =
          row.from === me
            ? tb("to", { name: name(other, { inline: true }) })
            : tb("from", { name: name(other, { inline: true }) });
        return (
          <li key={rowKey(row)}>
            <PersonAvatar person={byKey.get(other)} small />
            <span className={styles.compactWho}>{label}</span>
            <span className={styles.compactAmount}>{money(row.cents)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- list ---------------- */

function ExpenseRow({
  expense,
  me,
  activeCount,
  money,
  name,
  fresh,
  onOpen,
}: {
  expense: CostExpenseView;
  me: string;
  activeCount: number;
  money: (cents: number) => string;
  name: Name;
  fresh: boolean;
  onOpen: () => void;
}) {
  const t = useTranslations("costs");
  const payer = paidText(expense.payer, me, name, t);
  const who = forText(expense, me, activeCount, name, t);
  const mine = expense.shares.find((s) => s.party === me);
  const share = mine ? t("row.share", { amount: money(mine.cents) }) : t("row.notIn");
  const icon = CATEGORY_ICON[expense.category ?? ""] ?? "receipt";
  return (
    <button
      type="button"
      className={cx(styles.row, fresh && styles.fresh)}
      data-expense-row={expense.id}
      aria-haspopup="dialog"
      aria-label={t("row.name", {
        title: expense.title,
        amount: money(expense.amountCents),
        payer,
        who,
        share,
      })}
      onClick={onOpen}
    >
      <span
        className={cx(styles.catTile, styles[`cat-${expense.category ?? "other"}`])}
        aria-hidden="true"
      >
        <Icon name={icon} size={20} />
      </span>
      <span className={styles.rowMain}>
        <span className={styles.rowTitle}>
          <span className={styles.rowTitleText}>{expense.title}</span>
          {expense.note ? <Icon name="comment" size={16} /> : null}
        </span>
        <span className={styles.rowMeta}>
          {payer}
          {" · "}
          {who}
        </span>
      </span>
      <span className={styles.rowRight}>
        <span className={styles.rowAmount}>{money(expense.amountCents)}</span>
        <span className={styles.rowShare}>{share}</span>
      </span>
    </button>
  );
}

type T = ReturnType<typeof useTranslations<"costs">>;

function paidText(payer: string, me: string, name: Name, t: T): string {
  if (payer === me) return t("row.paidMe");
  return t("row.paid", { name: name(payer) });
}

function forText(
  expense: CostExpenseView,
  me: string,
  activeCount: number,
  name: Name,
  t: T,
): string {
  const parties = expense.shares.map((s) => s.party);
  if (parties.length === 1 && parties[0] === me) return t("row.forMe");
  if (parties.length === activeCount && parties.length > 1) {
    return t("row.forAll", { count: parties.length });
  }
  if (parties.length <= 3) {
    const names = parties.map((p) => (p === me ? t("row.you") : name(p, { inline: true })));
    const list = new Intl.ListFormat(t("row.you") === "you" ? "en" : "de", {
      type: "conjunction",
    }).format(names);
    return t("row.forNames", { names: list });
  }
  return t("row.forCount", { count: parties.length });
}

function ExpenseDetail({
  expense,
  model,
  money,
  name,
  closed,
  onDelete,
}: {
  expense: CostExpenseView;
  model: CostsModel;
  money: (cents: number) => string;
  name: Name;
  closed: boolean;
  onDelete: () => void;
}) {
  const t = useTranslations("costs");
  const intl = model.intl;
  const longDate = (date: string) =>
    new Intl.DateTimeFormat(intl, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const category = expense.category
    ? t(`cat.${expense.category}` as "cat.food")
    : t("detail.noCategory");
  const created = t("detail.created", {
    name: expense.createdByName ?? t("formerInline"),
    date: formatDate(expense.createdOn, intl, { weekday: false, year: false }),
  });
  const edited = expense.edited
    ? t("detail.edited", {
        name: expense.edited.byName ?? t("formerInline"),
        date: formatDate(expense.edited.on, intl, { weekday: false, year: false }),
      })
    : null;
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  return (
    <div className={styles.sheetBody} data-expense-detail={expense.id}>
      <p className={styles.detailAmount}>{money(expense.amountCents)}</p>
      <p className={styles.muted}>
        {category}
        {" · "}
        {longDate(expense.date)}
        {" · "}
        {paidText(expense.payer, model.me, name, t)}
      </p>
      {expense.note ? <p className={styles.note}>{expense.note}</p> : null}
      <h3 className={styles.h3}>{t("detail.split")}</h3>
      <ul className={styles.splitList}>
        {expense.shares.map((s) => {
          const person = byKey.get(s.party);
          return (
            <li key={s.party} className={styles.splitItem}>
              <PersonAvatar person={person} />
              <span className={styles.splitName}>
                {name(s.party, { you: true })}
                {person?.kind === "placeholder" ? (
                  <span className={styles.tagChip}>{t("placeholder")}</span>
                ) : null}
              </span>
              <span className={styles.amount}>{money(s.cents)}</span>
            </li>
          );
        })}
      </ul>
      <p className={styles.small}>
        {expense.mode === "equal" ? t("detail.equal") : t("detail.amounts")}
        {" · "}
        {created}
        {edited ? ` · ${edited}` : ""}
      </p>
      {closed ? (
        <p className={styles.small}>{t("closed.redirect")}</p>
      ) : expense.canEdit ? (
        <div className={styles.sheetActions}>
          <Button variant="dangerQuiet" size="md" icon="trash" onClick={onDelete}>
            {t("detail.delete")}
          </Button>
          <ButtonLink
            href={costsPath(model.publicId, { edit: expense.id })}
            variant="secondary"
            size="md"
            icon="edit"
          >
            {t("detail.edit")}
          </ButtonLink>
        </div>
      ) : (
        <p className={styles.small}>
          {expense.editors.length > 0
            ? t("detail.who", { names: expense.editors.join(", ") })
            : t("detail.whoOrga")}
        </p>
      )}
    </div>
  );
}

export function PersonAvatar({
  person,
  small = false,
}: {
  person: CostPersonView | undefined;
  small?: boolean;
}) {
  if (!person || person.kind === "former") {
    return (
      <span
        className={cx(styles.formerAvatar, small && styles.formerAvatarSmall)}
        aria-hidden="true"
      >
        <Icon name="user" size={small ? 14 : 18} />
      </span>
    );
  }
  return (
    <Avatar
      id={person.avatarId}
      name={person.name ?? ""}
      size="sm"
      className={small ? styles.avatarSmall : undefined}
      open={person.kind === "placeholder"}
    />
  );
}

/* ---------------- empty ---------------- */

function Empty({
  model,
  closed,
  illustration,
  onCurrency,
}: {
  model: CostsModel;
  closed: boolean;
  illustration: ReactNode;
  onCurrency: () => void;
}) {
  const t = useTranslations("costs");
  return (
    <div className={styles.empty}>
      <span className={styles.emptyArt} aria-hidden="true">
        {illustration}
      </span>
      <h2 className={styles.h2}>{t("empty.title")}</h2>
      <p className={styles.muted}>{t("empty.text")}</p>
      {closed ? null : (
        <ButtonLink href={costsPath(model.publicId, "new")} icon="plus" size="lg">
          {t("add")}
        </ButtonLink>
      )}
      <p className={styles.currencyLine}>
        <span>
          {t("currency.line", {
            name: currencyName(model.currency, model.locale),
            code: model.currency,
          })}
        </span>
        {model.canChangeCurrency ? (
          <Button
            variant="text"
            size="sm"
            aria-label={t("currency.changeName")}
            onClick={onCurrency}
          >
            {t("currency.change")}
          </Button>
        ) : null}
      </p>
    </div>
  );
}

/* ---------------- «Ausgleichen» (W19 E.5) ---------------- */

type Transfer = { from: string; to: string; cents: number };

function Settle({
  model,
  sections,
  recent,
  settlements,
  stand,
  allSettled,
  closed,
  money,
  name,
  moment,
  sealLarge,
  remind,
  onMark,
  onTakeBack,
  onRemind,
  onClose,
}: {
  model: CostsModel;
  sections: { out: Transfer[]; in: Transfer[]; orga: Transfer[]; others: Transfer[] };
  recent: RecentRow[];
  settlements: EffectiveSettlement[];
  stand: StandNumbers;
  allSettled: boolean;
  closed: boolean;
  money: (cents: number) => string;
  name: Name;
  moment: "none" | "me" | "all";
  sealLarge: ReactNode;
  remind: CostRemindData | null;
  onMark: (tr: Transfer, section: RecentRow["section"]) => void;
  onTakeBack: (id: string, key: string | null) => void;
  onRemind: (key: string) => void;
  onClose: () => void;
}) {
  const tb = useTranslations("balances");
  const tRemind = useTranslations("remind");
  const t = useTranslations("costs");
  const tClose = useTranslations("closeCosts");
  const ids = useId();
  const { me } = model;
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  const [doneOpen, setDoneOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const settledRef = useRef<HTMLDivElement>(null);
  const out = sections.out;
  const incoming = sections.in;
  // The first own transfer is the primary button – fixed for this view (W19-02: no restyle).
  const [primaryKey] = useState(() => (out[0] ? rowKey(out[0]) : null));
  const isOrga = model.isOrganizer;

  useLayoutEffect(() => {
    if (moment !== "all") return;
    animate(
      settledRef.current,
      prefersReducedMotion()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "none" },
          ],
      { duration: DURATION.slow, easing: EASING.enter, fill: "backwards" },
    );
  }, [moment]);

  // Rows of a section + this view's marked rows at their old index (W19-A).
  const place = (list: Transfer[], section: RecentRow["section"]) => {
    const result: ({ kind: "open"; tr: Transfer } | { kind: "done"; row: RecentRow })[] = list.map(
      (tr) => ({ kind: "open" as const, tr }),
    );
    const keys = new Set(list.map(rowKey));
    for (const r of recent.filter((x) => x.section === section)) {
      if (keys.has(r.key)) continue;
      result.splice(Math.min(r.index, result.length), 0, { kind: "done", row: r });
    }
    return result;
  };
  const mineRows = place([...out, ...incoming], "mine");
  const orgaRows = isOrga ? place(sections.orga, "orga") : [];
  const recentIds = new Set(recent.map((r) => r.id));

  // Block 4 «Erledigt» – my settlements (organiser: also the rows only they mark), newest first.
  const serverById = new Map(model.settlements.map((s) => [s.id, s]));
  const doneMine = [...settlements]
    .filter((s) => {
      if (recentIds.has(s.id)) return false;
      const server = serverById.get(s.id);
      if (!server) return s.from === me || s.to === me;
      return server.mine || (isOrga && server.orgaOnly);
    })
    .reverse();
  // Block 6 – everybody else's: open rows (block 5 rows only for non-organisers) + done ones.
  const othersOpenRows = isOrga ? sections.others : [...sections.others, ...sections.orga];
  const othersDone = model.settlements
    .filter((s) => !s.mine && !(isOrga && s.orgaOnly) && settlements.some((x) => x.id === s.id))
    .reverse();
  const othersCount = othersOpenRows.length + othersDone.length;
  const openTotal = out.length + incoming.length + sections.orga.length + sections.others.length;
  const nothingOpen = openTotal === 0 && !recent.some((r) => r.section === "mine");

  const transferRow = (
    item: { kind: "open"; tr: Transfer } | { kind: "done"; row: RecentRow },
    section: RecentRow["section"],
  ) => {
    if (item.kind === "done") {
      const r = item.row;
      return (
        <li key={`done-${r.key}`} data-transfer={r.key} className={styles.transfer}>
          <TransferHead tr={r} me={me} money={money} name={name} byKey={byKey} />
          <div className={styles.transferActions}>
            <span className={styles.paidChip}>
              <Icon name="check" size={16} />
              {tb("doneChip")}
            </span>
            {closed ? null : (
              <Button
                variant="text"
                size="sm"
                data-undo-row={r.key}
                aria-label={tb("undoName", {
                  from: name(r.from, { you: true }),
                  to: name(r.to, { you: true, inline: true }),
                })}
                onClick={() => {
                  onTakeBack(r.id, r.key);
                }}
              >
                {tb("undo")}
              </Button>
            )}
          </div>
        </li>
      );
    }
    const tr = item.tr;
    const key = rowKey(tr);
    const iPay = tr.from === me;
    const toMe = tr.to === me;
    const recipient = byKey.get(tr.to);
    const debtor = byKey.get(tr.from);
    const remindRow = toMe ? remind?.mine.find((m) => m.key === tr.from) : undefined;
    if (section === "orga") {
      return (
        <li key={key} data-transfer={key} className={styles.compactRow}>
          <CompactPair tr={tr} money={money} name={name} byKey={byKey} />
          {closed ? null : (
            <Button
              variant="text"
              size="sm"
              data-mark-row={key}
              aria-label={tb("orgaDoneName", {
                from: name(tr.from),
                to: name(tr.to, { inline: true }),
              })}
              onClick={() => {
                onMark(tr, "orga");
              }}
            >
              {tb("orgaDone")}
            </Button>
          )}
        </li>
      );
    }
    return (
      <li key={key} data-transfer={key} className={styles.transfer}>
        <TransferHead tr={tr} me={me} money={money} name={name} byKey={byKey} />
        {iPay && recipient?.kind === "member" ? (
          <RecipientPay person={recipient} name={name(tr.to)} />
        ) : null}
        {closed ? null : (
          <div className={styles.transferActions}>
            <Button
              variant={iPay && key === primaryKey ? "primary" : "secondary"}
              size={iPay && key === primaryKey ? "md" : "sm"}
              icon="check"
              data-mark-row={key}
              onClick={() => {
                onMark(tr, "mine");
              }}
            >
              {toMe ? tb("received") : tb("sent")}
            </Button>
            {toMe && debtor && debtor.kind !== "former" && remindRow?.texts ? (
              <Button
                variant="text"
                size="sm"
                icon="remind"
                aria-haspopup="dialog"
                onClick={() => {
                  onRemind(tr.from);
                }}
              >
                {tb("remind", { name: name(tr.from) })}
              </Button>
            ) : toMe && debtor && remindRow?.orgaTexts && remind ? (
              // R-082: members cannot remind a placeholder – the organiser has the link.
              <Button
                variant="text"
                size="sm"
                icon="remind"
                aria-haspopup="dialog"
                aria-label={tb("nudgeOrgaName", { orga: remind.orgaName, name: name(tr.from) })}
                onClick={() => {
                  onRemind(tr.from);
                }}
              >
                {tRemind("orgaTitle", { orga: remind.orgaName })}
              </Button>
            ) : null}
          </div>
        )}
      </li>
    );
  };

  const senders = incoming.map((x) => name(x.from, { inline: true }));
  const payInfo =
    stand.balance > 0 ? (
      <PayInfoCard model={model} variant="where" senders={senders} />
    ) : (
      <PayInfoCard model={model} variant="collapsed" />
    );

  return (
    <>
      {closed ? <p className={styles.muted}>{tb("closed")}</p> : null}
      {allSettled && nothingOpen ? (
        <div ref={settledRef} className={styles.settled} data-all-settled="">
          {moment === "all" ? (
            <SealMotion size="md">{sealLarge}</SealMotion>
          ) : (
            <span className={styles.noSparks} aria-hidden="true">
              {sealLarge}
            </span>
          )}
          <h2 className={styles.settledTitle}>{tb("allSquareTitle")}</h2>
          <p>{tb("allSquareText")}</p>
        </div>
      ) : null}
      {mineRows.length > 0 ? (
        <section className={styles.section} aria-labelledby={`${ids}-mine`}>
          <h2 className={styles.h2} id={`${ids}-mine`} tabIndex={-1}>
            {incoming.length > 0 || (out.length === 0 && recent.some((r) => r.to === me))
              ? tb("mineIn")
              : mineRows.length > 1
                ? tb("mineOutMany")
                : tb("mineOut")}
          </h2>
          <ul className={styles.transfers}>{mineRows.map((row) => transferRow(row, "mine"))}</ul>
        </section>
      ) : null}
      {stand.balance > 0 ? payInfo : null}
      {doneMine.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.h3}>
            <Disclosure
              open={doneOpen}
              onToggle={() => {
                setDoneOpen((v) => !v);
              }}
              controls={`${ids}-done`}
              data-done-toggle=""
            >
              {tb("done", { count: doneMine.length })}
            </Disclosure>
          </h2>
          <ul id={`${ids}-done`} className={styles.doneList} hidden={!doneOpen}>
            {doneMine.map((s) => {
              const server = serverById.get(s.id);
              const text =
                s.from === me
                  ? tb("to", { name: name(s.to, { inline: true }) })
                  : s.to === me
                    ? tb("from", { name: name(s.from, { inline: true }) })
                    : `${name(s.from)} → ${name(s.to, { inline: true })}`;
              const on = server?.markedOn ?? model.today;
              const date = formatDate(on, model.intl, { weekday: false, year: false });
              const meta =
                !server || server.markedByMe
                  ? tb("doneMetaMe", { date })
                  : tb("doneMeta", { name: server.markedByName ?? t("formerInline"), date });
              return (
                <li key={s.id} className={styles.doneItem}>
                  <span className={styles.doneText}>
                    <span>{`${text} · ${money(s.cents)}`}</span>
                    <span className={styles.small}>{meta}</span>
                  </span>
                  {!closed && (server?.canUndo ?? true) && !s.id.startsWith("tmp-") ? (
                    <Button
                      variant="text"
                      size="sm"
                      aria-label={tb("undoName", {
                        from: name(s.from, { you: true }),
                        to: name(s.to, { you: true, inline: true }),
                      })}
                      onClick={() => {
                        onTakeBack(s.id, rowKey(s));
                      }}
                    >
                      {tb("undo")}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {orgaRows.length > 0 ? (
        <section className={styles.quietCard} aria-labelledby={`${ids}-orga`}>
          <h2 className={styles.h3} id={`${ids}-orga`}>
            {tb("orgaTitle")}
          </h2>
          <p className={styles.muted}>{tb("orgaText")}</p>
          <ul className={styles.compactList}>{orgaRows.map((row) => transferRow(row, "orga"))}</ul>
        </section>
      ) : null}
      <section className={styles.section} aria-labelledby={`${ids}-others`}>
        {othersCount > 0 ? (
          <h2 className={styles.h3} id={`${ids}-others`}>
            <Disclosure
              open={othersOpen}
              onToggle={() => {
                setOthersOpen((v) => !v);
              }}
              controls={`${ids}-others-list`}
              data-others-toggle=""
            >
              {tb("others", { count: othersCount })}
            </Disclosure>
          </h2>
        ) : null}
        {openTotal > 0 ? (
          <p className={styles.muted} id={othersCount > 0 ? undefined : `${ids}-others`}>
            {tb("groupOpen", { count: openTotal })}
          </p>
        ) : null}
        {othersCount > 0 ? (
          <ul
            id={`${ids}-others-list`}
            className={styles.compactList}
            hidden={!othersOpen}
            data-others-list=""
          >
            {othersOpenRows.map((tr) => (
              <OtherRow
                key={rowKey(tr)}
                tr={tr}
                done={false}
                money={money}
                name={name}
                byKey={byKey}
              />
            ))}
            {othersDone.map((s) => (
              <OtherRow key={s.id} tr={s} done money={money} name={name} byKey={byKey} />
            ))}
          </ul>
        ) : null}
      </section>
      {stand.balance > 0 ? null : payInfo}
      {isOrga && !closed ? (
        <div className={styles.section} id="close">
          <Button variant="secondary" size="md" onClick={onClose}>
            {tClose("action")}
          </Button>
          {!allSettled && model.subphase !== "after" ? (
            <p className={styles.small}>{tb("usually")}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** «An Lena · 64,00 €» / «Von Sara · 134,00 €» – head of an own transfer (D-84). */
function TransferHead({
  tr,
  me,
  money,
  name,
  byKey,
}: {
  tr: Transfer;
  me: string;
  money: (cents: number) => string;
  name: Name;
  byKey: Map<string, CostPersonView>;
}) {
  const tb = useTranslations("balances");
  const t = useTranslations("costs");
  const other = tr.from === me ? tr.to : tr.from;
  const person = byKey.get(other);
  const label =
    tr.from === me
      ? tb("to", { name: name(other, { inline: true }) })
      : tb("from", { name: name(other, { inline: true }) });
  return (
    <div className={styles.transferHead}>
      <span className={styles.transferNames}>
        <PersonAvatar person={person} />
        <span>{label}</span>
        {person?.kind === "placeholder" ? (
          <span className={styles.tagChip}>{t("placeholder")}</span>
        ) : null}
      </span>
      <span className={styles.transferAmount}>{money(tr.cents)}</span>
    </div>
  );
}

/** «Sara → Lena · 134,00 €» – compact, two small avatars (D-85). */
function CompactPair({
  tr,
  money,
  name,
  byKey,
}: {
  tr: Transfer;
  money: (cents: number) => string;
  name: Name;
  byKey: Map<string, CostPersonView>;
}) {
  const t = useTranslations("costs");
  const from = byKey.get(tr.from);
  const to = byKey.get(tr.to);
  return (
    <>
      <span className={styles.compactWho}>
        <PersonAvatar person={from} small />
        <span>{name(tr.from)}</span>
        {from?.kind === "placeholder" ? (
          <span className={styles.tagChip}>{t("placeholder")}</span>
        ) : null}
        <span className={styles.arrow} aria-hidden="true">
          <Icon name="arrow-right" size={16} />
        </span>
        <PersonAvatar person={to} small />
        <span>{name(tr.to, { inline: true })}</span>
        {to?.kind === "placeholder" ? (
          <span className={styles.tagChip}>{t("placeholder")}</span>
        ) : null}
      </span>
      <span className={styles.compactAmount}>{money(tr.cents)}</span>
    </>
  );
}

/** Block 6 row: names, amount, state – nothing to tap, no payment details (W19 E.5/E.6). */
function OtherRow({
  tr,
  done,
  money,
  name,
  byKey,
}: {
  tr: Transfer;
  done: boolean;
  money: (cents: number) => string;
  name: Name;
  byKey: Map<string, CostPersonView>;
}) {
  const tb = useTranslations("balances");
  const state = done ? tb("doneState") : tb("open");
  return (
    <li className={styles.compactRow} data-other-row={done ? "done" : "open"}>
      <span className="visually-hidden">
        {tb("othersRow", {
          from: name(tr.from),
          to: name(tr.to, { inline: true }),
          amount: money(tr.cents),
          state,
        })}
      </span>
      <span className={styles.compactVisual} aria-hidden="true">
        <CompactPair tr={tr} money={money} name={name} byKey={byKey} />
        <span className={cx(styles.compactState, done && styles.compactDone)}>{state}</span>
      </span>
    </li>
  );
}

function RecipientPay({ person, name }: { person: CostPersonView; name: string }) {
  const t = useTranslations("payInfo");
  const pay = person.pay;
  if (!pay?.iban && !pay?.note) {
    return <p className={styles.small}>{t("missing", { name })}</p>;
  }
  return (
    <div className={styles.payInfo}>
      {pay.iban ? <IbanLine iban={pay.iban} owner={name} /> : null}
      {pay.note ? <NoteLine note={pay.note} owner={name} /> : null}
    </div>
  );
}

function NoteLine({ note, owner }: { note: string; owner: string }) {
  const t = useTranslations("payInfo");
  const toast = useToast();
  return (
    <span className={styles.payLine}>
      <span className={styles.payNote}>{note}</span>
      <CopyButton
        text={note}
        label={t("copy")}
        name={t("copyNoteName", { name: owner })}
        done={() => {
          toast({ message: t("noteCopied") });
        }}
      />
    </span>
  );
}
