import { CategoriesManager } from "@/features/admin/categories-manager";
import { adminListCategories } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الأقسام</h1>
        <p className="text-sm text-muted-foreground">نظّم قاعدة المعرفة في أقسام ومواضيع.</p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
