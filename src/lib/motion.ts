/**
 * Motion helper (F-052, docs/motion/motion-system.md §8): Web Animations API, no library.
 * Rules: animate only `transform` and `opacity`; every animation checks reduced motion
 * (system `prefers-reduced-motion` OR `<html data-motion="reduce">`, set from the account
 * switch / cookie) and then either skips (end state = CSS state) or only cross-fades.
 * Values mirror tokens.css §6 – drift check in motion.test.ts.
 */

export const MOTION_COOKIE = "ww-motion";
const MOTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export const DURATION = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 320,
  moderate: 480,
  celebrate: 700,
  /** Pure cross-fade – stays with reduced motion (M-D2). */
  fade: 140,
} as const;

export const DISTANCE = { sm: 8, md: 16, lg: 24 } as const;
export const SCALE = { press: 0.97, cell: 0.94, enter: 0.96, pop: 0.6 } as const;
export const STAGGER = { cell: 12, item: 40, card: 60, max: 400 } as const;

const SPRING_SOFT_LINEAR =
  "linear(0, 0.052 5%, 0.174 10%, 0.325 15%, 0.478 20%, 0.619 25%, 0.738 30%, 0.833 35%, 0.906 40%, 0.991 50%, 1.024 60%, 1.028 70%, 1.021 80%, 1.013 90%, 1)";
const SPRING_BOUNCY_LINEAR =
  "linear(0, 0.116 5%, 0.372 10%, 0.657 15%, 0.898 20%, 1.061 25%, 1.145 30%, 1.163 35%, 1.139 40%, 1.095 45%, 1.049 50%, 0.987 60%, 0.974 70%, 0.986 80%, 0.999 90%, 1)";

export const EASING = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  enter: "cubic-bezier(0, 0, 0, 1)",
  exit: "cubic-bezier(0.3, 0, 1, 1)",
  emphasized: "cubic-bezier(0.05, 0.7, 0.1, 1)",
  springSoft: "cubic-bezier(0.34, 1.3, 0.64, 1)",
  springBouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Springs as `linear()` where supported (same fallback logic as tokens.css). */
export function spring(kind: "soft" | "bouncy"): string {
  const supported =
    typeof CSS !== "undefined" && CSS.supports("transition-timing-function", "linear(0, 1)");
  if (kind === "soft") return supported ? SPRING_SOFT_LINEAR : EASING.springSoft;
  return supported ? SPRING_BOUNCY_LINEAR : EASING.springBouncy;
}

export interface MotionEnvironment {
  matchMedia?: ((query: string) => { matches: boolean }) | undefined;
  root?: { dataset: DOMStringMap } | undefined;
}

function browserEnvironment(): MotionEnvironment {
  if (typeof window === "undefined") return {};
  return { matchMedia: window.matchMedia.bind(window), root: document.documentElement };
}

/** True when motion must be reduced: system setting OR `data-motion="reduce"` (F-052). */
export function prefersReducedMotion(env: MotionEnvironment = browserEnvironment()): boolean {
  if (env.root?.dataset.motion === "reduce") return true;
  return env.matchMedia?.(REDUCE_QUERY).matches ?? false;
}

const ALLOWED_PROPERTIES = new Set(["transform", "opacity", "offset", "easing", "composite"]);

/** Guards the performance rule "only transform and opacity" (motion-system §7.1). */
export function assertCompositorOnly(keyframes: Keyframe[]): void {
  for (const frame of keyframes) {
    for (const key of Object.keys(frame)) {
      if (!ALLOWED_PROPERTIES.has(key)) {
        throw new Error(`motion: only transform/opacity may be animated, got "${key}"`);
      }
    }
  }
}

/**
 * Runs a WAAPI animation unless motion is reduced. Returns null when skipped – the element
 * then simply shows its CSS end state (state first, motion second, motion-system §5.1).
 */
export function animate(
  element: Element | null | undefined,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  assertCompositorOnly(keyframes);
  if (!element || typeof element.animate !== "function" || prefersReducedMotion()) return null;
  return element.animate(keyframes, options);
}

export interface EnterOptions {
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  easing?: string;
}

/**
 * Entrance: fade + optional slide/scale. With reduced motion only the cross-fade
 * (`DURATION.fade`) remains – never a slide (motion-system §6.2).
 */
export function enter(element: Element | null | undefined, options: EnterOptions = {}) {
  if (!element || typeof element.animate !== "function") return null;
  const reduced = prefersReducedMotion();
  const from: Keyframe = { opacity: 0 };
  const to: Keyframe = { opacity: 1 };
  const transforms: string[] = [];
  if (!reduced) {
    if (options.x) transforms.push(`translateX(${options.x}px)`);
    if (options.y) transforms.push(`translateY(${options.y}px)`);
    if (options.scale !== undefined) transforms.push(`scale(${options.scale})`);
  }
  if (transforms.length > 0) {
    from.transform = transforms.join(" ");
    to.transform = "none";
  }
  return element.animate([from, to], {
    duration: reduced ? DURATION.fade : (options.duration ?? DURATION.base),
    delay: reduced ? 0 : (options.delay ?? 0),
    easing: reduced ? "linear" : (options.easing ?? EASING.enter),
    fill: "backwards",
  });
}

/** Staggered delay for item i, capped at `--ww-stagger-max` (motion-system §3). */
export function staggerDelay(index: number, step: number, max: number = STAGGER.max): number {
  return Math.min(Math.max(0, index) * step, max);
}

/** Code field "wrong code" (W02-04): one horizontal shake of 4 px; none when reduced. */
export function shake(element: Element | null | undefined) {
  return animate(
    element,
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(-2px)" },
      { transform: "translateX(0)" },
    ],
    { duration: DURATION.base, easing: EASING.standard },
  );
}

/** Reads the stored choice from a `Cookie` header or `document.cookie`. */
export function motionCookieReduces(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim() === `${MOTION_COOKIE}=reduce`);
}

/** Applies the effective preference (cookie OR system) to `<html data-motion>`. */
export function syncMotionAttribute(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const reduce = motionCookieReduces(document.cookie) || window.matchMedia(REDUCE_QUERY).matches;
  if (reduce) root.dataset.motion = "reduce";
  else delete root.dataset.motion;
}

/**
 * Stores the account/device choice "Reduce motion" (Q17). It can only reduce: `false`
 * means "follow the device". Increment 1 also saves it in the account (F-043).
 */
export function setMotionPreference(reduce: boolean): void {
  document.cookie = reduce
    ? `${MOTION_COOKIE}=reduce; Path=/; Max-Age=${MOTION_COOKIE_MAX_AGE}; SameSite=Lax`
    : `${MOTION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  syncMotionAttribute();
}

/** Subscribes to system changes of prefers-reduced-motion; returns an unsubscribe function. */
export function watchSystemMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCE_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/**
 * Inline `<head>` script: sets `data-motion="reduce"` before the first paint (no flash of
 * motion) and `data-js` (JavaScript runs – entrances may start hidden, R-017). Keep it tiny
 * and dependency-free; it mirrors `syncMotionAttribute`.
 */
export const MOTION_BOOTSTRAP_SCRIPT = `(function(){try{var d=document.documentElement;d.setAttribute("data-js","");if(/(?:^|;\\s*)${MOTION_COOKIE}=reduce(?:;|$)/.test(document.cookie)||matchMedia("${REDUCE_QUERY}").matches)d.setAttribute("data-motion","reduce")}catch(e){}})();`;
