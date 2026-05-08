export type ContentType =
  | "platform_review"
  | "scam_warning"
  | "education_post"
  | "market_safety_note"
  | "exchange_review";

export type RiskRating = "green" | "orange" | "red" | "not_applicable";

export type Confidence = "low" | "medium" | "high";

export type DiscoveryMode = "live-crawl" | "sitemap-url" | "route-manifest-fallback";

export interface SiteConfig {
  siteName: string;
  baseUrl: string;
  defaultLocale: string;
  maxPagesPerRun: number;
  crawlDelayMs: number;
  allowedDomains: string[];
  approvalRequiredFor: string[];
  contentTypes: ContentType[];
  protectedRoutes: string[];
  crawl: {
    includePatterns: string[];
    excludePatterns: string[];
  };
  seo: {
    titleMinLength: number;
    titleMaxLength: number;
    descriptionMinLength: number;
    descriptionMaxLength: number;
    minWords: number;
  };
}

export interface RouteRecord {
  url: string;
  statusCode: number | null;
  title?: string;
  metaDescription?: string;
  canonical?: string;
  h1s: string[];
  h2s: string[];
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
  imageCount: number;
  imagesMissingAlt: number;
  possibleAffiliateLinks: string[];
  hasAffiliateDisclosure: boolean;
  lastScannedAt: string;
  discoveryMode: DiscoveryMode;
}

export interface SeoScore {
  url: string;
  score: number;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
}

export interface ArticleDraft {
  contentType: ContentType;
  status: "drafted" | "needs_review";
  title: string;
  slug: string;
  summary: string;
  audience: string;
  riskRating: RiskRating;
  confidence: Confidence;
  keyFindings: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
  sourceNotes: Array<{
    label: string;
    url: string;
    retrievedAt: string;
    claim: string;
    confidence: Confidence;
  }>;
  humanReview: {
    required: boolean;
    reviewer: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LinkFinding {
  sourceUrl: string;
  targetUrl: string;
  type: "internal" | "external";
  status: "ok" | "review" | "broken" | "unchecked";
  note: string;
}

export interface SitemapDiscoveryReport {
  sitemapUrl: string;
  totalUrlsFound: number;
  usableUrls: number;
  excludedUrls: string[];
  maxPagesPerRun: number;
  sampledUrls: string[];
  generatedAt: string;
}

export interface Phase1RunLog {
  startedAt: string;
  finishedAt: string;
  pageCount: number;
  discoveryModeCounts: Partial<Record<DiscoveryMode, number>>;
  outputs: string[];
  steps: Array<{
    name: string;
    status: "completed" | "failed";
    detail?: string;
  }>;
}
