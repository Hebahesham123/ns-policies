import { ArticleGridSkeleton } from "@/components/article-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-12">
      <Skeleton className="mb-3 h-8 w-56" />
      <Skeleton className="mb-10 h-4 w-80" />
      <ArticleGridSkeleton count={6} />
    </div>
  );
}
