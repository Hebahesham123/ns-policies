import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { CategoryPie, SearchesBar } from "@/features/admin/charts";
import { getDashboardStats } from "@/services/stats";
import { adminCategoryDistribution, adminTopSearches, adminListArticles } from "@/services/admin";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [stats, distribution, searches, articles] = await Promise.all([
    getDashboardStats(),
    adminCategoryDistribution(),
    adminTopSearches(10),
    adminListArticles({ status: "published" }),
  ]);

  const topViewed = [...articles].sort((a, b) => b.views - a.views).slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التحليلات</h1>
        <p className="text-sm text-muted-foreground">افهم كيفية استخدام قاعدة المعرفة.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المشاهدات" value={stats.total_views} icon="eye" accent="#10b981" />
        <StatCard label="إجمالي عمليات البحث" value={stats.total_searches} icon="search" accent="#f59e0b" />
        <StatCard label="إجمالي الإعجابات" value={stats.total_likes} icon="heart" accent="#ef4444" />
        <StatCard label="منشورة" value={stats.published} icon="file-text" accent="#6366f1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">أكثر عمليات البحث</CardTitle></CardHeader>
          <CardContent><SearchesBar data={searches} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">توزيع المحتوى</CardTitle></CardHeader>
          <CardContent><CategoryPie data={distribution} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">المقالات الأكثر مشاهدة</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {topViewed.map((a, i) => (
              <li key={a.id} className="flex items-center gap-4 py-2.5 text-sm">
                <span className="grid size-7 place-items-center rounded-md bg-muted text-xs font-semibold">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{a.title}</span>
                <span className="text-muted-foreground">{formatCompact(a.views)} مشاهدة</span>
              </li>
            ))}
            {!topViewed.length && <li className="py-6 text-center text-sm text-muted-foreground">لا توجد بيانات بعد.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
