import { describe, expect, it } from "vitest";
import { stepperAnnouncement } from "./stepper-announcement";

describe("stepperAnnouncement", () => {
  it("stays silent until a button was pressed", () => {
    expect(stepperAnnouncement(false, "5", "nights", "not set")).toBe("");
  });

  it("reads the new value with its unit", () => {
    expect(stepperAnnouncement(true, "5", "nights", "not set")).toBe("5 nights");
    expect(stepperAnnouncement(true, "1", "Nacht", "nicht festgelegt")).toBe("1 Nacht");
  });

  it("reads the empty text when an optional stepper was cleared", () => {
    expect(stepperAnnouncement(true, "", "nights", "Ideally: not set")).toBe("Ideally: not set");
  });
});
