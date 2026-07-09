import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticlesTable } from "@/features/admin/articles-table";
import { adminListArticles } from "@/services/admin";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "published", "draft", "archived"] as const;
const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  all: "الكل",
  published: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q } = await searchParams;
  const rows = await adminListArticles({ status, q });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المقالات</h1>
          <p className="text-sm text-muted-foreground">إنشاء المقالات المعرفية وتعديلها وإدارتها.</p>
        </div>
        <Button asChild><Link href="/admin/articles/new"><PlusCircle className="size-4" /> مقال جديد</Link></Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/articles${f === "all" ? "" : `?status=${f}`}`}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${status === f ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
          >
            {FILTER_LABELS[f]}
          </Link>
        ))}
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ArticlesTable rows={rows as any} />
    </div>
  );
}
