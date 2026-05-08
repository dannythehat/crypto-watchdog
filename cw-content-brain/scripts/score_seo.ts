import { readJson, todayIso, writeJson } from "../src/lib/fs.js";
import { averageScore, scoreRoute } from "../src/lib/scoring.js";
import type { RouteRecord, SiteConfig } from "../src/lib/types.js";
import { logger } from "../src/lib/logger.js";

async function scoreSeo(): Promise<void> {
  const config = await readJson<SiteConfig>("config/site.config.json");
  const scanPath = process.argv[2] ?? `data/site_scan/site-scan-${todayIso()}.json`;
  const routes = await readJson<RouteRecord[]>(scanPath);
  const scores = routes.map((route) => scoreRoute(route, config));

  await writeJson(`data/reports/seo-score-${todayIso()}.json`, {
    generatedAt: new Date().toISOString(),
    averageScore: averageScore(scores),
    scores,
  });

  logger.info("SEO score report written", { routes: routes.length, averageScore: averageScore(scores) });
}

await scoreSeo();

