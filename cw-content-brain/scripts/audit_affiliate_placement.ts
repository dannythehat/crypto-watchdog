import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import { buildAuditSummary, evidenceSnippet } from "../src/lib/audit.js";
import type { Confidence, ContentAuditFinding, FalsePositiveRisk, NormalisedContentRecord } from "../src/lib/types.js";

const reportPath = "data/reports/affiliate_placement_report.json";
const affiliatePattern = /(affiliate|referral|commission|partner|utm_campaign|utm_source|\/ref\/|\?ref=)/i;
const disclosurePattern = /(affiliate disclosure|may receive compensation|commission|sponsored|referral disclosure)/i;

export async function auditAffiliatePlacement(): Promise<ContentAuditFinding[]> {
  const records = await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  const findings = records.flatMap(auditRecord);

  await writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    totalItems: records.length,
    summary: buildAuditSummary(findings),
    findings,
  });

  logger.info("Affiliate placement report written", { findings: findings.length });
  return findings;
}

function auditRecord(record: NormalisedContentRecord): ContentAuditFinding[] {
  const text = [record.summary, record.body, record.verdict, record.detailed_audit].filter(Boolean).join("\n");
  const findings: ContentAuditFinding[] = [];
  const affiliateMatches = text.match(new RegExp(affiliatePattern, "gi")) ?? [];

  if (affiliateMatches.length === 0) {
    if (record.sourceTable === "warnings" && !/alternative|safer option|what to do next/i.test(text)) {
      finding(record, findings, "warning_missing_safer_alternatives", "medium", "medium", "medium", true, "Warning content should include safer alternatives or next steps.", "Warning content may need user-safe next steps even when affiliate links are absent.");
    }
    return findings;
  }

  const firstAffiliateIndex = text.search(affiliatePattern);
  const openingBoundary = Math.max(text.indexOf("\n\n"), 0);
  if (firstAffiliateIndex >= 0 && firstAffiliateIndex <= openingBoundary + 240) {
    finding(record, findings, "affiliate_too_close_to_opening", "high", "medium", "medium", true, "Affiliate mention appears before or too close to the opening body copy.", "Position-based check needs rendered-page review before editing.", evidenceSnippet(text, affiliatePattern));
  }
  if (!disclosurePattern.test(text)) {
    finding(record, findings, "affiliate_without_nearby_disclosure", "high", "medium", "high", true, "Affiliate language appears without a nearby disclosure.", "Disclosure may exist in a global page template, header, footer, or reusable component.", evidenceSnippet(text, affiliatePattern));
  }
  if (record.rating === "red" || record.sourceTable === "warnings") {
    finding(record, findings, "affiliate_on_red_or_warning_page", "high", "high", "medium", true, "Affiliate links or CTAs should not appear on red-rated or scam-warning pages.", "Safer-alternative links may be acceptable, so review manually.", evidenceSnippet(text, affiliatePattern));
  }
  if (affiliateMatches.length > 3) {
    finding(record, findings, "repeated_affiliate_ctas", "medium", "high", affiliateMatches.length >= 5 ? "low" : "medium", true, "Affiliate CTA language appears repeatedly.", `Detected ${affiliateMatches.length} affiliate-like mentions.`, evidenceSnippet(text, affiliatePattern));
  }
  if (/placeholder|example only|not approved/i.test(text)) {
    finding(record, findings, "possible_affiliate_placeholder_not_approved", "medium", "high", "low", true, "Possible affiliate placeholder needs owner approval before use.", "Placeholder or not-approved language was detected near affiliate-like text.", evidenceSnippet(text, /placeholder|example only|not approved/i));
  }
  if (!isAffiliateRelevant(record, text)) {
    finding(record, findings, "irrelevant_affiliate_mention", "low", "medium", "medium", true, "Affiliate mention may not match the page topic or risk context.", "Topic match is heuristic and should be checked by a human.", evidenceSnippet(text, affiliatePattern));
  }

  return findings;
}

function isAffiliateRelevant(record: NormalisedContentRecord, text: string): boolean {
  const topic = `${record.title ?? ""} ${record.category ?? ""}`.toLowerCase();
  return /exchange|wallet|platform|broker|app/.test(topic) || /exchange|wallet|platform|broker|app/.test(text.toLowerCase());
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
    recommendation: "Treat as an affiliate placement recommendation only; human approval required.",
    confidence,
    falsePositiveRisk,
    evidenceSnippet: snippet,
    reason,
    needsHumanReview,
  });
}

if (isDirectRun(import.meta.url)) {
  await auditAffiliatePlacement();
}
