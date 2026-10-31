"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { copyText } from "@/lib/clipboard";
import { detectPlatform, type PlatformInfo } from "@/lib/pwa";
import { useStandalone } from "@/lib/use-standalone";
import {
  INSTALL_PROMPT_EVENT,
  takeInstallPrompt,
  type InstallPromptEvent,
} from "@/lib/install-prompt";
import styles from "../beta.module.css";

/** localStorage flag against flicker (W23 B.5 – the binding flag is on the account). */
export const INSTALL_SEEN_STORAGE_KEY = "ww-install-hint-seen";

interface InstallGuideProps {
  product: string;
  /** One-off step after sign-up: «Später» instead of a back link. */
  first: boolean;
  /** Server action: marks the hint as seen and continues to `next`. */
  finish: () => Promise<void>;
}

function IosSteps({ product }: { product: string }) {
  const t = useTranslations("install");
  return (
    <>
      <details className={styles.details}>
        <summary>{t("ios.step0Summary")}</summary>
        <p className={styles.small}>{t("ios.step0")}</p>
      </details>
      <ol className={styles.steps} aria-label={t("heading.ios")}>
        <li>{t("ios.step1")}</li>
        <li>{t("ios.step2")}</li>
        <li>{t("ios.step3")}</li>
        <li>{t("ios.step4", { product })}</li>
      </ol>
    </>
  );
}

/**
 * W23 B – «Hol dir die App auf den Home-Bildschirm»: text-only guide (the sketches D-73 follow),
 * iOS steps as an ordered list, Android with the native install dialog when Chrome offered one
 * (`beforeinstallprompt`), in-app browsers get «In Safari öffnen» (B.4). Platform detection runs
 * only in the client – before that a neutral intro is shown (no layout jump of the buttons).
 */
export function InstallGuide({ product, first, finish }: InstallGuideProps) {
  const t = useTranslations("install");
  const showToast = useToast();
  const standalone = useStandalone();
  const [info, setInfo] = useState<PlatformInfo | null>(null);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- browser APIs only readable after mounting */
    setInfo(detectPlatform(navigator.userAgent, navigator.maxTouchPoints));
    setPrompt(takeInstallPrompt());
    /* eslint-enable react-hooks/set-state-in-effect */
    const onPrompt = () => {
      setPrompt(takeInstallPrompt());
    };
    window.addEventListener(INSTALL_PROMPT_EVENT, onPrompt);
    return () => {
      window.removeEventListener(INSTALL_PROMPT_EVENT, onPrompt);
    };
  }, []);

  function done() {
    setBusy(true);
    try {
      window.localStorage.setItem(INSTALL_SEEN_STORAGE_KEY, "1");
    } catch {
      // storage blocked – the account flag is enough
    }
    void finish();
  }

  if (standalone) {
    return (
      <div className={styles.step}>
        <h1 className={styles.heading}>{t("title")}</h1>
        <p className={styles.lead}>{t("installed")}</p>
        <Button block onClick={done} loading={busy}>
          {t("done")}
        </Button>
      </div>
    );
  }

  const platform = info?.platform ?? "ios";
  const inApp = info && (info.inApp !== null || info.webview);
  return (
    <div className={styles.step}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>
          {platform === "android" ? t("heading.android") : t("heading.ios")}
        </h1>
        <p className={styles.lead}>{t("intro", { product })}</p>
      </div>
      {info === null ? null : inApp ? (
        <section className={styles.note} aria-labelledby="install-inapp">
          <h2 id="install-inapp" className={styles.subheading}>
            {platform === "android" ? t("inapp.headingAndroid") : t("inapp.heading")}
          </h2>
          <p>{info.inApp ? t("inapp.text", { app: info.inApp }) : t("inapp.textGeneric")}</p>
          <ol className={styles.steps}>
            <li>{t("inapp.step1")}</li>
            <li>{t("inapp.step2")}</li>
          </ol>
          <p className={styles.small}>{t("inapp.copyHint")}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void copyText(window.location.origin).then((ok) => {
                if (ok) showToast({ message: t("inapp.copied") });
              });
            }}
          >
            {t("inapp.copy")}
          </Button>
          <p className={styles.small}>{t("inapp.relogin")}</p>
        </section>
      ) : platform === "android" ? (
        prompt ? (
          <Button
            block
            icon="plus"
            onClick={() => {
              void prompt.prompt().then(() =>
                prompt.userChoice.then((choice) => {
                  setPrompt(null);
                  if (choice.outcome === "accepted") {
                    showToast({ message: t("android.installing") });
                    done();
                  }
                }),
              );
            }}
          >
            {t("android.button")}
          </Button>
        ) : (
          <p>{t("android.manual")}</p>
        )
      ) : platform === "ios" ? (
        <IosSteps product={product} />
      ) : (
        <>
          <p>{t("desktop")}</p>
          <h2 className={styles.subheading}>{t("iosLabel")}</h2>
          <IosSteps product={product} />
          <h2 className={styles.subheading}>{t("androidLabel")}</h2>
          <p>{t("android.manual")}</p>
        </>
      )}
      <Button block onClick={done} loading={busy}>
        {t("done")}
      </Button>
      {first ? (
        <button type="button" className={styles.textLink} onClick={done}>
          {inApp ? t("inapp.skip") : t("later")}
        </button>
      ) : null}
    </div>
  );
}
