import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";

type Department =
  | "Command"
  | "Content"
  | "SEO"
  | "Research"
  | "Affiliates"
  | "Backlinks"
  | "Analytics"
  | "Trust & Safety"
  | "Media"
  | "Social"
  | "Operations"
  | "Approvals";

type QcStatus =
  | "qc_pass_draft_only"
  | "needs_revision"
  | "needs_cross_manager_review"
  | "blocked_pending_evidence"
  | "escalate_to_master_ai"
  | "escalate_to_danny"
  | "monitor_only";

type Severity = "low" | "medium" | "high";
type RiskLevel = "low" | "medium" | "high";
type DetectedStage = "detected" | "suspected" | "recommended";

type IssueType =
  | "evidence_gap"
  | "unsafe_claim"
  | "affiliate_risk"
  | "trust_rating_risk"
  | "legal_policy_risk"
  | "financial_advice_risk"
  | "duplicate_or_cannibalisation"
  | "generic_or_low_value"
  | "prioritisation_issue"
  | "approval_flag_issue"
  | "unsafe_stage_issue"
  | "auto_apply_issue"
  | "raw_affiliate_url"
  | "cross_manager_escalation"
  | "monitor_only";

type ManagerEscalation =
  | "Content AI Manager"
  | "SEO AI Manager"
  | "Research AI Manager"
  | "Affiliates AI Manager"
  | "Trust & Safety AI Manager"
  | "Analytics AI Manager"
  | "Media AI Manager"
  | "Social AI Manager"
  | "Operations AI Manager"
  | "Approvals AI Manager"
  | "Master AI Manager"
  | "Danny"
  | "none";

interface SourceReport {
  name: string;
  path: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

interface SourceItem {
  sourceItemId: string;
  sourceReport: string;
  sourceTitle: string;
  department: Department;
  record: unknown;
  text: string;
}

interface QcFinding {
  id: string;
  sourceItemId: string;
  sourceReport: string;
  sourceTitle: string;
  department: Department;
  qcStatus: QcStatus;
  severity: Severity;
  riskLevel: RiskLevel;
  issueType: IssueType;
  detectedStage: DetectedStage;
  needsHumanReview: true;
  needsDannyApproval: boolean;
  canAutoApply: false;
  recommendedManagerEscalation: ManagerEscalation;
  secondaryManagerEscalation?: ManagerEscalation;
  recommendedAction: string;
  rationale: string;
  safetyNotes: string[];
}

const qcVersion = "1.0.0";
const outputJson = "data/reports/quality_control_report.json";
const outputMd = "data/reports/quality_control_report.md";
const maxFindingsTotal = 100;

const sourceReports: SourceReport[] = [
  { name: "fix_draft_suggestions", path: "data/reports/fix_draft_suggestions.json" },
  { name: "preview_diff_report", path: "data/reports/preview_diff_report.json" },
  { name: "approval_queue_report", path: "data/reports/approval_queue_report.json" },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
  { name: "master_daily_brief", path: "data/reports/master_daily_brief.json" },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json" },
  { name: "research_duplicate_guard_report", path: "data/reports/research_duplicate_guard_report.json" },
  { name: "seo_intelligence_queue", path: "data/reports/seo_intelligence_queue.json" },
  { name: "affiliate_placement_suggestions", path: "data/reports/affiliate_placement_suggestions.json" },
  { name: "offer_tracker_report", path: "data/reports/offer_tracker_report.json" },
];

const statusOrder: QcStatus[] = [
  "escalate_to_master_ai",
  "blocked_pending_evidence",
  "needs_cross_manager_review",
  "escalate_to_danny",
  "needs_revision",
  "qc_pass_draft_only",
  "monitor_only",
];

const issueTypes: IssueType[] = [
  "evidence_gap",
  "unsafe_claim",
  "affiliate_risk",
  "trust_rating_risk",
  "legal_policy_risk",
  "financial_advice_risk",
  "duplicate_or_cannibalisation",
  "generic_or_low_value",
  "prioritisation_issue",
  "approval_flag_issue",
  "unsafe_stage_issue",
  "auto_apply_issue",
  "raw_affiliate_url",
  "cross_manager_escalation",
  "monitor_only",
];

const managerEscalations: ManagerEscalation[] = [
  "Content AI Manager",
  "SEO AI Manager",
  "Research AI Manager",
  "Affiliates AI Manager",
  "Trust & Safety AI Manager",
  "Analytics AI Manager",
  "Media AI Manager",
  "Social AI Manager",
  "Operations AI Manager",
  "Approvals AI Manager",
  "Master AI Manager",
  "Danny",
  "none",
];

const safetyNotes = [
  "Quality Control Manager v1 is read-only and report-only.",
  "It reviews local worker-agent and manager reports before escalation, but it does not approve, apply, edit, publish, create patch files, create update payloads, call APIs, or write to Supabase.",
  "Every finding keeps needsHumanReview true and canAutoApply false.",
  "approvedCount and appliedCount are always 0.",
  "Raw affiliate URLs, unsafe status stages, and canAutoApply mistakes are treated as high-severity QC failures.",
  "Scam/fraud, trust/rating, legal/policy, financial advice, affiliate, duplicate, and evidence-sensitive items stay behind human review.",
];

export async function buildQualityControlManager(): Promise<QcFinding[]> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const reportMap = new Map(loadedReports.map((report) => [report.source.name, report.data]));
  const sourceItems = collectSourceItems(reportMap);
  const findings = balanceFindings(sourceItems.map(classifyItem), maxFindingsTotal);

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Quality Control Manager v1 for Watchdog HQ. This local report checks whether worker-agent and manager outputs are safe, useful, evidence-based, on-brand, non-duplicative, and properly escalated. It does not approve, apply, edit, publish, write to Supabase, call APIs, create patch files, create update payloads, expose secrets, change trust ratings, finalise legal/policy wording, or make scam/fraud accusations.",
    qcVersion,
    sourceReportsRead,
    missingReports,
    summaryCounts: {
      findingCount: findings.length,
      sourceItemCount: sourceItems.length,
      maxFindingsTotal,
    },
    qcStatusCounts: countBy(findings, (finding) => finding.qcStatus, statusOrder),
    severityCounts: countBy(findings, (finding) => finding.severity, ["low", "medium", "high"]),
    riskCounts: countBy(findings, (finding) => finding.riskLevel, ["low", "medium", "high"]),
    issueTypeCounts: countBy(findings, (finding) => finding.issueType, issueTypes),
    managerEscalationCounts: countBy(findings, (finding) => finding.recommendedManagerEscalation, managerEscalations),
    safetyCounts: {
      needsHumanReviewCount: findings.length,
      canAutoApply: false,
      canAutoApplyCount: countCanAutoApply(reportMap),
      approvedCount: 0,
      appliedCount: 0,
      sourceApprovedCount: sourceApprovalCount(reportMap),
      sourceAppliedCount: sourceAppliedCount(reportMap),
      rawAffiliateUrlFindings: findings.filter((finding) => finding.issueType === "raw_affiliate_url").length,
      unsafeStageFindings: findings.filter((finding) => finding.issueType === "unsafe_stage_issue").length,
    },
    findings,
    managerEscalationSummary: buildManagerEscalationSummary(findings),
    safetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Quality control report written", {
    findings: findings.length,
    sourceReportsRead: sourceReportsRead.length,
    missingReports: missingReports.length,
    outputJson,
    outputMd,
  });
  return findings;
}

async function loadReports(): Promise<{ loadedReports: LoadedReport[]; sourceReportsRead: string[]; missingReports: string[] }> {
  const loadedReports: LoadedReport[] = [];
  const sourceReportsRead: string[] = [];
  const missingReports: string[] = [];
  for (const source of sourceReports) {
    try {
      const data = await readJson<unknown>(source.path);
      loadedReports.push({ source, data });
      sourceReportsRead.push(source.name);
    } catch {
      missingReports.push(source.name);
    }
  }
  return { loadedReports, sourceReportsRead, missingReports };
}

function collectSourceItems(reportMap: Map<string, unknown>): SourceItem[] {
  const items: SourceItem[] = [];
  for (const source of sourceReports) {
    const report = reportMap.get(source.name);
    for (const record of recordsForReport(source.name, report)) {
      const sourceItem = itemFromRecord(source.name, record);
      if (sourceItem) items.push(sourceItem);
    }
  }
  return dedupeSourceItems(items);
}

function recordsForReport(reportName: string, report: unknown): unknown[] {
  switch (reportName) {
    case "fix_draft_suggestions":
      return listItems(report, "drafts");
    case "preview_diff_report":
      return listItems(report, "previews");
    case "approval_queue_report":
      return ["readyForReview", "needsDannyApproval", "blockedPendingEvidence", "safeToDraftOnly", "rejectOrDefer", "monitorOnly"].flatMap((key) => listItems(report, key));
    case "master_command_queue":
      return ["safeDraftsReady", "needsDannyApproval", "blockedRiskyItems", "monitorOnly", "performanceChanges", "moneyOpportunities", "topPriorities"].flatMap((key) => listItems(report, key));
    case "master_daily_brief":
      return listItems(report, "topThreePriorities")
        .concat(listItems(report, "managerBriefs"))
        .concat(listItems(report, "blockedUntilDannyDecides"));
    case "research_duplicate_guard_report":
      return listItems(report, "items");
    case "seo_intelligence_queue":
      return listItems(report, "actionQueue")
        .concat(listItems(report, "blockedItems"))
        .concat(listItems(report, "monitorItems"));
    case "affiliate_placement_suggestions":
      return listItems(report, "recommendations")
        .concat(listItems(report, "blockedPlacements"))
        .concat(listItems(report, "items"));
    case "offer_tracker_report":
      return listItems(report, "items").concat(listItems(report, "offers"));
    default:
      return [];
  }
}

function itemFromRecord(sourceReport: string, record: unknown): SourceItem | undefined {
  const sourceTitle = firstString(record, ["title", "sourceTitle", "pageTitle", "brandName", "sourcePage", "idea", "department"]) ?? `${sourceReport} item`;
  const sourceItemId = firstString(record, ["id", "sourceItemId", "sourceDraftId", "sourcePreviewId", "sourceQueueItemId", "url", "relatedUrl", "relatedPath"]) ?? idFor(sourceReport, sourceTitle);
  return {
    sourceItemId,
    sourceReport,
    sourceTitle,
    department: departmentFor(record, sourceReport),
    record,
    text: textForRecord(record),
  };
}

function classifyItem(item: SourceItem): QcFinding {
  const text = item.text.toLowerCase();
  const riskLevel = riskAt(item.record, "riskLevel", riskFromText(text));
  const detectedStage = safeStage(stringAt(item.record, "statusStage") ?? stringAt(item.record, "detectedStage"));
  const hasEvidence = hasEvidenceSignal(text);
  const needsDannyApproval = booleanAt(item.record, "needsDannyApproval") || riskLevel === "high" || isSensitiveText(text);

  if (booleanAt(item.record, "canAutoApply")) {
    return finding(item, "escalate_to_master_ai", "high", "high", "auto_apply_issue", detectedStage, true, "Master AI Manager", "Set canAutoApply to false before any downstream use.", "QC detected canAutoApply true. V1 agents and managers must never auto-apply changes.");
  }

  if (hasUnsafeStage(item.record)) {
    return finding(item, "escalate_to_master_ai", "high", "high", "unsafe_stage_issue", "detected", true, "Master AI Manager", "Remove approved/applied stage language and keep the item in detected, suspected, or recommended.", "QC detected an approved/applied status stage in a planning report.");
  }

  if (hasRawAffiliateUrl(item.record)) {
    return finding(item, "needs_cross_manager_review", "high", "high", "raw_affiliate_url", detectedStage, true, "Affiliates AI Manager", "Remove raw affiliate URL exposure and re-check the item with Trust & Safety before any review escalation.", "QC detected a URL-shaped affiliate/referral/tracking signal in generated text.", "Trust & Safety AI Manager");
  }

  if (isMonitorOnly(item.record, text)) {
    return finding(item, "monitor_only", "low", riskLevel, "monitor_only", detectedStage, false, "none", "Keep this as monitor-only; do not send it to Danny unless the signal changes.", "QC found this item is explicitly monitor-only.");
  }

  if (hasAffiliateWarningRisk(text, riskLevel)) {
    return finding(item, "needs_cross_manager_review", "high", "high", "affiliate_risk", detectedStage, true, "Affiliates AI Manager", "Send to Affiliates and Trust & Safety managers before Danny sees it.", "Affiliate or money wording appears near warning, red, blocked, or high-risk context.", "Trust & Safety AI Manager");
  }

  if (hasUnsafeClaimRisk(text, hasEvidence)) {
    return finding(item, "blocked_pending_evidence", "high", "high", "unsafe_claim", detectedStage, true, "Trust & Safety AI Manager", "Block pending evidence review; frame any next step as research, not an accusation.", "Scam/fraud or claim-sensitive wording appears without enough evidence language.");
  }

  if (hasTrustRisk(text)) {
    return finding(item, "blocked_pending_evidence", "high", "high", "trust_rating_risk", detectedStage, true, "Trust & Safety AI Manager", "Block pending human evidence review before any trust/rating wording moves forward.", "Trust or rating-sensitive wording requires explicit human review.");
  }

  if (hasLegalPolicyRisk(text)) {
    return finding(item, "blocked_pending_evidence", "high", "high", "legal_policy_risk", detectedStage, true, "Approvals AI Manager", "Keep as review-only and route to Approvals before Danny sees final wording.", "Legal or policy-sensitive wording must not be finalised by QC.");
  }

  if (hasFinancialAdviceRisk(text)) {
    return finding(item, "blocked_pending_evidence", "high", "high", "financial_advice_risk", detectedStage, true, "Trust & Safety AI Manager", "Rewrite as general education or evidence review; do not frame as financial advice.", "QC detected possible financial advice language.");
  }

  if (hasDuplicateRisk(item.record, text)) {
    return finding(item, "needs_cross_manager_review", "medium", "medium", "duplicate_or_cannibalisation", detectedStage, true, "SEO AI Manager", "Route sideways to SEO and Research managers before Danny decides whether to draft or update an existing page.", "Duplicate, cannibalisation, or update-existing-page signals need manager-to-manager review.", "Research AI Manager");
  }

  if (hasApprovalFlagIssue(item.record, text, needsDannyApproval)) {
    return finding(item, "needs_revision", "medium", riskLevel, "approval_flag_issue", detectedStage, true, "Approvals AI Manager", "Fix approval flags before this item is escalated.", "QC found a sensitive item that is missing a Danny approval flag or human review signal.");
  }

  if (hasPrioritisationIssue(item, text)) {
    return finding(item, "needs_revision", "medium", riskLevel, "prioritisation_issue", detectedStage, needsDannyApproval, "Master AI Manager", "Re-rank or de-duplicate before including this in a command queue or daily brief.", "QC found likely poor prioritisation or repeated blocked/money items.");
  }

  if (isGenericOrLowValue(text)) {
    return finding(item, "needs_revision", "medium", riskLevel, "generic_or_low_value", detectedStage, needsDannyApproval, managerForGeneric(item.department), "Tighten the draft with a more specific page/entity rationale before escalation.", "QC found generic or low-usefulness wording.");
  }

  if (needsDannyApproval) {
    return finding(item, "escalate_to_danny", "medium", riskLevel, "cross_manager_escalation", detectedStage, true, "Danny", "Escalate only after the relevant department manager has summarised the risk and next decision.", "QC found this item is important enough for Danny but should remain planning-only.");
  }

  return finding(item, "qc_pass_draft_only", "low", riskLevel, "cross_manager_escalation", detectedStage, false, "none", "This can stay as draft-only review work; do not apply or publish.", "QC found no hard safety issue in the available local report text.");
}

function finding(
  item: SourceItem,
  qcStatus: QcStatus,
  severity: Severity,
  riskLevel: RiskLevel,
  issueType: IssueType,
  detectedStage: DetectedStage,
  needsDannyApproval: boolean,
  recommendedManagerEscalation: ManagerEscalation,
  recommendedAction: string,
  rationale: string,
  secondaryManagerEscalation?: ManagerEscalation,
): QcFinding {
  return {
    id: idFor("qc", item.sourceReport, item.sourceItemId, issueType),
    sourceItemId: item.sourceItemId,
    sourceReport: item.sourceReport,
    sourceTitle: cleanText(item.sourceTitle).slice(0, 180),
    department: item.department,
    qcStatus,
    severity,
    riskLevel,
    issueType,
    detectedStage,
    needsHumanReview: true,
    needsDannyApproval,
    canAutoApply: false,
    recommendedManagerEscalation,
    secondaryManagerEscalation,
    recommendedAction,
    rationale,
    safetyNotes: safetyNotes.slice(0, 4),
  };
}

function balanceFindings(findings: QcFinding[], maxTotal: number): QcFinding[] {
  const unique = dedupeFindings(findings);
  const caps: Record<QcStatus, number> = {
    escalate_to_master_ai: 15,
    blocked_pending_evidence: 20,
    needs_cross_manager_review: 20,
    escalate_to_danny: 15,
    needs_revision: 20,
    qc_pass_draft_only: 15,
    monitor_only: 10,
  };
  const selected: QcFinding[] = [];
  for (const status of statusOrder) {
    selected.push(...unique.filter((finding) => finding.qcStatus === status).slice(0, caps[status]));
  }
  return selected.slice(0, maxTotal);
}

function buildManagerEscalationSummary(findings: QcFinding[]): Array<{ manager: ManagerEscalation; count: number; summary: string }> {
  const counts = countBy(findings, (finding) => finding.recommendedManagerEscalation, managerEscalations);
  return managerEscalations
    .filter((manager) => counts[manager] > 0)
    .map((manager) => ({
      manager,
      count: counts[manager],
      summary: manager === "none"
        ? "No manager escalation needed; keep as local draft-only review."
        : `${counts[manager]} QC finding(s) should be reviewed by ${manager} before escalation.`,
    }));
}

function renderMarkdown(report: {
  generatedAt: string;
  qcVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  summaryCounts: Record<string, number>;
  qcStatusCounts: Record<QcStatus, number>;
  severityCounts: Record<Severity, number>;
  safetyCounts: Record<string, unknown>;
  findings: QcFinding[];
  managerEscalationSummary: Array<{ manager: ManagerEscalation; count: number; summary: string }>;
  safetyNotes: string[];
}): string {
  return [
    "# Quality Control Manager v1",
    "",
    "## Quality Control Manager Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `QC version: ${report.qcVersion}`,
    `Reports read: ${report.sourceReportsRead.length}`,
    `Missing reports: ${report.missingReports.length}`,
    `Findings: ${report.summaryCounts.findingCount}`,
    `High severity: ${report.severityCounts.high}`,
    `canAutoApply count: ${report.safetyCounts.canAutoApplyCount}`,
    `approvedCount: ${report.safetyCounts.approvedCount}`,
    `appliedCount: ${report.safetyCounts.appliedCount}`,
    "",
    "## QC Findings",
    "",
    renderFindings(report.findings.slice(0, 25)),
    "",
    "## Pass Draft-Only",
    "",
    renderFindings(section(report.findings, "qc_pass_draft_only")),
    "",
    "## Needs Revision",
    "",
    renderFindings(section(report.findings, "needs_revision")),
    "",
    "## Cross-Manager Reviews",
    "",
    renderFindings(section(report.findings, "needs_cross_manager_review")),
    "",
    "## Blocked Pending Evidence",
    "",
    renderFindings(section(report.findings, "blocked_pending_evidence")),
    "",
    "## Escalate to Master AI",
    "",
    renderFindings(section(report.findings, "escalate_to_master_ai")),
    "",
    "## Escalate to Danny",
    "",
    renderFindings(section(report.findings, "escalate_to_danny")),
    "",
    "## Monitor Only",
    "",
    renderFindings(section(report.findings, "monitor_only")),
    "",
    "## Manager Escalation Summary",
    "",
    report.managerEscalationSummary.length
      ? report.managerEscalationSummary.map((item) => `- ${item.manager}: ${item.count}. ${item.summary}`).join("\n")
      : "No manager escalations were generated.",
    "",
    "## Safety Notes",
    "",
    report.safetyNotes.map((note) => `- ${note}`).join("\n"),
    "",
    "## Missing Reports",
    "",
    report.missingReports.length ? report.missingReports.map((name) => `- ${name}`).join("\n") : "No configured reports were missing.",
    "",
    "## Next Steps",
    "",
    "- Department managers should revise or summarise their own findings before sending anything to the Master AI Manager.",
    "- Cross-manager review should happen before Danny sees unclear, duplicated, monetised, or sensitive items.",
    "- Keep all QC output local and planning-only.",
    "- Do not publish, apply, create patches, create update payloads, or write to Supabase.",
  ].join("\n");
}

function renderFindings(findings: QcFinding[]): string {
  if (findings.length === 0) return "No findings in this section from the available local reports.";
  return findings.map((finding) => [
    `- ${finding.sourceTitle}`,
    `  - Status: ${finding.qcStatus}`,
    `  - Issue: ${finding.issueType}`,
    `  - Severity/risk: ${finding.severity} / ${finding.riskLevel}`,
    `  - Escalation: ${finding.recommendedManagerEscalation}${finding.secondaryManagerEscalation ? ` + ${finding.secondaryManagerEscalation}` : ""}`,
    `  - Action: ${finding.recommendedAction}`,
  ].join("\n")).join("\n");
}

function section(findings: QcFinding[], qcStatus: QcStatus): QcFinding[] {
  return findings.filter((finding) => finding.qcStatus === qcStatus).slice(0, 15);
}

function hasRawAffiliateUrl(record: unknown): boolean {
  const raw = JSON.stringify(record ?? {});
  return /"affiliateUrl"\s*:/.test(raw)
    || /https?:\/\/[^\s"<>]*(affiliate|aff|ref=|referral|utm_|partner|click|track)[^\s"<>]*/i.test(raw);
}

function hasUnsafeStage(record: unknown): boolean {
  const stage = `${stringAt(record, "statusStage") ?? ""} ${stringAt(record, "detectedStage") ?? ""} ${stringAt(record, "stage") ?? ""}`.toLowerCase();
  return stage.includes("approved") || stage.includes("applied");
}

function hasAffiliateWarningRisk(text: string, riskLevel: RiskLevel): boolean {
  return /affiliate|cta|commission|offer|money|conversion/.test(text)
    && (riskLevel === "high" || /warning|red[_ -]?rating|red rating|blocked|high-risk|high risk|scam|fraud/.test(text));
}

function hasUnsafeClaimRisk(text: string, hasEvidence: boolean): boolean {
  return /scam|fraud|stole|stolen|criminal|guarantee|guaranteed|recover funds|recover crypto/.test(text) && !hasEvidence;
}

function hasTrustRisk(text: string): boolean {
  return /trust rating|rating change|red rating|green rating|orange rating|safe rating|unsafe rating/.test(text);
}

function hasLegalPolicyRisk(text: string): boolean {
  return /legal|policy|privacy|terms|disclosure|compliance|regulated|regulator|lawsuit/.test(text);
}

function hasFinancialAdviceRisk(text: string): boolean {
  return /financial advice|investment advice|you should buy|you should sell|guaranteed returns|risk-free|risk free/.test(text);
}

function hasDuplicateRisk(record: unknown, text: string): boolean {
  const classification = `${stringAt(record, "classification") ?? ""} ${arrayStrings(record, "classifications").join(" ")}`.toLowerCase();
  return /duplicate|cannibal|same_search_intent|update_existing_page_instead|near_duplicate/.test(`${classification} ${text}`);
}

function hasApprovalFlagIssue(record: unknown, text: string, needsDannyApproval: boolean): boolean {
  const needsHumanReview = booleanAt(record, "needsHumanReview") || booleanAt(record, "needs_human_review");
  return (isSensitiveText(text) && !needsDannyApproval) || !needsHumanReview;
}

function hasPrioritisationIssue(item: SourceItem, text: string): boolean {
  return item.sourceReport === "master_daily_brief" && /blocked affiliate|blocked risk control|money opportunity/.test(text);
}

function isGenericOrLowValue(text: string): boolean {
  return /related cryptowatchdog guidance|plain-english guidance|placeholder|example exchange|current snapshot body excerpt|not available in the local snapshot/.test(text);
}

function isMonitorOnly(record: unknown, text: string): boolean {
  return stringAt(record, "section") === "monitorOnly" || stringAt(record, "qcStatus") === "monitor_only" || /monitor only/.test(text);
}

function isSensitiveText(text: string): boolean {
  return /affiliate|scam|fraud|trust|rating|legal|policy|financial advice|warning|red rating|high-risk|high risk|blocked/.test(text);
}

function hasEvidenceSignal(text: string): boolean {
  return /evidence|source|verified|rendered|snapshot|local report|base url|detected|research/.test(text);
}

function managerForGeneric(department: Department): ManagerEscalation {
  if (department === "SEO") return "SEO AI Manager";
  if (department === "Content") return "Content AI Manager";
  if (department === "Media") return "Media AI Manager";
  return "Master AI Manager";
}

function riskFromText(text: string): RiskLevel {
  if (/high-risk|high risk|blocked|red rating|scam|fraud|legal|financial advice|trust rating/.test(text)) return "high";
  if (/affiliate|approval|warning|duplicate|cannibal|generic|low value|evidence/.test(text)) return "medium";
  return "low";
}

function departmentFor(record: unknown, sourceReport: string): Department {
  const direct = stringAt(record, "department");
  if (isDepartment(direct)) return direct;
  if (sourceReport.includes("affiliate") || sourceReport.includes("offer")) return "Affiliates";
  if (sourceReport.includes("seo")) return "SEO";
  if (sourceReport.includes("research")) return "Research";
  if (sourceReport.includes("daily") || sourceReport.includes("master")) return "Command";
  if (sourceReport.includes("approval")) return "Approvals";
  if (sourceReport.includes("preview") || sourceReport.includes("fix")) return "Content";
  return "Operations";
}

function safeStage(value?: string): DetectedStage {
  return value === "suspected" || value === "recommended" ? value : "detected";
}

function textForRecord(record: unknown): string {
  return JSON.stringify(sanitiseForText(record));
}

function sanitiseForText(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitiseForText);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (/affiliateUrl/i.test(key)) return [key, "[raw affiliate url hidden]"];
    if (typeof entry === "string" && /https?:\/\/[^\s"<>]*(affiliate|aff|ref=|referral|utm_|partner|click|track)[^\s"<>]*/i.test(entry)) {
      return [key, "[raw affiliate url hidden]"];
    }
    return [key, sanitiseForText(entry)];
  }));
}

function firstString(record: unknown, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = stringAt(record, key);
    if (value) return value;
  }
  return undefined;
}

function arrayStrings(record: unknown, key: string): string[] {
  const value = valueAt(record, [key]);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function listItems(record: unknown, key: string): unknown[] {
  const value = valueAt(record, [key]);
  return Array.isArray(value) ? value : [];
}

function stringAt(record: unknown, ...path: (string | number)[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function booleanAt(record: unknown, ...path: (string | number)[]): boolean {
  const value = valueAt(record, path);
  return typeof value === "boolean" ? value : false;
}

function riskAt(record: unknown, key: string, fallback: RiskLevel): RiskLevel {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function valueAt(record: unknown, path: (string | number)[]): unknown {
  let current = record;
  for (const key of path) {
    if (typeof key === "number") {
      if (!Array.isArray(current)) return undefined;
      current = current[key];
      continue;
    }
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function countCanAutoApply(reportMap: Map<string, unknown>): number {
  return [...reportMap.values()].reduce<number>((count, report) => count + JSON.stringify(report ?? {}).split('"canAutoApply":true').length - 1, 0);
}

function sourceApprovalCount(reportMap: Map<string, unknown>): number {
  return [...reportMap.values()].reduce<number>((count, report) => count + numberAt(report, "approvalCounts", "approvedCount") + numberAt(report, "stageCounts", "approved"), 0);
}

function sourceAppliedCount(reportMap: Map<string, unknown>): number {
  return [...reportMap.values()].reduce<number>((count, report) => count + numberAt(report, "approvalCounts", "appliedCount") + numberAt(report, "stageCounts", "applied"), 0);
}

function numberAt(record: unknown, ...path: (string | number)[]): number {
  const value = valueAt(record, path);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function countBy<T, K extends string>(items: T[], getKey: (item: T) => K, keys: K[]): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
  for (const item of items) counts[getKey(item)] += 1;
  return counts;
}

function dedupeSourceItems(items: SourceItem[]): SourceItem[] {
  const seen = new Set<string>();
  const output: SourceItem[] = [];
  for (const item of items) {
    const key = `${item.sourceReport}:${item.sourceItemId}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }
  return output;
}

function dedupeFindings(findings: QcFinding[]): QcFinding[] {
  const seen = new Set<string>();
  const output: QcFinding[] = [];
  for (const finding of findings) {
    const key = `${finding.sourceReport}:${finding.sourceItemId}:${finding.issueType}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(finding);
    }
  }
  return output;
}

function idFor(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 180);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isDepartment(value: string | undefined): value is Department {
  return value === "Command"
    || value === "Content"
    || value === "SEO"
    || value === "Research"
    || value === "Affiliates"
    || value === "Backlinks"
    || value === "Analytics"
    || value === "Trust & Safety"
    || value === "Media"
    || value === "Social"
    || value === "Operations"
    || value === "Approvals";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  buildQualityControlManager().catch((error) => {
    logger.error("Quality control manager failed", { error });
    process.exitCode = 1;
  });
}
