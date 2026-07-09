"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Star, Pin, Copy, Trash2, Send, FileEdit, Archive, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  setArticleStatus, toggleArticleFlag, deleteArticle, duplicateArticle,
} from "@/actions/admin-articles";
import { formatDate, formatCompact } from "@/lib/utils";

type Row = {
  id: string; title: string; slug: string; status: string;
  featured: boolean; pinned: boolean; views: number; likes: number;
  updated_at: string; category: { name: string; color: string } | null;
};

export function ArticlesTable({ rows }: { rows: Row[] }) {
  const [busy, setBusy] = React.useState<string | null>(null);

  const run = async (id: string, fn: () => Promise<unknown>, msg: string) => {
    setBusy(id);
    try {
      await fn();
      toast.success(msg);
    } catch {
      toast.error("فشل الإجراء.");
    } finally {
      setBusy(null);
    }
  };

  if (!rows.length) {
    return <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">لا توجد مقالات مطابقة للتصفية.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-start text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">العنوان</th>
            <th className="px-4 py-3 font-medium">القسم</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">المشاهدات</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">آخر تحديث</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((a) => (
            <tr key={a.id} className={busy === a.id ? "opacity-50" : ""}>
              <td className="max-w-xs px-4 py-3">
                <Link href={`/admin/articles/${a.id}/edit`} className="flex items-center gap-2 font-medium hover:text-primary">
                  <span className="truncate">{a.title}</span>
                  {a.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                  {a.pinned && <Pin className="size-3.5 shrink-0 text-primary" />}
                </Link>
              </td>
              <td className="px-4 py-3">
                {a.category ? (
                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: a.category.color }}>
                    <span className="size-2 rounded-full" style={{ background: a.category.color }} />
                    {a.category.name}
                  </span>
                ) : <span className="text-xs text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3">
                <Badge variant={a.status === "published" ? "success" : a.status === "draft" ? "secondary" : "outline"}>{a.status}</Badge>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatCompact(a.views)}</td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDate(a.updated_at)}</td>
              <td className="px-4 py-3 text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/admin/articles/${a.id}/edit`}><FileEdit /> تعديل</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/articles/${a.slug}`} target="_blank"><ExternalLink /> معاينة</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {a.status !== "published" && (
                      <DropdownMenuItem onClick={() => run(a.id, () => setArticleStatus(a.id, "published"), "تم النشر")}><Send /> نشر</DropdownMenuItem>
                    )}
                    {a.status !== "draft" && (
                      <DropdownMenuItem onClick={() => run(a.id, () => setArticleStatus(a.id, "draft"), "نُقل إلى المسودة")}><FileEdit /> نقل إلى المسودة</DropdownMenuItem>
                    )}
                    {a.status !== "archived" && (
                      <DropdownMenuItem onClick={() => run(a.id, () => setArticleStatus(a.id, "archived"), "تمت الأرشفة")}><Archive /> أرشفة</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => run(a.id, () => toggleArticleFlag(a.id, "featured", !a.featured), a.featured ? "تم إلغاء التمييز" : "تم التمييز")}><Star /> {a.featured ? "إلغاء التمييز" : "تمييز"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => run(a.id, () => toggleArticleFlag(a.id, "pinned", !a.pinned), a.pinned ? "تم إلغاء التثبيت" : "تم التثبيت")}><Pin /> {a.pinned ? "إلغاء التثبيت" : "تثبيت"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => run(a.id, () => duplicateArticle(a.id), "تم النسخ")}><Copy /> نسخة</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => { if (confirm(`حذف “${a.title}”؟ لا يمكن التراجع عن هذا الإجراء.`)) run(a.id, () => deleteArticle(a.id), "تم الحذف"); }}
                    >
                      <Trash2 /> حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
