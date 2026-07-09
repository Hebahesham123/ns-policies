/**
 * Import the real NS Policies & Procedures content into Supabase, mirroring the
 * original folder tree as (nested) categories. Every document is kept in its own
 * folder — including documents that appear in multiple folders.
 *
 * Usage (from km-system/):
 *   1. Fill in .env.local (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *   2. Make sure migrations 0001–0004 have been run
 *   3. node scripts/import-content.mjs
 *
 * Re-runnable: performs a CLEAN re-import (wipes existing articles + categories
 * first) so the folder structure always matches ns-content.json exactly.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZERO = "00000000-0000-0000-0000-000000000000";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(__dirname, "..", file), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* optional */ }
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function main() {
  const data = JSON.parse(readFileSync(join(__dirname, "ns-content.json"), "utf8"));
  console.log(`Loaded ${data.categories.length} categories, ${data.articles.length} articles.`);

  // 1) Clean slate (articles cascade-delete hot_topics via article_id)
  await supabase.from("articles").delete().neq("id", ZERO);
  await supabase.from("categories").delete().neq("id", ZERO);
  console.log("✓ Cleared existing articles & categories.");

  // 2a) Insert categories without parents
  const catRows = data.categories.map((c) => ({
    name: c.name, slug: c.slug, icon: c.icon, color: c.color,
    order: c.order ?? 0, active: true, description: c.description ?? null,
  }));
  const { error: insErr } = await supabase.from("categories").insert(catRows);
  if (insErr) throw insErr;

  // 2b) Resolve slug -> id, then set parent_id for nested categories
  const { data: cats, error: readErr } = await supabase.from("categories").select("id,slug");
  if (readErr) throw readErr;
  const idBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const parented = data.categories.filter((c) => c.parent_slug);
  for (const c of parented) {
    const parentId = idBySlug[c.parent_slug];
    if (parentId) await supabase.from("categories").update({ parent_id: parentId }).eq("slug", c.slug);
  }
  console.log(`✓ Categories inserted (${parented.length} nested).`);

  // 3) Insert articles in batches
  const now = new Date().toISOString();
  const rows = data.articles.map((a) => ({
    title: a.title, slug: a.slug, summary: a.summary,
    content: a.content, content_text: a.content_text,
    category_id: idBySlug[a.category] ?? null,
    status: "published", featured: !!a.featured,
    difficulty: a.difficulty ?? "beginner",
    estimated_read_time: a.estimated_read_time ?? 3,
    keywords: a.keywords ?? [], author: a.author ?? null,
    source: a.source ?? null, published_at: now,
  }));

  let done = 0;
  for (const batch of chunk(rows, 40)) {
    const { error } = await supabase.from("articles").insert(batch);
    if (error) throw error;
    done += batch.length;
    process.stdout.write(`\r✓ Articles inserted: ${done}/${rows.length}`);
  }
  console.log("");

  // 4) A few homepage hot topics from featured articles (top-level folders)
  const { data: feat } = await supabase
    .from("articles").select("id,title").eq("featured", true).limit(8);
  if (feat?.length) {
    await supabase.from("hot_topics").insert(
      feat.map((a, i) => ({ article_id: a.id, title: a.title, priority: 100 - i, active: true })),
    );
    console.log(`✓ ${feat.length} hot topics created.`);
  }

  console.log("✔ Import complete.");
}

main().catch((err) => { console.error("\n✖ Import failed:", err.message ?? err); process.exit(1); });
