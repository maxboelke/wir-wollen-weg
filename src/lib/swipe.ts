/**
 * Card gesture of «Unterkünfte bewerten» (motion interaktionen.md W18-A, motion-system §3.5).
 * Pure numbers and decisions – the component only reads pointer events and writes transforms.
 */

export const SWIPE = {
  /** Gesture starts after 8 px; then |dx| > |dy| → drag, else the page scrolls. */
  slopPx: 8,
  /** pointerdown in the outer 16 px of the viewport is ignored (iOS back swipe). */
  edgePx: 16,
  rotateDivisor: 18,
  rotateMax: 12,
  commitRatio: 0.3,
  commitMinPx: 80,
  commitMaxPx: 140,
  flickPxPerMs: 0.6,
  flickMinPx: 24,
  velocityWindowMs: 80,
  stampStartPx: 16,
  exitRatio: 1.2,
  exitMinSpeed: 1.2,
  exitMinMs: 140,
  exitMaxMs: 220,
} as const;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Commit threshold: 0.3 × card width, clamped to 80–140 px. */
export function threshold(cardWidth: number): number {
  return clamp(cardWidth * SWIPE.commitRatio, SWIPE.commitMinPx, SWIPE.commitMaxPx);
}

/** Rotation while dragging: tx / 18, max ±12° (none with reduced motion). */
export function dragRotation(tx: number, reduced: boolean): number {
  return reduced ? 0 : clamp(tx / SWIPE.rotateDivisor, -SWIPE.rotateMax, SWIPE.rotateMax);
}

/** Stamp opacity: nothing in the first 16 px, full at the threshold. */
export function stampOpacity(tx: number, thr: number): number {
  return clamp((Math.abs(tx) - SWIPE.stampStartPx) / (thr - SWIPE.stampStartPx), 0, 1);
}

export interface VelocitySample {
  t: number;
  x: number;
}

/** px/ms over the last 80 ms before release; 0 when the finger rested longer. */
export function velocity(samples: readonly VelocitySample[], now: number): number {
  const recent = samples.filter((s) => now - s.t <= SWIPE.velocityWindowMs);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last || recent.length < 2) return 0;
  const dt = last.t - first.t;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/**
 * Decision on release (W18-A): (1) a flick (≥ 0.6 px/ms and ≥ 24 px) decides by its direction –
 * against the drag direction springs back; (2) otherwise ≥ threshold commits; (3) else springs
 * back. Returns +1 (like), −1 (pass) or 0 (spring back).
 */
export function decide(tx: number, vx: number, thr: number): -1 | 0 | 1 {
  if (Math.abs(vx) >= SWIPE.flickPxPerMs && Math.abs(tx) >= SWIPE.flickMinPx) {
    return vx > 0 === tx > 0 ? (tx > 0 ? 1 : -1) : 0;
  }
  if (Math.abs(tx) >= thr) return tx > 0 ? 1 : -1;
  return 0;
}

/** Duration of the fly-out after a gesture: keeps the swing, 140–220 ms, linear. */
export function exitDuration(remaining: number, vx: number): number {
  return clamp(
    Math.abs(remaining) / Math.max(Math.abs(vx), SWIPE.exitMinSpeed),
    SWIPE.exitMinMs,
    SWIPE.exitMaxMs,
  );
}
