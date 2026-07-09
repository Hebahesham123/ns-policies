import { Breadcrumb } from "@/components/breadcrumb";
import { ArticleEditor } from "@/features/admin/article-editor";
import { adminListCategories } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await adminListCategories();
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "المقالات", href: "/admin/articles" }, { label: "جديد" }]} />
      <h1 className="text-2xl font-bold tracking-tight">مقال جديد</h1>
      <ArticleEditor categories={categories} />
    </div>
  );
}
