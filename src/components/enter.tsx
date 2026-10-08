"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DISTANCE, DURATION, EASING, enter } from "@/lib/motion";

interface EnterProps {
  children: ReactNode;
  className?: string | undefined;
  /** "card": W03-01 preview card (rise 16 px, slow, emphasized) · "content": G-01 page content. */
  variant?: "card" | "content" | undefined;
}

/**
 * One-time entrance on mount. Content starts readable within 320 ms; reduced motion =
 * cross-fade only (interaktionen.md G-01, W03-01).
 */
export function Enter({ children, className, variant = "content" }: EnterProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (variant === "card") {
      enter(ref.current, { y: DISTANCE.md, duration: DURATION.slow, easing: EASING.emphasized });
    } else {
      enter(ref.current, { y: DISTANCE.sm, duration: DURATION.base });
    }
  }, [variant]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
