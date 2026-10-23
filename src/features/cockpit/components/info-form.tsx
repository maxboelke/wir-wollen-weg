"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import {
  INFO_FIELDS,
  INFO_LIMITS,
  NOTES_COUNTER_FROM,
  textLength,
  validateInfo,
  type InfoErrors,
  type InfoField,
} from "@/lib/trip-info";
import { saveTripInfoAction } from "../actions";
import styles from "./info.module.css";

type Draft = Record<InfoField, string>;

const MULTILINE: ReadonlySet<InfoField> = new Set(["address", "meetingPoint", "notes"]);
const LIMIT: Partial<Record<InfoField, number>> = INFO_LIMITS;

interface InfoFormProps {
  publicId: string;
  infoHref: string;
  initial: Draft;
  version: number;
  /** Title of the picked place to stay (W22 D) – null when nothing is picked. */
  stayTitle?: string | null;
  /** Opened via «Name in die Infos übernehmen» – pre-fill the name right away. */
  fromStay?: boolean;
}

/**
 * W22 B/C «Infos bearbeiten» (F-033, I8-10): all fields optional, validation when leaving a
 * field and on save (same rules as the server), explicit «Speichern», «Änderungen verwerfen?»
 * when leaving with unsaved changes, conflict notice «{Name} hat die Infos inzwischen
 * geändert» (saving again overwrites – the last save wins).
 */
export function InfoForm({
  publicId,
  infoHref,
  initial,
  version: initialVersion,
  stayTitle = null,
  fromStay = false,
}: InfoFormProps) {
  const t = useTranslations("tripInfo.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<Draft>(() =>
    fromStay && stayTitle ? { ...initial, stayName: stayTitle } : initial,
  );
  // W22 D: the name before the takeover («Vorher: „…“ · Zurück») – only when it differed.
  const [previousName, setPreviousName] = useState<string | null>(() =>
    fromStay && stayTitle && initial.stayName && initial.stayName !== stayTitle
      ? initial.stayName
      : null,
  );
  const [takeoverNote, setTakeoverNote] = useState("");
  const tInfo = useTranslations("tripInfo");
  // Opened via «Name in die Infos übernehmen»: focus on the address (W22 D).
  useEffect(() => {
    if (fromStay && stayTitle) document.getElementById(`${ids}-address`)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);
  const [touched, setTouched] = useState<Partial<Record<InfoField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [version, setVersion] = useState(initialVersion);
  const [conflict, setConflict] = useState<{ name: string | null } | null>(null);
  const [error, setError] = useState<"generic" | "limited" | null>(null);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const [confirmReload, setConfirmReload] = useState(false);
  const [pending, startTransition] = useTransition();
  const saved = useRef(false);

  const dirty = INFO_FIELDS.some((field) => draft[field] !== initial[field]);
  const result = validateInfo(draft);
  const errors: InfoErrors = result.ok ? {} : result.errors;
  const shown = (field: InfoField) => (submitted || touched[field] ? errors[field] : undefined);
  const fieldId = (field: InfoField) => `${ids}-${field}`;

  // «Änderungen verwerfen?» (ux-spec §3): links on the page ask first; reload/close: browser.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      if (saved.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (formRef.current?.contains(anchor)) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTo(url.pathname + url.search + url.hash);
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return;
      event.preventDefault();
    };
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);

  function message(field: InfoField): string | undefined {
    const problem = shown(field);
    if (!problem) return undefined;
    if (problem === "time") return t("errorTime");
    if (problem === "phone") return t("errorPhone");
    return t("errorTooLong", { max: LIMIT[field] ?? 0 });
  }

  function submit() {
    setSubmitted(true);
    setError(null);
    if (!result.ok) {
      const first = INFO_FIELDS.find((field) => errors[field]);
      if (first) document.getElementById(fieldId(first))?.focus();
      return;
    }
    startTransition(async () => {
      const answer = await saveTripInfoAction(publicId, draft, version).catch(() => null);
      if (!answer) {
        setError("generic");
        return;
      }
      if (answer.ok) {
        saved.current = true;
        toast({ message: t("saved") });
        router.push(infoHref);
        router.refresh();
        return;
      }
      if (answer.error === "conflict") {
        // Saving again overwrites («letzte Speicherung gewinnt», W22 C).
        setVersion(answer.version);
        setConflict({ name: answer.editorName });
        return;
      }
      setError(answer.error === "limited" ? "limited" : "generic");
    });
  }

  const field = (
    name: InfoField,
    label: string,
    options: { hint?: string; type?: string } = {},
  ) => {
    const id = fieldId(name);
    const problem = message(name);
    const hintId = options.hint ? `${id}-hint` : undefined;
    const countId = name === "notes" ? `${id}-count` : undefined;
    const length = textLength(draft[name]);
    const showCount = name === "notes" && length >= NOTES_COUNTER_FROM;
    const describedBy =
      [hintId, showCount ? countId : undefined, problem ? `${id}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    const common = {
      id,
      name,
      value: draft[name],
      "aria-invalid": problem ? true : undefined,
      "aria-describedby": describedBy,
      onChange: (event: { target: { value: string } }) => {
        setDraft((value) => ({ ...value, [name]: event.target.value }));
      },
      onBlur: () => {
        setTouched((value) => ({ ...value, [name]: true }));
      },
    } as const;
    return (
      <div className={styles.field}>
        <FieldLabel htmlFor={id}>
          {label} <span className={styles.optional}>{t("optional")}</span>
        </FieldLabel>
        {MULTILINE.has(name) ? (
          <textarea
            {...common}
            className={cx(styles.input, styles.textarea, problem && styles.invalid)}
            rows={name === "notes" ? 5 : 3}
          />
        ) : (
          <input
            {...common}
            className={cx(styles.input, problem && styles.invalid)}
            type={options.type ?? "text"}
            {...(name === "emergencyPhone"
              ? { autoComplete: "off", inputMode: "tel" as const }
              : {})}
          />
        )}
        {options.hint && hintId ? <FieldHint id={hintId}>{options.hint}</FieldHint> : null}
        {showCount && countId ? (
          <p id={countId} className={styles.count} aria-live="polite">
            {t("counter", { count: INFO_LIMITS.notes - length })}
          </p>
        ) : null}
        {problem ? <FieldError id={`${id}-error`}>{problem}</FieldError> : null}
      </div>
    );
  };

  const errorFields = submitted ? INFO_FIELDS.filter((name) => errors[name]) : [];
  const labels: Record<InfoField, string> = {
    stayName: t("stayName"),
    address: t("address"),
    checkIn: t("checkIn"),
    checkOut: t("checkOut"),
    meetingPoint: t("meetingPoint"),
    emergencyName: t("emergencyName"),
    emergencyPhone: t("emergencyPhone"),
    notes: t("notes"),
  };

  return (
    <form
      ref={formRef}
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {conflict ? (
        <Banner
          tone="warning"
          role="alert"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setConfirmReload(true);
              }}
            >
              {t("reload")}
            </Button>
          }
        >
          <p className={styles.bannerTitle}>
            {conflict.name ? t("conflict", { name: conflict.name }) : t("conflictUnknown")}
          </p>
          <p>{t("conflictHint")}</p>
        </Banner>
      ) : null}
      {error ? (
        <Banner tone="danger" role="alert">
          {error === "limited" ? t("errorLimited") : t("errorGeneric")}
        </Banner>
      ) : null}
      {errorFields.length > 1 ? (
        <Banner tone="danger" role="alert">
          <p className={styles.bannerTitle}>{t("errorSummary")}</p>
          <ul className={styles.summary}>
            {errorFields.map((name) => (
              <li key={name}>
                <a href={`#${fieldId(name)}`}>{labels[name]}</a>
              </li>
            ))}
          </ul>
        </Banner>
      ) : null}
      {stayTitle && draft.stayName !== stayTitle ? (
        <Button
          variant="secondary"
          size="sm"
          className={styles.takeover}
          onClick={() => {
            setPreviousName(draft.stayName.trim() ? draft.stayName : null);
            setDraft((value) => ({ ...value, stayName: stayTitle }));
            setTakeoverNote(tInfo("fromStayDone"));
            document.getElementById(`${ids}-address`)?.focus();
          }}
        >
          {tInfo("fromStay", { title: stayTitle })}
        </Button>
      ) : null}
      {field("stayName", labels.stayName)}
      {previousName && draft.stayName === stayTitle ? (
        <p className={styles.hint}>
          {tInfo("fromStayPrevious", { name: previousName })}{" "}
          <button
            type="button"
            className={styles.inlineButton}
            onClick={() => {
              setDraft((value) => ({ ...value, stayName: previousName }));
              setPreviousName(null);
            }}
          >
            {tInfo("fromStayRestore")}
          </button>
        </p>
      ) : null}
      <p className="visually-hidden" aria-live="polite">
        {takeoverNote}
      </p>
      {field("address", labels.address, {
        hint: stayTitle ? `${tInfo("addressHintStay")} ${t("addressHint")}` : t("addressHint"),
      })}
      <div className={styles.times}>
        {field("checkIn", labels.checkIn, { type: "time" })}
        {field("checkOut", labels.checkOut, { type: "time" })}
      </div>
      <p className={styles.hint}>{t("timeHint")}</p>
      {field("meetingPoint", labels.meetingPoint, { hint: t("meetingHint") })}
      {field("emergencyName", labels.emergencyName)}
      {field("emergencyPhone", labels.emergencyPhone, {
        type: "tel",
        hint: t("emergencyHint"),
      })}
      {field("notes", labels.notes, { hint: t("notesHint") })}
      <div className={styles.submit}>
        <Button type="submit" size="lg" block loading={pending} loadingLabel={t("saving")}>
          {t("save")}
        </Button>
      </div>

      <BottomSheet
        open={leaveTo !== null}
        onClose={() => {
          setLeaveTo(null);
        }}
        title={t("discardTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{t("discardText")}</p>
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              size="md"
              data-autofocus=""
              onClick={() => {
                setLeaveTo(null);
              }}
            >
              {t("keep")}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                const target = leaveTo;
                saved.current = true;
                setLeaveTo(null);
                if (target) router.push(target);
              }}
            >
              {t("discard")}
            </Button>
          </div>
        </div>
      </BottomSheet>
      <BottomSheet
        open={confirmReload}
        onClose={() => {
          setConfirmReload(false);
        }}
        title={t("reloadTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{t("reloadText")}</p>
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              size="md"
              data-autofocus=""
              onClick={() => {
                setConfirmReload(false);
              }}
            >
              {t("keep")}
            </Button>
            <Button
              size="md"
              onClick={() => {
                saved.current = true;
                window.location.reload();
              }}
            >
              {t("reload")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </form>
  );
}
