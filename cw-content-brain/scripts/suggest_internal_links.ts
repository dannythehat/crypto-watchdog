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

export async function suggestInternalLinks(): Promise<void> {
  const routes = await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  const suggestions: Suggestion[] = [];

  for (const source of routes) {
    for (const target of routes) {
      if (source.url === target.url || source.internalLinks.includes(target.url)) {
        continue;
      }

      const sourceTerms = topTerms(`${source.title ?? ""} ${source.metaDescription ?? ""} ${source.h1s.join(" ")}`);
      const targetTerms = topTerms(`${target.title ?? ""} ${target.metaDescription ?? ""} ${target.h1s.join(" ")}`);
      const sharedTerms = sourceTerms.filter((term) => targetTerms.includes(term));

      if (sharedTerms.length >= 1) {
        suggestions.push({
          sourceUrl: source.url,
          suggestedTargetUrl: target.url,
          anchorHint: sharedTerms.slice(0, 3).join(" "),
          reason: `Related page language: ${sharedTerms.slice(0, 4).join(", ")}`,
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

function topTerms(input: string): string[] {
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "your", "crypto", "watchdog"]);
  return input
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g)
    ?.filter((term) => !stopWords.has(term))
    .slice(0, 12) ?? [];
}

if (isDirectRun(import.meta.url)) {
  await suggestInternalLinks();
}
