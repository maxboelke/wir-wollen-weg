import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Waits until every finite animation/transition on the page has finished. Cross-fades stay
 * even with reduced motion (M-D2, G-01, G-14); measured mid-fade, text has an intermediate
 * opacity and axe reports a false colour-contrast violation. Infinite animations (spinners)
 * are ignored.
 *
 * «Quiet» must hold over two animation frames: a transition can start one frame after the
 * last check – IntersectionObserver callbacks are delivered after rendering, React then
 * commits the new state (e.g. the cost bar `data-cost-dock` hidden → shown, UM-26) and only
 * that frame starts the fade. A single check missed it on WebKit: axe measured the bar status
 * text at opacity ≈ 0.97 (#00775a on #ece9f7 = 4.64 : 1 at rest, 4.38 : 1 mid-fade).
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const nextFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    const running = () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState !== "finished" &&
            animation.effect?.getComputedTiming().endTime !== Infinity,
        );
    for (let round = 0; round < 10; round++) {
      const active = running();
      if (active.length === 0) {
        await nextFrame();
        await nextFrame();
        if (running().length === 0) return;
        continue;
      }
      await Promise.all(active.map((animation) => animation.finished.catch(() => undefined)));
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
