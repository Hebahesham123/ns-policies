export * from "./database";
import type { Article, Category } from "./database";

/** Article joined with its category (common list/detail shape). */
export interface ArticleWithCategory extends Article {
  category: Pick<Category, "id" | "name" | "slug" | "color" | "icon"> | null;
}

export interface CategoryWithCount extends Category {
  article_count: number;
}

/** A category plus its nested subcategories (folder tree). */
export interface CategoryNode extends CategoryWithCount {
  children: CategoryNode[];
  total_count: number; // article_count including all descendants
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  featured_image: string | null;
  category_id: string | null;
  views: number;
  likes: number;
  estimated_read_time: number;
  published_at: string | null;
  rank: number;
}

export type SortOption = "relevance" | "newest" | "popular" | "alphabetical";

export interface DashboardStats {
  total_articles: number;
  published: number;
  drafts: number;
  categories: number;
  total_views: number;
  total_likes: number;
  total_searches: number;
  hot_topics: number;
  pending_topics: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
