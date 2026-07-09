"use server";

import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().min(4, "يرجى إعطاء موضوعك عنوانًا واضحًا").max(160),
  description: z.string().max(2000).optional(),
  requester: z.string().max(160).optional(),
});

export type SubmitTopicState = { ok: boolean; error?: string };

/** Anonymous topic request (reachable only from allowlisted IPs). */
export async function submitTopic(_prev: SubmitTopicState, formData: FormData): Promise<SubmitTopicState> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    requester: formData.get("requester") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "مدخلات غير صالحة" };
  }
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("user_submitted_topics").insert(parsed.data);
  if (error) return { ok: false, error: "تعذّر الإرسال. يرجى المحاولة مرة أخرى." };
  return { ok: true };
}
