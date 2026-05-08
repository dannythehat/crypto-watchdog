import type { RouteRecord, SeoScore, SiteConfig } from "./types.js";

export function scoreRoute(route: RouteRecord, config: SiteConfig): SeoScore {
  const checks = [
    {
      name: "title",
      passed:
        Boolean(route.title) &&
        route.title!.length >= config.seo.titleMinLength &&
        route.title!.length <= config.seo.titleMaxLength,
      detail: route.title ? `${route.title.length} characters` : "missing title",
    },
    {
      name: "description",
      passed:
        Boolean(route.metaDescription) &&
        route.metaDescription!.length >= config.seo.descriptionMinLength &&
        route.metaDescription!.length <= config.seo.descriptionMaxLength,
      detail: route.metaDescription ? `${route.metaDescription.length} characters` : "missing description",
    },
    {
      name: "h1",
      passed: route.h1s.length === 1,
      detail: `${route.h1s.length} h1 tags`,
    },
    {
      name: "word_count",
      passed: route.wordCount >= config.seo.minWords,
      detail: `${route.wordCount} words`,
    },
    {
      name: "internal_links",
      passed: route.internalLinks.length > 0,
      detail: `${route.internalLinks.length} internal links`,
    },
    {
      name: "spa_content_not_rendered",
      passed: !appearsThinSitemapSpaPage(route),
      detail: appearsThinSitemapSpaPage(route)
        ? "Sitemap URL returned thin React shell HTML; full Supabase article content was not scanned."
        : "Raw HTML appears to contain enough page content for basic scoring.",
    },
  ];

  const passed = checks.filter((check) => check.passed).length;
  return {
    url: route.url,
    score: Math.round((passed / checks.length) * 100),
    checks,
  };
}

export function averageScore(scores: SeoScore[]): number {
  if (scores.length === 0) {
    return 0;
  }
  return Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
}

function appearsThinSitemapSpaPage(route: RouteRecord): boolean {
  return route.discoveryMode === "sitemap-url" && route.wordCount < 250 && route.h1s.length === 0;
}
