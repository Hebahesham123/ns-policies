import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { TrendingSearches } from "@/features/home/trending-searches";
import { ArticleGrid } from "@/components/article-grid";
import { listTrendingSearches } from "@/services/catalog";
import { getMostViewed, getLatest, getRecentlyUpdated } from "@/services/articles";

export const revalidate = 300;
export const metadata: Metadata = { title: "الرائج", description: "ما يقرأه الفريق ويبحث عنه." };

export default async function TrendingPage() {
  const [searches, mostViewed, latest, updated] = await Promise.all([
    listTrendingSearches(15),
    getMostViewed(6),
    getLatest(6),
    getRecentlyUpdated(6),
  ]);

  return (
    <div className="container space-y-16 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الرائج</h1>
        <p className="mt-2 text-muted-foreground">اكتشف ما هو رائج في قاعدة المعرفة الآن.</p>
      </div>

      <section>
        <SectionHeader icon="trending-up" title="أبرز عمليات البحث" />
        <TrendingSearches searches={searches} />
      </section>

      <section>
        <SectionHeader icon="eye" title="الأكثر مشاهدة" />
        <ArticleGrid articles={mostViewed} />
      </section>

      <section>
        <SectionHeader icon="sparkles" title="الأحدث" />
        <ArticleGrid articles={latest} />
      </section>

      <section>
        <SectionHeader icon="refresh-cw" title="المحدّثة حديثًا" />
        <ArticleGrid articles={updated} />
      </section>
    </div>
  );
}
