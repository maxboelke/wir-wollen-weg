"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DURATION, EASING, prefersReducedMotion } from "@/lib/motion";
import { useWasServerPainted } from "@/lib/use-hydration";

/**
 * G-20: the KPI ring draws from 0 to its value (12 o'clock, clockwise) the first time it
 * appears in a session – only when it appears on the client (navigation), never over
 * server-painted HTML (R-017). The number next to it is there at once (G-16).
 * `stroke-dasharray` is the documented exception for rings (design-system §8.3).
 */
export function RingDraw({ sessionKey, children }: { sessionKey: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const serverPainted = useWasServerPainted();
  useLayoutEffect(() => {
    if (serverPainted || prefersReducedMotion()) return;
    const key = `ww-anim:${sessionKey}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    const fill = ref.current?.querySelector<SVGCircleElement>("[data-ring-fill]");
    const dash = fill?.getAttribute("stroke-dasharray");
    if (!fill || !dash) return;
    const total = dash.split(" ")[1] ?? "0";
    fill.animate([{ strokeDasharray: `0 ${total}` }, { strokeDasharray: dash }], {
      duration: DURATION.moderate,
      easing: EASING.standard,
    });
  }, [serverPainted, sessionKey]);
  return <div ref={ref}>{children}</div>;
}
