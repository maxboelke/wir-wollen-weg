"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import type { FormattedMonth, WeekdayHeader } from "@/features/trips/calendar-format";
import type { Locale } from "@/i18n/config";
import { isWeekend, moveInCalendar, type CalendarKey } from "@/lib/calendar";
import { cx } from "@/lib/cx";
import { addDays, diffDays, type IsoDate } from "@/lib/dates";
import { cellCount, tallyDay, toParticipant, type DayTally } from "@/lib/heatmap";
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
  computeSuggestions,
  effectiveMinNights,
  holidaysIn,
  MAX_TOLERANCE,
  noMatchHints,
  vacationDays,
  type Suggestion,
} from "@/lib/suggestions";
import { useWasServerPainted } from "@/lib/use-hydration";
import { storeLegendState } from "../legend-cookie";
import { DayDetail, type DetailPerson } from "./day-detail";
import { HeatMonth, type HeatCellModel } from "./heatmap-month";
import { SuggestionCard, type SuggestionCardModel } from "./suggestion-card";
import styles from "./group.module.css";

export interface GroupPerson {
  key: string;
  name: string;
  me: boolean;
  comment: string | null;
  entries: [IsoDate, "no" | "maybe"][];
}

export interface PendingPerson {
  key: string;
  name: string;
  placeholder: boolean;
}

export interface GroupViewProps {
  publicId: string;
  today: IsoDate;
  rangeStart: IsoDate;
  rangeEnd: IsoDate;
  minNights: number;
  preferredNights: number;
  months: FormattedMonth[];
  weekdays: WeekdayHeader[];
  firstDay: 0 | 1;
  /** «Donnerstag, 6. Mai 2027» per grid day (server-formatted, no hydration drift). */
  dateLabels: Record<IsoDate, string>;
  /** «Mi., 5. Mai» per day of the search range. */
  shortLabels: Record<IsoDate, string>;
  holidays: Holiday[];
  shortDates: Record<IsoDate, string>;
  /** Members who submitted (only their days count, U-4). */
  people: GroupPerson[];
  /** Members without submission, then open placeholders (Q20). */
  pending: PendingPerson[];
  isOrganizer: boolean;
  locale: Locale;
  legendClosed: boolean;
  daysHref: string;
  inviteHref: string;
  settingsHref: string;
  pollHref: string;
  viewerSubmitted: boolean;
  /** Server-rendered illustrations for the empty states (W09-11). */
  emptyArt?: ReactNode;
  noMatchArt?: ReactNode;
}

type View = "suggestions" | "calendar";

/** Cards per group before «Alle n anzeigen» (Flow C.2). */
const CARDS_SHOWN = 3;
const HIGHLIGHT_MS = 4000;
const WAVE_STEP = 2 * STAGGER.cell;
const DESKTOP_QUERY = "(min-width: 960px)";

type Pending =
  | { kind: "show"; index: number; nonce: number }
  | { kind: "step"; index: number; direction: 1 | -1; nonce: number }
  | { kind: "list"; index: number; nonce: number }
  | { kind: "wave"; nonce: number }
  | null;

function isDesktop(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * W09 «Gruppe» (F-008, F-009, F-016; Flow C; ux-spec §4.9–§4.11, §7.3; motion W09-01…13):
 * segment «Vorschläge | Kalender» (URL `?view=`), local filters (length, may miss out, hide
 * people – just for the viewer), suggestion list in two groups, heatmap with keyboard grid
 * (roving tabindex), day detail sheet, suggestion bar in the calendar (< 960 px). All counting
 * is pure (src/lib/heatmap.ts, src/lib/suggestions.ts); motion only decorates and never hides
 * server-painted content (R-017).
 */
export function GroupView(props: GroupViewProps) {
  const t = useTranslations("group");
  const searchParams = useSearchParams();
  const queryView: View = searchParams.get("view") === "calendar" ? "calendar" : "suggestions";
  // Local state switches at once; the URL follows (own history entry) and Back syncs it here.
  const [view, setViewState] = useState<View>(queryView);
  const [lastQueryView, setLastQueryView] = useState<View>(queryView);
  if (lastQueryView !== queryView) {
    setLastQueryView(queryView);
    setViewState(queryView);
  }
  const tCommon = useTranslations("common");
  const serverPainted = useWasServerPainted();
  const helpId = useId();

  // ---------------------------------------------------------------------------
  // Filters (Flow C.1) – local, only for the viewer
  // ---------------------------------------------------------------------------
  const defaultDuration = Math.max(1, props.preferredNights);
  const defaultTolerance = Math.min(1, Math.max(0, props.people.length - 1));
  const [duration, setDuration] = useState(defaultDuration);
  const [tolerance, setTolerance] = useState(defaultTolerance);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [hideOpen, setHideOpen] = useState(false);
  const filtered =
    duration !== defaultDuration || tolerance !== defaultTolerance || hidden.size > 0;

  const from = props.rangeStart > props.today ? props.rangeStart : props.today;
  const hasDays = from <= props.rangeEnd;
  const rangeNights = Math.max(0, diffDays(from, props.rangeEnd));

  const personByKey = useMemo(() => {
    const map = new Map<string, DetailPerson>();
    for (const person of props.people) {
      map.set(person.key, {
        key: person.key,
        name: person.name,
        me: person.me,
        comment: person.comment,
      });
    }
    return map;
  }, [props.people]);

  const participants = useMemo(
    () =>
      props.people
        .filter((person) => !hidden.has(person.key))
        .map((person) => toParticipant(person.key, person.entries)),
    [props.people, hidden],
  );
  const hiddenPeople = useMemo(
    () => props.people.filter((person) => hidden.has(person.key)),
    [props.people, hidden],
  );

  const input = useMemo(
    () => ({
      from,
      to: props.rangeEnd,
      participants,
      minNights: effectiveMinNights(props.minNights, duration),
      targetNights: duration,
      tolerance,
    }),
    [from, props.rangeEnd, participants, props.minNights, duration, tolerance],
  );
  const result = useMemo(
    () => (hasDays ? computeSuggestions(input) : { all: [], almost: [] }),
    [hasDays, input],
  );
  const list: Suggestion[] = useMemo(() => [...result.all, ...result.almost], [result]);
  const hints = useMemo(
    () => (list.length === 0 && participants.length > 0 && hasDays ? noMatchHints(input) : null),
    [list.length, participants.length, hasDays, input],
  );

  // Chosen suggestion: band in the calendar (M-U7). Resets when the list changes.
  const [selected, setSelected] = useState(0);
  const listKey = list.map((s) => `${s.start}${s.end}${s.missing.join()}`).join("|");
  const [seenListKey, setSeenListKey] = useState(listKey);
  if (seenListKey !== listKey) {
    setSeenListKey(listKey);
    setSelected(0);
  }
  const current = list[selected] ?? null;

  // ---------------------------------------------------------------------------
  // Tallies per day (F-008 counting rule)
  // ---------------------------------------------------------------------------
  const tallies = useMemo(() => {
    const map = new Map<IsoDate, DayTally>();
    if (!hasDays) return map;
    for (let day = from; day <= props.rangeEnd; day = addDays(day, 1)) {
      map.set(day, tallyDay(day, participants));
    }
    return map;
  }, [from, hasDays, participants, props.rangeEnd]);

  const holidayByDate = useMemo(
    () => new Map(props.holidays.map((h) => [h.date, h.name] as const)),
    [props.holidays],
  );
  const holidayDates = useMemo(() => new Set(props.holidays.map((h) => h.date)), [props.holidays]);

  const rangeText = useCallback(
    (start: IsoDate, end: IsoDate) =>
      t("card.range", {
        start: props.shortLabels[start] ?? start,
        end: props.shortLabels[end] ?? end,
      }),
    [props.shortLabels, t],
  );
  const groupName = useCallback(
    (s: Suggestion) => (s.group === "all" ? t("groups.allName") : t("groups.almostName")),
    [t],
  );
  const nameOf = useCallback((key: string) => personByKey.get(key)?.name ?? "", [personByKey]);

  // ---------------------------------------------------------------------------
  // Calendar state: roving focus, day detail, highlight
  // ---------------------------------------------------------------------------
  const [focusDate, setFocusDate] = useState<IsoDate>(from);
  const [detailDate, setDetailDate] = useState<IsoDate | null>(null);
  const [highlight, setHighlight] = useState<{ start: IsoDate; end: IsoDate } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [legendOpen, setLegendOpen] = useState(!props.legendClosed);
  const [expanded, setExpanded] = useState<{ all: boolean; almost: boolean }>({
    all: false,
    almost: false,
  });
  // Follow-up of an action once the target view rendered (scroll, draw, focus) – a ref plus a
  // tick, so the effect never sets state itself.
  const pendingRef = useRef<Pending>(null);
  const [tick, setTick] = useState(0);
  const schedule = useCallback((action: NonNullable<Pending>) => {
    pendingRef.current = action;
    setTick((value) => value + 1);
  }, []);
  const nonce = useRef(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barContentRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((text: string) => {
    window.setTimeout(() => {
      setAnnouncement("");
      window.setTimeout(() => {
        setAnnouncement(text);
      }, 30);
    }, 0);
  }, []);

  const cells = useMemo(() => {
    const map = new Map<IsoDate, HeatCellModel>();
    const band = current;
    for (const month of props.months) {
      for (const week of month.weeks) {
        for (const date of week) {
          if (!date) continue;
          const label = props.dateLabels[date] ?? date;
          const holiday = holidayByDate.get(date);
          const inRange = date >= props.rangeStart && date <= props.rangeEnd;
          const isToday = date === props.today;
          const tally = tallies.get(date);
          const inBand = band !== null && date >= band.start && date <= band.end;
          const inHighlight =
            highlight !== null && date >= highlight.start && date <= highlight.end;
          const parts = [label];
          if (isToday) parts.push(t("cell.today"));
          if (holiday) parts.push(t("cell.holiday", { name: holiday }));
          if (!inRange || !tally) {
            parts.push(inRange ? t("cell.past") : t("cell.outside"));
          } else if (tally.n === 0) {
            parts.push(t("cell.nodata"));
          } else {
            parts.push(
              tally.allYes
                ? t("cell.countAll", { x: tally.x, n: tally.n })
                : t("cell.count", { x: tally.x, n: tally.n }),
            );
            if (tally.maybe.length > 0) parts.push(t("cell.maybe", { count: tally.maybe.length }));
            if (tally.no.length > 0) {
              parts.push(
                tally.no.length <= 3
                  ? t("cell.no", { names: tally.no.map(nameOf).join(", ") })
                  : t("cell.noCount", { count: tally.no.length }),
              );
            }
          }
          if (inBand && tally) parts.push(t("cell.suggestion", { rank: selected + 1 }));
          map.set(date, {
            date,
            day: Number(date.slice(8, 10)),
            kind: !inRange ? "outside" : tally ? "open" : "past",
            level: tally?.level ?? "nodata",
            count: tally ? cellCount(tally, false) : "",
            countShort: tally ? cellCount(tally, true) : "",
            many: (tally?.n ?? 0) >= 10,
            maybe: tally?.maybe.length ?? 0,
            allYes: tally?.allYes ?? false,
            gauge: tally && tally.score > 0 ? Math.max(1, Math.floor(tally.score * 4)) : 0,
            today: isToday,
            weekend: isWeekend(date),
            holiday: holiday !== undefined,
            selected: detailDate === date,
            tabbable: date === focusDate,
            label: parts.join(", "),
            band: inBand,
            bandStart: band !== null && date === band.start,
            bandEnd: band !== null && date === band.end,
            rank: band !== null && date === band.start ? selected + 1 : null,
            highlight: inHighlight,
            highlightStart: highlight !== null && date === highlight.start,
            highlightEnd: highlight !== null && date === highlight.end,
          });
        }
      }
    }
    return map;
  }, [
    current,
    detailDate,
    focusDate,
    highlight,
    holidayByDate,
    nameOf,
    props.dateLabels,
    props.months,
    props.rangeEnd,
    props.rangeStart,
    props.today,
    selected,
    t,
    tallies,
  ]);

  const holidaysByMonth = useMemo(() => {
    const map = new Map<string, { date: IsoDate; text: string }[]>();
    for (const holiday of props.holidays) {
      const key = holiday.date.slice(0, 7);
      const entries = map.get(key) ?? [];
      entries.push({
        date: holiday.date,
        text: `${props.shortDates[holiday.date] ?? holiday.date} ${holiday.name}`,
      });
      map.set(key, entries);
    }
    return map;
  }, [props.holidays, props.shortDates]);

  // ---------------------------------------------------------------------------
  // Cards
  // ---------------------------------------------------------------------------
  const cards: SuggestionCardModel[] = useMemo(
    () =>
      list.map((s, index) => ({
        index,
        rank: index + 1,
        range: rangeText(s.start, s.end),
        nights: s.nights,
        vacationDays: vacationDays(s.start, s.end, holidayDates),
        maybeDays: s.maybeDays,
        can: s.group === "almost" ? participants.length - s.missing.length : null,
        missing: s.missing.map(nameOf),
        holidays: holidaysIn(s.start, s.end, props.holidays).map((h) => h.name),
        hidden: hiddenPeople.map((p) => p.name),
      })),
    [hiddenPeople, holidayDates, list, nameOf, participants.length, props.holidays, rangeText],
  );

  // ---------------------------------------------------------------------------
  // View switching (segment, W09-01) – URL-wirksam, own history entries (ux-spec §3)
  // ---------------------------------------------------------------------------
  const setView = useCallback(
    (next: View) => {
      if (next === view) return;
      setViewState(next);
      const url = new URL(window.location.href);
      url.searchParams.set("view", next);
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
    },
    [view],
  );

  const builtKey = `ww-anim:hm-built:${props.publicId}`;
  const onSegment = (event: ReactMouseEvent<HTMLAnchorElement>, next: View) => {
    event.preventDefault();
    if (next === view) return;
    setView(next);
    let firstOpen = false;
    if (next === "calendar") {
      try {
        firstOpen = !sessionStorage.getItem(builtKey);
        sessionStorage.setItem(builtKey, "1");
      } catch {
        firstOpen = false;
      }
    }
    nonce.current += 1;
    if (firstOpen) schedule({ kind: "wave", nonce: nonce.current });
    window.requestAnimationFrame(() => {
      enter(paneRef.current, {
        x: (next === "calendar" ? 1 : -1) * DISTANCE.lg,
        duration: DURATION.base,
        easing: EASING.standard,
      });
    });
  };

  // ---------------------------------------------------------------------------
  // Motion helpers
  // ---------------------------------------------------------------------------
  const cellElement = useCallback(
    (date: IsoDate) =>
      calendarRef.current?.querySelector<HTMLElement>(`button[data-date="${date}"]`) ?? null,
    [],
  );

  /** W09-06 step 3: the band draws itself in date order (scaleX on the gap pseudo-element). */
  const drawBand = useCallback(() => {
    if (prefersReducedMotion()) return;
    const root = calendarRef.current;
    if (!root) return;
    const tds = [...root.querySelectorAll<HTMLElement>("td[data-band]")];
    const step = tds.length > 0 ? DURATION.moderate / tds.length : 0;
    tds.forEach((td, index) => {
      animate(td, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: Math.max(DURATION.instant, step * 1.5),
        delay: index * step,
        easing: EASING.standard,
        fill: "backwards",
        pseudoElement: "::after",
      });
    });
  }, []);

  /** Scrolls the arrival day into the upper third (G-08); reduced motion jumps. */
  const scrollToDay = useCallback(
    (date: IsoDate, onlyIfHidden: boolean) => {
      const element = cellElement(date);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const bar = barRef.current?.offsetHeight ?? 0;
      if (onlyIfHidden && rect.top >= 120 && rect.bottom <= window.innerHeight - bar) return;
      window.scrollTo({
        top: window.scrollY + rect.top - window.innerHeight / 3,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [cellElement],
  );

  /** W09-05: diagonal wave over the visible cells, then the ✓ seals pop in one by one. */
  const wave = useCallback(() => {
    if (prefersReducedMotion()) return;
    const root = calendarRef.current;
    if (!root) return;
    const visible = [...root.querySelectorAll<HTMLElement>("button[data-date]")].filter(
      (element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      },
    );
    const top = Math.min(...visible.map((e) => e.getBoundingClientRect().top));
    let last = 0;
    for (const element of visible) {
      const td = element.parentElement;
      const column = td ? [...(td.parentElement?.children ?? [])].indexOf(td) : 0;
      const row = Math.round((element.getBoundingClientRect().top - top) / 55);
      const delay = staggerDelay(row + column, WAVE_STEP);
      last = Math.max(last, delay);
      animate(
        element,
        [
          { opacity: 0, transform: "scale(0.92)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: DURATION.base, delay, easing: EASING.enter, fill: "backwards" },
      );
    }
    visible
      .flatMap((element) => [...element.querySelectorAll<HTMLElement>("[data-anim='seal']")])
      .forEach((seal, index) => {
        animate(
          seal,
          [
            { opacity: 0, transform: `scale(${String(SCALE.pop)})` },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: DURATION.base,
            delay: last + DURATION.base + staggerDelay(index, STAGGER.item),
            easing: spring("soft"),
            fill: "backwards",
          },
        );
      });
  }, []);

  // ---------------------------------------------------------------------------
  // Actions after the view/selection rendered (scroll, draw, focus)
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    const action = pendingRef.current;
    if (!action) return;
    // On phones the target view must be rendered first (calendar for «show»/wave, list for
    // «in der Liste zeigen») – measurements of a hidden pane would be zero.
    const needs: View | null =
      action.kind === "list" ? "suggestions" : action.kind === "step" ? null : "calendar";
    if (needs && view !== needs && !isDesktop()) return;
    pendingRef.current = null;
    if (action.kind === "wave") {
      wave();
      return;
    }
    const s = list[action.index];
    if (!s) return;
    if (action.kind === "show") {
      scrollToDay(s.start, false);
      drawBand();
      announce(t("announce.highlight", { range: rangeText(s.start, s.end) }));
      return;
    }
    if (action.kind === "step") {
      drawBand();
      scrollToDay(s.start, true);
      enter(barContentRef.current, {
        x: action.direction * DISTANCE.lg,
        duration: DURATION.base,
        easing: EASING.standard,
      });
      announce(
        t("announce.suggestion", {
          rank: action.index + 1,
          total: list.length,
          range: rangeText(s.start, s.end),
          group: groupName(s),
        }),
      );
      return;
    }
    // «in der Liste zeigen»: focus the card.
    document.getElementById(`suggestion-${String(action.index)}`)?.focus();
    document
      .getElementById(`suggestion-${String(action.index)}`)
      ?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [announce, drawBand, groupName, list, rangeText, scrollToDay, t, tick, view, wave]);

  // Highlight (outline) stays 4 s or until the next interaction; the band stays (M-U7).
  useEffect(() => {
    if (!highlight) return;
    const clear = () => {
      setHighlight(null);
    };
    const timer = window.setTimeout(clear, HIGHLIGHT_MS);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const arm = window.setTimeout(() => {
      for (const name of events) window.addEventListener(name, clear, { passive: true });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(arm);
      for (const name of events) window.removeEventListener(name, clear);
    };
  }, [highlight]);

  const showInCalendar = (index: number) => {
    const s = list[index];
    setSelected(index);
    if (s) setHighlight({ start: s.start, end: s.end });
    nonce.current += 1;
    schedule({ kind: "show", index, nonce: nonce.current });
    if (!isDesktop()) setView("calendar");
  };

  const stepSuggestion = (direction: 1 | -1) => {
    const next = selected + direction;
    if (next < 0 || next >= list.length) return;
    setSelected(next);
    setHighlight(null);
    nonce.current += 1;
    schedule({ kind: "step", index: next, direction, nonce: nonce.current });
  };

  const showInList = (index: number) => {
    const s = list[index];
    if (s) {
      setExpanded((value) => ({
        ...value,
        [s.group]:
          value[s.group] || index - (s.group === "all" ? 0 : result.all.length) >= CARDS_SHOWN,
      }));
    }
    setView("suggestions");
    nonce.current += 1;
    schedule({ kind: "list", index, nonce: nonce.current });
  };

  // W09-04: after a filter change the (new) cards fade in with a short stagger.
  const filterKey = `${String(duration)}|${String(tolerance)}|${[...hidden].join()}`;
  const lastFilterKey = useRef(filterKey);
  useLayoutEffect(() => {
    if (lastFilterKey.current === filterKey) return;
    lastFilterKey.current = filterKey;
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [];
    items.forEach((item, index) => {
      enter(item, {
        y: DISTANCE.sm,
        duration: DURATION.base,
        delay: staggerDelay(index, STAGGER.item),
      });
    });
  }, [filterKey]);

  // W09-02: on a client navigation (not over server HTML, R-017) the cards rise group by group.
  useLayoutEffect(() => {
    if (serverPainted) return;
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [])];
    items.slice(0, 2 * CARDS_SHOWN).forEach((item, index) => {
      enter(item, {
        y: DISTANCE.md,
        duration: DURATION.slow,
        delay: staggerDelay(index, STAGGER.card),
        easing: EASING.emphasized,
      });
    });
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard grid (ux-spec §7.3 «Tastatur – Heatmap»)
  // ---------------------------------------------------------------------------
  const focusDay = useCallback(
    (date: IsoDate) => {
      setFocusDate(date);
      cellElement(date)?.focus();
    },
    [cellElement],
  );

  const onCalendarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const date = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
    if (!date || !hasDays) return;
    const keys: CalendarKey[] = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ];
    if (!(keys as string[]).includes(event.key)) return;
    event.preventDefault();
    focusDay(
      moveInCalendar(
        date,
        event.key as CalendarKey,
        { first: from, last: props.rangeEnd },
        props.firstDay,
        event.ctrlKey || event.metaKey,
      ),
    );
  };

  const onCalendarClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const date = (event.target as HTMLElement).closest<HTMLElement>("button[data-date]")?.dataset
      .date;
    if (!date) return;
    setFocusDate(date);
    setDetailDate(date);
  };

  // Day detail: ‹ › and ←/→ page day by day; closing returns focus to the CURRENT day.
  const detailTally = detailDate ? tallies.get(detailDate) : undefined;
  const pageDetail = useCallback(
    (direction: 1 | -1) => {
      setDetailDate((date) => {
        if (!date) return date;
        const next = addDays(date, direction);
        if (next < from || next > props.rangeEnd) return date;
        setFocusDate(next);
        return next;
      });
    },
    [from, props.rangeEnd],
  );
  const detailOpen = detailDate !== null;
  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("dialog") || target.closest("input, textarea, select")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pageDetail(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        pageDetail(1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [detailOpen, pageDetail]);
  const closeDetail = () => {
    const date = detailDate;
    setDetailDate(null);
    if (date) {
      // After the sheet returned focus to its trigger, move it to the day shown last.
      window.setTimeout(() => {
        focusDay(date);
      }, 0);
    }
  };

  // ---------------------------------------------------------------------------
  // Sticky metrics: suggestion bar height (U-7) and cockpit head (month headings)
  // ---------------------------------------------------------------------------
  const showBar = view === "calendar" && props.people.length > 0 && hasDays;
  useLayoutEffect(() => {
    const bar = barRef.current;
    const root = document.documentElement;
    if (!bar || typeof ResizeObserver === "undefined") {
      root.style.setProperty("--ww-sticky-bar-h", "0px");
      return;
    }
    const update = () => {
      const style = getComputedStyle(bar);
      const fixed = style.position === "fixed" && style.display !== "none";
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
  }, [showBar]);

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

  // W09-13: the bar rises from below when the calendar view appears on the client.
  const barShownBefore = useRef(serverPainted && showBar);
  useLayoutEffect(() => {
    if (!showBar) {
      barShownBefore.current = false;
      return;
    }
    if (barShownBefore.current) return;
    barShownBefore.current = true;
    if (isDesktop()) return;
    enter(barRef.current, { y: DISTANCE.lg, duration: DURATION.base });
  }, [showBar]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const resetFilters = () => {
    setDuration(defaultDuration);
    setTolerance(defaultTolerance);
    setHidden(new Set());
  };
  const durationOptions = Array.from(
    { length: Math.max(defaultDuration, Math.min(30, Math.max(1, rangeNights))) },
    (_, i) => i + 1,
  );
  const toleranceOptions = Array.from(
    { length: Math.min(MAX_TOLERANCE, Math.max(0, props.people.length - 1)) + 1 },
    (_, i) => i,
  );
  const allCards = cards.slice(0, result.all.length);
  const almostCards = cards.slice(result.all.length);
  const nobody = props.people.length === 0;

  const filters = nobody ? null : (
    <div className={styles.filterBlock}>
      <div className={styles.filters} role="group" aria-label={t("filters.label")}>
        <span className={cx(styles.filterChip, duration !== defaultDuration && styles.filterOn)}>
          {duration !== defaultDuration ? <Icon name="check" size={16} /> : null}
          <label htmlFor={`${helpId}-duration`}>{t("filters.duration")}</label>
          <select
            id={`${helpId}-duration`}
            className={styles.filterSelect}
            value={duration}
            onChange={(event) => {
              setDuration(Number(event.target.value));
            }}
          >
            {durationOptions.map((value) => (
              <option key={value} value={value}>
                {t("filters.nights", { count: value })}
              </option>
            ))}
          </select>
        </span>
        <span className={cx(styles.filterChip, tolerance !== defaultTolerance && styles.filterOn)}>
          {tolerance !== defaultTolerance ? <Icon name="check" size={16} /> : null}
          <label htmlFor={`${helpId}-tolerance`}>{t("filters.tolerance")}</label>
          <select
            id={`${helpId}-tolerance`}
            className={styles.filterSelect}
            value={tolerance}
            onChange={(event) => {
              setTolerance(Number(event.target.value));
            }}
          >
            {toleranceOptions.map((value) => (
              <option key={value} value={value}>
                {String(value)}
              </option>
            ))}
          </select>
        </span>
        <button
          type="button"
          className={cx(styles.filterChip, styles.filterButton, hidden.size > 0 && styles.filterOn)}
          aria-haspopup="dialog"
          onClick={() => {
            setHideOpen(true);
          }}
        >
          {hidden.size > 0 ? <Icon name="check" size={16} /> : <Icon name="eye-off" size={16} />}
          {hidden.size > 0 ? t("filters.hidden", { count: hidden.size }) : t("filters.hide")}
          <Icon name="chevron-down" size={16} />
        </button>
      </div>
      {filtered ? (
        <p className={styles.onlyYou} role="status">
          <Icon name="info" size={16} />
          <span>{t("filters.onlyYou")}</span>
          <button type="button" className={styles.textButton} onClick={resetFilters}>
            {t("filters.reset")}
          </button>
        </p>
      ) : null}
    </div>
  );

  const emptyState = nobody ? (
    <div className={styles.empty}>
      {props.emptyArt}
      <p>{t("empty.nobody")}</p>
      {props.viewerSubmitted ? (
        <ButtonLink href={props.inviteHref} variant="secondary" size="md" icon="plus">
          {t("empty.invite")}
        </ButtonLink>
      ) : (
        <ButtonLink href={props.daysHref} size="md">
          {t("empty.addDates")}
        </ButtonLink>
      )}
    </div>
  ) : null;

  const noMatch =
    !nobody && list.length === 0 ? (
      <div className={styles.empty} id={`${helpId}-tips`} tabIndex={-1}>
        {props.noMatchArt}
        <p>{t("empty.noMatch", { count: effectiveMinNights(props.minNights, duration) })}</p>
        {hints?.shorter || hints?.tolerance ? (
          <>
            <p className={styles.tipsTitle}>{t("empty.tips")}</p>
            <ul className={styles.tips}>
              {hints.shorter ? (
                <li>
                  <span>
                    {t("empty.shorter", {
                      nights: hints.shorter.nights,
                      min: effectiveMinNights(props.minNights, duration),
                      count: hints.shorter.count,
                    })}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (hints.shorter) setDuration(hints.shorter.nights);
                    }}
                  >
                    {t("empty.show")}
                  </Button>
                </li>
              ) : null}
              {hints.tolerance ? (
                <li>
                  <span>
                    {t("empty.tolerance", {
                      tolerance: hints.tolerance.tolerance,
                      count: hints.tolerance.count,
                    })}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (hints.tolerance) setTolerance(hints.tolerance.tolerance);
                    }}
                  >
                    {t("empty.show")}
                  </Button>
                </li>
              ) : null}
            </ul>
          </>
        ) : (
          <p className={styles.muted}>{t("empty.none")}</p>
        )}
        {props.isOrganizer ? (
          <ButtonLink href={props.settingsHref} variant="text" size="md" icon="edit">
            {t("empty.editTrip")}
          </ButtonLink>
        ) : null}
      </div>
    ) : null;

  const group = (kind: "all" | "almost", groupCards: SuggestionCardModel[], heading: string) => {
    const open = expanded[kind];
    const shown = open ? groupCards : groupCards.slice(0, CARDS_SHOWN);
    return (
      <section className={styles.group} aria-labelledby={`${helpId}-${kind}`}>
        <h2 id={`${helpId}-${kind}`} className={styles.groupTitle} data-kind={kind}>
          <Icon name={kind === "all" ? "check" : "users"} size={20} />
          {heading}
        </h2>
        {groupCards.length === 0 ? (
          <p className={styles.muted}>{t("groups.allEmpty")}</p>
        ) : (
          <ul className={styles.cards}>
            {shown.map((card) => (
              <SuggestionCard
                key={`${card.range}-${card.missing.join()}`}
                card={card}
                selected={card.index === selected}
                onShow={showInCalendar}
              />
            ))}
          </ul>
        )}
        {groupCards.length > CARDS_SHOWN ? (
          <button
            type="button"
            className={styles.textButton}
            aria-expanded={open}
            onClick={() => {
              const wasOpen = open;
              setExpanded((value) => ({ ...value, [kind]: !value[kind] }));
              if (!wasOpen) {
                // W09-03: new cards rise, focus on the first new one.
                window.requestAnimationFrame(() => {
                  const first = groupCards[CARDS_SHOWN];
                  const element = first
                    ? document.getElementById(`suggestion-${String(first.index)}`)
                    : null;
                  element?.focus();
                  groupCards.slice(CARDS_SHOWN).forEach((card, index) => {
                    enter(document.getElementById(`suggestion-${String(card.index)}`), {
                      y: DISTANCE.sm,
                      delay: staggerDelay(index, STAGGER.item),
                    });
                  });
                });
              }
            }}
          >
            {open ? t("showLess") : t("showAll", { count: groupCards.length })}
          </button>
        ) : null}
      </section>
    );
  };

  const suggestionsPane = (
    <div className={styles.suggestions} ref={listRef}>
      {emptyState}
      {!nobody && props.people.length === 1 ? (
        <p className={styles.note}>{t("empty.onlyOne")}</p>
      ) : null}
      {noMatch}
      {!nobody && list.length > 0 ? (
        <>
          {group("all", allCards, t("groups.all", { count: allCards.length }))}
          {tolerance > 0 || almostCards.length > 0
            ? group("almost", almostCards, t("groups.almost", { count: almostCards.length }))
            : null}
          {props.isOrganizer ? (
            <div className={styles.pollHint}>
              <ButtonLink href={props.pollHref} variant="secondary" size="md" icon="vote">
                {t("createPoll")}
              </ButtonLink>
              <p className={styles.muted}>{t("createPollHint")}</p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );

  const legend = (
    <details
      className={styles.legend}
      open={legendOpen}
      onToggle={(event) => {
        const open = event.currentTarget.open;
        setLegendOpen(open);
        storeLegendState(open);
      }}
    >
      <summary className={styles.legendSummary}>
        <span>{t("legend.title")}</span>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </summary>
      <div className={styles.legendBody}>
        <ul className={styles.legendLevels}>
          {(
            [
              ["nodata", "–"],
              ["none", "0"],
              ["few", "2"],
              ["some", "3"],
              ["many", "4"],
              ["all", "5"],
            ] as const
          ).map(([level, sample]) => (
            <li key={level}>
              <span className={styles.mini} data-level={level} aria-hidden="true">
                {sample}
                {level === "all" ? (
                  <span className={styles.miniSeal}>
                    <Icon name="check" size={8} />
                  </span>
                ) : null}
              </span>
              <span>{t(`legend.${level}`)}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.legendKeys}>
          <li>
            <b>{t("legend.count", { x: 4, n: 5 })}</b>
          </li>
          <li>
            <span className={styles.keySeal} aria-hidden="true">
              <Icon name="check" size={10} />
            </span>
            {t("legend.allYes")}
          </li>
          <li>
            <Icon name="maybe" size={14} />
            {t("legend.maybe")}
          </li>
          <li>
            <span className={styles.earMini} aria-hidden="true" />
            {t("legend.holiday")}
          </li>
          <li>
            <span className={styles.keyBand} aria-hidden="true" />
            {t("legend.band")}
          </li>
        </ul>
        <p className={styles.muted}>{t("legend.note")}</p>
      </div>
    </details>
  );

  const submittedCount = props.people.length;
  const total = props.people.length + props.pending.length;

  const calendarPane = (
    <div className={styles.calendarPane}>
      <h2 className="visually-hidden">{t("segment.calendar")}</h2>
      {legend}
      <p className="visually-hidden" id={helpId}>
        {t("calHelp")}
      </p>
      {/* Event delegation: the interactive elements are the native day buttons (ux-spec §7.3). */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={calendarRef}
        id="group-calendar"
        tabIndex={-1}
        className={styles.calendar}
        onKeyDown={onCalendarKeyDown}
        onClick={onCalendarClick}
      >
        {props.months.map((month) => (
          <HeatMonth
            key={month.key}
            month={month}
            weekdays={props.weekdays}
            cells={cells}
            helpId={helpId}
            holidays={holidaysByMonth.get(month.key) ?? []}
          />
        ))}
      </div>
      <details className={styles.who}>
        <summary className={styles.legendSummary}>
          <span>{t("submitted.title", { done: submittedCount, total })}</span>
          <Icon name="chevron-down" size={18} className={styles.chevron} />
        </summary>
        <div className={styles.legendBody}>
          <h3 className={styles.whoTitle}>{t("submitted.done", { count: submittedCount })}</h3>
          <ul className={styles.whoList}>
            {props.people.map((person) => (
              <li key={person.key}>{person.name}</li>
            ))}
          </ul>
          {props.pending.length > 0 ? (
            <>
              <h3 className={styles.whoTitle}>
                {t("submitted.open", { count: props.pending.length })}
              </h3>
              <ul className={styles.whoList}>
                {props.pending.map((person) => (
                  <li key={person.key} className={styles.personOpen}>
                    {person.name}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </details>
    </div>
  );

  return (
    <div className={styles.view} data-view={view}>
      <a className={styles.skipLink} href="#group-calendar">
        {t("skipCalendar")}
      </a>
      <nav className={styles.segment} aria-label={t("segment.label")}>
        {(["suggestions", "calendar"] as const).map((key) => (
          <a
            key={key}
            href={`?view=${key}`}
            className={styles.segmentItem}
            aria-current={view === key ? "page" : undefined}
            onClick={(event) => {
              onSegment(event, key);
            }}
          >
            {t(`segment.${key}`)}
          </a>
        ))}
      </nav>
      {filters}
      <div className={styles.panes} ref={paneRef}>
        <div className={styles.suggestionsCol}>{suggestionsPane}</div>
        <div className={styles.calendarCol}>{calendarPane}</div>
      </div>

      {showBar ? (
        <div className={styles.bar} ref={barRef} role="group" aria-label={t("bar.label")}>
          {current ? (
            <>
              <button
                type="button"
                className={styles.squareButton}
                aria-label={t("bar.prev")}
                aria-disabled={selected === 0 || undefined}
                onClick={() => {
                  stepSuggestion(-1);
                }}
              >
                <Icon name="chevron-left" size={20} />
              </button>
              <button
                type="button"
                ref={barContentRef}
                className={styles.barMain}
                aria-label={t("bar.toList", { range: rangeText(current.start, current.end) })}
                onClick={() => {
                  showInList(selected);
                }}
              >
                <span className={styles.barEyebrow}>
                  <span className={styles.rankPill}>{selected + 1}</span>
                  {t("bar.position", {
                    group: groupName(current),
                    rank: selected + 1,
                    total: list.length,
                  })}
                </span>
                <span className={styles.barRange}>{rangeText(current.start, current.end)}</span>
                <span className={styles.barMeta}>
                  {t("card.nights", { count: current.nights })}
                  {" · "}
                  {t("card.vacation", {
                    count: vacationDays(current.start, current.end, holidayDates),
                  })}
                  {current.missing.length > 0
                    ? ` · ${t("card.without", { names: current.missing.map(nameOf).join(", ") })}`
                    : current.maybeDays > 0
                      ? ` · ${t("card.maybe", { count: current.maybeDays })}`
                      : ""}
                </span>
              </button>
              <button
                type="button"
                className={styles.squareButton}
                aria-label={t("bar.next")}
                aria-disabled={selected >= list.length - 1 || undefined}
                onClick={() => {
                  stepSuggestion(1);
                }}
              >
                <Icon name="chevron-right" size={20} />
              </button>
            </>
          ) : (
            <p className={styles.barNone}>
              <span>{t("bar.none")}</span>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setView("suggestions");
                  window.requestAnimationFrame(() => {
                    document.getElementById(`${helpId}-tips`)?.focus();
                  });
                }}
              >
                {t("bar.tips")}
              </button>
            </p>
          )}
        </div>
      ) : null}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <BottomSheet
        open={detailDate !== null && detailTally !== undefined}
        onClose={closeDetail}
        title={
          detailDate
            ? [props.dateLabels[detailDate] ?? detailDate, holidayByDate.get(detailDate)]
                .filter(Boolean)
                .join(" · ")
            : ""
        }
        closeLabel={tCommon("close")}
        focusKey={detailDate ?? undefined}
      >
        {detailDate && detailTally ? (
          <DayDetail
            dateLabel={props.dateLabels[detailDate] ?? detailDate}
            tally={detailTally}
            people={personByKey}
            pending={props.pending.map((p) => ({
              key: p.key,
              name: p.name,
              placeholder: p.placeholder,
            }))}
            hidden={hiddenPeople.map((p) => ({ key: p.key, name: p.name, me: p.me }))}
            canPrev={addDays(detailDate, -1) >= from}
            canNext={addDays(detailDate, 1) <= props.rangeEnd}
            onPrev={() => {
              pageDetail(-1);
            }}
            onNext={() => {
              pageDetail(1);
            }}
          />
        ) : null}
      </BottomSheet>

      <BottomSheet
        open={hideOpen}
        onClose={() => {
          setHideOpen(false);
        }}
        title={t("filters.hideTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.hideSheet}>
          <p className={styles.muted}>{t("filters.hideHint")}</p>
          <ul className={styles.hideList}>
            {props.people.map((person) => (
              <li key={person.key}>
                <label className={styles.hideItem}>
                  <input
                    type="checkbox"
                    checked={hidden.has(person.key)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setHidden((value) => {
                        const next = new Set(value);
                        if (checked) next.add(person.key);
                        else next.delete(person.key);
                        return next;
                      });
                    }}
                  />
                  <span>{person.name}</span>
                </label>
              </li>
            ))}
          </ul>
          <Button
            size="md"
            onClick={() => {
              setHideOpen(false);
            }}
          >
            {t("filters.done")}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
