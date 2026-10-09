"use client";

import { useEffect } from "react";

/**
 * F-051: opened via anchor (`/de/hilfe#code`), that question is expanded and focus lies on
 * its summary – also when the hash changes on the page. Without JavaScript the anchor still
 * scrolls to the (closed) question.
 */
export function HelpAnchors() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      const summary = target.querySelector("summary");
      summary?.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => {
      window.removeEventListener("hashchange", open);
    };
  }, []);
  return null;
}
