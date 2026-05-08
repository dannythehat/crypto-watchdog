import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { buildAuditSummary } from "../src/lib/audit.js";
import { logger } from "../src/lib/logger.js";
import type { ContentAuditFinding, ContentAuditSummary } from "../src/lib/types.js";

interface AuditReport {
  generatedAt: string;
  totalItems: number;
  summary?: ContentAuditSummary;
  findings: ContentAuditFinding[];
}

interface NamedReport {
  name: string;
  path: string;
  report: AuditReport;
}

const inputReports = [
  { name: "Content quality", path: "data/reports/content_quality_report.json" },
  { name: "Affiliate placement", path: "data/reports/affiliate_placement_report.json" },
  { name: "Content linking", path: "data/reports/content_linking_report.json" },
];

export async function summariseAuditConfidence(): Promise<void> {
  const reports: NamedReport[] = [];

  for (const input of inputReports) {
    const report = await readJson<AuditReport>(input.path);
    reports.push({ ...input, report });
  }

  const allFindings = reports.flatMap(({ report }) => report.findings ?? []);
  const summary = {
    generatedAt: new Date().toISOString(),
    disclaimer: "These are possible issues, not confirmed defects. No content should be changed automatically based on these reports.",
    overall: buildAuditSummary(allFindings),
    reports: reports.map(({ name, path, report }) => ({
      name,
      path,
      summary: report.summary ?? buildAuditSummary(report.findings ?? []),
    })),
  };

  await writeJson("data/reports/audit_confidence_summary.json", summary);
  await writeText("data/reports/audit_confidence_summary.md", renderMarkdown(summary));
  logger.info("Audit confidence summary written", { totalFindings: allFindings.length });
}

function renderMarkdown(summary: {
  generatedAt: string;
  disclaimer: string;
  overall: ContentAuditSummary;
  reports: Array<{ name: string; path: string; summary: ContentAuditSummary }>;
}): string {
  return `# Audit Confidence Summary

Generated: ${summary.generatedAt}

${summary.disclaimer}

High-confidence findings should be reviewed first. High false-positive-risk findings should be verified against rendered pages before editing. No content should be changed automatically based on these reports.

## Overall

- Total findings: ${summary.overall.totalFindings}
- Needs human review: ${summary.overall.needsHumanReviewCount}
- By confidence: ${formatCounts(summary.overall.byConfidence)}
- By false-positive risk: ${formatCounts(summary.overall.byFalsePositiveRisk)}
- By severity: ${formatCounts(summary.overall.bySeverity)}

## Reports

${summary.reports.map(({ name, path, summary: reportSummary }) => `### ${name}

Source: ${path}

- Total findings: ${reportSummary.totalFindings}
- Needs human review: ${reportSummary.needsHumanReviewCount}
- By confidence: ${formatCounts(reportSummary.byConfidence)}
- By false-positive risk: ${formatCounts(reportSummary.byFalsePositiveRisk)}
- By severity: ${formatCounts(reportSummary.bySeverity)}
- Top codes: ${formatTopCodes(reportSummary.byCode)}
`).join("\n")}
## Review Guidance

- Treat every item as a possible issue until a human verifies it.
- Start with high-confidence, low false-positive-risk items.
- Check high false-positive-risk findings against rendered pages, templates, and structured fields before editing.
- Do not publish, rewrite, delete, or add affiliate links automatically from these reports.
`;
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts);
  return entries.length > 0 ? entries.map(([key, value]) => `${key}: ${value}`).join(", ") : "none";
}

function formatTopCodes(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return entries.length > 0 ? entries.map(([key, value]) => `${key}: ${value}`).join(", ") : "none";
}

if (isDirectRun(import.meta.url)) {
  await summariseAuditConfidence();
}
