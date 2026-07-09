import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.rpc("dashboard_stats");
  return (data ?? {
    total_articles: 0, published: 0, drafts: 0, categories: 0,
    total_views: 0, total_likes: 0, total_searches: 0, hot_topics: 0, pending_topics: 0,
  }) as DashboardStats;
}

/** Public site statistics for the homepage strip. */
export async function getPublicStats() {
  const s = await getDashboardStats();
  return {
    articles: s.published,
    categories: s.categories,
    views: s.total_views,
    searches: s.total_searches,
  };
}
