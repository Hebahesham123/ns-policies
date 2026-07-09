"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TiptapEditor } from "@/features/editor/tiptap";
import { saveArticle, type ArticleInput } from "@/actions/admin-articles";
import { slugify, docToText, readingTime } from "@/lib/utils";
import type { Article, Category } from "@/types";

export function ArticleEditor({ article, categories }: { article?: Article; categories: Category[] }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState<"draft" | "publish" | null>(null);
  const [form, setForm] = React.useState<ArticleInput>({
    id: article?.id,
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    summary: article?.summary ?? "",
    content: article?.content ?? null,
    category_id: article?.category_id ?? null,
    featured_image: article?.featured_image ?? null,
    keywords: article?.keywords ?? [],
    difficulty: article?.difficulty ?? "beginner",
    source: article?.source ?? null,
    author: article?.author ?? null,
    status: article?.status ?? "draft",
    featured: article?.featured ?? false,
    pinned: article?.pinned ?? false,
  });

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (status: "draft" | "published") => {
    if (!form.title.trim()) return toast.error("يرجى إضافة عنوان أولاً.");
    setSaving(status === "published" ? "publish" : "draft");
    const text = form.content ? docToText(form.content) : "";
    const res = await saveArticle({
      ...form,
      status,
      slug: form.slug?.trim() || slugify(form.title),
      keywords: form.keywords,
      // read time recalculated from content
      // (server also stores content_text)
    } as ArticleInput);
    setSaving(null);
    if (res.ok) {
      toast.success(status === "published" ? "تم نشر المقال." : "تم حفظ المسودة.");
      if (!form.id && res.id) router.replace(`/admin/articles/${res.id}/edit`);
      router.refresh();
      void text; void readingTime;
    } else {
      toast.error(res.error ?? "فشل الحفظ.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">العنوان</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="عنوان المقال"
            className="h-12 text-lg font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">المُعرّف</Label>
          <div className="flex gap-2">
            <Input id="slug" value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="يُنشأ تلقائيًا من العنوان" />
            <Button type="button" variant="outline" onClick={() => set("slug", slugify(form.title))} title="إنشاء من العنوان">
              <Wand2 className="size-4" /> إنشاء
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">الملخّص</Label>
          <Textarea id="summary" value={form.summary ?? ""} onChange={(e) => set("summary", e.target.value)} placeholder="وصف قصير يظهر في البطاقات والبحث." rows={2} />
        </div>

        <div className="space-y-1.5">
          <Label>المحتوى</Label>
          <TiptapEditor value={form.content} onChange={(doc) => set("content", doc)} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">نشر</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => submit("published")} disabled={saving !== null}>
                {saving === "publish" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} نشر
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => submit("draft")} disabled={saving !== null}>
                {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} مسودة
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="cursor-pointer">مميّز</Label>
              <Switch id="featured" checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pinned" className="cursor-pointer">مثبّت</Label>
              <Switch id="pinned" checked={!!form.pinned} onCheckedChange={(v) => set("pinned", v)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">التنظيم</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select value={form.category_id ?? "none"} onValueChange={(v) => set("category_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">غير مصنّف</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>المستوى</Label>
              <Select value={form.difficulty ?? "beginner"} onValueChange={(v) => set("difficulty", v as ArticleInput["difficulty"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدّم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author">الكاتب / التوقيع</Label>
              <Input id="author" value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} placeholder="مثال: فريق الموارد البشرية" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keywords">الكلمات المفتاحية (مفصولة بفواصل)</Label>
              <Input
                id="keywords"
                defaultValue={(form.keywords ?? []).join(", ")}
                onBlur={(e) => set("keywords", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="التعيين، الموارد البشرية، قائمة التحقق"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">الوسائط والمصدر</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="featured_image">رابط الصورة المميّزة</Label>
              <Input id="featured_image" value={form.featured_image ?? ""} onChange={(e) => set("featured_image", e.target.value || null)} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">المصدر</Label>
              <Input id="source" value={form.source ?? ""} onChange={(e) => set("source", e.target.value || null)} placeholder="المستند الأصلي / الرابط" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
