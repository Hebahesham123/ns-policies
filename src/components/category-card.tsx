import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { formatDate } from "@/lib/utils";
import type { CategoryWithCount } from "@/types";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  const color = category.color ?? "#6366f1";
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="absolute -end-6 -top-6 size-24 rounded-full opacity-10 transition-transform group-hover:scale-125"
        style={{ background: color }}
      />
      <div className="mb-4 grid size-12 place-items-center rounded-xl" style={{ background: `${color}1a`, color }}>
        <Icon name={category.icon} className="size-6" />
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight group-hover:text-primary">{category.name}</h3>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {category.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{category.article_count} مقالات</span>
        <span>آخر تحديث {formatDate(category.updated_at)}</span>
      </div>
    </Link>
  );
}
