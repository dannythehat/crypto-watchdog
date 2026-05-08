import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { LinkFinding, RouteRecord } from "../src/lib/types.js";

const linkAuditPath = "data/reports/link_audit.json";

export async function auditLinks(): Promise<void> {
  const routes = await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  const findings: LinkFinding[] = [];

  for (const route of routes) {
    for (const targetUrl of route.internalLinks) {
      findings.push({
        sourceUrl: route.url,
        targetUrl,
        type: "internal",
        status: "unchecked",
        note: "Collected from inventory. Live status checks require explicit approval.",
      });
    }

    for (const targetUrl of route.externalLinks) {
      findings.push({
        sourceUrl: route.url,
        targetUrl,
        type: "external",
        status: "review",
        note: route.possibleAffiliateLinks.includes(targetUrl)
          ? "Possible affiliate link; confirm disclosure and approval."
          : "External link collected from inventory.",
      });
    }
  }

  await writeJson(linkAuditPath, {
    generatedAt: new Date().toISOString(),
    findings,
  });

  logger.info("Link audit report written", { links: findings.length });
}

if (isDirectRun(import.meta.url)) {
  await auditLinks();
}
