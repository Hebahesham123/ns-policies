import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Read a single settings row's value object by key. */
export async function getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}

/** Read multiple settings at once, returned as a keyed map. */
export async function getSettings(keys: string[]): Promise<Record<string, Record<string, unknown>>> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("settings").select("key,value").in("key", keys);
  const out: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) out[row.key] = row.value as Record<string, unknown>;
  return out;
}
