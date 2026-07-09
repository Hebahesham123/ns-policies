"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/access/guard";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(80),
  slug: z.string().optional(),
  description: z.string().max(400).nullable().optional(),
  icon: z.string().max(40).optional(),
  color: z.string().max(20).optional(),
  image: z.string().url().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export async function saveCategory(input: CategoryInput) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message };
  const d = parsed.data;
  const supabase = getSupabaseAdmin();
  const payload = {
    name: d.name,
    slug: d.slug?.trim() || slugify(d.name),
    description: d.description ?? null,
    icon: d.icon ?? "folder",
    color: d.color ?? "#6366f1",
    image: d.image ?? null,
    parent_id: d.parent_id ?? null,
    order: d.order ?? 0,
    active: d.active ?? true,
  };
  if (d.id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

/** Persist a new ordering (drag-and-drop). */
export async function reorderCategories(ordered: { id: string; order: number }[]) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  await Promise.all(ordered.map((o) => supabase.from("categories").update({ order: o.order }).eq("id", o.id)));
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}
