"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { DISTANCE, DURATION, EASING, animate, enter, prefersReducedMotion } from "@/lib/motion";
import { useWasServerPainted } from "@/lib/use-hydration";
import styles from "./trip-cockpit.module.css";

/**
 * Compact cockpit head that sticks while scrolling (B-3, W07-06): row 1 + tabs stay, the
 * KPI below scrolls away with the content – no height animation; only the shadow fades in
 * once the head is stuck (pseudo-element opacity, never `box-shadow` transitions).
 */
export function StickyHead({ children, tail }: { children: ReactNode; tail: boolean }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useLayoutEffect(() => {
    const element = sentinel.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setStuck(entry ? !entry.isIntersecting : false);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />
      <div
        className={cx(styles.head, tail && !stuck && styles.headWithTail, stuck && styles.stuck)}
      >
        {children}
      </div>
    </>
  );
}

export interface TabLink {
  key: string;
  href: string;
  label: string;
}

const TAB_KEY = "ww-tab-from";
const TAB_FRESH_MS = 2000;

interface TabMove {
  from: number;
  to: number;
  at: number;
}

function readMove(): TabMove | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(TAB_KEY) ?? "null") as TabMove | null;
    return value && Date.now() - value.at < TAB_FRESH_MS ? value : null;
  } catch {
    return null;
  }
}

/**
 * Trip tabs as links with `aria-current` (ux-spec §3, §7.4). G-02: only after a TAP on a tab
 * (not on direct loads, back navigation or default-tab redirects – M-U11) the white pill
 * glides from the previous tab (FLIP on `::before`, translate + scaleX) and the label colour
 * switches at once. Reduced motion: the pill simply jumps.
 */
export function TabNav({
  tabs,
  current,
  label,
}: {
  tabs: TabLink[];
  current: string;
  label: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const serverPainted = useWasServerPainted();
  const currentIndex = tabs.findIndex((tab) => tab.key === current);
  const [edges, setEdges] = useState<{ start: boolean; end: boolean }>({
    start: false,
    end: false,
  });

  // Fade edges only while the track overflows (D-33): start/end hint at hidden tabs.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => {
      const max = nav.scrollWidth - nav.clientWidth;
      setEdges({ start: nav.scrollLeft > 1, end: max - nav.scrollLeft > 1 });
    };
    update();
    nav.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(nav);
    return () => {
      nav.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const links = list.querySelectorAll<HTMLAnchorElement>("a");
    const active = links[currentIndex];
    // Active tab in view when the track scrolls (< 375 px, D-33).
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (serverPainted) return;
    const move = readMove();
    if (!move || move.to !== currentIndex || move.from === currentIndex) return;
    const previous = links[move.from];
    if (!active || !previous) return;
    const from = previous.getBoundingClientRect();
    const to = active.getBoundingClientRect();
    animate(
      active,
      [
        {
          transform: `translateX(${String(from.left - to.left)}px) scaleX(${String(from.width / to.width)})`,
        },
        { transform: "none" },
      ],
      { duration: DURATION.base, easing: EASING.standard, pseudoElement: "::before" },
    );
  }, [currentIndex, serverPainted]);

  return (
    <nav
      ref={navRef}
      className={cx(styles.tabs, edges.start && styles.fadeStart, edges.end && styles.fadeEnd)}
      aria-label={label}
    >
      <ul ref={listRef} className={styles.track}>
        {tabs.map((tab, index) => (
          <li key={tab.key}>
            <Link
              className={styles.tab}
              href={tab.href}
              aria-current={tab.key === current ? "page" : undefined}
              onClick={() => {
                try {
                  sessionStorage.setItem(
                    TAB_KEY,
                    JSON.stringify({
                      from: currentIndex,
                      to: index,
                      at: Date.now(),
                    } satisfies TabMove),
                  );
                } catch {
                  // storage blocked: no glide
                }
              }}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Tab content entrance (G-02 part 2): after a tab tap the new content comes from the side of
 * the tab (right tab: +24 px, left tab: −24 px) with a fade; other client navigations rise
 * 8 px (G-01). Server-painted content never animates (R-017). Reduced: fade only.
 */
export function TabContent({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const serverPainted = useWasServerPainted();
  useLayoutEffect(() => {
    if (serverPainted) return;
    const move = readMove();
    if (move && move.to === index && move.from !== index && !prefersReducedMotion()) {
      enter(ref.current, {
        x: (move.from < index ? 1 : -1) * DISTANCE.lg,
        duration: DURATION.base,
      });
    } else {
      enter(ref.current, { y: DISTANCE.sm, duration: DURATION.base });
    }
  }, [index, serverPainted]);
  return <div ref={ref}>{children}</div>;
}
