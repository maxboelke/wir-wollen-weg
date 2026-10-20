import { afterEach, describe, expect, it, vi } from "vitest";

const after = vi.fn<(task: Promise<unknown>) => void>();
vi.mock("next/server", () => ({
  after: (task: Promise<unknown>) => {
    after(task);
  },
}));

const { runAfterResponse } = await import("./background");

afterEach(() => {
  after.mockReset();
});

describe("runAfterResponse", () => {
  it("hands the work to after() inside a request scope", async () => {
    let resolve!: () => void;
    const work = new Promise<void>((r) => (resolve = r));
    runAfterResponse(work);
    expect(after).toHaveBeenCalledTimes(1);
    const task = after.mock.calls[0]?.[0];
    resolve();
    await expect(task).resolves.toBeUndefined();
  });

  it("never rejects the task handed to after(), even if the work fails", async () => {
    runAfterResponse(Promise.reject(new Error("smtp down")));
    await expect(after.mock.calls[0]?.[0]).resolves.toBeUndefined();
  });

  it("does not throw outside a request scope (after() throws)", async () => {
    after.mockImplementation(() => {
      throw new Error("`after` was called outside a request scope");
    });
    const work = Promise.reject(new Error("smtp down"));
    expect(() => {
      runAfterResponse(work);
    }).not.toThrow();
    // No unhandled rejection: the work is settled internally.
    await new Promise((r) => setTimeout(r, 0));
  });
});
