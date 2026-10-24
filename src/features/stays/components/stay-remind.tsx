"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { PersonRow } from "@/features/trips/components/person-row";
import { RemindMessage } from "@/features/trips/components/remind-message";
import styles from "@/features/trips/components/remind-sheet.module.css";
import type { StayOccasion, StayRemindData } from "../remind-types";

/** Step of a stay reminder: the status list, one person, everyone, or the organiser nudge. */
export type StayRemindStep = { occasion: StayOccasion; key?: string | undefined };

/** Title of the sheet for a step (W16 v2.14). */
export function useStayRemindTitle(data: StayRemindData) {
  const t = useTranslations("stays.remind");
  const tRemind = useTranslations("remind");
  return (step: StayRemindStep): string => {
    if (step.occasion === "stay-book") {
      const people = data.book?.bookers ?? [];
      const person =
        people.find((p) => p.key === step.key) ?? (people.length === 1 ? people[0] : undefined);
      return person ? tRemind("orgaTitle", { orga: person.name }) : t("bookersTitle");
    }
    if (step.occasion !== "stay-rate") return tRemind("orgaTitle", { orga: data.orgaName });
    if (step.key === "all") return t("allTitle");
    const person = data.open.find((p) => p.key === step.key);
    return person ? tRemind("remindName", { name: person.name }) : t("rateTitle");
  };
}

/**
 * Body of the stay reminders (W16 v2.14, ux-spec §14.2): «Wer hat bewertet?» (members only –
 * placeholders do not rate; statuses «noch n offen» / «alles bewertet», own row «Jetzt
 * swipen», footer «Alle erinnern (n)»), the single and «all» texts, and «{orga} Bescheid geben»
 * for picking/booking. Used in the cockpit sheet and on `/stays`.
 */
export function StayRemindBody({
  data,
  step,
  onStep,
}: {
  data: StayRemindData;
  step: StayRemindStep;
  onStep: (step: StayRemindStep) => void;
}) {
  const t = useTranslations("stays.remind");
  const tRemind = useTranslations("remind");
  const tTrip = useTranslations("trip");
  const tStays = useTranslations("stays");
  const id = useId();

  if (step.occasion === "stay-book") {
    const people = data.book?.bookers ?? [];
    const person =
      people.find((p) => p.key === step.key) ?? (people.length === 1 ? people[0] : undefined);
    if (!person) {
      // Several «Bucher» (W16 v2.16 rule 8): pick whom to tell – WhatsApp per row.
      return (
        <div className={styles.body}>
          <p className={styles.muted}>{t("bookersContext", { title: data.book?.title ?? "" })}</p>
          <ul className={styles.list}>
            {people.map((p) => (
              <PersonRow
                key={p.key}
                avatarId={p.key}
                name={p.name}
                state={null}
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="remind"
                    aria-label={tRemind("orgaTitle", { orga: p.name })}
                    data-remind-row={p.key}
                    onClick={() => {
                      onStep({ occasion: "stay-book", key: p.key });
                    }}
                  >
                    {tRemind("remind")}
                  </Button>
                }
              />
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div className={styles.body}>
        <p className={styles.muted}>
          {t("bookContext", { title: data.book?.title ?? "", orga: person.name })}
        </p>
        <RemindMessage
          texts={person.texts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footer", { name: person.name })}
        />
      </div>
    );
  }

  if (step.occasion === "stay-fix") {
    const texts = data.fix;
    return (
      <div className={styles.body}>
        <p className={styles.muted}>{t("fixContext", { orga: data.orgaName })}</p>
        {texts ? (
          <RemindMessage
            texts={texts}
            defaultLocale={data.defaultLocale}
            footer={tRemind("footer", { name: data.orgaName })}
          />
        ) : null}
      </div>
    );
  }

  if (step.key === "all" && data.allTexts) {
    return (
      <div className={styles.body}>
        <p className={styles.muted}>{t("contextAll")}</p>
        <RemindMessage
          texts={data.allTexts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footerAll")}
        />
      </div>
    );
  }

  const person = data.open.find((p) => p.key === step.key && p.texts);
  if (person?.texts) {
    return (
      <div className={styles.body}>
        <p className={styles.muted}>{t("context", { name: person.name, count: person.left })}</p>
        <RemindMessage
          texts={person.texts}
          defaultLocale={data.defaultLocale}
          footer={tRemind("footer", { name: person.name })}
        />
      </div>
    );
  }

  const others = data.open.filter((p) => !p.me);
  return (
    <div className={styles.body}>
      <p className={styles.muted}>
        {tStays("progressAll", { done: data.progress.done, total: data.progress.total })}
      </p>
      {data.open.length > 0 ? (
        <section className={styles.group} aria-labelledby={`${id}-open`}>
          <h3 id={`${id}-open`} className={styles.groupTitle}>
            {t("missing", { count: data.open.length })}
          </h3>
          <ul className={styles.list}>
            {data.open.map((p) => (
              <PersonRow
                key={p.key}
                avatarId={p.key}
                name={p.name}
                youLabel={p.me ? tTrip("you") : null}
                orgaLabel={p.organizer ? tTrip("organizer") : null}
                state="open"
                status={t("left", { count: p.left })}
                actions={
                  p.me ? (
                    <ButtonLink href={data.swipeHref} variant="secondary" size="sm">
                      {t("swipeNow")}
                    </ButtonLink>
                  ) : p.texts ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="remind"
                      aria-label={tRemind("remindName", { name: p.name })}
                      data-remind-row={p.key}
                      onClick={() => {
                        onStep({ occasion: "stay-rate", key: p.key });
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
      ) : null}
      {data.done.length > 0 ? (
        <section className={styles.group} aria-labelledby={`${id}-done`}>
          <h3 id={`${id}-done`} className={styles.groupTitle}>
            {t("done", { count: data.done.length })}
          </h3>
          <ul className={styles.list}>
            {data.done.map((p) => (
              <PersonRow
                key={p.key}
                avatarId={p.key}
                name={p.name}
                youLabel={p.me ? tTrip("you") : null}
                orgaLabel={p.organizer ? tTrip("organizer") : null}
                state="done"
                status={t("allRated")}
              />
            ))}
          </ul>
        </section>
      ) : null}
      {others.length > 0 && data.allTexts ? (
        <Button
          size="lg"
          block
          icon="remind"
          onClick={() => {
            onStep({ occasion: "stay-rate", key: "all" });
          }}
        >
          {t("remindAll", { count: others.length })}
        </Button>
      ) : null}
    </div>
  );
}
