import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { LinkFinding, RouteRecord } from "../src/lib/types.js";

async function auditLinks(): Promise<void> {
  const scanPath = process.argv[2] ?? `data/site_scan/site-scan-${todayIso()}.json`;
  const routes = await readJson<RouteRecord[]>(scanPath);
  const findings: LinkFinding[] = [];

  for (const route of routes) {
    for (const targetUrl of [...route.internalLinks, ...route.externalLinks]) {
      const type = route.internalLinks.includes(targetUrl) ? "internal" : "external";
      findings.push({
        sourceUrl: route.url,
        targetUrl,
        type,
        status: "unchecked",
        note: "Recorded from site scan. Run a live status checker only when approved.",
      });
    }
  }

  await writeJson(`data/reports/link-audit-${todayIso()}.json`, {
    generatedAt: new Date().toISOString(),
    findings,
  });

  logger.info("Link audit report written", { links: findings.length });
}

await auditLinks();

