"use client";

import { useLayoutEffect } from "react";

/**
 * Moves the focus once to an element (e.g. the trip name h1 of the cockpit right after
 * «Termin festlegen», M-U10) and removes the trigger parameter so a reload stays quiet.
 */
export function FocusOnParam({ targetId, param }: { targetId: string; param: string }) {
  useLayoutEffect(() => {
    document.getElementById(targetId)?.focus();
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [targetId, param]);
  return null;
}
