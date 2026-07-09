import Link from "next/link";
import { FileText, FolderTree, Eye, Search, Flame, Inbox, Heart, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryPie } from "@/features/admin/charts";
import { getDashboardStats } from "@/services/stats";
import { adminCategoryDistribution, adminRecentActivity, adminListArticles } from "@/services/admin";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [stats, distribution, activity, recent] = await Promise.all([
    getDashboardStats(),
    adminCategoryDistribution(),
    adminRecentActivity(8),
    adminListArticles({}),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">نظرة عامة</h1>
          <p className="text-sm text-muted-foreground">لمحة عن قاعدة المعرفة الخاصة بك.</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new"><PlusCircle className="size-4" /> مقال جديد</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المقالات" value={stats.total_articles} icon="file-text" accent="#6366f1" hint={`${stats.published} منشورة · ${stats.drafts} مسودّات`} />
        <StatCard label="الأقسام" value={stats.categories} icon="folder-tree" accent="#0ea5e9" />
        <StatCard label="إجمالي المشاهدات" value={stats.total_views} icon="eye" accent="#10b981" />
        <StatCard label="عمليات البحث" value={stats.total_searches} icon="search" accent="#f59e0b" />
        <StatCard label="إجمالي الإعجابات" value={stats.total_likes} icon="heart" accent="#ef4444" />
        <StatCard label="المواضيع المميزة" value={stats.hot_topics} icon="flame" accent="#ec4899" />
        <StatCard label="الطلبات المعلّقة" value={stats.pending_topics} icon="inbox" accent="#8b5cf6" />
        <StatCard label="منشورة" value={stats.published} icon="check-circle" accent="#22c55e" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">المحتوى حسب القسم</CardTitle></CardHeader>
          <CardContent><CategoryPie data={distribution} /></CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">أحدث المقالات</CardTitle>
            <Link href="/admin/articles" className="text-sm text-primary hover:underline">إدارة الكل</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {recent.slice(0, 6).map((a) => (
              <Link key={a.id} href={`/admin/articles/${a.id}/edit`} className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-accent">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.title}</span>
                <Badge variant={a.status === "published" ? "success" : a.status === "draft" ? "secondary" : "outline"}>{a.status}</Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">{a.views} مشاهدة</span>
              </Link>
            ))}
            {!recent.length && <p className="px-3 py-6 text-center text-sm text-muted-foreground">لا توجد مقالات بعد.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">النشاط الأخير</CardTitle></CardHeader>
        <CardContent>
          {activity.length ? (
            <ul className="divide-y">
              {activity.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{log.action}</code>
                    <span className="text-muted-foreground">{log.entity_type}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">لا يوجد نشاط مسجّل بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
