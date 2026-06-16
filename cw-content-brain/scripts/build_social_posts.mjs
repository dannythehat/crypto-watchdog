// Daily social post generator. Turns published content into platform-specific
// posts and writes a dated queue file that the poster (post_social.mjs) sends.
// Rotates content by day so each day is different. No network, no deps.
//
// Run: node cw-content-brain/scripts/build_social_posts.mjs [YYYY-MM-DD]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SNAP = `${ROOT}/cw-content-brain/data/content_snapshot`;
const SITE = "https://cryptowatchdog.net";
const date = process.argv[2] || new Date().toISOString().slice(0, 10);

const read = (n) => (existsSync(`${SNAP}/${n}.json`) ? JSON.parse(readFileSync(`${SNAP}/${n}.json`, "utf8")) : []);
const blogs = read("blog_posts").filter((p) => p.published);
const reviews = read("reviews").filter((r) => r.published);
const warnings = read("warnings").filter((w) => w.published);

// Day index for deterministic rotation.
const dayIdx = Math.floor(new Date(date + "T00:00:00Z").getTime() / 86400000);
const pick = (arr, offset = 0) => (arr.length ? arr[(dayIdx + offset) % arr.length] : null);

const HASH = "#crypto #cryptocurrency #cryptosafety #cryptoscam #DYOR";
const clip = (s, n) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s || "");

function postsFor(kind, item) {
  if (!item) return null;
  if (kind === "warning") {
    const url = `${SITE}/warnings/${item.slug}`;
    const hook = `⚠️ SCAM ALERT: ${item.platform_name || item.title}`;
    const sum = clip(item.summary, 180);
    return {
      kind, slug: item.slug, url,
      x: clip(`${hook}\n\n${sum}\n\n${url}\n${HASH}`, 280),
      telegram: `*${hook}*\n\n${sum}\n\n[Read the full warning](${url})`,
      discord: `${hook}\n${sum}\n${url}`,
      linkedin: `${hook}\n\n${item.summary || ""}\n\nWe track and document crypto platform risks so investors can avoid them. Full breakdown: ${url}\n\n${HASH}`,
      facebook: `${hook}\n\n${sum}\n\nFull warning: ${url}`,
      reddit: { subreddit: "CryptoScams", title: hook, body: `${item.summary || ""}\n\nWe documented the red flags here: ${url}\n\n(Mods: original research / consumer-protection content.)` },
    };
  }
  if (kind === "review") {
    const url = `${SITE}/reviews/${item.slug}`;
    const verdict = item.rating === "green" ? "✅ Passed our checks" : item.rating === "red" ? "🚩 Avoid" : "⚠️ Proceed with caution";
    const hook = `${item.name} review: ${verdict}${item.trust_score != null ? ` (Trust Score ${item.trust_score}/100)` : ""}`;
    const sum = clip(item.summary, 170);
    return {
      kind, slug: item.slug, url,
      x: clip(`${hook}\n\n${sum}\n\n${url}\n${HASH}`, 280),
      telegram: `*${hook}*\n\n${sum}\n\n[Read our full review](${url})`,
      discord: `${hook}\n${sum}\n${url}`,
      linkedin: `${hook}\n\n${item.summary || ""}\n\nEvidence-based, withdrawal-tested. Full review: ${url}\n\n${HASH}`,
      facebook: `${hook}\n\n${sum}\n\nFull review: ${url}`,
      reddit: { subreddit: "CryptoCurrency", title: hook, body: `${item.summary || ""}\n\nFull methodology and verdict: ${url}` },
    };
  }
  // guide
  const url = `${SITE}/blog/${item.slug}`;
  const sum = clip(item.summary, 180);
  return {
    kind, slug: item.slug, url,
    x: clip(`${item.title}\n\n${sum}\n\n${url}\n${HASH}`, 280),
    telegram: `*${item.title}*\n\n${sum}\n\n[Read more](${url})`,
    discord: `${item.title}\n${sum}\n${url}`,
    linkedin: `${item.title}\n\n${item.summary || ""}\n\n${url}\n\n${HASH}`,
    facebook: `${item.title}\n\n${sum}\n\n${url}`,
    reddit: { subreddit: "CryptoCurrency", title: item.title, body: `${item.summary || ""}\n\n${url}` },
  };
}

// One of each per day (skip nulls).
const queue = [
  postsFor("warning", pick(warnings)),
  postsFor("review", pick(reviews, 1)),
  postsFor("guide", pick(blogs, 2)),
].filter(Boolean);

const outDir = `${ROOT}/cw-content-brain/social/queue`;
mkdirSync(outDir, { recursive: true });
const out = { date, generatedAt: new Date().toISOString(), status: "pending", posts: queue };
writeFileSync(`${outDir}/${date}.json`, JSON.stringify(out, null, 2) + "\n");
console.log(`Generated ${queue.length} posts for ${date}:`);
queue.forEach((p) => console.log(`  [${p.kind}] ${p.url}`));
