import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  decideCodeRequest,
  decideVerification,
  EMAIL_LIMITS,
  HOUR_MS,
  isMailboxVariant,
  mailboxOf,
  retryAfterMinutes,
  windowRetryAfter,
} from "./email-limits";

const NOW = 1_800_000_000_000;
const minutesAgo = (m: number) => NOW - m * 60_000;

describe("rate limits per e-mail address", () => {
  it("uses the documented values", () => {
    expect(EMAIL_LIMITS).toEqual({
      requestsPerHour: 5,
      requestsPerDay: 20,
      failuresPerHour: 10,
      mailboxRequestsPerHour: 10,
      mailboxRequestsPerDay: 30,
    });
  });

  it("allows 5 code mails per hour, then waits until the oldest leaves the window", () => {
    const four = [1, 2, 3, 4].map(minutesAgo);
    expect(decideCodeRequest(four, [], false, NOW)).toEqual({ allowed: true });
    const five = [10, 20, 30, 40, 50].map(minutesAgo);
    expect(decideCodeRequest(five, [], false, NOW)).toEqual({
      allowed: false,
      reason: "requests",
      retryAfterSeconds: 10 * 60,
    });
    // older than an hour no longer counts
    expect(decideCodeRequest([...four, minutesAgo(61)], [], false, NOW)).toEqual({ allowed: true });
  });

  it("caps at 20 per day even when spread out", () => {
    const spread = Array.from({ length: 20 }, (_, i) => minutesAgo(70 + i * 60));
    const decision = decideCodeRequest(spread, [], false, NOW);
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      // the oldest (19 h 70 min ago) leaves the 24 h window first
      expect(decision.retryAfterSeconds).toBe((DAY_MS - (70 + 19 * 60) * 60_000) / 1000);
    }
  });

  it("locks verification after 10 failures in an hour – but never the code mail (R-021)", () => {
    const nine = Array.from({ length: 9 }, (_, i) => minutesAgo(i + 1));
    expect(decideVerification(nine, NOW)).toEqual({ allowed: true });
    const ten = [...nine, minutesAgo(30)];
    expect(decideVerification(ten, NOW)).toEqual({
      allowed: false,
      reason: "locked",
      retryAfterSeconds: 30 * 60,
    });
    // The mail (with the magic link) only depends on the mail budget.
    expect(decideCodeRequest([], [], false, NOW)).toEqual({ allowed: true });
  });

  it("limits variants by the mailbox budget: 10 per hour, 30 per day (R-027)", () => {
    const ten = Array.from({ length: 10 }, (_, i) => minutesAgo(i + 1));
    expect(decideCodeRequest([], ten.slice(1), true, NOW)).toEqual({ allowed: true });
    expect(decideCodeRequest([], ten, true, NOW)).toEqual({
      allowed: false,
      reason: "requests",
      retryAfterSeconds: 50 * 60,
    });
    const spread = Array.from({ length: 30 }, (_, i) => minutesAgo(61 + i * 40));
    expect(decideCodeRequest([], spread, true, NOW)).toMatchObject({ allowed: false });
    expect(decideCodeRequest([], spread.slice(1), true, NOW)).toEqual({ allowed: true });
    // A variant still has its own 5 per hour as well.
    const five = [1, 2, 3, 4, 5].map(minutesAgo);
    expect(decideCodeRequest(five, [], true, NOW)).toMatchObject({ allowed: false });
  });

  it("never limits the canonical address by the mailbox budget (R-033)", () => {
    const full = Array.from({ length: 30 }, (_, i) => minutesAgo(i + 1));
    expect(decideCodeRequest([], full, false, NOW)).toEqual({ allowed: true });
    // … only by its own budget.
    const five = [1, 2, 3, 4, 5].map(minutesAgo);
    expect(decideCodeRequest(five, full, false, NOW)).toMatchObject({ allowed: false });
  });

  it("tells variants from canonical addresses", () => {
    expect(isMailboxVariant(" Anna@Example.org ")).toBe(false);
    expect(isMailboxVariant("anna+trip@example.org")).toBe(true);
    expect(isMailboxVariant("a.nna@gmail.com")).toBe(true);
    expect(isMailboxVariant("anna@googlemail.com")).toBe(true);
    expect(isMailboxVariant("anna@gmail.com")).toBe(false);
    expect(isMailboxVariant("a.nna@example.org")).toBe(false);
    expect(isMailboxVariant("+tag@example.org")).toBe(false);
  });

  it("maps plus addresses and Gmail variants to one mailbox", () => {
    expect(mailboxOf(" Anna+Trip1@Example.org ")).toBe("anna@example.org");
    expect(mailboxOf("anna+@example.org")).toBe("anna@example.org");
    expect(mailboxOf("a.n.na+x@googlemail.com")).toBe("anna@gmail.com");
    expect(mailboxOf("a.nna@example.org")).toBe("a.nna@example.org");
    expect(mailboxOf("+tag@example.org")).toBe("+tag@example.org");
    expect(mailboxOf("no-at-sign")).toBe("no-at-sign");
  });

  it("computes window waits and minutes for the message", () => {
    expect(windowRetryAfter([], 1, HOUR_MS, NOW)).toBe(0);
    expect(windowRetryAfter([NOW], 1, HOUR_MS, NOW)).toBe(3600);
    expect(retryAfterMinutes(1)).toBe(1);
    expect(retryAfterMinutes(61)).toBe(2);
    expect(retryAfterMinutes(3600)).toBe(60);
  });
});
