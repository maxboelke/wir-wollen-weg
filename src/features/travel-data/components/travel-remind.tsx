"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { PersonRow } from "@/features/trips/components/person-row";
import { RemindMessage } from "@/features/trips/components/remind-message";
import styles from "@/features/trips/components/remind-sheet.module.css";
import type { TravelRemindData } from "../types";

/**
 * Reminder `travel-data` / `travel-data-join` (W16 v2.16, W20 H.7): step `status` («Wer fehlt
 * noch?» – open members with WhatsApp each, «Klärt es direkt» WITHOUT a button, open
 * placeholders with their personal link – organiser only, otherwise «{orga} Bescheid geben»,
 * R-083) → `single` / `all`. Texts never contain fields or
 * values – only name, purpose and the link to the area.
 */
export interface TravelRemindStep {
  requestId?: string | undefined;
  /** Person key, or "all" for «Alle erinnern» of `requestId`. */
  key?: string | undefined;
}

export function useTravelRemindTitle(data: TravelRemindData | null) {
  const t = useTranslations("travelData.remind");
  const tRemind = useTranslations("remind");
  return (step: TravelRemindStep): string => {
    const request = data?.requests.find((r) => r.requestId === step.requestId);
    if (!request || !step.key) return t("title");
    if (step.key === "all") return t("allShort");
    const person = [...request.open, ...request.pending].find((p) => p.key === step.key);
    if (person?.viaOrga !== undefined) return tRemind("placeholderTitle", { name: person.name });
    return person ? tRemind("remindName", { name: person.name }) : t("title");
  };
}

/** Whether the step shows a single message (the sheet offers «Zurück zur Liste»). */
export function isTravelRemindDetail(step: TravelRemindStep): boolean {
  return Boolean(step.key);
}

export function TravelRemindBody({
  data,
  step,
  onStep,
}: {
  data: TravelRemindData;
  step: TravelRemindStep;
  onStep: (step: TravelRemindStep) => void;
}) {
  const t = useTranslations("travelData.remind");
  const tRemind = useTranslations("remind");
  const id = useId();
  const request = data.requests.find((r) => r.requestId === step.requestId);

  if (request && step.key === "all" && request.allTexts) {
    return (
      <div className={styles.body}>
        <p className={styles.muted}>{t("contextAll", { purpose: request.purpose })}</p>
        <RemindMessage
          texts={request.allTexts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footerAll")}
        />
      </div>
    );
  }
  if (request && step.key) {
    const open = request.open.find((p) => p.key === step.key);
    const pending = request.pending.find((p) => p.key === step.key);
    const person = open ?? pending;
    if (person) {
      return (
        <div className={styles.body}>
          <p className={styles.muted}>
            {open
              ? t("context", { name: person.name, purpose: request.purpose })
              : person.viaOrga !== undefined
                ? tRemind("placeholderText", { name: person.name, orga: person.viaOrga })
                : t("contextJoin", { name: person.name })}
          </p>
          <RemindMessage
            texts={person.texts}
            defaultLocale={data.defaultLocale}
            footer={tRemind("footer", { name: person.viaOrga ?? person.name })}
          />
        </div>
      );
    }
  }

  const single = data.requests.length === 1 ? data.requests[0] : undefined;
  return (
    <div className={styles.body} data-travel-remind="">
      {data.requests.map((r) => (
        <section
          key={r.requestId}
          className={styles.group}
          aria-labelledby={data.requests.length > 1 ? `${id}-${r.requestId}` : undefined}
        >
          {data.requests.length > 1 ? (
            <h3 id={`${id}-${r.requestId}`} className={styles.groupTitle}>
              {`„${r.purpose}“`}
            </h3>
          ) : null}
          {r.open.length > 0 ? (
            <>
              <h4 className={styles.groupTitle}>{t("open", { count: r.open.length })}</h4>
              <ul className={styles.list}>
                {r.open.map((p) => (
                  <PersonRow
                    key={p.key}
                    avatarId={p.key}
                    name={p.name}
                    state="open"
                    actions={
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="remind"
                        aria-label={tRemind("remindName", { name: p.name })}
                        data-remind-row={p.key}
                        onClick={() => {
                          onStep({ requestId: r.requestId, key: p.key });
                        }}
                      >
                        {tRemind("remind")}
                      </Button>
                    }
                  />
                ))}
              </ul>
            </>
          ) : null}
          {r.declined.length > 0 ? (
            <>
              <h4 className={styles.groupTitle}>{t("declined", { count: r.declined.length })}</h4>
              <ul className={styles.list}>
                {r.declined.map((p) => (
                  <PersonRow key={p.key} avatarId={p.key} name={p.name} state={null} />
                ))}
              </ul>
            </>
          ) : null}
          {r.pending.length > 0 ? (
            <>
              <h4 className={styles.groupTitle}>{t("pending", { count: r.pending.length })}</h4>
              <ul className={styles.list}>
                {r.pending.map((p) => (
                  <PersonRow
                    key={p.key}
                    avatarId={p.key}
                    name={p.name}
                    state="open"
                    actions={
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="remind"
                        aria-label={
                          p.viaOrga !== undefined
                            ? t("nudgeOrgaName", { orga: p.viaOrga, name: p.name })
                            : tRemind("remindName", { name: p.name })
                        }
                        data-remind-row={p.key}
                        onClick={() => {
                          onStep({ requestId: r.requestId, key: p.key });
                        }}
                      >
                        {p.viaOrga !== undefined
                          ? tRemind("orgaTitle", { orga: p.viaOrga })
                          : tRemind("remind")}
                      </Button>
                    }
                  />
                ))}
              </ul>
            </>
          ) : null}
          {!single && r.allTexts ? (
            <Button
              variant="secondary"
              size="md"
              icon="remind"
              onClick={() => {
                onStep({ requestId: r.requestId, key: "all" });
              }}
            >
              {t("allShort")}
            </Button>
          ) : null}
        </section>
      ))}
      {single?.allTexts ? (
        <Button
          size="lg"
          block
          icon="remind"
          onClick={() => {
            onStep({ requestId: single.requestId, key: "all" });
          }}
        >
          {t("all", { count: single.open.length })}
        </Button>
      ) : null}
    </div>
  );
}
