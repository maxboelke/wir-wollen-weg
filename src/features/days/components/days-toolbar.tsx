"use client";

import { useTranslations } from "next-intl";
import { useRef, useSyncExternalStore, type Ref } from "react";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { DayState } from "@/lib/availability";
import { cx } from "@/lib/cx";
import { animate, DURATION, spring } from "@/lib/motion";
import type { SaveStatus } from "../use-autosave";
import styles from "./days.module.css";

const BRUSHES: readonly { value: DayState; icon: IconName | null }[] = [
  { value: "no", icon: "cross" },
  { value: "maybe", icon: "maybe" },
  { value: "yes", icon: "check" },
];

const noopSubscribe = () => () => undefined;

/** Local time of the last change («✓ Abgegeben · 14:32») – formatted on the client only. */
function useLocalStamp(iso: string | null, intl: string): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!iso) return "";
      const date = new Date(iso);
      const sameDay = date.toDateString() === new Date().toDateString();
      return new Intl.DateTimeFormat(intl, {
        ...(sameDay ? {} : { weekday: "short", day: "numeric", month: "short" }),
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    () => "",
  );
}

interface DaysToolbarProps {
  ref?: Ref<HTMLDivElement>;
  brush: DayState;
  onBrush: (brush: DayState) => void;
  rangeMode: boolean;
  onRangeMode: () => void;
  rangeHint: "start" | "end" | null;
  onRangeCancel: () => void;
  canUndo: boolean;
  onUndo: () => void;
  undoIconRef: Ref<HTMLSpanElement>;
  onQuick: () => void;
  submitted: boolean;
  updatedAt: string | null;
  intl: string;
  status: SaveStatus;
  slowSaving: boolean;
  onRetry: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitBlocked: string | null;
}

/**
 * Tool bar of «Meine Tage» (design-system §9.9, ux-spec §4.12, W08 B): status line
 * (draft / save state), brush radio group with ONE gliding indicator (W08-06), tool tiles
 * (range, undo, quick actions – icon-only below 600 px with aria-label + tooltip) and
 * «Fertig – abgeben», which turns into «✓ Abgegeben · 14:32» after submitting (no jump).
 */
export function DaysToolbar({
  ref,
  brush,
  onBrush,
  rangeMode,
  onRangeMode,
  rangeHint,
  onRangeCancel,
  canUndo,
  onUndo,
  undoIconRef,
  onQuick,
  submitted,
  updatedAt,
  intl,
  status,
  slowSaving,
  onRetry,
  onSubmit,
  submitting,
  submitBlocked,
}: DaysToolbarProps) {
  const t = useTranslations("days");
  const minis = useRef(new Map<DayState, HTMLSpanElement>());
  const stamp = useLocalStamp(updatedAt, intl);
  const brushIndex = BRUSHES.findIndex((b) => b.value === brush);

  // «Speichert …» only after 400 ms (W08-09); before that the previous text stays.
  const statusText =
    status === "error" ? t("failed") : status === "saving" && slowSaving ? t("saving") : t("saved");

  return (
    <div
      ref={ref}
      className={styles.toolbar}
      role="group"
      aria-label={t("tools")}
      id="days-tools"
      data-days-toolbar=""
    >
      {rangeHint ? (
        <div className={styles.rangeHint} role="status">
          <span>{rangeHint === "start" ? t("rangeHintStart") : t("rangeHintEnd")}</span>
          <button type="button" className={styles.textButton} onClick={onRangeCancel}>
            {t("rangeCancel")}
          </button>
        </div>
      ) : null}
      <div className={styles.statusLine}>
        <span>{submitted ? "" : t("draftShort")}</span>
        <span
          className={cx(styles.saveState, status === "error" && styles.saveError)}
          role="status"
        >
          {status === "error" ? (
            <>
              <Icon name="warning" size={16} />
              <span>{statusText}</span>
              <button type="button" className={styles.textButton} onClick={onRetry}>
                {t("retry")}
              </button>
            </>
          ) : status === "saving" && slowSaving ? (
            <>
              <Spinner className={styles.smallSpinner} />
              <span>{statusText}</span>
            </>
          ) : (
            <>
              <Icon name="check" size={14} className={styles.savedTick} />
              <span>{statusText}</span>
            </>
          )}
        </span>
      </div>

      <div className={styles.brushes} role="radiogroup" aria-label={t("brushGroup")}>
        <span
          className={styles.brushIndicator}
          style={{ transform: `translateX(${String(Math.max(0, brushIndex) * 100)}%)` }}
          aria-hidden="true"
        />
        {BRUSHES.map((item) => (
          <label
            key={item.value}
            className={cx(styles.brush, brush === item.value && styles.brushActive)}
          >
            <input
              type="radio"
              className="visually-hidden"
              name="days-brush"
              value={item.value}
              checked={brush === item.value}
              onChange={() => {
                onBrush(item.value);
                // W08-06: the mini field of the new brush nods once.
                animate(
                  minis.current.get(item.value),
                  [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "none" }],
                  { duration: DURATION.base, easing: spring("soft") },
                );
              }}
            />
            <span
              ref={(element) => {
                if (element) minis.current.set(item.value, element);
              }}
              className={styles.mini}
              data-state={item.value}
              aria-hidden="true"
            >
              {item.value !== "yes" && item.icon ? <Icon name={item.icon} size={12} /> : null}
            </span>
            <span className={styles.brushLabel}>{t(`brush.${item.value}`)}</span>
          </label>
        ))}
      </div>

      <div className={styles.toolRow}>
        <button
          type="button"
          className={cx(styles.tool, rangeMode && styles.toolPressed)}
          aria-pressed={rangeMode}
          aria-label={t("range")}
          title={t("range")}
          onClick={onRangeMode}
        >
          <Icon name="range" size={22} />
          <span className={styles.toolText} aria-hidden="true">
            {t("rangeShort")}
          </span>
        </button>
        <button
          type="button"
          className={styles.tool}
          aria-disabled={!canUndo}
          aria-label={t("undo")}
          title={t("undo")}
          aria-keyshortcuts="Control+Z Meta+Z"
          onClick={() => {
            if (canUndo) onUndo();
          }}
        >
          <span ref={undoIconRef} className={styles.undoIcon}>
            <Icon name="undo" size={22} />
          </span>
          <span className={styles.toolText} aria-hidden="true">
            {t("undo")}
          </span>
        </button>
        <button
          type="button"
          className={styles.tool}
          aria-label={t("quick")}
          title={t("quick")}
          aria-haspopup="dialog"
          onClick={onQuick}
        >
          <Icon name="quick-actions" size={22} />
          <span className={styles.toolText} aria-hidden="true">
            {t("quick")}
          </span>
        </button>
        {submitted ? (
          <p className={styles.submittedState}>
            <Icon name="check" size={18} />
            <span>{t("submitted", { time: stamp })}</span>
          </p>
        ) : (
          <Button
            className={styles.submit}
            size="md"
            loading={submitting}
            loadingLabel={t("submitting")}
            aria-disabled={submitBlocked ? true : undefined}
            aria-describedby={submitBlocked ? "days-submit-blocked" : undefined}
            onClick={() => {
              if (!submitBlocked) onSubmit();
            }}
          >
            {t("submit")}
          </Button>
        )}
      </div>
      {submitBlocked ? (
        <p id="days-submit-blocked" className={styles.blocked}>
          {submitBlocked}
        </p>
      ) : null}
    </div>
  );
}
