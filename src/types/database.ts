/**
 * Hand-written database types mirroring the SQL schema.
 * You can regenerate a fuller version with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type ArticleStatus = "draft" | "published" | "archived";
export type ArticleDifficulty = "beginner" | "intermediate" | "advanced";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image: string | null;
  order: number;
  active: boolean;
  lang?: string | null;
  name_alt?: string | null;
  description_alt?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: unknown | null; // Tiptap JSON doc
  content_text: string | null;
  category_id: string | null;
  featured_image: string | null;
  gallery: string[];
  keywords: string[] | null;
  difficulty: ArticleDifficulty;
  estimated_read_time: number;
  source: string | null;
  author: string | null;
  status: ArticleStatus;
  featured: boolean;
  pinned: boolean;
  views: number;
  likes: number;
  search_count: number;
  published_at: string | null;
  lang?: string | null;
  title_alt?: string | null;
  summary_alt?: string | null;
  content_alt?: unknown | null;
  content_text_alt?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface HotTopic {
  id: string;
  article_id: string | null;
  title: string;
  priority: number;
  icon: string | null;
  color: string | null;
  active: boolean;
  created_at: string;
}

export interface TrendingSearch {
  id: string;
  keyword: string;
  search_count: number;
  last_search: string;
}

export interface UserSubmittedTopic {
  id: string;
  title: string;
  description: string | null;
  requester: string | null;
  status: SubmissionStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
