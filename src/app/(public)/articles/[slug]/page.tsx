import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Clock, CalendarDays, RefreshCw, User } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/rich-text";
import { ArticleCard } from "@/components/article-card";
import { Icon } from "@/components/icon";
import { ViewTracker } from "@/features/article/view-tracker";
import { EngagementBar } from "@/features/article/engagement-bar";
import { getArticleBySlug, getRelatedArticles, listPublishedSlugs } from "@/services/articles";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { formatDate, formatCompact } from "@/lib/utils";
import { env } from "@/lib/env";

export const revalidate = 300;

// Prerender every published article at build time → instant first load.
export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "غير موجود" };
  return {
    title: article.title,
    description: article.summary ?? undefined,
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      type: "article",
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 3);
  const color = article.category?.color ?? "#6366f1";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author ? { "@type": "Organization", name: article.author } : undefined,
    image: article.featured_image ?? undefined,
    url: `${env.siteUrl}/articles/${article.slug}`,
  };

  return (
    <article className="container max-w-3xl py-8">
      <ViewTracker articleId={article.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb
        items={[
          ...(article.category ? [{ label: article.category.name, href: `/categories/${article.category.slug}` }] : []),
          { label: article.title },
        ]}
      />

      <header className="mt-6">
        {article.category && (
          <Link
            href={`/categories/${article.category.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color }}
          >
            <Icon name={article.category.icon} className="size-4" />
            {article.category.name}
          </Link>
        )}
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        {article.summary && <p className="mt-3 text-lg text-muted-foreground">{article.summary}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {article.author && <span className="inline-flex items-center gap-1.5"><User className="size-4" /> {article.author}</span>}
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDate(article.published_at)}</span>
          <span className="inline-flex items-center gap-1.5"><RefreshCw className="size-4" /> آخر تحديث {formatDate(article.updated_at)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {article.estimated_read_time} دقيقة</span>
          <span className="inline-flex items-center gap-1.5"><Eye className="size-4" /> {formatCompact(article.views)}</span>
          <Badge variant="secondary">{DIFFICULTY_LABELS[article.difficulty]}</Badge>
        </div>
      </header>

      {article.featured_image && (
        <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-2xl border">
          <Image src={article.featured_image} alt={article.title} fill sizes="768px" className="object-cover" priority />
        </div>
      )}

      <Separator className="my-8" />

      <RichText content={article.content} />

      {article.source && (
        <p className="mt-8 text-sm text-muted-foreground">
          المصدر: <span className="text-foreground">{article.source}</span>
        </p>
      )}

      <Separator className="my-8" />

      <EngagementBar articleId={article.id} initialLikes={article.likes} title={article.title} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">مقالات ذات صلة</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
