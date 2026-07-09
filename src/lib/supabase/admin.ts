import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

/**
 * Service-role client. BYPASSES RLS — use only in server code that has already
 * verified the admin session (see requireAdmin in lib/access). Never import
 * this into a Client Component.
 */
export function getSupabaseAdmin() {
  const { serviceRoleKey } = serverEnv();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
