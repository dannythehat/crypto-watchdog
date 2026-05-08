import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { buildAuditSummary, evidenceSnippet } from "../src/lib/audit.js";
import { countWords } from "../src/lib/text.js";
import type { Confidence, ContentAuditFinding, FalsePositiveRisk, NormalisedContentRecord } from "../src/lib/types.js";

const reportPath = "data/reports/content_quality_report.json";
const strongCodeTokens = [/\bimport\s+/i, /export\s+default/i, /\binterface\s+/i, /\btype\s+/i, /\bconst\s+/i, /\bfunction\s+/i, /className=/i, /<div\b/i, /<\//i, /React\./i];
const strongScamLanguage = [/definitely\s+a\s+scam/i, /guaranteed\s+fraud/i, /criminal/i, /stole\s+funds/i];

export async function auditContentQuality(): Promise<ContentAuditFinding[]> {
  const records = await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  const findings = records.flatMap(auditRecord);

  await writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    totalItems: records.length,
    summary: buildAuditSummary(findings),
    findings,
  });

  logger.info("Content quality report written", { findings: findings.length });
  return findings;
}

function auditRecord(record: NormalisedContentRecord): ContentAuditFinding[] {
  const text = [record.title, record.summary, record.body, record.verdict, record.detailed_audit, ...(record.evidence ?? [])].filter(Boolean).join("\n");
  const wordCount = countWords(text);
  const findings: ContentAuditFinding[] = [];

  if (!record.title) finding(record, findings, "missing_title", "high", "high", "low", true, "Content item is missing a title.", "Title field is absent or empty.");
  if (!record.summary && !record.verdict) finding(record, findings, "missing_summary_or_verdict", "medium", "high", "low", true, "Content item lacks both summary and verdict.", "Both summary and verdict fields are absent.");
  if (wordCount < 120) finding(record, findings, "thin_content", "medium", "medium", record.sourceTable === "categories" ? "high" : "medium", true, "Content appears thin and needs human review.", `Normalised text contains ${wordCount} words.`, `wordCount=${wordCount}`);
  if (!hasEvidenceSignals(record, text)) finding(record, findings, "missing_evidence_placeholder", "medium", record.detailed_audit || record.evidence?.length ? "medium" : "low", "high", true, "No evidence/source placeholder language detected.", "Evidence may exist in templates, detailed audit JSON, or external fields, so verify manually.");

  const matchedCodeTokens = strongCodeTokens.filter((pattern) => pattern.test(text));
  if (matchedCodeTokens.length > 0) {
    finding(
      record,
      findings,
      "code_artifact_detected",
      "high",
      matchedCodeTokens.length >= 2 ? "high" : "medium",
      matchedCodeTokens.length >= 2 ? "medium" : "medium",
      true,
      "Content appears to include code, TypeScript, JSX, or React artifacts.",
      `Matched ${matchedCodeTokens.length} strong code-like token(s).`,
      evidenceSnippet(text, matchedCodeTokens[0]),
    );
  }

  const scamMatch = strongScamLanguage.find((pattern) => pattern.test(text));
  if (scamMatch) {
    finding(
      record,
      findings,
      "unsupported_strong_scam_language",
      "high",
      /definitely\s+a\s+scam|guaranteed\s+fraud/i.test(text) ? "high" : "medium",
      record.evidence?.length || record.detailed_audit ? "medium" : "medium",
      true,
      "Strong scam language needs evidence and legal/editorial review.",
      "Exact wording may be risky unless evidence is strong and reviewed.",
      evidenceSnippet(text, scamMatch),
    );
  }

  if (record.sourceTable === "warnings" && /scam|fraud|stole|criminal/i.test(text) && (record.evidence?.length ?? 0) === 0) {
    finding(record, findings, "warning_claim_without_evidence", "high", "medium", record.detailed_audit ? "high" : "medium", true, "Warning uses strong risk language without evidence fields.", "Detailed audit content may contain evidence that needs manual interpretation.", evidenceSnippet(text, /scam|fraud|stole|criminal/i));
  }
  if (record.sourceTable === "reviews") {
    if (!record.pros?.length) finding(record, findings, "review_missing_pros", "medium", "high", "low", true, "Review is missing pros.", "Pros field is absent or empty.");
    if (!record.cons?.length) finding(record, findings, "review_missing_cons", "medium", "high", "low", true, "Review is missing cons.", "Cons field is absent or empty.");
    if (!record.verdict) finding(record, findings, "review_missing_verdict", "high", "high", "low", true, "Review is missing verdict.", "Verdict field is absent or empty.");
    if (record.trust_score === undefined) finding(record, findings, "review_missing_trust_score", "medium", "high", "low", true, "Review is missing trust_score.", "trust_score field is absent or null.");
  }
  if (hasRepeatedBoilerplate(text)) finding(record, findings, "repeated_boilerplate", "low", "medium", "medium", true, "Repeated boilerplate detected.", "Repeated sentence-like text appears in the normalised fields.");
  if (!/##|FAQ|Question|What|How|Why/i.test(text) && ["blog_posts", "warnings"].includes(record.sourceTable)) {
    finding(record, findings, "weak_structure", "low", "low", "high", true, "Article may need clearer headings, FAQ, or structured sections.", "Structure may be provided by the rendered template, so verify before editing.");
  }

  return findings;
}

function finding(
  record: NormalisedContentRecord,
  findings: ContentAuditFinding[],
  code: string,
  severity: ContentAuditFinding["severity"],
  confidence: Confidence,
  falsePositiveRisk: FalsePositiveRisk,
  needsHumanReview: boolean,
  message: string,
  reason: string,
  snippet?: string,
): void {
  findings.push({
    code,
    severity,
    sourceTable: record.sourceTable,
    id: record.id,
    slug: record.slug,
    title: record.title,
    message,
    recommendation: "Flag for human editorial review before publication.",
    confidence,
    falsePositiveRisk,
    evidenceSnippet: snippet,
    reason,
    needsHumanReview,
  });
}

function hasEvidenceSignals(record: NormalisedContentRecord, text: string): boolean {
  return Boolean(record.evidence?.length || record.detailed_audit || /evidence|source|according to|reviewed|placeholder/i.test(text));
}

function hasRepeatedBoilerplate(text: string): boolean {
  const sentences = text.split(/[.!?]+/).map((sentence) => sentence.trim().toLowerCase()).filter((sentence) => sentence.length > 30);
  return new Set(sentences).size < sentences.length;
}

if (isDirectRun(import.meta.url)) {
  await auditContentQuality();
}
