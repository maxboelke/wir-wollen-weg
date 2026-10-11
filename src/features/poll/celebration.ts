import { DURATION, EASING, prefersReducedMotion, spring, STAGGER } from "@/lib/motion";

/**
 * «Es geht los!» – the «Vorfreude» ring celebration (F-012, Q17 b, motion W11-02 timeline,
 * design-system §9.12). Loaded on demand (dynamic import) – no confetti code in the normal
 * bundle (F-052). Rules:
 * - text, date, countdown number and buttons are there at once – nothing waits (G-16: the
 *   number never counts up); only decorative layers move (`aria-hidden`, no pointer events);
 * - core ≤ 1 s, confetti fade-out ≤ 2.6 s, hard end at `CELEBRATION_MAX_MS`;
 * - every interaction (tap, wheel, swipe, key) and a hidden tab finish it in the end state;
 * - vibration only when the sun dot locks in (Android, best effort, never reduced, G-18);
 * - reduced motion (system or account switch): a 140 ms cross-fade, nothing else.
 */

export const CELEBRATION_MAX_MS = 2600;
const T = { glow: 60, ring: 80, ringDuration: 700, pieces: 120, bar: 300, land: 780, sparks: 800 };
/** Ring geometry of countdown-ring.svg: centre (195, 236), radius 66, viewBox width 390. */
const RING = { cx: 195, cy: 236, r: 66, width: 390 };

/** Cubic Bézier as a function – precomputes keyframes so ring and sun dot stay locked. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 26; i++) {
      t = (lo + hi) / 2;
      const bx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
      if (bx < x) lo = t;
      else hi = t;
    }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}
const easeStandard = bezier(0.2, 0, 0, 1);

/**
 * «Ehrenrunde»: the head runs one lap plus p %, the fill follows as a tail with 12 % lag and
 * ends exactly at p from 12 o'clock (dash period = path length 100 → seamless over 12).
 */
export function ringKeyframes(percent: number, steps = 28) {
  const ring: Keyframe[] = [];
  const knob: Keyframe[] = [];
  const lag = 0.12;
  const end = percent * 3.6;
  for (let s = 0; s <= steps; s++) {
    const x = s / steps;
    const head = (100 + percent) * easeStandard(x);
    const tail = 100 * easeStandard(Math.max(0, (x - lag) / (1 - lag)));
    const length = Math.min(100, Math.max(0, head - tail));
    ring.push({
      offset: x,
      strokeDasharray: `${length.toFixed(2)} ${(100 - length).toFixed(2)}`,
      strokeDashoffset: (-tail).toFixed(2),
    });
    knob.push({ offset: x, transform: `rotate(${(head * 3.6 - end).toFixed(1)}deg)` });
  }
  return { ring, knob };
}

export interface CelebrationTargets {
  /** Container of the ring (`data-countdown-ring`, position: relative). */
  ring: HTMLElement;
  /** Result card – only animated when it was not painted from the server (R-017). */
  card?: HTMLElement | null | undefined;
  /** «Steht fest» step bar in the card. */
  bar?: HTMLElement | null | undefined;
  percent: number;
  animateCard: boolean;
}

export interface Celebration {
  finish: () => void;
}

/** Starts the celebration; returns a handle to finish it at once (end state). */
export function celebrate(targets: CelebrationTargets): Celebration {
  const { ring: root, percent } = targets;
  const running: Animation[] = [];
  const timers: number[] = [];
  let burst: { layer: HTMLElement; animations: Animation[] } | null = null;
  let done = false;
  const track = (animation: Animation | null | undefined) => {
    if (animation) running.push(animation);
  };

  const cleanup = () => {
    for (const type of ["pointerdown", "wheel", "touchmove", "keydown"] as const) {
      window.removeEventListener(type, finish, { capture: true });
    }
    document.removeEventListener("visibilitychange", onVisibility);
  };
  const stopBurst = (now: boolean) => {
    const current = burst;
    burst = null;
    if (!current) return;
    if (now) {
      current.animations.forEach((animation) => {
        animation.cancel();
      });
      current.layer.remove();
      return;
    }
    const fade = current.layer.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: DURATION.fast,
      fill: "forwards",
    });
    fade.onfinish = () => {
      current.animations.forEach((animation) => {
        animation.cancel();
      });
      current.layer.remove();
    };
  };
  function finish() {
    if (done) return;
    done = true;
    timers.forEach((timer) => {
      window.clearTimeout(timer);
    });
    running.forEach((animation) => {
      try {
        animation.finish();
      } catch {
        // already cancelled
      }
    });
    stopBurst(false);
    cleanup();
  }
  function onVisibility() {
    if (document.hidden) finish();
  }

  // The CSS failsafe hid the layers before the first paint; from here WAAPI (fill: backwards)
  // keeps them in their start state.
  root.removeAttribute("data-celebrate");

  if (prefersReducedMotion()) {
    // Only cross-fades (W11-02 «Reduziert»): ring box and – if client-rendered – the card.
    track(root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION.fade }));
    if (targets.animateCard && targets.card) {
      track(targets.card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION.fade }));
    }
    done = true;
    return { finish: () => undefined };
  }

  const layer = (name: string) => root.querySelector<SVGGElement>(`[data-anim="${name}"]`);
  const all = (selector: string) => [...root.querySelectorAll<SVGElement>(selector)];
  for (const element of all("[data-anim='glow'], [data-piece], [data-anim='sparkles'] path")) {
    element.style.transformBox = "fill-box";
    element.style.transformOrigin = "center";
  }
  const knob = layer("knob");
  if (knob) {
    knob.style.transformBox = "view-box";
    knob.style.transformOrigin = `${String(RING.cx)}px ${String(RING.cy)}px`;
  }
  const dot = root.querySelector<SVGCircleElement>("[data-knob-dot]");
  if (dot) {
    dot.style.transformBox = "fill-box";
    dot.style.transformOrigin = "center";
  }

  if (targets.animateCard && targets.card) {
    track(
      targets.card.animate(
        [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: DURATION.base, easing: EASING.enter, fill: "backwards" },
      ),
    );
  }
  const soft = spring("soft");
  track(
    layer("glow")?.animate(
      [
        { opacity: 0, transform: "scale(0.7)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: DURATION.moderate, delay: T.glow, easing: soft, fill: "backwards" },
    ),
  );
  // The ring is the documented exception to «only transform/opacity» (design-system §8.3).
  const frames = ringKeyframes(percent);
  track(
    root.querySelector("[data-ring-fill]")?.animate(frames.ring, {
      duration: T.ringDuration,
      delay: T.ring,
      easing: "linear",
      fill: "backwards",
    }),
  );
  track(
    knob?.animate(frames.knob, {
      duration: T.ringDuration,
      delay: T.ring,
      easing: "linear",
      fill: "backwards",
    }),
  );
  track(
    dot?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
      { duration: DURATION.base, delay: T.land, easing: soft },
    ),
  );
  track(
    targets.bar?.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: DURATION.moderate,
      delay: T.bar,
      easing: EASING.standard,
      fill: "backwards",
    }),
  );
  all("[data-piece]").forEach((piece, i) => {
    const fall = 90 + ((i * 37) % 70);
    const dx = ((i * 29) % 30) - 15;
    const rotation = (i % 2 ? 1 : -1) * (120 + ((i * 53) % 120));
    track(
      piece.animate(
        [
          {
            opacity: 0,
            transform: `translate(${String(dx)}px, ${String(-fall)}px) rotate(${String(rotation)}deg)`,
          },
          {
            opacity: 1,
            offset: 0.25,
            transform: `translate(${(dx * 0.4).toFixed(1)}px, ${(-fall * 0.55).toFixed(1)}px) rotate(${(rotation * 0.5).toFixed(0)}deg)`,
          },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 1100 + ((i * 71) % 400),
          delay: T.pieces + i * STAGGER.item,
          easing: EASING.standard,
          fill: "backwards",
        },
      ),
    );
  });
  all("[data-anim='sparkles'] path").forEach((spark, i) => {
    track(
      spark.animate(
        [
          { opacity: 0, transform: "scale(0)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: DURATION.base, delay: T.sparks + i * 60, easing: soft, fill: "backwards" },
      ),
    );
  });

  timers.push(
    window.setTimeout(() => {
      if (done) return;
      // G-18: the only vibration of the celebration – Android, best effort, never with
      // reduced motion (checked above), never a sound.
      try {
        if ("vibrate" in navigator) navigator.vibrate(15);
      } catch {
        // ignored (no user activation, unsupported)
      }
      burst = puff(root, percent);
    }, T.land),
  );
  timers.push(window.setTimeout(finish, CELEBRATION_MAX_MS));
  for (const type of ["pointerdown", "wheel", "touchmove", "keydown"] as const) {
    window.addEventListener(type, finish, { capture: true, passive: true });
  }
  document.addEventListener("visibilitychange", onVisibility);
  return { finish };
}

/**
 * Confetti puff from the sun dot (W11-02 at 780 ms): ≤ 24 pieces on phones, ≤ 40 from 600 px,
 * fan upwards ± 75°, gravity, spin, fades out from 70 % – precomputed, transform/opacity only.
 */
function puff(root: HTMLElement, percent: number) {
  const svg = root.querySelector("svg");
  if (!svg) return null;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.burst = "";
  root.appendChild(layer);
  const box = svg.getBoundingClientRect();
  const own = root.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const scale = box.width / (viewBox.width || RING.width);
  const angle = (percent * 3.6 * Math.PI) / 180;
  const ox = box.left - own.left + (RING.cx + RING.r * Math.sin(angle) - viewBox.x) * scale;
  const oy = box.top - own.top + (RING.cy - RING.r * Math.cos(angle) - viewBox.y) * scale;
  const styles = getComputedStyle(root);
  const colors = [1, 2, 3, 4, 5].map((n) =>
    styles.getPropertyValue(`--ww-confetti-${String(n)}`).trim(),
  );
  const count = window.innerWidth < 600 ? 24 : 40;
  const animations: Animation[] = [];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("i");
    const shape = i % 4;
    const [w, h] =
      shape === 0 ? [9, 14] : shape === 1 ? [10, 10] : shape === 2 ? [11, 2.5] : [12, 12];
    piece.style.width = `${String(w)}px`;
    piece.style.height = `${String(h)}px`;
    piece.style.marginLeft = `${String(-w / 2)}px`;
    piece.style.marginTop = `${String(-h / 2)}px`;
    piece.style.background = colors[i % colors.length] ?? "currentColor";
    if (shape === 0) piece.style.borderRadius = "3px";
    if (shape === 1) piece.style.borderRadius = "50%";
    if (shape === 2) piece.style.borderRadius = "1.25px";
    if (shape === 3) {
      piece.style.clipPath =
        "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)";
    }
    layer.appendChild(piece);
    const direction = ((-90 + (Math.random() * 150 - 75)) * Math.PI) / 180;
    const speed = 260 + Math.random() * 300;
    const vx = Math.cos(direction) * speed;
    const vy = Math.sin(direction) * speed;
    const duration = 1200 + Math.random() * 500;
    const gravity = 1100;
    const r0 = Math.random() * 360;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360);
    const keyframes: Keyframe[] = [];
    for (let s = 0; s <= 10; s++) {
      const f = s / 10;
      const t = (duration * f) / 1000;
      const x = ox + vx * t * (1 - 0.25 * f);
      const y = oy + vy * t + 0.5 * gravity * t * t;
      keyframes.push({
        transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(r0 + spin * f).toFixed(0)}deg)`,
        opacity: f < 0.7 ? 1 : Number(((1 - f) / 0.3).toFixed(2)),
      });
    }
    const animation = piece.animate(keyframes, {
      duration,
      delay: Math.random() * 60,
      easing: "linear",
      fill: "both",
    });
    animations.push(animation);
  }
  void Promise.all(animations.map((a) => a.finished.catch(() => undefined))).then(() => {
    layer.remove();
  });
  return { layer, animations };
}
