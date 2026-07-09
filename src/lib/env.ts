/**
 * Centralized, validated environment access.
 * Public vars (NEXT_PUBLIC_*) are inlined at build time and safe for the client.
 * Server-only vars must never be imported into a Client Component.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "NS Knowledge Base",
};

/** Server-only secrets. Calling this from the client throws at build/runtime. */
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called on the client");
  }
  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    allowedIps: (process.env.ALLOWED_IPS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    adminPasscode: process.env.ADMIN_PASSCODE ?? "",
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-secret",
    trustProxy: (process.env.TRUST_PROXY ?? "true") === "true",
  };
}

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
