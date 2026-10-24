"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Tile } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import {
  DISTANCE,
  DURATION,
  EASING,
  prefersReducedMotion,
  nod,
  STAGGER,
  staggerDelay,
} from "@/lib/motion";
import { freshlyDone } from "@/lib/trip-route";
import { useWasServerPainted } from "@/lib/use-hydration";
import type { CockpitAction, CockpitLink, RouteView, StationView } from "../types";
import { firstCostStep } from "@/features/costs/components/cost-remind";
import { useCockpit } from "./cockpit-provider";
import styles from "./route.module.css";

const MAX_TODAY = 3;
const MAX_WAITING = 2;
const MAX_LATER = 2;
const RETURN_MS = 5 * 60_000;

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Offline (ux-spec §6): banner, last state stays, primary/remind buttons blocked. */
function useOffline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );
}

function storage(kind: "session" | "local"): Storage | null {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/** Remembers where we left to (focus/scroll come back there, W16 v2.8 / ux-spec §3). */
function rememberReturn(sessionKey: string, returnKey: string) {
  storage("session")?.setItem(
    `ww-route-return:${sessionKey}`,
    JSON.stringify({ key: returnKey, y: window.scrollY, at: Date.now() }),
  );
}

/** Card / row that leads to a sub-page (Link) or opens a sheet (button) – one target. */
function Target({
  link,
  sessionKey,
  returnKey,
  className,
  ariaLabel,
  children,
}: {
  link: CockpitLink;
  sessionKey: string;
  returnKey: string;
  className: string | undefined;
  ariaLabel?: string | undefined;
  children: ReactNode;
}) {
  const cockpit = useCockpit();
  if (link.kind === "path") {
    return (
      <Link
        href={link.href}
        className={className}
        aria-label={ariaLabel}
        data-return-key={returnKey}
        onClick={() => {
          rememberReturn(sessionKey, returnKey);
        }}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      data-return-key={returnKey}
      onClick={() => {
        cockpit?.open({ kind: link.sheet });
      }}
    >
      {children}
    </button>
  );
}

function ActionButton({
  action,
  sessionKey,
  returnKey,
  variant,
  offline,
  children,
}: {
  action: CockpitAction;
  sessionKey: string;
  returnKey: string;
  variant: "primary" | "secondary" | "text";
  offline: boolean;
  children: ReactNode;
}) {
  const cockpit = useCockpit();
  const pending = cockpit?.pending ?? false;
  if (action.kind === "path" && !offline) {
    return (
      <Link
        href={action.href}
        className={cx(styles.action, styles[variant])}
        data-return-key={`${returnKey}:action`}
        onClick={() => {
          rememberReturn(sessionKey, `${returnKey}:action`);
        }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Button
      variant={variant}
      size={variant === "primary" ? "lg" : "sm"}
      block={variant === "primary"}
      aria-disabled={offline || (action.kind === "withoutApp" && pending) || undefined}
      aria-haspopup={
        action.kind === "announce" || action.kind === "sheet" || action.kind === "closeCosts"
          ? "dialog"
          : undefined
      }
      onClick={() => {
        if (!offline) cockpit?.run(action);
      }}
    >
      {children}
    </Button>
  );
}

function Chevron() {
  return (
    <span className={styles.chevron} aria-hidden="true">
      <Icon name="chevron-right" size={20} />
    </span>
  );
}

/** Expanding region (UM-5): `grid-template-rows` 0fr → 1fr, closed = inert + hidden. */
function Expand({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div id={id} className={cx(styles.expand, open && styles.open)} inert={!open}>
      <div className={styles.expandInner}>{children}</div>
    </div>
  );
}

function useSessionOpen(key: string): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Open state lasts until the end of the session (W16 v2.8).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore from sessionStorage
    if (storage("session")?.getItem(key) === "1") setOpen(true);
  }, [key]);
  return [
    open,
    (value) => {
      setOpen(value);
      storage("session")?.setItem(key, value ? "1" : "0");
    },
  ];
}

/** Fade of the entries after opening (UM-5, staggered 40 ms); reduced: none. */
function revealEntries(region: HTMLElement | null) {
  if (!region || prefersReducedMotion()) return;
  region.querySelectorAll(":scope > div > ul > li").forEach((item, i) => {
    item.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: DURATION.base,
      delay: staggerDelay(i, STAGGER.item),
      easing: EASING.standard,
      fill: "backwards",
    });
  });
}

function MoreToggle({
  storageKey,
  label,
  children,
}: {
  storageKey: string;
  label: string;
  children: ReactNode;
}) {
  const t = useTranslations("route");
  const id = useId();
  const [open, setOpen] = useSessionOpen(storageKey);
  return (
    <>
      <button
        type="button"
        className={styles.moreButton}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen(!open);
          if (!open) {
            requestAnimationFrame(() => {
              revealEntries(document.getElementById(id));
            });
          }
        }}
      >
        <span>{open ? t("more.showLess") : label}</span>
        <span className={styles.chevronDown} aria-hidden="true">
          <Icon name="chevron-down" size={20} />
        </span>
      </button>
      <Expand id={id} open={open}>
        {children}
      </Expand>
    </>
  );
}

/** Station card: big (first «Heute» card, carries the only primary) or compact (one link). */
function StationCard({
  station,
  big,
  sessionKey,
  offline,
}: {
  station: StationView;
  big: boolean;
  sessionKey: string;
  offline: boolean;
}) {
  const plan = station.kind === "plan";
  const edge = station.state === "yours" ? (plan ? styles.plan : styles.yours) : undefined;
  const chip =
    station.state === "yours" ? (
      <span className={cx(styles.chip, plan ? styles.chipPlan : styles.chipTodo)}>
        {station.label}
      </span>
    ) : null;
  if (big) {
    return (
      <div className={cx(styles.card, styles.big, edge)}>
        {chip}
        <Target
          link={station.link}
          sessionKey={sessionKey}
          returnKey={station.id}
          className={styles.cardHead}
          ariaLabel={station.ariaLabel}
        >
          <Tile icon={station.icon} tone={station.tone} size="sm" />
          <span className={styles.title}>{station.title}</span>
          <Chevron />
        </Target>
        <p className={styles.status}>{station.detail ?? station.status}</p>
        {station.progress !== undefined ? (
          <span className={styles.progress} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ transform: `scaleX(${String(station.progress)})` }}
            />
          </span>
        ) : null}
        {station.primary ? (
          <ActionButton
            action={station.primary.action}
            sessionKey={sessionKey}
            returnKey={station.id}
            // U-30: «Abschließen» (D1) is never the page's primary.
            variant={station.primary.variant}
            offline={offline}
          >
            {station.primary.label}
          </ActionButton>
        ) : null}
      </div>
    );
  }
  return (
    <Target
      link={station.link}
      sessionKey={sessionKey}
      returnKey={station.id}
      className={cx(styles.card, styles.compact, edge)}
      ariaLabel={station.ariaLabel}
    >
      <Tile icon={station.icon} tone={station.tone} size="sm" />
      <span className={styles.grow}>
        {chip}
        <span className={styles.title}>{station.title}</span>
        <span className={styles.status}>{station.status}</span>
        {station.progress !== undefined ? (
          <span className={styles.progress} aria-hidden="true">
            <span
              className={styles.progressFill}
              style={{ transform: `scaleX(${String(station.progress)})` }}
            />
          </span>
        ) : null}
      </span>
      <Chevron />
    </Target>
  );
}

function StationActions({
  station,
  sessionKey,
  offline,
}: {
  station: StationView;
  sessionKey: string;
  offline: boolean;
}) {
  const cockpit = useCockpit();
  if (!station.remind && !station.textActions?.length) return null;
  return (
    <div className={styles.actions}>
      {station.remind ? (
        <Button
          variant="secondary"
          size="sm"
          icon="remind"
          aria-label={station.remind.name}
          aria-haspopup="dialog"
          aria-disabled={offline || undefined}
          onClick={() => {
            if (offline || !station.remind) return;
            const { occasion, keys } = station.remind;
            if (occasion === "placeholder" || occasion === "orga") {
              cockpit?.open({ kind: "remind", occasion, keys });
            } else if (occasion === "travel-data") {
              cockpit?.open({ kind: "travel", step: { requestId: keys[0] } });
            } else if (occasion === "settle" || occasion === "settle-all") {
              const data = cockpit?.data.costRemind;
              if (data) cockpit.open({ kind: "cost", step: firstCostStep(data, occasion) });
            } else {
              cockpit?.open({ kind: "stay", step: { occasion } });
            }
          }}
        >
          {station.remind.label}
        </Button>
      ) : null}
      {station.textActions?.map((item) => (
        <ActionButton
          key={item.label}
          action={item.action}
          sessionKey={sessionKey}
          returnKey={station.id}
          variant="text"
          offline={offline}
        >
          {item.label}
        </ActionButton>
      ))}
    </div>
  );
}

function Marker({ kind, coins = 1 }: { kind: string; coins?: number }) {
  return (
    <span
      className={cx(styles.marker, styles[`marker-${kind}`])}
      data-coins={kind === "done" ? String(coins) : undefined}
      data-route-marker={kind}
      aria-hidden="true"
    >
      {kind === "done" ? <Icon name="check" size={18} /> : null}
      {kind === "today" ? <Icon name="sun" size={22} /> : null}
      {kind === "goal" ? <Icon name={"sun"} size={20} /> : null}
    </span>
  );
}

/**
 * The way of the phase-3 cockpit (W16 v2.1–v2.9): collapsed done row → HEUTE (your turn,
 * the first card carries the page's only primary) → waiting (with «Erinnern» below the card)
 * → next / later → goal; then «Immer griffbereit» and «Mehr zur Reise». The way is an `<ol>`,
 * state words stand as text, line and markers are decorative.
 *
 * Motion: UM-2 (way builds up – only when the page appears on the client, never over
 * server-painted HTML, R-017; once per session), UM-3 (today marker pulses 3× once per session,
 * additive), UM-4 (marker of the done row «plops» when a station is newly done), UM-5 (expand).
 * Reduced motion: everything static.
 */
export function RouteSection({ view }: { view: RouteView }) {
  const t = useTranslations("route");
  const cockpit = useCockpit();
  const offline = useOffline();
  const serverPainted = useWasServerPainted();
  const rootRef = useRef<HTMLDivElement>(null);
  const doneId = useId();
  const [doneOpen, setDoneOpen] = useSessionOpen(`ww-route-open:${view.sessionKey}:done`);
  const [fresh, setFresh] = useState<string[]>([]);
  const [pulse, setPulse] = useState(false);
  const { sessionKey } = view;

  // «Neu erledigt» (v2.7): compare with the last visit in this browser (station ids only).
  useEffect(() => {
    const store = storage("local");
    const key = `ww-route-done:${sessionKey}`;
    const current = view.done.filter((s) => !s.unused).map((s) => s.id);
    let previous: string[] | null = null;
    try {
      const raw = store?.getItem(key);
      previous = raw ? (JSON.parse(raw) as string[]) : null;
    } catch {
      previous = null;
    }
    store?.setItem(key, JSON.stringify(current));
    const next = freshlyDone(previous, current);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only comparison
    setFresh(next);
    if (next.length === 0) return;
    const marker = rootRef.current?.querySelector("[data-route-marker='done']");
    if (!marker || prefersReducedMotion()) return;
    // UM-4 / W16-04 (M-X8 b): the marker itself becomes the seal – a nod 1 → 1.25 → 1 without
    // delay, never smaller than the painted state (R-017).
    nod(marker);
  }, [sessionKey, view.done]);

  // Return from a sub-page: focus (and scroll) back on the entry we came from (v2.8).
  useEffect(() => {
    const store = storage("session");
    const key = `ww-route-return:${sessionKey}`;
    const raw = store?.getItem(key);
    if (!raw) return;
    store?.removeItem(key);
    try {
      const { key: target, y, at } = JSON.parse(raw) as { key: string; y: number; at: number };
      if (Date.now() - at > RETURN_MS) return;
      const element =
        rootRef.current?.querySelector<HTMLElement>(`[data-return-key="${CSS.escape(target)}"]`) ??
        document.getElementById("route-today");
      if (Math.abs(window.scrollY - y) > 4) window.scrollTo({ top: y, behavior: "instant" });
      element?.focus({ preventScroll: true });
    } catch {
      // ignore broken entries
    }
  }, [sessionKey]);

  // UM-2 + UM-3: build up once per session.
  useLayoutEffect(() => {
    const store = storage("session");
    const key = `ww-anim:route:${sessionKey}`;
    if (store?.getItem(key)) return;
    store?.setItem(key, "1");
    if (prefersReducedMotion()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off pulse class
    setPulse(true);
    if (serverPainted) return;
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelector("[data-line='done']")
      ?.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], {
        duration: DURATION.moderate,
        easing: EASING.standard,
        fill: "backwards",
      });
    const items = [...root.querySelectorAll("[data-way-item], [data-build]")];
    items.forEach((item, i) => {
      item.animate(
        [
          { opacity: 0, transform: `translateY(${String(DISTANCE.md)}px)` },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: DURATION.slow,
          delay: staggerDelay(i, STAGGER.card),
          easing: EASING.enter,
          fill: "backwards",
        },
      );
    });
  }, [serverPainted, sessionKey]);

  const doneSummary =
    fresh.length > 0
      ? `${t("done.fresh", {
          titles: view.done
            .filter((s) => fresh.includes(s.id))
            .map((s) => s.title)
            .join(", "),
        })} · ${t("done.freshCount", { count: view.done.length })}`
      : view.doneSummary;
  const coins = Math.min(3, view.done.length);
  const todayItems = view.heute.items;
  const heuteVisible = todayItems.slice(0, MAX_TODAY);
  const heuteExtra = todayItems.slice(MAX_TODAY);

  return (
    <div className={styles.cols} ref={rootRef}>
      <div className={styles.main}>
        {offline ? (
          <Banner tone="warning" role="status" className={styles.offline}>
            {t("offline")}
          </Banner>
        ) : null}
        <section className={styles.waySection} aria-labelledby="route-title">
          <div className={styles.secRow}>
            <h2 id="route-title" className={styles.sec}>
              {view.wayTitle}
            </h2>
            {view.meta ? <span className={styles.meta}>{view.meta}</span> : null}
          </div>
          <ol className={styles.way}>
            {view.done.length > 0 ? (
              <li
                className={cx(styles.step, styles.stepDone, fresh.length > 0 && styles.fresh)}
                data-way-item=""
              >
                <span
                  className={cx(styles.line, styles.lineDone)}
                  data-line="done"
                  aria-hidden="true"
                />
                <div className={styles.head}>
                  <Marker kind="done" coins={coins} />
                  <button
                    type="button"
                    className={styles.doneRow}
                    aria-expanded={doneOpen}
                    aria-controls={doneId}
                    onClick={() => {
                      setDoneOpen(!doneOpen);
                      if (!doneOpen) {
                        requestAnimationFrame(() => {
                          revealEntries(document.getElementById(doneId));
                        });
                      }
                    }}
                  >
                    <span className={styles.doneText}>{doneSummary}</span>
                    <span className={styles.chevronDown} aria-hidden="true">
                      <Icon name="chevron-down" size={20} />
                    </span>
                  </button>
                </div>
                <Expand id={doneId} open={doneOpen}>
                  <ul className={styles.doneList}>
                    {view.done.map((station) => (
                      <li key={station.id}>
                        <Target
                          link={station.link}
                          sessionKey={sessionKey}
                          returnKey={`done:${station.id}`}
                          className={styles.doneItem}
                          ariaLabel={station.ariaLabel}
                        >
                          <span
                            className={cx(styles.check, station.unused && styles.checkUnused)}
                            aria-hidden="true"
                          >
                            {station.unused ? null : <Icon name="check" size={16} />}
                          </span>
                          <span className={styles.grow}>
                            <span className={styles.doneTitle}>{station.title}</span>
                            <span className={styles.status}>
                              {station.unused
                                ? `${t("done.unused")} – ${station.status}`
                                : station.status}
                            </span>
                          </span>
                          <Chevron />
                        </Target>
                        {station.offline || station.textActions?.length ? (
                          <div className={styles.doneExtra}>
                            {station.offline ? (
                              <span className={cx(styles.chip, styles.chipOk)}>
                                {t("done.offline")}
                              </span>
                            ) : null}
                            {station.textActions?.map((item) => (
                              <ActionButton
                                key={item.label}
                                action={item.action}
                                sessionKey={sessionKey}
                                returnKey={station.id}
                                variant="text"
                                offline={offline}
                              >
                                {item.label}
                              </ActionButton>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Expand>
              </li>
            ) : null}

            <li className={cx(styles.step, styles.stepToday)} data-way-item="">
              <span className={styles.line} aria-hidden="true" />
              <div className={styles.head}>
                <span
                  className={cx(styles.marker, styles["marker-today"], pulse && styles.pulse)}
                  data-route-marker="today"
                  aria-hidden="true"
                >
                  <Icon name="sun" size={22} />
                </span>
                <h3 id="route-today" className={styles.today} tabIndex={-1}>
                  <span aria-hidden="true">{view.heute.short}</span>
                  <span className="visually-hidden">{view.heute.long}</span>
                </h3>
              </div>
              <p className={styles.sentence}>{view.heute.sentence}</p>
              {heuteVisible.length > 0 ? (
                <ul className={styles.todayList}>
                  {heuteVisible.map((station, index) => (
                    <li key={station.id}>
                      <StationCard
                        station={station}
                        big={index === 0}
                        sessionKey={sessionKey}
                        offline={offline}
                      />
                      <StationActions station={station} sessionKey={sessionKey} offline={offline} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {heuteExtra.length > 0 ? (
                <MoreToggle
                  storageKey={`ww-route-open:${sessionKey}:today`}
                  label={t("more.showMore", { count: heuteExtra.length })}
                >
                  <ul className={styles.todayList}>
                    {heuteExtra.map((station) => (
                      <li key={station.id}>
                        <StationCard
                          station={station}
                          big={false}
                          sessionKey={sessionKey}
                          offline={offline}
                        />
                        <StationActions
                          station={station}
                          sessionKey={sessionKey}
                          offline={offline}
                        />
                      </li>
                    ))}
                  </ul>
                </MoreToggle>
              ) : null}
            </li>

            {view.waiting.slice(0, MAX_WAITING).map((station) => (
              <li key={station.id} className={cx(styles.step, styles.stepWait)} data-way-item="">
                <span className={styles.line} aria-hidden="true" />
                <div className={styles.head}>
                  <Marker kind="wait" />
                  <span className={styles.label}>{t("label.waiting")}</span>
                </div>
                <StationCard
                  station={station}
                  big={false}
                  sessionKey={sessionKey}
                  offline={offline}
                />
                <StationActions station={station} sessionKey={sessionKey} offline={offline} />
              </li>
            ))}
            {view.waiting.length > MAX_WAITING ? (
              <li className={cx(styles.step, styles.stepMore)} data-way-item="">
                <span className={styles.line} aria-hidden="true" />
                <MoreToggle
                  storageKey={`ww-route-open:${sessionKey}:waiting`}
                  label={t("more.showMoreWaiting", { count: view.waiting.length - MAX_WAITING })}
                >
                  <ul className={styles.subList}>
                    {view.waiting.slice(MAX_WAITING).map((station) => (
                      <li key={station.id}>
                        <span className={styles.label}>{t("label.waiting")}</span>
                        <StationCard
                          station={station}
                          big={false}
                          sessionKey={sessionKey}
                          offline={offline}
                        />
                        <StationActions
                          station={station}
                          sessionKey={sessionKey}
                          offline={offline}
                        />
                      </li>
                    ))}
                  </ul>
                </MoreToggle>
              </li>
            ) : null}

            {view.next ? (
              <li className={cx(styles.step, styles.stepNext)} data-way-item="">
                <span className={styles.line} aria-hidden="true" />
                <div className={styles.head}>
                  <Marker kind="next" />
                  <span className={cx(styles.label, styles.labelStrong)}>{t("label.next")}</span>
                </div>
                <StationCard
                  station={view.next}
                  big={false}
                  sessionKey={sessionKey}
                  offline={offline}
                />
                <StationActions station={view.next} sessionKey={sessionKey} offline={offline} />
              </li>
            ) : null}

            {view.later.slice(0, MAX_LATER).map((station) => (
              <li key={station.id} className={cx(styles.step, styles.stepLater)} data-way-item="">
                <span className={styles.line} aria-hidden="true" />
                <div className={styles.head}>
                  <Marker kind="later" />
                  <Target
                    link={station.link}
                    sessionKey={sessionKey}
                    returnKey={station.id}
                    className={styles.slim}
                    ariaLabel={station.ariaLabel}
                  >
                    <span className={styles.grow}>
                      <span className={styles.label}>{t("label.later")}</span>
                      <span className={styles.slimTitle}>{station.title}</span>
                    </span>
                    <Chevron />
                  </Target>
                </div>
              </li>
            ))}
            {view.later.length > MAX_LATER ? (
              <li className={cx(styles.step, styles.stepMore)} data-way-item="">
                <span className={styles.line} aria-hidden="true" />
                <MoreToggle
                  storageKey={`ww-route-open:${sessionKey}:later`}
                  label={t("more.showMoreLater", { count: view.later.length - MAX_LATER })}
                >
                  <ul className={styles.subList}>
                    {view.later.slice(MAX_LATER).map((station) => (
                      <li key={station.id}>
                        <Target
                          link={station.link}
                          sessionKey={sessionKey}
                          returnKey={station.id}
                          className={styles.slim}
                          ariaLabel={station.ariaLabel}
                        >
                          <span className={styles.grow}>
                            <span className={styles.label}>{t("label.later")}</span>
                            <span className={styles.slimTitle}>{station.title}</span>
                          </span>
                          <Chevron />
                        </Target>
                      </li>
                    ))}
                  </ul>
                </MoreToggle>
              </li>
            ) : null}

            <li className={cx(styles.step, styles.stepGoal)} data-way-item="">
              <div className={styles.head}>
                <Marker kind="goal" />
                <span className={cx(styles.label, styles.labelStrong)}>{view.goal.label}</span>
              </div>
              {view.goal.button ? (
                <>
                  <div className={cx(styles.card, styles.goal, styles.goalColumn)}>
                    <span className={styles.goalRow}>
                      <span className={styles.goalTile} aria-hidden="true">
                        <Icon name={view.goal.icon} size={20} />
                      </span>
                      <span className={styles.grow}>
                        <span className={styles.title}>{view.goal.title}</span>
                        <span className={styles.status}>{view.goal.status}</span>
                      </span>
                    </span>
                    <Link href={view.goal.button.href} className={styles.goalButton}>
                      <Icon name="plus" size={20} />
                      <span>{view.goal.button.label}</span>
                    </Link>
                  </div>
                  {view.goal.note ? <p className={styles.goalNote}>{view.goal.note}</p> : null}
                </>
              ) : view.goal.link ? (
                <Target
                  link={view.goal.link}
                  sessionKey={sessionKey}
                  returnKey="goal"
                  className={cx(styles.card, styles.compact, styles.goal)}
                  ariaLabel={view.goal.ariaLabel}
                >
                  <span className={styles.goalTile} aria-hidden="true">
                    <Icon name={view.goal.icon} size={20} />
                  </span>
                  <span className={styles.grow}>
                    <span className={styles.title}>{view.goal.title}</span>
                    <span className={styles.status}>{view.goal.status}</span>
                  </span>
                  <Chevron />
                </Target>
              ) : (
                <div className={cx(styles.card, styles.compact, styles.goal)}>
                  <span className={styles.goalTile} aria-hidden="true">
                    <Icon name={view.goal.icon} size={20} />
                  </span>
                  <span className={styles.grow}>
                    <span className={styles.title}>{view.goal.title}</span>
                    <span className={styles.status}>{view.goal.status}</span>
                  </span>
                </div>
              )}
            </li>
          </ol>
        </section>
      </div>

      <div className={styles.aside}>
        {view.tiles.length > 0 ? (
          <section aria-labelledby="route-tiles" data-build="">
            <h2 id="route-tiles" className={cx(styles.sec, styles.secGap)}>
              {t("tiles.title")}
            </h2>
            <ul className={styles.tiles}>
              {view.tiles.map((tile) => (
                <li key={tile.area}>
                  <Link
                    href={tile.href}
                    className={styles.tile}
                    aria-label={tile.ariaLabel}
                    data-return-key={`tile:${tile.area}`}
                    onClick={() => {
                      rememberReturn(sessionKey, `tile:${tile.area}`);
                    }}
                  >
                    <span className={styles.tileTop}>
                      <Tile icon={tile.icon} tone={tile.tone} size="sm" />
                      <Chevron />
                    </span>
                    <span className={styles.tileTitle}>{tile.title}</span>
                    <span className={styles.tileStatus}>{tile.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section aria-labelledby="route-more" data-build="">
          <h2 id="route-more" className={cx(styles.sec, styles.secGap)}>
            {t("moreTitle")}
          </h2>
          <div className={styles.listCard}>
            <button
              type="button"
              className={styles.row}
              aria-haspopup="dialog"
              data-return-key="more:decided"
              onClick={() => {
                cockpit?.open({ kind: "decided" });
              }}
            >
              <Tile icon="vote" tone="lavender" size="sm" />
              <span className={styles.grow}>
                <span className={styles.rowTitle}>{view.more.decided.title}</span>
                <span className={styles.status}>{view.more.decided.sub}</span>
              </span>
              <Chevron />
            </button>
            <button
              type="button"
              className={styles.row}
              aria-haspopup="dialog"
              data-return-key="more:members"
              onClick={() => {
                cockpit?.open({ kind: "members" });
              }}
            >
              <Tile icon="users" tone="mint" size="sm" />
              <span className={styles.grow}>
                <span className={styles.rowTitle}>{view.more.members.title}</span>
                <span className={styles.status}>{view.more.members.sub}</span>
              </span>
              <Chevron />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
