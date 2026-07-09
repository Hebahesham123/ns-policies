"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveHotTopic, deleteHotTopic } from "@/actions/admin-misc";
import type { HotTopic } from "@/types";

export function HotTopicsManager({ topics }: { topics: HotTopic[] }) {
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState("5");
  const [saving, setSaving] = React.useState(false);

  const add = async () => {
    if (!title.trim()) return toast.error("أضف عنوانًا.");
    setSaving(true);
    await saveHotTopic({ title, priority: Number(priority) || 0 });
    setSaving(false);
    setTitle("");
    toast.success("تمت إضافة الموضوع المميّز.");
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>العنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="موضوع بارز لعرضه في الصفحة الرئيسية" />
          </div>
          <div className="space-y-1.5">
            <Label>الأولوية</Label>
            <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
          </div>
          <Button onClick={add} disabled={saving}><Plus className="size-4" /> إضافة</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {topics.map((t) => (
          <Card key={t.id} className="flex items-center gap-3 p-4">
            <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${t.color ?? "#ef4444"}1a`, color: t.color ?? "#ef4444" }}>
              <Icon name={t.icon} className="size-4" />
            </span>
            <span className="flex-1 truncate font-medium">{t.title}</span>
            <Badge variant="secondary">الأولوية {t.priority}</Badge>
            <Badge variant={t.active ? "success" : "outline"}>{t.active ? "مفعّل" : "مخفي"}</Badge>
            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={async () => { await deleteHotTopic(t.id); toast.success("تمت الإزالة."); }}>
              <Trash2 className="size-4" />
            </Button>
          </Card>
        ))}
        {!topics.length && <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">لا توجد مواضيع مميّزة بعد.</p>}
      </div>
    </div>
  );
}
