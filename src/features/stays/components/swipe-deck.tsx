"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import { DISTANCE, DURATION, EASING, prefersReducedMotion, sealPop, spring } from "@/lib/motion";
import type { StayRatingValue } from "@/lib/stays";
import {
  decide,
  dragRotation,
  exitDuration,
  stampOpacity,
  SWIPE,
  threshold,
  velocity,
  type VelocitySample,
} from "@/lib/swipe";
import { rateStayAction } from "../actions";
import type { StayItem } from "../load";
import { useOffline } from "./stays-view";
import { StayImage } from "./stay-image";
import styles from "./swipe.module.css";

/** Resting look of the second card – layout, not motion: fixed values (W18 rules). */
const BACK = "translateY(8px) scale(0.95)";
const RETRY_MS = [1000, 3000, 10_000];

type Dir = 1 | -1;
const valueOf = (dir: Dir): StayRatingValue => (dir > 0 ? "like" : "nope");

interface Flying {
  key: string;
  item: StayItem;
  dir: Dir;
  /** Gesture state on release – null for buttons/arrow keys (starts from rest). */
  from: { tx: number; rot: number; vx: number } | null;
  reduced: boolean;
}

interface Drag {
  id: number;
  x0: number;
  y0: number;
  base: number;
  on: boolean;
  sign: number;
  width: number;
  tx: number;
  rot: number;
  samples: VelocitySample[];
  armed: number;
  card: HTMLElement;
}

export interface SwipeDeckProps {
  publicId: string;
  stack: StayItem[];
  /** Current number of suggestions (for «Unterkunft x von y»). */
  total: number;
  isOrganizer: boolean;
  staysHref: string;
  seal: ReactNode;
}

/**
 * «Unterkünfte bewerten» (W18 E.5, motion W18-A/W18-01 – W18-18): a stack of the own unrated
 * suggestions. Rating by gesture (Pointer Events, no library), by the buttons ✕ / ↶ / ♥ (fixed
 * bar at the bottom, M-U13 – equal alternative, SC 2.5.7) or by ← / → and Ctrl/Cmd+Z. State
 * first: count, announcement and the next card change in the same frame as the decision; the
 * fly-out is only the coda. Each rating is saved at once (optimistic, retries); undo goes back
 * through every rating of this stack session. No vibration, no confetti.
 */
export function SwipeDeck({
  publicId,
  stack,
  total,
  isOrganizer,
  staysHref,
  seal,
}: SwipeDeckProps) {
  const t = useTranslations("stays.swipe");
  const tRate = useTranslations("stays.rate");
  const router = useRouter();
  const toast = useToast();
  const offline = useOffline();
  const [queue, setQueue] = useState<StayItem[]>(stack);
  const [count, setCount] = useState(total);
  const [history, setHistory] = useState<{ item: StayItem; dir: Dir }[]>([]);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [ending, setEnding] = useState(stack.length === 0);
  const [showEnd, setShowEnd] = useState(stack.length === 0);
  const [celebrate, setCelebrate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [fixedTitle, setFixedTitle] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [armed, setArmed] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement | null>(null);
  const backRef = useRef<HTMLElement | null>(null);
  const likeRef = useRef<HTMLButtonElement>(null);
  const nopeRef = useRef<HTMLButtonElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLHeadingElement>(null);
  const endBlockRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const swallowClick = useRef(false);
  const flyCounter = useRef(0);
  /** Transform the new top card rises from (W18-05). */
  const riseFrom = useRef<string | null>(null);
  /** Card coming back by undo (W18-07): direction and old stamp. */
  const returning = useRef<{ id: string; dir: Dir } | null>(null);
  const focusHeading = useRef(false);
  const known = useRef(new Set(stack.map((s) => s.id)));
  const queueRef = useRef(queue);
  useLayoutEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const top = queue[0];
  const back = queue[1];
  const rated = count - queue.length;
  const position = Math.min(rated + 1, count);

  /* ------------------------------ saving ------------------------------ */

  const putBack = useCallback(
    (item: StayItem, dir: Dir, message: string) => {
      returning.current = { id: item.id, dir };
      setQueue((current) => (current.some((c) => c.id === item.id) ? current : [item, ...current]));
      setHistory((current) => current.filter((h) => h.item.id !== item.id));
      setEnding(false);
      setShowEnd(false);
      toast({ message });
    },
    [toast],
  );

  const mergeOpen = useCallback(
    (open: StayItem[]) => {
      const openIds = new Set(open.map((o) => o.id));
      const added = open.filter((o) => !known.current.has(o.id));
      for (const item of added) known.current.add(item.id);
      const removed = queueRef.current.filter((q) => !openIds.has(q.id));
      if (added.length > 0) {
        setQueue((current) => [...current.filter((c) => openIds.has(c.id)), ...added]);
        setCount((current) => current + added.length - removed.length);
        setEnding(false);
        setShowEnd(false);
        const text = t("newArrived", { count: added.length });
        setBanner(text);
        setAnnouncement(text);
      } else if (removed.length > 0) {
        setQueue((current) => current.filter((c) => openIds.has(c.id)));
        setCount((current) => current - removed.length);
        const text = t("removedUnknown");
        setBanner(text);
        setAnnouncement(text);
      }
    },
    [t],
  );

  const saveRef = useRef<
    (item: StayItem, value: StayRatingValue | null, dir: Dir, attempt?: number) => void
  >(() => undefined);
  const save = useCallback(
    (item: StayItem, value: StayRatingValue | null, dir: Dir, attempt = 0) => {
      if (attempt === 0) setPendingSaves((n) => n + 1);
      const finish = () => {
        setPendingSaves((n) => n - 1);
      };
      void rateStayAction(publicId, item.id, value)
        .then((result) => {
          if (result.ok) {
            setBanner((current) => (current === t("offline") ? null : current));
            mergeOpen(result.open);
            finish();
            return;
          }
          finish();
          switch (result.error) {
            case "chosen":
              setFixedTitle("");
              router.refresh();
              return;
            case "phase":
              router.push(`/trips/${publicId}`);
              return;
            case "gone": {
              const text = t("removedUnknown");
              setBanner(text);
              setAnnouncement(text);
              setCount((current) => current - 1);
              return;
            }
            case "limited":
              if (value !== null) putBack(item, dir, t("slow"));
              return;
            default:
              if (value !== null) putBack(item, dir, t("failed"));
          }
        })
        .catch(() => {
          const wait = RETRY_MS[attempt];
          if (wait === undefined) {
            finish();
            if (value !== null) putBack(item, dir, t("failed"));
            return;
          }
          setBanner(t("offline"));
          window.setTimeout(() => {
            saveRef.current(item, value, dir, attempt + 1);
          }, wait);
        });
    },
    [mergeOpen, publicId, putBack, router, t],
  );
  useLayoutEffect(() => {
    saveRef.current = save;
  }, [save]);

  /* ------------------------------ end of stack ------------------------------ */

  // W18-08: the end block only after the server confirmed every rating («Speichert …» after
  // 400 ms); focus first, then the motion.
  useEffect(() => {
    if (!ending || showEnd) return;
    if (pendingSaves === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- confirmed by the server
      setSaving(false);
      setShowEnd(true);
      setCelebrate(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setSaving(true);
    }, 400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [ending, showEnd, pendingSaves]);

  useLayoutEffect(() => {
    if (!showEnd || !celebrate) return;
    endRef.current?.focus({ preventScroll: true });
    const block = endBlockRef.current;
    if (block && !prefersReducedMotion()) {
      block.animate(
        [
          { opacity: 0, transform: `translateY(${String(DISTANCE.sm)}px)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: DURATION.base, easing: EASING.enter, fill: "backwards" },
      );
      sealPop(block.querySelector("[data-seal='end']"), 64);
    }
  }, [showEnd, celebrate]);

  /* ------------------------------ deciding ------------------------------ */

  const commit = useCallback(
    (dir: Dir, gesture: Flying["from"]) => {
      const current = queueRef.current;
      const item = current[0];
      if (!item || ending) return;
      const card = topRef.current;
      const hadFocus = card?.contains(document.activeElement) ?? false;
      const reduced = prefersReducedMotion();
      const backElement = backRef.current;
      riseFrom.current = backElement ? backElement.style.transform || BACK : null;
      setFlying((list) => {
        const next = [
          ...list,
          { key: `fly-${String(flyCounter.current++)}`, item, dir, from: gesture, reduced },
        ];
        return next.length > 2 ? next.slice(-2) : next;
      });
      setQueue(current.slice(1));
      setHistory((list) => [...list, { item, dir }]);
      setArmed(0);
      const left = current.length - 1;
      setAnnouncement(
        t("announce", {
          title: item.title,
          rating: dir > 0 ? tRate("like") : tRate("nope"),
          count: left,
        }),
      );
      focusHeading.current = hadFocus;
      save(item, valueOf(dir), dir);
      if (left === 0) setEnding(true);
    },
    [ending, save, t, tRate],
  );

  const undo = useCallback(() => {
    if (drag.current?.on) return;
    const last = history[history.length - 1];
    if (!last) return;
    setHistory(history.slice(0, -1));
    returning.current = { id: last.item.id, dir: last.dir };
    setQueue((current) => [last.item, ...current.filter((c) => c.id !== last.item.id)]);
    setEnding(false);
    setShowEnd(false);
    setCelebrate(false);
    setSaving(false);
    setAnnouncement(t("undone", { title: last.item.title }));
    save(last.item, null, last.dir);
    requestAnimationFrame(() => {
      undoRef.current?.focus({ preventScroll: true });
    });
  }, [history, save, t]);

  /* ------------------------------ motion after state ------------------------------ */

  // New top card: rises from its back position (W18-05) or returns from its exit direction
  // (W18-07, with its old stamp fading out). The new back card fades in.
  useLayoutEffect(() => {
    const card = topRef.current;
    const reduced = prefersReducedMotion();
    const back = returning.current;
    if (card && back && card.dataset.id === back.id) {
      returning.current = null;
      const width = card.offsetWidth;
      if (reduced) {
        card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION.fade });
      } else {
        card.animate(
          [
            {
              transform: `translateX(${String(back.dir * SWIPE.exitRatio * width)}px) rotate(${String(back.dir * SWIPE.rotateMax)}deg)`,
            },
            { transform: "none" },
          ],
          { duration: DURATION.slow, easing: spring("soft") },
        );
        card.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: DURATION.fast,
          easing: "linear",
        });
        backRef.current?.animate([{ transform: "none" }, { transform: BACK }], {
          duration: DURATION.base,
          easing: EASING.standard,
        });
        const stamp = card.querySelector<HTMLElement>(
          back.dir > 0 ? "[data-stamp='like']" : "[data-stamp='nope']",
        );
        stamp?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], {
          duration: DURATION.moderate,
          easing: EASING.standard,
        });
        undoRef.current
          ?.querySelector("svg")
          ?.animate([{ transform: "rotate(-90deg)" }, { transform: "none" }], {
            duration: DURATION.base,
            easing: spring("soft"),
          });
      }
      return;
    }
    const from = riseFrom.current;
    riseFrom.current = null;
    if (card) {
      card.style.transform = "";
      card.style.willChange = "";
    }
    if (card && from && !reduced) {
      card.animate([{ transform: from }, { transform: "none" }], {
        duration: DURATION.base,
        easing: spring("soft"),
      });
      backRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: DURATION.fast,
        delay: 60,
        easing: "linear",
        fill: "backwards",
      });
    }
    if (card && focusHeading.current) {
      focusHeading.current = false;
      card.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    }
  }, [top?.id]);

  /* ------------------------------ gesture ------------------------------ */

  const stamps = (card: HTMLElement) => ({
    like: card.querySelector<HTMLElement>("[data-stamp='like']"),
    nope: card.querySelector<HTMLElement>("[data-stamp='nope']"),
  });

  const applyDrag = useCallback((d: Drag) => {
    const reduced = prefersReducedMotion();
    const thr = threshold(d.width);
    const q = Math.min(Math.abs(d.tx) / thr, 1);
    const dir = d.tx >= 0 ? 1 : -1;
    d.rot = dragRotation(d.tx, reduced);
    d.card.style.transform = `translateX(${d.tx.toFixed(1)}px) rotate(${d.rot.toFixed(2)}deg)`;
    const { like, nope } = stamps(d.card);
    const on = dir > 0 ? like : nope;
    const off = dir > 0 ? nope : like;
    if (on) {
      on.style.opacity = stampOpacity(d.tx, thr).toFixed(3);
      on.style.scale = reduced ? "1" : String(0.9 + 0.1 * q);
    }
    if (off) off.style.opacity = "0";
    const backCard = backRef.current;
    if (backCard && !reduced) {
      backCard.style.transform = `translateY(${(8 - 4 * q).toFixed(2)}px) scale(${(0.95 + 0.025 * q).toFixed(4)})`;
    }
    // W18-02: at the threshold the stamp nods once and the matching button looks pressed.
    if (q >= 1 && d.armed !== dir) {
      d.armed = dir;
      setArmed(dir);
      if (on && !reduced) {
        on.animate([{ scale: "1" }, { scale: "1.08" }, { scale: "1" }], {
          duration: DURATION.fast,
          easing: EASING.standard,
        });
      }
    } else if (q < 0.9 && d.armed !== 0) {
      d.armed = 0;
      setArmed(0);
    }
  }, []);

  const springBack = useCallback((card: HTMLElement) => {
    const reduced = prefersReducedMotion();
    const from = card.style.transform;
    card.style.transform = "";
    if (!reduced && from) {
      card.animate([{ transform: from }, { transform: "none" }], {
        duration: DURATION.slow,
        easing: spring("soft"),
      });
    }
    const { like, nope } = stamps(card);
    for (const stamp of [like, nope]) {
      if (!stamp) continue;
      const opacity = Number(stamp.style.opacity) || 0;
      stamp.style.opacity = "";
      stamp.style.scale = "";
      if (opacity > 0) {
        stamp.animate([{ opacity }, { opacity: 0 }], {
          duration: reduced ? DURATION.fade : DURATION.fast,
          easing: reduced ? "linear" : EASING.exit,
        });
      }
    }
    const backCard = backRef.current;
    if (backCard) {
      const backFrom = backCard.style.transform;
      backCard.style.transform = "";
      if (!reduced && backFrom && backFrom !== BACK) {
        backCard.animate([{ transform: backFrom }, { transform: BACK }], {
          duration: DURATION.slow,
          easing: spring("soft"),
        });
      }
    }
    setArmed(0);
  }, []);

  useEffect(() => {
    const stackElement = stackRef.current;
    if (!stackElement) return;
    const freeze = (element: Element | null) => {
      for (const animation of element?.getAnimations() ?? []) {
        if (animation instanceof CSSAnimation) continue;
        try {
          animation.commitStyles();
        } catch {
          // element not rendered
        }
        animation.cancel();
      }
    };
    const onDown = (event: PointerEvent) => {
      const card = topRef.current;
      if (drag.current || !card || (event.pointerType === "mouse" && event.button !== 0)) return;
      const target = event.target as Element;
      if (!card.contains(target) || target.closest("a, button")) return;
      if (event.clientX < SWIPE.edgePx || event.clientX > window.innerWidth - SWIPE.edgePx) return;
      freeze(card);
      freeze(backRef.current);
      const matrix = new DOMMatrixReadOnly(
        getComputedStyle(card).transform === "none" ? undefined : getComputedStyle(card).transform,
      );
      drag.current = {
        id: event.pointerId,
        x0: event.clientX,
        y0: event.clientY,
        base: matrix.m41,
        on: false,
        sign: 1,
        width: card.offsetWidth,
        tx: matrix.m41,
        rot: 0,
        samples: [{ t: event.timeStamp, x: event.clientX }],
        armed: 0,
        card,
      };
    };
    const onMove = (event: PointerEvent) => {
      const d = drag.current;
      if (!d || event.pointerId !== d.id) return;
      const dx = event.clientX - d.x0;
      const dy = event.clientY - d.y0;
      if (!d.on) {
        if (Math.abs(dx) < SWIPE.slopPx && Math.abs(dy) < SWIPE.slopPx) return;
        if (Math.abs(dx) <= Math.abs(dy)) {
          drag.current = null; // vertical: belongs to the page scroll
          return;
        }
        d.on = true;
        d.sign = dx > 0 ? 1 : -1;
        try {
          d.card.setPointerCapture(event.pointerId);
        } catch {
          // pointer gone
        }
        d.card.dataset.dragging = "";
        d.card.style.willChange = "transform";
        if (backRef.current) backRef.current.style.willChange = "transform";
      }
      d.tx = d.base + dx - d.sign * SWIPE.slopPx;
      d.samples.push({ t: event.timeStamp, x: event.clientX });
      while (
        d.samples.length > 2 &&
        event.timeStamp - (d.samples[0]?.t ?? 0) > SWIPE.velocityWindowMs
      ) {
        d.samples.shift();
      }
      if (!frame.current) {
        frame.current = requestAnimationFrame(() => {
          frame.current = 0;
          if (drag.current?.on) applyDrag(drag.current);
        });
      }
    };
    const release = (event: PointerEvent, cancelled: boolean) => {
      const d = drag.current;
      if (!d || event.pointerId !== d.id) return;
      drag.current = null;
      if (frame.current) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
      if (!d.on) return;
      applyDrag(d);
      swallowClick.current = true;
      window.setTimeout(() => {
        swallowClick.current = false;
      }, 0);
      delete d.card.dataset.dragging;
      d.card.style.willChange = "";
      if (backRef.current) backRef.current.style.willChange = "";
      const vx = cancelled ? 0 : velocity(d.samples, event.timeStamp);
      const dir = cancelled ? 0 : decide(d.tx, vx, threshold(d.width));
      if (dir === 0) {
        springBack(d.card);
        return;
      }
      commit(dir, { tx: d.tx, rot: d.rot, vx });
    };
    const onUp = (event: PointerEvent) => {
      release(event, false);
    };
    const onCancel = (event: PointerEvent) => {
      release(event, true);
    };
    const onClick = (event: MouseEvent) => {
      if (swallowClick.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    stackElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    stackElement.addEventListener("click", onClick, true);
    return () => {
      stackElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      stackElement.removeEventListener("click", onClick, true);
    };
  }, [applyDrag, commit, springBack]);

  // Keyboard (E.5.4): ← pass, → like (not while held down), Ctrl/Cmd+Z undo.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("input, textarea, select, [contenteditable], [role='dialog']")) return;
      if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        if (!event.repeat) undo();
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      if (event.repeat || !queueRef.current[0]) return;
      commit(event.key === "ArrowRight" ? 1 : -1, null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [commit, undo]);

  /* ------------------------------ render ------------------------------ */

  if (fixedTitle !== null) {
    return (
      <section className={styles.end} aria-labelledby="swipe-fixed">
        <h2 id="swipe-fixed" className={styles.endTitle} tabIndex={-1}>
          {t("fixedTitle")}
        </h2>
        <ButtonLink href={staysHref} size="lg">
          {t("toStay")}
        </ButtonLink>
      </section>
    );
  }

  const undoDisabled = history.length === 0;
  return (
    <div className={styles.deck}>
      <p className={styles.counter}>
        <span>{t("position", { pos: position, total: count })}</span>
        <span>{t("left", { count: queue.length })}</span>
      </p>
      {banner ? (
        <p className={styles.banner} role="status">
          <Icon name="info" size={18} />
          {banner}
        </p>
      ) : null}
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>

      {showEnd ? (
        <div ref={endBlockRef} className={styles.end}>
          <span className={styles.endSeal} data-seal="end" aria-hidden="true">
            {seal}
          </span>
          <h2 ref={endRef} className={styles.endTitle} tabIndex={-1}>
            {t("doneTitle")}
          </h2>
          <p className={styles.endText}>
            {isOrganizer ? t("doneOrga", { total: count }) : t("doneText", { total: count })}
          </p>
          <ButtonLink href={`${staysHref}#ranking`} size="lg" block>
            {t("toRanking")}
          </ButtonLink>
          {history.length > 0 ? (
            <button type="button" className={styles.textButton} onClick={undo}>
              {t("undoLast")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div ref={stackRef} className={styles.stack} hidden={showEnd && flying.length === 0}>
        {back ? (
          <SwipeCard key={back.id} item={back} cardRef={backRef} position="back" t={t} />
        ) : null}
        {top ? <SwipeCard key={top.id} item={top} cardRef={topRef} position="top" t={t} /> : null}
        {flying.map((fly) => (
          <FlyingCard
            key={fly.key}
            fly={fly}
            t={t}
            onDone={() => {
              setFlying((list) => list.filter((f) => f.key !== fly.key));
            }}
          />
        ))}
      </div>

      {saving && !showEnd ? <p className={styles.saving}>{t("saving")}</p> : null}

      {showEnd ? null : (
        <div className={styles.bar} data-swipe-bar="">
          <div className={styles.buttons} role="group" aria-label={t("group")}>
            <span className={styles.buttonCell}>
              <button
                ref={nopeRef}
                type="button"
                className={cx(styles.rateButton, styles.nope, armed < 0 && styles.armed)}
                aria-disabled={!top || undefined}
                aria-labelledby="swipe-label-nope"
                onClick={() => {
                  if (!drag.current?.on && top) commit(-1, null);
                }}
              >
                <Icon name="cross" size={28} />
              </button>
              <span id="swipe-label-nope" className={styles.buttonLabel}>
                {tRate("nope")}
              </span>
            </span>
            <span className={styles.buttonCell}>
              <button
                ref={undoRef}
                type="button"
                className={cx(styles.rateButton, styles.undo)}
                aria-disabled={undoDisabled || undefined}
                aria-label={t("undoName")}
                onClick={() => {
                  if (!undoDisabled) undo();
                }}
              >
                <Icon name="undo" size={20} />
              </button>
              <span className={styles.buttonLabel} aria-hidden="true">
                {t("undo")}
              </span>
            </span>
            <span className={styles.buttonCell}>
              <button
                ref={likeRef}
                type="button"
                className={cx(styles.rateButton, styles.like, armed > 0 && styles.armed)}
                aria-disabled={!top || undefined}
                aria-labelledby="swipe-label-like"
                onClick={() => {
                  if (!drag.current?.on && top) commit(1, null);
                }}
              >
                <Icon name="heart-filled" size={28} />
              </button>
              <span id="swipe-label-like" className={styles.buttonLabel}>
                {tRate("like")}
              </span>
            </span>
          </div>
          <p className={styles.hint}>
            <span className={styles.hintWide}>{t("hint")}</span>
            <span className={styles.hintTouch}>{t("hintTouch")}</span>
          </p>
          {offline ? <p className={styles.hint}>{t("offline")}</p> : null}
        </div>
      )}
    </div>
  );
}

type Translate = ReturnType<typeof useTranslations<"stays.swipe">>;

function CardContent({ item, t, headingId }: { item: StayItem; t: Translate; headingId?: string }) {
  return (
    <>
      <span className={styles.media}>
        <StayImage src={item.image} className={styles.image} lazy={false} />
        <span className={styles.source}>
          {item.hasPreview
            ? t("preview", { domain: item.host })
            : t("noPreview", { domain: item.host })}
        </span>
        <span className={cx(styles.stamp, styles.stampLike)} data-stamp="like" aria-hidden="true">
          <Icon name="heart-filled" size={20} />
          {t("stampLike")}
        </span>
        <span className={cx(styles.stamp, styles.stampNope)} data-stamp="nope" aria-hidden="true">
          <Icon name="cross" size={20} />
          {t("stampNope")}
        </span>
      </span>
      <span className={styles.info}>
        <h2 className={styles.title} id={headingId} tabIndex={-1}>
          {item.title}
        </h2>
        <p className={styles.price}>
          {item.price
            ? `${t("total", { price: item.price })} · ${t("perPerson", { amount: item.perPerson ?? "" })}`
            : t("noPrice")}
        </p>
        <p className={styles.note}>
          {item.note
            ? t("note", { note: item.note, name: item.author ?? "–" })
            : item.author
              ? t("by", { name: item.author })
              : null}
        </p>
        {item.href ? (
          <a className={styles.link} href={item.href} target="_blank" rel="noopener noreferrer">
            {t("open", { domain: item.host })}
            <Icon name="external" size={16} />
          </a>
        ) : null}
      </span>
    </>
  );
}

function SwipeCard({
  item,
  cardRef,
  position,
  t,
}: {
  item: StayItem;
  cardRef: RefObject<HTMLElement | null>;
  position: "top" | "back";
  t: Translate;
}) {
  const headingId = `swipe-card-${item.id}`;
  if (position === "back") {
    return (
      <article
        ref={cardRef}
        className={cx(styles.card, styles.back)}
        data-id={item.id}
        aria-hidden="true"
        inert
      >
        <CardContent item={item} t={t} />
      </article>
    );
  }
  return (
    <article
      ref={cardRef}
      className={cx(styles.card, styles.top)}
      data-id={item.id}
      data-swipe-card=""
      aria-roledescription={t("card")}
      aria-labelledby={headingId}
    >
      <CardContent item={item} t={t} headingId={headingId} />
    </article>
  );
}

function FlyingCard({ fly, t, onDone }: { fly: Flying; t: Translate; onDone: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const done = useRef(onDone);
  useLayoutEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useLayoutEffect(() => {
    const card = ref.current;
    if (!card) return;
    const { dir, from, reduced } = fly;
    const stamp = card.querySelector<HTMLElement>(
      dir > 0 ? "[data-stamp='like']" : "[data-stamp='nope']",
    );
    if (stamp) stamp.style.opacity = "1";
    let animation: Animation;
    if (reduced) {
      animation = card.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: DURATION.fade,
        easing: "linear",
        fill: "forwards",
      });
    } else {
      const width = card.offsetWidth;
      const endX = dir * SWIPE.exitRatio * width;
      const tx = from?.tx ?? 0;
      const rot = from?.rot ?? 0;
      const endRot = from ? dir * Math.min(Math.abs(rot) + 8, 20) : dir * SWIPE.rotateMax;
      if (!from && stamp) {
        stamp.animate(
          [
            { opacity: 0, scale: "0.9" },
            { opacity: 1, scale: "1" },
          ],
          {
            duration: DURATION.fast,
            easing: spring("soft"),
          },
        );
      }
      animation = card.animate(
        [
          { transform: `translateX(${String(tx)}px) rotate(${String(rot)}deg)`, opacity: 1 },
          { opacity: 1, offset: 0.5 },
          {
            transform: `translateX(${endX.toFixed(1)}px) rotate(${String(endRot)}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: from ? exitDuration(endX - tx, from.vx) : DURATION.base,
          easing: from ? "linear" : EASING.exit,
          fill: "forwards",
        },
      );
    }
    animation.onfinish = () => {
      done.current();
    };
    animation.oncancel = () => {
      done.current();
    };
    return () => {
      animation.onfinish = null;
    };
  }, [fly]);
  return (
    <article
      ref={ref}
      className={cx(styles.card, styles.flying)}
      style={{
        transform:
          fly.from && !fly.reduced
            ? `translateX(${String(fly.from.tx)}px) rotate(${String(fly.from.rot)}deg)`
            : undefined,
      }}
      aria-hidden="true"
      inert
    >
      <CardContent item={fly.item} t={t} />
    </article>
  );
}
