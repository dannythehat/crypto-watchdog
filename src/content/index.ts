// Repo-as-CMS content loader. The repo is the source of truth for content;
// the app reads these files at build time via Vite's import.meta.glob. No
// Supabase / Lovable dependency for content.

import categoriesJson from "./categories.json";
import affiliatesJson from "./affiliates.json";

export interface Category {
  id: string; name: string; slug: string; description: string | null;
  icon_name: string | null; parent_id: string | null; sort_order: number;
}

// E-E-A-T author fields (optional) carried in frontmatter; absent on legacy
// posts, which then fall back to the default author identity (see seo.ts).
export interface AuthorFields {
  author?: string | null; author_credentials?: string | null;
  author_url?: string | null; author_same_as?: string[] | null;
  author_image?: string | null;
}

export interface BlogPost extends AuthorFields {
  type: "blog"; title: string; slug: string; content: string;
  summary: string | null; category: string | null; image_url: string | null;
  published: boolean; auto_generated: boolean;
  published_at: string | null; updated_at: string | null;
  meta_title: string | null; meta_description: string | null;
}

export interface Review extends AuthorFields {
  type: "review"; name: string; slug: string; content: string;
  rating: "green" | "orange" | "red" | null; trust_score: number | null;
  summary: string | null; verdict: string | null; category_id: string | null;
  website_url: string | null; logo_url: string | null; social_image_url: string | null;
  pros: string[]; cons: string[];
  fees_info: string | null; withdrawal_info: string | null; deposit_info: string | null;
  video_url: string | null; interview_url?: string | null; detailed_audit: unknown; rich_content: unknown;
  published: boolean; published_at: string | null; updated_at: string | null;
  meta_title: string | null; meta_description: string | null;
  categories?: { name: string; slug: string } | null;
}

export interface Warning extends AuthorFields {
  type: "warning"; title: string; slug: string; content: string;
  summary: string | null; severity: string | null; platform_name: string | null;
  alert_type: string | null; published: boolean;
  published_at: string | null; updated_at: string | null;
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const s = raw.replace(/\r\n/g, "\n");
  if (!s.startsWith("---\n")) return { data: {}, body: s };
  const end = s.indexOf("\n---", 4);
  if (end === -1) return { data: {}, body: s };
  const data: Record<string, unknown> = {};
  for (const line of s.slice(4, end).split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    try { data[key] = JSON.parse(val); } catch { data[key] = val; }
  }
  return { data, body: s.slice(end + 4).replace(/^\n+/, "") };
}

function load<T>(glob: Record<string, string>): T[] {
  return Object.values(glob).map((raw) => {
    const { data, body } = parseFrontmatter(raw);
    return { ...data, content: body } as T;
  });
}

const blogRaw = import.meta.glob("./blog/*.md", { as: "raw", eager: true }) as Record<string, string>;
const reviewRaw = import.meta.glob("./reviews/*.md", { as: "raw", eager: true }) as Record<string, string>;
const warningRaw = import.meta.glob("./warnings/*.md", { as: "raw", eager: true }) as Record<string, string>;

const byDateDesc = (a?: string | null, b?: string | null) =>
  new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime();

export const categories: Category[] = (categoriesJson as Category[])
  .slice()
  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));

const categoryById = new Map(categories.map((c) => [c.id, c]));

export const blogPosts: BlogPost[] = load<BlogPost>(blogRaw)
  .filter((p) => p.published)
  .sort((a, b) => byDateDesc(a.published_at, b.published_at));

export const reviews: Review[] = load<Review>(reviewRaw)
  .filter((r) => r.published)
  .map((r) => {
    const c = r.category_id ? categoryById.get(r.category_id) : null;
    return { ...r, categories: c ? { name: c.name, slug: c.slug } : null };
  })
  .sort((a, b) => byDateDesc(a.published_at, b.published_at));

export const warnings: Warning[] = load<Warning>(warningRaw)
  .filter((w) => w.published)
  .sort((a, b) => byDateDesc(a.published_at, b.published_at));

export interface Affiliate {
  id: string; brand: string; category: string | null; reviewSlug: string;
  rating: string | null;
  status: "active" | "needs_signup" | "pending" | "paused" | "blocked";
  network: string; commissionType: string;
  affiliateUrl: string; homepage: string | null; displayUrl: string | null;
  signupUrl: string; hasKnownProgram: boolean;
  offerText: string; disclosure: string;
  allowedRatings: string[]; blockedPageTypes: string[];
  lastChecked: string | null; notes: string;
}

export const affiliates: Affiliate[] = affiliatesJson as Affiliate[];
const affiliateById = new Map(affiliates.map((a) => [a.id, a]));
const affiliateByReview = new Map(affiliates.map((a) => [a.reviewSlug, a]));

export const getAffiliate = (id: string) => affiliateById.get(id) ?? null;
export const getAffiliateByReviewSlug = (slug: string) => affiliateByReview.get(slug) ?? null;
// True only when there's a REAL affiliate link to send traffic through — i.e. an
// actual deal exists. "needs_signup" entries (no affiliateUrl yet) and blocked
// ones are NOT monetisable, so we never show an affiliate CTA we can't honour.
export const isMonetisable = (a?: Affiliate | null): a is Affiliate =>
  !!a && a.status !== "blocked" && !!a.affiliateUrl;

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug) ?? null;
export const getReview = (slug: string) => reviews.find((r) => r.slug === slug) ?? null;
export const getWarning = (slug: string) => warnings.find((w) => w.slug === slug) ?? null;

// Long-form, expandable SEO "buyer's guide" content for each hub page. Stored as
// plain markdown in ./hub-guides/<hubSlug>.md and rendered behind a "Read the
// full guide" expander on the hub.
const hubGuideRaw = import.meta.glob("./hub-guides/*.md", { as: "raw", eager: true }) as Record<string, string>;
export const getHubGuide = (slug: string): string | null => {
  const entry = Object.entries(hubGuideRaw).find(([p]) => p.endsWith(`/${slug}.md`));
  if (!entry) return null;
  return entry[1].replace(/^---[\s\S]*?---\n/, "").trim() || null;
};

// Related posts for on-page navigation/internal linking: same category first,
// then most recent, excluding the current post.
const tokenize = (s: string) => new Set((s || "").toLowerCase().match(/[a-z0-9]+/g) || []);
export function getRelatedPosts(slug: string, n = 6): BlogPost[] {
  const post = getBlogPost(slug);
  if (!post) return [];
  const myWords = tokenize(post.title + " " + (post.summary || ""));
  return blogPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const words = tokenize(p.title + " " + (p.summary || ""));
      let overlap = 0;
      myWords.forEach((w) => { if (w.length > 3 && words.has(w)) overlap++; });
      const score = (p.category && p.category === post.category ? 5 : 0) + overlap;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || byDateDesc(a.p.published_at, b.p.published_at))
    .slice(0, n)
    .map((x) => x.p);
}
export const getReviewsByCategory = (slug?: string) =>
  slug ? reviews.filter((r) => r.categories?.slug === slug) : reviews;
