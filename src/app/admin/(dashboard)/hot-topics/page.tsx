import { HotTopicsManager } from "@/features/admin/hot-topics-manager";
import { adminListHotTopics } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminHotTopicsPage() {
  const topics = await adminListHotTopics();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">المواضيع المميزة</h1>
        <p className="text-sm text-muted-foreground">نسّق أبرز المواضيع المعروضة بشكل بارز في الصفحة الرئيسية.</p>
      </div>
      <HotTopicsManager topics={topics} />
    </div>
  );
}
