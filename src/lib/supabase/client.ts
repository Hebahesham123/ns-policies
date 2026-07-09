"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

/**
 * Browser Supabase client (anon key). Read-only against RLS-protected tables;
 * used for public reads, engagement RPCs (views/likes/search), and Realtime.
 * Singleton so we don't open multiple Realtime sockets.
 */
export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}
