// SEO helpers: canonical site config, JSON-LD builders, and a tiny markdown
// FAQ extractor for FAQPage structured data. No dependencies.

export const SITE = {
  name: "CryptoWatchdog",
  baseUrl: "https://cryptowatchdog.net",
  logo: "https://cryptowatchdog.net/cryptowatchdog-logo.png",
  twitter: "@cryptowatchdog",
} as const;

export const absoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${SITE.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

const organization = {
  "@type": "Organization",
  name: SITE.name,
  url: SITE.baseUrl,
  logo: SITE.logo,
};

// ── Author identity (E-E-A-T) ───────────────────────────────────────────────
// Named, credentialed author for bylines + JSON-LD Person. Per-article
// frontmatter (author, author_credentials, …) overrides any field; when a post
// has no author frontmatter we fall back to this brand-config identity (doc 09).
export interface Author {
  name: string;
  credentials?: string | null;
  url?: string | null;
  sameAs?: string[] | null;
  image?: string | null;
}

export const DEFAULT_AUTHOR: Author = {
  name: "Danny Allan",
  credentials: "Founder & lead analyst, CryptoWatchdog · former Complaints Manager at Crypto.com",
  url: `${SITE.baseUrl}/about`,
  sameAs: [],
  image: null,
};

// Build an Author from a content object's frontmatter fields (or null if none).
export function authorFromContent(o: unknown): Author | null {
  const c = o as Record<string, unknown> | null;
  if (!c || typeof c.author !== "string" || !c.author) return null;
  return {
    name: c.author,
    credentials: (c.author_credentials as string) ?? null,
    url: (c.author_url as string) ?? null,
    sameAs: Array.isArray(c.author_same_as) ? (c.author_same_as as string[]) : null,
    image: (c.author_image as string) ?? null,
  };
}

// JSON-LD Person, merged over the default identity. Omits empty sameAs/image.
function personJsonLd(a?: Author | null): Record<string, unknown> {
  const author = { ...DEFAULT_AUTHOR, ...(a || {}) };
  const sameAs = (author.sameAs || []).filter(Boolean);
  return {
    "@type": "Person",
    name: author.name,
    jobTitle: author.credentials || undefined,
    url: author.url || undefined,
    ...(sameAs.length ? { sameAs } : {}),
    ...(author.image ? { image: author.image } : {}),
  };
}

// Standalone JSON-LD for the homepage: brand identity + site entity.
export const organizationJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.baseUrl,
  logo: SITE.logo,
  description: "Independent, evidence-led crypto safety reviews, Trust Scores and scam alerts.",
  sameAs: ["https://twitter.com/cryptowatchdog"],
});

export const websiteJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.baseUrl,
});

interface ArticleInput {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  section?: string | null;
  author?: Author | null;
}

export function articleJsonLd(a: ArticleInput): Record<string, unknown> {
  const url = absoluteUrl(a.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: a.image ? { "@type": "ImageObject", url: a.image } : undefined,
    datePublished: a.publishedAt || undefined,
    dateModified: a.modifiedAt || a.publishedAt || undefined,
    articleSection: a.section || undefined,
    author: personJsonLd(a.author),
    publisher: organization,
  };
}

interface ReviewInput {
  name: string;
  description?: string;
  path: string;
  rating?: "green" | "orange" | "red" | string | null;
  trustScore?: number | null;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: Author | null;
}

// Maps the traffic-light/trust score to a 1-5 ratingValue for Review schema.
function toRatingValue(rating?: string | null, trustScore?: number | null): number | undefined {
  if (typeof trustScore === "number") return Math.round((trustScore / 20) * 10) / 10; // 0-100 -> 0-5
  if (rating === "green") return 4.5;
  if (rating === "orange") return 3;
  if (rating === "red") return 1;
  return undefined;
}

export function reviewJsonLd(r: ReviewInput): Record<string, unknown> {
  const url = absoluteUrl(r.path);
  const ratingValue = toRatingValue(r.rating, r.trustScore);
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Organization", name: r.name },
    name: `${r.name} review`,
    reviewBody: r.description || undefined,
    url,
    datePublished: r.publishedAt || undefined,
    dateModified: r.modifiedAt || r.publishedAt || undefined,
    author: personJsonLd(r.author),
    publisher: organization,
    reviewRating: ratingValue
      ? { "@type": "Rating", ratingValue, bestRating: 5, worstRating: 1 }
      : undefined,
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

const stripMd = (s: string): string =>
  s.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*`_#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Extracts Q/A pairs from a "## Frequently asked questions" section where each
// question is a bold-only line (**...?**) followed by answer text.
export function extractFaq(content: string): { q: string; a: string }[] {
  const lines = (content || "").replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => /^#{1,6}\s+.*frequently asked questions/i.test(l.trim()));
  if (start === -1) return [];
  const faqs: { q: string; a: string }[] = [];
  let q: string | null = null;
  let a: string[] = [];
  const push = () => { if (q) faqs.push({ q: stripMd(q), a: stripMd(a.join(" ")) }); q = null; a = []; };
  for (let i = start + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^#{1,6}\s+/.test(t) || /^(-{3,}|\*{3,})$/.test(t)) { push(); break; }
    if (t === "") continue;
    const bold = t.match(/^\*\*(.+?)\*\*:?$/);
    if (bold) { push(); q = bold[1]; }
    else if (q) a.push(t);
  }
  push();
  return faqs.filter((f) => f.q && f.a);
}
