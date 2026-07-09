/**
 * Admin session — a stateless HMAC-signed cookie.
 * Uses Web Crypto (crypto.subtle) so it runs in both the Edge middleware and
 * Node server actions. Payload = expiry timestamp; signature proves the admin
 * passcode was verified server-side. No database, no user accounts.
 */

export const ADMIN_COOKIE = "ns_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64url(sig);
}

/** Create a signed session token valid for SESSION_TTL_MS. */
export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = base64url(encoder.encode(String(exp)));
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

/** Verify a session token's signature and expiry (constant-ish time). */
export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = await hmac(secret, payload);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const exp = Number(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Number.isFinite(exp) && exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time-ish passcode comparison. */
export function passcodeMatches(input: string, expected: string): boolean {
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
