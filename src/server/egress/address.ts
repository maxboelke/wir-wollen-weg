import { BlockList, isIP } from "node:net";
import { isIpLiteral, isReservedHostname } from "@/lib/stays";

/**
 * Address rules of the SSRF protection (features.md R.7 «Sicherheit» Nr. 1–2, deployment.md
 * §0.8). Pure functions without network access – unit-tested in `address.test.ts`.
 */

const V4_BLOCKED: [string, number][] = [
  ["0.0.0.0", 8], // «this network»
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local incl. cloud metadata 169.254.169.254
  ["172.16.0.0", 12], // private (Docker networks)
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // TEST-NET-1
  ["192.88.99.0", 24], // 6to4 relay anycast
  ["192.168.0.0", 16], // private (home Wi-Fi, router UI)
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, incl. 255.255.255.255
];

const V6_BLOCKED: [string, number][] = [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["::", 96], // IPv4-compatible (deprecated) – embedded address is checked separately too
  ["100::", 64], // discard-only
  ["2001::", 23], // IETF protocol assignments (Teredo 2001::/32 included)
  ["2001:db8::", 32], // documentation
  ["3fff::", 20], // documentation (RFC 9637)
  ["5f00::", 16], // SRv6 SIDs (RFC 9602) – not globally routed
  ["fc00::", 7], // unique local (incl. AWS metadata fd00:ec2::254)
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (deprecated)
  ["ff00::", 8], // multicast
];

const blocked = new BlockList();
for (const [network, prefix] of V4_BLOCKED) blocked.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of V6_BLOCKED) blocked.addSubnet(network, prefix, "ipv6");

/** Expands an IPv6 address to its 8 groups (numbers); null when it is not IPv6. */
function ipv6Groups(address: string): number[] | null {
  if (isIP(address) !== 6) return null;
  let value = address.toLowerCase().split("%")[0] ?? "";
  // Trailing dotted IPv4 («::ffff:10.0.0.1») → two hex groups.
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(value);
  if (dotted?.[1]) {
    const bytes = dotted[1].split(".").map(Number);
    const hi = ((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0);
    const lo = ((bytes[2] ?? 0) << 8) | (bytes[3] ?? 0);
    value = value.slice(0, -dotted[1].length) + `${hi.toString(16)}:${lo.toString(16)}`;
  }
  const [head = "", tail] = value.split("::");
  const left = head ? head.split(":") : [];
  const right = tail !== undefined && tail !== "" ? tail.split(":") : [];
  const missing = 8 - left.length - right.length;
  if (tail === undefined && missing !== 0) return null;
  const groups = [...left, ...Array<string>(Math.max(0, missing)).fill("0"), ...right];
  return groups.map((group) => parseInt(group || "0", 16));
}

const toV4 = (hi: number, lo: number) =>
  [hi >> 8, hi & 0xff, lo >> 8, lo & 0xff].map((n) => String(n)).join(".");

/**
 * IPv4 address embedded in an IPv6 address – converted by us, never left to library
 * behaviour (deployment.md §0.8 Nr. 4): IPv4-mapped `::ffff:a.b.c.d`, IPv4-compatible
 * `::a.b.c.d`, IPv4/IPv6 translation `64:ff9b::/96` and `64:ff9b:1::/48`, 6to4 `2002::/16`.
 */
export function embeddedIpv4(address: string): string | null {
  const g = ipv6Groups(address);
  if (!g) return null;
  const [g0 = 0, g1 = 0, g2 = 0, g3 = 0, g4 = 0, g5 = 0, g6 = 0, g7 = 0] = g;
  const zeroTo = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (zeroTo(5) && g5 === 0xffff) return toV4(g6, g7); // ::ffff:a.b.c.d
  if (zeroTo(4) && g4 === 0xffff && g5 === 0) return toV4(g6, g7); // ::ffff:0:a.b.c.d (SIIT)
  if (zeroTo(6) && (g6 !== 0 || g7 > 1)) return toV4(g6, g7); // ::a.b.c.d
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) {
    return toV4(g6, g7); // 64:ff9b::/96
  }
  if (g0 === 0x64 && g1 === 0xff9b && g2 === 1) return toV4(g6, g7); // 64:ff9b:1::/48
  if (g0 === 0x2002) return toV4(g1, g2); // 6to4
  return null;
}

/**
 * True when a resolved address must not be contacted: every private, loopback, link-local,
 * shared, documentation, multicast or reserved range of IPv4 and IPv6 – including IPv4
 * addresses hidden in IPv6 (checked against the IPv4 list after conversion). Anything that
 * is not a valid IP address is blocked as well.
 */
export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return blocked.check(address, "ipv4");
  if (family !== 6) return true;
  const plain = address.split("%")[0] ?? address;
  if (blocked.check(plain, "ipv6")) return true;
  const v4 = embeddedIpv4(plain);
  return v4 !== null && blocked.check(v4, "ipv4");
}

export type TargetProblem = "scheme" | "port" | "credentials" | "host" | "length";

/**
 * Rules for every URL we fetch (R.7 Nr. 1, deployment.md §0.8 Nr. 5) – the first URL, every
 * redirect target and the preview image: `https:` only, port 443, no credentials, a host
 * NAME (no IP literal, contains a dot, not `localhost`/`*.local`/`*.internal`), ≤ 2 048.
 */
export function targetProblem(url: URL): TargetProblem | null {
  if (url.protocol !== "https:") return "scheme";
  if (url.port !== "" && url.port !== "443") return "port";
  if (url.username !== "" || url.password !== "") return "credentials";
  if (url.href.length > 2048) return "length";
  if (url.hostname === "" || isIpLiteral(url.hostname) || isReservedHostname(url.hostname)) {
    return "host";
  }
  return null;
}
