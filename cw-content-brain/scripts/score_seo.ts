import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { toCsv } from "../src/lib/csv.js";
import { averageScore, scoreRoute } from "../src/lib/scoring.js";
import type { RouteRecord, SiteConfig } from "../src/lib/types.js";
import { logger } from "../src/lib/logger.js";

const seoJsonPath = "data/reports/seo_scores.json";
const seoCsvPath = "data/reports/seo_scores.csv";

export async function scoreSeo(): Promise<void> {
  const config = await readJson<SiteConfig>("config/site.config.json");
  const routes = await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  const scores = routes.map((route) => scoreRoute(route, config));
  const report = {
    generatedAt: new Date().toISOString(),
    averageScore: averageScore(scores),
    scores,
  };

  await writeJson(seoJsonPath, report);
  await writeText(
    seoCsvPath,
    toCsv(
      scores.map((score) => ({
        url: score.url,
        score: score.score,
        failedChecks: score.checks.filter((check) => !check.passed).map((check) => check.name).join(" | "),
      })),
    ),
  );

  logger.info("SEO score report written", { routes: routes.length, averageScore: report.averageScore });
}

if (isDirectRun(import.meta.url)) {
  await scoreSeo();
}
