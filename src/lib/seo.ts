// SEO helpers: canonical site config, JSON-LD builders, and a tiny markdown
// FAQ extractor for FAQPage structured data. No dependencies.

export const SITE = {
  name: "CryptoWatchdog",
  baseUrl: "https://cryptowatchdog.net",
  logo: "https://cryptowatchdog.net/logo.png",
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

interface ArticleInput {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  section?: string | null;
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
    author: organization,
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
    author: organization,
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
