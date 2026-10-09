"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, FieldLabel, TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Stepper } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import {
  diffDays,
  formatDate,
  formatDateRange,
  isIsoDate,
  presetRange,
  summerYear,
  todayIso,
  type RangePreset,
} from "@/lib/dates";
import {
  DESCRIPTION_COUNTER_FROM,
  firstErrorField,
  NIGHTS_MAX,
  NIGHTS_MIN,
  TRIP_FIELDS,
  TRIP_NAME_MAX,
  validateTrip,
  type TripDraft,
  type TripError,
  type TripErrors,
  type TripField,
} from "@/lib/trip-input";
import type { TripFormState } from "../actions";
import styles from "./trip-form.module.css";

export interface RegionGroup {
  label: string;
  options: { value: string; label: string }[];
}

interface TripFormProps {
  mode: "create" | "edit";
  initial: TripDraft;
  /** Server's today – only for the preset labels (stable SSR markup). */
  today: string;
  /** Viewer's Intl locale for the date texts, e.g. "de-DE". */
  intl: string;
  regions: RegionGroup[];
  /** Server Action for the form (create: createTripFormAction, edit: bound update). */
  action: (previous: TripFormState, formData: FormData) => Promise<TripFormState>;
  /**
   * Create while signed out: instead of submitting, hand the valid draft to the caller,
   * who runs the sign-in steps first (Flow G #4). Return true when handled.
   */
  interceptSubmit?: ((draft: TripDraft) => boolean) | undefined;
  /** Edit: start date before the change (may lie in the past). */
  originalStart?: string | undefined;
  /** Live draft changes (create: kept in `pendingAuth` storage). */
  onDraftChange?: ((draft: TripDraft) => void) | undefined;
  notice?: ReactNode;
}

/**
 * Trip form W05 (create) and W12 (edit): name, search range with quick picks, nights
 * steppers, «Mehr Optionen» (description, holiday region, deadline). Validation per
 * ux-spec §5: on submit and on leaving an edited field, errors disappear live once fixed,
 * focus to the first faulty field plus an error summary (form > 3 fields).
 */
export function TripForm({
  mode,
  initial,
  today,
  intl,
  regions,
  action,
  interceptSubmit,
  originalStart,
  onDraftChange,
  notice,
}: TripFormProps) {
  const t = useTranslations("tripForm");
  const toast = useToast();
  const router = useRouter();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<TripDraft>(initial);
  const [touched, setTouched] = useState<ReadonlySet<TripField>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  const [serverErrors, setServerErrors] = useState<TripErrors>({});
  const lastState = useRef(state);

  // Server answer: field errors replace the client ones; success (edit) → toast.
  useEffect(() => {
    if (lastState.current === state) return;
    lastState.current = state;
    if (state.errors) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the action result
      setServerErrors(state.errors);
      setSubmitted(true);
      focusField(firstErrorField(state.errors));
    }
    if (state.ok) {
      setDirty(false);
      toast({ message: t("saved") });
      router.refresh();
    }
  }, [state, t, toast, router]);

  // Unsaved changes (edit only, ux-spec §3): ask before leaving the page.
  useEffect(() => {
    if (mode !== "edit" || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, mode]);

  const validation = validateTrip(draft, { today: todayIso(), originalStart });
  const clientErrors: TripErrors = validation.ok ? {} : validation.errors;
  const shown: TripErrors = {};
  for (const field of TRIP_FIELDS) {
    const error = clientErrors[field] ?? (submitted ? serverErrors[field] : undefined);
    if (error && (submitted || touched.has(field))) shown[field] = clientErrors[field] ?? error;
  }

  function update(patch: Partial<TripDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    setDirty(true);
    setServerErrors({});
    onDraftChange?.(next);
  }

  function touch(field: TripField) {
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  }

  function focusField(field: TripField | undefined) {
    if (!field) return;
    const element = formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`);
    if (field === "description" || field === "holidayRegion" || field === "deadline") {
      const details = formRef.current?.querySelector("details");
      if (details) details.open = true;
    }
    element?.focus();
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    setSubmitted(true);
    if (!validation.ok) {
      event.preventDefault();
      focusField(firstErrorField(validation.errors));
      return;
    }
    if (interceptSubmit?.(draft)) event.preventDefault();
  }

  const message = (error: TripError | undefined) =>
    error ? t(`errors.${error.key}`, error.values ?? {}) : undefined;
  const fieldId = (field: TripField) => `${ids}-${field}`;
  const errorEntries = TRIP_FIELDS.filter((field) => shown[field]);
  const presets: { preset: RangePreset; label: string }[] = [
    { preset: "next3", label: t("presetNext3") },
    { preset: "next6", label: t("presetNext6") },
    { preset: "summer", label: t("presetSummer", { year: summerYear(today) }) },
  ];
  const rangeValid =
    isIsoDate(draft.rangeStart) && isIsoDate(draft.rangeEnd) && draft.rangeEnd > draft.rangeStart;
  const minNights = Number(draft.minNights);
  const nightsValid = Number.isInteger(minNights) && minNights >= NIGHTS_MIN;
  const descriptionLength = Array.from(draft.description).length;
  const optionalOpen =
    mode === "edit" || Boolean(shown.description ?? shown.holidayRegion ?? shown.deadline);

  return (
    <form
      ref={formRef}
      className={styles.form}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={notice ? `${ids}-notice` : undefined}
    >
      {notice ? <div id={`${ids}-notice`}>{notice}</div> : null}
      {submitted && errorEntries.length > 0 ? (
        <div ref={summaryRef} className={styles.summary} role="alert">
          <p className={styles.summaryTitle}>{t("errorSummary")}</p>
          <ul>
            {errorEntries.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldId(field)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusField(field);
                  }}
                >
                  {message(shown[field])}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.error ? (
        <Banner tone="danger" role="alert">
          {t("failed")}
        </Banner>
      ) : null}

      <TextField
        id={fieldId("name")}
        name="name"
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        autoComplete="off"
        maxLength={TRIP_NAME_MAX + 20}
        value={draft.name}
        onChange={(event) => {
          update({ name: event.target.value });
        }}
        onBlur={() => {
          if (draft.name !== initial.name) touch("name");
        }}
        error={message(shown.name)}
      />

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t("rangeLegend")}</legend>
        <div className={styles.presets} role="group" aria-label={t("presetsLabel")}>
          {presets.map(({ preset, label }) => {
            const range = presetRange(preset, todayIso());
            const active = draft.rangeStart === range.start && draft.rangeEnd === range.end;
            return (
              <button
                key={preset}
                type="button"
                className={cx(styles.preset, active && styles.presetActive)}
                aria-pressed={active}
                onClick={() => {
                  update({ rangeStart: range.start, rangeEnd: range.end });
                  touch("rangeStart");
                  touch("rangeEnd");
                }}
              >
                {active ? <Icon name="check" size={16} /> : null}
                {label}
              </button>
            );
          })}
        </div>
        <div className={styles.dates}>
          <DateField
            id={fieldId("rangeStart")}
            name="rangeStart"
            label={t("startLabel")}
            value={draft.rangeStart}
            min={mode === "create" ? todayIso() : undefined}
            onChange={(value) => {
              update({ rangeStart: value });
            }}
            onBlur={() => {
              touch("rangeStart");
            }}
            error={message(shown.rangeStart)}
          />
          <DateField
            id={fieldId("rangeEnd")}
            name="rangeEnd"
            label={t("endLabel")}
            value={draft.rangeEnd}
            min={draft.rangeStart || undefined}
            onChange={(value) => {
              update({ rangeEnd: value });
            }}
            onBlur={() => {
              touch("rangeEnd");
            }}
            error={message(shown.rangeEnd)}
          />
        </div>
        {rangeValid ? (
          <p className={styles.plain} aria-live="polite" suppressHydrationWarning>
            {formatDateRange(draft.rangeStart, draft.rangeEnd, intl, { weekday: true, today })}
            {" · "}
            {t("nights", { count: diffDays(draft.rangeStart, draft.rangeEnd) })}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t("durationLegend")}</legend>
        <div className={styles.stepperRow}>
          <span className={styles.stepperLabel} aria-hidden="true">
            {t("minNightsLabel")}
          </span>
          <Stepper
            id={fieldId("minNights")}
            name="minNights"
            label={t("minNightsAria")}
            value={draft.minNights}
            min={NIGHTS_MIN}
            max={NIGHTS_MAX}
            unit={t("nightsUnit", { count: nightsValid ? minNights : 2 })}
            decreaseLabel={t("decrease")}
            increaseLabel={t("increase")}
            invalid={Boolean(shown.minNights)}
            describedBy={`${fieldId("minNights")}-days${shown.minNights ? ` ${fieldId("minNights")}-error` : ""}`}
            onChange={(value) => {
              update({ minNights: value });
              touch("minNights");
            }}
          />
        </div>
        <p id={`${fieldId("minNights")}-days`} className={styles.plain}>
          {nightsValid ? t("nightsDays", { days: minNights + 1 }) : null}
        </p>
        {shown.minNights ? (
          <FieldError id={`${fieldId("minNights")}-error`}>{message(shown.minNights)}</FieldError>
        ) : null}
        <div className={styles.stepperRow}>
          <span className={styles.stepperLabel} aria-hidden="true">
            {t("preferredLabel")}
          </span>
          <Stepper
            id={fieldId("preferredNights")}
            name="preferredNights"
            label={t("preferredAria")}
            value={draft.preferredNights}
            optional
            min={nightsValid ? Math.min(minNights, NIGHTS_MAX) : NIGHTS_MIN}
            max={NIGHTS_MAX}
            placeholder={t("preferredPlaceholder")}
            unit={t("nightsUnit", { count: Number(draft.preferredNights) || 2 })}
            decreaseLabel={t("decrease")}
            increaseLabel={t("increase")}
            invalid={Boolean(shown.preferredNights)}
            describedBy={shown.preferredNights ? `${fieldId("preferredNights")}-error` : undefined}
            onChange={(value) => {
              update({ preferredNights: value });
              touch("preferredNights");
            }}
          />
        </div>
        {shown.preferredNights ? (
          <FieldError id={`${fieldId("preferredNights")}-error`}>
            {message(shown.preferredNights)}
          </FieldError>
        ) : null}
      </fieldset>

      <OptionalSection open={optionalOpen} label={t("moreOptions")} flat={mode === "edit"}>
        <div className={styles.field}>
          <FieldLabel htmlFor={fieldId("description")}>{t("descriptionLabel")}</FieldLabel>
          <textarea
            id={fieldId("description")}
            name="description"
            className={cx(styles.textarea, shown.description && styles.invalid)}
            rows={3}
            placeholder={t("descriptionPlaceholder")}
            value={draft.description}
            aria-invalid={shown.description ? true : undefined}
            aria-describedby={
              [
                descriptionLength >= DESCRIPTION_COUNTER_FROM
                  ? `${fieldId("description")}-count`
                  : "",
                shown.description ? `${fieldId("description")}-error` : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onChange={(event) => {
              update({ description: event.target.value });
            }}
            onBlur={() => {
              touch("description");
            }}
          />
          {descriptionLength >= DESCRIPTION_COUNTER_FROM ? (
            <FieldHint id={`${fieldId("description")}-count`}>
              {t("descriptionCounter", { count: descriptionLength })}
            </FieldHint>
          ) : null}
          {shown.description ? (
            <FieldError id={`${fieldId("description")}-error`}>
              {message(shown.description)}
            </FieldError>
          ) : null}
        </div>
        <div className={styles.field}>
          <FieldLabel htmlFor={fieldId("holidayRegion")}>{t("regionLabel")}</FieldLabel>
          <select
            id={fieldId("holidayRegion")}
            name="holidayRegion"
            className={styles.select}
            value={draft.holidayRegion}
            aria-describedby={`${fieldId("holidayRegion")}-hint`}
            aria-invalid={shown.holidayRegion ? true : undefined}
            onChange={(event) => {
              update({ holidayRegion: event.target.value });
            }}
          >
            {regions.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldHint id={`${fieldId("holidayRegion")}-hint`}>{t("regionHint")}</FieldHint>
          {shown.holidayRegion ? (
            <FieldError id={`${fieldId("holidayRegion")}-error`}>
              {message(shown.holidayRegion)}
            </FieldError>
          ) : null}
        </div>
        <DateField
          id={fieldId("deadline")}
          name="deadline"
          label={t("deadlineLabel")}
          hint={t("deadlineHint")}
          value={draft.deadline}
          min={todayIso()}
          max={draft.rangeEnd || undefined}
          intl={intl}
          onChange={(value) => {
            update({ deadline: value });
          }}
          onBlur={() => {
            touch("deadline");
          }}
          error={message(shown.deadline)}
        />
      </OptionalSection>

      <Button
        type="submit"
        block
        loading={pending}
        loadingLabel={mode === "create" ? t("submitting") : t("saving")}
      >
        {mode === "create" ? t("submit") : t("save")}
      </Button>
    </form>
  );
}

function OptionalSection({
  open,
  label,
  flat,
  children,
}: {
  open: boolean;
  label: string;
  flat: boolean;
  children: ReactNode;
}) {
  const [isOpen, setOpen] = useState(open);
  // An error inside opens the section (focus target must be visible).
  if (open && !isOpen) setOpen(true);
  if (flat) return <div className={styles.optional}>{children}</div>;
  return (
    <details
      className={styles.details}
      open={isOpen}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className={styles.summaryToggle}>
        <span>{label}</span>
        <Icon name="chevron-down" size={18} className={styles.chevron} />
      </summary>
      <div className={styles.optional}>{children}</div>
    </details>
  );
}

interface DateFieldProps {
  id: string;
  name: TripField;
  label: string;
  hint?: string | undefined;
  value: string;
  min?: string | undefined;
  max?: string | undefined;
  /** Shows the chosen date in the app format next to the native picker (ux-spec §4.7). */
  intl?: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string | undefined;
}

/** Native date input (robust, accessible, system picker on phones – ux-spec §4.7). */
function DateField({
  id,
  name,
  label,
  hint,
  value,
  min,
  max,
  intl,
  onChange,
  onBlur,
  error,
}: DateFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const plainId = intl && isIsoDate(value) ? `${id}-plain` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        name={name}
        type="date"
        className={cx(styles.date, error && styles.invalid)}
        value={value}
        min={min}
        max={max}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, plainId, errorId].filter(Boolean).join(" ") || undefined}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onBlur={onBlur}
      />
      {plainId && intl ? (
        <p id={plainId} className={styles.plain} suppressHydrationWarning>
          {formatDate(value, intl)}
        </p>
      ) : null}
      {hint && hintId ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
