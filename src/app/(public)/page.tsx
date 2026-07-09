import { Hero } from "@/features/home/hero";
import { HotTopics } from "@/features/home/hot-topics";
import { TrendingSearches } from "@/features/home/trending-searches";
import { SectionHeader } from "@/components/section-header";
import { ArticleGrid } from "@/components/article-grid";
import { CategoryCard } from "@/components/category-card";
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
      />

      <div className="container space-y-20 py-16">
        {/* Hot topics */}
        {hotTopics.length > 0 && (
          <section>
            <SectionHeader icon="flame" title="المواضيع المميزة" subtitle="أبرز المختارات التي يقرأها الفريق الآن." />
            <HotTopics topics={hotTopics} />
          </section>
        )}

        {/* Categories */}
        <section>
          <SectionHeader icon="layout-grid" title="تصفّح حسب القسم" subtitle="اعثر على المحتوى منظّمًا حسب القسم." href="/categories" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <CategoryCard key={c.id} category={{ ...c, article_count: c.total_count }} />
            ))}
          </div>
        </section>

        {/* Trending searches */}
        {trending.length > 0 && (
          <section>
            <SectionHeader icon="trending-up" title="عمليات البحث الرائجة" subtitle="ما الذي يبحث عنه الناس." href="/trending" />
            <TrendingSearches searches={trending} />
          </section>
        )}

        {/* Recently updated */}
        {recentlyUpdated.length > 0 && (
          <section>
            <SectionHeader icon="refresh-cw" title="المحدّثة حديثًا" subtitle="محتوى تمّت مراجعته حديثًا." />
            <ArticleGrid articles={recentlyUpdated} />
          </section>
        )}

        {/* Request a topic CTA */}
        <TopicRequestCta />
      </div>
    </>
  );
}
