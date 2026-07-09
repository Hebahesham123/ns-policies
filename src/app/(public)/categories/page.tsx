import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
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
          <span className="font-medium">{node.name}</span>
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
          <h2 className="font-semibold tracking-tight group-hover:text-primary">{root.name}</h2>
          {root.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{root.description}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {root.total_count} مقال{root.children.length > 0 ? ` · ${root.children.length} قسم فرعي` : ""}
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
        <h1 className="text-3xl font-bold tracking-tight">الأقسام</h1>
        <p className="mt-2 text-muted-foreground">استكشف المعرفة منظّمة حسب المجلدات والأقسام الفرعية تمامًا كما نظّمتها.</p>
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
