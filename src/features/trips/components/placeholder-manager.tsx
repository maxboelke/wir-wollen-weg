"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition, type SubmitEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import type { Locale } from "@/i18n/config";
import { DISPLAY_NAME_MAX } from "@/lib/display-name";
import {
  addPlaceholderAction,
  removePlaceholderAction,
  renamePlaceholderAction,
  type PlaceholderActionResult,
} from "../actions";
import { SharePanel } from "./share-panel";
import styles from "./placeholder-manager.module.css";

export interface ManagedPlaceholder {
  id: string;
  displayName: string;
  link: string;
  texts: Record<Locale, string>;
}

interface PlaceholderManagerProps {
  publicId: string;
  tripName: string;
  placeholders: ManagedPlaceholder[];
  defaultLocale: Locale;
  full: boolean;
}

type Sheet =
  | { kind: "link"; placeholder: ManagedPlaceholder }
  | { kind: "menu"; placeholder: ManagedPlaceholder }
  | { kind: "remove"; placeholder: ManagedPlaceholder }
  | null;

/**
 * «Wer soll dabei sein?» (F-007, W06, organiser only): add expected people by name; each
 * gets a personal invite link (share sheet), can be renamed or removed (Flow J). Names are
 * unique together with the members – a taken name offers a suggestion (F-003).
 */
export function PlaceholderManager({
  publicId,
  tripName,
  placeholders,
  defaultLocale,
  full,
}: PlaceholderManagerProps) {
  const t = useTranslations("placeholders");
  const tInvite = useTranslations("invite");
  const tCommon = useTranslations("common");
  const ids = useId();
  const router = useRouter();
  const toast = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [rename, setRename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [lastSheet, setLastSheet] = useState<Exclude<Sheet, null> | null>(null);
  const [pending, startTransition] = useTransition();
  if (sheet && sheet !== lastSheet) setLastSheet(sheet);
  const shown = sheet ?? lastSheet;

  function handle(
    result: PlaceholderActionResult,
    done: () => void,
    focus: HTMLInputElement | null,
  ) {
    if (result.ok) {
      setError(null);
      setSuggestion(null);
      done();
      router.refresh();
      return;
    }
    if (result.suggestion) {
      setSuggestion(result.suggestion);
      setError(tInvite("nameTakenHint", { suggestion: result.suggestion }));
    } else {
      setSuggestion(null);
      setError(
        result.error === "nameRequired"
          ? t("nameRequired")
          : result.error === "full"
            ? t("full")
            : tCommon("genericError"),
      );
    }
    focus?.focus();
  }

  function add(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setError(t("nameRequired"));
      nameRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await addPlaceholderAction(publicId, value);
      handle(
        result,
        () => {
          setName("");
          toast({ message: t("added", { name: value }) });
        },
        nameRef.current,
      );
    });
  }

  const sheetTitle = !shown
    ? ""
    : shown.kind === "link"
      ? t("linkFor", { name: shown.placeholder.displayName })
      : shown.kind === "menu"
        ? t("renameTitle", { name: shown.placeholder.displayName })
        : t("removeTitle", { name: shown.placeholder.displayName });

  return (
    <Card as="section" aria-labelledby={`${ids}-title`} className={styles.card} id="placeholders">
      <h2 id={`${ids}-title`} className={styles.title}>
        {t("title")}
      </h2>
      <p className={styles.intro}>{t("intro")}</p>

      {full ? (
        <Banner tone="info" role="status">
          {t("full")}
        </Banner>
      ) : (
        <form className={styles.form} onSubmit={add} noValidate>
          <TextField
            ref={nameRef}
            id={`${ids}-name`}
            label={t("nameLabel")}
            autoComplete="off"
            maxLength={DISPLAY_NAME_MAX}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
            error={sheet ? undefined : (error ?? undefined)}
          />
          {suggestion && !sheet ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setName(suggestion);
                setSuggestion(null);
                setError(null);
                nameRef.current?.focus();
              }}
            >
              {tInvite("useSuggestion")}
            </Button>
          ) : null}
          <Button type="submit" variant="secondary" size="md" icon="plus" loading={pending}>
            {t("add")}
          </Button>
        </form>
      )}

      {placeholders.length > 0 ? (
        <ul className={styles.list}>
          {placeholders.map((placeholder) => (
            <li key={placeholder.id} className={styles.row}>
              <Avatar id={placeholder.id} name={placeholder.displayName} open />
              <span className={styles.who}>
                <span className={styles.name}>{placeholder.displayName}</span>
                <span className={styles.status}>{t("missing")}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon="link"
                aria-label={t("linkFor", { name: placeholder.displayName })}
                aria-haspopup="dialog"
                onClick={() => {
                  setSheet({ kind: "link", placeholder });
                }}
              >
                {t("link")}
              </Button>
              <button
                type="button"
                className={styles.more}
                aria-label={t("actions", { name: placeholder.displayName })}
                aria-haspopup="dialog"
                onClick={() => {
                  setError(null);
                  setSuggestion(null);
                  setRename(placeholder.displayName);
                  setSheet({ kind: "menu", placeholder });
                }}
              >
                <Icon name="more" size={20} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <BottomSheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
        }}
        title={sheetTitle}
        closeLabel={tCommon("close")}
        focusKey={shown ? `${shown.kind}-${shown.placeholder.id}` : undefined}
      >
        {shown?.kind === "link" ? (
          <div className={styles.sheet}>
            <p>{t("linkIntro", { name: shown.placeholder.displayName })}</p>
            <SharePanel
              link={shown.placeholder.link}
              texts={shown.placeholder.texts}
              defaultLocale={defaultLocale}
              tripName={tripName}
            />
          </div>
        ) : null}
        {shown?.kind === "menu" ? (
          <form
            className={styles.sheet}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const placeholder = shown.placeholder;
              startTransition(async () => {
                const result = await renamePlaceholderAction(publicId, placeholder.id, rename);
                handle(
                  result,
                  () => {
                    setSheet(null);
                    toast({ message: t("renameDone") });
                  },
                  renameRef.current,
                );
              });
            }}
          >
            <TextField
              ref={renameRef}
              id={`${ids}-rename`}
              label={t("nameLabel")}
              autoComplete="off"
              maxLength={DISPLAY_NAME_MAX}
              value={rename}
              onChange={(event) => {
                setRename(event.target.value);
              }}
              error={error ?? undefined}
            />
            {suggestion ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRename(suggestion);
                  setSuggestion(null);
                  setError(null);
                }}
              >
                {tInvite("useSuggestion")}
              </Button>
            ) : null}
            <div className={styles.actions}>
              <Button
                variant="text"
                size="sm"
                icon="trash"
                onClick={() => {
                  setSheet({ kind: "remove", placeholder: shown.placeholder });
                }}
              >
                {t("remove")}
              </Button>
              <Button type="submit" size="md" loading={pending}>
                {t("rename")}
              </Button>
            </div>
          </form>
        ) : null}
        {shown?.kind === "remove" ? (
          <div className={styles.sheet}>
            <p>{t("removeText", { name: shown.placeholder.displayName })}</p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSheet(null);
                }}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={pending}
                onClick={() => {
                  const placeholder = shown.placeholder;
                  startTransition(async () => {
                    const result = await removePlaceholderAction(publicId, placeholder.id);
                    handle(
                      result,
                      () => {
                        setSheet(null);
                        toast({ message: t("removeDone", { name: placeholder.displayName }) });
                      },
                      null,
                    );
                  });
                }}
              >
                {t("remove")}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </Card>
  );
}
