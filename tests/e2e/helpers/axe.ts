import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Waits until every finite animation/transition on the page has finished. Cross-fades stay
 * even with reduced motion (M-D2, G-01, G-14); measured mid-fade, text has an intermediate
 * opacity and axe reports a false colour-contrast violation. Infinite animations (spinners)
 * are ignored. Loops a few rounds because finished animations can start follow-ups.
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let round = 0; round < 5; round++) {
      const running = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState !== "finished" &&
            animation.effect?.getComputedTiming().endTime !== Infinity,
        );
      if (running.length === 0) return;
      await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
    }
  });
}

/** axe with all rules; fails on serious/critical violations (after animations settled). */
export async function expectNoSeriousAxeViolations(page: Page, label: string): Promise<void> {
  await waitForAnimations(page);
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    severe,
    `${label}: ${severe.map((v) => `${v.id} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`).join("; ")}`,
  ).toEqual([]);
}
