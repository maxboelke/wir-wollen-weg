"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import {
  DEFAULT_REQUEST_FIELDS,
  DOCUMENT_DEPENDENT,
  TRAVEL_FIELDS,
  TRAVEL_LIMITS,
  type TravelField,
} from "@/lib/travel-data";
import { createRequestAction } from "../actions";
import { DemoNote, WarnBox } from "./bits";
import styles from "./travel-data.module.css";

export interface RequestFormData {
  publicId: string;
  areaHref: string;
  demo: boolean;
  /** «Sa., 26. Juni» */
  deleteOn: string;
  people: { key: string; name: string; placeholder: boolean }[];
}

/**
 * «Reisedaten anfragen» (W20 H.4, R.9 I11-04): purpose, field switches (name always, date of
 * birth on, the rest off; expiry/country only with the document), recipients (default: all
 * members but me + open placeholders). Asking for the document needs a confirmation. One
 * idempotency key per opening of the form.
 */
export function RequestForm({ data }: { data: RequestFormData }) {
  const t = useTranslations("travelData");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const id = useId();
  const purposeRef = useRef<HTMLInputElement>(null);
  const [key] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  );
  const [purpose, setPurpose] = useState("");
  const [purposeError, setPurposeError] = useState(false);
  const [fields, setFields] = useState<Set<TravelField>>(new Set(DEFAULT_REQUEST_FIELDS));
  const [picked, setPicked] = useState<Set<string>>(new Set(data.people.map((p) => p.key)));
  const [whoError, setWhoError] = useState(false);
  const [sheet, setSheet] = useState<"doc" | "discard" | null>(null);
  const [lastSheet, setLastSheet] = useState<"doc" | "discard">("doc");
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const [pending, startTransition] = useTransition();
  const dirty =
    purpose.trim() !== "" ||
    fields.size !== DEFAULT_REQUEST_FIELDS.length ||
    picked.size !== data.people.length;
  const submitted = useRef(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (submitted.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);

  const length = Array.from(purpose).length;
  const doc = fields.has("document");

  function toggle(field: TravelField, on: boolean) {
    setFields((prev) => {
      const next = new Set(prev);
      if (on) next.add(field);
      else {
        next.delete(field);
        if (field === "document") for (const dep of DOCUMENT_DEPENDENT) next.delete(dep);
      }
      return next;
    });
  }

  function send() {
    const chosen = data.people.filter((p) => picked.has(p.key));
    startTransition(async () => {
      const result = await createRequestAction(data.publicId, {
        purpose,
        fields: TRAVEL_FIELDS.filter((f) => fields.has(f)),
        recipients: {
          users: chosen.filter((p) => !p.placeholder).map((p) => p.key),
          placeholders: chosen.filter((p) => p.placeholder).map((p) => p.key),
        },
        idempotencyKey: key,
      });
      if (result.ok) {
        submitted.current = true;
        router.push(`${data.areaHref}?done=sent&n=${String(result.count)}&r=${result.requestId}`);
        return;
      }
      setSheet(null);
      if (result.error === "purpose") {
        setPurposeError(true);
        purposeRef.current?.focus();
      } else if (result.error === "limit") toast({ message: t("request.limit") });
      else if (result.error === "limited") toast({ message: t("limited") });
      else toast({ message: t("generic") });
    });
  }

  function submit() {
    const purposeOk = purpose.trim().length > 0 && length <= TRAVEL_LIMITS.purposeMax;
    const whoOk = picked.size > 0;
    setPurposeError(!purposeOk);
    setWhoError(!whoOk);
    if (!purposeOk) {
      purposeRef.current?.focus();
      return;
    }
    if (!whoOk) {
      document.getElementById(`${id}-who`)?.focus();
      return;
    }
    if (doc) setSheet("doc");
    else send();
  }

  const fieldLabel = (field: TravelField) =>
    field === "document" ? t("request.fieldWithDoc") : t(`fields.${field}`);

  return (
    <div className={styles.page}>
      <h2 className={styles.h2} id={`${id}-title`} tabIndex={-1}>
        {t("request.title")}
      </h2>
      {data.demo ? <DemoNote tag={t("demo.tag")}>{t("demo.request")}</DemoNote> : null}
      <form
        className={styles.form}
        noValidate
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <TextField
          ref={purposeRef}
          id={`${id}-purpose`}
          label={t("request.purpose")}
          hint={
            length >= 50
              ? `${t("request.help")} ${t("request.purposeCounter", { count: Math.max(0, TRAVEL_LIMITS.purposeMax - length) })}`
              : t("request.help")
          }
          error={purposeError ? t("request.purposeError") : undefined}
          value={purpose}
          maxLength={TRAVEL_LIMITS.purposeMax}
          autoComplete="off"
          onChange={(event) => {
            setPurpose(event.target.value);
            if (purposeError && event.target.value.trim()) setPurposeError(false);
          }}
        />

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("request.fieldsLegend")}</legend>
          <div className={styles.lockedRow}>
            <span>{t("fields.legal_name")}</span>
            <span>
              <Icon name="lock" size={16} />
              {t("request.always")}
            </span>
          </div>
          {TRAVEL_FIELDS.filter((f) => f !== "legal_name").map((field) => {
            if (DOCUMENT_DEPENDENT.includes(field) && !doc) {
              // Off and not operable without the document (W20 H.4) – reason as text.
              return (
                <div key={field} className={styles.lockedRow} data-locked-field={field}>
                  <span className={styles.quiet}>{fieldLabel(field)}</span>
                  <span>
                    <Icon name="lock" size={16} />
                    {t("request.onlyWithDoc")}
                  </span>
                </div>
              );
            }
            return (
              <div key={field} className={styles.switchRow}>
                <Switch
                  label={fieldLabel(field)}
                  checked={fields.has(field)}
                  onChange={(on) => {
                    toggle(field, on);
                  }}
                />
                {field === "document" && doc ? (
                  <WarnBox id={`${id}-docwarn`}>
                    <strong>{t("request.docWarning")}</strong>
                  </WarnBox>
                ) : null}
              </div>
            );
          })}
        </fieldset>

        <fieldset
          className={styles.fieldset}
          id={`${id}-who`}
          tabIndex={-1}
          aria-describedby={whoError ? `${id}-who-error` : `${id}-who-hint`}
        >
          <legend className={styles.legend}>{t("request.whoLegend")}</legend>
          {data.people.length === 0 ? (
            <p className={styles.muted}>{t("request.noOne")}</p>
          ) : (
            <ul className={styles.peopleChips}>
              {data.people.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    className={styles.personChip}
                    aria-pressed={picked.has(p.key)}
                    onClick={() => {
                      setWhoError(false);
                      setPicked((prev) => {
                        const next = new Set(prev);
                        if (next.has(p.key)) next.delete(p.key);
                        else next.add(p.key);
                        return next;
                      });
                    }}
                  >
                    <Avatar id={p.key} name={p.name} size="sm" />
                    <span>{p.name}</span>
                    {p.placeholder ? (
                      <span className={styles.chipSub}>{`· ${t("request.afterJoin")}`}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {whoError ? (
            <p className={styles.error} id={`${id}-who-error`} role="alert">
              <Icon name="warning" size={16} />
              <span>{t("request.whoError")}</span>
            </p>
          ) : null}
          <p className={styles.small} id={`${id}-who-hint`}>
            {t("request.whoHint")}
          </p>
        </fieldset>

        <p className={styles.lineIcon}>
          <Icon name="lock" size={14} />
          <span>{t("request.never", { date: data.deleteOn })}</span>
        </p>

        <div className={styles.footer}>
          <Button type="submit" size="lg" block loading={pending && sheet === null}>
            {t("request.submit")}
          </Button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              if (dirty) setSheet("discard");
              else router.push(data.areaHref);
            }}
          >
            {tCommon("cancel")}
          </button>
        </div>
      </form>

      <BottomSheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
        }}
        title={lastSheet === "doc" ? t("request.docConfirmTitle") : t("request.discardTitle")}
        closeLabel={tCommon("close")}
        focusKey={lastSheet}
      >
        {lastSheet === "doc" ? (
          <div className={styles.stack}>
            <div className={styles.cardHead}>
              <span className={styles.logIcon} aria-hidden="true">
                <Icon name="key" size={18} />
              </span>
              <p className={styles.text}>
                {t("request.docConfirmBody", { count: picked.size, purpose: purpose.trim() })}
              </p>
            </div>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSheet(null);
                }}
              >
                {t("request.docConfirmBack")}
              </Button>
              <Button size="md" loading={pending} onClick={send}>
                {t("request.docConfirmYes")}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.stack}>
            <p className={styles.text}>{t("request.discardText")}</p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                data-autofocus=""
                onClick={() => {
                  setSheet(null);
                }}
              >
                {t("request.keep")}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  submitted.current = true;
                  router.push(data.areaHref);
                }}
              >
                {t("request.discard")}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
