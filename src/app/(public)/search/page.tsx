import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, Eye, Clock } from "lucide-react";
import { SearchFilters } from "@/features/search/search-filters";
import { EmptyState } from "@/components/empty-state";
import { ArticleGrid } from "@/components/article-grid";
import { listCategories } from "@/services/catalog";
import { listArticles, searchArticles } from "@/services/articles";
import { recordSearch } from "@/actions/engagement";
import { formatCompact } from "@/lib/utils";
import type { SortOption } from "@/types";

export const metadata: Metadata = { title: "البحث", description: "ابحث في قاعدة المعرفة." };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q = "", category, sort } = await searchParams;
  const query = q.trim();
  const categories = await listCategories();

  // Record the search term (fire-and-forget) when there is a query.
  if (query) void recordSearch(query);

  // With a query -> full-text RPC. Without -> browse latest/popular via listArticles.
  const results = query
    ? await searchArticles(query, category, 1, 24)
    : (await listArticles({ category, sort: (sort as SortOption) ?? "newest", pageSize: 24 })).items;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {query ? <>نتائج البحث عن “{query}”</> : "تصفّح كل المقالات"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          عُثر على {results.length} {results.length === 1 ? "مقال" : "مقالات"}
        </p>
      </div>

      <div className="mb-8">
        <SearchFilters categories={categories} />
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon="search-x"
          title="لا توجد نتائج"
          description={query ? `لم نعثر على أي نتائج لـ “${query}”. جرّب كلمات مختلفة.` : "لا توجد مقالات منشورة بعد."}
        />
      ) : query ? (
        <div className="space-y-3">
          {(results as Array<{ id: string; slug: string; title: string; summary: string | null; views: number; estimated_read_time: number }>).map((r) => (
            <Link
              key={r.id}
              href={`/articles/${r.slug}`}
              className="group flex flex-col gap-1 rounded-xl border bg-card p-5 shadow-soft transition hover:bg-accent"
            >
              <h3 className="font-semibold group-hover:text-primary">{r.title}</h3>
              {r.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
              <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {formatCompact(r.views)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {r.estimated_read_time} دقيقة</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <ArticleGrid articles={results as any} />
      )}
    </div>
  );
}
