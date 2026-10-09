"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  DISTANCE,
  DURATION,
  EASING,
  prefersReducedMotion,
  STAGGER,
  staggerDelay,
} from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Scroll reveal (interaktionen.md W01-02): `[data-reveal]` elements below the FIRST viewport fade
 * in and rise by 16 px once when they scroll into view (20 %), staggered. Content in the
 * first viewport is never hidden; without JS or with reduced motion everything is simply
 * visible (motion-system §6.1).
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const items = [...root.querySelectorAll("[data-reveal]")].filter(
      (item): item is HTMLElement =>
        item instanceof HTMLElement && item.getBoundingClientRect().top > window.innerHeight,
    );
    if (items.length === 0) return;
    for (const item of items) item.style.opacity = "0";

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        visible.forEach((entry, i) => {
          const item = entry.target as HTMLElement;
          observer.unobserve(item);
          item.style.opacity = "";
          item.animate(
            [
              { opacity: 0, transform: `translateY(${DISTANCE.md}px)` },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: DURATION.slow,
              delay: staggerDelay(i, STAGGER.card),
              easing: EASING.enter,
              fill: "backwards",
            },
          );
        });
      },
      { threshold: 0.2 },
    );
    for (const item of items) observer.observe(item);
    return () => {
      observer.disconnect();
      for (const item of items) item.style.opacity = "";
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
