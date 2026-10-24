"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { FieldError, FieldHint } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  amountInput,
  COST_CATEGORIES,
  COST_LIMITS,
  COST_NOTE_COUNTER_FROM,
  COST_TITLE_COUNTER_FROM,
  extraCentParties,
  fillEmpty,
  formatExact,
  parseAmount,
  parseShareAmount,
  remainderCents,
  splitEqual,
  validateExpense,
  type CostCategory,
  type ExpenseErrors,
  type ExpenseField,
  type SplitMode,
} from "@/lib/costs";
import { cx } from "@/lib/cx";
import { currencySymbol } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { textLength } from "@/lib/trip-info";
import { costsPath, tripPath } from "@/features/trips/paths";
import { saveExpenseAction } from "../actions";
import { personLabel } from "../derive";
import type { CostExpenseView, CostPersonView, CostsModel } from "../load";
import styles from "./expense-form.module.css";

const CATEGORY_ICON: Record<CostCategory, IconName> = {
  accommodation: "bed",
  travel: "car",
  food: "food",
  activities: "ticket",
  other: "tag",
};

interface FormValues {
  amount: string;
  title: string;
  note: string;
  noteOpen: boolean;
  category: CostCategory | null;
  payer: string;
  participants: string[];
  mode: SplitMode;
  amounts: Record<string, string>;
  date: string;
}

function valuesOf(expense: CostExpenseView | null, model: CostsModel, date: string): FormValues {
  if (!expense) {
    return {
      amount: "",
      title: "",
      note: "",
      noteOpen: false,
      category: null,
      payer: model.me,
      participants: model.people.filter((p) => p.active).map((p) => p.key),
      mode: "equal",
      amounts: {},
      date,
    };
  }
  return {
    amount: amountInput(expense.amountCents, model.locale),
    title: expense.title,
    note: expense.note ?? "",
    noteOpen: Boolean(expense.note),
    category: (expense.category as CostCategory | null) ?? null,
    payer: expense.payer,
    participants: expense.shares.map((s) => s.party),
    mode: expense.mode,
    amounts:
      expense.mode === "amounts"
        ? Object.fromEntries(
            expense.shares.map((s) => [s.party, amountInput(s.cents, model.locale)]),
          )
        : {},
    date: expense.date,
  };
}

/** Currency symbol position by language (DE «60,00 €», EN «€60.00»). */
const symbolOf = currencySymbol;

function currencyName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Debounced copy of a value (live lines, W19-12: 500 ms). */
function useDebounced<T>(value: T, ms: number): T {
  const [state, setState] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(value);
    }, ms);
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, ms]);
  return state;
}

function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${String(Date.now())}-${String(Math.random()).slice(2)}`;
}

type Conflict =
  | { kind: "changed"; current: CostExpenseView | null }
  | { kind: "deleted" }
  | { kind: "closed"; orga: string };

/**
 * «Ausgabe hinzufügen / bearbeiten» (W19 D.5, R.8 I10-02/I10-03): amount (decimal keyboard,
 * «12.50» also on DE), what for, optional category and note, payer, for whom (members and
 * placeholders; former members only remain in an edit), split equally (live line with the rest
 * cents) or by amounts (live line «noch … zu verteilen»), date in the allowed window. Saving is
 * NOT optimistic: loading state + idempotency key per form opening; edits send the version read
 * and show a conflict instead of overwriting silently.
 */
export function ExpenseForm({
  model,
  expense,
  date,
  fromCockpit,
}: {
  model: CostsModel;
  expense: CostExpenseView | null;
  date: string;
  fromCockpit: boolean;
}) {
  const t = useTranslations("costForm");
  const tc = useTranslations("costs");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const ids = useId();
  const [values, setValues] = useState<FormValues>(() => valuesOf(expense, model, date));
  const [initial] = useState(() => JSON.stringify(valuesOf(expense, model, date)));
  const [version, setVersion] = useState(expense?.version ?? 0);
  const [editId, setEditId] = useState(expense?.id ?? null);
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ExpenseField, boolean>>>({});
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [discard, setDiscard] = useState<string | null>(null);
  const conflictRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);

  const { locale, intl, currency } = model;
  const symbol = useMemo(() => symbolOf(currency, intl), [currency, intl]);
  const money = (cents: number) => formatExact(cents, currency, intl);
  const byKey = useMemo(() => new Map(model.people.map((p) => [p.key, p])), [model.people]);
  const name = (key: string) =>
    personLabel(byKey.get(key), tc as unknown as Parameters<typeof personLabel>[1]);
  const editShares = useMemo(() => new Set(expense?.shares.map((s) => s.party) ?? []), [expense]);
  // People in chips/select: me first, then seq; former members only when already in the expense.
  const people = useMemo(
    () =>
      model.people
        .filter((p) => p.active || editShares.has(p.key) || p.key === expense?.payer)
        .sort((a, b) => (a.me ? -1 : b.me ? 1 : a.seq - b.seq)),
    [model.people, editShares, expense],
  );
  const chosen = people.filter((p) => values.participants.includes(p.key));
  const amount = parseAmount(values.amount, locale);
  const dirty = JSON.stringify(values) !== initial;

  // «Zurück» with entries → «Ausgabe verwerfen?» (ux-spec §3) – also for the head's back link.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      if (submitting.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      if (link.closest("[data-discard-ok]")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      setDiscard(url.pathname + url.search + url.hash);
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (submitting.current) return;
      event.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);

  const update = (patch: Partial<FormValues>) => {
    setValues((v) => ({ ...v, ...patch }));
  };

  const formInput = (v: FormValues) => ({
    amount: v.amount,
    title: v.title,
    note: v.noteOpen ? v.note : "",
    category: v.category,
    payer: v.payer,
    participants: v.participants,
    mode: v.mode,
    amounts: v.mode === "amounts" ? v.amounts : {},
    date: v.date,
  });

  const check = (v: FormValues) =>
    validateExpense(formInput(v), {
      locale,
      parties: people.map((p) => ({ id: p.key, seq: p.seq })),
      payers: people.map((p) => p.key),
      window: model.window,
    });

  const blur = (field: ExpenseField) => {
    setTouched((s) => ({ ...s, [field]: true }));
    const result = check(values);
    setErrors(result.ok ? {} : result.errors);
  };

  const shownError = (field: ExpenseField) => (touched[field] ? errors[field] : undefined);

  const errorText = (field: ExpenseField, error: string | undefined): string | null => {
    if (!error) return null;
    if (error === "tooLong")
      return field === "note" ? t("error.tooLongNote") : t("error.tooLongTitle");
    if (error === "dateRange") {
      return t("error.dateRange", {
        from: formatDate(model.window.min, intl, { weekday: false }),
        to: formatDate(model.window.max, intl, { weekday: false }),
      });
    }
    return t(`error.${error}` as "error.amountMissing");
  };

  const focusFirst = (errs: ExpenseErrors) => {
    const order: [ExpenseField, string][] = [
      ["amount", `${ids}-amount`],
      ["title", `${ids}-title`],
      ["payer", `${ids}-payer`],
      ["for", `${ids}-for-0`],
      ["split", `${ids}-split-0`],
      ["date", `${ids}-date`],
      ["note", `${ids}-note`],
    ];
    const first = order.find(([field]) => errs[field]);
    if (first) document.getElementById(first[1])?.focus();
  };

  const send = (override?: { version: number; asNew?: boolean }) => {
    const result = check(values);
    if (!result.ok) {
      setErrors(result.errors);
      setTouched({
        amount: true,
        title: true,
        for: true,
        split: true,
        date: true,
        note: true,
        payer: true,
      });
      focusFirst(result.errors);
      return;
    }
    setErrors({});
    setSaveError(null);
    setPending(true);
    submitting.current = true;
    const asNew = override?.asNew === true;
    const edit =
      !asNew && editId ? { id: editId, version: override?.version ?? version } : undefined;
    void saveExpenseAction(model.publicId, {
      ...formInput(values),
      note: values.noteOpen ? values.note : null,
      locale,
      ...(edit ? { edit } : { idempotencyKey }),
    })
      .then((answer) => {
        if (answer.ok) {
          // W19 E.7: the snackbar names the new result (shows the effect of the expense).
          const balance = answer.balanceCents;
          const saved =
            balance < 0
              ? t("savedOwe", { amount: money(-balance) })
              : balance > 0
                ? t("savedOwed", { amount: money(balance) })
                : t("savedSquare");
          if (edit) {
            toast({ message: t("savedEdit") });
            router.push(`${costsPath(model.publicId)}?saved=${encodeURIComponent(answer.id)}`);
          } else if (fromCockpit) {
            toast({
              message: saved,
              action: {
                label: t("view"),
                onAction: () => {
                  router.push(costsPath(model.publicId));
                },
              },
            });
            router.push(`${tripPath(model.publicId)}?focus=add-expense`);
          } else {
            toast({ message: saved });
            router.push(`${costsPath(model.publicId)}?saved=${encodeURIComponent(answer.id)}`);
          }
          router.refresh();
          return;
        }
        submitting.current = false;
        setPending(false);
        if (answer.error === "invalid") {
          const errs = "errors" in answer ? answer.errors : {};
          setErrors(errs);
          setTouched({
            amount: true,
            title: true,
            for: true,
            split: true,
            date: true,
            note: true,
            payer: true,
          });
          if (Object.keys(errs).length > 0) focusFirst(errs);
          else setSaveError(tc("changed"));
          return;
        }
        if (answer.error === "conflict") {
          setConflict({ kind: "changed", current: "current" in answer ? answer.current : null });
        } else if (answer.error === "deleted" || answer.error === "gone") {
          setConflict({ kind: "deleted" });
        } else if (answer.error === "closed") {
          setConflict({ kind: "closed", orga: "orga" in answer ? answer.orga : "" });
        } else if (answer.error === "limited") {
          setSaveError(tc("limited"));
        } else {
          setSaveError(t("error.save"));
        }
        requestAnimationFrame(() => conflictRef.current?.focus());
      })
      .catch(() => {
        submitting.current = false;
        setPending(false);
        setSaveError(t("error.save"));
      });
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || conflict?.kind === "closed") return;
    send();
  };

  /* ---------------- live lines ---------------- */
  const equalLine = (() => {
    if (!amount.ok || chosen.length === 0) return t("perPersonNone");
    const shares = splitEqual(
      amount.cents,
      chosen.map((p) => ({ id: p.key, seq: p.seq })),
    );
    const base = Math.min(...shares.map((s) => s.cents));
    const extra = extraCentParties(
      amount.cents,
      chosen.map((p) => ({ id: p.key, seq: p.seq })),
    );
    if (extra.length === 0) return t("perPerson", { amount: money(base) });
    const names = extra.map((key) => (byKey.get(key)?.me ? tc("row.you") : name(key)));
    return t("perPersonRest", {
      amount: money(base),
      names: new Intl.ListFormat(locale, { type: "conjunction" }).format(names),
      count: extra.length,
    });
  })();
  const typedShares = chosen.map((p) => {
    const parsed = parseShareAmount(values.amounts[p.key], locale);
    return {
      party: p.key,
      cents: parsed.ok ? parsed.cents : 0,
      empty: !values.amounts[p.key]?.trim(),
    };
  });
  const rest = amount.ok ? remainderCents(amount.cents, typedShares) : null;
  const restLine =
    rest === null
      ? null
      : rest > 0
        ? { tone: "warn", text: t("remain", { amount: money(rest) }) }
        : rest < 0
          ? { tone: "warn", text: t("over", { amount: money(-rest) }) }
          : { tone: "ok", text: t("ok") };
  const liveText = values.mode === "equal" ? equalLine : (restLine?.text ?? "");
  const live = useDebounced(liveText, 500);
  const liveRest = useDebounced(restLine, 500);

  const titleLength = textLength(values.title);
  const noteLength = textLength(values.note);
  const formers = people.filter((p) => p.kind === "former");
  const isEdit = editId !== null;

  const conflictBanner: ReactNode = conflict ? (
    <div ref={conflictRef} tabIndex={-1} className={styles.conflict}>
      {conflict.kind === "changed" ? (
        <Banner tone="warning" role="alert">
          <span className={styles.conflictText}>
            <span>
              {t("conflict.changed", { name: conflict.current?.edited?.byName ?? tc("someone") })}
            </span>
            {conflict.current ? (
              <span>
                {t("conflict.now", {
                  summary: `${money(conflict.current.amountCents)} · ${conflict.current.title}`,
                })}
              </span>
            ) : null}
          </span>
          <span className={styles.conflictActions}>
            {conflict.current ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const current = conflict.current;
                  if (!current) return;
                  setValues(valuesOf(current, model, date));
                  setVersion(current.version);
                  setConflict(null);
                }}
              >
                {t("conflict.take")}
              </Button>
            ) : null}
            {conflict.current ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const next = conflict.current?.version ?? version;
                  setVersion(next);
                  setConflict(null);
                  send({ version: next });
                }}
              >
                {t("conflict.mine")}
              </Button>
            ) : null}
          </span>
        </Banner>
      ) : conflict.kind === "deleted" ? (
        <Banner tone="warning" role="alert">
          <span className={styles.conflictText}>{t("conflict.deleted")}</span>
          <span className={styles.conflictActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditId(null);
                setIdempotencyKey(newKey());
                setConflict(null);
                send({ version: 0, asNew: true });
              }}
            >
              {t("conflict.asNew")}
            </Button>
            <span data-discard-ok="">
              <ButtonLink href={costsPath(model.publicId)} variant="secondary" size="sm">
                {t("conflict.toList")}
              </ButtonLink>
            </span>
          </span>
        </Banner>
      ) : (
        <Banner tone="warning" role="alert">
          <span className={styles.conflictText}>
            {t("conflict.closed", { orga: conflict.orga })}
          </span>
          <span className={styles.conflictActions} data-discard-ok="">
            <ButtonLink href={costsPath(model.publicId)} variant="secondary" size="sm">
              {t("conflict.toList")}
            </ButtonLink>
          </span>
        </Banner>
      )}
    </div>
  ) : null;

  const amountError = errorText("amount", shownError("amount"));
  const titleError = errorText("title", shownError("title"));
  const forError = errorText("for", shownError("for"));
  const splitError = errorText("split", shownError("split"));
  const dateError = errorText("date", shownError("date"));
  const noteError = errorText("note", shownError("note"));

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {conflictBanner}

      {/* Amount */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-amount`}>
          {t("amount")}
          <span className="visually-hidden">{` (${t("amountSr", { currency: currencyName(currency, locale) })})`}</span>
        </label>
        <div
          className={cx(styles.amountBox, symbol.before ? styles.symbolBefore : styles.symbolAfter)}
        >
          <input
            ref={amountRef}
            id={`${ids}-amount`}
            className={cx(styles.amountInput, amountError && styles.invalid)}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="next"
            // Autofocus only for a new expense (W19 D.5).
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={!isEdit}
            placeholder={locale === "de" ? "0,00" : "0.00"}
            value={values.amount}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? `${ids}-amount-error` : undefined}
            onChange={(event) => {
              update({ amount: event.target.value });
            }}
            onBlur={() => {
              const parsed = parseAmount(values.amount, locale);
              if (parsed.ok) update({ amount: amountInput(parsed.cents, locale) });
              blur("amount");
            }}
          />
          <span className={styles.symbol} aria-hidden="true">
            {symbol.symbol}
          </span>
        </div>
        {amountError ? <FieldError id={`${ids}-amount-error`}>{amountError}</FieldError> : null}
      </div>

      {/* What for */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-title`}>
          {t("what")}
        </label>
        <input
          id={`${ids}-title`}
          className={cx(styles.input, titleError && styles.invalid)}
          type="text"
          autoComplete="off"
          placeholder={t("whatHint")}
          maxLength={COST_LIMITS.title + 20}
          value={values.title}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={
            [
              titleError ? `${ids}-title-error` : "",
              titleLength >= COST_TITLE_COUNTER_FROM ? `${ids}-title-count` : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) => {
            update({ title: event.target.value });
          }}
          onBlur={() => {
            blur("title");
          }}
        />
        {titleLength >= COST_TITLE_COUNTER_FROM ? (
          <FieldHint id={`${ids}-title-count`}>
            {t("counter", { count: titleLength, max: COST_LIMITS.title })}
          </FieldHint>
        ) : null}
        {titleError ? <FieldError id={`${ids}-title-error`}>{titleError}</FieldError> : null}
      </div>

      {/* Category */}
      <div className={styles.field} role="group" aria-labelledby={`${ids}-cat`}>
        <span className={styles.label} id={`${ids}-cat`}>
          {t("category")}
        </span>
        <div className={styles.chips}>
          {COST_CATEGORIES.map((category) => {
            const pressed = values.category === category;
            return (
              <button
                key={category}
                type="button"
                className={cx(styles.chip, pressed && styles.chipOn)}
                aria-pressed={pressed}
                data-category={category}
                onClick={() => {
                  update({ category: pressed ? null : category });
                }}
              >
                <span
                  className={cx(styles.chipIcon, !pressed && styles[`cat-${category}`])}
                  aria-hidden="true"
                >
                  <Icon name={pressed ? "check" : CATEGORY_ICON[category]} size={18} />
                </span>
                {tc(`cat.${category}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payer */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-payer`}>
          {t("payer")}
        </label>
        <select
          id={`${ids}-payer`}
          className={styles.select}
          value={values.payer}
          onChange={(event) => {
            update({ payer: event.target.value });
          }}
        >
          {people
            .filter((p) => p.active || p.key === values.payer)
            .map((p) => (
              <option key={p.key} value={p.key}>
                {p.me
                  ? t("me", { name: p.name ?? "" })
                  : p.kind === "placeholder"
                    ? `${p.name ?? ""} · ${tc("placeholder")}`
                    : name(p.key)}
              </option>
            ))}
        </select>
      </div>

      {/* For whom */}
      <fieldset
        className={styles.fieldset}
        aria-describedby={forError ? `${ids}-for-error` : undefined}
      >
        <legend className={styles.legendRow}>
          <span className={styles.label}>{t("for")}</span>
        </legend>
        <div className={styles.forHead}>
          <span className={styles.count} aria-hidden="true">
            {t("count", { count: chosen.length, total: people.length })}
          </span>
          <span className="visually-hidden" aria-live="polite">
            {t("countSr", { count: chosen.length, total: people.length })}
          </span>
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              const allActive = people.filter((p) => p.active).map((p) => p.key);
              const everyone = allActive.every((k) => values.participants.includes(k));
              update({
                participants: everyone ? [] : [...new Set([...values.participants, ...allActive])],
              });
            }}
          >
            {people.filter((p) => p.active).every((p) => values.participants.includes(p.key))
              ? t("none")
              : t("all")}
          </Button>
        </div>
        <div className={styles.chips}>
          {people.map((p, i) => {
            const checked = values.participants.includes(p.key);
            const locked = p.kind === "former" && !checked;
            return (
              <label
                key={p.key}
                className={cx(styles.chip, styles.personChip, checked && styles.chipOn)}
              >
                <input
                  id={`${ids}-for-${String(i)}`}
                  type="checkbox"
                  className={styles.check}
                  checked={checked}
                  disabled={locked}
                  onChange={() => {
                    update({
                      participants: checked
                        ? values.participants.filter((k) => k !== p.key)
                        : [...values.participants, p.key],
                    });
                    setTouched((s) => ({ ...s, for: true }));
                  }}
                />
                <ChipAvatar person={p} />
                <span>
                  {p.me ? tc("you") : name(p.key)}
                  {p.kind === "placeholder" ? (
                    <span className={styles.chipExtra}>{` · ${tc("placeholder")}`}</span>
                  ) : null}
                </span>
                <span className={styles.chipCheck} aria-hidden="true">
                  {checked ? <Icon name="check" size={16} /> : null}
                </span>
              </label>
            );
          })}
        </div>
        {formers.length > 0 ? <p className={styles.hint}>{t("formerOnly")}</p> : null}
        {forError ? <FieldError id={`${ids}-for-error`}>{forError}</FieldError> : null}
      </fieldset>

      {/* Split */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>{t("split")}</legend>
        <div className={styles.segment}>
          {(["equal", "amounts"] as const).map((mode) => (
            <label
              key={mode}
              className={cx(styles.segmentItem, values.mode === mode && styles.segmentOn)}
            >
              <input
                type="radio"
                className={styles.segmentRadio}
                name={`${ids}-mode`}
                value={mode}
                checked={values.mode === mode}
                onChange={() => {
                  update({ mode });
                }}
              />
              {mode === "equal" ? t("equal") : t("custom")}
            </label>
          ))}
        </div>
        {values.mode === "amounts" ? (
          <div className={styles.amounts}>
            {chosen.map((p, i) => (
              <div key={p.key} className={styles.amountRow}>
                <ChipAvatar person={p} />
                <label className={styles.amountName} htmlFor={`${ids}-split-${String(i)}`}>
                  {p.me ? tc("you") : name(p.key)}
                  <span className="visually-hidden">{` – ${t("customFor", { name: p.me ? tc("you") : name(p.key) })}`}</span>
                </label>
                <input
                  id={`${ids}-split-${String(i)}`}
                  className={cx(
                    styles.input,
                    styles.shareInput,
                    i === 0 && splitError && styles.invalid,
                  )}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={locale === "de" ? "0,00" : "0.00"}
                  value={values.amounts[p.key] ?? ""}
                  aria-invalid={i === 0 && splitError ? true : undefined}
                  aria-describedby={i === 0 && splitError ? `${ids}-split-error` : undefined}
                  onChange={(event) => {
                    update({ amounts: { ...values.amounts, [p.key]: event.target.value } });
                  }}
                  onBlur={(event) => {
                    const parsed = parseShareAmount(event.target.value, locale);
                    if (parsed.ok && parsed.cents > 0) {
                      update({
                        amounts: { ...values.amounts, [p.key]: amountInput(parsed.cents, locale) },
                      });
                    }
                  }}
                />
              </div>
            ))}
            <p
              className={cx(styles.live, liveRest?.tone === "ok" ? styles.liveOk : styles.liveWarn)}
              aria-live="polite"
            >
              {liveRest ? (
                <>
                  <Icon name={liveRest.tone === "ok" ? "check" : "info"} size={16} />
                  <span>{live}</span>
                </>
              ) : null}
            </p>
            {rest !== null && rest > 0 && typedShares.some((s) => s.empty) ? (
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  const empty = chosen
                    .filter((p) => !values.amounts[p.key]?.trim())
                    .map((p) => ({ id: p.key, seq: p.seq }));
                  const filled = fillEmpty(rest, empty);
                  const next = { ...values.amounts };
                  for (const s of filled) next[s.party] = amountInput(s.cents, locale);
                  update({ amounts: next });
                }}
              >
                {t("fill")}
              </Button>
            ) : null}
            {typedShares.some((s) => s.cents === 0) ? (
              <p className={styles.hint}>{t("zeroHint")}</p>
            ) : null}
            {splitError ? <FieldError id={`${ids}-split-error`}>{splitError}</FieldError> : null}
          </div>
        ) : (
          <p className={styles.live} aria-live="polite">
            {live}
          </p>
        )}
      </fieldset>

      {/* Date */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${ids}-date`}>
          {t("date")}
        </label>
        <input
          id={`${ids}-date`}
          className={cx(styles.input, dateError && styles.invalid)}
          type="date"
          min={model.window.min}
          max={model.window.max}
          value={values.date}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={dateError ? `${ids}-date-error` : undefined}
          onChange={(event) => {
            update({ date: event.target.value });
          }}
          onBlur={() => {
            blur("date");
          }}
        />
        {dateError ? <FieldError id={`${ids}-date-error`}>{dateError}</FieldError> : null}
      </div>

      {/* Note */}
      {values.noteOpen ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${ids}-note`}>
            {t("note")}
          </label>
          <input
            id={`${ids}-note`}
            className={cx(styles.input, noteError && styles.invalid)}
            type="text"
            autoComplete="off"
            maxLength={COST_LIMITS.note + 20}
            value={values.note}
            aria-invalid={noteError ? true : undefined}
            aria-describedby={noteError ? `${ids}-note-error` : undefined}
            onChange={(event) => {
              update({ note: event.target.value });
            }}
            onBlur={() => {
              blur("note");
            }}
          />
          {noteLength >= COST_NOTE_COUNTER_FROM ? (
            <FieldHint id={`${ids}-note-count`}>
              {t("counter", { count: noteLength, max: COST_LIMITS.note })}
            </FieldHint>
          ) : null}
          {noteError ? <FieldError id={`${ids}-note-error`}>{noteError}</FieldError> : null}
        </div>
      ) : (
        <Button
          variant="text"
          size="sm"
          icon="plus"
          className={styles.noteToggle}
          aria-label={t("addNoteName")}
          onClick={() => {
            update({ noteOpen: true });
            requestAnimationFrame(() => document.getElementById(`${ids}-note`)?.focus());
          }}
        >
          {t("addNote")}
        </Button>
      )}

      {saveError ? (
        <Banner tone="warning" role="alert">
          {saveError}
        </Banner>
      ) : null}

      <div className={styles.bar}>
        <Button
          type="submit"
          size="lg"
          block
          loading={pending}
          loadingLabel={t("saving")}
          aria-disabled={conflict?.kind === "closed" || undefined}
        >
          {isEdit ? t("saveEdit") : t("save")}
        </Button>
      </div>

      <BottomSheet
        open={discard !== null}
        onClose={() => {
          setDiscard(null);
        }}
        title={t("discard.title")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.sheetBody}>
          <p>{t("discard.text")}</p>
          <div className={styles.sheetActions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setDiscard(null);
              }}
            >
              {t("discard.keep")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                const target = discard;
                submitting.current = true;
                setDiscard(null);
                if (target) router.push(target);
              }}
            >
              {t("discard.confirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </form>
  );
}

function ChipAvatar({ person }: { person: CostPersonView }) {
  if (person.kind === "former") {
    return (
      <span className={styles.formerAvatar} aria-hidden="true">
        <Icon name="user" size={14} />
      </span>
    );
  }
  return (
    <Avatar
      id={person.avatarId}
      name={person.name ?? ""}
      size="sm"
      open={person.kind === "placeholder"}
    />
  );
}
