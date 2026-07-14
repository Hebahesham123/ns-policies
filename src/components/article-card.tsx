import Link from "next/link";
import { Eye, Clock, Heart } from "lucide-react";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Bi } from "@/components/lang/bi";
import { formatCompact } from "@/lib/utils";
import { bothLangs } from "@/lib/i18n";
import type { ArticleWithCategory } from "@/types";

export function ArticleCard({ article }: { article: ArticleWithCategory }) {
  const title = bothLangs(article.title, article.title_alt, article.lang);
  const summary = bothLangs(article.summary, article.summary_alt, article.lang);
  const catName = article.category
    ? bothLangs(article.category.name, article.category.name_alt, article.category.lang)
    : null;
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col rounded-xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        {article.category && catName && (
          <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: article.category.color ?? undefined }}>
            <Icon name={article.category.icon} className="size-3.5" />
            <Bi ar={catName.ar} en={catName.en} />
          </span>
        )}
        {article.pinned && <Badge variant="warning"><Bi ar="مثبّت" en="Pinned" /></Badge>}
      </div>
      <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight group-hover:text-primary">
        <Bi ar={title.ar} en={title.en} />
      </h3>
      {(summary.ar || summary.en) && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          <Bi ar={summary.ar} en={summary.en} />
        </p>
      )}
      <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {formatCompact(article.views)}</span>
        <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> {formatCompact(article.likes)}</span>
        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {article.estimated_read_time} <Bi ar="دقيقة" en="min" /></span>
      </div>
    </Link>
  );
}
