"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-styles";
import { ButtonContent } from "@/components/ui/button-content";
import { FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import type { Locale } from "@/i18n/config";
import { canShareText, copyText } from "@/lib/clipboard";
import { DURATION } from "@/lib/motion";
import { whatsappHref } from "@/lib/remind";
import styles from "./remind-sheet.module.css";

interface RemindMessageProps {
  /** Ready texts per text language (§14.2) – or a function for «Alle erinnern» (names change). */
  texts: Record<Locale, string>;
  defaultLocale: Locale;
  /** Muted line below the buttons («Schick es Kemal direkt …»). */
  footer?: string | undefined;
  /** No one picked («Alle erinnern»): buttons are blocked, the reason stands next to them. */
  blockedReason?: string | null | undefined;
}

/**
 * Message block of the remind sheet (ux-spec §14.2, decision 4): editable text with the DE |
 * EN switch (asks before discarding edits, §4.5), [Per WhatsApp senden] as the primary action
 * (`wa.me/?text=` opens the chat picker), [Teilen …] only with Web Share, [Text kopieren]
 * always. Indigo primary – no WhatsApp green (U-17).
 */
export function RemindMessage({ texts, defaultLocale, footer, blockedReason }: RemindMessageProps) {
  const t = useTranslations("remind");
  const tShare = useTranslations("share");
  const tCommon = useTranslations("common");
  const ids = useId();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [language, setLanguage] = useState<Locale>(defaultLocale);
  const [text, setText] = useState(texts[defaultLocale]);
  const [pendingLanguage, setPendingLanguage] = useState<Locale | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const edited = text !== texts[language];

  // Web Share exists only in secure contexts and on some devices – decided after mounting.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability check
    setCanShare(canShareText(texts[defaultLocale]));
  }, [texts, defaultLocale]);

  // New texts (other names picked in «Alle erinnern»): take them – picking IS the edit.
  const lastTexts = useRef(texts);
  useEffect(() => {
    if (lastTexts.current === texts) return;
    lastTexts.current = texts;
    setText(texts[language]);
  }, [texts, language]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  function switchLanguage(next: Locale) {
    setLanguage(next);
    setText(texts[next]);
    areaRef.current?.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: DURATION.fast });
  }

  async function copy() {
    setFailed(false);
    if (!(await copyText(text))) {
      areaRef.current?.focus();
      areaRef.current?.select();
      setFailed(true);
      setAnnouncement(tShare("copyFailed"));
      return;
    }
    setCopied(true);
    setAnnouncement(tShare("copiedStatus"));
  }

  async function share() {
    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  }

  const blocked = Boolean(blockedReason);

  return (
    <div className={styles.message}>
      <RadioGroup
        legend={tShare("languageLegend")}
        name={`${ids}-language`}
        layout="row"
        value={language}
        options={(["de", "en"] as const).map((value) => ({
          value,
          label: tCommon(`languages.${value}`),
          lang: value,
        }))}
        onChange={(next) => {
          if (edited) setPendingLanguage(next);
          else switchLanguage(next);
        }}
      />
      <div className={styles.field}>
        <FieldLabel htmlFor={`${ids}-text`}>{t("messageLabel")}</FieldLabel>
        <textarea
          ref={areaRef}
          id={`${ids}-text`}
          className={styles.text}
          lang={language}
          rows={4}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      </div>
      {blocked ? (
        <p className={styles.blocked} id={`${ids}-blocked`}>
          <Icon name="info" size={18} />
          <span>{blockedReason}</span>
        </p>
      ) : null}
      <div className={styles.buttons}>
        {blocked ? (
          <Button block size="lg" aria-disabled aria-describedby={`${ids}-blocked`}>
            {t("whatsapp")}
          </Button>
        ) : (
          <a
            className={buttonClassName({ block: true, size: "lg" })}
            href={whatsappHref(text)}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp=""
          >
            <ButtonContent icon="share">
              {t("whatsapp")}
              <span className="visually-hidden">{` ${t("whatsappSr")}`}</span>
            </ButtonContent>
          </a>
        )}
        <div className={styles.secondary}>
          {canShare ? (
            <Button
              variant="secondary"
              size="md"
              icon="share"
              aria-disabled={blocked || undefined}
              onClick={() => void share()}
            >
              {tShare("share")}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="md"
            icon={copied ? "check" : "copy"}
            aria-disabled={blocked || undefined}
            onClick={() => void copy()}
          >
            {copied ? tShare("copied") : tShare("copyText")}
          </Button>
        </div>
      </div>
      {failed ? (
        <p className={styles.blocked}>
          <Icon name="info" size={18} />
          <span>{tShare("copyFailed")}</span>
        </p>
      ) : null}
      {footer ? <p className={styles.muted}>{footer}</p> : null}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      <BottomSheet
        open={pendingLanguage !== null}
        onClose={() => {
          setPendingLanguage(null);
        }}
        title={tShare("languageSwitchTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{tShare("languageSwitchText")}</p>
          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setPendingLanguage(null);
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              size="md"
              onClick={() => {
                if (pendingLanguage) switchLanguage(pendingLanguage);
                setPendingLanguage(null);
              }}
            >
              {tShare("languageSwitchConfirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
