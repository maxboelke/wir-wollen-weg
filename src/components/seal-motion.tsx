"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { sealPop } from "@/lib/motion";
import { cx } from "@/lib/cx";
import { useWasServerPainted } from "@/lib/use-hydration";
import styles from "./seal-motion.module.css";

interface SealMotionProps {
  /** The server-rendered `seal` illustration (layers `disc`, `check`, `sparks`). */
  children: ReactNode;
  /** 20 px: `moderate`; 40/64 px: `celebrate` (G-21). */
  size: "sm" | "md" | "lg";
  delay?: number | undefined;
  className?: string | undefined;
}

/**
 * Seal G-21 (Beitritt «Du bist dabei!», «Deine Reise ist angelegt!»): the disc pops in with
 * the bouncy spring, the check follows from 40 % (scale + fade instead of a stroke draw –
 * the motion helper only animates transform/opacity), sparks only at 64 px. Only when the
 * seal appears on the client (navigation) – never for server-painted HTML (R-017).
 * Reduced motion: static.
 */
export function SealMotion({ children, size, delay = 0, className }: SealMotionProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const serverPainted = useWasServerPainted();
  useLayoutEffect(() => {
    if (serverPainted) return;
    sealPop(ref.current, size === "sm" ? 20 : size === "md" ? 40 : 64, delay);
  }, [serverPainted, size, delay]);
  return (
    <span
      ref={ref}
      className={cx(styles.seal, size !== "lg" && styles.noSparks, className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
