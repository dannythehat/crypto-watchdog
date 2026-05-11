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

type ManagerStatus = "quiet" | "active" | "needs_review" | "blocked";
type RiskLevel = "low" | "medium" | "high";

interface SourceReport {
  name: string;
  path: string;
}

interface BriefItem {
  title: string;
  whyItMatters: string;
  recommendedNextStep: string;
  riskLevel: RiskLevel;
  needsDannyApproval: boolean;
}

interface ManagerBrief {
  department: Department;
  status: ManagerStatus;
  summary: string;
  itemCount: number;
  recommendedFocus: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

const briefVersion = "1.0.0";
const outputJson = "data/reports/master_daily_brief.json";
const outputMd = "data/reports/master_daily_brief.md";

const sourceReports: SourceReport[] = [
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
  { name: "approval_queue_report", path: "data/reports/approval_queue_report.json" },
  { name: "preview_diff_report", path: "data/reports/preview_diff_report.json" },
  { name: "fix_draft_suggestions", path: "data/reports/fix_draft_suggestions.json" },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json" },
  { name: "seo_intelligence_queue", path: "data/reports/seo_intelligence_queue.json" },
  { name: "research_duplicate_guard_report", path: "data/reports/research_duplicate_guard_report.json" },
  { name: "offer_tracker_report", path: "data/reports/offer_tracker_report.json" },
  { name: "search_console_report", path: "data/reports/search_console_report.json" },
  { name: "ga4_report", path: "data/reports/ga4_report.json" },
];

const departments: Department[] = [
  "Command",
  "Content",
  "SEO",
  "Research",
  "Affiliates",
  "Backlinks",
  "Analytics",
  "Trust & Safety",
  "Media",
  "Social",
  "Operations",
  "Approvals",
];

const safetyNotes = [
  "This daily brief is read-only and report-only.",
  "It does not approve, apply, publish, edit files, create patch files, create update payloads, write to Supabase, call APIs, expose secrets, change trust ratings, finalise legal/policy wording, or make scam/fraud accusations.",
  "Use this as planning context only; every downstream action still needs human review.",
  "Affiliate, trust/rating, scam/fraud, legal/policy, high-risk, and blocked items stay behind Danny review.",
  "canAutoApply is false, approvedCount is 0, and appliedCount is 0.",
];

export async function buildMasterDailyBrief(): Promise<unknown> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const reports = new Map(loadedReports.map((report) => [report.source.name, report.data]));
  const masterQueue = reports.get("master_command_queue");
  const approvalQueue = reports.get("approval_queue_report");
  const seoQueue = reports.get("seo_intelligence_queue");
  const offers = reports.get("offer_tracker_report");
  const gsc = reports.get("search_console_report");
  const ga4 = reports.get("ga4_report");
  const research = reports.get("research_duplicate_guard_report");

  const todayCommandQueue = {
    safeDraftsReady: countArray(masterQueue, "safeDraftsReady"),
    needsDannyApproval: countArray(masterQueue, "needsDannyApproval"),
    blockedRiskyItems: countArray(masterQueue, "blockedRiskyItems"),
    monitorOnly: countArray(masterQueue, "monitorOnly"),
    performanceChanges: countArray(masterQueue, "performanceChanges"),
    moneyOpportunities: countArray(masterQueue, "moneyOpportunities"),
    plainEnglishSummary: commandQueueSummary(masterQueue),
  };

  const approvalSnapshot = {
    readyForReview: countArray(approvalQueue, "readyForReview"),
    needsDannyApproval: countArray(approvalQueue, "needsDannyApproval"),
    blockedPendingEvidence: countArray(approvalQueue, "blockedPendingEvidence"),
    safeToDraftOnly: countArray(approvalQueue, "safeToDraftOnly"),
    rejectOrDefer: countArray(approvalQueue, "rejectOrDefer"),
    monitorOnly: countArray(approvalQueue, "monitorOnly"),
    plainEnglishSummary: approvalSummary(approvalQueue),
  };

  const blockedItems = listItems(approvalQueue, "blockedPendingEvidence").concat(listItems(masterQueue, "blockedRiskyItems"));
  const highRiskItems = allKnownItems(masterQueue, approvalQueue).filter((item) => stringAt(item, "riskLevel") === "high");
  const topThreePriorities = buildTopThreePriorities(masterQueue, approvalQueue);
  const managerBriefs = departments.map((department) => managerBrief(department, masterQueue, approvalQueue));

  const riskSnapshot = {
    highRiskItemCount: highRiskItems.length,
    blockedItemCount: blockedItems.length,
    evidenceGapCount: evidenceGapCount(approvalQueue, seoQueue, research),
    sensitivityCount: sensitivityCount(masterQueue, approvalQueue),
    reasonToSlowDown: reasonToSlowDown(highRiskItems.length, blockedItems.length, approvalSnapshot.needsDannyApproval),
    summary: riskSummary(highRiskItems.length, blockedItems.length, approvalSnapshot.needsDannyApproval),
  };

  const opportunitySnapshot = {
    seoOpportunities: opportunityCount(seoQueue, ["metadata_improvement", "internal_link_support", "ctr_improvement", "page_2_opportunity"]),
    contentRefreshOpportunities: opportunityCount(seoQueue, ["content_refresh"]) + recommendationCount(gsc, "content_refresh") + recommendationCount(ga4, "content_refresh"),
    internalLinkOpportunities: opportunityCount(seoQueue, ["internal_link_support"]),
    affiliateMoneyOpportunities: todayCommandQueue.moneyOpportunities + offerNeedsReviewCount(offers),
    analyticsPerformanceOpportunities: recommendationCount(gsc) + recommendationCount(ga4),
    summary: opportunitySummary(seoQueue, gsc, ga4, offers),
  };

  const whatDannyShouldDoToday = buildDannyActions(topThreePriorities, approvalSnapshot, riskSnapshot).slice(0, 5);
  const whatAgentsShouldDoNext = buildAgentActions(masterQueue, approvalQueue, opportunitySnapshot).slice(0, 5);
  const blockedUntilDannyDecides = blockedItems.slice(0, 10).map((item) => ({
    title: stringAt(item, "title") ?? "Blocked item",
    reason: stringAt(item, "blockedReason") ?? stringAt(item, "evidenceSummary") ?? "Blocked pending evidence, safety, or Danny review.",
    riskLevel: riskAt(item, "riskLevel", "high"),
    needsDannyApproval: true,
  }));

  const safetyCounts = {
    canAutoApply: false,
    canAutoApplyCount: countCanAutoApply(masterQueue, approvalQueue, reports.get("preview_diff_report"), reports.get("fix_draft_suggestions")),
    approvedCount: 0,
    appliedCount: 0,
    sourceApprovedCount: sourceApprovalCount(masterQueue, approvalQueue),
    sourceAppliedCount: sourceAppliedCount(masterQueue, approvalQueue),
  };

  const executiveSummary = buildExecutiveSummary(todayCommandQueue, approvalSnapshot, riskSnapshot, opportunitySnapshot, missingReports);

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Master AI Manager Daily Brief v1 for Danny. This local report summarises planning signals only. It does not approve, apply, publish, edit files, write to Supabase, call APIs, create patch files, create update payloads, expose secrets, change trust ratings, finalise legal/policy wording, or make scam/fraud accusations.",
    briefVersion,
    sourceReportsRead,
    missingReports,
    executiveSummary,
    todayCommandQueue,
    topThreePriorities,
    managerBriefs,
    approvalSnapshot,
    riskSnapshot,
    opportunitySnapshot,
    whatDannyShouldDoToday,
    whatAgentsShouldDoNext,
    blockedUntilDannyDecides,
    safetyCounts,
    safetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Master daily brief written", { sourceReportsRead: sourceReportsRead.length, missingReports: missingReports.length, outputJson, outputMd });
  return report;
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

function buildExecutiveSummary(command: Record<string, unknown>, approval: Record<string, unknown>, risk: Record<string, unknown>, opportunity: Record<string, unknown>, missingReports: string[]): string {
  const sentences = [
    `Today looks like a review-heavy day, with ${command.safeDraftsReady} safe draft item(s), ${approval.needsDannyApproval} approval item(s), and ${approval.blockedPendingEvidence} blocked evidence item(s) detected in the local reports.`,
    `The main theme is caution: there are ${risk.highRiskItemCount} high-risk signal(s), ${risk.blockedItemCount} blocked item(s), and ${risk.sensitivityCount} sensitive item(s) that should not move forward without Danny review.`,
    `There are useful draft opportunities, especially around SEO, internal links, media metadata, and page refresh work, but these should stay in draft review until evidence is checked.`,
    `Money-related opportunities are present, but affiliate wording should remain approval-only and should not include raw affiliate URLs or go near warning/high-risk pages without manual review.`,
    `Performance and analytics signals are only as strong as the local exports available, so treat them as prompts for review rather than proof of a problem.`,
    missingReports.length > 0 ? `Some reports are missing today (${missingReports.join(", ")}), so this brief is intentionally conservative.` : "All configured daily brief inputs were available locally.",
    "Nothing in this brief is approved, applied, published, or ready for live-site changes.",
  ];
  if (Number(opportunity.analyticsPerformanceOpportunities) > 0) {
    sentences.splice(4, 0, `${opportunity.analyticsPerformanceOpportunities} analytics or search performance signal(s) are available for review, with no live Google write involved.`);
  }
  return sentences.slice(0, 8).join(" ");
}

function buildTopThreePriorities(masterQueue: unknown, approvalQueue: unknown): BriefItem[] {
  const blocked = listItems(approvalQueue, "blockedPendingEvidence");
  const approvals = listItems(approvalQueue, "needsDannyApproval");
  const readyForReview = listItems(approvalQueue, "readyForReview");
  const safeDrafts = listItems(approvalQueue, "safeToDraftOnly").concat(listItems(masterQueue, "safeDraftsReady"));
  const top = listItems(masterQueue, "topPriorities");
  const balanced = dedupeByTitle([
    ...approvals.slice(0, 1),
    ...readyForReview.slice(0, 1),
    ...safeDrafts.slice(0, 1),
    ...blocked.slice(0, 1),
    ...top,
  ]);
  return balanced.slice(0, 3).map((item) => ({
    title: cleanText(stringAt(item, "title") ?? "Review item"),
    whyItMatters: cleanText(stringAt(item, "evidenceSummary") ?? stringAt(item, "rationale") ?? "Local reports detected this as a priority review item."),
    recommendedNextStep: cleanText(stringAt(item, "recommendedDecision") ?? stringAt(item, "suggestedNextAction") ?? "Review evidence and decide whether this stays blocked, moves to draft review, or is deferred."),
    riskLevel: riskAt(item, "riskLevel", "medium"),
    needsDannyApproval: booleanAt(item, "needsDannyApproval") || riskAt(item, "riskLevel", "medium") === "high",
  }));
}

function managerBrief(department: Department, masterQueue: unknown, approvalQueue: unknown): ManagerBrief {
  const items = allKnownItems(masterQueue, approvalQueue).filter((item) => stringAt(item, "department") === department);
  const blockedCount = items.filter((item) => stringAt(item, "section") === "blockedPendingEvidence" || stringAt(item, "section") === "blockedRiskyItems").length;
  const approvalCount = items.filter((item) => booleanAt(item, "needsDannyApproval")).length;
  const status: ManagerStatus = blockedCount > 0 ? "blocked" : approvalCount > 0 ? "needs_review" : items.length > 0 ? "active" : "quiet";
  return {
    department,
    status,
    summary: managerSummaryText(department, items.length, approvalCount, blockedCount),
    itemCount: items.length,
    recommendedFocus: managerFocus(department, status),
  };
}

function managerSummaryText(department: Department, itemCount: number, approvalCount: number, blockedCount: number): string {
  if (itemCount === 0) return `${department} is quiet in today's local reports.`;
  if (blockedCount > 0) return `${department} has ${itemCount} item(s), including ${blockedCount} blocked pending evidence or safety review.`;
  if (approvalCount > 0) return `${department} has ${itemCount} item(s), with ${approvalCount} needing Danny review before a next step.`;
  return `${department} has ${itemCount} reviewable draft-planning item(s).`;
}

function managerFocus(department: Department, status: ManagerStatus): string {
  if (status === "blocked") return "Summarise evidence gaps and keep blocked items out of drafting.";
  if (status === "needs_review") return "Reduce noise and prepare a concise review note for Danny.";
  if (status === "active") return "Prepare draft-only review notes without applying changes.";
  return `No action needed from the ${department} manager today unless new data arrives.`;
}

function buildDannyActions(priorities: BriefItem[], approval: Record<string, unknown>, risk: Record<string, unknown>): string[] {
  const actions = [
    priorities[0] ? `Review the top priority: ${priorities[0].title}.` : undefined,
    Number(approval.needsDannyApproval) > 0 ? `Decide which of the ${approval.needsDannyApproval} approval-needed item(s) can move only to draft or research.` : undefined,
    Number(approval.blockedPendingEvidence) > 0 ? `Keep ${approval.blockedPendingEvidence} blocked item(s) paused until evidence is checked.` : undefined,
    Number(risk.sensitivityCount) > 0 ? "Check sensitive affiliate, trust, legal, or claim-related wording before any next step." : undefined,
    "Confirm that no item should be treated as approved, applied, or publish-ready from this brief.",
  ];
  return actions.filter((action): action is string => Boolean(action)).slice(0, 5);
}

function buildAgentActions(masterQueue: unknown, approvalQueue: unknown, opportunity: Record<string, unknown>): string[] {
  const actions = [
    countArray(approvalQueue, "safeToDraftOnly") > 0 ? "Prepare draft-only notes for low-risk items marked safe to draft only." : undefined,
    countArray(approvalQueue, "readyForReview") > 0 ? "Tighten ready-for-review items into concise human review summaries." : undefined,
    countArray(approvalQueue, "blockedPendingEvidence") > 0 ? "Gather evidence checklists for blocked items without drafting final claims." : undefined,
    Number(opportunity.seoOpportunities) > 0 ? "Group SEO opportunities by page so Danny can review the clearest next drafts." : undefined,
    countArray(masterQueue, "monitorOnly") > 0 ? "Keep monitor-only items out of today's action list unless new evidence appears." : undefined,
  ];
  return actions.filter((action): action is string => Boolean(action)).slice(0, 5);
}

function riskSummary(highRisk: number, blocked: number, approvalNeeded: number): string {
  if (highRisk > 0 || blocked > 0) return `${highRisk} high-risk and ${blocked} blocked item(s) detected. Slow down on anything involving affiliate, warning, trust, legal, or claim-sensitive wording.`;
  if (approvalNeeded > 0) return `${approvalNeeded} item(s) need Danny review, but no high-risk block dominates today's brief.`;
  return "No major risk block is visible in the available local reports, but human review is still required.";
}

function reasonToSlowDown(highRisk: number, blocked: number, approvalNeeded: number): string {
  if (blocked > 0) return "Blocked items need evidence or safety checks before drafting.";
  if (highRisk > 0) return "High-risk items need Danny review before any next step.";
  if (approvalNeeded > 0) return "Several items need Danny review, so avoid turning drafts into actions.";
  return "No specific slow-down trigger beyond normal human review.";
}

function opportunitySummary(seoQueue: unknown, gsc: unknown, ga4: unknown, offers: unknown): string {
  const total = countArray(seoQueue, "actionQueue") + recommendationCount(gsc) + recommendationCount(ga4) + offerNeedsReviewCount(offers);
  if (total === 0) return "No strong opportunity signals are visible in the available local reports.";
  return `${total} local opportunity signal(s) are available across SEO, analytics, content refresh, internal link, affiliate, or offer review reports. Treat them as draft/review prompts only.`;
}

function commandQueueSummary(report: unknown): string {
  if (!report) return "Master Command Queue is missing, so the brief cannot see today's full command list.";
  return `${countArray(report, "safeDraftsReady")} safe draft item(s), ${countArray(report, "needsDannyApproval")} Danny approval item(s), ${countArray(report, "blockedRiskyItems")} blocked/risky item(s), and ${countArray(report, "moneyOpportunities")} money opportunity item(s) are visible.`;
}

function approvalSummary(report: unknown): string {
  if (!report) return "Approval Queue is missing, so decision planning is incomplete.";
  return `${countArray(report, "readyForReview")} ready for review, ${countArray(report, "needsDannyApproval")} needing Danny approval, ${countArray(report, "blockedPendingEvidence")} blocked pending evidence, and ${countArray(report, "safeToDraftOnly")} safe to keep draft-only.`;
}

function allKnownItems(masterQueue: unknown, approvalQueue: unknown): unknown[] {
  const sections = ["safeDraftsReady", "needsDannyApproval", "blockedRiskyItems", "monitorOnly", "performanceChanges", "moneyOpportunities", "topPriorities", "readyForReview", "blockedPendingEvidence", "safeToDraftOnly", "rejectOrDefer"];
  return sections.flatMap((section) => listItems(masterQueue, section).concat(listItems(approvalQueue, section)));
}

function evidenceGapCount(approvalQueue: unknown, seoQueue: unknown, research: unknown): number {
  const approvalEvidence = allKnownItems(undefined, approvalQueue).filter((item) => `${stringAt(item, "title") ?? ""} ${stringAt(item, "evidenceSummary") ?? ""}`.toLowerCase().includes("evidence")).length;
  return approvalEvidence + countArray(seoQueue, "blockedItems") + countArray(research, "items");
}

function sensitivityCount(masterQueue: unknown, approvalQueue: unknown): number {
  return allKnownItems(masterQueue, approvalQueue).filter((item) => {
    const text = `${stringAt(item, "title") ?? ""} ${stringAt(item, "evidenceSummary") ?? ""} ${stringAt(item, "approvalWarning") ?? ""}`.toLowerCase();
    return text.includes("affiliate") || text.includes("scam") || text.includes("fraud") || text.includes("trust") || text.includes("legal") || text.includes("policy") || text.includes("warning");
  }).length;
}

function opportunityCount(report: unknown, types: string[]): number {
  return listItems(report, "actionQueue").concat(listItems(report, "items")).filter((item) => {
    const type = stringAt(item, "opportunityType") ?? "";
    return types.includes(type);
  }).length;
}

function recommendationCount(report: unknown, type?: string): number {
  const recommendations = listItems(report, "recommendations");
  if (!type) return recommendations.length;
  return recommendations.filter((item) => (stringAt(item, "type") ?? "").includes(type)).length;
}

function offerNeedsReviewCount(report: unknown): number {
  return listItems(report, "items").filter((item) => stringAt(item, "useStatus") !== "safe_to_use").length;
}

function countArray(record: unknown, key: string): number {
  return listItems(record, key).length;
}

function listItems(record: unknown, key: string): unknown[] {
  const value = valueAt(record, [key]);
  return Array.isArray(value) ? value : [];
}

function dedupeByTitle(items: unknown[]): unknown[] {
  const seen = new Set<string>();
  const output: unknown[] = [];
  for (const item of items) {
    const title = stringAt(item, "title") ?? JSON.stringify(item).slice(0, 80);
    if (!seen.has(title)) {
      seen.add(title);
      output.push(item);
    }
  }
  return output;
}

function countCanAutoApply(...reports: unknown[]): number {
  return reports.reduce<number>((count, report) => count + JSON.stringify(report ?? {}).split('"canAutoApply":true').length - 1, 0);
}

function sourceApprovalCount(...reports: unknown[]): number {
  return reports.reduce<number>((count, report) => count + numberAt(report, "approvalCounts", "approvedCount") + numberAt(report, "stageCounts", "approved"), 0);
}

function sourceAppliedCount(...reports: unknown[]): number {
  return reports.reduce<number>((count, report) => count + numberAt(report, "approvalCounts", "appliedCount") + numberAt(report, "stageCounts", "applied"), 0);
}

function renderMarkdown(report: {
  generatedAt: string;
  briefVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  executiveSummary: string;
  todayCommandQueue: Record<string, unknown>;
  topThreePriorities: BriefItem[];
  managerBriefs: ManagerBrief[];
  approvalSnapshot: Record<string, unknown>;
  riskSnapshot: Record<string, unknown>;
  opportunitySnapshot: Record<string, unknown>;
  whatDannyShouldDoToday: string[];
  whatAgentsShouldDoNext: string[];
  blockedUntilDannyDecides: Array<{ title: string; reason: string; riskLevel: RiskLevel; needsDannyApproval: boolean }>;
  safetyCounts: Record<string, unknown>;
  safetyNotes: string[];
}): string {
  return [
    "# Master AI Manager Daily Brief",
    "",
    "## Executive Summary",
    "",
    report.executiveSummary,
    "",
    "## Today's Command Queue",
    "",
    `- Safe drafts ready: ${report.todayCommandQueue.safeDraftsReady}`,
    `- Needs Danny approval: ${report.todayCommandQueue.needsDannyApproval}`,
    `- Blocked/risky items: ${report.todayCommandQueue.blockedRiskyItems}`,
    `- Monitor only: ${report.todayCommandQueue.monitorOnly}`,
    `- Performance changes: ${report.todayCommandQueue.performanceChanges}`,
    `- Money opportunities: ${report.todayCommandQueue.moneyOpportunities}`,
    "",
    "## Top 3 Priorities",
    "",
    renderPriorities(report.topThreePriorities),
    "",
    "## Department Manager Briefs",
    "",
    report.managerBriefs.map((brief) => `- ${brief.department} (${brief.status}): ${brief.summary} Focus: ${brief.recommendedFocus}`).join("\n"),
    "",
    "## Approval Snapshot",
    "",
    `- Ready for review: ${report.approvalSnapshot.readyForReview}`,
    `- Needs Danny approval: ${report.approvalSnapshot.needsDannyApproval}`,
    `- Blocked pending evidence: ${report.approvalSnapshot.blockedPendingEvidence}`,
    `- Safe to draft only: ${report.approvalSnapshot.safeToDraftOnly}`,
    `- Reject or defer: ${report.approvalSnapshot.rejectOrDefer}`,
    `- Monitor only: ${report.approvalSnapshot.monitorOnly}`,
    "",
    "## Risk Snapshot",
    "",
    `- High risk items: ${report.riskSnapshot.highRiskItemCount}`,
    `- Blocked items: ${report.riskSnapshot.blockedItemCount}`,
    `- Evidence gaps: ${report.riskSnapshot.evidenceGapCount}`,
    `- Sensitive items: ${report.riskSnapshot.sensitivityCount}`,
    `- Slow-down reason: ${report.riskSnapshot.reasonToSlowDown}`,
    "",
    "## Opportunity Snapshot",
    "",
    `- SEO opportunities: ${report.opportunitySnapshot.seoOpportunities}`,
    `- Content refresh opportunities: ${report.opportunitySnapshot.contentRefreshOpportunities}`,
    `- Internal link opportunities: ${report.opportunitySnapshot.internalLinkOpportunities}`,
    `- Affiliate/money opportunities: ${report.opportunitySnapshot.affiliateMoneyOpportunities}`,
    `- Analytics/performance opportunities: ${report.opportunitySnapshot.analyticsPerformanceOpportunities}`,
    "",
    "## What Danny Should Do Today",
    "",
    renderList(report.whatDannyShouldDoToday),
    "",
    "## What Agents Should Do Next",
    "",
    renderList(report.whatAgentsShouldDoNext),
    "",
    "## Blocked Until Danny Decides",
    "",
    renderBlocked(report.blockedUntilDannyDecides),
    "",
    "## Safety Notes",
    "",
    report.safetyNotes.map((note) => `- ${note}`).join("\n"),
    `- canAutoApply count: ${report.safetyCounts.canAutoApplyCount}`,
    `- approvedCount: ${report.safetyCounts.approvedCount}`,
    `- appliedCount: ${report.safetyCounts.appliedCount}`,
    "",
    "## Missing Reports",
    "",
    report.missingReports.length ? report.missingReports.map((name) => `- ${name}`).join("\n") : "No configured reports were missing.",
  ].join("\n");
}

function renderPriorities(items: BriefItem[]): string {
  if (items.length === 0) return "No top priorities were available from the local reports.";
  return items.map((item) => `- ${item.title}: ${item.whyItMatters} Next step: ${item.recommendedNextStep} Risk: ${item.riskLevel}. Danny approval: ${item.needsDannyApproval}.`).join("\n");
}

function renderList(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "No action recommended from the available local reports.";
}

function renderBlocked(items: Array<{ title: string; reason: string; riskLevel: RiskLevel; needsDannyApproval: boolean }>): string {
  return items.length ? items.map((item) => `- ${item.title}: ${item.reason} Risk: ${item.riskLevel}. Danny approval: ${item.needsDannyApproval}.`).join("\n") : "No blocked items were visible in the available local reports.";
}

function stringAt(record: unknown, ...path: (string | number)[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function numberAt(record: unknown, ...path: (string | number)[]): number {
  const value = valueAt(record, path);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  buildMasterDailyBrief().catch((error) => {
    logger.error("Master daily brief failed", { error });
    process.exitCode = 1;
  });
}
