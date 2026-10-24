"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, type SubmitEvent } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  COST_LIMITS,
  ibanGroups,
  PAY_NOTE_COUNTER_FROM,
  validatePayInfo,
  type PayInfoErrors,
} from "@/lib/costs";
import { cx } from "@/lib/cx";
import { formatDate } from "@/lib/dates";
import { textLength } from "@/lib/trip-info";
import { savePayInfoAction } from "../actions";
import type { CostsModel } from "../load";
import { IbanLine } from "./iban";
import styles from "./costs.module.css";

/**
 * Payment details (W19 D.8.4 / E.5 block 3, R.8 I10-07): sheet with two optional fields – a
 * checked IBAN and «anderer Weg» (plain text ≤ 100, never linked). Allowed also when the costs
 * are closed. Both empty = delete. Nothing is kept in cookies or storage.
 *
 * `where`: the viewer gets money back – card «Wohin soll das Geld?» (open, names the people who
 * will see it). `collapsed`: everybody else – a closed disclosure «Deine Zahlungsinfo ▸».
 */
export function PayInfoCard({
  model,
  variant,
  senders = [],
}: {
  model: CostsModel;
  variant: "where" | "collapsed";
  /** «Sara, Max und Jonas» – the people sending money to the viewer. */
  senders?: string[];
}) {
  const t = useTranslations("payInfo");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const ids = useId();
  const me = model.people.find((p) => p.me);
  const pay = me?.pay ?? null;
  const [open, setOpen] = useState(false);
  const [iban, setIban] = useState(pay?.iban ? ibanGroups(pay.iban).join(" ") : "");
  const [note, setNote] = useState(pay?.note ?? "");
  const [errors, setErrors] = useState<PayInfoErrors>({});
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  if (!me) return null;
  const filled = Boolean(pay?.iban ?? pay?.note);

  const save = (values: { iban: string; note: string }, done: string, undo?: () => void) => {
    setPending(true);
    void savePayInfoAction(model.publicId, values)
      .then((result) => {
        if (result.ok) {
          setOpen(false);
          toast({
            message: t(done as "saved"),
            ...(undo ? { action: { label: tCommon("undo"), onAction: undo } } : {}),
          });
          router.refresh();
        } else if (result.errors) {
          setErrors(result.errors);
        } else {
          toast({ message: tCommon("genericError") });
        }
      })
      .catch(() => {
        toast({ message: tCommon("genericError") });
      })
      .finally(() => {
        setPending(false);
      });
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const checked = validatePayInfo({ iban, note });
    if (!checked.ok) {
      setErrors(checked.errors);
      document.getElementById(checked.errors.iban ? `${ids}-iban` : `${ids}-note`)?.focus();
      return;
    }
    setErrors({});
    save({ iban, note }, checked.iban === null && checked.note === null ? "deleted" : "saved");
  };

  const previous = { iban: pay?.iban ?? "", note: pay?.note ?? "" };
  const noteLength = textLength(note);
  const openSheet = () => {
    setIban(pay?.iban ? ibanGroups(pay.iban).join(" ") : "");
    setNote(pay?.note ?? "");
    setErrors({});
    setOpen(true);
  };
  const details = filled ? (
    <div className={styles.payInfo}>
      {pay?.iban ? <IbanLine iban={pay.iban} owner={me.name ?? ""} mine /> : null}
      {pay?.note ? <span className={styles.payNote}>{pay.note}</span> : null}
      {pay?.updatedOn ? (
        <span className={styles.small}>
          {t("updated", { date: formatDate(pay.updatedOn, model.intl, { weekday: false }) })}
        </span>
      ) : null}
    </div>
  ) : null;
  const editButton = (
    <Button variant="secondary" size="sm" aria-haspopup="dialog" onClick={openSheet}>
      {filled ? t("change") : t("add")}
    </Button>
  );
  const names = new Intl.ListFormat(model.locale, { type: "conjunction" }).format(senders);
  return (
    <section
      className={cx(styles.payCard, variant === "collapsed" && styles.payCardQuiet)}
      aria-labelledby={`${ids}-title`}
      data-pay-info={variant}
    >
      {variant === "where" ? (
        <>
          <div className={styles.payCardHead}>
            <h2 className={styles.h3} id={`${ids}-title`}>
              {t("whereTitle")}
            </h2>
            {filled ? editButton : null}
          </div>
          {details ?? (
            <>
              <p className={styles.muted}>{t("whereText", { names })}</p>
              <span>{editButton}</span>
            </>
          )}
        </>
      ) : (
        <>
          <h2 className={styles.h3} id={`${ids}-title`}>
            <button
              type="button"
              className={styles.disclosure}
              aria-expanded={expanded}
              aria-controls={`${ids}-body`}
              onClick={() => {
                setExpanded((v) => !v);
              }}
            >
              <span>{t("title")}</span>
              <span className={styles.chevron} aria-hidden="true">
                <Icon name="chevron-down" size={20} />
              </span>
            </button>
          </h2>
          <div id={`${ids}-body`} className={styles.disclosureBody} hidden={!expanded}>
            {details ?? <p className={styles.muted}>{t("empty")}</p>}
            <span>{editButton}</span>
          </div>
        </>
      )}
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t("sheetTitle")}
        closeLabel={tCommon("close")}
      >
        <form className={styles.sheetBody} onSubmit={submit} noValidate>
          <TextField
            id={`${ids}-iban`}
            label={t("iban")}
            value={iban}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={50}
            error={errors.iban ? t("error.iban") : undefined}
            onChange={(event) => {
              setIban(event.target.value);
            }}
            onBlur={() => {
              const checked = validatePayInfo({ iban, note: "" });
              setErrors((e) => ({ ...e, iban: checked.ok ? undefined : "iban" }) as PayInfoErrors);
              if (checked.ok && checked.iban) setIban(ibanGroups(checked.iban).join(" "));
            }}
          />
          <TextField
            id={`${ids}-note`}
            label={t("note")}
            value={note}
            placeholder={t("noteHint")}
            autoComplete="off"
            maxLength={COST_LIMITS.payNote + 20}
            hint={
              noteLength >= PAY_NOTE_COUNTER_FROM
                ? `${String(noteLength)}/${String(COST_LIMITS.payNote)}`
                : undefined
            }
            error={errors.note ? t("error.note") : undefined}
            onChange={(event) => {
              setNote(event.target.value);
            }}
          />
          <p className={styles.muted}>
            <strong>{t("visible")}</strong>
          </p>
          <div className={styles.sheetActions}>
            {filled ? (
              <Button
                variant="dangerQuiet"
                size="md"
                loading={pending}
                onClick={() => {
                  save({ iban: "", note: "" }, "deleted", () => {
                    save(previous, "saved");
                  });
                }}
              >
                {t("delete")}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setOpen(false);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" size="md" loading={pending}>
              {t("save")}
            </Button>
          </div>
        </form>
      </BottomSheet>
    </section>
  );
}
