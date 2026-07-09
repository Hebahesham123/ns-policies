import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleWithCategory } from "@/types";

export function ArticleGrid({ articles }: { articles: ArticleWithCategory[] }) {
  if (!articles.length) {
    return <EmptyState icon="file-search" title="لا توجد مقالات بعد" description="سيظهر المحتوى هنا بمجرد نشره." />;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card shadow-soft">
          <Skeleton className="aspect-[16/9] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
