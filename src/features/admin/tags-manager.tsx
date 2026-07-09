"use client";

import * as React from "react";
import { Plus, X, Hash } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTag, deleteTag } from "@/actions/admin-misc";
import type { Tag } from "@/types";

type TagRow = Tag & { article_tags?: { count: number }[] };

export function TagsManager({ tags }: { tags: TagRow[] }) {
  const [name, setName] = React.useState("");

  const add = async () => {
    if (!name.trim()) return;
    await createTag(name.trim());
    setName("");
    toast.success("تم إنشاء الوسم.");
  };

  return (
    <div className="space-y-6">
      <Card className="flex items-end gap-3 p-5">
        <div className="flex-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم وسم جديد" onKeyDown={(e) => e.key === "Enter" && add()} />
        </div>
        <Button onClick={add}><Plus className="size-4" /> إضافة وسم</Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 ps-3 pe-1.5 text-sm shadow-soft">
            <Hash className="size-3.5 text-muted-foreground" />
            {t.name}
            <span className="text-xs text-muted-foreground">{t.article_tags?.[0]?.count ?? 0}</span>
            <button onClick={async () => { await deleteTag(t.id); toast.success("تم حذف الوسم."); }} className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {!tags.length && <p className="text-sm text-muted-foreground">لا توجد وسوم بعد.</p>}
      </div>
    </div>
  );
}
