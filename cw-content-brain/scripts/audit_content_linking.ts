import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { ContentAuditFinding, NormalisedContentRecord } from "../src/lib/types.js";

const reportPath = "data/reports/content_linking_report.json";
const internalLinkPattern = /https:\/\/cryptowatchdog\.net\/|\]\(\//i;
const externalLinkPattern = /https?:\/\/(?!cryptowatchdog\.net)/i;

export async function auditContentLinking(): Promise<ContentAuditFinding[]> {
  const records = await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  const findings = records.flatMap((record) => auditRecord(record, records));

  await writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    totalItems: records.length,
    findings,
  });

  logger.info("Content linking report written", { findings: findings.length });
  return findings;
}

function auditRecord(record: NormalisedContentRecord, allRecords: NormalisedContentRecord[]): ContentAuditFinding[] {
  const text = [record.summary, record.body, record.verdict, record.detailed_audit].filter(Boolean).join("\n");
  const findings: ContentAuditFinding[] = [];

  if (!internalLinkPattern.test(text)) finding(record, findings, "missing_internal_links", "medium", "Content has no detected internal CryptoWatchdog links.");
  if (!externalLinkPattern.test(text)) finding(record, findings, "missing_external_evidence_links", "medium", "Content has no detected external evidence/source links.");
  if (record.sourceTable === "warnings" && !externalLinkPattern.test(text)) finding(record, findings, "warning_without_source_links", "high", "Warning has no evidence/source links.");
  if (/affiliate|commission|referral/i.test(text) && !/affiliate disclosure|editorial|methodology/i.test(text)) {
    finding(record, findings, "missing_disclosure_links", "medium", "Affiliate or methodology context should link to disclosure/editorial pages.");
  }

  const related = relatedRecords(record, allRecords);
  if (related.length > 0 && !related.some((item) => text.includes(item.slug))) {
    findings.push({
      code: "missing_related_content_links",
      severity: "low",
      sourceTable: record.sourceTable,
      id: record.id,
      slug: record.slug,
      title: record.title,
      message: `Content may be orphan-like; related records found: ${related.slice(0, 5).map((item) => item.slug).join(", ")}`,
      recommendation: "Consider links to related reviews, warnings, categories, or guides after human review.",
    });
  }

  return findings;
}

function relatedRecords(record: NormalisedContentRecord, allRecords: NormalisedContentRecord[]): NormalisedContentRecord[] {
  const terms = keywordSet(`${record.slug} ${record.title ?? ""} ${record.category ?? ""}`);
  return allRecords.filter((candidate) => {
    if (candidate.id === record.id && candidate.sourceTable === record.sourceTable) return false;
    const candidateTerms = keywordSet(`${candidate.slug} ${candidate.title ?? ""} ${candidate.category ?? ""}`);
    return [...terms].some((term) => candidateTerms.has(term));
  });
}

function keywordSet(input: string): Set<string> {
  const ignored = new Set(["crypto", "watchdog", "review", "warning", "blog", "post", "category", "example"]);
  return new Set((input.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []).filter((term) => !ignored.has(term)));
}

function finding(record: NormalisedContentRecord, findings: ContentAuditFinding[], code: string, severity: ContentAuditFinding["severity"], message: string): void {
  findings.push({ code, severity, sourceTable: record.sourceTable, id: record.id, slug: record.slug, title: record.title, message, recommendation: "Add links only after editorial review; do not publish automatically." });
}

if (isDirectRun(import.meta.url)) {
  await auditContentLinking();
}
