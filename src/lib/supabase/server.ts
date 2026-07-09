import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Server-side anon client for public reads inside Server Components / Route
 * Handlers. No cookies/session — access is already gated by the edge IP
 * allowlist, and RLS restricts anon to published/public rows.
 */
export function getSupabaseServer() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
