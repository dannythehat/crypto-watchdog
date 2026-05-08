import { isDirectRun, readJson, writeJson } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { ContentAuditFinding, NormalisedContentRecord } from "../src/lib/types.js";

const reportPath = "data/reports/affiliate_placement_report.json";
const affiliatePattern = /(affiliate|referral|commission|partner|utm_campaign|utm_source|\/ref\/|\?ref=)/i;
const disclosurePattern = /(affiliate disclosure|may receive compensation|commission|sponsored|referral disclosure)/i;

export async function auditAffiliatePlacement(): Promise<ContentAuditFinding[]> {
  const records = await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  const findings = records.flatMap(auditRecord);

  await writeJson(reportPath, {
    generatedAt: new Date().toISOString(),
    totalItems: records.length,
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
      finding(record, findings, "warning_missing_safer_alternatives", "medium", "Warning content should include safer alternatives or next steps.");
    }
    return findings;
  }

  const firstAffiliateIndex = text.search(affiliatePattern);
  const openingBoundary = Math.max(text.indexOf("\n\n"), 0);
  if (firstAffiliateIndex >= 0 && firstAffiliateIndex <= openingBoundary + 240) {
    finding(record, findings, "affiliate_too_close_to_opening", "high", "Affiliate mention appears before or too close to the opening body copy.");
  }
  if (!disclosurePattern.test(text)) {
    finding(record, findings, "affiliate_without_nearby_disclosure", "high", "Affiliate language appears without a nearby disclosure.");
  }
  if (record.rating === "red" || record.sourceTable === "warnings") {
    finding(record, findings, "affiliate_on_red_or_warning_page", "high", "Affiliate links or CTAs should not appear on red-rated or scam-warning pages.");
  }
  if (affiliateMatches.length > 3) {
    finding(record, findings, "repeated_affiliate_ctas", "medium", "Affiliate CTA language appears repeatedly.");
  }
  if (/placeholder|example only|not approved/i.test(text)) {
    finding(record, findings, "possible_affiliate_placeholder_not_approved", "medium", "Possible affiliate placeholder needs owner approval before use.");
  }
  if (!isAffiliateRelevant(record, text)) {
    finding(record, findings, "irrelevant_affiliate_mention", "low", "Affiliate mention may not match the page topic or risk context.");
  }

  return findings;
}

function isAffiliateRelevant(record: NormalisedContentRecord, text: string): boolean {
  const topic = `${record.title ?? ""} ${record.category ?? ""}`.toLowerCase();
  return /exchange|wallet|platform|broker|app/.test(topic) || /exchange|wallet|platform|broker|app/.test(text.toLowerCase());
}

function finding(record: NormalisedContentRecord, findings: ContentAuditFinding[], code: string, severity: ContentAuditFinding["severity"], message: string): void {
  findings.push({ code, severity, sourceTable: record.sourceTable, id: record.id, slug: record.slug, title: record.title, message, recommendation: "Treat as an affiliate placement recommendation only; human approval required." });
}

if (isDirectRun(import.meta.url)) {
  await auditAffiliatePlacement();
}
