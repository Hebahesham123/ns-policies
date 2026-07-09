import Link from "next/link";
import { Icon } from "@/components/icon";
import type { HotTopic, Article } from "@/types";

type HotTopicRow = HotTopic & { article: Pick<Article, "slug"> | null };

export function HotTopics({ topics }: { topics: HotTopicRow[] }) {
  if (!topics.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {topics.map((t) => {
        const href = t.article?.slug ? `/articles/${t.article.slug}` : "/search";
        const color = t.color ?? "#ef4444";
        return (
          <Link
            key={t.id}
            href={href}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1a`, color }}>
              <Icon name={t.icon} className="size-5" />
            </span>
            <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">{t.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
