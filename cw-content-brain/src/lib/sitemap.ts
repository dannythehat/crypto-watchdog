import { writeJson } from "./fs.js";
import { isAllowedDomain, pathFromUrl, shouldCrawlPath } from "./routes.js";
import type { SitemapDiscoveryReport, SiteConfig } from "./types.js";

export interface SitemapDiscoveryResult {
  sitemapUrl: string;
  urls: string[];
  report: SitemapDiscoveryReport;
}

export async function discoverSitemapUrls(config: SiteConfig): Promise<SitemapDiscoveryResult> {
  const sitemapUrl = new URL("/sitemap.xml", config.baseUrl).toString();
  const discovered = new Set<string>();
  const excluded = new Set<string>();
  let rawUrls: string[] = [];

  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        "user-agent": process.env.USER_AGENT ?? "CryptoWatchdogContentBrain/0.1",
      },
    });

    if (response.ok) {
      rawUrls = extractSitemapLocs(await response.text());
    }
  } catch {
    rawUrls = [];
  }

  for (const rawUrl of rawUrls) {
    const normalized = normalizeSitemapUrl(rawUrl);
    if (!normalized) {
      continue;
    }

    const path = pathFromUrl(normalized);
    const allowed = isAllowedDomain(normalized, config.allowedDomains);
    const crawlable = shouldCrawlPath(path, config.crawl.includePatterns, config.crawl.excludePatterns);

    if (!allowed || !crawlable) {
      excluded.add(normalized);
      continue;
    }

    if (discovered.size < config.maxPagesPerRun) {
      discovered.add(normalized);
    }
  }

  const urls = Array.from(discovered);
  const report: SitemapDiscoveryReport = {
    sitemapUrl,
    totalUrlsFound: rawUrls.length,
    usableUrls: urls.length,
    excludedUrls: Array.from(excluded),
    maxPagesPerRun: config.maxPagesPerRun,
    sampledUrls: urls.slice(0, 20),
    generatedAt: new Date().toISOString(),
  };

  await writeJson("data/reports/sitemap_discovery.json", report);
  return { sitemapUrl, urls, report };
}

export function extractSitemapLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi))
    .map((match) => decodeXmlEntity(match[1].trim()))
    .filter(Boolean);
}

function normalizeSitemapUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

function decodeXmlEntity(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}
