"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import type { ImportFeedback, QuickAction } from "@/lib/availability";
import styles from "./days.module.css";

interface QuickActionsSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: QuickAction) => void;
  tripRegion: string | null;
  showTripHolidays: boolean;
  onToggleTripHolidays: () => void;
}

const ITEMS: readonly { action: Exclude<QuickAction, "reset">; icon: IconName }[] = [
  { action: "workdaysMaybe", icon: "maybe" },
  { action: "weekendsYes", icon: "sun" },
  { action: "holidaysYes", icon: "holiday" },
];

/**
 * Quick actions «⋯» (W08, Flow B.2): every entry is a button; «Alles zurücksetzen» asks
 * first (more than 20 days may change) – still undoable. «Auch Feiertage der Reise zeigen»
 * only when the trip's holiday region differs from the own one (F-016).
 */
export function QuickActionsSheet(props: QuickActionsSheetProps) {
  const t = useTranslations("days.quickActions");
  const tDays = useTranslations("days");
  const tCommon = useTranslations("common");
  const [confirm, setConfirm] = useState(false);
  return (
    <BottomSheet
      open={props.open}
      onClose={() => {
        setConfirm(false);
        props.onClose();
      }}
      title={confirm ? t("resetTitle") : tDays("quick")}
      closeLabel={tCommon("close")}
      focusKey={confirm ? "reset" : "list"}
    >
      {confirm ? (
        <div className={styles.sheetBody}>
          <p>{t("resetText")}</p>
          <div className={styles.sheetActions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setConfirm(false);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                setConfirm(false);
                props.onAction("reset");
              }}
            >
              {t("resetConfirm")}
            </Button>
          </div>
        </div>
      ) : (
        <ul className={styles.quickList}>
          {ITEMS.map((item) => (
            <li key={item.action}>
              <button
                type="button"
                className={styles.quickItem}
                onClick={() => {
                  props.onAction(item.action);
                }}
              >
                <Icon name={item.icon} size={20} />
                <span>{t(item.action)}</span>
              </button>
            </li>
          ))}
          {props.tripRegion ? (
            <li>
              <button
                type="button"
                className={styles.quickItem}
                aria-pressed={props.showTripHolidays}
                onClick={props.onToggleTripHolidays}
              >
                <Icon name="holiday" size={20} />
                <span>
                  {props.showTripHolidays
                    ? t("hideTripHolidays", { region: props.tripRegion })
                    : t("showTripHolidays", { region: props.tripRegion })}
                </span>
              </button>
            </li>
          ) : null}
          <li className={styles.quickDivider}>
            <button
              type="button"
              className={styles.quickItem}
              onClick={() => {
                setConfirm(true);
              }}
            >
              <Icon name="undo" size={20} />
              <span>{t("reset")}</span>
            </button>
          </li>
        </ul>
      )}
    </BottomSheet>
  );
}

/** «Abgabe ohne Markierung» (W08, Flow B.3 #3). */
export function EmptySubmitSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("days.empty");
  const tCommon = useTranslations("common");
  return (
    <BottomSheet open={open} onClose={onClose} title={t("title")} closeLabel={tCommon("close")}>
      <div className={styles.sheetBody}>
        <p>{t("text")}</p>
        <div className={styles.sheetActions}>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("no")}
          </Button>
          <Button size="md" onClick={onConfirm}>
            {t("yes")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

const FEEDBACK: readonly Exclude<ImportFeedback, "skipped">[] = [
  "apple",
  "google",
  "outlook",
  "other",
  "none",
];

interface SuccessSheetProps {
  open: boolean;
  name: string;
  art: ReactNode;
  askFeedback: boolean;
  /** Closed via ×/Esc/scrim: stay on the page (counts as «skipped» for the question). */
  onDismiss: () => void;
  /** «Weiter» / «Antworten» / «Überspringen»: continue to the next tab. */
  onContinue: (answer: ImportFeedback | null) => void;
}

/**
 * Success after submitting (W08-10): «Danke, Kemal! Deine Tage sind drin.» with the seal
 * (G-21) – and once per person the import question (F-005, skippable).
 */
export function SuccessSheet(props: SuccessSheetProps) {
  const t = useTranslations("days.success");
  const tCommon = useTranslations("common");
  const [answer, setAnswer] = useState<Exclude<ImportFeedback, "skipped"> | "">("");
  return (
    <BottomSheet
      open={props.open}
      onClose={props.onDismiss}
      title={t("title", { name: props.name })}
      closeLabel={tCommon("close")}
    >
      <div className={styles.sheetBody}>
        <div className={styles.successArt}>{props.art}</div>
        <p>{t("text")}</p>
        {props.askFeedback ? (
          <>
            <RadioGroup
              legend={t("feedbackLegend")}
              name="import-feedback"
              value={answer}
              options={FEEDBACK.map((value) => ({ value, label: t(value) }))}
              onChange={(value) => {
                setAnswer(value);
              }}
            />
            <div className={styles.sheetActions}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  props.onContinue("skipped");
                }}
              >
                {t("skip")}
              </Button>
              <Button
                size="md"
                onClick={() => {
                  // Nothing chosen counts as skipped – no disabled button without a reason.
                  props.onContinue(answer === "" ? "skipped" : answer);
                }}
              >
                {t("answer")}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.sheetActions}>
            <Button
              size="md"
              iconEnd="arrow-right"
              onClick={() => {
                props.onContinue(null);
              }}
            >
              {t("continue")}
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
