import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { RouteRecord } from "../src/lib/types.js";

interface Suggestion {
  sourceUrl: string;
  suggestedTargetUrl: string;
  anchorHint: string;
  reason: string;
}

const recommendationsPath = "data/reports/internal_link_recommendations.json";
const ignoredTerms = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "fallback",
  "record",
  "generated",
  "route",
  "manifest",
  "supabase",
  "schema",
  "crypto",
  "watchdog",
  "page",
  "detail",
  "example",
]);

export async function suggestInternalLinks(): Promise<void> {
  const routes = await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  const suggestions: Suggestion[] = [];

  for (const source of routes) {
    for (const target of routes) {
      if (source.url === target.url || source.internalLinks.includes(target.url)) {
        continue;
      }

      const sourceTerms = termsForRecord(source);
      const targetTerms = termsForRecord(target);
      const sharedTerms = sourceTerms.filter((term) => targetTerms.includes(term));

      if (sharedTerms.length >= 1) {
        suggestions.push({
          sourceUrl: source.url,
          suggestedTargetUrl: target.url,
          anchorHint: sharedTerms.slice(0, 3).join(" "),
          reason: `Related URL taxonomy or page terms: ${sharedTerms.slice(0, 4).join(", ")}`,
        });
      }
    }
  }

  await writeJson(recommendationsPath, {
    generatedAt: new Date().toISOString(),
    suggestions,
  });

  logger.info("Internal link recommendations written", { suggestions: suggestions.length });
}

function termsForRecord(record: RouteRecord): string[] {
  const url = new URL(record.url);
  const pathTerms = url.pathname.replace(/\.[a-z0-9]+$/i, " ").replace(/[^a-z0-9]+/gi, " ");
  const contentTerms = record.discoveryMode === "sitemap-url" && record.wordCount < 250
    ? ""
    : `${record.title ?? ""} ${record.metaDescription ?? ""} ${record.h1s.join(" ")}`;
  return topTerms(`${pathTerms} ${contentTerms}`);
}

function topTerms(input: string): string[] {
  return Array.from(new Set(input.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? []))
    .filter((term) => !ignoredTerms.has(term))
    .slice(0, 12);
}

if (isDirectRun(import.meta.url)) {
  await suggestInternalLinks();
}
