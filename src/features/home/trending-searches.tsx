import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import type { TrendingSearch } from "@/types";

export function TrendingSearches({ searches }: { searches: TrendingSearch[] }) {
  if (!searches.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {searches.map((s, i) => (
        <Link
          key={s.id}
          href={`/search?q=${encodeURIComponent(s.keyword)}`}
          className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-soft transition hover:border-primary/40 hover:bg-accent"
        >
          <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {i + 1}
          </span>
          <span className="font-medium">{s.keyword}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3" /> {formatCompact(s.search_count)}
          </span>
        </Link>
      ))}
    </div>
  );
}
