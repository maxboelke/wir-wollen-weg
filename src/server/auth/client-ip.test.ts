import { describe, expect, it } from "vitest";
import { parseTrustedProxies, rateLimitSubject, resolveClientIp } from "./client-ip";

function resolve(value: string | null, trusted?: string, header = "x-forwarded-for") {
  const headers = new Headers(value === null ? {} : { [header]: value });
  return resolveClientIp(headers, { header, trustedProxies: parseTrustedProxies(trusted) });
}

describe("resolveClientIp", () => {
  it("uses a single forwarded address", () => {
    expect(resolve("203.0.113.7")).toBe("203.0.113.7");
  });

  it("ignores a forged left-hand part and uses the hop added by the proxy (R-005)", () => {
    // Client sent "X-Forwarded-For: 1.1.1.1", the proxy appended the real address.
    expect(resolve("1.1.1.1, 203.0.113.7")).toBe("203.0.113.7");
    expect(resolve("10.0.0.1, 10.0.0.2, 203.0.113.7")).toBe("203.0.113.7");
  });

  it("gives every client of a multi-value chain its own key instead of a shared bucket", () => {
    expect(resolve("1.1.1.1, 2.2.2.2")).toBe("2.2.2.2");
    expect(resolve("1.1.1.1, 3.3.3.3")).toBe("3.3.3.3");
  });

  it("skips trusted proxies from the right", () => {
    expect(resolve("198.51.100.1, 203.0.113.7, 172.18.0.5", "172.16.0.0/12")).toBe("203.0.113.7");
    expect(resolve("203.0.113.7, 10.0.0.2, 10.0.0.3", "10.0.0.0/8")).toBe("203.0.113.7");
  });

  it("falls back to the leftmost entry when every hop is trusted", () => {
    expect(resolve("10.0.0.2, 10.0.0.3", "10.0.0.0/8")).toBe("10.0.0.2");
  });

  it("returns undefined for missing or invalid values", () => {
    expect(resolve(null)).toBeUndefined();
    expect(resolve("")).toBeUndefined();
    expect(resolve("unknown")).toBeUndefined();
    expect(resolve("1.1.1.1, garbage")).toBeUndefined();
    // Invalid entry before the client is reached – do not guess.
    expect(resolve("garbage, 10.0.0.3", "10.0.0.0/8")).toBeUndefined();
  });

  it("normalizes ports, brackets, case and IPv4-mapped IPv6", () => {
    expect(resolve("203.0.113.7:51234")).toBe("203.0.113.7");
    expect(resolve("[2001:DB8::1]:443")).toBe("2001:db8::1");
    expect(resolve("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });

  it("reads a configured single-value header such as cf-connecting-ip", () => {
    expect(resolve("2001:db8::5", undefined, "cf-connecting-ip")).toBe("2001:db8::5");
    // x-forwarded-for is ignored when another header is configured.
    const headers = new Headers({ "x-forwarded-for": "1.1.1.1" });
    expect(
      resolveClientIp(headers, {
        header: "cf-connecting-ip",
        trustedProxies: parseTrustedProxies(undefined),
      }),
    ).toBeUndefined();
  });
});

describe("parseTrustedProxies", () => {
  it("accepts addresses and CIDR ranges of both families", () => {
    const list = parseTrustedProxies(" 127.0.0.1, 172.16.0.0/12 ,fd00::/8 ");
    expect(list.check("127.0.0.1", "ipv4")).toBe(true);
    expect(list.check("172.20.1.1", "ipv4")).toBe(true);
    expect(list.check("172.32.0.1", "ipv4")).toBe(false);
    expect(list.check("fd12::1", "ipv6")).toBe(true);
  });

  it.each(["foo", "10.0.0.0/33", "10.0.0.0/x", "10.0.0.0/8/1", "::1/129"])(
    "rejects invalid entry %s",
    (entry) => {
      expect(() => parseTrustedProxies(entry)).toThrow(/AUTH_TRUSTED_PROXIES/);
    },
  );
});

describe("rateLimitSubject (R-036)", () => {
  it("keeps IPv4 addresses as they are", () => {
    expect(rateLimitSubject("203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitSubject("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitSubject("::ffff:cb00:7107")).toBe("203.0.113.7");
    expect(rateLimitSubject("::FFFF:CB00:7107")).toBe("203.0.113.7");
  });

  it("collapses IPv6 addresses to their /64 network", () => {
    expect(rateLimitSubject("2001:db8:1:2:3:4:5:6")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("2001:0DB8:0001:0002:ffff::1")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(rateLimitSubject("2001:db8:1:2::")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("::1")).toBe("0:0:0:0::/64");
    expect(rateLimitSubject("::")).toBe("0:0:0:0::/64");
    expect(rateLimitSubject("2001:db8:1:2:3:4:192.0.2.33")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("64:ff9b::192.0.2.33")).toBe("64:ff9b:0:0::/64");
  });

  it("gives every address of one /64 the same subject, other networks another one", () => {
    const a = rateLimitSubject("2001:db8:aa:bb::1");
    expect(rateLimitSubject("2001:db8:aa:bb:ffff:ffff:ffff:ffff")).toBe(a);
    expect(rateLimitSubject("2001:db8:aa:bc::1")).not.toBe(a);
  });
});
