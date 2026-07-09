"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

/** Increment an article's view counter and push it onto the global recent feed. */
export async function recordView(articleId: string): Promise<void> {
  const supabase = getSupabaseServer();
  await supabase.rpc("increment_article_view", { p_article_id: articleId });
}

/** Record a search keyword (feeds trending + per-article search_count). */
export async function recordSearch(keyword: string): Promise<void> {
  const k = keyword.trim();
  if (!k) return;
  const supabase = getSupabaseServer();
  await supabase.rpc("record_search", { p_keyword: k });
}

/**
 * Adjust a like counter. The caller (client) guards against double-liking the
 * same article from one device via localStorage, then calls this with +1/-1.
 */
export async function bumpLike(articleId: string, delta: 1 | -1): Promise<number> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.rpc("bump_like", { p_article_id: articleId, p_delta: delta });
  return typeof data === "number" ? data : 0;
}
