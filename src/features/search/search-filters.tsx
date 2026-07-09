"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";
import type { Category } from "@/types";

export function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") ?? "relevance";
  const category = params.get("category") ?? "all";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || !value) next.delete(key);
    else next.set(key, value);
    router.push(`/search?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={category} onValueChange={(v) => update("category", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="كل الأقسام" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأقسام</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => update("sort", v)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="الترتيب" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
