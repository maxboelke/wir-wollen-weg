"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import type { IsoDate } from "@/lib/dates";
import {
  copyFieldsOf,
  COUNTRY_CODES,
  DOCUMENT_TYPES,
  expiresBeforeReturn,
  SEXES,
  splitPastedDate,
  validateTravelValues,
  type TravelField,
  type TravelInput,
  type TravelValues,
  type ValueErrors,
} from "@/lib/travel-data";
import { declineAction, releaseAction, reuseAction } from "../actions";
import { countryName, displayValue, numericDate } from "../format";
import { DemoNote, WarnBox } from "./bits";
import styles from "./travel-data.module.css";

export interface AnswerFormData {
  publicId: string;
  areaHref: string;
  requestId: string;
  tripName: string;
  byName: string;
  purpose: string;
  fields: TravelField[];
  demo: boolean;
  /** «Sa., 26. Juni» */
  deleteOn: string;
  fixedEnd: IsoDate;
  today: IsoDate;
  intl: string;
  /** en-US: month first (W20 H.0). */
  monthFirst: boolean;
  /** Changing an existing release: values prefilled, «Änderungen freigeben». */
  change: boolean;
  initial: TravelInput;
  /** Other own releases in THIS trip with overlapping fields (W20 H.5 «übernehmen»). */
  reuse: { requestId: string; name: string }[];
  privacyHref: string;
}

type Values = Record<keyof TravelInput, string>;

const EMPTY: Values = {
  givenNames: "",
  familyNames: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  sex: "",
  nationality: "",
  documentType: "",
  documentNumber: "",
  expiryDay: "",
  expiryMonth: "",
  expiryYear: "",
  issuingCountry: "",
};

/** Made-up values for the demo (W20 H.12 «Fantasiedaten einsetzen»). */
const FANTASY: Values = {
  givenNames: "Erika Maria",
  familyNames: "Musterfrau",
  birthDay: "12",
  birthMonth: "08",
  birthYear: "1990",
  sex: "F",
  nationality: "DE",
  documentType: "passport",
  documentNumber: "DEMO48151",
  expiryDay: "31",
  expiryMonth: "12",
  expiryYear: "2032",
  issuingCountry: "DE",
};

function toValues(input: TravelInput): Values {
  const out = { ...EMPTY };
  for (const key of Object.keys(EMPTY) as (keyof TravelInput)[]) {
    const value = input[key];
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/**
 * Answering a request (W20 H.5, R.9 I11-05/06): step 1 «Angaben» (only the requested fields,
 * same rules as the server, dates as three fields), step 2 «Freigeben» (own values in plain
 * text + consent checkbox, never pre-ticked). Values live only in this component's state – no
 * storage, no drafts; leaving discards them. Nothing is stored before «An … freigeben».
 */
export function AnswerForm({ data }: { data: AnswerFormData }) {
  const t = useTranslations("travelData");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>(() => toValues(data.initial));
  const [errors, setErrors] = useState<ValueErrors>({});
  const [checked, setChecked] = useState<TravelValues | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sheet, setSheet] = useState<"discard" | "decline" | null>(null);
  const [lastSheet, setLastSheet] = useState<"discard" | "decline">("discard");
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const [announce, setAnnounce] = useState("");
  const [pending, startTransition] = useTransition();
  const done = useRef(false);
  const first = useRef(true);
  const fields = data.fields;
  const has = (field: TravelField) => fields.includes(field);
  const dirty = Object.values(values).some((v) => v.trim() !== "");

  // <title> names the step; the change of step moves the focus to the heading (W20 H.5).
  useEffect(() => {
    document.title = t("answerPageTitle", { name: data.byName, step, trip: data.tripName });
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, t, data.byName, data.tripName]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (!done.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);

  const countries = useMemo(() => {
    const names = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) }));
    return names.sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  const set = (key: keyof Values, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Issuing country defaults to the nationality (W20 H.5).
      if (key === "nationality" && has("issuing_country") && !prev.issuingCountry) {
        next.issuingCountry = value;
      }
      return next;
    });
  };

  function check(): TravelValues | null {
    const result = validateTravelValues(values, fields, { today: data.today, demo: data.demo });
    if (result.ok) {
      setErrors({});
      return result.values;
    }
    setErrors(result.errors);
    const order: (keyof TravelValues)[] = [
      "givenNames",
      "familyNames",
      "birthDate",
      "sex",
      "nationality",
      "documentType",
      "documentNumber",
      "documentExpiry",
      "issuingCountry",
    ];
    const firstKey = order.find((key) => result.errors[key]);
    if (firstKey && Object.keys(result.errors).length === 1) {
      requestAnimationFrame(() => {
        document.getElementById(`${id}-${firstKey}`)?.focus();
      });
    } else {
      requestAnimationFrame(() => {
        document.getElementById(`${id}-summary`)?.focus();
      });
    }
    return null;
  }

  function next() {
    const ok = check();
    if (ok) {
      setChecked(ok);
      setStep(2);
    }
  }

  function release() {
    if (!consent) {
      setConsentError(true);
      consentRef.current?.focus();
      return;
    }
    setFailed(false);
    startTransition(async () => {
      const result = await releaseAction(data.publicId, data.requestId, values, true);
      if (result.ok) {
        done.current = true;
        router.push(`${data.areaHref}?done=released&r=${data.requestId}`);
        return;
      }
      if (result.error === "values") {
        setErrors(result.errors);
        setStep(1);
        return;
      }
      if (result.error === "closed" || result.error === "notAllowed") {
        done.current = true;
        toast({ message: t("fill.closedByBooker", { name: data.byName }) });
        router.push(data.areaHref);
        router.refresh();
        return;
      }
      if (result.error === "consent") {
        setConsentError(true);
        return;
      }
      if (result.error === "limited") toast({ message: t("limited") });
      setFailed(true);
    });
  }

  function decline() {
    startTransition(async () => {
      const result = await declineAction(data.publicId, data.requestId, true);
      done.current = true;
      setSheet(null);
      if (result.ok) toast({ message: t("declined", { name: data.byName }) });
      else toast({ message: t("generic") });
      router.push(data.areaHref);
      router.refresh();
    });
  }

  const errorText = (key: keyof TravelValues) => {
    const code = errors[key];
    return code ? t(`errors.${code}`) : null;
  };
  const errorCount = Object.keys(errors).length;

  const dateGroup = (
    kind: "birth" | "expiry",
    legend: string,
    errorKey: "birthDate" | "documentExpiry",
  ) => {
    const prefix = kind === "birth" ? "birth" : "expiry";
    const dayKey = `${prefix}Day` as keyof Values;
    const monthKey = `${prefix}Month` as keyof Values;
    const yearKey = `${prefix}Year` as keyof Values;
    const auto = kind === "birth";
    const message = errorText(errorKey);
    const errorId = `${id}-${errorKey}-error`;
    const hintId = `${id}-${errorKey}-hint`;
    const part = (
      key: keyof Values,
      label: string,
      cls: string,
      autoComplete: string,
      max: number,
      firstPart: boolean,
    ) => (
      <div className={styles.datePart} key={key}>
        <label htmlFor={firstPart ? `${id}-${errorKey}` : `${id}-${key}`}>{label}</label>
        <input
          id={firstPart ? `${id}-${errorKey}` : `${id}-${key}`}
          className={cx(styles.input, cls)}
          type="text"
          inputMode="numeric"
          maxLength={max}
          autoComplete={auto ? autoComplete : "off"}
          value={values[key]}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${errorId} ${hintId}` : hintId}
          onChange={(event) => {
            set(key, event.target.value.replace(/[^\d]/g, ""));
          }}
          onPaste={
            firstPart
              ? (event) => {
                  const parts = splitPastedDate(
                    event.clipboardData.getData("text"),
                    data.monthFirst,
                  );
                  if (!parts) return;
                  event.preventDefault();
                  setValues((prev) => ({
                    ...prev,
                    [dayKey]: parts.day,
                    [monthKey]: parts.month,
                    [yearKey]: parts.year,
                  }));
                }
              : undefined
          }
        />
      </div>
    );
    const dayPart = (firstPart: boolean) =>
      part(dayKey, t("fill.day"), styles.day ?? "", `bday-day`, 2, firstPart);
    const monthPart = (firstPart: boolean) =>
      part(monthKey, t("fill.month"), styles.month ?? "", `bday-month`, 2, firstPart);
    return (
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{legend}</legend>
        <div className={styles.dateRow}>
          {data.monthFirst ? [monthPart(true), dayPart(false)] : [dayPart(true), monthPart(false)]}
          {part(yearKey, t("fill.year"), styles.year ?? "", "bday-year", 4, false)}
        </div>
        <p className={styles.small} id={hintId}>
          {data.monthFirst ? t("fill.dateHelpUs") : t("fill.dateHelp")}
        </p>
        {message ? (
          <p className={styles.error} id={errorId}>
            <Icon name="warning" size={16} />
            <span>{message}</span>
          </p>
        ) : null}
      </fieldset>
    );
  };

  const text = (
    key: "givenNames" | "familyNames" | "documentNumber",
    label: string,
    extra: { autoComplete: string; upper?: boolean; hint?: ReactNode; max: number },
  ) => {
    const message = errorText(key);
    const errorId = `${id}-${key}-error`;
    const hintId = `${id}-${key}-hint`;
    return (
      <div className={styles.fieldBlock}>
        <label className={styles.label} htmlFor={`${id}-${key}`}>
          {label}
        </label>
        <input
          id={`${id}-${key}`}
          className={cx(styles.input, extra.upper && styles.upper)}
          type="text"
          autoComplete={extra.autoComplete}
          autoCapitalize={extra.upper ? "characters" : "words"}
          spellCheck={false}
          maxLength={extra.max}
          value={values[key]}
          aria-invalid={message ? true : undefined}
          aria-describedby={
            [message ? errorId : null, extra.hint ? hintId : null].filter(Boolean).join(" ") ||
            undefined
          }
          onChange={(event) => {
            set(key, extra.upper ? event.target.value.toUpperCase() : event.target.value);
          }}
        />
        {extra.hint ? (
          <p className={styles.small} id={hintId}>
            {extra.hint}
          </p>
        ) : null}
        {message ? (
          <p className={styles.error} id={errorId}>
            <Icon name="warning" size={16} />
            <span>{message}</span>
          </p>
        ) : null}
      </div>
    );
  };

  const select = (key: "nationality" | "issuingCountry", label: string) => {
    const message = errorText(key);
    const errorId = `${id}-${key}-error`;
    return (
      <div className={styles.fieldBlock}>
        <label className={styles.label} htmlFor={`${id}-${key}`}>
          {label}
        </label>
        <select
          id={`${id}-${key}`}
          className={styles.select}
          autoComplete="off"
          value={values[key]}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          onChange={(event) => {
            set(key, event.target.value);
          }}
        >
          <option value="">{t("fill.choose")}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {message ? (
          <p className={styles.error} id={errorId}>
            <Icon name="warning" size={16} />
            <span>{message}</span>
          </p>
        ) : null}
      </div>
    );
  };

  const expiryIso =
    values.expiryDay && values.expiryMonth && values.expiryYear.length === 4
      ? `${values.expiryYear}-${values.expiryMonth.padStart(2, "0")}-${values.expiryDay.padStart(2, "0")}`
      : undefined;
  const expiryHint =
    has("document_expiry") && expiryIso && /^\d{4}-\d{2}-\d{2}$/.test(expiryIso)
      ? expiryIso < data.today
        ? t("released.expiredDoc")
        : expiresBeforeReturn(expiryIso, data.fixedEnd)
          ? t("released.expiresSoon", { date: numericDate(expiryIso, data.intl) })
          : null
      : null;

  const labels = {
    sex: (code: "F" | "M" | "X") => t(`sex.${code}`),
    documentType: (type: "passport" | "id_card") => t(`documentType.${type}`),
  };

  return (
    <div className={styles.page} data-travel-answer={step}>
      <div className={styles.steps}>
        <div className={styles.stepBars} aria-hidden="true">
          <span data-on="true" />
          <span data-on={step === 2} />
        </div>
        <p className={styles.small}>
          {`${t("fill.step", { step })} · ${step === 1 ? t("fill.step1") : t("fill.step2")}`}
        </p>
      </div>
      <h2 ref={headingRef} className={styles.h2} tabIndex={-1} id={`${id}-heading`}>
        {step === 1 ? t("fill.step1") : t("fill.step2")}
      </h2>

      {step === 1 ? (
        <>
          {data.demo ? (
            <DemoNote
              tag={t("demo.tag")}
              action={
                <button
                  type="button"
                  className={styles.textButton}
                  data-travel-fill=""
                  onClick={() => {
                    const filled = { ...values };
                    for (const key of Object.keys(FANTASY) as (keyof Values)[])
                      filled[key] = FANTASY[key];
                    setValues(filled);
                    setErrors({});
                    setAnnounce(t("demo.filled"));
                  }}
                >
                  <Icon name="sparkle" size={16} />
                  <span>{t("demo.fill")}</span>
                </button>
              }
            >
              {has("document") ? t("demo.formDoc") : t("demo.form")}
            </DemoNote>
          ) : null}
          <div className={styles.shield}>
            <Icon name="shield" size={18} />
            <p>
              <strong>{t("fill.forPurpose", { purpose: data.purpose, name: data.byName })}</strong>
            </p>
          </div>
          <p className={styles.muted}>{t("fill.exact")}</p>
          {data.reuse.map((source) => (
            <button
              key={source.requestId}
              type="button"
              className={styles.textButton}
              onClick={() => {
                void reuseAction(data.publicId, source.requestId, fields).then((result) => {
                  if (!result.ok) {
                    toast({ message: t("loadFailed") });
                    return;
                  }
                  setValues((prev) => ({ ...prev, ...toValues(result.input) }));
                  setAnnounce(t("fill.reused"));
                  requestAnimationFrame(() => {
                    document.getElementById(`${id}-givenNames`)?.focus();
                  });
                });
              }}
            >
              {t("fill.reuse", { name: source.name })}
            </button>
          ))}
          <form
            className={styles.form}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              next();
            }}
          >
            {errorCount >= 2 ? (
              <div id={`${id}-summary`} tabIndex={-1}>
                <Banner tone="danger" role="alert">
                  {t("fill.summary", { count: errorCount })}
                </Banner>
              </div>
            ) : null}
            {has("legal_name") ? (
              <>
                {text("givenNames", t("fill.givenNames"), { autoComplete: "given-name", max: 100 })}
                {text("familyNames", t("fill.familyNames"), {
                  autoComplete: "family-name",
                  max: 100,
                })}
              </>
            ) : null}
            {has("birth_date") ? dateGroup("birth", t("fill.birth"), "birthDate") : null}
            {has("sex") ? (
              <div className={styles.fieldBlock} id={`${id}-sex`} tabIndex={-1}>
                <RadioGroup
                  legend={t("fill.sexLegend")}
                  name={`${id}-sex-radio`}
                  options={SEXES.map((code) => ({ value: code, label: t(`sexOption.${code}`) }))}
                  value={values.sex as "F"}
                  onChange={(value) => {
                    set("sex", value);
                  }}
                />
                <p className={styles.small}>{t("fill.sexHelp")}</p>
                {errorText("sex") ? (
                  <p className={styles.error}>
                    <Icon name="warning" size={16} />
                    <span>{errorText("sex")}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {has("nationality") ? select("nationality", t("fill.nationality")) : null}
            {has("document") ? (
              <div className={styles.fieldBlock} id={`${id}-documentType`} tabIndex={-1}>
                <RadioGroup
                  legend={t("fill.docLegend")}
                  name={`${id}-doc-radio`}
                  options={DOCUMENT_TYPES.map((type) => ({
                    value: type,
                    label: t(`documentType.${type}`),
                  }))}
                  value={values.documentType as "passport"}
                  onChange={(value) => {
                    set("documentType", value);
                  }}
                />
                {errorText("documentType") ? (
                  <p className={styles.error}>
                    <Icon name="warning" size={16} />
                    <span>{errorText("documentType")}</span>
                  </p>
                ) : null}
                {text("documentNumber", t("fill.docNumber"), {
                  autoComplete: "off",
                  upper: true,
                  max: 30,
                  hint: data.demo ? t("demo.docHelp") : undefined,
                })}
              </div>
            ) : null}
            {has("document_expiry")
              ? dateGroup("expiry", t("fill.expiry"), "documentExpiry")
              : null}
            {expiryHint ? <WarnBox icon="clock">{expiryHint}</WarnBox> : null}
            {has("issuing_country") ? select("issuingCountry", t("fill.country")) : null}
            <div className={styles.footer}>
              <Button type="submit" size="lg" block>
                {t("fill.next")}
              </Button>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  if (dirty) setSheet("decline");
                  else decline();
                }}
              >
                {t("decline", { name: data.byName })}
              </button>
              <button
                type="button"
                className={cx(styles.textButton, styles.quiet)}
                onClick={() => {
                  if (dirty) setSheet("discard");
                  else router.push(data.areaHref);
                }}
              >
                {tCommon("cancel")}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          {data.demo ? <DemoNote tag={t("demo.tag")}>{t("demo.release")}</DemoNote> : null}
          {failed ? (
            <div className={styles.warn} role="alert">
              <Icon name="warning" size={18} />
              <p>{t("consent.failed")}</p>
            </div>
          ) : null}
          <section className={styles.card} aria-labelledby={`${id}-summary-title`}>
            <h3 id={`${id}-summary-title`} className={styles.h4}>
              {t("consent.summary")}
            </h3>
            <dl className={styles.values}>
              {checked
                ? copyFieldsOf(fields).map((field) => {
                    const shown = displayValue(field, checked, { intl: data.intl, locale, labels });
                    return shown ? (
                      <div key={field}>
                        <dt>{t(`values.${field}`)}</dt>
                        <dd>{shown}</dd>
                      </div>
                    ) : null;
                  })
                : null}
            </dl>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setStep(1);
              }}
            >
              <Icon name="edit" size={16} />
              <span>{t("consent.change")}</span>
            </button>
          </section>
          <label className={styles.consent} data-error={consentError} data-travel-consent="">
            <input
              ref={consentRef}
              type="checkbox"
              checked={consent}
              aria-describedby={consentError ? `${id}-consent-error` : undefined}
              aria-invalid={consentError || undefined}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (event.target.checked) setConsentError(false);
              }}
            />
            <span>
              {t.rich("consent.textRich", {
                purpose: data.purpose,
                name: data.byName,
                date: data.deleteOn,
                b: (chunks) => <strong>{chunks}</strong>,
              })}{" "}
              <a href={data.privacyHref} target="_blank" rel="noopener noreferrer">
                {t("consent.privacy")}
              </a>
            </span>
          </label>
          {consentError ? (
            <p className={styles.error} id={`${id}-consent-error`} role="alert">
              <Icon name="warning" size={16} />
              <span>{t("consent.missing", { name: data.byName })}</span>
            </p>
          ) : null}
          <div className={styles.footer}>
            <Button size="lg" block icon="shield" loading={pending} onClick={release}>
              {data.change
                ? t("consent.releaseChange")
                : t("consent.release", { name: data.byName })}
            </Button>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setSheet("decline");
              }}
            >
              {t("decline", { name: data.byName })}
            </button>
          </div>
        </>
      )}
      <span className="visually-hidden" aria-live="polite">
        {announce}
      </span>

      <BottomSheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
        }}
        title={
          lastSheet === "decline"
            ? t("fill.declineTitle", { name: data.byName })
            : t("fill.discardTitle")
        }
        closeLabel={tCommon("close")}
        focusKey={lastSheet}
      >
        <div className={styles.stack}>
          {lastSheet === "discard" ? <p className={styles.text}>{t("fill.discardText")}</p> : null}
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              data-autofocus=""
              onClick={() => {
                setSheet(null);
              }}
            >
              {lastSheet === "decline" ? t("fill.declineBack") : t("fill.keep")}
            </Button>
            {lastSheet === "decline" ? (
              <Button size="md" loading={pending} onClick={decline}>
                {t("fill.declineConfirm")}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  done.current = true;
                  router.push(data.areaHref);
                }}
              >
                {t("fill.discard")}
              </Button>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
