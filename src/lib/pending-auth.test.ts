import { describe, expect, it } from "vitest";
import {
  clearPendingAuth,
  formatCountdown,
  isInAppBrowser,
  loadPendingAuth,
  PENDING_AUTH_KEY,
  PENDING_AUTH_MAX_AGE_MS,
  pendingOrigin,
  resendSecondsLeft,
  savePendingAuth,
  type StorageLike,
} from "./pending-auth";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

const NOW = 1_800_000_000_000;
const entry = {
  origin: "/i/abcdefghijklmnop",
  email: "kemal@example.org",
  step: "code" as const,
  requestedAt: NOW,
};

describe("pendingAuth (Flow A.4)", () => {
  it("is stored in both storages and restored – never with a code", () => {
    const session = memoryStorage();
    const local = memoryStorage();
    savePendingAuth({ ...entry, tripName: "Lisbon" }, [session, local]);
    expect(session.data.get(PENDING_AUTH_KEY)).toBe(local.data.get(PENDING_AUTH_KEY));
    expect(
      Object.keys(JSON.parse(session.data.get(PENDING_AUTH_KEY) ?? "{}") as object),
    ).not.toContain("code");
    // sessionStorage lost (new tab from the mail app) → localStorage still has it
    session.data.clear();
    expect(loadPendingAuth(NOW + 1000, [session, local])).toEqual({ ...entry, tripName: "Lisbon" });
  });

  it("expires after 30 minutes and drops broken or foreign entries", () => {
    const local = memoryStorage();
    savePendingAuth(entry, [local]);
    expect(loadPendingAuth(NOW + PENDING_AUTH_MAX_AGE_MS + 1, [local])).toBeNull();
    expect(local.data.size).toBe(0);
    local.data.set(PENDING_AUTH_KEY, "{not json");
    expect(loadPendingAuth(NOW, [local])).toBeNull();
    local.data.set(PENDING_AUTH_KEY, JSON.stringify({ ...entry, origin: "//evil.example" }));
    expect(loadPendingAuth(NOW, [local])).toBeNull();
  });

  it("prefers the newest entry and can be cleared", () => {
    const a = memoryStorage();
    const b = memoryStorage();
    savePendingAuth(entry, [a]);
    savePendingAuth({ ...entry, email: "new@example.org", requestedAt: NOW + 5000 }, [b]);
    expect(loadPendingAuth(NOW + 6000, [a, b])?.email).toBe("new@example.org");
    clearPendingAuth([a, b]);
    expect(loadPendingAuth(NOW + 6000, [a, b])).toBeNull();
  });

  it("survives blocked storages", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => {
      savePendingAuth(entry, [broken]);
    }).not.toThrow();
    expect(loadPendingAuth(NOW, [broken])).toBeNull();
  });

  it("builds the origin per variant", () => {
    expect(pendingOrigin("invite", "/i/abcdefghijklmnop")).toBe("/i/abcdefghijklmnop");
    expect(pendingOrigin("login", "/trips")).toBe("/login?next=%2Ftrips");
  });
});

describe("resend countdown (F-040: 30 s)", () => {
  it("counts down from 30 s after sending, 30 s while still sending", () => {
    expect(resendSecondsLeft(null, NOW)).toBe(30);
    expect(resendSecondsLeft(NOW, NOW + 3000)).toBe(27);
    expect(resendSecondsLeft(NOW, NOW + 30_000)).toBe(0);
    expect(formatCountdown(27)).toBe("0:27");
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(75)).toBe("1:15");
  });
});

describe("in-app browser detection (best effort, A.4 rule 7)", () => {
  it.each([
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ... Instagram 300.0", true],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UP1A; wv) AppleWebKit/537.36 ... WhatsApp/2.24",
      true,
    ],
    ["Mozilla/5.0 (iPhone; ...) [FBAN/FBIOS;FBAV/450.0]", true],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15", false],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36",
      false,
    ],
  ])("%s → %s", (ua, expected) => {
    expect(isInAppBrowser(ua)).toBe(expected);
  });
});
