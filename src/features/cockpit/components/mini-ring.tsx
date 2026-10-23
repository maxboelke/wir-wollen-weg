"use client";

import { useEffect, useId, useState } from "react";
import { cx } from "@/lib/cx";
import styles from "./ticket.module.css";

/**
 * D-42 / UM-6: the sun dot of the phase line turns into a 20 px mini ring (same fill) once the
 * big ring of the ticket has left the screen under the sticky row 1 – IntersectionObserver,
 * not scroll-coupled; 140 ms cross-fade (stays with reduced motion, M-D2). Decorative.
 */
export function MiniRing({ percent }: { percent: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [mini, setMini] = useState(false);

  useEffect(() => {
    const ring = document.querySelector("[data-ticket-ring]");
    const head = document.querySelector<HTMLElement>("[data-sticky-head]");
    if (!ring || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setMini(entry ? !entry.isIntersecting : false);
      },
      { rootMargin: `-${String(head?.offsetHeight ?? 0)}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(ring);
    return () => {
      observer.disconnect();
    };
  }, []);

  const p = Math.max(0, Math.min(100, percent));
  return (
    <span
      className={cx(styles.phaseSlot, mini && styles.mini)}
      aria-hidden="true"
      data-mini={mini ? "" : undefined}
    >
      <span className={styles.phaseDot} />
      <svg className={styles.miniRing} viewBox="0 0 20 20" focusable="false">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--ww-ring-start)" }} />
            <stop offset="1" style={{ stopColor: "var(--ww-ring-end)" }} />
          </linearGradient>
        </defs>
        <circle
          cx="10"
          cy="10"
          r="7.5"
          fill="none"
          style={{ stroke: "var(--ww-cockpit-ring-track)" }}
          strokeWidth="3"
        />
        <circle
          cx="10"
          cy="10"
          r="7.5"
          fill="none"
          stroke={`url(#${uid})`}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${String(p)} 100`}
          transform="rotate(-90 10 10)"
        />
      </svg>
    </span>
  );
}
