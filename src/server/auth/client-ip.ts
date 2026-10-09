import { BlockList, isIP } from "node:net";

/**
 * Client-IP resolution for the auth rate limit (R-005, deployment.md §0.1/§5.2).
 *
 * Next.js only sets `x-forwarded-for` from the socket when the request carries none, so
 * a client that reaches `next start` directly can choose its own address. The app must
 * therefore sit behind a proxy that overwrites the configured header (Caddy in demo and
 * production, Cloudflare's `cf-connecting-ip` for a tunnel). This module reads that header
 * and walks proxy chains from the right, so a spoofed left-hand part is ignored and every
 * resolvable request gets its own bucket – never a shared one.
 */

/** Internal header the auth route sets from the resolved IP; Better Auth reads only this. */
export const CLIENT_IP_HEADER = "x-ww-client-ip";

export interface ClientIpConfig {
  /** Header that carries the client IP (lower case), e.g. `x-forwarded-for`, `cf-connecting-ip`. */
  header: string;
  /** Addresses/CIDR ranges of proxies whose entries in a forwarded chain are skipped. */
  trustedProxies: BlockList;
}

function normalize(raw: string): string | undefined {
  let ip = raw.trim();
  // Tolerate "[2001:db8::1]" and "[2001:db8::1]:443" as well as "1.2.3.4:5678".
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(ip);
  if (bracketed?.[1]) ip = bracketed[1];
  else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.slice(0, ip.lastIndexOf(":"));
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped?.[1]) ip = mapped[1];
  return isIP(ip) ? ip.toLowerCase() : undefined;
}

function family(ip: string): "ipv4" | "ipv6" {
  return isIP(ip) === 4 ? "ipv4" : "ipv6";
}

/**
 * Parses a comma-separated list of IPs/CIDR ranges. Throws on invalid entries so that a
 * typo in the proxy list fails loudly (first auth request) instead of trusting nothing.
 */
export function parseTrustedProxies(value: string | undefined): BlockList {
  const list = new BlockList();
  for (const entry of value
    ?.split(",")
    .map((e) => e.trim())
    .filter(Boolean) ?? []) {
    const [address = "", prefix, ...rest] = entry.split("/");
    const ip = normalize(address);
    const bits = prefix === undefined ? undefined : Number(prefix);
    const maxBits = ip && family(ip) === "ipv4" ? 32 : 128;
    if (
      !ip ||
      rest.length > 0 ||
      (prefix !== undefined && (!/^\d+$/.test(prefix) || (bits ?? 0) > maxBits))
    ) {
      throw new Error(`AUTH_TRUSTED_PROXIES: invalid entry "${entry}" (expected IP or CIDR)`);
    }
    if (bits === undefined) list.addAddress(ip, family(ip));
    else list.addSubnet(ip, bits, family(ip));
  }
  return list;
}

/**
 * Returns the client IP from the configured header, or `undefined` if the header is
 * missing or holds no valid address. Chains are read right to left: entries of trusted
 * proxies are skipped, the first other entry is the client (it was written by the nearest
 * proxy we trust, everything left of it may be forged). If every entry is a trusted
 * proxy, the leftmost one is used.
 */
export function resolveClientIp(headers: Headers, config: ClientIpConfig): string | undefined {
  const value = headers.get(config.header);
  if (!value) return undefined;
  const entries = value.split(",");
  let ip: string | undefined;
  for (let i = entries.length - 1; i >= 0; i--) {
    ip = normalize(entries[i] ?? "");
    if (!ip) return undefined;
    if (!config.trustedProxies.check(ip, family(ip))) return ip;
  }
  return ip;
}

/**
 * Rate-limit subject for a resolved client IP (R-036): IPv4 addresses as they are, IPv6
 * addresses collapsed to their /64 network («2001:db8:1:2::/64») – a single IPv6 connection
 * usually owns a whole /64 and could otherwise rotate addresses freely. Better Auth does the
 * same for its own IP limits (`advanced.ipAddress.ipv6Subnet`, default 64).
 */
export function rateLimitSubject(ip: string): string {
  const clean = normalize(ip);
  if (!clean) return ip;
  if (family(clean) === "ipv4") return clean;
  const hextets = expandIpv6(clean);
  // IPv4-mapped in hex notation («::ffff:cb00:7107») is one IPv4 client, not the /64 «0:0:0:0»
  // that every such address would otherwise share.
  if (hextets.slice(0, 5).every((part) => part === "0") && hextets[5] === "ffff") {
    const [high = 0, low = 0] = hextets.slice(6).map((part) => Number.parseInt(part, 16));
    return [high >> 8, high & 255, low >> 8, low & 255].join(".");
  }
  return `${hextets.slice(0, 4).join(":")}::/64`;
}

/** Eight hextets without leading zeros (handles «::» and an embedded IPv4 tail). */
function expandIpv6(ip: string): string[] {
  let address = ip;
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number) as [number, number, number, number];
    const tail = `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
    address = address.slice(0, v4.index) + tail;
  }
  const [head = "", rest] = address.split("::");
  const left = head ? head.split(":") : [];
  const right = rest ? rest.split(":") : [];
  const fill = rest === undefined ? [] : Array<string>(8 - left.length - right.length).fill("0");
  return [...left, ...fill, ...right].map((part) => Number.parseInt(part, 16).toString(16));
}
