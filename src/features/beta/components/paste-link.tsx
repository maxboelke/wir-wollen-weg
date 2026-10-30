"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type SubmitEvent } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { internalLinkFromText } from "@/lib/pwa";
import { useStandalone } from "@/lib/use-standalone";
import styles from "../beta.module.css";

/**
 * W23 C.8 – «Einladungslink einfügen», only inside the installed app (links from WhatsApp and
 * mails open Safari, never the app). Accepts the first URL of THIS origin with `/i/<token>` or
 * `/trips/<id>…` – also inside a pasted chat message – and opens it in the app. The clipboard
 * is read only on «Einfügen»; nothing is stored.
 */
export function PasteLink({ product }: { product: string }) {
  const t = useTranslations("pwa.paste");
  const tCommon = useTranslations("common");
  const standalone = useStandalone();
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!standalone) return null;

  function openLink(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const path = internalLinkFromText(inputRef.current?.value ?? "", window.location.origin);
    if (!path) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(path);
  }

  return (
    <>
      <button
        type="button"
        className={styles.textLink}
        onClick={() => {
          setError(false);
          setOpen(true);
        }}
      >
        {t("button")}
      </button>
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t("button")}
        closeLabel={tCommon("close")}
      >
        <form className={styles.form} onSubmit={openLink} noValidate>
          <p className={styles.small}>{t("intro")}</p>
          <TextField
            ref={inputRef}
            id={`${id}-link`}
            name="link"
            type="url"
            inputMode="url"
            autoComplete="off"
            label={t("label")}
            error={error ? t("error", { product }) : undefined}
            onChange={() => {
              setError(false);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void navigator.clipboard
                .readText()
                .then((text) => {
                  if (inputRef.current) inputRef.current.value = text;
                  setError(false);
                })
                .catch(() => {
                  inputRef.current?.focus();
                });
            }}
          >
            {t("paste")}
          </Button>
          <Button type="submit" block>
            {t("open")}
          </Button>
        </form>
      </BottomSheet>
    </>
  );
}
