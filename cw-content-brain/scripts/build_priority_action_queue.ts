import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { Confidence, ContentAuditFinding, FalsePositiveRisk, SnapshotTableName } from "../src/lib/types.js";

interface PriorityRules {
  severityPoints: Record<string, number>;
  confidenceMultiplier: Record<Confidence, number>;
  falsePositivePenalty: Record<FalsePositiveRisk, number>;
  issuePriorityBoosts: Record<string, number>;
  extraPageBoosts: {
    affiliateAndTrustEvidenceIssue: number;
    warningLegalTrustIssue: number;
    reviewMissingTrustScore: number;
    allHighFalsePositiveRisk: number;
    allLowConfidence: number;
  };
}

interface AuditReport {
  findings?: ContentAuditFinding[];
}

interface QueueItem {
  priorityRank: number;
  score: number;
  priorityBand: "critical" | "high" | "medium" | "low" | "verify_later";
  confidenceBand: Confidence;
  falsePositiveRiskBand: FalsePositiveRisk;
  sourceTable: SnapshotTableName;
  slug: string;
  title?: string;
  url?: string;
  issueCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  highConfidenceCount: number;
  lowFalsePositiveRiskCount: number;
  highFalsePositiveRiskCount: number;
  needsHumanReview: boolean;
  mainIssues: string[];
  recommendedAction: string;
  whyItMatters: string;
  approvalRequired: boolean;
  suggestedOwnerDecision: string;
  supportingFindings: ContentAuditFinding[];
}

const reportPaths = [
  "data/reports/content_quality_report.json",
  "data/reports/affiliate_placement_report.json",
  "data/reports/content_linking_report.json",
];

const legalTrustIssues = new Set(["unsupported_strong_scam_language", "warning_claim_without_evidence"]);
const affiliateIssues = new Set(["affiliate_on_red_or_warning_page", "affiliate_without_nearby_disclosure", "affiliate_too_close_to_opening", "possible_affiliate_placeholder_not_approved", "repeated_affiliate_ctas"]);
const trustEvidenceIssues = new Set(["unsupported_strong_scam_language", "warning_claim_without_evidence", "missing_external_evidence_links", "warning_without_source_links", "review_missing_trust_score"]);

export async function buildPriorityActionQueue(): Promise<QueueItem[]> {
  const rules = await readJson<PriorityRules>("config/priority_rules.json");
  const findings = await loadFindings();
  const grouped = groupFindings(findings);
  const items = Array.from(grouped.values()).map((group) => buildQueueItem(group, rules));
  const ranked = items
    .sort((a, b) => b.score - a.score || b.highConfidenceCount - a.highConfidenceCount || a.highFalsePositiveRiskCount - b.highFalsePositiveRiskCount)
    .map((item, index) => ({ ...item, priorityRank: index + 1 }));

  await writeJson("data/reports/priority_action_queue.json", {
    generatedAt: new Date().toISOString(),
    disclaimer: "These are possible issues ranked for review, not confirmed defects or automatic edit instructions.",
    itemCount: ranked.length,
    items: ranked,
  });
  await writeText("data/reports/priority_action_queue.md", renderMarkdown(ranked));
  logger.info("Priority action queue written", { items: ranked.length });
  return ranked;
}

async function loadFindings(): Promise<ContentAuditFinding[]> {
  const findings: ContentAuditFinding[] = [];

  for (const path of reportPaths) {
    try {
      const report = await readJson<AuditReport>(path);
      findings.push(...(report.findings ?? []));
    } catch {
      // Missing local generated reports are allowed; owner can run audits first.
    }
  }

  return findings;
}

function groupFindings(findings: ContentAuditFinding[]): Map<string, ContentAuditFinding[]> {
  const grouped = new Map<string, ContentAuditFinding[]>();

  for (const finding of findings) {
    const key = `${finding.sourceTable}:${finding.slug}:${finding.title ?? ""}`;
    const group = grouped.get(key) ?? [];
    group.push(finding);
    grouped.set(key, group);
  }

  return grouped;
}

function buildQueueItem(findings: ContentAuditFinding[], rules: PriorityRules): QueueItem {
  const first = findings[0];
  const score = Math.round(scoreFindings(findings, rules) + scorePageBoosts(findings, rules));
  const mainIssues = topIssues(findings);
  const confidenceBand = dominantConfidence(findings);
  const falsePositiveRiskBand = dominantFalsePositiveRisk(findings);
  const priorityBand = bandFor(score, findings);
  const needsHumanReview = findings.some((finding) => finding.needsHumanReview);

  return {
    priorityRank: 0,
    score,
    priorityBand,
    confidenceBand,
    falsePositiveRiskBand,
    sourceTable: first.sourceTable,
    slug: first.slug,
    title: first.title,
    url: urlFor(first),
    issueCount: findings.length,
    criticalCount: findings.filter((finding) => finding.severity === "critical").length,
    highCount: findings.filter((finding) => finding.severity === "high").length,
    mediumCount: findings.filter((finding) => finding.severity === "medium").length,
    lowCount: findings.filter((finding) => finding.severity === "low").length,
    highConfidenceCount: findings.filter((finding) => finding.confidence === "high").length,
    lowFalsePositiveRiskCount: findings.filter((finding) => finding.falsePositiveRisk === "low").length,
    highFalsePositiveRiskCount: findings.filter((finding) => finding.falsePositiveRisk === "high").length,
    needsHumanReview,
    mainIssues,
    recommendedAction: recommendedAction(findings),
    whyItMatters: whyItMatters(findings),
    approvalRequired: needsHumanReview,
    suggestedOwnerDecision: ownerDecision(priorityBand, falsePositiveRiskBand, confidenceBand),
    supportingFindings: findings,
  };
}

function scoreFindings(findings: ContentAuditFinding[], rules: PriorityRules): number {
  return findings.reduce((total, finding) => {
    const severity = rules.severityPoints[finding.severity] ?? 0;
    const confidence = rules.confidenceMultiplier[finding.confidence] ?? 0.25;
    const penalty = rules.falsePositivePenalty[finding.falsePositiveRisk] ?? 0;
    const boost = rules.issuePriorityBoosts[finding.code] ?? 0;
    return total + severity * confidence + penalty + boost;
  }, 0);
}

function scorePageBoosts(findings: ContentAuditFinding[], rules: PriorityRules): number {
  let score = 0;
  const codes = new Set(findings.map((finding) => finding.code));
  const hasAffiliateIssue = findings.some((finding) => affiliateIssues.has(finding.code));
  const hasTrustEvidenceIssue = findings.some((finding) => trustEvidenceIssues.has(finding.code));

  if (hasAffiliateIssue && hasTrustEvidenceIssue) score += rules.extraPageBoosts.affiliateAndTrustEvidenceIssue;
  if (findings[0].sourceTable === "warnings" && [...codes].some((code) => legalTrustIssues.has(code))) score += rules.extraPageBoosts.warningLegalTrustIssue;
  if (findings[0].sourceTable === "reviews" && codes.has("review_missing_trust_score")) score += rules.extraPageBoosts.reviewMissingTrustScore;
  if (findings.every((finding) => finding.falsePositiveRisk === "high")) score += rules.extraPageBoosts.allHighFalsePositiveRisk;
  if (findings.every((finding) => finding.confidence === "low")) score += rules.extraPageBoosts.allLowConfidence;

  return score;
}

function bandFor(score: number, findings: ContentAuditFinding[]): QueueItem["priorityBand"] {
  const hasHighConfidence = findings.some((finding) => finding.confidence === "high");
  const hasLegalTrustRisk = findings.some((finding) => legalTrustIssues.has(finding.code));
  const highFalsePositiveDominates = findings.filter((finding) => finding.falsePositiveRisk === "high").length > findings.length / 2;

  if (score < 20 || highFalsePositiveDominates) return "verify_later";
  if (score >= 120 && (hasHighConfidence || hasLegalTrustRisk)) return "critical";
  if (score >= 80) return "high";
  if (score >= 45) return "medium";
  if (score >= 20) return "low";
  return "verify_later";
}

function recommendedAction(findings: ContentAuditFinding[]): string {
  const codes = new Set(findings.map((finding) => finding.code));
  const leading = findings.find((finding) => actionForCode(finding.code));
  const action = leading ? actionForCode(leading.code)! : "Review the grouped findings and decide whether any content change is warranted.";
  const hasHighFalsePositiveRisk = findings.some((finding) => finding.falsePositiveRisk === "high");
  const hasLowConfidence = findings.some((finding) => finding.confidence === "low");
  const qualifiers = [];

  if (hasHighFalsePositiveRisk) qualifiers.push("verify rendered page before editing");
  if (hasLowConfidence) qualifiers.push("treat low-confidence items as checks, not fixes");
  if (codes.has("missing_external_evidence_links")) qualifiers.push("check detailed audit/evidence fields before adding links");

  return qualifiers.length > 0 ? `${action} Also ${qualifiers.join("; ")}.` : action;
}

function actionForCode(code: string): string | undefined {
  const actions: Record<string, string> = {
    code_artifact_detected: "Inspect and clean generated code/TypeScript artefacts before further SEO or affiliate work.",
    unsupported_strong_scam_language: "Review wording for legal/evidence risk before publishing, promoting, or internally linking.",
    affiliate_on_red_or_warning_page: "Verify rendered page, then remove or replace direct affiliate CTA; safer alternatives may be acceptable only after approval.",
    affiliate_without_nearby_disclosure: "Verify whether global disclosure exists; if not, add nearby affiliate disclosure or move CTA naturally.",
    affiliate_too_close_to_opening: "Verify rendered placement, then move affiliate CTA lower if it interrupts the opening content.",
    warning_claim_without_evidence: "Add source/evidence links or soften the warning language.",
    repeated_affiliate_ctas: "Reduce repeated CTAs and keep only natural placements.",
    review_missing_trust_score: "Check review record and add/repair trust_score if genuinely missing.",
    missing_internal_links: "Verify rendered page first, then add helpful internal links only where natural.",
    missing_external_evidence_links: "Check detailed audit/evidence fields first, then add official/regulator/company/security links where useful.",
    possible_affiliate_placeholder_not_approved: "Remove unapproved affiliate placeholders or replace with owner-approved language.",
  };
  return actions[code];
}

function whyItMatters(findings: ContentAuditFinding[]): string {
  const codes = new Set(findings.map((finding) => finding.code));
  if ([...codes].some((code) => legalTrustIssues.has(code))) return "Legal, evidence, and user-trust risk can affect reader safety and brand credibility.";
  if ([...codes].some((code) => affiliateIssues.has(code))) return "Affiliate placement affects disclosure quality, trust, and user protection.";
  if (codes.has("code_artifact_detected")) return "Code artifacts can make public content look broken or untrustworthy.";
  if (codes.has("missing_external_evidence_links") || codes.has("warning_without_source_links")) return "Evidence links help readers verify claims and reduce unsupported-risk language.";
  return "This page has possible content quality or discoverability improvements that need review.";
}

function ownerDecision(priorityBand: QueueItem["priorityBand"], falsePositiveRisk: FalsePositiveRisk, confidence: Confidence): string {
  if (priorityBand === "verify_later" || falsePositiveRisk === "high") return "Verify rendered page and structured fields before assigning a fix.";
  if (confidence === "high" && (priorityBand === "critical" || priorityBand === "high")) return "Review first and approve a focused fix if the finding is confirmed.";
  return "Review during normal content QA; do not edit automatically.";
}

function topIssues(findings: ContentAuditFinding[]): string[] {
  return Array.from(new Set(findings.map((finding) => finding.code))).slice(0, 6);
}

function dominantConfidence(findings: ContentAuditFinding[]): Confidence {
  if (findings.some((finding) => finding.confidence === "high")) return "high";
  if (findings.some((finding) => finding.confidence === "medium")) return "medium";
  return "low";
}

function dominantFalsePositiveRisk(findings: ContentAuditFinding[]): FalsePositiveRisk {
  if (findings.some((finding) => finding.falsePositiveRisk === "high")) return "high";
  if (findings.some((finding) => finding.falsePositiveRisk === "medium")) return "medium";
  return "low";
}

function urlFor(finding: ContentAuditFinding): string {
  const prefix: Record<SnapshotTableName, string> = {
    reviews: "/reviews/",
    blog_posts: "/blog/",
    warnings: "/warnings/",
    categories: "/categories/",
  };
  return `https://cryptowatchdog.net${prefix[finding.sourceTable]}${finding.slug}`;
}

function renderMarkdown(items: QueueItem[]): string {
  return `# Priority Action Queue

Generated: ${new Date().toISOString()}

These are ranked possible fixes, not confirmed defects. High false-positive-risk items must be checked against rendered pages before editing. No content should be changed automatically from this queue.

${renderSection("Fix first: high-confidence, low false-positive issues", items.filter((item) => item.confidenceBand === "high" && item.falsePositiveRiskBand === "low"))}
${renderSection("Legal/trust review", items.filter((item) => item.mainIssues.some((issue) => legalTrustIssues.has(issue))))}
${renderSection("Affiliate clean-up", items.filter((item) => item.mainIssues.some((issue) => affiliateIssues.has(issue))))}
${renderSection("Evidence and source checks", items.filter((item) => item.mainIssues.some((issue) => ["missing_external_evidence_links", "warning_without_source_links", "warning_claim_without_evidence"].includes(issue))))}
${renderSection("Internal-link opportunities to verify later", items.filter((item) => item.mainIssues.some((issue) => ["missing_internal_links", "missing_related_content_links"].includes(issue))))}
${renderSection("Low-confidence checks", items.filter((item) => item.confidenceBand === "low" || item.priorityBand === "verify_later"))}
`;
}

function renderSection(title: string, items: QueueItem[]): string {
  const unique = dedupeItems(items).slice(0, 25);
  return `## ${title}\n\n${unique.length > 0 ? unique.map(renderItem).join("\n") : "No items in this section.\n"}`;
}

function renderItem(item: QueueItem): string {
  const snippet = item.supportingFindings.find((finding) => finding.evidenceSnippet)?.evidenceSnippet;
  return `### #${item.priorityRank} ${item.title ?? item.slug}

- Page: ${item.url ?? item.slug}
- Priority: ${item.priorityBand} (score ${item.score})
- Confidence: ${item.confidenceBand}
- False-positive risk: ${item.falsePositiveRiskBand}
- Issue: ${item.mainIssues.join(", ")}
- Why it matters: ${item.whyItMatters}
- Recommended action: ${item.recommendedAction}
- Approval required: ${item.approvalRequired ? "yes" : "no"}
${snippet ? `- Supporting evidence/snippet: ${snippet}\n` : ""}`;
}

function dedupeItems(items: QueueItem[]): QueueItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.sourceTable}:${item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

if (isDirectRun(import.meta.url)) {
  await buildPriorityActionQueue();
}
