"use client";

import { useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => undefined;

/**
 * True while React hydrates server-rendered HTML (first page load), false for components
 * that mount on the client later (client navigation, new step). The server snapshot is only
 * used during hydration – the standard way to tell both apart without an effect.
 */
export function useIsHydrating(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true,
  );
}

/**
 * Whether this component instance was first rendered as part of hydration – i.e. its
 * content was already painted from the server HTML. Entrances must not play then (R-017):
 * content the user can already see never disappears to be faded in again.
 */
export function useWasServerPainted(): boolean {
  const hydrating = useIsHydrating();
  const [painted] = useState(hydrating);
  return painted;
}
