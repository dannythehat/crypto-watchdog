import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { extractLinks, isInternalUrl, pathFromUrl, shouldCrawlPath } from "../src/lib/routes.js";
import { extractMetaDescription, extractTag, stripHtml, countWords } from "../src/lib/text.js";
import type { RouteRecord, SiteConfig } from "../src/lib/types.js";

async function crawl(): Promise<void> {
  const config = await readJson<SiteConfig>("config/site.config.json");
  const queue = [config.siteUrl];
  const visited = new Set<string>();
  const records: RouteRecord[] = [];

  while (queue.length > 0 && visited.size < config.crawl.maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) {
      continue;
    }

    visited.add(url);
    logger.info("Scanning page", { url });

    try {
      const response = await fetch(url);
      const html = await response.text();
      const links = extractLinks(url, html);
      const internalLinks = links.filter((link) => isInternalUrl(config.siteUrl, link));
      const externalLinks = links.filter((link) => !isInternalUrl(config.siteUrl, link));

      for (const link of internalLinks) {
        const path = pathFromUrl(link);
        if (!visited.has(link) && shouldCrawlPath(path, config.crawl.includePatterns, config.crawl.excludePatterns)) {
          queue.push(link);
        }
      }

      records.push({
        url,
        path: pathFromUrl(url),
        status: response.status,
        title: extractTag(html, "title"),
        description: extractMetaDescription(html),
        h1: extractTag(html, "h1"),
        wordCount: countWords(stripHtml(html)),
        internalLinks,
        externalLinks,
        issues: response.ok ? [] : [`HTTP ${response.status}`],
        scannedAt: new Date().toISOString(),
      });
    } catch (error) {
      records.push({
        url,
        path: pathFromUrl(url),
        internalLinks: [],
        externalLinks: [],
        issues: [error instanceof Error ? error.message : "Unknown crawl error"],
        scannedAt: new Date().toISOString(),
      });
    }
  }

  await writeJson(`data/site_scan/site-scan-${todayIso()}.json`, records);
  logger.info("Site scan written", { pages: records.length });
}

await crawl();

