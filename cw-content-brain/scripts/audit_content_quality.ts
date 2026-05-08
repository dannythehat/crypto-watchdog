import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { countWords } from "../src/lib/text.js";
import type { ContentAuditFinding, NormalisedContentRecord } from "../src/lib/types.js";

const reportPath = "data/reports/content_quality_report.json";
const codeArtifacts = [/\bimport\s+/i, /\bexport\s+/i, /\bconst\s+/i, /\binterface\s+/i, /<\/?[A-Z][A-Za-z0-9]*/, /className=/i, /React\./i];
const strongScamLanguage = [/definitely\s+a\s+scam/i, /guaranteed\s+fraud/i, /criminal/i, /stole\s+funds/i];

export async function auditContentQuality(): Promise<ContentAuditFinding[]> {
  const records = await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  const findings = records.flatMap(auditRecord);

  await writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    totalItems: records.length,
    findings,
  });

  logger.info("Content quality report written", { findings: findings.length });
  return findings;
}

function auditRecord(record: NormalisedContentRecord): ContentAuditFinding[] {
  const text = [record.title, record.summary, record.body, record.verdict, record.detailed_audit].filter(Boolean).join("\n");
  const findings: ContentAuditFinding[] = [];

  if (!record.title) finding(record, findings, "missing_title", "high", "Content item is missing a title.");
  if (!record.summary && !record.verdict) finding(record, findings, "missing_summary_or_verdict", "medium", "Content item lacks both summary and verdict.");
  if (countWords(text) < 120) finding(record, findings, "thin_content", "medium", "Content appears thin and needs human review.");
  if (!/evidence|source|according to|reviewed|placeholder/i.test(text)) finding(record, findings, "missing_evidence_placeholder", "medium", "No evidence/source placeholder language detected.");
  if (codeArtifacts.some((pattern) => pattern.test(text))) finding(record, findings, "code_artifact_detected", "high", "Content appears to include code, TypeScript, JSX, or React artifacts.");
  if (strongScamLanguage.some((pattern) => pattern.test(text))) finding(record, findings, "unsupported_strong_scam_language", "high", "Strong scam language needs evidence and legal/editorial review.");
  if (record.sourceTable === "warnings" && /scam|fraud|stole|criminal/i.test(text) && (record.evidence?.length ?? 0) === 0) {
    finding(record, findings, "warning_claim_without_evidence", "high", "Warning uses strong risk language without evidence fields.");
  }
  if (record.sourceTable === "reviews") {
    if (!record.pros?.length) finding(record, findings, "review_missing_pros", "medium", "Review is missing pros.");
    if (!record.cons?.length) finding(record, findings, "review_missing_cons", "medium", "Review is missing cons.");
    if (!record.verdict) finding(record, findings, "review_missing_verdict", "high", "Review is missing verdict.");
    if (record.trust_score === undefined) finding(record, findings, "review_missing_trust_score", "medium", "Review is missing trust_score.");
  }
  if (hasRepeatedBoilerplate(text)) finding(record, findings, "repeated_boilerplate", "low", "Repeated boilerplate detected.");
  if (!/##|FAQ|Question|What|How|Why/i.test(text) && ["blog_posts", "warnings"].includes(record.sourceTable)) {
    finding(record, findings, "weak_structure", "low", "Article may need clearer headings, FAQ, or structured sections.");
  }

  return findings;
}

function finding(record: NormalisedContentRecord, findings: ContentAuditFinding[], code: string, severity: ContentAuditFinding["severity"], message: string): void {
  findings.push({ code, severity, sourceTable: record.sourceTable, id: record.id, slug: record.slug, title: record.title, message, recommendation: "Flag for human editorial review before publication." });
}

function hasRepeatedBoilerplate(text: string): boolean {
  const sentences = text.split(/[.!?]+/).map((sentence) => sentence.trim().toLowerCase()).filter((sentence) => sentence.length > 30);
  return new Set(sentences).size < sentences.length;
}

if (isDirectRun(import.meta.url)) {
  await auditContentQuality();
}
