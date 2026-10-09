"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DISTANCE, DURATION, EASING, enter, STAGGER, staggerDelay } from "@/lib/motion";

interface StaggerEnterProps {
  children: ReactNode;
  /** Plays once per session under this key (motion-system §5.8); back navigation: no stagger. */
  sessionKey: string;
  className?: string | undefined;
}

/**
 * Card entrance (interaktionen.md W04-01): `[data-stagger]` children fade in and rise,
 * max. 5 staggered, the rest together. Reduced motion: cross-fade only.
 */
export function StaggerEnter({ children, sessionKey, className }: StaggerEnterProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const key = `ww-anim:${sessionKey}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: play anyway
    }
    root.querySelectorAll("[data-stagger]").forEach((item, i) => {
      enter(item, {
        y: DISTANCE.md,
        duration: DURATION.slow,
        easing: EASING.enter,
        delay: staggerDelay(Math.min(i, 4), STAGGER.card),
      });
    });
  }, [sessionKey]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
