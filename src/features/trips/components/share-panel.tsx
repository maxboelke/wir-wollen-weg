"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { RadioGroup } from "@/components/ui/radio-group";
import type { Locale } from "@/i18n/config";
import { canShareText, copyText, directShareLinks } from "@/lib/clipboard";
import { animate, DURATION, SCALE, spring } from "@/lib/motion";
import styles from "./share-panel.module.css";

interface SharePanelProps {
  link: string;
  /** Ready share texts per text language (ux-spec §10.3, product name per language). */
  texts: Record<Locale, string>;
  /** Default text language = UI language of the sender (W06). */
  defaultLocale: Locale;
  tripName: string;
  /** Link locked (join closed, organiser view): only the link row, marked «gesperrt». */
  locked?: boolean | undefined;
}

type CopyTarget = "text" | "link";

/**
 * Invite text + share actions (F-002, W06, ux-spec §4.5): editable text, DE | EN switch
 * (asks before discarding edits), «Teilen …» via Web Share API – otherwise «Text kopieren»
 * as primary plus WhatsApp · Telegram · E-Mail links. Copying falls back to execCommand and
 * finally to selecting the text (no HTTPS / no clipboard permission). Motion: G-11, W06-02.
 */
export function SharePanel({
  link,
  texts,
  defaultLocale,
  tripName,
  locked = false,
}: SharePanelProps) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const ids = useId();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<Locale>(defaultLocale);
  const [text, setText] = useState(texts[defaultLocale]);
  const [pendingLanguage, setPendingLanguage] = useState<Locale | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const edited = text !== texts[language];

  // Web Share only exists in secure contexts and on some devices – decided after mounting.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability check
    setCanShare(canShareText(texts[defaultLocale]));
  }, [texts, defaultLocale]);

  // The link may have been renewed (server refresh): take the new texts unless edited.
  const lastTexts = useRef(texts);
  useEffect(() => {
    if (lastTexts.current === texts) return;
    const wasEdited = text !== lastTexts.current[language];
    lastTexts.current = texts;
    if (!wasEdited) setText(texts[language]);
  }, [texts, text, language]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(null);
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  function switchLanguage(next: Locale) {
    setLanguage(next);
    setText(texts[next]);
    // W06-02: the text cross-fades.
    areaRef.current?.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: DURATION.fast });
  }

  async function copy(target: CopyTarget) {
    const value = target === "text" ? text : link;
    setFailed(false);
    const ok = await copyText(value);
    if (!ok) {
      // Last fallback: select the visible text so it can be copied by hand.
      const field = target === "text" ? areaRef.current : linkRef.current;
      field?.focus();
      field?.select();
      setFailed(true);
      setAnnouncement(t("copyFailed"));
      return;
    }
    setCopied(target);
    setAnnouncement(t("copiedStatus"));
  }

  async function share() {
    try {
      await navigator.share({ text });
    } catch (error) {
      // Cancelled by the person: nothing to do. Anything else: copy instead.
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy("text");
    }
  }

  const direct = directShareLinks(text, t("emailSubject", { trip: tripName }), link);
  const copyLabel = (target: CopyTarget, label: string) =>
    copied === target ? <CopiedLabel label={t("copied")} /> : label;

  return (
    <div className={styles.panel}>
      {locked ? null : (
        <>
          <RadioGroup
            legend={t("languageLegend")}
            name="share-language"
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
          <div className={styles.actions}>
            {canShare ? (
              <Button block icon="share" onClick={() => void share()}>
                {t("share")}
              </Button>
            ) : null}
            <Button
              block
              variant={canShare ? "secondary" : "primary"}
              size={canShare ? "md" : "lg"}
              icon="copy"
              onClick={() => void copy("text")}
            >
              {copyLabel("text", t("copyText"))}
            </Button>
          </div>
          {canShare ? null : (
            <nav className={styles.direct} aria-label={t("directLabel")}>
              <a href={direct.whatsapp} target="_blank" rel="noreferrer noopener">
                {t("whatsapp")}
              </a>
              <a href={direct.telegram} target="_blank" rel="noreferrer noopener">
                {t("telegram")}
              </a>
              <a href={direct.email}>{t("email")}</a>
            </nav>
          )}
        </>
      )}
      <div className={styles.field}>
        <FieldLabel htmlFor={`${ids}-link`}>
          {t("linkTitle")}
          {locked ? <span className={styles.locked}>{` · ${t("linkLocked")}`}</span> : null}
        </FieldLabel>
        <div className={styles.linkRow}>
          <input
            ref={linkRef}
            id={`${ids}-link`}
            className={styles.link}
            readOnly
            value={link}
            onFocus={(event) => {
              event.currentTarget.select();
            }}
          />
          <Button variant="secondary" size="md" icon="link" onClick={() => void copy("link")}>
            {copyLabel("link", t("copyLink"))}
          </Button>
        </div>
      </div>
      {failed ? (
        <p className={styles.failed}>
          <Icon name="info" size={18} />
          <span>{t("copyFailed")}</span>
        </p>
      ) : null}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      <BottomSheet
        open={pendingLanguage !== null}
        onClose={() => {
          setPendingLanguage(null);
        }}
        title={t("languageSwitchTitle")}
        closeLabel={tCommon("close")}
      >
        <div className={styles.confirm}>
          <p>{t("languageSwitchText")}</p>
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
              {t("languageSwitchConfirm")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

/** «Kopiert ✓» – the check pops in with the soft spring (G-11); reduced: static. */
function CopiedLabel({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    animate(
      ref.current,
      [{ transform: `scale(${String(SCALE.pop)})` }, { transform: "scale(1)" }],
      {
        duration: DURATION.base,
        easing: spring("soft"),
      },
    );
  }, []);
  return (
    <span className={styles.copied}>
      {label}
      <span ref={ref} className={styles.check}>
        <Icon name="check" size={18} />
      </span>
    </span>
  );
}
