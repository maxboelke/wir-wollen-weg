"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { DISTANCE, DURATION, EASING, enter } from "@/lib/motion";
import { useWasServerPainted } from "@/lib/use-hydration";
import styles from "./welcome-hint.module.css";

interface WelcomeHintProps {
  title: string;
  text: string;
  closeLabel: string;
  /** Server-rendered 40 px seal (SealMotion). */
  seal: ReactNode;
  /** Optional addition below the text (e.g. the static gesture sketch on «Meine Tage»). */
  extra?: ReactNode;
}

/**
 * «Du bist dabei!» after joining (W03 Z5, motion W03-06): the hint glides in from above,
 * its seal pops (G-21). Once, closable; the `?welcome=1` marker leaves the URL right away,
 * so a reload or a shared link does not show it again. Reduced motion: static.
 */
export function WelcomeHint({ title, text, closeLabel, seal, extra }: WelcomeHintProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const serverPainted = useWasServerPainted();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("welcome")) return;
    url.searchParams.delete("welcome");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  useLayoutEffect(() => {
    if (serverPainted) return;
    enter(ref.current, { y: -DISTANCE.sm, duration: DURATION.base, easing: EASING.enter });
  }, [serverPainted]);

  if (!open) return null;
  return (
    <div ref={ref} className={styles.hint} role="status">
      {seal}
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p>{text}</p>
        {extra}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label={closeLabel}
        onClick={() => {
          setOpen(false);
        }}
      >
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}
