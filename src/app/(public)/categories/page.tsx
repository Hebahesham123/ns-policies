import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { Bi } from "@/components/lang/bi";
import { bothLangs } from "@/lib/i18n";
import { listCategoryTree } from "@/services/catalog";
import type { CategoryNode } from "@/types";

export const revalidate = 300;
export const metadata: Metadata = { title: "الأقسام", description: "تصفّح المعرفة حسب القسم." };

function SubTree({ node, color }: { node: CategoryNode; color: string }) {
  return (
    <div>
      <Link
        href={`/categories/${node.slug}`}
        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
      >
        <span className="flex items-center gap-2">
          <Icon name={node.icon} className="size-4" style={{ color }} />
          <span className="font-medium"><Bi ar={bothLangs(node.name, node.name_alt, node.lang).ar} en={bothLangs(node.name, node.name_alt, node.lang).en} /></span>
        </span>
        <span className="text-xs text-muted-foreground">{node.total_count}</span>
      </Link>
      {node.children.length > 0 && (
        <div className="ms-4 mt-1 space-y-1 border-s ps-3">
          {node.children.map((child) => (
            <SubTree key={child.id} node={child} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

function RootCard({ root }: { root: CategoryNode }) {
  const color = root.color ?? "#6366f1";
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft">
      <Link href={`/categories/${root.slug}`} className="group relative flex items-start gap-3 p-5 transition-colors hover:bg-accent">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1a`, color }}>
          <Icon name={root.icon} className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold tracking-tight group-hover:text-primary">
            <Bi ar={bothLangs(root.name, root.name_alt, root.lang).ar} en={bothLangs(root.name, root.name_alt, root.lang).en} />
          </h2>
          {(root.description || root.description_alt) && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              <Bi ar={bothLangs(root.description, root.description_alt, root.lang).ar} en={bothLangs(root.description, root.description_alt, root.lang).en} />
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {root.total_count} <Bi ar="مقال" en="articles" />
            {root.children.length > 0 ? <> · {root.children.length} <Bi ar="قسم فرعي" en="subsections" /></> : ""}
          </p>
        </div>
      </Link>
      {root.children.length > 0 && (
        <div className="border-t p-2">
          {root.children.map((child) => (
            <SubTree key={child.id} node={child} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CategoriesPage() {
  const tree = await listCategoryTree();
  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight"><Bi ar="الأقسام" en="Categories" /></h1>
        <p className="mt-2 text-muted-foreground">
          <Bi ar="استكشف المعرفة منظّمة حسب المجلدات والأقسام الفرعية تمامًا كما نظّمتها." en="Browse knowledge organized by your exact folders and subfolders." />
        </p>
      </div>
      {tree.length ? (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((root) => (
            <RootCard key={root.id} root={root} />
          ))}
        </div>
      ) : (
        <EmptyState icon="folder" title="لا توجد أقسام بعد" description="لم يُضِف المسؤول أي أقسام بعد." />
      )}
    </div>
  );
}
