// Content Automation Engine — renderer tests (doc 08).
//
// Proves renderItem() emits markdown the EXISTING site can read, and that the
// E-E-A-T frontmatter + disclosure + JSON-LD source fields are correct. The
// frontmatter parser below is a faithful copy of src/content/index.ts's
// parseFrontmatter — if our output round-trips through it, the live site will
// read it identically.
//
//   Run: node --experimental-sqlite content-engine/test/render.test.mjs
//
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderItem, slugify, DIR_MAP } from "../src/lib/render.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

let passed = 0, failed = 0; const fails = [];
const check = (n, c) => { if (c) { passed++; console.log(`  ✓ ${n}`); } else { failed++; fails.push(n); console.log(`  ✗ ${n}`); } };

// ── EXACT copy of the site's parser (src/content/index.ts) ──────────────────
function parseFrontmatter(raw) {
  const s = raw.replace(/\r\n/g, "\n");
  if (!s.startsWith("---\n")) return { data: {}, body: s };
  const end = s.indexOf("\n---", 4);
  if (end === -1) return { data: {}, body: s };
  const data = {};
  for (const line of s.slice(4, end).split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    try { data[key] = JSON.parse(val); } catch { data[key] = val; }
  }
  return { data, body: s.slice(end + 4).replace(/^\n+/, "") };
}

// ── Load brand + affiliates from the real seed ──────────────────────────────
const db = new DatabaseSync(":memory:");
db.exec(readFileSync(path.join(root, "schema.sql"), "utf8"));
db.exec(readFileSync(path.join(root, "seed.sql"), "utf8"));
const brand = db.prepare("SELECT * FROM brands WHERE id='cryptowatchdog'").get();
const affsById = Object.fromEntries(
  db.prepare("SELECT * FROM affiliates WHERE brand_id='cryptowatchdog'").all().map((a) => [a.id, a]),
);
const affsActive = { ...affsById, aff_cw_cloudbet: { ...affsById.aff_cw_cloudbet, is_active: 1 } };
const get = (id) => db.prepare("SELECT * FROM content_queue WHERE id=?").get(id);

console.log("\n[1] Warning → warnings dir, round-trips through site parser");
{
  const r = renderItem(get("q_seed_warning_1"), brand);
  const { data, body } = parseFrontmatter(r.markdown);
  check("dir is src/content/warnings", r.dir === DIR_MAP.warning);
  check("type=warning parses", data.type === "warning");
  check("published=true (boolean) parses", data.published === true);
  check("slug has date suffix", /-\d{4}-\d{2}-\d{2}$/.test(data.slug));
  check("author byline present (E-E-A-T)", typeof data.author === "string" && data.author.length > 0);
  check("author_credentials present", typeof data.author_credentials === "string");
  check("author_url present (JSON-LD Person)", typeof data.author_url === "string");
  check("author_same_as is an array", Array.isArray(data.author_same_as));
  check("no affiliate → no disclosure key/empty", !data.disclosure);
  check("body preserved", body.includes("Telegram"));
  check("dates present", Boolean(data.published_at && data.updated_at));
}

console.log("\n[2] Review WITH GREEN verdict + ACTIVE affiliate → disclosure + rating");
{
  const item = get("q_seed_review_1");
  item.human_verdict = JSON.stringify({ rating: "GREEN", note: "Passed our checks." });
  const r = renderItem(item, brand, affsActive);
  const { data, body } = parseFrontmatter(r.markdown);
  check("dir is src/content/reviews", r.dir === DIR_MAP.review);
  check("type=review", data.type === "review");
  check("rating lowercased for site (green)", data.rating === "green");
  check("trust_rating uppercase for doc 08 (GREEN)", data.trust_rating === "GREEN");
  check("trust_score is a number", typeof data.trust_score === "number");
  check("verdict note carried", data.verdict === "Passed our checks.");
  check("review slug has NO date suffix", !/-\d{4}-\d{2}-\d{2}$/.test(data.slug));
  check("disclosure present (affiliate survived)", typeof data.disclosure === "string" && data.disclosure.length > 10);
  check("affiliate_url surfaced", typeof data.affiliate_url === "string" && data.affiliate_url.includes("cloudbet"));
  check("disclosure rendered into body (FTC on-page)", body.startsWith(">"));
  check("renderer reports 1 surviving link", r.survivingLinks === 1);
}

console.log("\n[3] Review with RED verdict → links stripped, NO disclosure");
{
  const item = get("q_seed_review_1");
  item.human_verdict = JSON.stringify({ rating: "RED", note: "Withdrawal problems." });
  const r = renderItem(item, brand, affsActive);
  const { data, body } = parseFrontmatter(r.markdown);
  check("rating=red", data.rating === "red");
  check("RED → zero surviving links", r.survivingLinks === 0);
  check("RED → no disclosure", !data.disclosure);
  check("RED → no affiliate_url", !data.affiliate_url);
  check("RED → body NOT prefixed with disclosure quote", !body.startsWith(">"));
}

console.log("\n[4] Deal (blog) with affiliate but verdict-less → still gets disclosure");
{
  const item = get("q_seed_deal_1");
  const r = renderItem(item, brand, affsActive);
  const { data } = parseFrontmatter(r.markdown);
  check("dir is src/content/blog", r.dir === DIR_MAP.deal);
  check("type=blog", data.type === "blog");
  check("auto_generated mirrors ai_generated", data.auto_generated === true);
  check("deal w/ active affiliate → disclosure present", typeof data.disclosure === "string");
}

console.log("\n[5] Arrays/objects survive single-line JSON round-trip");
{
  const item = { ...get("q_seed_warning_1"), title: 'Quote "test" & <tags>' };
  const r = renderItem(item, brand);
  const { data } = parseFrontmatter(r.markdown);
  check("special chars in title survive", data.title === 'Quote "test" & <tags>');
  check("slugify strips quotes/symbols", slugify(item.title) === "quote-test-tags");
}

db.close();
console.log(`\n──────────────────────────────\n${passed} passed, ${failed} failed`);
if (failed) { console.log("FAILED:", fails.join("; ")); process.exit(1); }
console.log("RENDERER OK ✅ (markdown is site-compatible; nothing published)");
