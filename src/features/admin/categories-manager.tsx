"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { saveCategory, deleteCategory, type CategoryInput } from "@/actions/admin-categories";
import type { Category } from "@/types";

const ICONS = ["folder", "users", "boxes", "warehouse", "factory", "briefcase", "shield-check", "book-open", "file-text", "settings"];
const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"];

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [open, setOpen] = React.useState(false);

  const startNew = () => { setEditing(null); setOpen(true); };
  const startEdit = (c: Category) => { setEditing(c); setOpen(true); };

  const remove = async (c: Category) => {
    if (!confirm(`حذف “${c.name}”؟ ستصبح المقالات غير مصنّفة.`)) return;
    await deleteCategory(c.id);
    toast.success("تم حذف القسم.");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startNew}><Plus className="size-4" /> قسم جديد</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((c) => (
          <Card key={c.id} className="flex items-center gap-3 p-4">
            <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
            <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ background: `${c.color ?? "#6366f1"}1a`, color: c.color ?? "#6366f1" }}>
              <Icon name={c.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">/{c.slug} · {c.active ? "مفعّل" : "مخفي"}</p>
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => startEdit(c)}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(c)}><Trash2 className="size-4" /></Button>
          </Card>
        ))}
      </div>

      <CategoryDialog open={open} onOpenChange={setOpen} category={editing} />
    </div>
  );
}

function CategoryDialog({ open, onOpenChange, category }: { open: boolean; onOpenChange: (v: boolean) => void; category: Category | null }) {
  const [form, setForm] = React.useState<CategoryInput>({ name: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(
      category
        ? { id: category.id, name: category.name, slug: category.slug, description: category.description, icon: category.icon ?? "folder", color: category.color ?? "#6366f1", order: category.order, active: category.active }
        : { name: "", icon: "folder", color: "#6366f1", active: true },
    );
  }, [category, open]);

  const set = <K extends keyof CategoryInput>(k: K, v: CategoryInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name?.trim()) return toast.error("الاسم مطلوب.");
    setSaving(true);
    const res = await saveCategory(form);
    setSaving(false);
    if (res.ok) { toast.success("تم حفظ القسم."); onOpenChange(false); }
    else toast.error(res.error ?? "فشل الحفظ.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? "تعديل القسم" : "قسم جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>الاسم</Label>
            <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="مثال: الموارد البشرية" />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>الأيقونة</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => set("icon", ic)} className={`grid size-8 place-items-center rounded-md border ${form.icon === ic ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <Icon name={ic} className="size-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>اللون</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((col) => (
                  <button key={col} type="button" onClick={() => set("color", col)} className={`size-8 rounded-md border-2 ${form.color === col ? "border-foreground" : "border-transparent"}`} style={{ background: col }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>مفعّل (مرئي على الموقع)</Label>
            <Switch checked={!!form.active} onCheckedChange={(v) => set("active", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
