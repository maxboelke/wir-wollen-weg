import { describe, expect, it } from "vitest";
import { retentionTokenMatches } from "./retention-token";

const RETENTION = "retention-token-0123456789abcdef-0123456789";
const CRON = "cron-secret-0123456789abcdef-0123456789abcd";

describe("retentionTokenMatches", () => {
  it("accepts either configured token as bearer", async () => {
    expect(await retentionTokenMatches(`Bearer ${RETENTION}`, [RETENTION, CRON])).toBe(true);
    expect(await retentionTokenMatches(`Bearer ${CRON}`, [RETENTION, CRON])).toBe(true);
    expect(await retentionTokenMatches(`Bearer ${CRON}`, [undefined, CRON])).toBe(true);
  });

  it("rejects wrong, missing and unconfigured tokens", async () => {
    expect(await retentionTokenMatches(`Bearer ${CRON}`, [RETENTION, undefined])).toBe(false);
    expect(await retentionTokenMatches("Bearer wrong", [RETENTION, CRON])).toBe(false);
    expect(await retentionTokenMatches(null, [RETENTION, CRON])).toBe(false);
    expect(await retentionTokenMatches(RETENTION, [RETENTION])).toBe(false);
    expect(await retentionTokenMatches("Bearer ", [undefined, undefined])).toBe(false);
    expect(await retentionTokenMatches(`Bearer ${RETENTION}`, [undefined, undefined])).toBe(false);
  });
});
