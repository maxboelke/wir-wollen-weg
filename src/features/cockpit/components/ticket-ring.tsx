"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { celebratedAction } from "@/features/poll/actions";
import type { Celebration } from "@/features/poll/celebration";
import { prefersReducedMotion } from "@/lib/motion";
import { departureCelebratedAction } from "../actions";
import styles from "./ticket.module.css";

/** Confetti around the ring (design mockup C v2): [angle°, distance, shape, colour 1–5, rotation]. */
const PIECES: [number, number, "r" | "s" | "c", number, number][] = [
  [52, 92, "r", 1, -24],
  [70, 104, "s", 2, -35],
  [88, 90, "c", 3, 0],
  [106, 102, "r", 5, 30],
  [124, 92, "r", 4, 40],
  [142, 100, "s", 1, 20],
  [218, 98, "r", 2, 22],
  [236, 90, "c", 4, 0],
  [254, 104, "s", 1, 30],
  [272, 92, "r", 3, -12],
  [290, 102, "r", 5, -30],
  [308, 94, "s", 2, -35],
];
const SPARKS: [number, number, number, number][] = [
  [62, 112, 7, 1],
  [245, 114, 7, 5],
  [118, 116, 5, 2],
];

function polar(angle: number, distance: number): [number, number] {
  const r = (angle * Math.PI) / 180;
  return [
    Math.round((195 + distance * Math.sin(r)) * 10) / 10,
    Math.round((236 - distance * Math.cos(r)) * 10) / 10,
  ];
}

function Piece({
  angle,
  distance,
  shape,
  colour,
  rotation,
}: {
  angle: number;
  distance: number;
  shape: "r" | "s" | "c";
  colour: number;
  rotation: number;
}) {
  const [x, y] = polar(angle, distance);
  const fill = { fill: `var(--ww-confetti-${String(colour)})` };
  if (shape === "c") return <circle cx={x} cy={y} r="4.5" style={fill} />;
  const w = shape === "s" ? 11 : 8;
  const h = shape === "s" ? 2.5 : 13;
  return (
    <rect
      x={Math.round((x - w / 2) * 10) / 10}
      y={Math.round((y - h / 2) * 10) / 10}
      width={w}
      height={h}
      rx={shape === "s" ? 1.25 : 3}
      style={fill}
      transform={`rotate(${String(rotation)} ${String(x)} ${String(y)})`}
    />
  );
}

function sparkPath([x, y]: [number, number], r: number): string {
  const a = r * 0.3;
  return `M${String(x)} ${String(y - r)}L${String(x + a)} ${String(y - a)}L${String(x + r)} ${String(y)}L${String(x + a)} ${String(y + a)}L${String(x)} ${String(y + r)}L${String(x - a)} ${String(y + a)}L${String(x - r)} ${String(y)}L${String(x - a)} ${String(y - a)}Z`;
}

const LOCK_MS = 3000;
const DEPARTURE_DELAY_MS = 350;

interface TicketRingProps {
  publicId: string;
  /** Fill in % (≥ 4). */
  percent: number;
  /** Accessible name of the button («Vorfreude: noch 41 Tage»). */
  name: string;
  /** Text inside the ring – decorative (the countdown stands as text in the phase line). */
  children: ReactNode;
  /** Big celebration «Es geht los!» due for this person and fixing (W11, unchanged). */
  celebrate: boolean;
  /** UX-8: the small round plays once on the arrival day (UM-7). */
  departureDue: boolean;
}

/**
 * Vorfreude ring of the ticket head (W16 v2.2, D-36, D-44): a round button – tapping plays a
 * small confetti round (UM-1, lock 3 s, no vibration; reduced motion: a short glow). It also
 * hosts the big celebration W11 (once per person and fixing, `celebration.ts`) and the small
 * departure-day round (UX-8, once per person). R-017: layers that will animate are hidden by
 * CSS BEFORE the first paint (`data-celebrate`), so nothing visible ever blinks.
 */
export function TicketRing({
  publicId,
  percent,
  name,
  children,
  celebrate,
  departureDue,
}: TicketRingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = useRef<HTMLSpanElement>(null);
  const running = useRef<Celebration | null>(null);
  const lockedUntil = useRef(0);
  const p = Math.max(0, Math.min(100, percent));

  useEffect(() => {
    const root = rootRef.current;
    if (!root || (!celebrate && !departureDue)) return;
    let cancelled = false;
    let started = false;
    let timer = 0;
    const start = () => {
      if (started || document.visibilityState !== "visible") return;
      started = true;
      document.removeEventListener("visibilitychange", start);
      if (celebrate) {
        // Seen as soon as it visibly starts – also with reduced motion (F-012).
        void celebratedAction(publicId);
        void import("@/features/poll/celebration").then(({ celebrate: run }) => {
          if (cancelled) return;
          running.current = run({ ring: root, percent: p, animateCard: false });
        });
        return;
      }
      void departureCelebratedAction(publicId);
      if (prefersReducedMotion()) {
        // UM-7 reduced: only the sentence «Heute geht's los – gute Reise!».
        root.removeAttribute("data-celebrate");
        return;
      }
      timer = window.setTimeout(() => {
        void import("@/features/poll/celebration").then(({ confettiRound }) => {
          if (cancelled) return;
          lockedUntil.current = Date.now() + LOCK_MS;
          running.current = confettiRound(root);
        });
      }, DEPARTURE_DELAY_MS);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", start);
      running.current?.finish();
    };
    // Once per mount – the props of one fixing do not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap() {
    const root = rootRef.current;
    if (!root || Date.now() < lockedUntil.current) return;
    lockedUntil.current = Date.now() + LOCK_MS;
    running.current?.finish();
    void import("@/features/poll/celebration").then(({ confettiRound }) => {
      running.current = confettiRound(root);
    });
  }

  return (
    <button
      type="button"
      className={styles.ringButton}
      aria-label={name}
      onClick={tap}
      data-ticket-ring=""
    >
      <span
        ref={rootRef}
        className={styles.ring}
        aria-hidden="true"
        data-countdown-ring=""
        data-celebrate={celebrate ? "pending" : departureDue ? "small" : undefined}
      >
        <svg
          className={styles.ringSvg}
          viewBox="117 158 156 156"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--ww-ring-start)" }} />
              <stop offset="1" style={{ stopColor: "var(--ww-ring-end)" }} />
            </linearGradient>
            <radialGradient id={`${uid}h`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: "var(--ww-ring-start)" }} stopOpacity=".08" />
              <stop offset="0.7" style={{ stopColor: "var(--ww-ring-start)" }} stopOpacity=".22" />
              <stop offset="0.86" style={{ stopColor: "var(--ww-ring-start)" }} stopOpacity=".07" />
              <stop offset="1" style={{ stopColor: "var(--ww-ring-start)" }} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g data-anim="glow">
            <circle cx="195" cy="236" r="92" fill={`url(#${uid}h)`} />
          </g>
          <g data-anim="confetti">
            {PIECES.map(([angle, distance, shape, colour, rotation], index) => (
              <g key={index} data-piece={index + 1}>
                <Piece
                  angle={angle}
                  distance={distance}
                  shape={shape}
                  colour={colour}
                  rotation={rotation}
                />
              </g>
            ))}
          </g>
          <circle
            cx="195"
            cy="236"
            r="66"
            fill="none"
            style={{ stroke: "var(--ww-cockpit-ring-track)" }}
            strokeWidth="12"
          />
          <g data-anim="ring">
            <path
              data-ring-fill=""
              d="M195 170a66 66 0 1 1 0 132a66 66 0 1 1 0-132"
              pathLength={100}
              fill="none"
              stroke={`url(#${uid}g)`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${String(p)} 100`}
              strokeDashoffset="0"
            />
          </g>
          <g data-anim="knob">
            <g transform={`rotate(${String(Math.round(p * 36) / 10)} 195 236)`}>
              <circle
                data-knob-dot=""
                cx="195"
                cy="170"
                r="9"
                strokeWidth="3"
                style={{ fill: "var(--ww-ring-knob)", stroke: "var(--ww-ring-knob-edge)" }}
              />
            </g>
          </g>
          <g data-anim="sparkles">
            {SPARKS.map(([angle, distance, r, colour], index) => (
              <path
                key={index}
                d={sparkPath(polar(angle, distance), r)}
                style={{ fill: `var(--ww-confetti-${String(colour)})` }}
              />
            ))}
          </g>
        </svg>
        <span className={styles.ringLabel}>{children}</span>
      </span>
    </button>
  );
}
