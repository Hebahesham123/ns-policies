"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/access/guard";
import { slugify } from "@/lib/utils";

// --- User topic requests ---------------------------------------------------
export async function setRequestStatus(id: string, status: "pending" | "approved" | "rejected", note?: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("user_submitted_topics").update({ status, admin_note: note ?? null }).eq("id", id);
  revalidatePath("/admin/requests");
}

/** Approve a request and spin up a draft article seeded from it. */
export async function convertRequestToArticle(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const { data: req } = await supabase.from("user_submitted_topics").select("*").eq("id", id).single();
  if (!req) return { ok: false };
  const { data: created } = await supabase
    .from("articles")
    .insert({
      title: req.title,
      slug: `${slugify(req.title)}-${Date.now().toString(36)}`,
      summary: req.description,
      status: "draft",
      author: "From request",
    })
    .select("id")
    .single();
  await supabase.from("user_submitted_topics").update({ status: "approved" }).eq("id", id);
  revalidatePath("/admin/requests");
  return { ok: true, id: created?.id };
}

// --- Hot topics ------------------------------------------------------------
export async function saveHotTopic(input: { id?: string; article_id?: string | null; title: string; priority?: number; icon?: string; color?: string; active?: boolean }) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const payload = {
    article_id: input.article_id ?? null,
    title: input.title,
    priority: input.priority ?? 0,
    icon: input.icon ?? "flame",
    color: input.color ?? "#ef4444",
    active: input.active ?? true,
  };
  if (input.id) await supabase.from("hot_topics").update(payload).eq("id", input.id);
  else await supabase.from("hot_topics").insert(payload);
  revalidatePath("/admin/hot-topics");
  revalidatePath("/");
}

export async function deleteHotTopic(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("hot_topics").delete().eq("id", id);
  revalidatePath("/admin/hot-topics");
  revalidatePath("/");
}

// --- Tags ------------------------------------------------------------------
export async function createTag(name: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("tags").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
}

// --- Settings --------------------------------------------------------------
export async function updateSetting(key: string, value: Record<string, unknown>) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}
