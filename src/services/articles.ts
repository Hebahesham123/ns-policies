import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import { decodeSlug } from "@/lib/utils";
import type { Article, ArticleWithCategory, SearchResult, SortOption } from "@/types";

const CATEGORY_SELECT = "id,name,slug,color,icon,lang,name_alt";
// Slim projection for cards/lists — excludes the heavy `content` + `content_text`
// columns so list pages transfer a fraction of the data (big speed win).
const CARD_COLS =
  "id,title,slug,summary,featured_image,category_id,keywords,difficulty,estimated_read_time,author,status,featured,pinned,views,likes,published_at,created_at,updated_at,lang,title_alt,summary_alt";
const LIST_SELECT = `${CARD_COLS}, category:categories(${CATEGORY_SELECT})`;
// Full projection (includes rich-text body) — only for the article detail page.
const DETAIL_SELECT = `*, category:categories(${CATEGORY_SELECT})`;

function orderFor(sort: SortOption) {
  switch (sort) {
    case "newest":
      return { column: "published_at", ascending: false };
    case "popular":
      return { column: "views", ascending: false };
    case "alphabetical":
      return { column: "title", ascending: true };
    default:
      return { column: "published_at", ascending: false };
  }
}

/** Published articles list with optional category filter, sort & pagination. */
export async function listArticles(opts: {
  category?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: ArticleWithCategory[]; total: number }> {
  const { category, sort = "newest", page = 1, pageSize = 12 } = opts;
  const supabase = getSupabaseServer();
  const { column, ascending } = orderFor(sort);
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("articles")
    .select(LIST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order(column, { ascending, nullsFirst: false })
    .range(from, from + pageSize - 1);

  if (category) query = query.eq("category_id", category);

  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []) as unknown as ArticleWithCategory[], total: count ?? 0 };
}

export async function getFeatured(limit = 6): Promise<ArticleWithCategory[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ArticleWithCategory[];
}

export async function getMostViewed(limit = 6): Promise<ArticleWithCategory[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ArticleWithCategory[];
}

export async function getLatest(limit = 6): Promise<ArticleWithCategory[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ArticleWithCategory[];
}

export async function getRecentlyUpdated(limit = 6): Promise<ArticleWithCategory[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ArticleWithCategory[];
}

/** All published article slugs — used by generateStaticParams to prerender. */
export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("articles").select("slug").eq("status", "published");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithCategory | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(DETAIL_SELECT)
    .eq("slug", decodeSlug(slug))
    .eq("status", "published")
    .maybeSingle();
  return (data as ArticleWithCategory) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 4): Promise<ArticleWithCategory[]> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("articles")
    .select(LIST_SELECT)
    .eq("status", "published")
    .eq("category_id", article.category_id ?? "")
    .neq("id", article.id)
    .order("views", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ArticleWithCategory[];
}

/** Full-text search via the search_articles RPC. */
export async function searchArticles(
  query: string,
  category?: string,
  page = 1,
  pageSize = 12,
): Promise<SearchResult[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc("search_articles", {
    p_query: query,
    p_category: category ?? null,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });
  if (error) throw error;
  return (data ?? []) as SearchResult[];
}
