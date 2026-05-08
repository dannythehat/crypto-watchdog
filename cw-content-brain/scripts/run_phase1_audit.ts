import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { DiscoveryMode, Phase1RunLog, RouteRecord } from "../src/lib/types.js";
import { auditLinks } from "./audit_links.js";
import { crawlSite } from "./crawl_site.js";
import { scoreSeo } from "./score_seo.js";
import { suggestInternalLinks } from "./suggest_internal_links.js";

export async function runPhase1Audit(): Promise<void> {
  const startedAt = new Date().toISOString();
  const steps: Phase1RunLog["steps"] = [];
  let failure: unknown;

  for (const [name, step] of [
    ["crawl_site", crawlSite],
    ["score_seo", scoreSeo],
    ["audit_links", auditLinks],
    ["suggest_internal_links", suggestInternalLinks],
  ] as const) {
    try {
      await step();
      steps.push({ name, status: "completed" });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      steps.push({ name, status: "failed", detail });
      logger.error("Phase 1 step failed", { name, detail });
      failure = error;
      break;
    }
  }

  const inventory = await readOptionalInventory();

  await writeJson("logs/phase1-run.json", {
    startedAt,
    finishedAt: new Date().toISOString(),
    pageCount: inventory.length,
    discoveryModeCounts: countDiscoveryModes(inventory),
    outputs: [
      "data/site_scan/site_inventory.json",
      "data/site_scan/site_inventory.csv",
      "data/reports/sitemap_discovery.json",
      "data/reports/seo_scores.json",
      "data/reports/seo_scores.csv",
      "data/reports/link_audit.json",
      "data/reports/internal_link_recommendations.json",
      "logs/phase1-run.json",
    ],
    steps,
  } satisfies Phase1RunLog);

  logger.info("Phase 1 audit complete");

  if (failure) {
    throw failure;
  }
}

async function readOptionalInventory(): Promise<RouteRecord[]> {
  try {
    return await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  } catch {
    return [];
  }
}

function countDiscoveryModes(records: RouteRecord[]): Partial<Record<DiscoveryMode, number>> {
  return records.reduce<Partial<Record<DiscoveryMode, number>>>((counts, record) => {
    counts[record.discoveryMode] = (counts[record.discoveryMode] ?? 0) + 1;
    return counts;
  }, {});
}

if (isDirectRun(import.meta.url)) {
  await runPhase1Audit();
}
