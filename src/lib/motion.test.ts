import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import {
  assertCompositorOnly,
  DISTANCE,
  DURATION,
  MOTION_BOOTSTRAP_SCRIPT,
  motionCookieReduces,
  prefersReducedMotion,
  SCALE,
  STAGGER,
  staggerDelay,
} from "./motion";

const tokens = readFileSync(
  join(import.meta.dirname, "..", "..", "docs", "design", "tokens.css"),
  "utf8",
);
/** First (= full-motion) declaration of a token in tokens.css §6. */
function token(name: string): string {
  const match = new RegExp(`--ww-${name}:\\s*([^;]+);`).exec(tokens);
  if (!match?.[1]) throw new Error(`token ${name} not found`);
  return match[1].trim();
}

describe("motion constants mirror tokens.css", () => {
  it.each(Object.entries(DURATION))("duration %s", (name, value) => {
    expect(token(`duration-${name}`)).toBe(`${value}ms`);
  });

  it("distances, scales and staggers", () => {
    expect(token("motion-distance-sm")).toBe(`${DISTANCE.sm}px`);
    expect(token("motion-distance")).toBe(`${DISTANCE.md}px`);
    expect(token("motion-distance-lg")).toBe(`${DISTANCE.lg}px`);
    expect(Number(token("motion-scale-press"))).toBe(SCALE.press);
    expect(Number(token("motion-scale-cell"))).toBe(SCALE.cell);
    expect(Number(token("motion-scale-enter"))).toBe(SCALE.enter);
    expect(Number(token("motion-scale-pop"))).toBe(SCALE.pop);
    expect(token("stagger-cell")).toBe(`${STAGGER.cell}ms`);
    expect(token("stagger-item")).toBe(`${STAGGER.item}ms`);
    expect(token("stagger-card")).toBe(`${STAGGER.card}ms`);
    expect(token("stagger-max")).toBe(`${STAGGER.max}ms`);
  });
});

describe("prefersReducedMotion", () => {
  const media = (matches: boolean) => () => ({ matches });

  it("follows the system setting", () => {
    expect(prefersReducedMotion({ matchMedia: media(true), root: { dataset: {} } })).toBe(true);
    expect(prefersReducedMotion({ matchMedia: media(false), root: { dataset: {} } })).toBe(false);
  });

  it("is reduced by data-motion even when the system allows motion", () => {
    const root = { dataset: { motion: "reduce" } };
    expect(prefersReducedMotion({ matchMedia: media(false), root })).toBe(true);
  });

  it("is false on the server (no window)", () => {
    expect(prefersReducedMotion({})).toBe(false);
  });
});

describe("assertCompositorOnly", () => {
  it("accepts transform and opacity", () => {
    expect(() => {
      assertCompositorOnly([{ transform: "scale(1)", opacity: 0, offset: 0.5 }]);
    }).not.toThrow();
  });

  it("rejects layout and paint properties", () => {
    expect(() => {
      assertCompositorOnly([{ height: "10px" }]);
    }).toThrow(/height/);
    expect(() => {
      assertCompositorOnly([{ boxShadow: "none" }]);
    }).toThrow(/boxShadow/);
  });
});

describe("staggerDelay", () => {
  it("steps and caps at the maximum", () => {
    expect(staggerDelay(0, 40)).toBe(0);
    expect(staggerDelay(3, 40)).toBe(120);
    expect(staggerDelay(50, 40)).toBe(STAGGER.max);
  });
});

describe("motion cookie", () => {
  it("detects the reduce choice in a cookie header", () => {
    expect(motionCookieReduces("lang=de; ww-motion=reduce")).toBe(true);
    expect(motionCookieReduces("ww-motion=")).toBe(false);
    expect(motionCookieReduces("other-ww-motion=reduce")).toBe(false);
    expect(motionCookieReduces(undefined)).toBe(false);
  });

  it("bootstrap script sets data-motion from cookie or system setting", () => {
    const run = (cookie: string, matches: boolean) => {
      const attributes: Record<string, string> = {};
      runInNewContext(MOTION_BOOTSTRAP_SCRIPT, {
        document: {
          cookie,
          documentElement: {
            setAttribute: (name: string, value: string) => {
              attributes[name] = value;
            },
          },
        },
        matchMedia: () => ({ matches }),
      });
      return attributes["data-motion"];
    };
    expect(run("ww-motion=reduce", false)).toBe("reduce");
    expect(run("a=b", true)).toBe("reduce");
    expect(run("a=b; ww-motion=", false)).toBeUndefined();
  });
});
