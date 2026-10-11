"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { preselectWinner, rankOptions, tallyOf, type Tally } from "@/lib/poll";
import styles from "./poll.module.css";

export interface FixChoice {
  id: string;
  range: string;
  tally: Tally | null;
  without: string[];
}

interface FixSheetProps {
  open: boolean;
  onClose: () => void;
  choices: FixChoice[];
  /** Members who have not voted yet (Flow D.3 #2 – a hint, never a blocker). */
  missing: string;
  busy: boolean;
  error: string | null;
  onConfirm: (optionId: string) => void;
}

/**
 * W11 «Termin festlegen» (F-012, W11-01): options as a radio group in rank order with the
 * short result; place 1 is pre-selected – on a tie nobody is, the organiser decides actively
 * («Gleichstand auf Platz 1 – du entscheidest.»). Missing voters are named, not blocking.
 */
export function FixSheet(props: FixSheetProps) {
  const t = useTranslations("poll.fix");
  const tCommon = useTranslations("common");
  const ids = useId();
  const tallied = props.choices.map((choice) => ({
    ...choice,
    tally: choice.tally ?? tallyOf([]),
  }));
  const { order, top } = rankOptions(tallied);
  const sorted = order
    .map((id) => tallied.find((choice) => choice.id === id))
    .filter((choice) => choice !== undefined);
  const tie = top.length > 1;
  const [picked, setPicked] = useState<string | null>(null);
  const [lastOpen, setLastOpen] = useState(props.open);
  if (props.open !== lastOpen) {
    setLastOpen(props.open);
    if (props.open) setPicked(preselectWinner(top));
  }

  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      title={t("title")}
      closeLabel={tCommon("close")}
    >
      <form
        className={styles.sheet}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (picked && !props.busy) props.onConfirm(picked);
        }}
      >
        {props.missing ? (
          <Banner tone="info">{t("missing", { names: props.missing })}</Banner>
        ) : null}
        {tie ? <p className={styles.availability}>{t("tie")}</p> : null}
        <RadioGroup
          legend={t("legend")}
          name={`${ids}-fix`}
          value={picked ?? ""}
          onChange={(value) => {
            setPicked(value);
          }}
          options={sorted.map((choice) => ({
            value: choice.id,
            label: <b>{choice.range}</b>,
            hint: `${top.includes(choice.id) ? `${t("place")} · ` : ""}${t("counts", { ...choice.tally })}${
              choice.without.length > 0
                ? ` ${t("without", { names: choice.without.join(", ") })}`
                : ""
            }`,
          }))}
        />
        <p className={styles.muted}>{t("note")}</p>
        {props.error ? (
          <Banner tone="danger" role="alert">
            {props.error}
          </Banner>
        ) : null}
        <div className={styles.sheetActions}>
          <Button variant="secondary" size="md" onClick={props.onClose}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            size="md"
            loading={props.busy}
            loadingLabel={t("busy")}
            aria-disabled={!picked || undefined}
            aria-describedby={picked ? undefined : `${ids}-pick`}
          >
            {t("confirm")}
          </Button>
        </div>
        {picked ? null : (
          <p id={`${ids}-pick`} className={styles.stickyNote}>
            {t("pick")}
          </p>
        )}
      </form>
    </BottomSheet>
  );
}
