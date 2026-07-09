import type { SortOption } from "@/types";

export const SITE = {
  name: "قاعدة معرفة NS",
  tagline: "السياسات والإجراءات وأساليب العمل لكل الفريق.",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "الأكثر صلة" },
  { value: "newest", label: "الأحدث" },
  { value: "popular", label: "الأكثر مشاهدة" },
  { value: "alphabetical", label: "أبجديًا" },
];

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export const PAGE_SIZE = 12;

/** Public navigation. */
export const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "الأقسام" },
  { href: "/search", label: "البحث" },
  { href: "/trending", label: "الرائج" },
];

/** Admin sidebar navigation. */
export const ADMIN_NAV = [
  { href: "/admin", label: "نظرة عامة", icon: "layout-dashboard" },
  { href: "/admin/articles", label: "المقالات", icon: "file-text" },
  { href: "/admin/categories", label: "الأقسام", icon: "folder-tree" },
  { href: "/admin/hot-topics", label: "المواضيع المميزة", icon: "flame" },
  { href: "/admin/tags", label: "الوسوم", icon: "tags" },
  { href: "/admin/requests", label: "الطلبات", icon: "inbox" },
  { href: "/admin/analytics", label: "التحليلات", icon: "bar-chart-3" },
  { href: "/admin/settings", label: "الإعدادات", icon: "settings" },
] as const;
