import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type PackStatus = "complete" | "partial" | "failed";
type RiskLevel = "low" | "medium" | "high" | "unknown";

interface InputDefinition {
  name: string;
  path: string;
  required: boolean;
}

interface LoadedReport {
  name: string;
  path: string;
  required: boolean;
  data: unknown;
  rawText: string;
}

interface PackItem {
  id: string;
  title: string;
  sourceReport: string;
  section: string;
  priority?: string;
  riskLevel: RiskLevel;
  needsDannyApproval?: boolean;
  suggestedNextAction?: string;
  evidenceSummary?: string;
  relatedUrl?: string;
  relatedPath?: string;
  canAutoApply: false;
}

interface UnsafeSignal {
  id: string;
  title: string;
  sourceReport: string;
  section: "blockedOrRiskyItems";
  detectedIssue: string;
  riskLevel: "high";
  suggestedNextAction: string;
  canAutoApply: false;
}

const outputJson = "data/reports/daily_report_pack.json";
const outputMd = "data/reports/daily_report_pack.md";

const inputs: InputDefinition[] = [
  { name: "daily_run_orchestrator_report", path: "data/reports/daily_run_orchestrator_report.json", required: true },
  { name: "master_daily_brief", path: "data/reports/master_daily_brief.json", required: true },
  { name: "quality_control_report", path: "data/reports/quality_control_report.json", required: true },
  { name: "manager_escalation_router_report", path: "data/reports/manager_escalation_router_report.json", required: true },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json", required: true },
  { name: "approval_queue_report", path: "data/reports/approval_queue_report.json", required: true },
  { name: "research_duplicate_guard_report", path: "data/reports/research_duplicate_guard_report.json", required: false },
  { name: "fix_draft_suggestions", path: "data/reports/fix_draft_suggestions.json", required: false },
  { name: "preview_diff_report", path: "data/reports/preview_diff_report.json", required: false },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json", required: false },
  { name: "seo_intelligence_queue", path: "data/reports/seo_intelligence_queue.json", required: false },
  { name: "metadata_suggestions", path: "data/reports/metadata_suggestions.json", required: false },
  { name: "internal_link_placement_suggestions", path: "data/reports/internal_link_placement_suggestions.json", required: false },
  { name: "affiliate_placement_suggestions", path: "data/reports/affiliate_placement_suggestions.json", required: false },
  { name: "offer_tracker_report", path: "data/reports/offer_tracker_report.json", required: false },
  { name: "search_console_report", path: "data/reports/search_console_report.json", required: false },
  { name: "ga4_report", path: "data/reports/ga4_report.json", required: false },
  { name: "rendered_page_verification", path: "data/reports/rendered_page_verification.json", required: false },
  { name: "priority_action_queue", path: "data/reports/priority_action_queue.json", required: false },
  { name: "audit_confidence_summary", path: "data/reports/audit_confidence_summary.json", required: false },
];

export async function buildDailyReportPack(): Promise<unknown> {
  const loadedReports = await loadReports();
  const requiredInputsRead = loadedReports.filter((report) => report.required).map((report) => report.name);
  const optionalInputsRead = loadedReports.filter((report) => !report.required).map((report) => report.name);
  const missingRequiredInputs = inputs
    .filter((input) => input.required && !loadedReports.some((report) => report.name === input.name))
    .map((input) => input.path);
  const missingOptionalInputs = inputs
    .filter((input) => !input.required && !loadedReports.some((report) => report.name === input.name))
    .map((input) => input.path);
  const packStatus = getPackStatus(requiredInputsRead.length, missingRequiredInputs.length);
  const reportMap = new Map(loadedReports.map((report) => [report.name, report.data]));
  const unsafeSignals = findUnsafeSignals(loadedReports);

  const topDannyDecisionItems = takeItems(
    collectItems(reportMap.get("approval_queue_report"), "approval_queue_report", ["needsDannyApproval", "readyForReview"], 8),
    8,
  );
  const blockedOrRiskySourceItems: Array<PackItem | UnsafeSignal> = [
    ...unsafeSignals,
    ...collectItems(reportMap.get("master_command_queue"), "master_command_queue", ["blockedRiskyItems"], 10),
    ...collectItems(reportMap.get("quality_control_report"), "quality_control_report", ["findings"], 10).filter((item) => item.riskLevel === "high"),
    ...collectItems(reportMap.get("manager_escalation_router_report"), "manager_escalation_router_report", ["escalationItems"], 8).filter(
      (item) => item.needsDannyApproval || item.riskLevel === "high",
    ),
  ];
  const blockedOrRiskyItems = takeItems(blockedOrRiskySourceItems, 15);
  const monitorOnlyItems = takeItems(
    collectItems(reportMap.get("master_command_queue"), "master_command_queue", ["monitorOnly"], 8).concat(
      collectItems(reportMap.get("approval_queue_report"), "approval_queue_report", ["monitorOnly"], 8),
    ),
    10,
  );
  const moneyOpportunities = takeItems(
    collectItems(reportMap.get("master_command_queue"), "master_command_queue", ["moneyOpportunities"], 10).concat(
      collectItems(reportMap.get("affiliate_placement_suggestions"), "affiliate_placement_suggestions", ["recommendations", "items"], 8),
      collectItems(reportMap.get("offer_tracker_report"), "offer_tracker_report", ["items", "offers", "records"], 8),
    ),
    12,
  );
  const nextRecommendedBlocks = takeItems(
    collectItems(reportMap.get("master_daily_brief"), "master_daily_brief", ["whatDannyShouldDoToday", "whatAgentsShouldDoNext"], 8).concat(
      collectItems(reportMap.get("master_command_queue"), "master_command_queue", ["blockedRiskyItems"], 10),
      collectItems(reportMap.get("quality_control_report"), "quality_control_report", ["findings"], 8).filter(
        (item) => item.section === "findings" && item.riskLevel !== "low",
      ),
    ),
    10,
  );

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "2R",
    name: "Daily Report Pack Builder v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    requiredInputsRead,
    optionalInputsRead,
    missingRequiredInputs,
    missingOptionalInputs,
    packStatus,
    executiveSummary: buildExecutiveSummary(reportMap, packStatus, unsafeSignals.length),
    commandQueueSummary: buildCommandQueueSummary(reportMap.get("master_command_queue")),
    approvalSummary: buildSectionSummary(reportMap.get("approval_queue_report"), [
      "readyForReview",
      "needsDannyApproval",
      "blockedPendingEvidence",
      "safeToDraftOnly",
      "rejectOrDefer",
      "monitorOnly",
    ]),
    qcSummary: buildQcSummary(reportMap.get("quality_control_report")),
    escalationSummary: buildEscalationSummary(reportMap.get("manager_escalation_router_report")),
    dailyRunSummary: buildDailyRunSummary(reportMap.get("daily_run_orchestrator_report")),
    agentSummary: buildAgentSummary(reportMap.get("agent_registry_report")),
    contentSummary: buildContentSummary(reportMap),
    seoSummary: buildSeoSummary(reportMap),
    affiliateSummary: buildAffiliateSummary(reportMap),
    analyticsSummary: buildAnalyticsSummary(reportMap),
    researchSummary: buildResearchSummary(reportMap.get("research_duplicate_guard_report")),
    topDannyDecisionItems,
    blockedOrRiskyItems,
    monitorOnlyItems,
    moneyOpportunities,
    nextRecommendedBlocks,
    safetyChecks: {
      reportOnly: true,
      noLiveWrites: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noPatchFiles: true,
      noUpdatePayloads: true,
      noApprovedState: unsafeSignals.every((signal) => !signal.detectedIssue.includes("approved")),
      noAppliedState: unsafeSignals.every((signal) => !signal.detectedIssue.includes("applied")),
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
      unsafeSignalCount: unsafeSignals.length,
      canAutoApplyTrueCount: unsafeSignals.filter((signal) => signal.detectedIssue.includes("canAutoApply true")).length,
      approvedStateSignalCount: unsafeSignals.filter((signal) => signal.detectedIssue.includes("approved")).length,
      appliedStateSignalCount: unsafeSignals.filter((signal) => signal.detectedIssue.includes("applied")).length,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Daily report pack written", {
    packStatus,
    requiredInputsRead: requiredInputsRead.length,
    optionalInputsRead: optionalInputsRead.length,
    missingRequiredInputs: missingRequiredInputs.length,
    missingOptionalInputs: missingOptionalInputs.length,
    outputJson,
    outputMd,
  });
  return report;
}

async function loadReports(): Promise<LoadedReport[]> {
  const loaded: LoadedReport[] = [];
  for (const input of inputs) {
    const absolutePath = fromRoot(input.path);
    if (!existsSync(absolutePath)) continue;
    const rawText = await readFile(absolutePath, "utf8");
    loaded.push({
      ...input,
      data: JSON.parse(rawText) as unknown,
      rawText,
    });
  }
  return loaded;
}

function getPackStatus(requiredReadCount: number, missingRequiredCount: number): PackStatus {
  if (requiredReadCount === 0) return "failed";
  return missingRequiredCount === 0 ? "complete" : "partial";
}

function findUnsafeSignals(reports: LoadedReport[]): UnsafeSignal[] {
  const signals: UnsafeSignal[] = [];
  for (const report of reports) {
    const checks = [
      { issue: "canAutoApply true detected in source report", pattern: /"canAutoApply"\s*:\s*true/g },
      { issue: "approved true detected in source report", pattern: /"approved"\s*:\s*true/g },
      { issue: "applied true detected in source report", pattern: /"applied"\s*:\s*true/g },
      {
        issue: "approved status stage detected in source report",
        pattern: /"(?:currentStage|statusStage|stage)"\s*:\s*"approved"/g,
      },
      {
        issue: "applied status stage detected in source report",
        pattern: /"(?:currentStage|statusStage|stage)"\s*:\s*"applied"/g,
      },
    ];

    for (const check of checks) {
      const count = Array.from(report.rawText.matchAll(check.pattern)).length;
      if (count === 0) continue;
      signals.push({
        id: stableId(`unsafe-${report.name}-${check.issue}`),
        title: `Safety review required: ${report.name}`,
        sourceReport: report.name,
        section: "blockedOrRiskyItems",
        detectedIssue: `${check.issue} (${count} occurrence${count === 1 ? "" : "s"})`,
        riskLevel: "high",
        suggestedNextAction: "Keep this report pack read-only and review the source report before any downstream drafting.",
        canAutoApply: false,
      });
    }
  }
  return signals;
}

function buildExecutiveSummary(reportMap: Map<string, unknown>, packStatus: PackStatus, unsafeSignalCount: number): Record<string, unknown> {
  const dailyBrief = reportMap.get("master_daily_brief");
  const summary = stringAt(dailyBrief, "executiveSummary");
  const commandSummary = recordAt(reportMap.get("master_command_queue"), "summaryCounts");
  return {
    packStatus,
    plainEnglishSummary:
      summary ??
      "This local pack summarises available Watchdog HQ reports for Danny review. It is planning-only and does not approve or apply anything.",
    unsafeSignalCount,
    safeDraftsReady: numberAt(commandSummary, "safeDraftsReadyCount"),
    needsDannyApproval: numberAt(commandSummary, "needsDannyApprovalCount"),
    blockedRiskyItems: numberAt(commandSummary, "blockedRiskyItemCount"),
    monitorOnly: numberAt(commandSummary, "monitorOnlyCount"),
  };
}

function buildCommandQueueSummary(report: unknown): Record<string, unknown> {
  const summaryCounts = recordAt(report, "summaryCounts");
  return {
    safeDraftsReady: arrayLength(report, "safeDraftsReady", numberAt(summaryCounts, "safeDraftsReadyCount")),
    needsDannyApproval: arrayLength(report, "needsDannyApproval", numberAt(summaryCounts, "needsDannyApprovalCount")),
    blockedRiskyItems: arrayLength(report, "blockedRiskyItems", numberAt(summaryCounts, "blockedRiskyItemCount")),
    monitorOnly: arrayLength(report, "monitorOnly", numberAt(summaryCounts, "monitorOnlyCount")),
    performanceChanges: arrayLength(report, "performanceChanges", numberAt(summaryCounts, "performanceChangeCount")),
    moneyOpportunities: arrayLength(report, "moneyOpportunities", numberAt(summaryCounts, "moneyOpportunityCount")),
    topPriorityCount: arrayLength(report, "topPriorities", numberAt(summaryCounts, "topPriorityCount")),
  };
}

function buildSectionSummary(report: unknown, keys: string[]): Record<string, number> {
  return Object.fromEntries(keys.map((key) => [key, arrayLength(report, key, numberAt(recordAt(report, "summaryCounts"), `${key}Count`))]));
}

function buildQcSummary(report: unknown): Record<string, unknown> {
  return {
    summaryCounts: recordAt(report, "summaryCounts"),
    qcStatusCounts: recordAt(report, "qcStatusCounts"),
    severityCounts: recordAt(report, "severityCounts"),
    riskCounts: recordAt(report, "riskCounts"),
    issueTypeCounts: recordAt(report, "issueTypeCounts"),
    safetyCounts: recordAt(report, "safetyCounts"),
  };
}

function buildEscalationSummary(report: unknown): Record<string, unknown> {
  return {
    itemCount: arrayLength(report, "escalationItems"),
    managerSummaryCount: arrayLength(report, "managerSummary"),
    safetyChecks: recordAt(report, "safetyChecks"),
    topRoutes: takeItems(collectItems(report, "manager_escalation_router_report", ["escalationItems"], 5), 5),
  };
}

function buildDailyRunSummary(report: unknown): Record<string, unknown> {
  const steps = listAt(report, "steps");
  return {
    overallStatus: stringAt(report, "overallStatus") ?? "unknown",
    completedStepCount: steps.length,
    passedStepCount: steps.filter((step) => stringAt(step, "status") === "passed").length,
    failedStepCount: steps.filter((step) => stringAt(step, "status") === "failed").length,
    skippedStepCount: arrayLength(report, "skippedSteps"),
  };
}

function buildAgentSummary(report: unknown): Record<string, unknown> {
  return {
    agentCount: numberAt(report, "agentCount", arrayLength(report, "agents")),
    activeAgentCount: numberAt(report, "activeAgentCount"),
    plannedAgentCount: numberAt(report, "plannedAgentCount"),
    futureAgentCount: numberAt(report, "futureAgentCount"),
    departmentCounts: recordAt(report, "departmentCounts"),
    riskCounts: recordAt(report, "riskCounts"),
  };
}

function buildContentSummary(reportMap: Map<string, unknown>): Record<string, unknown> {
  return {
    fixDraftCount: arrayLength(reportMap.get("fix_draft_suggestions"), "drafts"),
    previewCount: arrayLength(reportMap.get("preview_diff_report"), "previews"),
    metadataSuggestionCount: arrayLength(reportMap.get("metadata_suggestions"), "suggestions"),
    internalLinkSuggestionCount: arrayLength(reportMap.get("internal_link_placement_suggestions"), "recommendations"),
  };
}

function buildSeoSummary(reportMap: Map<string, unknown>): Record<string, unknown> {
  const seo = reportMap.get("seo_intelligence_queue");
  return {
    actionQueueCount: arrayLength(seo, "actionQueue", arrayLength(seo, "items")),
    blockedItemCount: arrayLength(seo, "blockedItems"),
    monitorItemCount: arrayLength(seo, "monitorItems"),
    opportunityTypeCounts: recordAt(seo, "opportunityTypeCounts"),
    metadataSuggestionCount: arrayLength(reportMap.get("metadata_suggestions"), "suggestions"),
    internalLinkSuggestionCount: arrayLength(reportMap.get("internal_link_placement_suggestions"), "recommendations"),
  };
}

function buildAffiliateSummary(reportMap: Map<string, unknown>): Record<string, unknown> {
  return {
    placementSuggestionCount: arrayLength(reportMap.get("affiliate_placement_suggestions"), "recommendations", arrayLength(reportMap.get("affiliate_placement_suggestions"), "items")),
    offerTrackerItemCount: arrayLength(reportMap.get("offer_tracker_report"), "items", arrayLength(reportMap.get("offer_tracker_report"), "offers")),
    moneyOpportunityCount: arrayLength(reportMap.get("master_command_queue"), "moneyOpportunities"),
  };
}

function buildAnalyticsSummary(reportMap: Map<string, unknown>): Record<string, unknown> {
  return {
    searchConsoleSourceRead: reportMap.has("search_console_report"),
    ga4SourceRead: reportMap.has("ga4_report"),
    searchConsoleRecommendationCount: arrayLength(reportMap.get("search_console_report"), "recommendations", arrayLength(reportMap.get("search_console_report"), "opportunities")),
    ga4RecommendationCount: arrayLength(reportMap.get("ga4_report"), "recommendations", arrayLength(reportMap.get("ga4_report"), "opportunities")),
  };
}

function buildResearchSummary(report: unknown): Record<string, unknown> {
  return {
    ideaCount: arrayLength(report, "ideas", arrayLength(report, "items")),
    blockedUntilEvidenceCount: countItemsWithText(report, ["blocked_until_evidence", "blocked pending evidence"]),
    updateExistingPageCount: countItemsWithText(report, ["update_existing_page_instead", "update existing page"]),
    safetyCounts: recordAt(report, "safetyCounts"),
  };
}

function collectItems(report: unknown, sourceReport: string, keys: string[], limitPerKey: number): PackItem[] {
  const output: PackItem[] = [];
  for (const key of keys) {
    for (const record of listAt(report, key).slice(0, limitPerKey)) {
      output.push(toPackItem(record, sourceReport, key));
    }
  }
  return output;
}

function toPackItem(record: unknown, sourceReport: string, section: string): PackItem {
  const title =
    stringAt(record, "title") ??
    stringAt(record, "sourceTitle") ??
    stringAt(record, "detectedIssue") ??
    stringAt(record, "recommendedFocus") ??
    stringAt(record, "department") ??
    `${sourceReport} item`;
  return {
    id: stableId(`${sourceReport}-${section}-${firstString(record, ["id", "sourceItemId", "sourceQueueItemId", "sourceDraftId", "sourcePreviewId"]) ?? title}`),
    title: safeText(title),
    sourceReport,
    section,
    priority: stringAt(record, "priority"),
    riskLevel: riskAt(record),
    needsDannyApproval: booleanAt(record, "needsDannyApproval"),
    suggestedNextAction: safeText(
      firstString(record, ["suggestedNextAction", "recommendedNextStep", "recommendedAction", "recommendedDecision", "recommendedFocus"]) ?? "",
    ),
    evidenceSummary: safeText(firstString(record, ["evidenceSummary", "whyItMatters", "rationale", "routeReason", "summary"]) ?? ""),
    relatedUrl: safeUrl(stringAt(record, "relatedUrl")),
    relatedPath: safeText(stringAt(record, "relatedPath") ?? ""),
    canAutoApply: false,
  };
}

function takeItems<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

function arrayLength(report: unknown, key: string, fallback = 0): number {
  const value = valueAt(report, key);
  return Array.isArray(value) ? value.length : fallback;
}

function countItemsWithText(report: unknown, needles: string[]): number {
  const records = ["ideas", "items", "recommendations", "findings"].flatMap((key) => listAt(report, key));
  return records.filter((record) => {
    const text = JSON.stringify(record).toLowerCase();
    return needles.some((needle) => text.includes(needle.toLowerCase()));
  }).length;
}

function listAt(value: unknown, key: string): unknown[] {
  const found = valueAt(value, key);
  return Array.isArray(found) ? found : [];
}

function recordAt(value: unknown, key: string): Record<string, unknown> {
  const found = valueAt(value, key);
  return isRecord(found) ? found : {};
}

function valueAt(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function numberAt(value: unknown, key: string, fallback = 0): number {
  const found = valueAt(value, key);
  return typeof found === "number" ? found : fallback;
}

function stringAt(value: unknown, key: string): string | undefined {
  const found = valueAt(value, key);
  return typeof found === "string" && found.trim() ? found : undefined;
}

function booleanAt(value: unknown, key: string): boolean | undefined {
  const found = valueAt(value, key);
  return typeof found === "boolean" ? found : undefined;
}

function firstString(value: unknown, keys: string[]): string | undefined {
  for (const key of keys) {
    const found = stringAt(value, key);
    if (found) return found;
  }
  return undefined;
}

function riskAt(value: unknown): RiskLevel {
  const risk = stringAt(value, "riskLevel") ?? stringAt(value, "severity") ?? "unknown";
  return risk === "low" || risk === "medium" || risk === "high" ? risk : "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: string): string {
  return value.replace(/https?:\/\/[^\s)]+/gi, "[url redacted]").slice(0, 600);
}

function safeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.hostname === "cryptowatchdog.net" || url.hostname.endsWith(".cryptowatchdog.net")) {
      return value;
    }
  } catch {
    return undefined;
  }
  return "[external url redacted]";
}

function stableId(value: string): string {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function renderMarkdown(report: {
  generatedAt: string;
  name: string;
  safetyMode: string;
  packStatus: PackStatus;
  requiredInputsRead: string[];
  optionalInputsRead: string[];
  missingRequiredInputs: string[];
  missingOptionalInputs: string[];
  commandQueueSummary: Record<string, unknown>;
  qcSummary: Record<string, unknown>;
  escalationSummary: Record<string, unknown>;
  topDannyDecisionItems: PackItem[];
  blockedOrRiskyItems: Array<PackItem | UnsafeSignal>;
  monitorOnlyItems: PackItem[];
  moneyOpportunities: PackItem[];
  nextRecommendedBlocks: PackItem[];
  safetyChecks: Record<string, unknown>;
}): string {
  return [
    `# ${report.name}`,
    "",
    "## Safety Summary",
    "",
    `- Safety mode: ${report.safetyMode}`,
    "- This pack is read-only, report-only, and local-only.",
    "- It does not approve, apply, publish, edit live files, write to Supabase, create patch files, or create update payloads.",
    "- Source reports are summarised, not copied in full.",
    "",
    "## Pack Status",
    "",
    `- Status: ${report.packStatus}`,
    `- Generated: ${report.generatedAt}`,
    "",
    "## Required / Optional Input Summary",
    "",
    `- Required inputs read: ${report.requiredInputsRead.length}`,
    `- Optional inputs read: ${report.optionalInputsRead.length}`,
    `- Missing required inputs: ${report.missingRequiredInputs.length}`,
    `- Missing optional inputs: ${report.missingOptionalInputs.length}`,
    report.missingRequiredInputs.length ? `- Missing required files: ${report.missingRequiredInputs.join(", ")}` : "- Missing required files: none",
    "",
    "## Today's Command Queue",
    "",
    `- Safe drafts ready: ${display(report.commandQueueSummary.safeDraftsReady)}`,
    `- Needs Danny approval: ${display(report.commandQueueSummary.needsDannyApproval)}`,
    `- Blocked/risky items: ${display(report.commandQueueSummary.blockedRiskyItems)}`,
    `- Monitor only: ${display(report.commandQueueSummary.monitorOnly)}`,
    `- Performance changes: ${display(report.commandQueueSummary.performanceChanges)}`,
    `- Money opportunities: ${display(report.commandQueueSummary.moneyOpportunities)}`,
    "",
    "## Quality Control Summary",
    "",
    `- QC statuses: ${jsonOneLine(report.qcSummary.qcStatusCounts)}`,
    `- Severity counts: ${jsonOneLine(report.qcSummary.severityCounts)}`,
    `- Risk counts: ${jsonOneLine(report.qcSummary.riskCounts)}`,
    "",
    "## Manager Escalation Summary",
    "",
    `- Escalation items: ${display(report.escalationSummary.itemCount)}`,
    `- Manager summaries: ${display(report.escalationSummary.managerSummaryCount)}`,
    "",
    "## Top Danny Decision Items",
    "",
    renderItems(report.topDannyDecisionItems, "No Danny decision items were available in the loaded reports."),
    "",
    "## Blocked / Risky Items",
    "",
    renderItems(report.blockedOrRiskyItems, "No blocked or risky items were detected in the pack inputs."),
    "",
    "## Monitor Only",
    "",
    renderItems(report.monitorOnlyItems, "No monitor-only items were available in the loaded reports."),
    "",
    "## Money Opportunities",
    "",
    renderItems(report.moneyOpportunities, "No money opportunity items were available in the loaded reports."),
    "",
    "## Next Recommended Blocks",
    "",
    renderItems(report.nextRecommendedBlocks, "No next recommended blocks were available in the loaded reports."),
    "",
    "## Safety Checks",
    "",
    `- Report only: ${display(report.safetyChecks.reportOnly)}`,
    `- No live writes: ${display(report.safetyChecks.noLiveWrites)}`,
    `- No Supabase writes: ${display(report.safetyChecks.noSupabaseWrites)}`,
    `- No publishing: ${display(report.safetyChecks.noPublishing)}`,
    `- No patch files: ${display(report.safetyChecks.noPatchFiles)}`,
    `- No update payloads: ${display(report.safetyChecks.noUpdatePayloads)}`,
    `- Unsafe signal count: ${display(report.safetyChecks.unsafeSignalCount)}`,
    "",
    "This report pack is for Danny's human review and future dashboard input only. Nothing has been approved, applied, published, patched, or written to Supabase.",
  ].join("\n");
}

function renderItems(items: Array<PackItem | UnsafeSignal>, emptyText: string): string {
  if (items.length === 0) return emptyText;
  return items
    .slice(0, 10)
    .map((item, index) => {
      const parts = [`${index + 1}. ${item.title}`, `source: ${item.sourceReport}`, `risk: ${item.riskLevel}`];
      if ("suggestedNextAction" in item && item.suggestedNextAction) parts.push(`next: ${item.suggestedNextAction}`);
      if ("detectedIssue" in item) parts.push(`issue: ${item.detectedIssue}`);
      return parts.join(" | ");
    })
    .join("\n");
}

function display(value: unknown): string {
  return typeof value === "undefined" ? "0" : String(value);
}

function jsonOneLine(value: unknown): string {
  if (!isRecord(value)) return "{}";
  return JSON.stringify(value);
}

if (isDirectRun(import.meta.url)) {
  buildDailyReportPack().catch((error) => {
    logger.error("Daily report pack failed", { error });
    process.exitCode = 1;
  });
}
