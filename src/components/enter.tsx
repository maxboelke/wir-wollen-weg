"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DISTANCE, DURATION, EASING, enter } from "@/lib/motion";
import { useWasServerPainted } from "@/lib/use-hydration";

interface EnterProps {
  children: ReactNode;
  className?: string | undefined;
  /** "card": W03-01 preview card (rise 16 px, slow, emphasized) · "content": G-01 page content. */
  variant?: "card" | "content" | undefined;
}

/**
 * One-time entrance on mount (interaktionen.md G-01, W03-01). Only for content that appears
 * on the client (navigation, new step): server-rendered content is already visible on the
 * first load and must never blink away (R-017). Reduced motion = cross-fade only.
 */
export function Enter({ children, className, variant = "content" }: EnterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const serverPainted = useWasServerPainted();
  useLayoutEffect(() => {
    if (serverPainted) return;
    if (variant === "card") {
      enter(ref.current, { y: DISTANCE.md, duration: DURATION.slow, easing: EASING.emphasized });
    } else {
      enter(ref.current, { y: DISTANCE.sm, duration: DURATION.base });
    }
  }, [serverPainted, variant]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
