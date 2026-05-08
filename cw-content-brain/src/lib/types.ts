export type ContentType =
  | "platform_review"
  | "scam_warning"
  | "education_post"
  | "market_safety_note";

export type RiskRating = "green" | "orange" | "red" | "not_applicable";

export type Confidence = "low" | "medium" | "high";

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  contentTypes: ContentType[];
  protectedRoutes: string[];
  crawl: {
    maxPages: number;
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
  path: string;
  status?: number;
  title?: string;
  description?: string;
  h1?: string;
  wordCount?: number;
  internalLinks: string[];
  externalLinks: string[];
  issues: string[];
  scannedAt: string;
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

