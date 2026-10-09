"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { DISTANCE, DURATION, EASING, enter } from "@/lib/motion";
import { loadPendingAuth } from "@/lib/pending-auth";
import styles from "./join-gate.module.css";

interface JoinGateProps {
  /** `/i/<token>` – a pending sign-in of this invite opens the gate right away (A.4). */
  origin: string;
  cta: string;
  notes: ReactNode;
  children: ReactNode;
}

/**
 * W03 Z1 → Z2 on phones (< 600 px): the preview comes first, the e-mail form opens below
 * the card after «Mitmachen» (W03-02: form rises 8 px + fade, focus synchronously into the
 * e-mail field so the keyboard opens). From 600 px the form is visible at once (W03
 * desktop). Without JavaScript the form is always visible.
 */
export function JoinGate({ origin, cta, notes, children }: JoinGateProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (loadPendingAuth()?.origin === origin || url.searchParams.has("step")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage/URL only readable after mounting
      setOpen(true);
    }
  }, [origin]);

  return (
    <div className={cx(styles.gate, open && styles.open)}>
      <div className={styles.cta}>
        <Button
          variant="primary"
          block
          onClick={() => {
            flushSync(() => {
              setOpen(true);
            });
            formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
            enter(formRef.current, {
              y: DISTANCE.sm,
              duration: DURATION.base,
              easing: EASING.enter,
            });
          }}
        >
          {cta}
        </Button>
        <div className={styles.notes}>{notes}</div>
      </div>
      <div ref={formRef} className={styles.form}>
        {children}
      </div>
    </div>
  );
}
