import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArticleEditor } from "@/features/admin/article-editor";
import { adminGetArticle, adminListCategories } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, categories] = await Promise.all([adminGetArticle(id), adminListCategories()]);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb items={[{ label: "المقالات", href: "/admin/articles" }, { label: "تعديل" }]} />
        <Button asChild variant="outline" size="sm">
          <Link href={`/articles/${article.slug}`} target="_blank"><ExternalLink className="size-4" /> معاينة</Link>
        </Button>
      </div>
      <h1 className="truncate text-2xl font-bold tracking-tight">{article.title}</h1>
      <ArticleEditor article={article} categories={categories} />
    </div>
  );
}
