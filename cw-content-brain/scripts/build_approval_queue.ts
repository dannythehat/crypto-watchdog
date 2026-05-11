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

type ApprovalSection =
  | "readyForReview"
  | "needsDannyApproval"
  | "blockedPendingEvidence"
  | "safeToDraftOnly"
  | "rejectOrDefer"
  | "monitorOnly";

type DecisionType =
  | "review"
  | "approve_to_draft"
  | "approve_to_research"
  | "approve_to_prepare_preview"
  | "reject"
  | "defer"
  | "monitor";

type RiskLevel = "low" | "medium" | "high";
type StatusStage = "detected" | "suspected" | "recommended";

interface SourceReport {
  name: string;
  path: string;
}

interface ApprovalItem {
  id: string;
  sourcePreviewId?: string;
  sourceDraftId?: string;
  sourceQueueItemId?: string;
  sourceReport: string;
  section: ApprovalSection;
  department: Department;
  decisionType: DecisionType;
  riskLevel: RiskLevel;
  statusStage: StatusStage;
  needsHumanReview: true;
  needsDannyApproval: boolean;
  canAutoApply: false;
  title: string;
  decisionQuestion: string;
  evidenceSummary: string;
  recommendedDecision: string;
  rationale: string;
  blockedReason?: string;
  approvalWarning?: string;
  relatedUrl?: string;
  relatedPath?: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

const approvalQueueVersion = "1.0.0";
const outputJson = "data/reports/approval_queue_report.json";
const outputMd = "data/reports/approval_queue_report.md";

const maxItemsTotal = 60;
const maxReadyForReview = 15;
const maxNeedsDannyApproval = 15;
const maxBlockedPendingEvidence = 15;
const maxSafeToDraftOnly = 10;
const maxRejectOrDefer = 10;
const maxMonitorOnly = 10;

const sourceReports: SourceReport[] = [
  { name: "preview_diff_report", path: "data/reports/preview_diff_report.json" },
  { name: "fix_draft_suggestions", path: "data/reports/fix_draft_suggestions.json" },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json" },
];

const safetyNotes = [
  "Approval Queue v1 is approval-planning only.",
  "It never marks anything truly approved, applies changes, edits files, creates patch files, creates update payloads, writes to Supabase, edits live pages, publishes, calls APIs, or stores secrets.",
  "Every item has needsHumanReview true and canAutoApply false.",
  "approvedCount and appliedCount are always 0.",
  "Affiliate, scam/fraud, trust/rating, legal/policy, high-risk, and blocked items require Danny approval.",
  "Recommendations such as approve_to_draft or approve_to_research describe the decision needed; they do not mean approval has happened.",
];

export async function buildApprovalQueue(): Promise<ApprovalItem[]> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const reportMap = new Map(loadedReports.map((report) => [report.source.name, report.data]));
  const agentRegistry = reportMap.get("agent_registry_report");
  const previewItems = arrayAt(reportMap.get("preview_diff_report"), "previews");
  const draftItems = arrayAt(reportMap.get("fix_draft_suggestions"), "drafts");
  const commandItems = commandQueueItems(reportMap.get("master_command_queue"));

  const candidates = previewItems.length > 0
    ? previewItems.map((item) => itemFromPreview(item, agentRegistry))
    : draftItems.length > 0
      ? draftItems.map((item) => itemFromDraft(item, agentRegistry))
      : commandItems.map((item) => itemFromCommandQueue(item, agentRegistry));

  const allItems = dedupeItems(candidates.filter((item): item is ApprovalItem => Boolean(item)));
  const readyForReview = allItems.filter((item) => item.section === "readyForReview").slice(0, maxReadyForReview);
  const needsDannyApproval = allItems.filter((item) => item.section === "needsDannyApproval").slice(0, maxNeedsDannyApproval);
  const blockedPendingEvidence = allItems.filter((item) => item.section === "blockedPendingEvidence").slice(0, maxBlockedPendingEvidence);
  const safeToDraftOnly = allItems.filter((item) => item.section === "safeToDraftOnly").slice(0, maxSafeToDraftOnly);
  const rejectOrDefer = allItems.filter((item) => item.section === "rejectOrDefer").slice(0, maxRejectOrDefer);
  const monitorOnly = allItems.filter((item) => item.section === "monitorOnly").slice(0, maxMonitorOnly);
  const selectedItems = [...readyForReview, ...needsDannyApproval, ...blockedPendingEvidence, ...safeToDraftOnly, ...rejectOrDefer, ...monitorOnly].slice(0, maxItemsTotal);

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Approval Queue v1 for Danny. This local report plans review decisions only. It never approves, applies, edits files, creates patches, creates update payloads, writes to Supabase, edits live pages, publishes, calls APIs, exposes secrets, changes trust ratings, finalises legal/policy wording, or makes scam/fraud accusations.",
    approvalQueueVersion,
    sourceReportsRead,
    missingReports,
    summaryCounts: {
      itemCount: selectedItems.length,
      readyForReviewCount: readyForReview.length,
      needsDannyApprovalCount: needsDannyApproval.length,
      blockedPendingEvidenceCount: blockedPendingEvidence.length,
      safeToDraftOnlyCount: safeToDraftOnly.length,
      rejectOrDeferCount: rejectOrDefer.length,
      monitorOnlyCount: monitorOnly.length,
      maxItemsTotal,
    },
    riskCounts: countBy(selectedItems, (item) => item.riskLevel, ["low", "medium", "high"]),
    decisionTypeCounts: countBy(selectedItems, (item) => item.decisionType, ["review", "approve_to_draft", "approve_to_research", "approve_to_prepare_preview", "reject", "defer", "monitor"]),
    approvalCounts: {
      needsHumanReviewCount: selectedItems.length,
      needsDannyApprovalCount: selectedItems.filter((item) => item.needsDannyApproval).length,
      canAutoApplyCount: 0,
      approvedCount: 0,
      appliedCount: 0,
    },
    readyForReview,
    needsDannyApproval,
    blockedPendingEvidence,
    safeToDraftOnly,
    rejectOrDefer,
    monitorOnly,
    safetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Approval queue report written", {
    items: selectedItems.length,
    sourceReportsRead: sourceReportsRead.length,
    missingReports: missingReports.length,
    outputJson,
    outputMd,
  });
  return selectedItems;
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

function itemFromPreview(record: unknown, agentRegistry: unknown): ApprovalItem | undefined {
  const id = stringAt(record, "id");
  const title = stringAt(record, "title");
  const department = departmentAt(record, agentRegistry);
  if (!id || !title || !department) return undefined;
  const riskLevel = riskAt(record, "riskLevel", "medium");
  const blockedReason = stringAt(record, "blockedReason");
  const needsDannyApproval = booleanAt(record, "needsDannyApproval") || riskLevel === "high" || Boolean(blockedReason) || isSensitive(record);
  const section = sectionFor(record, needsDannyApproval, blockedReason);
  const decisionType = decisionFor(section, record);
  return approvalItem({
    id: idFor("approval", id),
    sourcePreviewId: id,
    sourceDraftId: stringAt(record, "sourceDraftId"),
    sourceQueueItemId: stringAt(record, "sourceQueueItemId"),
    sourceReport: stringAt(record, "sourceReport") ?? "preview_diff_report",
    section,
    department,
    decisionType,
    riskLevel: blockedReason ? "high" : riskLevel,
    statusStage: safeStage(stringAt(record, "statusStage")),
    needsDannyApproval,
    title,
    decisionQuestion: decisionQuestion(section, title),
    evidenceSummary: stringAt(record, "previewDiffText") ?? stringAt(record, "rationale") ?? "Preview diff requires human review.",
    recommendedDecision: recommendedDecisionFor(section, decisionType),
    rationale: stringAt(record, "rationale") ?? "Generated from Preview Diff Engine.",
    blockedReason,
    approvalWarning: approvalWarningFor(record, needsDannyApproval, blockedReason),
    relatedUrl: stringAt(record, "relatedUrl"),
    relatedPath: stringAt(record, "relatedPath"),
  });
}

function itemFromDraft(record: unknown, agentRegistry: unknown): ApprovalItem | undefined {
  const id = stringAt(record, "id");
  const title = stringAt(record, "title");
  const department = departmentAt(record, agentRegistry);
  if (!id || !title || !department) return undefined;
  const riskLevel = riskAt(record, "riskLevel", "medium");
  const blockedReason = stringAt(record, "blockedReason");
  const needsDannyApproval = booleanAt(record, "needsDannyApproval") || riskLevel === "high" || Boolean(blockedReason) || isSensitive(record);
  const section = blockedReason ? "blockedPendingEvidence" : needsDannyApproval ? "needsDannyApproval" : riskLevel === "low" ? "safeToDraftOnly" : "readyForReview";
  const decisionType = decisionFor(section, record);
  return approvalItem({
    id: idFor("approval-draft", id),
    sourceDraftId: id,
    sourceQueueItemId: stringAt(record, "sourceQueueItemId"),
    sourceReport: stringAt(record, "sourceReport") ?? "fix_draft_suggestions",
    section,
    department,
    decisionType,
    riskLevel: blockedReason ? "high" : riskLevel,
    statusStage: safeStage(stringAt(record, "statusStage")),
    needsDannyApproval,
    title,
    decisionQuestion: decisionQuestion(section, title),
    evidenceSummary: stringAt(record, "draftText") ?? "Draft suggestion requires review.",
    recommendedDecision: recommendedDecisionFor(section, decisionType),
    rationale: stringAt(record, "rationale") ?? "Generated from Fix Draft Suggestions.",
    blockedReason,
    approvalWarning: approvalWarningFor(record, needsDannyApproval, blockedReason),
    relatedUrl: stringAt(record, "relatedUrl"),
    relatedPath: stringAt(record, "relatedPath"),
  });
}

function itemFromCommandQueue(record: unknown, agentRegistry: unknown): ApprovalItem | undefined {
  const id = stringAt(record, "id");
  const title = stringAt(record, "title");
  const department = departmentAt(record, agentRegistry);
  if (!id || !title || !department) return undefined;
  const riskLevel = riskAt(record, "riskLevel", "medium");
  const section = stringAt(record, "section") === "monitorOnly"
    ? "monitorOnly"
    : stringAt(record, "section") === "blockedRiskyItems"
      ? "blockedPendingEvidence"
      : booleanAt(record, "needsDannyApproval") || riskLevel === "high" || isSensitive(record)
        ? "needsDannyApproval"
        : riskLevel === "low"
          ? "safeToDraftOnly"
          : "readyForReview";
  const decisionType = decisionFor(section, record);
  return approvalItem({
    id: idFor("approval-queue", id),
    sourceQueueItemId: id,
    sourceReport: stringAt(record, "sourceReport") ?? "master_command_queue",
    section,
    department,
    decisionType,
    riskLevel: section === "blockedPendingEvidence" ? "high" : riskLevel,
    statusStage: safeStage(stringAt(record, "statusStage")),
    needsDannyApproval: section === "needsDannyApproval" || section === "blockedPendingEvidence",
    title,
    decisionQuestion: decisionQuestion(section, title),
    evidenceSummary: stringAt(record, "evidenceSummary") ?? "Command queue item requires review.",
    recommendedDecision: recommendedDecisionFor(section, decisionType),
    rationale: stringAt(record, "suggestedNextAction") ?? "Generated from Master Command Queue.",
    blockedReason: section === "blockedPendingEvidence" ? stringAt(record, "evidenceSummary") ?? "Blocked by command queue risk control." : undefined,
    approvalWarning: approvalWarningFor(record, section === "needsDannyApproval" || section === "blockedPendingEvidence", section === "blockedPendingEvidence" ? "Blocked by command queue risk control." : undefined),
    relatedUrl: stringAt(record, "relatedUrl"),
    relatedPath: stringAt(record, "relatedPath"),
  });
}

function approvalItem(input: Omit<ApprovalItem, "needsHumanReview" | "canAutoApply">): ApprovalItem {
  return { ...input, needsHumanReview: true, canAutoApply: false };
}

function sectionFor(record: unknown, needsDannyApproval: boolean, blockedReason?: string): ApprovalSection {
  const title = `${stringAt(record, "title") ?? ""} ${stringAt(record, "evidenceSummary") ?? ""} ${stringAt(record, "rationale") ?? ""}`.toLowerCase();
  if (blockedReason || stringAt(record, "previewType") === "blocked_research_preview") return "blockedPendingEvidence";
  if (title.includes("stale") || title.includes("duplicate") || title.includes("unclear") || title.includes("not worth")) return "rejectOrDefer";
  if (stringAt(record, "section") === "monitorOnly") return "monitorOnly";
  if (needsDannyApproval) return "needsDannyApproval";
  if (riskAt(record, "riskLevel", "medium") === "low") return "safeToDraftOnly";
  return "readyForReview";
}

function decisionFor(section: ApprovalSection, record: unknown): DecisionType {
  if (section === "blockedPendingEvidence") return "approve_to_research";
  if (stringAt(record, "previewType") === "evidence_checklist_preview" || stringAt(record, "draftType") === "evidence_checklist") return "approve_to_research";
  if (section === "rejectOrDefer") return stringAt(record, "statusStage") === "detected" ? "defer" : "reject";
  if (section === "monitorOnly") return "monitor";
  if (section === "safeToDraftOnly") return "approve_to_draft";
  if (section === "needsDannyApproval") {
    return stringAt(record, "previewType") ? "approve_to_draft" : "approve_to_prepare_preview";
  }
  return "review";
}

function decisionQuestion(section: ApprovalSection, title: string): string {
  switch (section) {
    case "needsDannyApproval":
      return `Should Danny approve the next draft/research step for "${title}"?`;
    case "blockedPendingEvidence":
      return `What evidence or risk check is required before "${title}" can move forward?`;
    case "safeToDraftOnly":
      return `Is "${title}" safe to keep as draft-only work?`;
    case "rejectOrDefer":
      return `Should "${title}" be rejected or deferred for now?`;
    case "monitorOnly":
      return `Should "${title}" stay monitor-only today?`;
    case "readyForReview":
      return `Is "${title}" ready for human review?`;
  }
}

function recommendedDecisionFor(section: ApprovalSection, decisionType: DecisionType): string {
  switch (section) {
    case "needsDannyApproval":
      return `Recommended decision type: ${decisionType}. This is not approval; Danny must decide before next steps.`;
    case "blockedPendingEvidence":
      return "Keep blocked pending evidence/safety review; approve only research if needed.";
    case "safeToDraftOnly":
      return "Safe to keep as draft-only work after human review; do not apply.";
    case "rejectOrDefer":
      return "Reject or defer until the signal is clearer, fresher, or lower risk.";
    case "monitorOnly":
      return "Monitor only; no action today.";
    case "readyForReview":
      return "Review locally before any draft-only next step.";
  }
}

function approvalWarningFor(record: unknown, needsDannyApproval: boolean, blockedReason?: string): string | undefined {
  if (blockedReason) return "Blocked item: do not draft, apply, or publish until evidence and safety checks are complete.";
  if (!needsDannyApproval) return undefined;
  if (isSensitive(record)) return "Sensitive item: affiliate, scam/fraud, trust/rating, legal/policy, or high-risk wording requires Danny approval.";
  return "Danny approval required before any next step. This queue does not grant approval.";
}

function commandQueueItems(report: unknown): unknown[] {
  return ["readyForReview", "safeDraftsReady", "needsDannyApproval", "blockedRiskyItems", "monitorOnly", "moneyOpportunities"]
    .flatMap((section) => arrayAt(report, section));
}

function departmentAt(record: unknown, agentRegistry: unknown): Department | undefined {
  const direct = stringAt(record, "department");
  if (isDepartment(direct)) return direct;
  const sourceReport = stringAt(record, "sourceReport");
  const agent = arrayAt(agentRegistry, "agents").find((candidate) => arrayAt(candidate, "outputReports").some((output) => typeof output === "string" && sourceReport && output.includes(sourceReport)));
  const department = stringAt(agent, "department");
  return isDepartment(department) ? department : undefined;
}

function isSensitive(record: unknown): boolean {
  const text = [
    stringAt(record, "title"),
    stringAt(record, "previewType"),
    stringAt(record, "draftType"),
    stringAt(record, "decisionType"),
    stringAt(record, "sourceReport"),
    stringAt(record, "evidenceSummary"),
    stringAt(record, "rationale"),
    stringAt(record, "blockedReason"),
    stringAt(record, "proposedValueSummary"),
  ].filter(Boolean).join(" ").toLowerCase();
  return riskAt(record, "riskLevel", "low") === "high"
    || text.includes("affiliate")
    || text.includes("scam")
    || text.includes("fraud")
    || text.includes("trust rating")
    || text.includes("legal")
    || text.includes("policy")
    || text.includes("blocked");
}

function dedupeItems(items: ApprovalItem[]): ApprovalItem[] {
  const seen = new Set<string>();
  const output: ApprovalItem[] = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      output.push(item);
    }
  }
  return output;
}

function renderMarkdown(report: {
  generatedAt: string;
  approvalQueueVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  summaryCounts: Record<string, number>;
  approvalCounts: Record<string, number>;
  readyForReview: ApprovalItem[];
  needsDannyApproval: ApprovalItem[];
  blockedPendingEvidence: ApprovalItem[];
  safeToDraftOnly: ApprovalItem[];
  rejectOrDefer: ApprovalItem[];
  monitorOnly: ApprovalItem[];
  safetyNotes: string[];
}): string {
  return [
    "# Approval Queue v1",
    "",
    "## Approval Queue Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Approval queue version: ${report.approvalQueueVersion}`,
    `Reports read: ${report.sourceReportsRead.length}`,
    `Missing reports: ${report.missingReports.length}`,
    `Items queued: ${report.summaryCounts.itemCount}`,
    `Approved count: ${report.approvalCounts.approvedCount}`,
    `Applied count: ${report.approvalCounts.appliedCount}`,
    `Can auto apply: ${report.approvalCounts.canAutoApplyCount}`,
    "",
    "## Ready for Review",
    "",
    renderItems(report.readyForReview),
    "",
    "## Needs Danny Approval",
    "",
    renderItems(report.needsDannyApproval),
    "",
    "## Blocked Pending Evidence",
    "",
    renderItems(report.blockedPendingEvidence),
    "",
    "## Safe to Draft Only",
    "",
    renderItems(report.safeToDraftOnly),
    "",
    "## Reject or Defer",
    "",
    renderItems(report.rejectOrDefer),
    "",
    "## Monitor Only",
    "",
    renderItems(report.monitorOnly),
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
    "- Review each decision question; do not treat recommended decisions as actual approvals.",
    "- Keep blocked items blocked until evidence and safety checks are complete.",
    "- Keep all output local and draft/planning-only.",
    "- Do not publish, apply, create patches, create update payloads, or write to Supabase.",
  ].join("\n");
}

function renderItems(items: ApprovalItem[]): string {
  if (items.length === 0) return "No items in this section from the available local reports.";
  return items.map((item) => [
    `- ${item.title}`,
    `  - Decision: ${item.decisionType}`,
    `  - Risk/stage: ${item.riskLevel} / ${item.statusStage}`,
    `  - Danny approval: ${item.needsDannyApproval}`,
    `  - Question: ${item.decisionQuestion}`,
  ].join("\n")).join("\n");
}

function safeStage(value?: string): StatusStage {
  if (value === "suspected" || value === "recommended") return value;
  return "detected";
}

function arrayAt(record: unknown, ...path: (string | number)[]): unknown[] {
  const value = valueAt(record, path);
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

function countBy<T, K extends string>(items: T[], getKey: (item: T) => K, keys: K[]): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
  for (const item of items) counts[getKey(item)] += 1;
  return counts;
}

function idFor(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 150);
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
  buildApprovalQueue().catch((error) => {
    logger.error("Approval queue failed", { error });
    process.exitCode = 1;
  });
}
