"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { PersonRow } from "@/features/trips/components/person-row";
import { RemindMessage } from "@/features/trips/components/remind-message";
import styles from "@/features/trips/components/remind-sheet.module.css";
import type { CostOccasion, CostRemindData } from "../remind-types";

/** Step of a cost reminder: the list, one debtor (`key`), or everyone (`all`). */
export interface CostRemindStep {
  occasion: CostOccasion;
  key?: string | undefined;
}

/** First step for an entry point: one debtor → the text directly, several → the list. */
export function firstCostStep(data: CostRemindData, occasion: CostOccasion): CostRemindStep {
  if (occasion === "settle") {
    const rows = data.mine.filter((row) => row.texts ?? row.orgaTexts);
    return rows.length === 1 && rows[0] ? { occasion, key: rows[0].key } : { occasion };
  }
  return { occasion };
}

export function useCostRemindTitle(data: CostRemindData) {
  const t = useTranslations("balances");
  const tRemind = useTranslations("remind");
  return (step: CostRemindStep): string => {
    if (step.key === "all") return tRemind("allTitle");
    const rows = step.occasion === "settle" ? data.mine : data.all;
    const row = rows.find((r) => r.key === step.key);
    if (row && !row.texts && row.orgaTexts) return tRemind("placeholderTitle", { name: row.name });
    if (row) return tRemind("remindName", { name: row.name });
    return step.occasion === "settle" ? t("remindTitle") : t("remindAllTitle");
  };
}

/**
 * Body of the cost reminders (W16 v2.15, W19 D.11): `settle` – «Wer schuldet dir noch?» with one
 * row per own debtor (each text names its own amount, no «Alle erinnern»); `settle-all`
 * (organiser) – «Offene Ausgleiche» with «Alle erinnern». Texts never contain payment details.
 * Members and placeholder debtors: «{orga} Bescheid geben» instead of a reminder (R-082).
 */
export function CostRemindBody({
  data,
  step,
  onStep,
}: {
  data: CostRemindData;
  step: CostRemindStep;
  onStep: (step: CostRemindStep) => void;
}) {
  const t = useTranslations("balances");
  const tRemind = useTranslations("remind");
  const id = useId();
  const rows = step.occasion === "settle" ? data.mine : data.all;

  if (step.key === "all" && data.allTexts) {
    return (
      <div className={styles.body}>
        <RemindMessage
          texts={data.allTexts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footerAll")}
        />
      </div>
    );
  }
  const row = rows.find((r) => r.key === step.key && (r.texts ?? r.orgaTexts));
  if (row && !row.texts && row.orgaTexts) {
    // R-082: a member cannot remind a placeholder (no personal link, F-007) – the organiser can.
    return (
      <div className={styles.body}>
        <p className={styles.muted}>{t("remindContext", { name: row.name, amount: row.amount })}</p>
        <p>{tRemind("placeholderText", { name: row.name, orga: data.orgaName })}</p>
        <RemindMessage
          texts={row.orgaTexts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footer", { name: data.orgaName })}
        />
      </div>
    );
  }
  if (row?.texts) {
    return (
      <div className={styles.body}>
        {step.occasion === "settle" ? (
          <p className={styles.muted}>
            {t("remindContext", { name: row.name, amount: row.amount })}
          </p>
        ) : null}
        <RemindMessage
          texts={row.texts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footer", { name: row.name })}
        />
      </div>
    );
  }
  return (
    <div className={styles.body}>
      <section className={styles.group} aria-labelledby={`${id}-rows`}>
        <h3 id={`${id}-rows`} className="visually-hidden">
          {step.occasion === "settle" ? t("remindTitle") : t("remindAllTitle")}
        </h3>
        <ul className={styles.list}>
          {rows.map((r) => (
            <PersonRow
              key={`${r.key}-${r.to}`}
              avatarId={r.key}
              name={r.name}
              youLabel={null}
              orgaLabel={null}
              state="open"
              status={
                step.occasion === "settle"
                  ? r.amount
                  : t("remindOther", { from: r.name, to: r.to, amount: r.amount })
              }
              actions={
                r.orgaTexts && !r.texts ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="remind"
                    aria-label={t("nudgeOrgaName", { orga: data.orgaName, name: r.name })}
                    data-remind-row={r.key}
                    onClick={() => {
                      onStep({ occasion: step.occasion, key: r.key });
                    }}
                  >
                    {tRemind("orgaTitle", { orga: data.orgaName })}
                  </Button>
                ) : r.texts ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="remind"
                    aria-label={tRemind("remindName", { name: r.name })}
                    data-remind-row={r.key}
                    onClick={() => {
                      onStep({ occasion: step.occasion, key: r.key });
                    }}
                  >
                    {tRemind("remind")}
                  </Button>
                ) : null
              }
            />
          ))}
        </ul>
      </section>
      {step.occasion === "settle-all" && data.allTexts ? (
        <Button
          size="lg"
          block
          icon="remind"
          onClick={() => {
            onStep({ occasion: "settle-all", key: "all" });
          }}
        >
          {t("remindAll")}
        </Button>
      ) : null}
    </div>
  );
}
