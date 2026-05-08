import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { countWords } from "../src/lib/text.js";
import type { RouteRecord } from "../src/lib/types.js";

interface Suggestion {
  sourceUrl: string;
  suggestedTargetUrl: string;
  reason: string;
}

async function suggestInternalLinks(): Promise<void> {
  const scanPath = process.argv[2] ?? `data/site_scan/site-scan-${todayIso()}.json`;
  const routes = await readJson<RouteRecord[]>(scanPath);
  const suggestions: Suggestion[] = [];

  for (const source of routes) {
    for (const target of routes) {
      if (source.url === target.url || source.internalLinks.includes(target.url)) {
        continue;
      }

      const sourceText = `${source.title ?? ""} ${source.description ?? ""} ${source.h1 ?? ""}`;
      const targetText = `${target.title ?? ""} ${target.description ?? ""} ${target.h1 ?? ""}`;
      const sharedTerms = topTerms(sourceText).filter((term) => topTerms(targetText).includes(term));

      if (sharedTerms.length >= 2 && countWords(sourceText) > 0 && countWords(targetText) > 0) {
        suggestions.push({
          sourceUrl: source.url,
          suggestedTargetUrl: target.url,
          reason: `Shared topic terms: ${sharedTerms.slice(0, 4).join(", ")}`,
        });
      }
    }
  }

  await writeJson(`data/reports/internal-link-suggestions-${todayIso()}.json`, {
    generatedAt: new Date().toISOString(),
    suggestions,
  });

  logger.info("Internal link suggestions written", { suggestions: suggestions.length });
}

function topTerms(input: string): string[] {
  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "your", "crypto"]);
  return input
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g)
    ?.filter((term) => !stopWords.has(term))
    .slice(0, 12) ?? [];
}

await suggestInternalLinks();

