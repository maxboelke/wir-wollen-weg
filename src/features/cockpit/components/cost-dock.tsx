"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Tile } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import type { DockView } from "../types";
import styles from "./cost-dock.module.css";

/** Selector of the anchor: the tile «Kosten» in «Immer griffbereit». */
const TILE = '[data-return-key="tile:costs"]';
/** Hysteresis (W16 v2.17): show again only when the tile is 24 px further down. */
const HYSTERESIS = 24;

type Mode = "pending" | "shown" | "hidden";

/**
 * Cost shortcut bar (W16 v2.17 «Fassung 2», D-81, UM-26): during the trip a bar at the bottom
 * gives quick access – left «Kosten · Verlauf ›» with the own result (its own tap target → all
 * expenses), right a compact `[+ Ausgabe]` (Danach: `[Ausgleichen]`). It is ONLY a shortcut to
 * the tile «Kosten»: as soon as the tile is visible above the bar, the bar slides away, and it
 * comes back when the tile leaves the view downwards again (IntersectionObserver, no scroll
 * listeners). Hidden = `inert` + `visibility: hidden`; never while the keyboard focus is in it.
 *
 * In the DOM it stands right after the ticket head (keyboard and screen readers reach it early).
 * Static card instead of a fixed bar (variant A): ≥ 960 px, low windows (< 560 px) and when the
 * bar would be taller than 20 % of the window (200 % text) – then nothing hides.
 */
export function CostDock({ dock }: { dock: DockView }) {
  const t = useTranslations("route");
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [tall, setTall] = useState(false);
  // Transitions only after the first decision – the bar is «always there» on load (UM-26).
  const [animated, setAnimated] = useState(false);
  const wantHidden = useRef(false);

  useEffect(() => {
    if (mode === "pending" || animated) return;
    const frame = requestAnimationFrame(() => {
      setAnimated(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [mode, animated]);

  // Back from «Ausgabe speichern» (W19 D.5.6): focus on «+ Ausgabe» (the bar shows for it –
  // focus protection keeps it there), then drop the parameter.
  const focusAdd = useRef(false);
  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("focus") !== "add-expense") return;
    focusAdd.current = true;
    url.searchParams.delete("focus");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  useLayoutEffect(() => {
    if (!focusAdd.current || mode === "pending") return;
    focusAdd.current = false;
    if (mode === "hidden") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- show the bar for the focus
      setMode("shown");
      focusAdd.current = true;
      return;
    }
    ref.current?.querySelector<HTMLElement>('[data-dock-action="add-expense"]')?.focus();
  }, [mode]);

  // Rückfall (variant A): taller than 20 % of the window → static card under the head.
  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const check = () => {
      setTall(bar.offsetHeight > window.innerHeight * 0.2);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(bar);
    window.addEventListener("resize", check);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  // Shortcut logic: hide once the tile is visible above the bar, show again below + 24 px.
  useEffect(() => {
    const bar = ref.current;
    const tile = document.querySelector(TILE);
    if (!bar) return;
    const fixed = () => getComputedStyle(bar).position === "fixed";
    if (!tile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no anchor: always shown
      setMode("shown");
      return;
    }
    const apply = (hide: boolean) => {
      wantHidden.current = hide;
      // Focus protection: never hide while the keyboard focus is inside the bar.
      if (hide && bar.contains(document.activeElement)) return;
      setMode(hide ? "hidden" : "shown");
    };
    const height = () => Math.round(bar.getBoundingClientRect().height);
    let hideObserver: IntersectionObserver | null = null;
    let showObserver: IntersectionObserver | null = null;
    const observe = () => {
      hideObserver?.disconnect();
      showObserver?.disconnect();
      const h = height();
      hideObserver = new IntersectionObserver(
        ([entry]) => {
          if (!fixed()) {
            apply(false);
            return;
          }
          if (entry?.isIntersecting) apply(true);
          else if (!wantHidden.current) apply(false);
        },
        { rootMargin: `0px 0px -${String(h)}px 0px` },
      );
      showObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry || entry.isIntersecting || !fixed()) return;
          // Only when the tile left the view DOWNWARDS (scrolling up), not past the top.
          const bottom = entry.rootBounds?.bottom ?? window.innerHeight;
          if (entry.boundingClientRect.top >= bottom) apply(false);
        },
        { rootMargin: `0px 0px -${String(Math.max(0, h - HYSTERESIS))}px 0px` },
      );
      hideObserver.observe(tile);
      showObserver.observe(tile);
    };
    observe();
    const onFocusOut = () => {
      requestAnimationFrame(() => {
        if (wantHidden.current && !bar.contains(document.activeElement)) setMode("hidden");
      });
    };
    bar.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", observe);
    return () => {
      hideObserver?.disconnect();
      showObserver?.disconnect();
      bar.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", observe);
    };
  }, [tall]);

  // The snackbar rises above the visible bar (8 px); a hidden or static bar frees the space.
  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const root = document.documentElement;
    const update = () => {
      const fixed = getComputedStyle(bar).position === "fixed";
      root.style.setProperty("--ww-dock-h", fixed ? `${String(bar.offsetHeight)}px` : "0px");
      root.style.setProperty(
        "--ww-sticky-bar-h",
        fixed && mode === "shown" ? `${String(bar.offsetHeight)}px` : "0px",
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      root.style.removeProperty("--ww-sticky-bar-h");
      root.style.removeProperty("--ww-dock-h");
    };
  }, [mode, tall]);

  const status = dock.status;
  return (
    <aside
      ref={ref}
      className={cx(styles.dock, tall && styles.static, animated && styles.animated)}
      aria-label={t("dock.label")}
      data-cost-dock={mode}
      data-dock-kind={dock.kind}
      inert={mode === "hidden" || undefined}
    >
      <Link
        href={dock.costsHref}
        className={styles.stand}
        aria-label={t("dock.name", { status })}
        data-dock-costs=""
      >
        <Tile icon="wallet" tone="sun" size="sm" className={styles.tile} />
        <span className={styles.text}>
          <span className={styles.title}>
            {t("dock.title")}
            <Icon name="chevron-right" size={16} />
          </span>
          <span className={cx(styles.status, styles[dock.tone])}>{status}</span>
        </span>
      </Link>
      {dock.kind === "add" ? (
        <Link
          href={dock.actionHref}
          className={styles.action}
          aria-label={t("dock.addName")}
          data-dock-action="add-expense"
        >
          <Icon name="plus" size={20} />
          <span>{t("dock.add")}</span>
        </Link>
      ) : (
        <Link href={dock.actionHref} className={styles.action} data-dock-action="settle">
          <Icon name="wallet" size={20} />
          <span>{t("dock.settle")}</span>
        </Link>
      )}
    </aside>
  );
}
