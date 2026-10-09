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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Banner } from "@/components/ui/banner";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  charCount,
  COMMENT_COUNTER_FROM,
  COMMENT_MAX,
  paint,
  paintEach,
  paintTarget,
  pushHistory,
  quickActionTargets,
  replay,
  stateOf,
  toEntries,
  fromEntries,
  type AvailabilityEntry,
  type DayChange,
  type DayState,
  type ImportFeedback,
  type QuickAction,
  type StateMap,
} from "@/lib/availability";
import {
  datesBetween,
  editableWindow,
  isWeekend,
  moveInCalendar,
  orderedRange,
  type CalendarKey,
} from "@/lib/calendar";
import { cx } from "@/lib/cx";
import { addDays, formatDate, formatDateRange, type IsoDate } from "@/lib/dates";
import type { Holiday } from "@/lib/holidays";
import {
  animate,
  DISTANCE,
  DURATION,
  EASING,
  enter,
  prefersReducedMotion,
  SCALE,
  spring,
  STAGGER,
  staggerDelay,
} from "@/lib/motion";
import {
  importFeedbackAction,
  saveCommentAction,
  saveDaysAction,
  submitDaysAction,
  type DaysError,
} from "../actions";
import { useAutosave } from "../use-autosave";
import { DaysToolbar } from "./days-toolbar";
import { EmptySubmitSheet, QuickActionsSheet, SuccessSheet } from "./days-sheets";
import { MonthGrid, type CellModel, type DayMonth, type WeekdayHeader } from "./month-grid";
import styles from "./days.module.css";

export interface DaysEditorProps {
  publicId: string;
  /** First name for «Danke, Kemal!». */
  name: string;
  today: IsoDate;
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  intl: string;
  months: DayMonth[];
  weekdays: WeekdayHeader[];
  /** Long date per grid day, e.g. «Donnerstag, 6. Mai 2027» (formatted on the server). */
  dateLabels: Record<IsoDate, string>;
  /** Short date for holiday lists, e.g. «6.5.» / «6 May». */
  shortDates: Record<IsoDate, string>;
  firstDay: 0 | 1;
  holidays: Holiday[];
  /** Holidays of the trip's region when it differs from the own one (F-016), else null. */
  tripHolidays: Holiday[] | null;
  regionLabel: string;
  tripRegionLabel: string | null;
  accountHref: string;
  initial: AvailabilityEntry[];
  submittedAt: string | null;
  updatedAt: string | null;
  comment: string;
  /** "edit" · "locked" (dates fixed) · "lockedPast" (trip over). */
  mode: "edit" | "locked" | "lockedPast";
  voting: boolean;
  askFeedback: boolean;
  /** Where to go after submitting (Flow B.3 #4). */
  doneHref: string;
  loginHref: string;
  /** Server-rendered seal for the success sheet (G-21). */
  successArt: ReactNode;
  /** First visit after joining: the swipe gesture hint (W03-07). */
  gesture: boolean;
}

type Preview = { from: IsoDate; to: IsoDate; target: DayState } | null;

interface DragState {
  pointerId: number;
  touch: boolean;
  start: IsoDate;
  current: IsoDate;
  x0: number;
  y0: number;
  x: number;
  y: number;
  active: boolean;
  timer: number | undefined;
}

const AUTO_SCROLL_ZONE = 48;
const AUTO_SCROLL_MAX = 12;
const LONG_PRESS_MS = 300;
const TAN_30 = Math.tan(Math.PI / 6);

/**
 * «Meine Tage» (F-005, F-016, Flow B, W08, ux-spec §4.12/§7.3, motion W08-01…15): brush
 * + tap/drag/range mode, keyboard grid with roving tabindex, undo/redo, quick actions,
 * optimistic autosave, submit with success sheet. Painting is pure state (src/lib/
 * availability.ts); motion only decorates it and never hides content (R-017).
 */
export function DaysEditor(props: DaysEditorProps) {
  const t = useTranslations("days");
  const router = useRouter();
  const toast = useToast();
  const readOnly = props.mode !== "edit";
  const window_ = useMemo(
    () => editableWindow(props.rangeStart, props.rangeEnd, props.today),
    [props.rangeStart, props.rangeEnd, props.today],
  );
  const editableDays = useMemo(
    () => (window_ && !readOnly ? datesBetween(window_.first, window_.last) : []),
    [window_, readOnly],
  );
  const isEditable = useCallback(
    (date: IsoDate) =>
      !readOnly && window_ !== null && date >= window_.first && date <= window_.last,
    [readOnly, window_],
  );

  const [states, setStates] = useState<StateMap>(() => fromEntries(props.initial));
  const statesRef = useRef(states);
  const [brush, setBrush] = useState<DayState>("no");
  const [rangeMode, setRangeMode] = useState(false);
  const [anchor, setAnchor] = useState<IsoDate | null>(null);
  const [preview, setPreview] = useState<Preview>(null);
  const [gestureDays, setGestureDays] = useState<IsoDate[] | null>(null);
  const [focusDate, setFocusDate] = useState<IsoDate | null>(window_?.first ?? null);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const undoStack = useRef<DayChange[][]>([]);
  const redoStack = useRef<DayChange[][]>([]);
  const lastChanged = useRef<IsoDate | null>(null);
  const selection = useRef<{ anchor: IsoDate; focus: IsoDate } | null>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const keyHandled = useRef(false);
  const [showTripHolidays, setShowTripHolidays] = useState(false);
  const [sheet, setSheet] = useState<"quick" | "empty" | "success" | null>(null);
  const [submittedAt, setSubmittedAt] = useState(props.submittedAt);
  const [updatedAt, setUpdatedAt] = useState(props.updatedAt ?? props.submittedAt);
  const [submitting, setSubmitting] = useState(false);
  const [online, setOnline] = useState(true);
  const [problem, setProblem] = useState<"rangeChanged" | "signedOut" | "error" | null>(null);
  const [legendOpen, setLegendOpen] = useState(!props.submittedAt);
  const [announcement, setAnnouncement] = useState("");
  const [comment, setComment] = useState(props.comment);
  const savedComment = useRef(props.comment);
  const [commentError, setCommentError] = useState(false);
  const [slowSaving, setSlowSaving] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragLabelRef = useRef<HTMLDivElement>(null);
  const undoIconRef = useRef<HTMLSpanElement>(null);

  // ---------------------------------------------------------------------------
  // Formatting helpers (client-side only after interactions – no hydration risk)
  // ---------------------------------------------------------------------------
  const dayText = useCallback(
    (date: IsoDate) => formatDate(date, props.intl, { weekday: false, year: false }),
    [props.intl],
  );
  const rangeText = useCallback(
    (a: IsoDate, b: IsoDate) =>
      a === b ? dayText(a) : formatDateRange(a, b, props.intl, { today: props.today }),
    [dayText, props.intl, props.today],
  );
  const announce = useCallback((text: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => {
      setAnnouncement(text);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Holidays (own region + optionally the trip's region)
  // ---------------------------------------------------------------------------
  const holidayNames = useMemo(() => {
    const map = new Map<IsoDate, string[]>();
    const add = (list: Holiday[], trip: boolean) => {
      for (const holiday of list) {
        const names = map.get(holiday.date) ?? [];
        const name = trip ? t("tripHoliday", { name: holiday.name }) : holiday.name;
        if (!names.includes(holiday.name) && !names.includes(name)) names.push(name);
        map.set(holiday.date, names);
      }
    };
    add(props.holidays, false);
    if (showTripHolidays && props.tripHolidays) add(props.tripHolidays, true);
    return map;
  }, [props.holidays, props.tripHolidays, showTripHolidays, t]);
  const holidaySet = useMemo(() => new Set(holidayNames.keys()), [holidayNames]);

  // ---------------------------------------------------------------------------
  // Saving
  // ---------------------------------------------------------------------------
  const snapshot = useCallback(
    () => toEntries(statesRef.current, (date) => isEditable(date)),
    [isEditable],
  );
  const onRejected = useCallback(
    (error: DaysError) => {
      if (error === "rangeChanged" || error === "readOnly") {
        setProblem("rangeChanged");
        router.refresh();
      } else if (error === "signedOut") {
        setProblem("signedOut");
      } else {
        setProblem("error");
      }
    },
    [router],
  );
  const saver = useAutosave({
    save: (entries) => saveDaysAction(props.publicId, entries),
    snapshot,
    onRejected,
    onSaved: (at) => {
      setProblem(null);
      setUpdatedAt(at);
    },
  });

  useEffect(() => {
    if (saver.status !== "saving") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven display state
      setSlowSaving(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setSlowSaving(true);
    }, 400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [saver.status]);

  // Offline banner (ux-spec §6) – back online retries right away.
  const { retry } = saver;
  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) retry();
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [retry]);

  // ---------------------------------------------------------------------------
  // Motion helpers (W08-03/-07/-08): springs in date order, only transform
  // ---------------------------------------------------------------------------
  const cellElement = useCallback(
    (date: IsoDate) =>
      calendarRef.current?.querySelector<HTMLElement>(`[data-date="${date}"]`) ?? null,
    [],
  );
  const wave = useCallback(
    (dates: IsoDate[], options: { backward?: boolean; visibleOnly?: boolean } = {}) => {
      if (dates.length < 2 || prefersReducedMotion()) return;
      requestAnimationFrame(() => {
        let elements = (options.backward ? [...dates].reverse() : dates)
          .map((date) => cellElement(date))
          .filter((element): element is HTMLElement => element !== null);
        if (options.visibleOnly) {
          elements = elements.filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
          });
        }
        const step = options.visibleOnly ? 6 : STAGGER.cell;
        elements.forEach((element, index) => {
          animate(element, [{ transform: `scale(${String(SCALE.cell)})` }, { transform: "none" }], {
            duration: DURATION.base,
            easing: spring("soft"),
            delay: staggerDelay(index, step),
            fill: "backwards",
          });
        });
      });
    },
    [cellElement],
  );

  // ---------------------------------------------------------------------------
  // Applying changes
  // ---------------------------------------------------------------------------
  const commit = useCallback(
    (next: StateMap, changes: DayChange[]) => {
      statesRef.current = next;
      setStates(next);
      undoStack.current = pushHistory(undoStack.current, changes);
      redoStack.current = [];
      setHistory({ undo: undoStack.current.length, redo: 0 });
      saver.schedule();
    },
    [saver],
  );

  const undoRef = useRef<() => void>(() => undefined);
  const stopGestureRef = useRef<() => void>(() => undefined);

  const reportPaint = useCallback(
    (dates: IsoDate[], to: DayState, changed: number) => {
      const state = t(`state.${to}`);
      const first = dates[0];
      const last = dates.at(-1);
      if (!first || !last) return;
      if (dates.length === 1) {
        announce(t("announce.single", { date: dayText(first), state }));
        return;
      }
      announce(t("announce.range", { range: rangeText(first, last), count: dates.length, state }));
      if (changed >= 2) {
        toast({
          message: t("announce.toast", { count: changed, state }),
          action: {
            label: t("undo"),
            onAction: () => {
              undoRef.current();
            },
          },
        });
      }
    },
    [announce, dayText, rangeText, t, toast],
  );

  /** Paints `dates` with the target of the «first day decides» rule (Flow B.2). */
  const applyRange = useCallback(
    (from: IsoDate, to: IsoDate) => {
      const dates = orderedRange(from, to).filter((date) => isEditable(date));
      if (dates.length === 0) return;
      const target = paintTarget(stateOf(statesRef.current, from), brush);
      const { map, changes } = paint(statesRef.current, dates, target);
      lastChanged.current = to;
      if (changes.length === 0) {
        announce(t("announce.nothing"));
        return;
      }
      commit(map, changes);
      reportPaint(dates, target, changes.length);
      wave(changes.map((change) => change.date));
    },
    [announce, brush, commit, isEditable, reportPaint, t, wave],
  );

  const runQuickAction = useCallback(
    (action: QuickAction) => {
      setSheet(null);
      const targets = quickActionTargets(action, statesRef.current, editableDays, holidaySet);
      const { map, changes } = paintEach(statesRef.current, targets);
      if (changes.length === 0) {
        announce(t("announce.nothing"));
        return;
      }
      commit(map, changes);
      const state = action === "workdaysMaybe" ? t("state.maybe") : t("state.yes");
      announce(t("announce.toast", { count: changes.length, state }));
      toast({
        message: t("announce.toast", { count: changes.length, state }),
        action: {
          label: t("undo"),
          onAction: () => {
            undoRef.current();
          },
        },
      });
      // W08-08: after the sheet closed, a wave over the visible changed days.
      window.setTimeout(() => {
        wave(
          changes.map((change) => change.date),
          { visibleOnly: true },
        );
      }, DURATION.base);
    },
    [announce, commit, editableDays, holidaySet, t, toast, wave],
  );

  const stepHistory = useCallback(
    (undo: boolean) => {
      const from = undo ? undoStack.current : redoStack.current;
      const step = from.at(-1);
      if (!step) return;
      const next = replay(statesRef.current, step, undo);
      if (undo) {
        undoStack.current = undoStack.current.slice(0, -1);
        redoStack.current = pushHistory(redoStack.current, step);
      } else {
        redoStack.current = redoStack.current.slice(0, -1);
        undoStack.current = pushHistory(undoStack.current, step);
      }
      statesRef.current = next;
      setStates(next);
      setHistory({ undo: undoStack.current.length, redo: redoStack.current.length });
      saver.schedule();
      announce(t(undo ? "announce.undo" : "announce.redo", { count: step.length }));
      wave(
        step.map((change) => change.date),
        { backward: undo },
      );
      if (undo) {
        animate(undoIconRef.current, [{ transform: "rotate(-90deg)" }, { transform: "none" }], {
          duration: DURATION.base,
          easing: spring("soft"),
        });
      }
    },
    [announce, saver, t, wave],
  );
  useEffect(() => {
    undoRef.current = () => {
      stepHistory(true);
    };
  }, [stepHistory]);

  // Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z anywhere outside text fields (ux-spec §4.3, §7.3).
  useEffect(() => {
    if (readOnly) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      stepHistory(!event.shiftKey);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [readOnly, stepHistory]);

  // ---------------------------------------------------------------------------
  // Range mode (W08-04/05) – the single-pointer alternative to dragging (WCAG 2.5.7)
  // ---------------------------------------------------------------------------
  const cancelRange = useCallback(() => {
    if (anchor) announce(t("announce.rangeCancelled"));
    setAnchor(null);
  }, [anchor, announce, t]);

  const tapRangeMode = useCallback(
    (date: IsoDate) => {
      if (!anchor) {
        setAnchor(date);
        announce(t("announce.rangeStart", { date: dayText(date) }));
        requestAnimationFrame(() => {
          const element = cellElement(date);
          animate(element, [{ transform: `scale(${String(SCALE.cell)})` }, { transform: "none" }], {
            duration: DURATION.base,
            easing: spring("soft"),
          });
        });
        return;
      }
      if (anchor === date) {
        cancelRange();
        return;
      }
      setAnchor(null);
      applyRange(anchor, date);
    },
    [anchor, announce, applyRange, cancelRange, cellElement, dayText, t],
  );

  // ---------------------------------------------------------------------------
  // Pointer: tap, drag (horizontal start or 300 ms hold), auto-scroll at the edges
  // ---------------------------------------------------------------------------
  const dateAt = useCallback((x: number, y: number): IsoDate | null => {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-date]");
    return element?.dataset.date ?? null;
  }, []);

  const placeDragLabel = useCallback(
    (state: DragState) => {
      const label = dragLabelRef.current;
      const root = calendarRef.current;
      const cell = cellElement(state.current);
      if (!label || !root || !cell) return;
      const days = orderedRange(state.start, state.current);
      const first = days[0] ?? state.start;
      const last = days.at(-1) ?? state.current;
      label.textContent = t("announce.drag", { range: rangeText(first, last), count: days.length });
      const rootRect = root.getBoundingClientRect();
      const rect = cell.getBoundingClientRect();
      const half = label.offsetWidth / 2;
      const x = Math.min(
        Math.max(rect.left - rootRect.left + rect.width / 2, half),
        rootRect.width - half,
      );
      label.style.transform = `translate(${String(x - half)}px, ${String(rect.top - rootRect.top - label.offsetHeight - 6)}px)`;
      label.dataset.visible = "";
    },
    [cellElement, rangeText, t],
  );

  const hideDragLabel = useCallback(() => {
    if (dragLabelRef.current) delete dragLabelRef.current.dataset.visible;
  }, []);

  const updateDrag = useCallback(
    (state: DragState) => {
      const date = dateAt(state.x, state.y);
      if (date && isEditable(date)) state.current = date;
      const target = paintTarget(stateOf(statesRef.current, state.start), brush);
      setPreview({ from: state.start, to: state.current, target });
      placeDragLabel(state);
    },
    [brush, dateAt, isEditable, placeDragLabel],
  );

  const activateDrag = useCallback(
    (state: DragState, held: boolean) => {
      state.active = true;
      window.clearTimeout(state.timer);
      if (held) {
        // W08-02: start cell pulses once + 10 ms vibration (Android, best effort, G-18).
        animate(
          cellElement(state.start),
          [
            { transform: "scale(1)" },
            { transform: `scale(${String(SCALE.cell)})` },
            { transform: "none" },
          ],
          { duration: DURATION.base, easing: EASING.standard },
        );
        if (!prefersReducedMotion() && typeof navigator.vibrate === "function") {
          try {
            navigator.vibrate(10);
          } catch {
            // best effort
          }
        }
      }
      updateDrag(state);
    },
    [cellElement, updateDrag],
  );

  const stopDrag = useCallback(() => {
    const state = drag.current;
    if (state) window.clearTimeout(state.timer);
    drag.current = null;
    setPreview(null);
    hideDragLabel();
  }, [hideDragLabel]);

  // Auto-scroll while dragging near the top (below the sticky head) or bottom (above the bar).
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const state = drag.current;
      if (state?.active) {
        const head = document.querySelector("[data-sticky-head]")?.getBoundingClientRect();
        const bar = toolbarRef.current?.getBoundingClientRect();
        // The bar sits at the bottom on phones and sticks at the top from 960 px.
        const barTop = bar && bar.top < window.innerHeight / 2 ? bar.bottom : 0;
        const barBottom = bar && bar.top >= window.innerHeight / 2 ? bar.top : window.innerHeight;
        const top = Math.max(head?.bottom ?? 0, barTop);
        const bottom = barBottom;
        let delta = 0;
        if (state.y < top + AUTO_SCROLL_ZONE) {
          delta = -Math.min(
            AUTO_SCROLL_MAX,
            ((top + AUTO_SCROLL_ZONE - state.y) / AUTO_SCROLL_ZONE) * AUTO_SCROLL_MAX,
          );
        } else if (state.y > bottom - AUTO_SCROLL_ZONE) {
          delta = Math.min(
            AUTO_SCROLL_MAX,
            ((state.y - (bottom - AUTO_SCROLL_ZONE)) / AUTO_SCROLL_ZONE) * AUTO_SCROLL_MAX,
          );
        }
        if (delta !== 0) {
          window.scrollBy(0, delta);
          updateDrag(state);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [updateDrag]);

  // While a drag is active, the page must not scroll under the finger.
  useEffect(() => {
    const root = calendarRef.current;
    if (!root) return;
    const block = (event: TouchEvent) => {
      if (drag.current?.active && event.cancelable) event.preventDefault();
    };
    root.addEventListener("touchmove", block, { passive: false });
    return () => {
      root.removeEventListener("touchmove", block);
    };
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      stopGestureRef.current();
      if (readOnly || rangeMode || event.button !== 0 || event.shiftKey) return;
      const date = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
      if (!date || !isEditable(date)) return;
      const touch = event.pointerType !== "mouse";
      const state: DragState = {
        pointerId: event.pointerId,
        touch,
        start: date,
        current: date,
        x0: event.clientX,
        y0: event.clientY,
        x: event.clientX,
        y: event.clientY,
        active: false,
        timer: undefined,
      };
      drag.current = state;
      if (touch) {
        state.timer = window.setTimeout(() => {
          if (drag.current === state && !state.active) activateDrag(state, true);
        }, LONG_PRESS_MS);
      }

      const onMove = (move: PointerEvent) => {
        if (move.pointerId !== state.pointerId || drag.current !== state) return;
        state.x = move.clientX;
        state.y = move.clientY;
        if (!state.active) {
          const dx = Math.abs(state.x - state.x0);
          const dy = Math.abs(state.y - state.y0);
          if (state.touch) {
            // Vertical first = scrolling; horizontal first (> 10 px, < 30°) = painting (B.2).
            if (dx > 10 && dy < dx * TAN_30) activateDrag(state, false);
            else if (dy > 10) stopDrag();
            return;
          }
          const date = dateAt(state.x, state.y);
          if (date && date !== state.start) activateDrag(state, false);
          return;
        }
        updateDrag(state);
      };
      const finish = (up: PointerEvent) => {
        if (up.pointerId !== state.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", cancel);
        if (drag.current !== state) return;
        const wasActive = state.active;
        stopDrag();
        if (wasActive) {
          suppressClick.current = true;
          window.setTimeout(() => {
            suppressClick.current = false;
          }, 400);
          applyRange(state.start, state.current);
        }
      };
      const cancel = (up: PointerEvent) => {
        if (up.pointerId !== state.pointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", cancel);
        if (drag.current === state) stopDrag();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", cancel);
    },
    [activateDrag, applyRange, dateAt, isEditable, rangeMode, readOnly, stopDrag, updateDrag],
  );

  const onClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const date = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
      if (!date || readOnly) return;
      if (suppressClick.current || keyHandled.current) {
        suppressClick.current = false;
        return;
      }
      setFocusDate(date);
      if (rangeMode) {
        tapRangeMode(date);
        return;
      }
      if (event.shiftKey && lastChanged.current) {
        applyRange(lastChanged.current, date);
        return;
      }
      applyRange(date, date);
    },
    [applyRange, rangeMode, readOnly, tapRangeMode],
  );

  // ---------------------------------------------------------------------------
  // Keyboard (ux-spec §7.3)
  // ---------------------------------------------------------------------------
  const focusDay = useCallback(
    (date: IsoDate) => {
      setFocusDate(date);
      cellElement(date)?.focus();
    },
    [cellElement],
  );

  const showSelection = useCallback(
    (from: IsoDate, to: IsoDate) => {
      const target = paintTarget(stateOf(statesRef.current, from), brush);
      setPreview({ from, to, target });
      const days = orderedRange(from, to);
      const first = days[0] ?? from;
      const last = days.at(-1) ?? to;
      announce(t("announce.selection", { range: rangeText(first, last), count: days.length }));
    },
    [announce, brush, rangeText, t],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const date = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
      if (!date || !window_ || readOnly) return;
      const key = event.key;
      const navigation: CalendarKey[] = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];
      if ((navigation as string[]).includes(key)) {
        event.preventDefault();
        const next = moveInCalendar(
          date,
          key as CalendarKey,
          window_,
          props.firstDay,
          event.ctrlKey || event.metaKey,
        );
        if (event.shiftKey) {
          selection.current = { anchor: selection.current?.anchor ?? date, focus: next };
          showSelection(selection.current.anchor, next);
        } else if (selection.current) {
          selection.current = null;
          setPreview(null);
        }
        focusDay(next);
        return;
      }
      if (key === " " || key === "Enter") {
        event.preventDefault();
        keyHandled.current = true;
        const current = selection.current;
        if (current) {
          selection.current = null;
          setPreview(null);
          applyRange(current.anchor, current.focus);
        } else if (rangeMode) {
          tapRangeMode(date);
        } else {
          applyRange(date, date);
        }
        return;
      }
      if (key === "Escape") {
        if (selection.current) {
          selection.current = null;
          setPreview(null);
        }
        cancelRange();
        return;
      }
      if (key === "1" || key === "2" || key === "3") {
        const next = (["no", "maybe", "yes"] as const)[Number(key) - 1] ?? "no";
        setBrush(next);
        announce(t("announce.brush", { brush: t(`brush.${next}`) }));
      }
    },
    [
      announce,
      applyRange,
      cancelRange,
      focusDay,
      props.firstDay,
      rangeMode,
      readOnly,
      showSelection,
      t,
      tapRangeMode,
      window_,
    ],
  );

  const onKeyUp = useCallback(() => {
    // The click of Space/Enter (fired after keydown/keyup) is already handled.
    window.setTimeout(() => {
      keyHandled.current = false;
    }, 0);
  }, []);

  // ---------------------------------------------------------------------------
  // Gesture hint (W03-07): finger dot swipes over 4 days, cells only show the outline
  // ---------------------------------------------------------------------------
  const gestureAnimation = useRef<Animation | null>(null);
  const gestureDotRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!props.gesture || readOnly || prefersReducedMotion()) return;
    const days = editableDays;
    // First week row with four selectable days in a row.
    let run: IsoDate[] = [];
    for (const date of days) {
      const previous = run.at(-1);
      run = previous && addDays(previous, 1) === date && !isWeekend(date) ? [...run, date] : [date];
      if (run.length === 4) break;
    }
    if (run.length < 4) return;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      gestureAnimation.current?.cancel();
      setGestureDays(null);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("scroll", stop);
    };
    stopGestureRef.current = stop;
    const timer = window.setTimeout(() => {
      const first = cellElement(run[0] ?? "");
      const last = cellElement(run[3] ?? "");
      const dot = gestureDotRef.current;
      const root = calendarRef.current;
      if (!first || !last || !dot || !root || stopped) return;
      const rootRect = root.getBoundingClientRect();
      const a = first.getBoundingClientRect();
      const b = last.getBoundingClientRect();
      const y = a.top - rootRect.top + a.height / 2;
      const x1 = a.left - rootRect.left + a.width / 2;
      const x2 = b.left - rootRect.left + b.width / 2;
      setGestureDays(run);
      gestureAnimation.current = dot.animate(
        [
          { transform: `translate(${String(x1)}px, ${String(y)}px)`, opacity: 0 },
          { transform: `translate(${String(x1)}px, ${String(y)}px)`, opacity: 0.85, offset: 0.15 },
          { transform: `translate(${String(x2)}px, ${String(y)}px)`, opacity: 0.85, offset: 0.85 },
          { transform: `translate(${String(x2)}px, ${String(y)}px)`, opacity: 0 },
        ],
        { duration: 1400, iterations: 2, easing: EASING.standard },
      );
      gestureAnimation.current.onfinish = stop;
      window.addEventListener("keydown", stop);
      window.addEventListener("wheel", stop, { passive: true });
      window.addEventListener("touchstart", stop, { passive: true });
      window.addEventListener("scroll", stop, { passive: true });
    }, 600);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [cellElement, editableDays, props.gesture, readOnly]);

  // ---------------------------------------------------------------------------
  // Sticky bar height (U-7): snackbar and scroll padding sit above the fixed bar
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const bar = toolbarRef.current;
    const root = document.documentElement;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const fixed = getComputedStyle(bar).position === "fixed";
      root.style.setProperty("--ww-sticky-bar-h", fixed ? `${String(bar.offsetHeight)}px` : "0px");
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--ww-sticky-bar-h");
    };
  }, [readOnly]);

  // Height of the sticky cockpit head: the bar (≥ 960 px) and month headings stick below it.
  useLayoutEffect(() => {
    const head = document.querySelector<HTMLElement>("[data-sticky-head]");
    const root = document.documentElement;
    if (!head || typeof ResizeObserver === "undefined") return;
    const update = () => {
      root.style.setProperty("--ww-sticky-head-h", `${String(head.offsetHeight)}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(head);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--ww-sticky-head-h");
    };
  }, []);

  // Range hint glides in above the bar (W08-04).
  const hintShown = rangeMode;
  useLayoutEffect(() => {
    if (!hintShown) return;
    enter(toolbarRef.current?.querySelector("[role='status']"), {
      y: DISTANCE.sm,
      duration: DURATION.base,
    });
  }, [hintShown]);

  // ---------------------------------------------------------------------------
  // Submit (Flow B.3)
  // ---------------------------------------------------------------------------
  const doSubmit = useCallback(async () => {
    setSheet(null);
    setSubmitting(true);
    await saver.settle();
    let result: Awaited<ReturnType<typeof submitDaysAction>> | null = null;
    try {
      result = await submitDaysAction(props.publicId, snapshot());
    } catch {
      result = null;
    }
    setSubmitting(false);
    if (!result) {
      setProblem("error");
      return;
    }
    if (!result.ok) {
      onRejected(result.error);
      return;
    }
    saver.markSaved();
    setProblem(null);
    setSubmittedAt(result.savedAt);
    setUpdatedAt(result.savedAt);
    setLegendOpen(false);
    setSheet("success");
  }, [onRejected, props.publicId, saver, snapshot]);

  const submit = useCallback(() => {
    const marked = toEntries(statesRef.current, (date) => isEditable(date)).length;
    if (marked === 0) {
      setSheet("empty");
      return;
    }
    void doSubmit();
  }, [doSubmit, isEditable]);

  const finishSuccess = useCallback(
    (answer: ImportFeedback | null) => {
      setSheet(null);
      if (answer && props.askFeedback) void importFeedbackAction(props.publicId, answer);
      router.push(props.doneHref);
    },
    [props.askFeedback, props.doneHref, props.publicId, router],
  );

  // ---------------------------------------------------------------------------
  // Comment (saved when leaving the field)
  // ---------------------------------------------------------------------------
  const saveComment = useCallback(async () => {
    if (readOnly || comment === savedComment.current) return;
    if (charCount(comment.trim()) > COMMENT_MAX) {
      setCommentError(true);
      return;
    }
    setCommentError(false);
    try {
      const result = await saveCommentAction(props.publicId, comment);
      if (result.ok) {
        savedComment.current = comment;
        setUpdatedAt(result.savedAt);
        toast({ message: t("comment.saved") });
      } else {
        onRejected(result.error);
      }
    } catch {
      setProblem("error");
    }
  }, [comment, onRejected, props.publicId, readOnly, t, toast]);

  // ---------------------------------------------------------------------------
  // Cell models
  // ---------------------------------------------------------------------------
  const previewDays = useMemo(() => {
    if (preview) return new Set(orderedRange(preview.from, preview.to));
    if (gestureDays) return new Set(gestureDays);
    return null;
  }, [gestureDays, preview]);

  const cells = useMemo(() => {
    const map = new Map<IsoDate, CellModel>();
    const tabbable = focusDate ?? window_?.first ?? null;
    const previewSet = previewDays ?? new Set<IsoDate>();
    for (const month of props.months) {
      for (const week of month.weeks) {
        week.forEach((date, column) => {
          if (!date) return;
          const inRange = date >= props.rangeStart && date <= props.rangeEnd;
          const editable = isEditable(date);
          const inPreview = previewSet.has(date) && editable;
          const state = inPreview && preview ? preview.target : stateOf(states, date);
          const names = holidayNames.get(date);
          const weekend = isWeekend(date);
          const today = date === props.today;
          const parts = [props.dateLabels[date] ?? date];
          if (today) parts.push(t("cell.today"));
          if (weekend) parts.push(t("cell.weekend"));
          if (names) parts.push(t("cell.holiday", { name: names.join(" / ") }));
          if (!inRange) parts.push(t("cell.outside"));
          else if (!editable && !readOnly) parts.push(t("cell.past"), t(`state.${state}`));
          else parts.push(t(`state.${state}`));
          map.set(date, {
            date,
            day: Number(date.slice(8, 10)),
            state,
            editable,
            inRange,
            today,
            weekend,
            holiday: names !== undefined,
            preview: inPreview,
            edgeStart: inPreview && (column === 0 || !previewSet.has(addDays(date, -1))),
            edgeEnd: inPreview && (column === 6 || !previewSet.has(addDays(date, 1))),
            anchor: anchor === date,
            tabbable: editable && date === tabbable,
            label: parts.join(", "),
          });
        });
      }
    }
    return map;
  }, [
    anchor,
    focusDate,
    holidayNames,
    isEditable,
    preview,
    previewDays,
    props.dateLabels,
    props.months,
    props.rangeEnd,
    props.rangeStart,
    props.today,
    readOnly,
    states,
    t,
    window_,
  ]);

  const holidaysByMonth = useMemo(() => {
    const byMonth = new Map<string, { date: IsoDate; text: string }[]>();
    for (const [date, names] of [...holidayNames.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const list = byMonth.get(date.slice(0, 7)) ?? [];
      for (const name of names)
        list.push({ date, text: `${props.shortDates[date] ?? date} ${name}` });
      byMonth.set(date.slice(0, 7), list);
    }
    return byMonth;
  }, [holidayNames, props.shortDates]);

  const helpId = "days-cal-help";
  const submitBlocked = online ? null : t("banner.offlineSubmit");

  return (
    <div ref={rootRef} className={cx(styles.editor, readOnly && styles.readOnly)}>
      <nav className={styles.skips} aria-label={t("title")}>
        <a href="#days-calendar" className={styles.skipLink}>
          {t("skipCalendar")}
        </a>
        {readOnly ? null : (
          <a href="#days-tools" className={styles.skipLink}>
            {t("skipTools")}
          </a>
        )}
      </nav>

      {readOnly ? (
        <p className={styles.lockedBar} role="note">
          <Icon name="lock" size={20} />
          <span>{props.mode === "locked" ? t("banner.locked") : t("banner.lockedPast")}</span>
        </p>
      ) : (
        <DaysToolbar
          ref={toolbarRef}
          brush={brush}
          onBrush={(next) => {
            setBrush(next);
          }}
          rangeMode={rangeMode}
          onRangeMode={() => {
            setRangeMode((value) => !value);
            setAnchor(null);
          }}
          rangeHint={rangeMode ? (anchor ? "end" : "start") : null}
          onRangeCancel={() => {
            if (anchor) cancelRange();
            else setRangeMode(false);
          }}
          canUndo={history.undo > 0}
          onUndo={() => {
            stepHistory(true);
          }}
          undoIconRef={undoIconRef}
          onQuick={() => {
            setSheet("quick");
          }}
          submitted={submittedAt !== null}
          updatedAt={updatedAt}
          intl={props.intl}
          status={saver.status}
          slowSaving={slowSaving}
          onRetry={saver.retry}
          onSubmit={submit}
          submitting={submitting}
          submitBlocked={submitBlocked}
        />
      )}

      <div className={styles.notes}>
        {!online ? (
          <Banner tone="info" role="status">
            {t("banner.offline")}
          </Banner>
        ) : null}
        {problem === "rangeChanged" ? (
          <Banner
            tone="warning"
            role="status"
            action={
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  window.location.reload();
                }}
              >
                {t("banner.reload")}
              </button>
            }
          >
            {t("banner.rangeChanged")}
          </Banner>
        ) : null}
        {problem === "signedOut" ? (
          <Banner
            tone="warning"
            role="alert"
            action={
              <Link className={styles.textButton} href={props.loginHref}>
                {t("banner.signIn")}
              </Link>
            }
          >
            {t("banner.signedOut")}
          </Banner>
        ) : null}
        {problem === "error" ? (
          <Banner tone="warning" role="alert">
            {t("banner.error")}
          </Banner>
        ) : null}
        {props.voting && !readOnly ? <Banner tone="info">{t("banner.voting")}</Banner> : null}
        {!readOnly && submittedAt === null ? <p className={styles.draft}>{t("draft")}</p> : null}
        <p className={styles.region}>
          <Icon name="holiday" size={16} />
          <span>{t("holidaysFor", { region: props.regionLabel })}</span>
          <Link href={props.accountHref} className={styles.inlineLink}>
            {t("holidaysChange")}
          </Link>
        </p>
        <details
          className={styles.legend}
          open={legendOpen}
          onToggle={(event) => {
            setLegendOpen(event.currentTarget.open);
          }}
        >
          <summary className={styles.legendSummary}>
            <span>{t("legendTitle")}</span>
            <Icon name="chevron-down" size={18} className={styles.chevron} />
          </summary>
          <div className={styles.legendBody}>
            <ul className={styles.legendKeys}>
              <li>
                <span className={styles.mini} data-state="no" aria-hidden="true">
                  <Icon name="cross" size={12} />
                </span>
                {t("legendNo")}
              </li>
              <li>
                <span className={styles.mini} data-state="maybe" aria-hidden="true">
                  <Icon name="maybe" size={12} />
                </span>
                {t("legendMaybe")}
              </li>
              <li>
                <span className={styles.mini} data-state="yes" aria-hidden="true" />
                {t("legendYes")}
              </li>
              <li>
                <span className={styles.miniHoliday} aria-hidden="true" />
                {t("legendHoliday")}
              </li>
            </ul>
            <p>{t("legendText")}</p>
            <p className={styles.legendRange}>
              <Icon name="range" size={18} />
              <span>{t("legendRange")}</span>
            </p>
            <p className={styles.muted}>{t("legendKeys")}</p>
          </div>
        </details>
        <p className="visually-hidden" id={helpId}>
          {t("calHelp")}
        </p>
        {props.months.length > 1 ? (
          <nav className={styles.jumps} aria-label={t("jumpLabel")}>
            {props.months.map((month) => (
              <button
                key={month.key}
                type="button"
                className={styles.jump}
                onClick={() => {
                  document.getElementById(`month-${month.key}`)?.scrollIntoView({
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                    block: "start",
                  });
                }}
              >
                {month.heading}
              </button>
            ))}
          </nav>
        ) : null}
      </div>

      {/* Event delegation: the interactive elements are the native day buttons inside the grids
          (ux-spec §7.3); the container only routes pointer/keyboard input to them. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={calendarRef}
        id="days-calendar"
        tabIndex={-1}
        className={styles.calendar}
        onPointerDown={onPointerDown}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onContextMenu={(event) => {
          if (drag.current) event.preventDefault();
        }}
      >
        {props.months.map((month) => (
          <MonthGrid
            key={month.key}
            month={month}
            weekdays={props.weekdays}
            cells={cells}
            helpId={helpId}
            holidays={holidaysByMonth.get(month.key) ?? []}
            readOnly={readOnly}
          />
        ))}
        <div ref={dragLabelRef} className={styles.dragLabel} aria-hidden="true" />
        <span ref={gestureDotRef} className={styles.gestureDot} aria-hidden="true" />
      </div>

      <div className={styles.comment}>
        <label htmlFor="days-comment" className={styles.commentLabel}>
          {t("comment.label")} <span className={styles.muted}>{t("comment.optional")}</span>
        </label>
        <textarea
          id="days-comment"
          className={cx(styles.commentField, commentError && styles.commentInvalid)}
          rows={2}
          maxLength={COMMENT_MAX}
          placeholder={t("comment.placeholder")}
          value={comment}
          readOnly={readOnly}
          aria-describedby="days-comment-hint"
          aria-invalid={commentError || undefined}
          onChange={(event) => {
            setComment(event.target.value);
          }}
          onBlur={() => void saveComment()}
        />
        <p id="days-comment-hint" className={styles.commentHint}>
          <span>{commentError ? t("comment.tooLong") : t("comment.hint")}</span>
          {charCount(comment) >= COMMENT_COUNTER_FROM ? (
            <span aria-live="polite">{t("comment.counter", { count: charCount(comment) })}</span>
          ) : null}
        </p>
      </div>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <QuickActionsSheet
        open={sheet === "quick"}
        onClose={() => {
          setSheet(null);
        }}
        onAction={runQuickAction}
        tripRegion={props.tripRegionLabel}
        showTripHolidays={showTripHolidays}
        onToggleTripHolidays={() => {
          setShowTripHolidays((value) => !value);
          setSheet(null);
        }}
      />
      <EmptySubmitSheet
        open={sheet === "empty"}
        onClose={() => {
          setSheet(null);
        }}
        onConfirm={() => void doSubmit()}
      />
      <SuccessSheet
        open={sheet === "success"}
        name={props.name}
        art={props.successArt}
        askFeedback={props.askFeedback}
        onDismiss={() => {
          setSheet(null);
          if (props.askFeedback) void importFeedbackAction(props.publicId, "skipped");
        }}
        onContinue={finishSuccess}
      />
    </div>
  );
}
