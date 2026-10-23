"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
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
import { costsPath } from "@/features/trips/paths";
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
  balanceRows,
  balancesFor,
  dayGroups,
  personLabel,
  proposalFor,
  rowKey,
  splitRows,
  type EffectiveSettlement,
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

/** Proposal row marked in THIS view (W19-A `recentlyPaid`) – stays at its place until unmount. */
interface RecentRow {
  key: string;
  from: string;
  to: string;
  cents: number;
  section: "yours" | "others";
  index: number;
  /** Temporary id until the server answered, then the settlement id. */
  id: string;
}

type Sheet =
  | { kind: "detail"; id: string }
  | { kind: "remind"; step: CostRemindStep }
  | { kind: "close" }
  | { kind: "currency" };

interface CostsViewProps {
  model: CostsModel;
  view: "list" | "balances";
  remind: CostRemindData | null;
  /** W19-09: id of the expense saved just before (tint once). */
  freshId: string | null;
  sealSmall: ReactNode;
  sealLarge: ReactNode;
  emptyIllustration: ReactNode;
}

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

const SEEN_EVENT = "ww-costs-seen";

/**
 * «Kosten» `/costs` and «Ausgleich» `/costs/balances` (W19 D): «Dein Stand», the list grouped by
 * day, settling up with marking, balances, payment details, closing. Mobile shows one view per
 * URL (segment); ≥ 960 px both side by side. Deleting and marking are optimistic (with undo);
 * balances and the proposal are recomputed in the client with the server's pure functions.
 */
export function CostsView({
  model,
  view,
  remind,
  freshId,
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
  const [doneOpen, setDoneOpen] = useState(false);
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
  const name = useCallback(
    (key: string, options: { inline?: boolean; you?: boolean } = {}) =>
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
  const myBalance = balances.get(me) ?? 0;
  const allSettled = [...balances.values()].every((v) => v === 0);
  const total = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const myShare = expenses.reduce(
    (sum, e) => sum + (e.shares.find((s) => s.party === me)?.cents ?? 0),
    0,
  );
  const myPaid = expenses.reduce((sum, e) => sum + (e.payer === me ? e.amountCents : 0), 0);
  const mySettled = settlements.reduce(
    (sum, s) => sum + (s.from === me ? s.cents : s.to === me ? -s.cents : 0),
    0,
  );

  // Rows of the proposal + this view's marked rows at their old index (W19-A).
  const sections = useMemo(() => {
    const split = splitRows(proposal, me);
    const place = (list: typeof split.yours, section: "yours" | "others") => {
      const rows: (
        ({ kind: "open" } & (typeof list)[number]) | { kind: "paid"; row: RecentRow }
      )[] = list.map((tr) => ({ kind: "open" as const, ...tr }));
      const keys = new Set(list.map(rowKey));
      for (const r of recent.filter((x) => x.section === section)) {
        if (keys.has(r.key)) continue;
        rows.splice(Math.min(r.index, rows.length), 0, { kind: "paid", row: r });
      }
      return rows;
    };
    return { yours: place(split.yours, "yours"), others: place(split.others, "others") };
  }, [proposal, me, recent]);

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
    // Focus: the next row, otherwise the day heading (D.4.3).
    const rows = [...document.querySelectorAll<HTMLElement>("[data-expense-row]")];
    const index = rows.findIndex((el) => el.dataset.expenseRow === expense.id);
    const next = rows[index + 1] ?? rows[index - 1];
    focusAfter.current = next
      ? `[data-expense-row="${next.dataset.expenseRow ?? ""}"]`
      : "#costs-title";
    const restore = () => {
      setDeleted((set) => {
        const copy = new Set(set);
        copy.delete(expense.id);
        return copy;
      });
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
          setDeleted((set) => {
            const copy = new Set(set);
            copy.delete(expense.id);
            return copy;
          });
          showBanner(errorText(result.error));
          refresh();
        }
      })
      .catch(() => {
        setDeleted((set) => {
          const copy = new Set(set);
          copy.delete(expense.id);
          return copy;
        });
        showBanner(t("error"));
      });
  }

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

  /* ---------------- mark / take back (W19-02 … W19-08) ---------------- */
  function mark(
    tr: { from: string; to: string; cents: number },
    section: "yours" | "others",
    index: number,
  ) {
    const temp = `tmp-${String(Date.now())}-${String(Math.random()).slice(2, 8)}`;
    const key = rowKey(tr);
    const beforeMine = balances.get(me) ?? 0;
    setAdded((list) => [...list, { id: temp, ...tr }]);
    setRecent((list) => [...list, { key, ...tr, section, index, id: temp }]);
    focusAfter.current = `[data-undo-row="${CSS.escape(key)}"]`;
    const after = balancesFor(model, expenses, [...settlements, { id: temp, ...tr }]);
    const nowAllSettled = [...after.values()].every((v) => v === 0);
    const fromName = name(tr.from, { you: true });
    const toName = name(tr.to, { you: true, inline: true });
    void markSettlementAction(model.publicId, tr.from, tr.to, tr.cents)
      .then((result) => {
        if (result.ok) {
          setAdded((list) => list.map((a) => (a.id === temp ? { ...a, id: result.id } : a)));
          setRecent((list) => list.map((r) => (r.id === temp ? { ...r, id: result.id } : r)));
          if (nowAllSettled) setMoment("all");
          else if (beforeMine !== 0 && (after.get(me) ?? 0) === 0) setMoment("me");
          toast({
            message: tb(nowAllSettled ? "markedSquare" : "marked", {
              from: fromName,
              to: toName,
              amount: money(tr.cents),
            }),
            action: {
              label: t("undo"),
              onAction: () => {
                takeBack(result.id, key);
              },
            },
          });
          refresh();
        } else {
          setAdded((list) => list.filter((a) => a.id !== temp));
          setRecent((list) => list.filter((r) => r.id !== temp));
          showBanner(errorText(result.error));
          refresh();
        }
      })
      .catch(() => {
        setAdded((list) => list.filter((a) => a.id !== temp));
        setRecent((list) => list.filter((r) => r.id !== temp));
        showBanner(t("error"), () => {
          setBanner(null);
          mark(tr, section, index);
        });
      });
  }

  function takeBack(id: string, key: string | null) {
    if (id.startsWith("tmp-")) return;
    const recentRow = recent.find((r) => r.id === id);
    const server = model.settlements.find((s) => s.id === id);
    const settlement = recentRow ?? server ?? added.find((a) => a.id === id);
    setRemoved((set) => new Set(set).add(id));
    setAdded((list) => list.filter((a) => a.id !== id));
    setRecent((list) => list.filter((r) => r.id !== id));
    setMoment("none");
    if (key) focusAfter.current = `[data-mark-row="${CSS.escape(key)}"]`;
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
                        "cents" in settlement ? settlement.cents : 0,
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
          setRemoved((set) => {
            const copy = new Set(set);
            copy.delete(id);
            return copy;
          });
          showBanner(errorText(result.error));
        }
        refresh();
      })
      .catch(() => {
        setRemoved((set) => {
          const copy = new Set(set);
          copy.delete(id);
          return copy;
        });
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

  /* ---------------- paid-to-you notice (D.8.3, M-U18) ---------------- */
  const paidToMe =
    seen === null || closed
      ? []
      : model.settlements.filter(
          (s) => s.to === me && !s.markedByMe && !seen.has(s.id) && !removed.has(s.id),
        );
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

  const groups = dayGroups(expenses);
  const shownGroups = showAll ? groups : limitGroups(groups, 100);
  const hidden = expenses.length - shownGroups.reduce((n, g) => n + g.items.length, 0);
  const activeCount = model.people.filter((p) => p.active).length;
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

  const segment = (
    <nav className={styles.segment} aria-label={t("tabs")}>
      <Link
        className={styles.segmentLink}
        href={costsPath(model.publicId)}
        aria-current={view === "list" ? "page" : undefined}
      >
        {t("tabExpenses")}
      </Link>
      <Link
        className={styles.segmentLink}
        href={costsPath(model.publicId, "balances")}
        aria-current={view === "balances" ? "page" : undefined}
      >
        {t("tabBalances")}
      </Link>
    </nav>
  );

  const hasData = model.expenses.length > 0 || model.settlements.length > 0;

  return (
    <>
      <div className={styles.page} data-view={view}>
        <div className={styles.top}>
          {banner ? (
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
          ) : null}
          {model.closed ? (
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
          ) : null}
          {hasData ? (
            <Stand
              balance={myBalance}
              share={myShare}
              paid={myPaid}
              settled={mySettled}
              total={total}
              money={money}
              closed={closed}
              showLink={view === "list" && myBalance !== 0}
              balancesHref={costsPath(model.publicId, "balances")}
              seal={sealSmall}
              pop={moment === "me"}
            />
          ) : null}
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
                names: [...new Set(paidToMe.map((s) => name(s.from)))].join(", "),
                count: new Set(paidToMe.map((s) => s.from)).size,
                amount: money(paidToMe.reduce((sum, s) => sum + s.cents, 0)),
              })}
            </Banner>
          ) : null}
          {model.expenses.length > 0 ? segment : null}
        </div>

        <div className={cx(styles.col, styles.listCol)}>
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
            <section aria-label={t("tabExpenses")}>
              {shownGroups.map((group) => (
                <div key={group.date} className={styles.day}>
                  <h2 className={styles.dayHead} id={`day-${group.date}`} tabIndex={-1}>
                    <span>{formatDate(group.date, intl, { weekday: true, year: false })}</span>
                    <span className={styles.daySum}>
                      <span aria-hidden="true">{money(group.sum)}</span>
                      <span className="visually-hidden">
                        {t("day.sum", { amount: money(group.sum) })}
                      </span>
                    </span>
                  </h2>
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

        <div className={cx(styles.col, styles.balancesCol)}>
          {hasData ? (
            <Balances
              model={model}
              sections={sections}
              proposalCount={proposal.length}
              allSettled={allSettled}
              closed={closed}
              balances={balances}
              settlements={settlements}
              money={money}
              name={name}
              moment={moment}
              sealLarge={sealLarge}
              doneOpen={doneOpen}
              onToggleDone={() => {
                setDoneOpen((v) => !v);
              }}
              onMark={mark}
              onTakeBack={takeBack}
              onRemind={(key) => {
                if (remind) setSheet({ kind: "remind", step: { occasion: "settle", key } });
              }}
              onClose={() => {
                setSheet({ kind: "close" });
              }}
              remind={remind}
              focusOnLoad={view === "balances"}
            />
          ) : null}
          <PayInfoCard model={model} />
        </div>
      </div>

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
      </BottomSheet>
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

/* ---------------- «Dein Stand» ---------------- */

function Stand({
  balance,
  share,
  paid,
  settled,
  total,
  money,
  closed,
  showLink,
  balancesHref,
  seal,
  pop,
}: {
  balance: number;
  share: number;
  paid: number;
  settled: number;
  total: number;
  money: (cents: number) => string;
  closed: boolean;
  showLink: boolean;
  balancesHref: string;
  seal: ReactNode;
  pop: boolean;
}) {
  const t = useTranslations("costs");
  const sentence =
    balance > 0
      ? t("mine.owed", { amount: money(balance) })
      : balance < 0
        ? t("mine.owe", { amount: money(-balance) })
        : t("mine.square");
  const detail =
    settled !== 0
      ? t("mine.detailPayments", {
          share: money(share),
          paid: money(paid),
          settled: money(Math.abs(settled)),
        })
      : t("mine.detail", { share: money(share), paid: money(paid) });
  const totalText = t("mine.total", { total: money(total) });
  const sentenceRef = useTextFade<HTMLParagraphElement>(sentence);
  const detailRef = useTextFade<HTMLParagraphElement>(detail);
  const totalRef = useTextFade<HTMLParagraphElement>(totalText);
  return (
    <section className={styles.stand} aria-labelledby="costs-stand">
      <h2 className={styles.eyebrow} id="costs-stand">
        {t("mine.label")}
      </h2>
      {closed ? (
        <span className={styles.closedChip}>
          <Chip icon="lock">{t("closed.chip")}</Chip>
        </span>
      ) : null}
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
      ) : (
        <span
          className={cx(styles.standTile, balance > 0 ? styles.tileOwed : styles.tileOwe)}
          aria-hidden="true"
        >
          <Icon name={balance > 0 ? "wallet" : "transfer"} size={22} />
        </span>
      )}
      <div className={styles.standText}>
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
        <p ref={detailRef} className={styles.standLine}>
          {detail}
        </p>
        <p ref={totalRef} className={styles.standLine}>
          {totalText}
        </p>
        {showLink ? (
          <Link className={styles.textLink} href={balancesHref}>
            {t("mine.toBalances")}
            <Icon name="chevron-right" size={18} />
          </Link>
        ) : null}
      </div>
    </section>
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
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string;
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
        {expense.mode === "amounts" ? (
          <span className={styles.tagChipRow}>{t("row.custom")}</span>
        ) : null}
      </span>
      <span className={styles.rowRight}>
        <span className={styles.rowAmount}>{money(expense.amountCents)}</span>
        <span className={styles.rowShare}>{share}</span>
      </span>
    </button>
  );
}

type T = ReturnType<typeof useTranslations<"costs">>;

function paidText(
  payer: string,
  me: string,
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string,
  t: T,
): string {
  if (payer === me) return t("row.paidMe");
  const label = name(payer);
  return t("row.paid", { name: label });
}

function forText(
  expense: CostExpenseView,
  me: string,
  activeCount: number,
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string,
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
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string;
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
                {name(s.party)}
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

export function PersonAvatar({ person }: { person: CostPersonView | undefined }) {
  if (!person || person.kind === "former") {
    return (
      <span className={styles.formerAvatar} aria-hidden="true">
        <Icon name="user" size={18} />
      </span>
    );
  }
  return (
    <Avatar
      id={person.avatarId}
      name={person.name ?? ""}
      size="sm"
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

/* ---------------- settle up (D.7) ---------------- */

type SectionRow =
  { kind: "open"; from: string; to: string; cents: number } | { kind: "paid"; row: RecentRow };

function Balances({
  model,
  sections,
  proposalCount,
  allSettled,
  closed,
  balances,
  settlements,
  money,
  name,
  moment,
  sealLarge,
  doneOpen,
  onToggleDone,
  onMark,
  onTakeBack,
  onRemind,
  onClose,
  remind,
  focusOnLoad,
}: {
  model: CostsModel;
  sections: { yours: SectionRow[]; others: SectionRow[] };
  proposalCount: number;
  allSettled: boolean;
  closed: boolean;
  balances: ReadonlyMap<string, number>;
  settlements: EffectiveSettlement[];
  money: (cents: number) => string;
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string;
  moment: "none" | "me" | "all";
  sealLarge: ReactNode;
  doneOpen: boolean;
  onToggleDone: () => void;
  onMark: (
    tr: { from: string; to: string; cents: number },
    section: "yours" | "others",
    index: number,
  ) => void;
  onTakeBack: (id: string, key: string | null) => void;
  onRemind: (key: string) => void;
  onClose: () => void;
  remind: CostRemindData | null;
  focusOnLoad: boolean;
}) {
  const tb = useTranslations("balances");
  const tRemind = useTranslations("remind");
  const t = useTranslations("costs");
  const tClose = useTranslations("closeCosts");
  const { me } = model;
  const byKey = new Map(model.people.map((p) => [p.key, p]));
  const firstDebt = sections.yours.findIndex((r) => r.kind === "open" && r.from === me);
  // The first own debt is the primary button – fixed for this view (W19-02: no later restyle).
  const [primaryIndex] = useState(firstDebt);
  const yoursHeading = useRef<HTMLHeadingElement>(null);
  const othersHeading = useRef<HTMLHeadingElement>(null);
  const doneCount = settlements.length;
  const doneLabel = tb("done", { count: doneCount });
  const doneRef = useTextFade<HTMLSpanElement>(doneLabel);
  const countText = tb("count", { count: proposalCount });
  const countRef = useTextFade<HTMLParagraphElement>(countText);
  const settledRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusOnLoad || window.matchMedia("(max-width: 959px)").matches) return;
    (yoursHeading.current ?? othersHeading.current)?.focus({ preventScroll: true });
    // Only on the first paint of /balances (≥ 960 px, D.14).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const renderRow = (row: SectionRow, section: "yours" | "others", index: number) => {
    if (row.kind === "paid") {
      const r = row.row;
      return (
        <li key={`paid-${r.key}`} data-transfer={r.key}>
          <TransferHead
            from={r.from}
            to={r.to}
            cents={r.cents}
            money={money}
            name={name}
            byKey={byKey}
          />
          <div className={styles.transferActions}>
            <span className={styles.paidChip}>
              <Icon name="check" size={16} />
              {`${tb("paidChip")} · ${money(r.cents)}`}
            </span>
            <Button
              variant="text"
              size="sm"
              data-undo-row={r.key}
              aria-label={tb("undoPayName", {
                from: name(r.from, { you: true }),
                to: name(r.to, { inline: true }),
              })}
              onClick={() => {
                onTakeBack(r.id, r.key);
              }}
            >
              {tb("undoPay")}
            </Button>
          </div>
        </li>
      );
    }
    const from = byKey.get(row.from);
    const to = byKey.get(row.to);
    const viewerParty = model.myParty;
    const mine = viewerParty !== null && (row.from === viewerParty || row.to === viewerParty);
    const canMark = !closed && (mine || (model.isOrganizer && !from?.account && !to?.account));
    const key = rowKey(row);
    const who =
      from?.account && to?.account
        ? tb("whoBoth", { a: name(row.from), b: name(row.to) })
        : from?.account
          ? tb("whoOne", { a: name(row.from) })
          : to?.account
            ? tb("whoOne", { a: name(row.to) })
            : tb("whoOrga");
    const iPay = row.from === viewerParty;
    const toMe = row.to === viewerParty;
    const remindRow = toMe ? remind?.mine.find((m) => m.key === row.from) : undefined;
    const primary = section === "yours" && index === primaryIndex && iPay;
    return (
      <li key={key} data-transfer={key}>
        <TransferHead
          from={row.from}
          to={row.to}
          cents={row.cents}
          money={money}
          name={name}
          byKey={byKey}
        />
        {to?.kind === "member" && !to.me ? (
          <RecipientPay person={to} name={name(row.to)} iPay={iPay} />
        ) : null}
        {closed ? null : canMark ? (
          <div className={styles.transferActions}>
            <Button
              variant={primary ? "primary" : "secondary"}
              size={primary ? "md" : "sm"}
              icon="check"
              data-mark-row={key}
              onClick={() => {
                onMark({ from: row.from, to: row.to, cents: row.cents }, section, index);
              }}
            >
              {toMe ? tb("markReceived") : tb("markPaid")}
            </Button>
            {toMe && from && from.kind !== "former" && remindRow?.texts ? (
              <Button
                variant="secondary"
                size="sm"
                icon="remind"
                aria-haspopup="dialog"
                onClick={() => {
                  onRemind(row.from);
                }}
              >
                {tb("remind", { name: name(row.from) })}
              </Button>
            ) : toMe && from && remindRow?.orgaTexts && remind ? (
              // R-082: members cannot remind a placeholder – the organiser has the link.
              <Button
                variant="secondary"
                size="sm"
                icon="remind"
                aria-haspopup="dialog"
                aria-label={tb("nudgeOrgaName", { orga: remind.orgaName, name: name(row.from) })}
                onClick={() => {
                  onRemind(row.from);
                }}
              >
                {tRemind("orgaTitle", { orga: remind.orgaName })}
              </Button>
            ) : null}
          </div>
        ) : (
          <p className={styles.small}>{who}</p>
        )}
      </li>
    );
  };

  const hasYours = sections.yours.length > 0;
  const recentlyPaidOthers = sections.others.some((r) => r.kind === "paid");
  const showProposals = !allSettled || sections.yours.length > 0 || recentlyPaidOthers;
  const doneItems = [...settlements].reverse();

  return (
    <>
      {closed ? <p className={styles.muted}>{tb("closed")}</p> : null}
      {hasYours ? (
        <section className={styles.section} aria-labelledby="costs-yours">
          <h2 className={styles.h2} id="costs-yours" ref={yoursHeading} tabIndex={-1}>
            {tb("yours")}
          </h2>
          <ul className={styles.transfers}>
            {sections.yours.map((r, i) => renderRow(r, "yours", i))}
          </ul>
        </section>
      ) : null}
      {showProposals && (sections.others.length > 0 || !hasYours) ? (
        <section className={styles.section} aria-labelledby="costs-others">
          <h2 className={styles.h2} id="costs-others" ref={othersHeading} tabIndex={-1}>
            {hasYours ? tb("others") : tb("othersOnly")}
          </h2>
          {proposalCount > 0 ? (
            <p ref={countRef} className={styles.muted}>
              {countText}
            </p>
          ) : null}
          {sections.others.length > 0 ? (
            <ul className={styles.transfers}>
              {sections.others.map((r, i) => renderRow(r, "others", i))}
            </ul>
          ) : null}
        </section>
      ) : null}
      {allSettled ? (
        <div ref={settledRef} className={styles.settled} data-all-settled="">
          {moment === "all" ? (
            <SealMotion size="md">{sealLarge}</SealMotion>
          ) : (
            <span className={styles.noSparks} aria-hidden="true">
              {sealLarge}
            </span>
          )}
          <h3>{tb("allSquareTitle")}</h3>
          <p>{tb("allSquareText")}</p>
          {model.isOrganizer && !closed ? (
            <Button variant="secondary" size="md" onClick={onClose}>
              {tClose("action")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {doneCount > 0 ? (
        <section className={styles.section}>
          <button
            type="button"
            className={styles.doneToggle}
            aria-expanded={doneOpen}
            onClick={onToggleDone}
            data-done-toggle=""
          >
            <span ref={doneRef}>{doneLabel}</span>
            <span className={styles.chevron}>
              <Icon name="chevron-down" size={20} />
            </span>
          </button>
          {doneOpen ? (
            <ul className={styles.doneList}>
              {doneItems.map((s) => {
                const server = model.settlements.find((x) => x.id === s.id);
                const markedBy =
                  server?.markedByName ?? (server ? t("formerInline") : name(model.me));
                const on = server?.markedOn ?? model.today;
                return (
                  <li key={s.id} className={styles.doneItem}>
                    <span className={styles.doneText}>
                      <span>
                        {`${name(s.from, { you: true })} → ${name(s.to, { you: true, inline: true })}: ${money(s.cents)}`}
                      </span>
                      <span className={styles.small}>
                        {server?.markedByOrga
                          ? tb("doneOrga", {
                              name: markedBy,
                              date: formatDate(on, model.intl, { weekday: false, year: false }),
                            })
                          : tb("doneMeta", {
                              name: markedBy,
                              date: formatDate(on, model.intl, { weekday: false, year: false }),
                            })}
                      </span>
                    </span>
                    {!closed && (server?.canUndo ?? true) && !s.id.startsWith("tmp-") ? (
                      <Button
                        variant="text"
                        size="sm"
                        aria-label={tb("undoPayName", {
                          from: name(s.from, { you: true }),
                          to: name(s.to, { inline: true }),
                        })}
                        onClick={() => {
                          onTakeBack(s.id, rowKey(s));
                        }}
                      >
                        {tb("undoPay")}
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      ) : null}
      <section className={styles.section} aria-labelledby="costs-balances">
        <h2 className={styles.h2} id="costs-balances">
          {tb("list")}
        </h2>
        <BalanceList model={model} balances={balances} money={money} name={name} />
      </section>
      {model.isOrganizer && !closed && !allSettled ? (
        <div className={styles.section}>
          <Button variant="secondary" size="md" onClick={onClose}>
            {tClose("action")}
          </Button>
          {model.subphase !== "after" ? <p className={styles.small}>{tb("usually")}</p> : null}
        </div>
      ) : null}
    </>
  );
}

function TransferHead({
  from,
  to,
  cents,
  money,
  name,
  byKey,
}: {
  from: string;
  to: string;
  cents: number;
  money: (cents: number) => string;
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string;
  byKey: Map<string, CostPersonView>;
}) {
  const tb = useTranslations("balances");
  const t = useTranslations("costs");
  const fromLabel = name(from, { you: true });
  const toLabel = name(to, { you: true, inline: true });
  return (
    <div className={styles.transferHead}>
      <span className={styles.transferNames} aria-hidden="true">
        <PersonAvatar person={byKey.get(from)} />
        <span>{fromLabel}</span>
        {byKey.get(from)?.kind === "placeholder" ? (
          <span className={styles.tagChip}>{t("placeholder")}</span>
        ) : null}
        <span className={styles.arrow}>
          <Icon name="arrow-right" size={16} />
        </span>
        <PersonAvatar person={byKey.get(to)} />
        <span>{toLabel}</span>
        {byKey.get(to)?.kind === "placeholder" ? (
          <span className={styles.tagChip}>{t("placeholder")}</span>
        ) : null}
      </span>
      <span className={styles.transferAmount} aria-hidden="true">
        {money(cents)}
      </span>
      <span className="visually-hidden">
        {tb("to", { from: fromLabel, to: toLabel, amount: money(cents) })}
      </span>
    </div>
  );
}

function RecipientPay({
  person,
  name,
  iPay,
}: {
  person: CostPersonView;
  name: string;
  iPay: boolean;
}) {
  const t = useTranslations("payInfo");
  const pay = person.pay;
  if (!pay?.iban && !pay?.note) {
    return iPay ? <p className={styles.small}>{t("missing", { name })}</p> : null;
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

function BalanceList({
  model,
  balances,
  money,
  name,
}: {
  model: CostsModel;
  balances: ReadonlyMap<string, number>;
  money: (cents: number) => string;
  name: (key: string, options?: { inline?: boolean; you?: boolean }) => string;
}) {
  const tb = useTranslations("balances");
  const t = useTranslations("costs");
  const rows = balanceRows(model.people, balances);
  const max = Math.max(1, ...rows.map((p) => Math.abs(balances.get(p.key) ?? 0)));
  const bars = rows.length >= 3;
  return (
    <ul className={styles.balances}>
      {rows.map((p) => {
        const cents = balances.get(p.key) ?? 0;
        const scope = p.me ? "me" : "other";
        const text =
          cents > 0
            ? tb(`${scope}.owed`, { amount: money(cents) })
            : cents < 0
              ? tb(scope === "me" ? "me.owes" : "other.owes", { amount: money(-cents) })
              : tb(`${scope}.square`);
        return (
          <li key={p.key} data-balance-row={p.key}>
            <span className={styles.balanceLine}>
              <span className={styles.balanceName}>
                <PersonAvatar person={p} />
                <span>{p.me ? t("you") : name(p.key)}</span>
                {p.kind === "placeholder" ? (
                  <span className={styles.tagChip}>{t("placeholder")}</span>
                ) : null}
              </span>
              <BalanceValue text={text} cents={cents} />
            </span>
            {bars ? (
              <span className={styles.bar} aria-hidden="true">
                {cents !== 0 ? (
                  <span
                    className={cx(styles.barFill, cents > 0 ? styles.barGet : styles.barOwe)}
                    style={{ width: `${String((Math.abs(cents) / max) * 50)}%` }}
                  />
                ) : null}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function BalanceValue({ text, cents }: { text: string; cents: number }) {
  const ref = useTextFade<HTMLSpanElement>(text);
  return (
    <span
      ref={ref}
      className={cx(
        styles.balanceValue,
        cents > 0 ? styles.owed : cents < 0 ? styles.owe : styles.square,
      )}
    >
      {text}
    </span>
  );
}
