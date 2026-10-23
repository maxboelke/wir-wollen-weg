import { describe, expect, it } from "vitest";
import { embeddedIpv4, isBlockedAddress, targetProblem } from "./address";

describe("isBlockedAddress – IPv4 (R.7 Nr. 2)", () => {
  it.each([
    "0.0.0.0",
    "0.1.2.3",
    "10.0.0.1",
    "10.255.255.255",
    "100.64.0.1",
    "100.127.255.254",
    "127.0.0.1",
    "127.1.2.3",
    "169.254.169.254",
    "169.254.0.1",
    "172.16.0.1",
    "172.17.0.2",
    "172.31.255.255",
    "192.0.0.8",
    "192.0.2.1",
    "192.168.0.1",
    "192.168.178.1",
    "198.18.0.1",
    "198.19.255.255",
    "198.51.100.7",
    "203.0.113.9",
    "224.0.0.1",
    "239.255.255.250",
    "240.0.0.1",
    "255.255.255.255",
  ])("blocks %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(["93.184.216.34", "1.1.1.1", "8.8.8.8", "172.32.0.1", "100.128.0.1", "198.20.0.1"])(
    "allows public %s",
    (address) => {
      expect(isBlockedAddress(address)).toBe(false);
    },
  );
});

describe("isBlockedAddress – IPv6", () => {
  it.each([
    "::",
    "::1",
    "fc00::1",
    "fd00:ec2::254", // AWS metadata (IPv6)
    "fe80::1",
    "fe80::1%eth0",
    "ff02::1",
    "2001:db8::1",
    "64:ff9b::a00:1", // NAT64 of 10.0.0.1
    "64:ff9b::7f00:1", // NAT64 of 127.0.0.1
    "64:ff9b:1::a9fe:a9fe", // local-use NAT64 of 169.254.169.254
    "2002:c0a8:0101::1", // 6to4 of 192.168.1.1
    "::ffff:10.0.0.1", // IPv4-mapped
    "::ffff:127.0.0.1",
    "::ffff:169.254.169.254",
    "::ffff:a9fe:a9fe", // mapped, hex notation
    "0:0:0:0:0:ffff:c0a8:0001",
    "::ffff:0:10.0.0.1", // SIIT
    "::10.0.0.1", // IPv4-compatible
    "not-an-ip",
    "",
  ])("blocks %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(["2606:4700:4700::1111", "2a00:1450:4001:80b::200e", "::ffff:93.184.216.34"])(
    "allows public %s",
    (address) => {
      expect(isBlockedAddress(address)).toBe(false);
    },
  );

  it("converts embedded IPv4 itself (not left to the library)", () => {
    expect(embeddedIpv4("::ffff:10.0.0.1")).toBe("10.0.0.1");
    expect(embeddedIpv4("::ffff:a9fe:a9fe")).toBe("169.254.169.254");
    expect(embeddedIpv4("64:ff9b::808:808")).toBe("8.8.8.8");
    expect(embeddedIpv4("2002:0808:0808::1")).toBe("8.8.8.8");
    expect(embeddedIpv4("2606:4700:4700::1111")).toBeNull();
    expect(embeddedIpv4("10.0.0.1")).toBeNull();
  });
});

describe("targetProblem (R.7 Nr. 1, deployment.md §0.8 Nr. 5)", () => {
  const problem = (url: string) => targetProblem(new URL(url));
  it("allows https host names on port 443", () => {
    expect(problem("https://www.booking.com/hotel/x")).toBeNull();
    expect(problem("https://ferienhaus.example:443/")).toBeNull();
  });
  it.each([
    ["http://booking.com/", "scheme"],
    ["file:///etc/passwd", "scheme"],
    ["https://booking.com:8443/", "port"],
    ["https://booking.com:80/", "port"],
    ["https://a:b@booking.com/", "credentials"],
    ["https://127.0.0.1/", "host"],
    ["https://2130706433/", "host"],
    ["https://[::1]/", "host"],
    ["https://[::ffff:10.0.0.1]/", "host"],
    ["https://localhost/", "host"],
    ["https://db/", "host"],
    ["https://mailpit/", "host"],
    ["https://proxy/", "host"],
    ["https://nas.local/", "host"],
    ["https://metadata.google.internal/", "host"],
    ["https://host.docker.internal/", "host"],
    [`https://booking.com/${"x".repeat(2050)}`, "length"],
  ])("%s → %s", (url, expected) => {
    expect(problem(url)).toBe(expected);
  });
});
