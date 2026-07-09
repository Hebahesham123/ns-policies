import { TagsManager } from "@/features/admin/tags-manager";
import { adminListTags } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await adminListTags();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الوسوم</h1>
        <p className="text-sm text-muted-foreground">أنشئ وأدِر الوسوم المستخدمة للربط بين المقالات.</p>
      </div>
      <TagsManager tags={tags} />
    </div>
  );
}
