import { readdir } from "node:fs/promises";
import { isDirectRun, fromRepoRoot, readJson, readRepoText, writeJson, writeText } from "../src/lib/fs.js";
import { toCsv } from "../src/lib/csv.js";
import { logger } from "../src/lib/logger.js";
import {
  extractLinks,
  findPossibleAffiliateLinks,
  isAllowedDomain,
  isInternalUrl,
  pathFromUrl,
  shouldCrawlPath,
} from "../src/lib/routes.js";
import {
  countImages,
  countWords,
  extractCanonical,
  extractMetaDescription,
  extractTag,
  extractTags,
  hasAffiliateDisclosure,
  stripHtml,
} from "../src/lib/text.js";
import type { RouteRecord, SiteConfig } from "../src/lib/types.js";

const inventoryJsonPath = "data/site_scan/site_inventory.json";
const inventoryCsvPath = "data/site_scan/site_inventory.csv";

export async function crawlSite(): Promise<RouteRecord[]> {
  const config = await readJson<SiteConfig>("config/site.config.json");
  const records = await crawlLive(config);
  const inventory = records.length > 0 && records.some((record) => record.wordCount > 50)
    ? records
    : await createFallbackInventory(config);

  await writeJson(inventoryJsonPath, inventory);
  await writeText(inventoryCsvPath, toCsv(flattenInventory(inventory)));
  logger.info("Site inventory written", { pages: inventory.length, json: inventoryJsonPath, csv: inventoryCsvPath });
  return inventory;
}

async function crawlLive(config: SiteConfig): Promise<RouteRecord[]> {
  const startUrl = process.env.SITE_BASE_URL ?? config.baseUrl;
  const queue = [startUrl];
  const visited = new Set<string>();
  const records: RouteRecord[] = [];

  while (queue.length > 0 && visited.size < config.maxPagesPerRun) {
    const url = queue.shift()!;
    if (visited.has(url) || !isAllowedDomain(url, config.allowedDomains)) {
      continue;
    }

    visited.add(url);
    logger.info("Scanning page", { url });

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": process.env.USER_AGENT ?? "CryptoWatchdogContentBrain/0.1",
        },
      });
      const html = await response.text();
      const links = extractLinks(url, html);
      const internalLinks = links.filter((link) => isInternalUrl(startUrl, link));
      const externalLinks = links.filter((link) => !isInternalUrl(startUrl, link));

      for (const link of internalLinks) {
        const path = pathFromUrl(link);
        if (!visited.has(link) && shouldCrawlPath(path, config.crawl.includePatterns, config.crawl.excludePatterns)) {
          queue.push(link);
        }
      }

      records.push(buildRecord(url, response.status, html, internalLinks, externalLinks, "live-crawl"));

      if (config.crawlDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, config.crawlDelayMs));
      }
    } catch (error) {
      logger.warn("Live crawl failed for page", {
        url,
        error: error instanceof Error ? error.message : "Unknown crawl error",
      });
    }
  }

  return records;
}

async function createFallbackInventory(config: SiteConfig): Promise<RouteRecord[]> {
  logger.warn("Using route manifest fallback inventory");
  const app = await readRepoText("src/App.tsx");
  const supabaseTypes = await readRepoText("src/integrations/supabase/types.ts");
  const migrationTexts = await readMigrationTexts();
  const routeMatches = Array.from(app.matchAll(/<Route\s+path="([^"]+)"/g)).map((match) => match[1]);

  return routeMatches.map((route) => {
    const normalizedPath = route === "*" ? "/404" : route.replace(/:slug/g, "example");
    const url = new URL(normalizedPath, config.baseUrl).toString();
    const title = titleFromPath(route);
    const body = `${title} ${supabaseTypes} ${migrationTexts.join(" ")}`;

    return {
      url,
      statusCode: null,
      title,
      metaDescription: "Fallback record generated from the route manifest and Supabase schema files.",
      canonical: url,
      h1s: [title],
      h2s: [],
      wordCount: countWords(body),
      internalLinks: [],
      externalLinks: [],
      imageCount: 0,
      imagesMissingAlt: 0,
      possibleAffiliateLinks: [],
      hasAffiliateDisclosure: false,
      lastScannedAt: new Date().toISOString(),
      discoveryMode: "route-manifest-fallback",
    };
  });
}

function buildRecord(
  url: string,
  statusCode: number,
  html: string,
  internalLinks: string[],
  externalLinks: string[],
  discoveryMode: RouteRecord["discoveryMode"],
): RouteRecord {
  const allLinks = [...internalLinks, ...externalLinks];
  const imageStats = countImages(html);
  const text = stripHtml(html);

  return {
    url,
    statusCode,
    title: extractTag(html, "title"),
    metaDescription: extractMetaDescription(html),
    canonical: extractCanonical(html),
    h1s: extractTags(html, "h1"),
    h2s: extractTags(html, "h2"),
    wordCount: countWords(text),
    internalLinks,
    externalLinks,
    imageCount: imageStats.imageCount,
    imagesMissingAlt: imageStats.imagesMissingAlt,
    possibleAffiliateLinks: findPossibleAffiliateLinks(allLinks),
    hasAffiliateDisclosure: hasAffiliateDisclosure(text),
    lastScannedAt: new Date().toISOString(),
    discoveryMode,
  };
}

async function readMigrationTexts(): Promise<string[]> {
  try {
    const filenames = await readdir(fromRepoRoot("supabase/migrations"));
    return Promise.all(filenames.map((filename) => readRepoText(`supabase/migrations/${filename}`)));
  } catch {
    return [];
  }
}

function titleFromPath(route: string): string {
  if (route === "/") {
    return "Home";
  }
  if (route === "*") {
    return "Not Found";
  }
  return route
    .replace(/^\//, "")
    .replace(/\/:slug/g, " Detail")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function flattenInventory(records: RouteRecord[]): Array<Record<string, unknown>> {
  return records.map((record) => ({
    ...record,
    h1s: record.h1s.join(" | "),
    h2s: record.h2s.join(" | "),
    internalLinks: record.internalLinks.join(" | "),
    externalLinks: record.externalLinks.join(" | "),
    possibleAffiliateLinks: record.possibleAffiliateLinks.join(" | "),
  }));
}

if (isDirectRun(import.meta.url)) {
  await crawlSite();
}
