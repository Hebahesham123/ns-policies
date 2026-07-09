/**
 * IP allowlist matching — Edge-runtime safe (no Node APIs).
 * Supports exact IPv4/IPv6 and IPv4 CIDR ranges (e.g. 10.0.0.0/8).
 */

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}

function matchCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(range);
  if (ipInt === null || rangeInt === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return false;
  }
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/** Normalize IPv4-mapped IPv6 (::ffff:1.2.3.4) to plain IPv4. */
export function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  const mapped = trimmed.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  return mapped ? mapped[1] : trimmed;
}

/**
 * True if `ip` is allowed by the list. An EMPTY allowlist means "allow all"
 * (convenient for local dev — set ALLOWED_IPS in production).
 */
export function isIpAllowed(ip: string | null, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  if (!ip) return false;
  const client = normalizeIp(ip);
  return allowlist.some((entry) => {
    const e = normalizeIp(entry);
    if (e.includes("/")) return matchCidr(client, e);
    return e === client;
  });
}

/** Extract the client IP from request headers (proxy-aware). */
export function getClientIp(headers: Headers, trustProxy: boolean): string | null {
  if (trustProxy) {
    const xff = headers.get("x-forwarded-for");
    if (xff) return normalizeIp(xff.split(",")[0]);
    const real = headers.get("x-real-ip");
    if (real) return normalizeIp(real);
  }
  return null;
}
