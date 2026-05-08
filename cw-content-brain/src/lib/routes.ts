import { URL } from "node:url";

export function normalizeUrl(baseUrl: string, href: string): string | undefined {
  try {
    const url = new URL(href, baseUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

export function isInternalUrl(siteUrl: string, candidate: string): boolean {
  return new URL(candidate).hostname === new URL(siteUrl).hostname;
}

export function isAllowedDomain(candidate: string, allowedDomains: string[]): boolean {
  const hostname = new URL(candidate).hostname;
  return allowedDomains.includes(hostname);
}

export function pathFromUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname || "/";
}

export function shouldCrawlPath(path: string, includePatterns: string[], excludePatterns: string[]): boolean {
  const included = includePatterns.length === 0 || includePatterns.some((pattern) => path.startsWith(pattern));
  const excluded = excludePatterns.some((pattern) => path.startsWith(pattern));
  return included && !excluded;
}

export function extractLinks(baseUrl: string, html: string): string[] {
  const matches = html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi);
  return Array.from(matches)
    .map((match) => normalizeUrl(baseUrl, match[1]))
    .filter((value): value is string => Boolean(value));
}

export function findPossibleAffiliateLinks(links: string[]): string[] {
  return links.filter((link) => /[?&](ref|aff|affiliate|partner|utm_source|utm_campaign)=|\/ref\/|\/affiliate\//i.test(link));
}
