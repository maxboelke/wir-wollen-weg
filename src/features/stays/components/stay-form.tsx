"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { cx } from "@/lib/cx";
import { enter } from "@/lib/motion";
import {
  checkStayUrl,
  completeUrl,
  formatMoney,
  NOTE_COUNTER_FROM,
  parsePrice,
  perPersonCents,
  STAY_LIMITS,
  TITLE_COUNTER_FROM,
  validateStayForm,
  type StayFieldError,
} from "@/lib/stays";
import { textLength } from "@/lib/trip-info";
import { createStayAction, deleteStayAction, updateStayAction } from "../actions";
import { StayImage } from "./stay-image";
import styles from "./stay-form.module.css";

type Preview =
  | { kind: "idle" }
  | { kind: "loading"; host: string }
  | {
      kind: "ok";
      host: string;
      title: string | null;
      site: string | null;
      image: string | null;
      token: string;
    }
  | { kind: "none"; host: string }
  | { kind: "duplicate"; host: string; name: string | null; own: boolean };

export interface StayFormProps {
  publicId: string;
  locale: "de" | "en";
  intl: string;
  currency: string;
  /** Currency sign as suffix of the price field («€»). */
  currencySign: string;
  travellers: number;
  /** Placeholders counted in «pro Person» («inkl. Mia»). */
  placeholderNames: string;
  staysHref: string;
  /** Edit mode (W17 F.4). */
  edit?: {
    id: string;
    url: string;
    host: string;
    site: string;
    hasPreview: boolean;
    image: string | null;
    title: string;
    price: string;
    note: string;
    canDelete: boolean;
  };
}

const LINK_ERROR = {
  missing: "error.linkMissing",
  invalid: "error.linkInvalid",
  unusable: "error.linkUnusable",
} as const;

/**
 * W17 F «Unterkunft vorschlagen» / «Vorschlag bearbeiten». The link preview starts on paste,
 * on change (600 ms after typing) or when leaving the field – never blocks the form; a new link
 * cancels the running preview. «Keine Vorschau» is a normal state (placeholder card, no focus
 * jump, never red). The title is pre-filled only while empty or still as pre-filled.
 */
export function StayForm(props: StayFormProps) {
  const { publicId, locale, intl, currency, currencySign, travellers, placeholderNames, edit } =
    props;
  const t = useTranslations("stayForm");
  const tStays = useTranslations("stays");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const toast = useToast();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState(edit?.title ?? "");
  const [price, setPrice] = useState(edit?.price ?? "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<Preview>({ kind: "idle" });
  const [spinner, setSpinner] = useState(false);
  const [serverError, setServerError] = useState<"generic" | "limited" | null>(null);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const prefilled = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastChecked = useRef<string>("");
  const saved = useRef(false);

  const dirty = edit
    ? title !== edit.title || price !== edit.price || note !== edit.note
    : [url, title, price, note].some((value) => value.trim() !== "");

  // «Vorschlag verwerfen?» (F.5): links on the page ask first; reload/close: the browser asks.
  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      if (saved.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (formRef.current?.contains(anchor)) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTo(target.pathname + target.search + target.hash);
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (!saved.current) event.preventDefault();
    };
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);

  useEffect(
    () => () => {
      controller.current?.abort();
      window.clearTimeout(timer.current);
    },
    [],
  );

  const showPreview = (next: Preview) => {
    setPreview(next);
    // W17-01: the preview card fades in (reduced: fade only), no focus jump.
    requestAnimationFrame(() => {
      enter(previewRef.current, { y: 8 });
    });
  };

  const startPreview = (raw: string) => {
    const check = checkStayUrl(completeUrl(raw));
    if (!check.ok) {
      controller.current?.abort();
      lastChecked.current = "";
      setPreview({ kind: "idle" });
      return;
    }
    if (lastChecked.current === check.url) return;
    lastChecked.current = check.url;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setPreview({ kind: "loading", host: check.host });
    setSpinner(false);
    const spinnerTimer = window.setTimeout(() => {
      setSpinner(true);
    }, 300);
    void fetch("/api/stays/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ trip: publicId, url: check.url }),
      signal: abort.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as
          | {
              ok: true;
              title: string | null;
              site: string | null;
              image: string | null;
              token: string;
            }
          | { ok: false; duplicate?: { name: string | null; own: boolean } };
        if (abort.signal.aborted) return;
        if (body.ok) {
          showPreview({ kind: "ok", host: check.host, ...body });
          if (body.title) {
            setTitle((current) => {
              if (current.trim() === "" || current === prefilled.current) {
                prefilled.current = body.title;
                return body.title ?? current;
              }
              return current;
            });
          }
        } else if (body.duplicate) {
          setPreview({ kind: "duplicate", host: check.host, ...body.duplicate });
        } else {
          showPreview({ kind: "none", host: check.host });
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) showPreview({ kind: "none", host: check.host });
      })
      .finally(() => {
        window.clearTimeout(spinnerTimer);
      });
  };

  // Validation (F.2) – shown after leaving a field or submitting.
  const link = checkStayUrl(completeUrl(url));
  const form = validateStayForm({ title, price, note }, locale);
  const errors = form.ok ? {} : form.errors;
  const shown = (field: string) => submitted || touched[field];
  const linkError = !edit && shown("link") && !link.ok ? t(LINK_ERROR[link.error]) : null;
  const fieldError = (field: "title" | "price" | "note"): string | null => {
    const problem: StayFieldError | undefined = errors[field];
    if (!problem || !shown(field)) return null;
    if (problem === "titleMissing") return t("error.titleMissing");
    if (problem === "tooLong") {
      return t("error.tooLong", { max: field === "title" ? STAY_LIMITS.title : STAY_LIMITS.note });
    }
    return problem === "priceMax" ? t("error.priceMax") : t("error.price");
  };
  const duplicate = preview.kind === "duplicate" ? preview : null;

  const priceCheck = parsePrice(price, locale);
  const perPerson =
    priceCheck.ok && priceCheck.cents !== null
      ? formatMoney(perPersonCents(priceCheck.cents, travellers), currency, intl)
      : null;

  const fieldId = (name: string) => `${ids}-${name}`;

  function submit() {
    setSubmitted(true);
    setServerError(null);
    const order: [string, boolean][] = [
      ["link", !edit && !link.ok],
      ["title", Boolean(errors.title)],
      ["price", Boolean(errors.price)],
      ["note", Boolean(errors.note)],
    ];
    const first = order.find(([, bad]) => bad);
    if (first) {
      document.getElementById(fieldId(first[0]))?.focus();
      return;
    }
    if (duplicate) {
      document.getElementById(fieldId("link"))?.focus();
      return;
    }
    startTransition(async () => {
      if (edit) {
        const answer = await updateStayAction(publicId, edit.id, {
          title,
          price,
          note,
          locale,
        }).catch(() => null);
        if (answer?.ok) {
          saved.current = true;
          toast({ message: t("saved") });
          router.push(`${props.staysHref}?focus=${encodeURIComponent(edit.id)}`);
          router.refresh();
          return;
        }
        setServerError(answer && answer.error === "limited" ? "limited" : "generic");
        return;
      }
      const answer = await createStayAction(publicId, {
        url: link.ok ? link.url : url,
        title,
        price,
        note,
        token: preview.kind === "ok" ? preview.token : null,
        locale,
      }).catch(() => null);
      if (answer?.ok) {
        saved.current = true;
        toast({ message: t("added") });
        router.push(`${props.staysHref}?focus=stays-prompt`);
        router.refresh();
        return;
      }
      if (answer && answer.error === "duplicate") {
        setPreview({ kind: "duplicate", host: link.ok ? link.host : "", ...answer.duplicate });
        return;
      }
      if (answer && (answer.error === "chosen" || answer.error === "limit")) {
        saved.current = true;
        router.push(`${props.staysHref}?notice=${answer.error === "chosen" ? "fixed" : "limit"}`);
        router.refresh();
        return;
      }
      setServerError(answer && answer.error === "limited" ? "limited" : "generic");
    });
  }

  const titleLength = textLength(title);
  const noteLength = textLength(note);
  const describedBy = (...items: (string | false | null | undefined)[]) =>
    items.filter(Boolean).join(" ") || undefined;
  const previewHost = edit ? edit.host : "host" in preview ? preview.host : "";

  const previewCard = (() => {
    if (edit) {
      return (
        <div className={styles.preview}>
          <span className={styles.media}>
            <StayImage src={edit.image} className={styles.previewImage} lazy={false} />
            <span className={styles.chip}>
              {edit.hasPreview
                ? t("preview.chip", { site: edit.site })
                : t("preview.noneChip", { domain: edit.host })}
            </span>
          </span>
        </div>
      );
    }
    switch (preview.kind) {
      case "idle":
      case "duplicate":
        return null;
      case "loading":
        return (
          <div className={styles.preview}>
            <p className={styles.loading}>
              {spinner ? (
                <>
                  <Spinner />
                  {t("preview.loading", { domain: preview.host })}
                </>
              ) : null}
            </p>
          </div>
        );
      case "ok":
        return (
          <div className={styles.preview}>
            <span className={styles.media}>
              <StayImage src={preview.image} className={styles.previewImage} lazy={false} />
              <span className={styles.chip}>
                {t("preview.chip", { site: preview.site ?? preview.host })}
              </span>
            </span>
            {preview.title ? <p className={styles.previewTitle}>{preview.title}</p> : null}
            <p className={styles.previewText}>
              {preview.title ? t("preview.ok") : t("preview.noTitle")}
            </p>
          </div>
        );
      case "none":
        return (
          <div className={styles.preview}>
            <span className={styles.media}>
              <StayImage src={null} className={styles.previewImage} />
              <span className={styles.chip}>{t("preview.noneChip", { domain: preview.host })}</span>
            </span>
            <p className={styles.previewText}>{t("preview.none", { domain: preview.host })}</p>
          </div>
        );
    }
  })();

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
      <div className={styles.fields}>
        {serverError ? (
          <Banner tone="danger" role="alert">
            {serverError === "limited" ? t("errorLimited") : t("errorGeneric")}
          </Banner>
        ) : null}
        {edit ? null : <p className={styles.intro}>{t("intro")}</p>}

        <div className={styles.field}>
          {edit ? (
            <>
              <span className={styles.label}>{t("link")}</span>
              <p className={styles.lockedLink}>{edit.url}</p>
              <FieldHint id={fieldId("link-hint")}>{t("linkLocked")}</FieldHint>
            </>
          ) : (
            <>
              <FieldLabel htmlFor={fieldId("link")}>{t("link")}</FieldLabel>
              <input
                id={fieldId("link")}
                className={cx(styles.input, linkError && styles.invalid)}
                type="url"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="https://…"
                value={url}
                aria-invalid={linkError ? true : undefined}
                aria-describedby={describedBy(
                  linkError && fieldId("link-error"),
                  duplicate && fieldId("duplicate"),
                )}
                onChange={(event) => {
                  const value = event.target.value;
                  setUrl(value);
                  window.clearTimeout(timer.current);
                  timer.current = window.setTimeout(() => {
                    startPreview(value);
                  }, 600);
                }}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text");
                  if (pasted) {
                    window.clearTimeout(timer.current);
                    // The value updates after the paste event – start with the pasted text.
                    const target = event.currentTarget;
                    requestAnimationFrame(() => {
                      startPreview(target.value || pasted);
                    });
                  }
                }}
                onBlur={() => {
                  setTouched((value) => ({ ...value, link: true }));
                  const completed = completeUrl(url);
                  if (completed !== url && checkStayUrl(completed).ok) setUrl(completed);
                  window.clearTimeout(timer.current);
                  startPreview(completed);
                }}
              />
              {linkError ? <FieldError id={fieldId("link-error")}>{linkError}</FieldError> : null}
              {duplicate ? (
                <p id={fieldId("duplicate")} className={styles.duplicate} role="status">
                  <span>
                    {duplicate.own
                      ? t("duplicateOwn")
                      : duplicate.name
                        ? t("duplicate", { name: duplicate.name })
                        : t("duplicateFormer")}
                  </span>{" "}
                  <a href={props.staysHref}>{t("view")}</a>
                </p>
              ) : null}
            </>
          )}
        </div>

        <div ref={previewRef} className={styles.previewSlot} aria-live="polite">
          {previewCard}
        </div>

        <div className={styles.field}>
          <FieldLabel htmlFor={fieldId("title")}>{t("name")}</FieldLabel>
          <input
            id={fieldId("title")}
            className={cx(styles.input, fieldError("title") && styles.invalid)}
            value={title}
            autoComplete="off"
            aria-invalid={fieldError("title") ? true : undefined}
            aria-describedby={describedBy(
              titleLength >= TITLE_COUNTER_FROM && fieldId("title-count"),
              fieldError("title") && fieldId("title-error"),
            )}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            onBlur={() => {
              setTouched((value) => ({ ...value, title: true }));
            }}
          />
          {titleLength >= TITLE_COUNTER_FROM ? (
            <p id={fieldId("title-count")} className={styles.count}>
              {t("counter", { count: STAY_LIMITS.title - titleLength })}
            </p>
          ) : null}
          {fieldError("title") ? (
            <FieldError id={fieldId("title-error")}>{fieldError("title")}</FieldError>
          ) : null}
        </div>

        <div className={styles.field}>
          <FieldLabel htmlFor={fieldId("price")}>{t("price")}</FieldLabel>
          <span className={styles.suffixed}>
            <input
              id={fieldId("price")}
              className={cx(styles.input, fieldError("price") && styles.invalid)}
              inputMode="decimal"
              autoComplete="off"
              value={price}
              aria-invalid={fieldError("price") ? true : undefined}
              aria-describedby={describedBy(
                fieldId("price-help"),
                perPerson && fieldId("price-pp"),
                fieldError("price") && fieldId("price-error"),
              )}
              onChange={(event) => {
                setPrice(event.target.value);
              }}
              onBlur={() => {
                setTouched((value) => ({ ...value, price: true }));
              }}
            />
            <span className={styles.suffix} aria-hidden="true">
              {currencySign}
            </span>
          </span>
          <FieldHint id={fieldId("price-help")}>{t("priceHelp")}</FieldHint>
          {perPerson ? (
            <p id={fieldId("price-pp")} className={styles.perPerson}>
              {placeholderNames
                ? t("perPersonWith", {
                    amount: perPerson,
                    count: travellers,
                    names: placeholderNames,
                  })
                : t("perPerson", { amount: perPerson, count: travellers })}
            </p>
          ) : null}
          {fieldError("price") ? (
            <FieldError id={fieldId("price-error")}>{fieldError("price")}</FieldError>
          ) : null}
        </div>

        <div className={styles.field}>
          <FieldLabel htmlFor={fieldId("note")}>{t("note")}</FieldLabel>
          <textarea
            id={fieldId("note")}
            className={cx(styles.input, styles.textarea, fieldError("note") && styles.invalid)}
            rows={3}
            value={note}
            aria-invalid={fieldError("note") ? true : undefined}
            aria-describedby={describedBy(
              fieldId("note-help"),
              noteLength >= NOTE_COUNTER_FROM && fieldId("note-count"),
              fieldError("note") && fieldId("note-error"),
            )}
            onChange={(event) => {
              setNote(event.target.value);
            }}
            onBlur={() => {
              setTouched((value) => ({ ...value, note: true }));
            }}
          />
          <FieldHint id={fieldId("note-help")}>{t("noteHelp")}</FieldHint>
          {noteLength >= NOTE_COUNTER_FROM ? (
            <p id={fieldId("note-count")} className={styles.count}>
              {t("counter", { count: STAY_LIMITS.note - noteLength })}
            </p>
          ) : null}
          {fieldError("note") ? (
            <FieldError id={fieldId("note-error")}>{fieldError("note")}</FieldError>
          ) : null}
        </div>
        {edit?.canDelete ? (
          <button
            type="button"
            className={styles.textButton}
            aria-haspopup="dialog"
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            {t("delete")}
          </button>
        ) : null}
        <p className="visually-hidden">{previewHost}</p>
      </div>

      <div className={styles.submit}>
        <Button
          type="submit"
          size="lg"
          block
          loading={pending}
          loadingLabel={edit ? t("saving") : t("submitting")}
          aria-disabled={duplicate ? true : undefined}
          aria-describedby={duplicate ? fieldId("duplicate") : fieldId("submit-help")}
        >
          {edit ? t("save") : t("submit")}
        </Button>
        {edit ? null : (
          <p id={fieldId("submit-help")} className={styles.submitHelp}>
            {t("submitHelp")}
          </p>
        )}
      </div>

      <BottomSheet
        open={leaveTo !== null}
        onClose={() => {
          setLeaveTo(null);
        }}
        title={edit ? t("editDiscardTitle") : t("discard.title")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{t("discard.text")}</p>
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              size="md"
              data-autofocus=""
              onClick={() => {
                setLeaveTo(null);
              }}
            >
              {t("discard.keep")}
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
              {t("discard.confirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
      {edit ? (
        <BottomSheet
          open={confirmDelete}
          onClose={() => {
            setConfirmDelete(false);
          }}
          title={tStays("delete.title", { title: edit.title })}
          closeLabel={tCommon("close")}
        >
          <div className={styles.confirm}>
            <p>{tStays("delete.text")}</p>
            <div className={styles.confirmActions}>
              <Button
                variant="secondary"
                size="md"
                data-autofocus=""
                onClick={() => {
                  setConfirmDelete(false);
                }}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={pending}
                onClick={() => {
                  startTransition(async () => {
                    const answer = await deleteStayAction(publicId, edit.id).catch(() => null);
                    if (answer?.ok) {
                      saved.current = true;
                      toast({ message: tStays("delete.done") });
                      router.push(props.staysHref);
                      router.refresh();
                    } else {
                      setConfirmDelete(false);
                      setServerError("generic");
                    }
                  });
                }}
              >
                {tStays("delete.confirm")}
              </Button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </form>
  );
}
