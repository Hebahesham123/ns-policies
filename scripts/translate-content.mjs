/**
 * Pre-translate all content into the OTHER language (free engine) and store it
 * in the *_alt columns so the AR/EN toggle is instant.
 *
 * Usage (from km-system/, after 0006_bilingual.sql + import):
 *   node scripts/translate-content.mjs           # translate untranslated rows
 *   DRY=1 node scripts/translate-content.mjs      # translate a couple, print, no writes
 *   FORCE=1 node scripts/translate-content.mjs     # re-translate everything
 *
 * Resumable: writes per row and skips rows whose `lang` is already set.
 */
import { readFileSync } from "node:fs";
import https from "node:https";
import { createClient } from "@supabase/supabase-js";

const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const l of raw.split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, ""); }
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const DRY = process.env.DRY === "1";
const FORCE = process.env.FORCE === "1";
const SEP = "\n%%%\n";
const MAX_CHARS = 1400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isArabic = (s) => /[؀-ۿ]/.test(s || "");

// --- one HTTP translation request (Google's free gtx endpoint) -------------
function translateOnce(text, sl, tl) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error("HTTP " + r.statusCode)); }
      let d = ""; r.on("data", (c) => (d += c));
      r.on("end", () => { try { const j = JSON.parse(d); resolve(j[0].map((s) => s[0]).join("")); } catch { reject(new Error("parse")); } });
    }).on("error", reject);
  });
}

async function translateWithRetry(text, sl, tl) {
  let delay = 500;
  for (let i = 0; i < 5; i++) {
    try { return await translateOnce(text, sl, tl); }
    catch { await sleep(delay); delay = Math.min(delay * 2, 8000); }
  }
  return null; // give up → caller keeps source
}

/** Translate many strings; returns a Map source->translated. Dedupes + chunks. */
async function translateMap(strings, sl, tl, progress) {
  const uniq = [...new Set(strings.filter((s) => s && s.trim()))];
  const map = new Map();
  // build char-bounded chunks
  const chunks = []; let cur = []; let len = 0;
  for (const s of uniq) {
    if (len + s.length > MAX_CHARS && cur.length) { chunks.push(cur); cur = []; len = 0; }
    cur.push(s); len += s.length + SEP.length;
  }
  if (cur.length) chunks.push(cur);

  for (const chunk of chunks) {
    const joined = chunk.join(SEP);
    let out = await translateWithRetry(joined, sl, tl);
    let parts = out == null ? null : out.split(/\s*%%%\s*/).map((x) => x.trim());
    if (!parts || parts.length !== chunk.length) {
      // alignment failed → translate each individually (slower, reliable)
      parts = [];
      for (const s of chunk) { parts.push((await translateWithRetry(s, sl, tl)) ?? s); await sleep(120); }
    }
    chunk.forEach((s, i) => map.set(s, parts[i] ?? s));
    progress?.(map.size, uniq.length);
    await sleep(180);
  }
  return map;
}

// --- Tiptap block helpers --------------------------------------------------
function plainOf(node) {
  let out = "";
  const w = (n) => { if (!n) return; if (Array.isArray(n)) return n.forEach(w); if (typeof n.text === "string") out += n.text; if (n.content) w(n.content); };
  w(node); return out;
}
function collectBlocks(doc) {
  const blocks = [];
  const w = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(w);
    if (n.type === "paragraph" || n.type === "heading") { blocks.push(n); return; }
    if (n.content) w(n.content);
  };
  w(doc); return blocks;
}
function rebuild(doc, map) {
  const clone = structuredClone(doc);
  for (const b of collectBlocks(clone)) {
    const t = plainOf(b).trim();
    const tr = t ? map.get(t) : "";
    b.content = tr ? [{ type: "text", text: tr }] : [];
  }
  return clone;
}

async function run() {
  // 1) Articles
  const sel = DRY ? "id,title,summary,content" : "id,title,summary,content,lang";
  let q = db.from("articles").select(sel).order("created_at", { ascending: true });
  if (!FORCE && !DRY) q = q.is("lang", null);
  if (DRY) q = q.limit(3);
  const { data: articles, error } = await q;
  if (error) throw error;
  console.log(`${articles.length} article(s) to translate${DRY ? " (DRY)" : ""}.`);

  let n = 0;
  for (const a of articles) {
    const src = isArabic(a.title + " " + (a.summary || "")) ? "ar" : "en";
    const tgt = src === "ar" ? "en" : "ar";
    const blockTexts = collectBlocks(a.content || {}).map((b) => plainOf(b).trim());
    const all = [a.title, a.summary || "", ...blockTexts];
    const map = await translateMap(all, src, tgt);

    const title_alt = a.title ? map.get(a.title) ?? a.title : null;
    const summary_alt = a.summary ? map.get(a.summary) ?? a.summary : null;
    const content_alt = a.content ? rebuild(a.content, map) : null;
    const content_text_alt = content_alt ? collectBlocks(content_alt).map(plainOf).join("\n") : null;

    n++;
    if (DRY) {
      console.log(`\n[${src}->${tgt}] ${a.title}\n  => ${title_alt}\n  summary => ${summary_alt?.slice(0, 80)}`);
      if (n >= 3) { console.log("\n(DRY: stopping after 3)"); return; }
      continue;
    }
    const { error: uerr } = await db.from("articles").update({ lang: src, title_alt, summary_alt, content_alt, content_text_alt }).eq("id", a.id);
    if (uerr) console.error("update failed", a.id, uerr.message);
    process.stdout.write(`\r✓ articles: ${n}/${articles.length}`);
  }
  console.log("");

  // 2) Categories
  let cq = db.from("categories").select("id,name,description,lang");
  if (!FORCE) cq = cq.is("lang", null);
  const { data: cats } = await cq;
  if (cats?.length && !DRY) {
    for (const c of cats) {
      const src = isArabic(c.name) ? "ar" : "en";
      const tgt = src === "ar" ? "en" : "ar";
      const map = await translateMap([c.name, c.description || ""], src, tgt);
      await db.from("categories").update({
        lang: src,
        name_alt: map.get(c.name) ?? c.name,
        description_alt: c.description ? map.get(c.description) ?? c.description : null,
      }).eq("id", c.id);
    }
    console.log(`✓ categories: ${cats.length}`);
  }
  console.log("✔ Translation complete.");
}

run().catch((e) => { console.error("\n✖", e.message ?? e); process.exit(1); });
