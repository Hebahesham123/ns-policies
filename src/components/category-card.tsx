import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { Bi } from "@/components/lang/bi";
import { formatDate } from "@/lib/utils";
import { bothLangs } from "@/lib/i18n";
import type { CategoryWithCount } from "@/types";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  const color = category.color ?? "#6366f1";
  const name = bothLangs(category.name, category.name_alt, category.lang);
  const desc = bothLangs(category.description, category.description_alt, category.lang);
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
        <h3 className="font-semibold tracking-tight group-hover:text-primary"><Bi ar={name.ar} en={name.en} /></h3>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {(desc.ar || desc.en) && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground"><Bi ar={desc.ar} en={desc.en} /></p>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{category.article_count} <Bi ar="مقالات" en="articles" /></span>
        <span><Bi ar="آخر تحديث" en="Updated" /> {formatDate(category.updated_at)}</span>
      </div>
    </Link>
  );
}
