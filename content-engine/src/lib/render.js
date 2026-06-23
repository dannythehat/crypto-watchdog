// Content Automation Engine — template → site-markdown renderer (doc 08).
//
// PURE, no I/O. Turns an approved content_queue item + its brand into a markdown
// file that the EXISTING site reads as-is. The site's loader (src/content/index.ts)
// parses YAML-ish frontmatter LINE BY LINE: each value must be a single line and is
// JSON.parsed. So we emit every value via JSON.stringify on one line — strings get
// quoted, arrays/objects become inline JSON, nulls become `null`. Body follows ---.
//
// E-E-A-T (doc 08): frontmatter carries author + credentials (AuthorBlock byline),
// dates, trust rating, the FTC disclosure WHEN an affiliate link survives, and the
// fields a renderer needs to emit JSON-LD Person + Article/Review.
//
// Brand-agnostic: directory map, author identity and disclosure all come from the
// brand row — no `if (brand === ...)`.

import { resolvePublishableAffiliates, parseVerdict } from "./gates.js";

// content_type → the existing site content directory (detected in Phase 1).
// reviews/blog/warnings are the three markdown collections the site globs.
export const DIR_MAP = {
  review: "src/content/reviews",
  warning: "src/content/warnings",
  news: "src/content/blog",
  deal: "src/content/blog",
  promotion: "src/content/blog",
};

const RATING_LC = { GREEN: "green", ORANGE: "orange", RED: "red" };
// Rough trust_score (0-100) when a review has only a traffic-light verdict.
const RATING_SCORE = { GREEN: 80, ORANGE: 50, RED: 10 };

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

function parseJSON(v, fallback) {
  if (v == null) return fallback;
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return fallback; }
}

// Resolve the author identity from brand config_json (doc 08). Brand-level by
// default; an item may override via item.author_id pointing into the registry.
export function resolveAuthor(brand, item) {
  const cfg = parseJSON(brand?.config_json, {});
  const authors = cfg.authors || {};
  const id = item?.author_id || authors.default_id || "default";
  const a = authors[id] || authors.default || cfg.author || null;
  if (!a) return null;
  return {
    name: a.name || null,
    credentials: a.credentials || a.title || null,
    url: a.url || null,
    sameAs: Array.isArray(a.sameAs) ? a.sameAs : (a.sameAs ? [a.sameAs] : []),
    image: a.image || null,
  };
}

// Serialize a frontmatter object to single-line JSON-valued lines + body.
export function toFrontmatter(fields, body) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join("\n")}\n---\n${body || ""}\n`;
}

/**
 * Render an item to a site-ready markdown file.
 * @returns {{dir, slug, filename, path, frontmatter, markdown, survivingLinks, disclosureIncluded}}
 */
export function renderItem(item, brand, affiliatesById = {}, opts = {}) {
  const now = opts.now || new Date().toISOString();
  const type = item.content_type;
  const dir = DIR_MAP[type] || "src/content/blog";

  const verdict = parseVerdict(item);                       // {rating,note}|null
  const links = resolvePublishableAffiliates(item, affiliatesById); // post-firewall
  const hasLink = links.length > 0;

  // Disclosure ONLY when an affiliate link actually survives (doc 05 + 08).
  const disclosure = hasLink ? (brand?.disclosure || null) : null;

  const author = resolveAuthor(brand, item);
  const publishedAt = item.published_at || now;
  const updatedAt = now;

  // Slug: reviews keep the partner slug; time-sensitive types get a date suffix
  // (matches the existing files in those directories).
  const base = slugify(item.title || item.id);
  const datePart = now.slice(0, 10);
  const slug = type === "review" ? base : `${base}-${datePart}`;

  // Shared E-E-A-T author fields (feed AuthorBlock byline + JSON-LD Person).
  const authorFields = author ? {
    author: author.name,
    author_credentials: author.credentials,
    author_url: author.url,
    author_same_as: author.sameAs,
    author_image: author.image,
  } : {};

  // Body: prepend a visible disclosure note when a link is present (the FTC line
  // must appear on the page, not only in frontmatter).
  let body = item.body_md || "";
  if (disclosure) body = `> ${disclosure}\n\n${body}`;

  let fields;
  if (type === "review") {
    const ratingUc = verdict?.rating || null;             // GREEN|ORANGE|RED|null
    fields = {
      type: "review",
      name: item.title || "",
      slug,
      rating: ratingUc ? RATING_LC[ratingUc] : null,      // site reads lowercase
      trust_rating: ratingUc,                              // doc 08 (uppercase)
      trust_score: ratingUc ? RATING_SCORE[ratingUc] : null,
      summary: item.summary || firstLine(body),
      verdict: verdict?.note || null,
      category_id: parseJSON(item.category_id, null) ?? (item.category_id || null),
      website_url: null,
      logo_url: null,
      social_image_url: item.image_url || null,
      ...authorFields,
      disclosure,                                          // null unless link present
      affiliate_url: hasLink ? (links[0].affiliate_url || affiliatesById[links[0].affiliate_id]?.affiliate_url || null) : null,
      ai_generated: item.ai_generated ? true : false,
      published: true,
      published_at: publishedAt,
      updated_at: updatedAt,
      meta_title: item.meta_title || `${item.title} review — CryptoWatchdog`,
      meta_description: item.meta_description || truncate(item.summary || firstLine(body), 155),
    };
  } else if (type === "warning") {
    fields = {
      type: "warning",
      title: item.title || "",
      slug,
      summary: item.summary || firstLine(body),
      severity: item.severity || "high",
      platform_name: item.platform_name || null,
      alert_type: item.alert_type || "scam",
      ...authorFields,
      ai_generated: item.ai_generated ? true : false,
      published: true,
      published_at: publishedAt,
      updated_at: updatedAt,
      meta_title: item.meta_title || `${item.title} — CryptoWatchdog warning`,
      meta_description: item.meta_description || truncate(item.summary || firstLine(body), 155),
    };
  } else {
    // news / deal / promotion → blog collection
    fields = {
      type: "blog",
      title: item.title || "",
      slug,
      summary: item.summary || firstLine(body),
      category: item.category || type,
      image_url: item.image_url || null,
      ...authorFields,
      disclosure,                                          // null unless link present
      affiliate_url: hasLink ? (links[0].affiliate_url || affiliatesById[links[0].affiliate_id]?.affiliate_url || null) : null,
      ai_generated: item.ai_generated ? true : false,
      auto_generated: item.ai_generated ? true : false,    // site's BlogPost field
      published: true,
      published_at: publishedAt,
      updated_at: updatedAt,
      meta_title: item.meta_title || `${item.title} — CryptoWatchdog`,
      meta_description: item.meta_description || truncate(item.summary || firstLine(body), 155),
    };
  }

  const markdown = toFrontmatter(fields, body);
  return {
    dir, slug, filename: `${slug}.md`, path: `${dir}/${slug}.md`,
    frontmatter: fields, markdown,
    survivingLinks: links.length, disclosureIncluded: Boolean(disclosure),
  };
}

function firstLine(s) {
  const t = String(s || "").replace(/^>.*$/m, "").replace(/[#*`>]/g, "").trim();
  return t.split("\n").find((l) => l.trim().length > 0)?.trim().slice(0, 200) || "";
}
function truncate(s, n) {
  s = String(s || "");
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}
