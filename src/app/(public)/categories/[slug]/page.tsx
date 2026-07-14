import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { Breadcrumb, type Crumb } from "@/components/breadcrumb";
import { ArticleGrid } from "@/components/article-grid";
import { EmptyState } from "@/components/empty-state";
import { getCategoryBySlug, listCategoriesWithCounts, listCategorySlugs } from "@/services/catalog";
import { listArticles } from "@/services/articles";
import { Bi } from "@/components/lang/bi";
import { bothLangs } from "@/lib/i18n";

export const revalidate = 300;

// Prerender every category page at build time → instant first load.
export async function generateStaticParams() {
  const slugs = await listCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "القسم", description: category?.description ?? undefined };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ items }, flat] = await Promise.all([
    listArticles({ category: category.id, sort: "newest", pageSize: 48 }),
    listCategoriesWithCounts(),
  ]);

  const subcategories = flat.filter((c) => c.parent_id === category.id).sort((a, b) => a.order - b.order);
  const parent = category.parent_id ? flat.find((c) => c.id === category.parent_id) ?? null : null;
  const color = category.color ?? "#6366f1";

  const name = bothLangs(category.name, category.name_alt, category.lang);
  const desc = bothLangs(category.description, category.description_alt, category.lang);

  const crumbs: Crumb[] = [{ label: <Bi ar="الأقسام" en="Categories" />, href: "/categories" }];
  if (parent) {
    const pn = bothLangs(parent.name, parent.name_alt, parent.lang);
    crumbs.push({ label: <Bi ar={pn.ar} en={pn.en} />, href: `/categories/${parent.slug}` });
  }
  crumbs.push({ label: <Bi ar={name.ar} en={name.en} /> });

  return (
    <div className="container py-8">
      <Breadcrumb items={crumbs} />

      <div className="mt-6 flex items-start gap-4">
        <span className="grid size-14 place-items-center rounded-2xl" style={{ background: `${color}1a`, color }}>
          <Icon name={category.icon} className="size-7" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Bi ar={name.ar} en={name.en} /></h1>
          {(desc.ar || desc.en) && <p className="mt-1 text-muted-foreground"><Bi ar={desc.ar} en={desc.en} /></p>}
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length} <Bi ar="مقالات" en="articles" />
            {subcategories.length > 0 ? <> · {subcategories.length} <Bi ar="قسم فرعي" en="subsections" /></> : ""}
          </p>
        </div>
      </div>

      {/* Subcategories (subfolders) */}
      {subcategories.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground"><Bi ar="الأقسام الفرعية" en="Subsections" /></h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${color}1a`, color }}>
                    <Icon name={sub.icon} className="size-5" />
                  </span>
                  <span className="font-medium group-hover:text-primary">
                    <Bi ar={bothLangs(sub.name, sub.name_alt, sub.lang).ar} en={bothLangs(sub.name, sub.name_alt, sub.lang).en} />
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{sub.article_count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Articles directly in this folder */}
      <div className="mt-10">
        {items.length > 0 ? (
          <>
            {subcategories.length > 0 && <h2 className="mb-3 text-sm font-semibold text-muted-foreground"><Bi ar="مقالات هذا القسم" en="Articles in this section" /></h2>}
            <ArticleGrid articles={items} />
          </>
        ) : subcategories.length > 0 ? (
          <EmptyState icon="folder-open" title="لا توجد مقالات مباشرة" description="اختر أحد الأقسام الفرعية بالأعلى لتصفّح محتواه." />
        ) : (
          <EmptyState icon="file-search" title="لا توجد مقالات بعد" description="سيظهر المحتوى هنا بمجرد نشره." />
        )}
      </div>
    </div>
  );
}
