"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/access/guard";
import { slugify, docToText } from "@/lib/utils";

const articleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  summary: z.string().max(500).optional().nullable(),
  content: z.any().optional(),
  category_id: z.string().uuid().nullable().optional(),
  featured_image: z.string().url().nullable().optional(),
  keywords: z.array(z.string()).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  source: z.string().max(300).nullable().optional(),
  author: z.string().max(160).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

async function audit(action: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const supabase = getSupabaseAdmin();
  await supabase.from("audit_log").insert({ action, entity_type: "article", entity_id: entityId, metadata });
}

/** Create or update an article (upsert by id). Returns the saved row id. */
export async function saveArticle(input: ArticleInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message };

  const data = parsed.data;
  const supabase = getSupabaseAdmin();
  const slug = data.slug?.trim() || slugify(data.title);
  const content_text = data.content ? docToText(data.content) : undefined;

  const payload: Record<string, unknown> = {
    title: data.title,
    slug,
    summary: data.summary ?? null,
    content: data.content ?? null,
    content_text,
    category_id: data.category_id ?? null,
    featured_image: data.featured_image ?? null,
    keywords: data.keywords ?? [],
    difficulty: data.difficulty ?? "beginner",
    source: data.source ?? null,
    author: data.author ?? null,
    status: data.status ?? "draft",
    featured: data.featured ?? false,
    pinned: data.pinned ?? false,
    published_at: data.status === "published" ? new Date().toISOString() : null,
  };

  let id = data.id;
  if (id) {
    // snapshot previous version before overwriting
    const { data: prev } = await supabase.from("articles").select("title,summary,content").eq("id", id).maybeSingle();
    if (prev) await supabase.from("article_versions").insert({ article_id: id, editor: "admin", ...prev });
    const { error } = await supabase.from("articles").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: created, error } = await supabase.from("articles").insert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };
    id = created.id;
  }

  await audit(data.id ? "article.update" : "article.create", id, { title: data.title, status: payload.status });
  revalidatePath("/admin/articles");
  revalidatePath("/");
  if (slug) revalidatePath(`/articles/${slug}`);
  return { ok: true, id };
}

export async function setArticleStatus(id: string, status: "draft" | "published" | "archived") {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("articles").update({
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).eq("id", id);
  await audit(`article.${status}`, id);
  revalidatePath("/admin/articles");
  revalidatePath("/");
}

export async function toggleArticleFlag(id: string, field: "featured" | "pinned", value: boolean) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("articles").update({ [field]: value }).eq("id", id);
  await audit(`article.${field}`, id, { value });
  revalidatePath("/admin/articles");
  revalidatePath("/");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("articles").delete().eq("id", id);
  await audit("article.delete", id);
  revalidatePath("/admin/articles");
  revalidatePath("/");
}

/** Duplicate an article as a new draft. */
export async function duplicateArticle(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const { data: src } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!src) return;
  const { id: _omit, created_at, updated_at, views, likes, search_count, search_vector, ...rest } = src as Record<string, unknown>;
  const title = `${rest.title} (copy)`;
  await supabase.from("articles").insert({
    ...rest,
    title,
    slug: `${slugify(String(rest.title))}-copy-${Date.now().toString(36)}`,
    status: "draft",
    featured: false,
    pinned: false,
    published_at: null,
  });
  await audit("article.duplicate", id);
  revalidatePath("/admin/articles");
}
