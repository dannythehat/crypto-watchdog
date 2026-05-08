import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { averageScore, scoreRoute } from "../src/lib/scoring.js";
import type { RouteRecord, SiteConfig } from "../src/lib/types.js";

async function runPhase1Audit(): Promise<void> {
  const config = await readJson<SiteConfig>("config/site.config.json");
  const scanPath = process.argv[2] ?? `data/site_scan/site-scan-${todayIso()}.json`;
  const routes = await readJson<RouteRecord[]>(scanPath);
  const seoScores = routes.map((route) => scoreRoute(route, config));
  const routeIssues = routes.flatMap((route) => route.issues.map((issue) => ({ url: route.url, issue })));

  await writeJson(`data/reports/phase1-audit-${todayIso()}.json`, {
    generatedAt: new Date().toISOString(),
    siteName: config.siteName,
    scannedRoutes: routes.length,
    averageSeoScore: averageScore(seoScores),
    routeIssues,
    recommendations: [
      "Review pages with missing titles, meta descriptions, or H1 headings.",
      "Add internal links between related reviews, warnings, and education posts.",
      "Keep risk claims tied to source notes and human review.",
      "Do not publish generated drafts without editorial approval.",
    ],
  });

  logger.info("Phase 1 audit report written", {
    scannedRoutes: routes.length,
    averageSeoScore: averageScore(seoScores),
  });
}

await runPhase1Audit();

