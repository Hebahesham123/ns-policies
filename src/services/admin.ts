import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Article, Category, UserSubmittedTopic, AuditLog, HotTopic, Tag } from "@/types";

/** All articles (any status) for the admin table. */
export async function adminListArticles(opts: { status?: string; q?: string } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("articles")
    .select("id,title,slug,status,featured,pinned,views,likes,category_id,updated_at, category:categories(name,color)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);
  if (opts.q) query = query.ilike("title", `%${opts.q}%`);
  const { data } = await query;
  return (data ?? []) as unknown as (Pick<Article, "id" | "title" | "slug" | "status" | "featured" | "pinned" | "views" | "likes" | "category_id" | "updated_at"> & { category: { name: string; color: string } | null })[];
}

export async function adminGetArticle(id: string): Promise<Article | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  return (data as Article) ?? null;
}

export async function adminListCategories(): Promise<Category[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("categories").select("*").order("order", { ascending: true });
  return (data ?? []) as Category[];
}

export async function adminListRequests(): Promise<UserSubmittedTopic[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("user_submitted_topics").select("*").order("created_at", { ascending: false });
  return (data ?? []) as UserSubmittedTopic[];
}

export async function adminListHotTopics() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("hot_topics").select("*").order("priority", { ascending: false });
  return (data ?? []) as HotTopic[];
}

export async function adminListTags() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("tags").select("*, article_tags(count)").order("name");
  return (data ?? []) as (Tag & { article_tags: { count: number }[] })[];
}

export async function adminRecentActivity(limit = 8): Promise<AuditLog[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as AuditLog[];
}

/** Article counts per category for the distribution chart. */
export async function adminCategoryDistribution() {
  const supabase = getSupabaseAdmin();
  const [{ data: cats }, { data: arts }] = await Promise.all([
    supabase.from("categories").select("id,name,color"),
    supabase.from("articles").select("category_id"),
  ]);
  const tally = new Map<string, number>();
  for (const a of arts ?? []) {
    const id = (a as { category_id: string | null }).category_id;
    if (id) tally.set(id, (tally.get(id) ?? 0) + 1);
  }
  return (cats ?? []).map((c) => ({ name: c.name as string, value: tally.get(c.id as string) ?? 0, color: c.color as string }));
}

/** Most-searched keywords for analytics. */
export async function adminTopSearches(limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("trending_searches").select("keyword,search_count").order("search_count", { ascending: false }).limit(limit);
  return (data ?? []) as { keyword: string; search_count: number }[];
}
