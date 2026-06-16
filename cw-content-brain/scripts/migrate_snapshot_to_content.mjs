// One-off migrator: snapshot JSON -> repo content files (Markdown + JSON
// front matter). Makes the repo the source of truth for content so the site no
// longer depends on Supabase/Lovable for articles.
//
// Run: node cw-content-brain/scripts/migrate_snapshot_to_content.mjs
// Reads:  cw-content-brain/data/content_snapshot/{blog_posts,reviews,warnings,categories}.json
// Writes: src/content/{blog,reviews,warnings}/*.md  and  src/content/categories.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SNAP = `${ROOT}/cw-content-brain/data/content_snapshot`;
const OUT = `${ROOT}/src/content`;

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const safeSlug = (s) => String(s || "").replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase();

// Serialize front matter values as JSON so colons/quotes/newlines are safe.
function frontMatter(obj) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    lines.push(`${k}: ${JSON.stringify(v ?? null)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function writeMd(subdir, slug, fm, body) {
  const dir = `${OUT}/${subdir}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${safeSlug(slug)}.md`, frontMatter(fm) + (body || "").trim() + "\n");
}

let counts = { blog: 0, reviews: 0, warnings: 0, categories: 0 };

// ---- blog posts ----
for (const p of read(`${SNAP}/blog_posts.json`)) {
  writeMd("blog", p.slug, {
    type: "blog",
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? null,
    category: p.category ?? null,
    image_url: p.image_url ?? null,
    published: p.published !== false,
    auto_generated: p.auto_generated === true,
    published_at: p.published_at ?? null,
    updated_at: p.updated_at ?? null,
    meta_title: p.meta_title ?? null,
    meta_description: p.meta_description ?? null,
  }, p.content);
  counts.blog++;
}

// ---- reviews (structured fields kept in front matter, prose as body) ----
for (const r of read(`${SNAP}/reviews.json`)) {
  const body = [r.summary, r.verdict].filter(Boolean).join("\n\n");
  writeMd("reviews", r.slug, {
    type: "review",
    name: r.name,
    slug: r.slug,
    rating: r.rating ?? null,
    trust_score: r.trust_score ?? null,
    summary: r.summary ?? null,
    verdict: r.verdict ?? null,
    category_id: r.category_id ?? null,
    website_url: r.website_url ?? null,
    logo_url: r.logo_url ?? null,
    social_image_url: r.social_image_url ?? null,
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    fees_info: r.fees_info ?? null,
    withdrawal_info: r.withdrawal_info ?? null,
    deposit_info: r.deposit_info ?? null,
    video_url: r.video_url ?? null,
    interview_url: r.interview_url ?? null,
    detailed_audit: r.detailed_audit ?? null,
    rich_content: r.rich_content ?? null,
    published: r.published !== false,
    published_at: r.created_at ?? null,
    updated_at: r.updated_at ?? null,
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
  }, body);
  counts.reviews++;
}

// ---- warnings ----
for (const w of read(`${SNAP}/warnings.json`)) {
  writeMd("warnings", w.slug, {
    type: "warning",
    title: w.title,
    slug: w.slug,
    summary: w.summary ?? null,
    severity: w.severity ?? null,
    platform_name: w.platform_name ?? null,
    alert_type: w.alert_type ?? null,
    published: w.published !== false,
    published_at: w.published_at ?? null,
    updated_at: w.updated_at ?? null,
  }, w.content);
  counts.warnings++;
}

// ---- categories (small, keep as JSON) ----
const cats = read(`${SNAP}/categories.json`).map((c) => ({
  id: c.id, name: c.name, slug: c.slug, description: c.description ?? null,
  icon_name: c.icon_name ?? null, parent_id: c.parent_id ?? null, sort_order: c.sort_order ?? 0,
}));
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/categories.json`, JSON.stringify(cats, null, 2) + "\n");
counts.categories = cats.length;

console.log("Migrated to src/content:", counts);
