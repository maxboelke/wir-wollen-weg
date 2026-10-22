"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Heading that takes the focus once when `focus` is set – e.g. the trip name after
 * «Festlegung aufheben» (ux-spec §14.4) – and removes the trigger parameter from the URL so a
 * reload stays quiet.
 */
export function FocusHeading({
  focus,
  param,
  className,
  children,
}: {
  focus: boolean;
  param: string;
  className?: string | undefined;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (!focus) return;
    ref.current?.focus();
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [focus, param]);
  return (
    <h1 ref={ref} className={className} tabIndex={-1}>
      {children}
    </h1>
  );
}
