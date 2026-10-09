"use client";
/* eslint-disable react/jsx-no-literals -- internal component showcase (never in production) */

import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CodeField, type CodeFieldStatus } from "@/components/ui/code-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { CODE_LENGTH } from "@/lib/code";
import { motionCookieReduces, setMotionPreference, watchSystemMotion } from "@/lib/motion";
import styles from "./showcase.module.css";

/** Interactive code field: 123456 is right, anything else wrong; 5 wrong attempts lock. */
export function CodeFieldDemo() {
  const t = useTranslations("auth");
  const id = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<CodeFieldStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const error =
    status === "error"
      ? t("errors.wrongCode")
      : status === "locked"
        ? t("errors.tooManyAttempts")
        : null;

  function check(code: string) {
    setStatus("checking");
    window.setTimeout(() => {
      if (code === "123456") {
        setStatus("success");
        return;
      }
      const next = attempts + 1;
      setAttempts(next);
      setStatus(next >= 5 ? "locked" : "error");
    }, 900);
  }

  return (
    <div className={styles.stack}>
      <CodeField
        id={id}
        label={t("codeLabel")}
        hint={t("codeHint", { email: "kemal@example.org" })}
        value={value}
        onChange={(next) => {
          if (status === "error") setStatus("idle");
          setValue(next);
          if (next.length === CODE_LENGTH) check(next);
        }}
        status={status}
        error={error}
        checkingLabel={t("checkingCode")}
        successLabel={t("codeConfirmed")}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setValue("");
          setStatus("idle");
          setAttempts(0);
        }}
      >
        Reset (123456 = richtig)
      </Button>
    </div>
  );
}

/** Static code field in one state (for review screenshots). */
export function CodeFieldState({ status, value }: { status: CodeFieldStatus; value: string }) {
  const t = useTranslations("auth");
  const id = useId();
  const error =
    status === "error"
      ? t("errors.wrongCode")
      : status === "locked"
        ? t("errors.tooManyAttempts")
        : null;
  return (
    <CodeField
      id={id}
      label={`${t("codeLabel")} · ${status}`}
      value={value}
      onChange={() => undefined}
      status={status}
      error={error}
      checkingLabel={t("checkingCode")}
      successLabel={t("codeConfirmed")}
    />
  );
}

/** The real mechanics of "Reduce motion" (cookie + data-motion); the account setting follows in Increment 1. */
export function MotionSwitchDemo() {
  const t = useTranslations("settings.motion");
  const toast = useToast();
  const tCommon = useTranslations("common");
  const [reduce, setReduce] = useState(false);
  const [device, setDevice] = useState(false);

  useEffect(() => {
    const read = () => {
      setReduce(motionCookieReduces(document.cookie));
      setDevice(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    read();
    return watchSystemMotion(read);
  }, []);

  return (
    <Switch
      label={t("label")}
      description={reduce || device ? t("help") : t("off")}
      checked={reduce}
      lockedReason={device ? t("device") : undefined}
      onChange={(next) => {
        setMotionPreference(next);
        setReduce(next);
        toast({ message: tCommon("saved") });
      }}
    />
  );
}

export function ToastDemo() {
  const toast = useToast();
  const t = useTranslations("common");
  return (
    <div className={styles.row}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          toast({ message: t("saved") });
        }}
      >
        Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          toast({
            message: "8 Tage auf „geht nicht“ gesetzt",
            action: { label: t("undo"), onAction: () => undefined },
          });
        }}
      >
        Toast mit Aktion
      </Button>
    </div>
  );
}

export function SheetDemo() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Bottom-Sheet öffnen
      </Button>
      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title="Tagesdetail · Sa., 15. Mai"
        closeLabel={t("close")}
      >
        <p>
          5 von 7: Geht. Grundgerüst – Ziehen und Rastpunkte folgen mit dem ersten echten Sheet.
        </p>
        <div className={styles.row}>
          <Button
            block
            onClick={() => {
              setOpen(false);
            }}
          >
            Fertig
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

/** Radio group (R-018): native radios, dot pops in (G-12), reduced = at once. */
export function RadioDemo() {
  const [value, setValue] = useState<"auto" | "mon" | "sun">("auto");
  const id = useId();
  return (
    <RadioGroup
      legend="Woche beginnt am"
      name={`week-${id}`}
      value={value}
      onChange={setValue}
      options={[
        { value: "auto", label: "Automatisch (Montag)", hint: "Nach deiner Region" },
        { value: "mon", label: "Montag" },
        { value: "sun", label: "Sonntag" },
      ]}
    />
  );
}
