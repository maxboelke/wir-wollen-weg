"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import switchStyles from "@/components/ui/switch.module.css";
import { useToast } from "@/components/ui/toast";
import { OrgaChip } from "@/features/trips/components/orga-chip";
import { cx } from "@/lib/cx";
import { genitiveDe, TRAVEL_LIMITS } from "@/lib/travel-data";
import { setBookerAction } from "../actions";
import { BookerChip } from "./bits";
import styles from "./travel-data.module.css";

export interface BookerSheetPerson {
  key: string;
  name: string;
  organizer: boolean;
  me: boolean;
  booker: boolean;
}

/**
 * Step «Wer bucht?» (W20 H.2, F-056) – organiser only: one switch per member with an account
 * (immediate effect), placeholders locked with the reason, at most 3 (checked again on the
 * server under the trip lock). Switching off a person with requests asks first and then deletes
 * all releases to them at once; without consequences there is «Rückgängig».
 */
export function BookerSheetBody({
  publicId,
  travelData,
  people,
  placeholders,
  locale,
}: {
  publicId: string;
  travelData: boolean;
  people: BookerSheetPerson[];
  placeholders: { id: string; name: string }[];
  locale: string;
}) {
  const t = useTranslations("booking");
  const tTrip = useTranslations("trip");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const [on, setOn] = useState<Set<string>>(
    () => new Set(people.filter((p) => p.booker).map((p) => p.key)),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    person: BookerSheetPerson;
    requests: number;
    released: number;
  } | null>(null);
  const full = on.size >= TRAVEL_LIMITS.bookersPerTrip;

  async function change(person: BookerSheetPerson, value: boolean, confirmed: boolean) {
    setPending(person.key);
    try {
      const result = await setBookerAction(publicId, person.key, value, confirmed);
      if (result.ok) {
        setOn((prev) => {
          const next = new Set(prev);
          if (value) next.add(person.key);
          else next.delete(person.key);
          return next;
        });
        setConfirm(null);
        if (value) toast({ message: t("on", { name: person.name }) });
        else if (confirmed) toast({ message: t("revoke.done", { name: person.name }) });
        else {
          toast({
            message: t("off", { name: person.name }),
            action: {
              label: tCommon("undo"),
              onAction: () => {
                void change(person, true, false);
              },
            },
          });
        }
        router.refresh();
        return;
      }
      if (result.error === "confirm") {
        setConfirm({ person, requests: result.requests, released: result.released });
        return;
      }
      toast({ message: result.error === "max" ? t("max") : t("error") });
      router.refresh();
    } catch {
      toast({ message: t("error") });
    } finally {
      setPending(null);
    }
  }

  if (confirm) {
    const name = confirm.person.name;
    return (
      <div className={styles.stack} data-booker-confirm="">
        <h3 className={styles.h3}>{t("revoke.title", { name })}</h3>
        <p className={styles.text}>
          {t("revoke.body", {
            name,
            genitive: locale === "de" ? genitiveDe(name) : name,
            count: confirm.requests,
            released: confirm.released,
          })}
        </p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="md"
            data-autofocus=""
            onClick={() => {
              setConfirm(null);
            }}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={pending === confirm.person.key}
            onClick={() => {
              void change(confirm.person, false, true);
            }}
          >
            {t("revoke.confirm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stack} data-booker-sheet="">
      <p className={styles.muted}>{travelData ? t("sheet.intro") : t("sheet.introNoData")}</p>
      {on.size === 0 ? (
        <p className={styles.lineIcon}>
          <Icon name="id-card" size={18} />
          <span>{t("none")}</span>
        </p>
      ) : null}
      <ul className={styles.bookerList}>
        {people.map((person) => {
          const checked = on.has(person.key);
          const locked = !checked && full;
          const reasonId = `${id}-${person.key}-reason`;
          return (
            <li key={person.key}>
              <div className={cx(switchStyles.row, styles.switchRow, styles.bookerRow)}>
                <span className={styles.cardHead}>
                  <Avatar
                    id={person.key}
                    name={person.name}
                    size="sm"
                    organizer={person.organizer}
                  />
                  <span className={styles.label}>
                    {person.me ? t("sheet.you", { name: person.name }) : person.name}
                  </span>
                  {person.organizer ? <OrgaChip label={tTrip("organizer")} /> : null}
                  {checked ? <BookerChip label={t("chip")} /> : null}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={checked}
                  aria-label={t("sheet.switchName", { name: person.name })}
                  aria-disabled={locked || pending !== null || undefined}
                  aria-describedby={locked ? reasonId : undefined}
                  className={switchStyles.switch}
                  data-booker-switch={person.key}
                  onClick={() => {
                    if (pending) return;
                    if (locked) {
                      toast({ message: t("max") });
                      return;
                    }
                    void change(person, !checked, false);
                  }}
                >
                  <span className={switchStyles.knob}>
                    {checked ? (
                      <Icon name="check" size={14} className={switchStyles.check} />
                    ) : null}
                  </span>
                </button>
                {locked ? (
                  <p id={reasonId} className={styles.small}>
                    {t("max")}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
        {placeholders.map((p) => (
          <li key={p.id}>
            <div className={cx(switchStyles.row, switchStyles.locked, styles.bookerRow)}>
              <span className={styles.cardHead}>
                <Avatar id={p.id} name={p.name} size="sm" open />
                <span className={styles.label}>{p.name}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={false}
                aria-label={t("sheet.switchName", { name: p.name })}
                aria-disabled="true"
                aria-describedby={`${id}-${p.id}-reason`}
                className={switchStyles.switch}
              >
                <span className={switchStyles.knob} />
              </button>
              <p id={`${id}-${p.id}-reason`} className={styles.small}>
                {t("placeholder")}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.small} aria-live="polite" data-booker-count="">
        {t("sheet.counter", { count: on.size })}
      </p>
    </div>
  );
}
