import { useId, type ReactNode } from "react";
import styles from "./result.module.css";

interface CountdownRingProps {
  /** Fill in % (≥ 4, design-system §9.12). */
  percent: number;
  /** Text in the middle («noch / 23 / Tage») – decorative, the card carries it as text (D-24). */
  label: ReactNode;
  /** The celebration will play: the animated layers start hidden (R-017, see CSS). */
  celebrate: boolean;
}

/**
 * «Vorfreude» ring in the cockpit (W11, countdown-ring.svg v1.0 without the backdrop – the
 * cockpit is the ground). Static end state = this markup (reduced motion, later visits, W11-04).
 * Layers with `data-anim` are animated by the celebration (W11-02). Entirely `aria-hidden`.
 */
export function CountdownRing({ percent, label, celebrate }: CountdownRingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradient = `wwcr-grad-${uid}`;
  const glow = `wwcr-glow-${uid}`;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={styles.ring}
      aria-hidden="true"
      data-countdown-ring=""
      data-celebrate={celebrate ? "pending" : undefined}
    >
      <svg
        className={styles.ringSvg}
        viewBox="0 140 390 192"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--ww-ring-start, #52E5B8)" }} />
            <stop offset="1" style={{ stopColor: "var(--ww-ring-end, #FFCF4A)" }} />
          </linearGradient>
          {/* R-057: soft Minze halo that fades to 0 before the viewBox edge (r 96 = distance of
              the centre to the top edge) – no hard cut under the tabs, no brownish disc. */}
          <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
            <stop
              offset="0"
              style={{ stopColor: "var(--ww-ring-start, #52E5B8)" }}
              stopOpacity=".08"
            />
            <stop
              offset="0.66"
              style={{ stopColor: "var(--ww-ring-start, #52E5B8)" }}
              stopOpacity=".22"
            />
            <stop
              offset="0.84"
              style={{ stopColor: "var(--ww-ring-start, #52E5B8)" }}
              stopOpacity=".07"
            />
            <stop
              offset="1"
              style={{ stopColor: "var(--ww-ring-start, #52E5B8)" }}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>
        <g data-anim="glow">
          <circle cx="195" cy="236" r="96" fill={`url(#${glow})`} />
        </g>
        <g data-anim="confetti">
          <g data-piece="1">
            <rect
              x="34"
              y="176"
              width="9"
              height="15"
              rx="3"
              fill="#52E5B8"
              transform="rotate(-24 38 183)"
            />
          </g>
          <g data-piece="2">
            <rect
              x="76"
              y="232"
              width="8"
              height="13"
              rx="3"
              fill="#FFCF4A"
              transform="rotate(18 80 238)"
            />
          </g>
          <g data-piece="3">
            <circle cx="56" cy="286" r="5" fill="#A79AF2" />
          </g>
          <g data-piece="4">
            <rect
              x="92"
              y="170"
              width="8"
              height="12"
              rx="3"
              fill="#F0503F"
              transform="rotate(40 96 176)"
            />
          </g>
          <g data-piece="5">
            <rect
              x="22"
              y="236"
              width="8"
              height="12"
              rx="3"
              fill="#FFFFFF"
              transform="rotate(-12 26 242)"
            />
          </g>
          <g data-piece="6">
            <rect
              x="300"
              y="174"
              width="9"
              height="15"
              rx="3"
              fill="#FFCF4A"
              transform="rotate(22 304 181)"
            />
          </g>
          <g data-piece="7">
            <rect
              x="346"
              y="226"
              width="8"
              height="13"
              rx="3"
              fill="#52E5B8"
              transform="rotate(-30 350 232)"
            />
          </g>
          <g data-piece="8">
            <circle cx="334" cy="292" r="5" fill="#F0503F" />
          </g>
          <g data-piece="9">
            <rect
              x="290"
              y="240"
              width="8"
              height="12"
              rx="3"
              fill="#A79AF2"
              transform="rotate(-12 294 246)"
            />
          </g>
          <g data-piece="10">
            <rect
              x="358"
              y="176"
              width="8"
              height="12"
              rx="3"
              fill="#FFFFFF"
              transform="rotate(30 362 182)"
            />
          </g>
          <g data-piece="11">
            <rect
              x="128"
              y="150"
              width="11"
              height="2.5"
              rx="1.25"
              fill="#FFCF4A"
              transform="rotate(-35 133 151)"
            />
          </g>
          <g data-piece="12">
            <rect
              x="252"
              y="146"
              width="11"
              height="2.5"
              rx="1.25"
              fill="#52E5B8"
              transform="rotate(30 257 147)"
            />
          </g>
        </g>
        <circle
          cx="195"
          cy="236"
          r="66"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity=".14"
          strokeWidth="12"
        />
        <g data-anim="ring">
          <path
            data-ring-fill=""
            d="M195 170a66 66 0 1 1 0 132a66 66 0 1 1 0-132"
            pathLength={100}
            fill="none"
            stroke={`url(#${gradient})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${String(p)} 100`}
            strokeDashoffset="0"
          />
        </g>
        <g data-anim="knob">
          <g transform={`rotate(${String(p * 3.6)} 195 236)`}>
            <circle
              data-knob-dot=""
              cx="195"
              cy="170"
              r="9"
              strokeWidth="3"
              style={{
                fill: "var(--ww-ring-knob, #FFCF4A)",
                stroke: "var(--ww-ring-knob-edge, #2B2266)",
              }}
            />
          </g>
        </g>
        <g data-anim="sparkles">
          <path d="M70 196l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#52E5B8" />
          <path d="M322 200l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#FFFFFF" />
          <path
            d="M104 296l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"
            fill="#FFCF4A"
          />
        </g>
      </svg>
      <p className={styles.countdown}>{label}</p>
    </div>
  );
}
