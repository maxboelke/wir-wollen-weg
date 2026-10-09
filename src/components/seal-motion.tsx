"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DURATION, EASING, animate, spring } from "@/lib/motion";
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
    const root = ref.current;
    if (!root || serverPainted) return;
    const duration = size === "sm" ? DURATION.moderate : DURATION.celebrate;
    const layer = (name: string) => root.querySelector(`[data-anim="${name}"]`);
    for (const name of ["disc", "check", "sparks"]) {
      const element = layer(name);
      if (element instanceof SVGElement) element.style.transformOrigin = "center";
      if (element instanceof SVGElement) element.style.transformBox = "fill-box";
    }
    animate(
      layer("disc"),
      [
        { transform: "scale(0.6)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration,
        delay,
        easing: spring("bouncy"),
        fill: "backwards",
      },
    );
    animate(
      layer("check"),
      [
        { transform: "scale(0.4)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 },
      ],
      {
        duration: duration * 0.6,
        delay: delay + duration * 0.4,
        easing: EASING.enter,
        fill: "backwards",
      },
    );
    if (size === "lg") {
      animate(
        layer("sparks"),
        [
          { transform: "scale(0.6)", opacity: 0 },
          { transform: "scale(1)", opacity: 1 },
        ],
        {
          duration: DURATION.moderate,
          delay: delay + duration * 0.6,
          easing: EASING.enter,
          fill: "backwards",
        },
      );
    }
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
