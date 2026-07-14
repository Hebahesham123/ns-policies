import { Hero } from "@/features/home/hero";
import { HotTopics } from "@/features/home/hot-topics";
import { TrendingSearches } from "@/features/home/trending-searches";
import { SectionHeader } from "@/components/section-header";
import { ArticleGrid } from "@/components/article-grid";
import { CategoryCard } from "@/components/category-card";
import { Bi } from "@/components/lang/bi";
import { TopicRequestCta } from "@/features/topics/topic-request-cta";
import { getRecentlyUpdated } from "@/services/articles";
import { listCategoryTree, listHotTopics, listTrendingSearches } from "@/services/catalog";
import { getSetting } from "@/services/settings";

// Cached & revalidated every 5 min (admin edits bust it via revalidatePath).
// This lets Next serve the page from cache and prefetch it for instant clicks.
export const revalidate = 300;

export default async function HomePage() {
  const [homepage, hotTopics, trending, categories, recentlyUpdated] = await Promise.all([
    getSetting("homepage"),
    listHotTopics(8),
    listTrendingSearches(8),
    listCategoryTree(),
    getRecentlyUpdated(6),
  ]);

  const hp = (homepage ?? {}) as { hero_title?: string; hero_subtitle?: string };

  return (
    <>
      <Hero
        title={hp.hero_title ?? "كل ما يحتاج فريقك إلى معرفته"}
        subtitle={hp.hero_subtitle ?? "السياسات والإجراءات والخبرات — قابلة للبحث ومنظّمة ومحدّثة دائمًا."}
        titleEn="Everything your team needs to know"
        subtitleEn="Policies, procedures & know-how — searchable, organized, always up to date."
      />

      <div className="container space-y-20 py-16">
        {/* Hot topics */}
        {hotTopics.length > 0 && (
          <section>
            <SectionHeader icon="flame" title={<Bi ar="المواضيع المميزة" en="Hot topics" />} subtitle={<Bi ar="أبرز المختارات التي يقرأها الفريق الآن." en="Curated highlights the team is reading now." />} />
            <HotTopics topics={hotTopics} />
          </section>
        )}

        {/* Categories */}
        <section>
          <SectionHeader icon="layout-grid" title={<Bi ar="تصفّح حسب القسم" en="Browse by category" />} subtitle={<Bi ar="اعثر على المحتوى منظّمًا حسب القسم." en="Find content organized by section." />} href="/categories" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <CategoryCard key={c.id} category={{ ...c, article_count: c.total_count }} />
            ))}
          </div>
        </section>

        {/* Trending searches */}
        {trending.length > 0 && (
          <section>
            <SectionHeader icon="trending-up" title={<Bi ar="عمليات البحث الرائجة" en="Trending searches" />} subtitle={<Bi ar="ما الذي يبحث عنه الناس." en="What people are searching for." />} href="/trending" />
            <TrendingSearches searches={trending} />
          </section>
        )}

        {/* Recently updated */}
        {recentlyUpdated.length > 0 && (
          <section>
            <SectionHeader icon="refresh-cw" title={<Bi ar="المحدّثة حديثًا" en="Recently updated" />} subtitle={<Bi ar="محتوى تمّت مراجعته حديثًا." en="Freshly reviewed content." />} />
            <ArticleGrid articles={recentlyUpdated} />
          </section>
        )}

        {/* Request a topic CTA */}
        <TopicRequestCta />
      </div>
    </>
  );
}
