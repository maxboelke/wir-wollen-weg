import { describe, expect, it } from "vitest";
import { decide, dragRotation, exitDuration, stampOpacity, threshold, velocity } from "./swipe";

describe("swipe gesture (motion W18-A)", () => {
  it("threshold = 0.3 × width, clamped 80–140 px", () => {
    expect(threshold(328)).toBeCloseTo(98.4);
    expect(threshold(420)).toBe(126);
    expect(threshold(200)).toBe(80);
    expect(threshold(1000)).toBe(140);
  });
  it("rotation tx/18, max ±12°, none when reduced", () => {
    expect(dragRotation(90, false)).toBe(5);
    expect(dragRotation(-400, false)).toBe(-12);
    expect(dragRotation(90, true)).toBe(0);
  });
  it("stamp opacity starts after 16 px and is full at the threshold", () => {
    expect(stampOpacity(10, 100)).toBe(0);
    expect(stampOpacity(58, 100)).toBe(0.5);
    expect(stampOpacity(-150, 100)).toBe(1);
  });
  it("velocity over the last 80 ms", () => {
    expect(
      velocity(
        [
          { t: 0, x: 0 },
          { t: 100, x: 10 },
          { t: 150, x: 40 },
          { t: 180, x: 70 },
        ],
        180,
      ),
    ).toBeCloseTo(60 / 80);
    expect(velocity([{ t: 0, x: 0 }], 10)).toBe(0);
    expect(
      velocity(
        [
          { t: 0, x: 0 },
          { t: 10, x: 50 },
        ],
        500,
      ),
    ).toBe(0);
  });
  it("decides: flick direction, threshold, spring back", () => {
    expect(decide(30, 0.8, 100)).toBe(1); // flick to the right
    expect(decide(-30, -0.8, 100)).toBe(-1);
    expect(decide(120, -0.8, 100)).toBe(0); // thrown back
    expect(decide(20, 0.9, 100)).toBe(0); // flick under 24 px
    expect(decide(110, 0.1, 100)).toBe(1); // past the threshold
    expect(decide(-101, 0, 100)).toBe(-1);
    expect(decide(60, 0.2, 100)).toBe(0);
  });
  it("fly-out keeps the swing: 140–220 ms", () => {
    expect(exitDuration(300, 3)).toBe(140);
    expect(exitDuration(300, 0.1)).toBe(220);
    expect(exitDuration(240, 1.2)).toBe(200);
  });
});
