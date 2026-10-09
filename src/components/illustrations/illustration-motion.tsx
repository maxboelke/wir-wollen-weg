"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { animate, DURATION, EASING, prefersReducedMotion, spring, STAGGER } from "@/lib/motion";

type Choreography = "hero" | "empty" | "letter";

interface Step {
  layer: string;
  keyframes: Keyframe[];
  delay: number;
  duration?: number;
  easing?: string;
}

const rise = (px: number): Keyframe[] => [
  { opacity: 0, transform: `translateY(${px}px)` },
  { opacity: 1, transform: "none" },
];
const fade: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
const pop: Keyframe[] = [
  { opacity: 0, transform: "scale(0.6)" },
  { opacity: 1, transform: "scale(1)" },
];

/** Entrance choreographies (interaktionen.md W01-01, W04-06, W03-01) – total ≤ 1.1 s. */
function steps(kind: Choreography): Step[] {
  const soft = spring("soft");
  switch (kind) {
    case "hero":
      return [
        { layer: "plate", keyframes: fade, delay: 0 },
        { layer: "calendar", keyframes: rise(12), delay: 60, easing: EASING.emphasized },
        { layer: "ring", keyframes: pop, delay: 220, easing: soft },
        { layer: "cells", keyframes: rise(8), delay: 260 },
        { layer: "band", keyframes: fade, delay: 420 },
        { layer: "friends", keyframes: pop, delay: 480, easing: soft },
        { layer: "sun", keyframes: rise(12), delay: 520 },
        { layer: "seal", keyframes: pop, delay: 600, easing: soft },
      ];
    case "empty":
      return [
        { layer: "plate", keyframes: fade, delay: 0 },
        { layer: "sun", keyframes: rise(12), delay: 80 },
        { layer: "sea", keyframes: rise(6), delay: 140 },
        { layer: "suitcase", keyframes: pop, delay: 200, easing: soft },
        { layer: "calendar", keyframes: rise(10), delay: 120 },
      ];
    case "letter":
      return [
        { layer: "plate", keyframes: fade, delay: 0 },
        { layer: "letter", keyframes: rise(10), delay: 60, easing: EASING.emphasized },
        {
          layer: "plane",
          keyframes: [
            { opacity: 0, transform: "translate(-12px, 10px) rotate(-8deg)" },
            { opacity: 1, transform: "none" },
          ],
          delay: 200,
          easing: soft,
        },
        { layer: "seal", keyframes: pop, delay: 260, easing: soft },
        { layer: "sparks", keyframes: fade, delay: 360 },
      ];
  }
}

interface IllustrationMotionProps {
  choreography: Choreography;
  /** Plays once per session under this key (motion-system §5.8). */
  sessionKey: string;
  className?: string | undefined;
  children: ReactNode;
}

/** Past this point a still hidden illustration has been revealed by the CSS failsafe. */
const FAILSAFE_MS = 2400;

/**
 * Plays an illustration's layer entrance once (only `transform`/`opacity` on `data-anim`
 * groups). Text and buttons never wait for it; reduced motion: static end state.
 *
 * R-017: the layers are hidden by CSS BEFORE the first paint (`data-intro="pending"`, only
 * with JavaScript and full motion – globals.css), so the entrance starts from "not yet
 * visible" instead of hiding an already painted picture. Without JavaScript, with reduced
 * motion or when it already played in this session, the picture is simply there; a CSS
 * failsafe reveals it after 2.4 s if hydration never happens.
 */
export function IllustrationMotion({
  choreography,
  sessionKey,
  className,
  children,
}: IllustrationMotionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Reveal in the same frame the animations start (fill: backwards keeps them hidden).
    root.removeAttribute("data-intro");
    if (prefersReducedMotion() || performance.now() > FAILSAFE_MS) return;
    const key = `ww-anim:${sessionKey}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked (private mode in some in-app browsers): just play
    }
    const running: Animation[] = [];
    for (const step of steps(choreography)) {
      root.querySelectorAll<SVGGElement>(`[data-anim="${step.layer}"]`).forEach((layer, i) => {
        layer.style.transformBox = "fill-box";
        layer.style.transformOrigin = "center";
        const animation = animate(layer, step.keyframes, {
          duration: step.duration ?? DURATION.moderate,
          delay: step.delay + i * STAGGER.item,
          easing: step.easing ?? EASING.enter,
          fill: "backwards",
        });
        if (animation) running.push(animation);
      });
    }
    // Hidden tab = stopped (motion-system §7.8): jump to the end state.
    const finish = () => {
      if (document.hidden)
        running.forEach((animation) => {
          animation.finish();
        });
    };
    document.addEventListener("visibilitychange", finish);
    return () => {
      document.removeEventListener("visibilitychange", finish);
    };
  }, [choreography, sessionKey]);

  return (
    <div ref={ref} className={className} data-intro="pending">
      {children}
    </div>
  );
}
