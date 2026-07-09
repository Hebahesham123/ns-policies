import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import { decodeSlug } from "@/lib/utils";
import type { Category, CategoryWithCount, CategoryNode, HotTopic, TrendingSearch, Article } from "@/types";

// --- Categories ------------------------------------------------------------
export async function listCategories(): Promise<Category[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("order", { ascending: true });
  return (data ?? []) as Category[];
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = getSupabaseServer();
  const [cats, counts] = await Promise.all([
    listCategories(),
    supabase.from("articles").select("category_id").eq("status", "published"),
  ]);
  const tally = new Map<string, number>();
  for (const row of counts.data ?? []) {
    const id = (row as { category_id: string | null }).category_id;
    if (id) tally.set(id, (tally.get(id) ?? 0) + 1);
  }
  return cats.map((c) => ({ ...c, article_count: tally.get(c.id) ?? 0 }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("categories").select("*").eq("slug", decodeSlug(slug)).maybeSingle();
  return (data as Category) ?? null;
}

/** Build the full category tree (top-level roots with nested children). */
export async function listCategoryTree(): Promise<CategoryNode[]> {
  const flat = await listCategoriesWithCounts();
  const byId = new Map<string, CategoryNode>(
    flat.map((c) => [c.id, { ...c, children: [], total_count: c.article_count }]),
  );
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  // aggregate counts bottom-up so parents include their subfolders
  const aggregate = (n: CategoryNode): number => {
    n.total_count = n.article_count + n.children.reduce((sum, c) => sum + aggregate(c), 0);
    return n.total_count;
  };
  const sortRec = (n: CategoryNode) => {
    n.children.sort((a, b) => a.order - b.order);
    n.children.forEach(sortRec);
  };
  roots.sort((a, b) => a.order - b.order);
  roots.forEach((r) => { aggregate(r); sortRec(r); });
  return roots;
}

/** All active category slugs — used by generateStaticParams to prerender. */
export async function listCategorySlugs(): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("categories").select("slug").eq("active", true);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

/** Direct subcategories of a category, with article counts. */
export async function getSubcategories(parentId: string): Promise<CategoryWithCount[]> {
  const flat = await listCategoriesWithCounts();
  return flat.filter((c) => c.parent_id === parentId).sort((a, b) => a.order - b.order);
}

// --- Hot topics ------------------------------------------------------------
export async function listHotTopics(limit = 8): Promise<(HotTopic & { article: Pick<Article, "slug"> | null })[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("hot_topics")
    .select("*, article:articles(slug)")
    .eq("active", true)
    .order("priority", { ascending: false })
    .limit(limit);
  return (data ?? []) as (HotTopic & { article: Pick<Article, "slug"> | null })[];
}

// --- Trending searches -----------------------------------------------------
export async function listTrendingSearches(limit = 10): Promise<TrendingSearch[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("trending_searches")
    .select("*")
    .order("search_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as TrendingSearch[];
}

// --- Global recently-viewed ------------------------------------------------
export async function listRecentlyViewed(limit = 6) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("recent_views")
    .select("viewed_at, article:articles(id,title,slug,summary,featured_image,estimated_read_time,category_id)")
    .order("viewed_at", { ascending: false })
    .limit(30);
  // de-duplicate by article, keep most-recent
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const row of data ?? []) {
    const rel = (row as { article: unknown }).article;
    const a = (Array.isArray(rel) ? rel[0] : rel) as { id: string } | null;
    if (a && !seen.has(a.id)) {
      seen.add(a.id);
      out.push(a);
    }
    if (out.length >= limit) break;
  }
  return out as { id: string; title: string; slug: string; summary: string | null; featured_image: string | null; estimated_read_time: number; category_id: string | null }[];
}
