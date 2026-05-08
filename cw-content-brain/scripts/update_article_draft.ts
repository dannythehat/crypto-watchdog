import { isDirectRun, readJson, todayIso, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { slugify } from "../src/lib/text.js";
import type { RouteRecord } from "../src/lib/types.js";

interface ReportSummary {
  generatedAt?: string;
  averageScore?: number;
  findings?: unknown[];
  suggestions?: unknown[];
}

export async function updateArticleDraft(argv = process.argv.slice(2)): Promise<void> {
  const url = parseUrlArg(argv);
  if (!url) {
    throw new Error("Usage: npm run update-draft -- --url https://cryptowatchdog.net/example-page");
  }

  const inventory = await readJson<RouteRecord[]>("data/site_scan/site_inventory.json");
  const seo = await readOptionalJson<ReportSummary>("data/reports/seo_scores.json");
  const links = await readOptionalJson<ReportSummary>("data/reports/link_audit.json");
  const internalLinks = await readOptionalJson<ReportSummary>("data/reports/internal_link_recommendations.json");
  const record = inventory.find((item) => item.url === url);
  const slug = slugify(new URL(url).pathname || "home") || "home";

  const markdown = `# Update Recommendation: ${url}

Generated: ${new Date().toISOString()}

## Page Inventory

${record ? renderRecord(record) : "No inventory record found for this URL. Run the approved crawl/audit flow before acting."}

## SEO Report Context

- Generated at: ${seo?.generatedAt ?? "not available"}
- Average score: ${seo?.averageScore ?? "not available"}

## Link Audit Context

- Link findings available: ${links?.findings?.length ?? 0}
- Internal link suggestions available: ${internalLinks?.suggestions?.length ?? 0}

## Recommended Update

- Placeholder only. Review page intent, current evidence, internal link opportunities, and risk wording.
- Do not publish changes without human approval.
- Do not invent claims or add affiliate links without approval.
`;

  await writeText(`data/drafts/updates/${todayIso()}-${slug}.md`, markdown);
  logger.info("Article update recommendation written", { url });
}

async function readOptionalJson<T>(path: string): Promise<T | undefined> {
  try {
    return await readJson<T>(path);
  } catch {
    return undefined;
  }
}

function parseUrlArg(argv: string[]): string | undefined {
  const index = argv.indexOf("--url");
  return index >= 0 ? argv[index + 1] : undefined;
}

function renderRecord(record: RouteRecord): string {
  return `- Title: ${record.title ?? "missing"}
- Meta description: ${record.metaDescription ?? "missing"}
- H1 count: ${record.h1s.length}
- H2 count: ${record.h2s.length}
- Word count: ${record.wordCount}
- Internal links: ${record.internalLinks.length}
- External links: ${record.externalLinks.length}
- Images missing alt: ${record.imagesMissingAlt}
- Possible affiliate links: ${record.possibleAffiliateLinks.length}
- Affiliate disclosure: ${record.hasAffiliateDisclosure ? "yes" : "no"}
- Discovery mode: ${record.discoveryMode}`;
}

if (isDirectRun(import.meta.url)) {
  await updateArticleDraft();
}
