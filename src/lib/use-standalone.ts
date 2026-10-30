"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(display-mode: standalone)";

/** Installed web app (W23 B.1): standalone display mode or iOS `navigator.standalone`. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia(QUERY).matches || nav.standalone === true;
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}

/** `true` inside the installed app; always `false` on the server and before hydration. */
export function useStandalone(): boolean {
  return useSyncExternalStore(subscribe, isStandalone, () => false);
}
