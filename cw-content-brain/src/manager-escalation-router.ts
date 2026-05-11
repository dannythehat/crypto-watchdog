import { isDirectRun, readJson, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type ManagerName =
  | "Content AI Manager"
  | "SEO AI Manager"
  | "Research AI Manager"
  | "Affiliates AI Manager"
  | "Trust & Safety AI Manager"
  | "Social AI Manager"
  | "Quality Control Manager"
  | "Master AI Manager"
  | "Danny";

type Stage = "detected" | "suspected" | "verified" | "recommended";
type Priority = "low" | "medium" | "high" | "urgent";
type Confidence = "low" | "medium" | "high" | "unknown";

interface SourceReport {
  name: string;
  path: string;
}

interface RouteDefinition {
  id: string;
  fromManager: ManagerName;
  toManager: ManagerName;
  routePurpose: string;
  safetyNote: string;
}

interface SourceItem {
  sourceReport: string;
  sourceItemId?: string;
  title: string;
  department?: string;
  record: unknown;
  text: string;
}

interface EscalationItem {
  id: string;
  sourceReport: string;
  sourceItemId?: string;
  detectedIssue: string;
  currentStage: Stage;
  fromManager: ManagerName;
  toManager: ManagerName;
  routeReason: string;
  recommendedAction: string;
  priority: Priority;
  confidence: Confidence;
  requiresDannyDecision: boolean;
  canAutoApply: false;
  approved: false;
  applied: false;
}

const outputJson = "data/reports/manager_escalation_router_report.json";
const outputMd = "data/reports/manager_escalation_router_report.md";

const inputReports: SourceReport[] = [
  { name: "quality_control_report", path: "data/reports/quality_control_report.json" },
  { name: "approval_queue_report", path: "data/reports/approval_queue_report.json" },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json" },
  { name: "master_daily_brief", path: "data/reports/master_daily_brief.json" },
];

const routeDefinitions: RouteDefinition[] = [
  {
    id: "content-to-seo",
    fromManager: "Content AI Manager",
    toManager: "SEO AI Manager",
    routePurpose: "Search intent, metadata usefulness, internal-link fit, or cannibalisation review.",
    safetyNote: "SEO review is advisory only and cannot approve or apply changes.",
  },
  {
    id: "content-to-research",
    fromManager: "Content AI Manager",
    toManager: "Research AI Manager",
    routePurpose: "Evidence gap, topic overlap, or update-existing-page review before drafting.",
    safetyNote: "Research review cannot verify live claims in v1 and cannot publish.",
  },
  {
    id: "seo-to-qc",
    fromManager: "SEO AI Manager",
    toManager: "Quality Control Manager",
    routePurpose: "Generic metadata, weak usefulness, noisy SEO queue items, or confidence concerns.",
    safetyNote: "QC can request revision or escalation only; it cannot approve.",
  },
  {
    id: "affiliates-to-trust-safety",
    fromManager: "Affiliates AI Manager",
    toManager: "Trust & Safety AI Manager",
    routePurpose: "Affiliate placement, offer, CTA, or monetisation risk near sensitive content.",
    safetyNote: "Affiliate risk stays blocked or approval-only until human review.",
  },
  {
    id: "research-to-content",
    fromManager: "Research AI Manager",
    toManager: "Content AI Manager",
    routePurpose: "Existing page update or supporting-article decision after research review.",
    safetyNote: "Research can recommend draft direction only.",
  },
  {
    id: "social-to-trust-safety",
    fromManager: "Social AI Manager",
    toManager: "Trust & Safety AI Manager",
    routePurpose: "Sensitive user, scam-recovery, legal, or reputation-risk replies.",
    safetyNote: "Social replies must not make unsupported claims or financial promises.",
  },
  {
    id: "qc-to-master",
    fromManager: "Quality Control Manager",
    toManager: "Master AI Manager",
    routePurpose: "Cross-department disagreement, unclear risk, unsafe stage, or auto-apply safety issue.",
    safetyNote: "Master AI can prioritise, but not approve or apply.",
  },
  {
    id: "master-to-danny",
    fromManager: "Master AI Manager",
    toManager: "Danny",
    routePurpose: "Clean, important human decision after manager review.",
    safetyNote: "Only Danny can make real approval decisions; this report does not record approval.",
  },
];

export async function buildManagerEscalationRouter(): Promise<EscalationItem[]> {
  const { reports, sourceReportsRead, missingInputs } = await loadInputReports();
  const sourceItems = collectSourceItems(reports);
  const escalationItems = dedupeEscalations(sourceItems.map(routeItem)).slice(0, 100);
  const managerSummary = buildManagerSummary(escalationItems);
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "2P",
    name: "Manager Escalation Router v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    missingInputs,
    sourceReportsRead,
    routeDefinitions,
    escalationItems,
    managerSummary,
    safetyChecks: {
      itemCount: escalationItems.length,
      canAutoApplyCount: countText(JSON.stringify(escalationItems), "\"canAutoApply\":true"),
      approvedItemCount: escalationItems.filter((item) => item.approved).length,
      appliedItemCount: escalationItems.filter((item) => item.applied).length,
      approvedStageCount: countUnsafeStages(reports),
      rawAffiliateUrlCount: countRawAffiliateUrlSignals(reports),
      routeDefinitionsCount: routeDefinitions.length,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Manager escalation router report written", {
    sourceReportsRead: sourceReportsRead.length,
    missingInputs: missingInputs.length,
    escalationItems: escalationItems.length,
    outputJson,
    outputMd,
  });
  return escalationItems;
}

async function loadInputReports(): Promise<{ reports: Map<string, unknown>; sourceReportsRead: string[]; missingInputs: string[] }> {
  const reports = new Map<string, unknown>();
  const sourceReportsRead: string[] = [];
  const missingInputs: string[] = [];
  for (const source of inputReports) {
    try {
      reports.set(source.name, await readJson<unknown>(source.path));
      sourceReportsRead.push(source.name);
    } catch {
      missingInputs.push(source.path);
    }
  }
  return { reports, sourceReportsRead, missingInputs };
}

function collectSourceItems(reports: Map<string, unknown>): SourceItem[] {
  const output: SourceItem[] = [];
  for (const [sourceReport, report] of reports.entries()) {
    for (const record of recordsForReport(sourceReport, report)) {
      output.push({
        sourceReport,
        sourceItemId: firstString(record, ["id", "sourceItemId", "sourceQueueItemId", "sourceDraftId", "sourcePreviewId"]),
        title: firstString(record, ["sourceTitle", "title", "detectedIssue", "department", "id"]) ?? `${sourceReport} item`,
        department: stringAt(record, "department"),
        record,
        text: JSON.stringify(sanitiseForText(record)).toLowerCase(),
      });
    }
  }
  return output;
}

function recordsForReport(sourceReport: string, report: unknown): unknown[] {
  if (sourceReport === "quality_control_report") return listItems(report, "findings");
  if (sourceReport === "approval_queue_report") {
    return ["readyForReview", "needsDannyApproval", "blockedPendingEvidence", "safeToDraftOnly", "rejectOrDefer", "monitorOnly"].flatMap((key) => listItems(report, key));
  }
  if (sourceReport === "master_command_queue") {
    return ["safeDraftsReady", "needsDannyApproval", "blockedRiskyItems", "monitorOnly", "performanceChanges", "moneyOpportunities", "topPriorities"].flatMap((key) => listItems(report, key));
  }
  if (sourceReport === "master_daily_brief") {
    return listItems(report, "topThreePriorities")
      .concat(listItems(report, "managerBriefs"))
      .concat(listItems(report, "blockedUntilDannyDecides"));
  }
  if (sourceReport === "agent_registry_report") return listItems(report, "agents");
  return [];
}

function routeItem(item: SourceItem): EscalationItem {
  const route = chooseRoute(item);
  const currentStage = stageFor(item.record, item.text);
  const priority = priorityFor(item.text, route.toManager);
  const confidence = confidenceFor(item.record, item.text);
  const requiresDannyDecision = route.toManager === "Danny" || booleanAt(item.record, "needsDannyApproval") || /"needsdannyapproval":true|danny approval: true/.test(item.text);
  return {
    id: idFor("route", item.sourceReport, item.sourceItemId ?? item.title, route.fromManager, route.toManager),
    sourceReport: item.sourceReport,
    sourceItemId: item.sourceItemId,
    detectedIssue: detectedIssueFor(item),
    currentStage,
    fromManager: route.fromManager,
    toManager: route.toManager,
    routeReason: route.reason,
    recommendedAction: recommendedActionFor(route.toManager, currentStage, requiresDannyDecision),
    priority,
    confidence,
    requiresDannyDecision,
    canAutoApply: false,
    approved: false,
    applied: false,
  };
}

function chooseRoute(item: SourceItem): { fromManager: ManagerName; toManager: ManagerName; reason: string } {
  const text = item.text;
  const fromManager = managerFromItem(item);
  const explicitToRaw = stringAt(item.record, "recommendedManagerEscalation");
  const explicitTo = managerName(explicitToRaw);
  if (explicitTo) {
    if (explicitTo === fromManager) {
      return {
        fromManager,
        toManager: fromManager === "Quality Control Manager" ? "Master AI Manager" : "Quality Control Manager",
        reason: "The initial manager already owns this item, so route sideways for independent review.",
      };
    }
    if (explicitTo === "Affiliates AI Manager" && /affiliate|offer|cta|commission|monetisation|monetization|money/.test(text)) {
      return {
        fromManager: "Affiliates AI Manager",
        toManager: "Trust & Safety AI Manager",
        reason: "Affiliate or offer routing should move sideways to Trust & Safety before further escalation.",
      };
    }
    return {
      fromManager,
      toManager: explicitTo === "Danny" ? "Master AI Manager" : explicitTo,
      reason: explicitTo === "Danny"
        ? "Item requests a Danny decision, so route through the Master AI Manager first."
        : "Quality Control already recommended this manager escalation.",
    };
  }
  if (/canautoapply.*true|auto_apply_issue|approved|applied|unsafe_stage/.test(text)) {
    return { fromManager: "Quality Control Manager", toManager: "Master AI Manager", reason: "Unsafe automation or stage language must be reviewed before any human escalation." };
  }
  if (/affiliate|offer|cta|commission|monetisation|monetization|money/.test(text)) {
    return { fromManager: "Affiliates AI Manager", toManager: "Trust & Safety AI Manager", reason: "Affiliate or offer risk should be reviewed by Trust & Safety before escalation." };
  }
  if (/legal|policy|privacy|terms|trust|rating|scam|fraud|warning|red rating|financial advice/.test(text)) {
    return { fromManager, toManager: "Trust & Safety AI Manager", reason: "Safety, legal, trust, warning, or claim-sensitive wording needs safety review." };
  }
  if (/duplicate|cannibal|same_search_intent|search intent|metadata|internal link|seo|generic_or_low_value/.test(text)) {
    return fromManager === "SEO AI Manager"
      ? { fromManager, toManager: "Quality Control Manager", reason: "SEO output looks generic or confidence-sensitive and needs QC review." }
      : { fromManager, toManager: "SEO AI Manager", reason: "Search intent, metadata, internal-link, or cannibalisation signal needs SEO manager review." };
  }
  if (/evidence|research|unsupported|needs verification|suspected|confidence/.test(text)) {
    return { fromManager, toManager: "Research AI Manager", reason: "Evidence or confidence is incomplete, so route to Research before recommendation." };
  }
  if (/daily brief|master command|top priority|high priority|urgent|danny/.test(text)) {
    if (fromManager === "Master AI Manager") {
      return { fromManager, toManager: "Quality Control Manager", reason: "Master-level item needs independent QC before any Danny-facing summary." };
    }
    return { fromManager, toManager: "Master AI Manager", reason: "High-priority command item should be summarised by the Master AI Manager before Danny." };
  }
  if (fromManager === "Research AI Manager") {
    return { fromManager, toManager: "Content AI Manager", reason: "Research output may require an existing page update or supporting draft decision." };
  }
  return { fromManager, toManager: "Quality Control Manager", reason: "Default route for usefulness, duplication, and safety screening before escalation." };
}

function managerFromItem(item: SourceItem): ManagerName {
  const department = item.department;
  if (department === "Content") return "Content AI Manager";
  if (department === "SEO") return "SEO AI Manager";
  if (department === "Research") return "Research AI Manager";
  if (department === "Affiliates") return "Affiliates AI Manager";
  if (department === "Trust & Safety") return "Trust & Safety AI Manager";
  if (department === "Social") return "Social AI Manager";
  if (department === "Command") return "Master AI Manager";
  if (department === "Approvals") return "Quality Control Manager";
  if (item.sourceReport === "quality_control_report") return "Quality Control Manager";
  if (item.sourceReport === "master_daily_brief" || item.sourceReport === "master_command_queue") return "Master AI Manager";
  return "Content AI Manager";
}

function managerName(value: string | undefined): ManagerName | undefined {
  if (value === "Content AI Manager" || value === "SEO AI Manager" || value === "Research AI Manager" || value === "Affiliates AI Manager" || value === "Trust & Safety AI Manager" || value === "Social AI Manager" || value === "Quality Control Manager" || value === "Master AI Manager" || value === "Danny") return value;
  if (value === "Approvals AI Manager") return "Quality Control Manager";
  return undefined;
}

function detectedIssueFor(item: SourceItem): string {
  return cleanText(firstString(item.record, ["issueType", "qcStatus", "decisionType", "section", "detectedIssue", "sourceTitle", "title"]) ?? item.title);
}

function stageFor(record: unknown, text: string): Stage {
  const raw = `${stringAt(record, "currentStage") ?? ""} ${stringAt(record, "statusStage") ?? ""} ${stringAt(record, "detectedStage") ?? ""}`.toLowerCase();
  if (raw.includes("recommended")) return "recommended";
  if (raw.includes("verified") && /evidence|rendered|verified/.test(text)) return "verified";
  if (raw.includes("suspected") || /suspected|low confidence|missing evidence|needs verification|monitor/.test(text)) return "suspected";
  return "detected";
}

function priorityFor(text: string, toManager: ManagerName): Priority {
  if (/urgent|high risk|high-risk|blocked|unsafe|canautoapply|approved|applied|raw affiliate|scam|fraud|legal|financial advice/.test(text)) return "urgent";
  if (toManager === "Master AI Manager" || toManager === "Danny" || /high|needs danny|approval/.test(text)) return "high";
  if (/medium|revision|generic|duplicate|cannibal|affiliate|trust|safety/.test(text)) return "medium";
  return "low";
}

function confidenceFor(record: unknown, text: string): Confidence {
  const direct = stringAt(record, "confidence");
  if (direct === "low" || direct === "medium" || direct === "high") return direct;
  if (/low confidence|unknown confidence|missing evidence|needs verification/.test(text)) return "low";
  if (/verified|rendered|evidence/.test(text)) return "medium";
  return "unknown";
}

function recommendedActionFor(toManager: ManagerName, stage: Stage, requiresDannyDecision: boolean): string {
  if (requiresDannyDecision && toManager === "Master AI Manager") return "Route to the Master AI Manager for summarisation before Danny decides; do not approve or apply.";
  if (requiresDannyDecision) return `Send to ${toManager} first, then route through the Master AI Manager before Danny decides.`;
  if (stage === "detected" || stage === "suspected") return `Send to ${toManager} for verification or revision before recommendation.`;
  return `Send to ${toManager} for manager review; keep the item recommendation-only.`;
}

function buildManagerSummary(items: EscalationItem[]): Array<{ manager: ManagerName; incomingCount: number; dannyDecisionCount: number; highestPriority: Priority }> {
  const managers = Array.from(new Set(items.map((item) => item.toManager)));
  return managers.map((manager) => {
    const incoming = items.filter((item) => item.toManager === manager);
    return {
      manager,
      incomingCount: incoming.length,
      dannyDecisionCount: incoming.filter((item) => item.requiresDannyDecision).length,
      highestPriority: highestPriority(incoming.map((item) => item.priority)),
    };
  });
}

function highestPriority(priorities: Priority[]): Priority {
  if (priorities.includes("urgent")) return "urgent";
  if (priorities.includes("high")) return "high";
  if (priorities.includes("medium")) return "medium";
  return "low";
}

function renderMarkdown(report: {
  generatedAt: string;
  name: string;
  safetyMode: string;
  canAutoApply: false;
  approvedCount: 0;
  appliedCount: 0;
  missingInputs: string[];
  sourceReportsRead: string[];
  routeDefinitions: RouteDefinition[];
  escalationItems: EscalationItem[];
  managerSummary: Array<{ manager: ManagerName; incomingCount: number; dannyDecisionCount: number; highestPriority: Priority }>;
  safetyChecks: Record<string, unknown>;
}): string {
  const priorityItems = report.escalationItems.filter((item) => item.priority === "urgent" || item.priority === "high").slice(0, 30);
  const dannyItems = report.escalationItems.filter((item) => item.requiresDannyDecision).slice(0, 20);
  return [
    `# ${report.name}`,
    "",
    "## Safety Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Safety mode: ${report.safetyMode}`,
    `canAutoApply: ${report.canAutoApply}`,
    `approvedCount: ${report.approvedCount}`,
    `appliedCount: ${report.appliedCount}`,
    "This is read-only/report-only. Nothing has been approved, applied, published, patched, or written to Supabase.",
    "",
    "## Missing Inputs",
    "",
    report.missingInputs.length ? report.missingInputs.map((input) => `- ${input}`).join("\n") : "No configured inputs were missing.",
    "",
    "## Source Reports Read",
    "",
    report.sourceReportsRead.length ? report.sourceReportsRead.map((name) => `- ${name}`).join("\n") : "No source reports were available.",
    "",
    "## Route Summary",
    "",
    report.managerSummary.length ? report.managerSummary.map((item) => `- ${item.manager}: ${item.incomingCount} incoming route(s), ${item.dannyDecisionCount} Danny decision candidate(s), highest priority ${item.highestPriority}.`).join("\n") : "No escalation routes were generated.",
    "",
    "## Route Definitions",
    "",
    report.routeDefinitions.map((route) => `- ${route.fromManager} -> ${route.toManager}: ${route.routePurpose}`).join("\n"),
    "",
    "## Priority Escalation Table",
    "",
    renderTable(priorityItems),
    "",
    "## Danny Decision Items",
    "",
    dannyItems.length ? renderTable(dannyItems) : "No Danny decision items were routed directly in this report. Items that need Danny should pass through the Master AI Manager first.",
    "",
    "## Safety Checks",
    "",
    Object.entries(report.safetyChecks).map(([key, value]) => `- ${key}: ${value}`).join("\n"),
    "",
    "## Final Safety Note",
    "",
    "This router only recommends manager-to-manager routing. It never creates approved/applied states, patch files, update payloads, Supabase writes, live edits, or publishing actions.",
  ].join("\n");
}

function renderTable(items: EscalationItem[]): string {
  if (items.length === 0) return "No priority escalation items from the available local reports.";
  const rows = items.map((item) => `| ${escapeCell(item.priority)} | ${escapeCell(item.currentStage)} | ${escapeCell(item.fromManager)} | ${escapeCell(item.toManager)} | ${escapeCell(item.detectedIssue)} | ${escapeCell(item.recommendedAction)} |`);
  return ["| Priority | Stage | From | To | Issue | Recommended action |", "| --- | --- | --- | --- | --- | --- |", ...rows].join("\n");
}

function escapeCell(value: string): string {
  return cleanText(value).replace(/\|/g, "/");
}

function countUnsafeStages(reports: Map<string, unknown>): number {
  return [...reports.values()].reduce<number>((count, report) => count + countUnsafeStageValues(report), 0);
}

function countRawAffiliateUrlSignals(reports: Map<string, unknown>): number {
  return [...reports.values()].reduce<number>((count, report) => count + (/affiliateUrl|https?:\/\/[^\s"<>]*(affiliate|aff|ref=|referral|utm_|partner|click|track)/i.test(JSON.stringify(report ?? {})) ? 1 : 0), 0);
}

function countUnsafeStageValues(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((count, item) => count + countUnsafeStageValues(item), 0);
  if (!isRecord(value)) return 0;
  const stageValues = ["statusStage", "currentStage", "detectedStage", "stage"]
    .map((key) => stringAt(value, key)?.toLowerCase())
    .filter(Boolean);
  const ownCount = stageValues.filter((stage) => stage === "approved" || stage === "applied").length;
  return ownCount + Object.values(value).reduce<number>((count, item) => count + countUnsafeStageValues(item), 0);
}

function sanitiseForText(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitiseForText);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (key === "safetyNotes" || key === "disclaimer") return [key, "[safety boilerplate hidden]"];
    if (/affiliateUrl/i.test(key)) return [key, "[raw affiliate url hidden]"];
    if (typeof entry === "string" && /https?:\/\/[^\s"<>]*(affiliate|aff|ref=|referral|utm_|partner|click|track)[^\s"<>]*/i.test(entry)) {
      return [key, "[raw affiliate url hidden]"];
    }
    return [key, sanitiseForText(entry)];
  }));
}

function listItems(record: unknown, key: string): unknown[] {
  const value = valueAt(record, [key]);
  return Array.isArray(value) ? value : [];
}

function firstString(record: unknown, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = stringAt(record, key);
    if (value) return value;
  }
  return undefined;
}

function stringAt(record: unknown, ...path: (string | number)[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function booleanAt(record: unknown, ...path: (string | number)[]): boolean {
  const value = valueAt(record, path);
  return typeof value === "boolean" ? value : false;
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

function dedupeEscalations(items: EscalationItem[]): EscalationItem[] {
  const seen = new Set<string>();
  const output: EscalationItem[] = [];
  for (const item of items) {
    const key = `${item.sourceReport}:${item.sourceItemId ?? item.detectedIssue}:${item.fromManager}:${item.toManager}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }
  return output.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

function priorityWeight(priority: Priority): number {
  return priority === "urgent" ? 4 : priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function countText(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function idFor(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 180);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  buildManagerEscalationRouter().catch((error) => {
    logger.error("Manager escalation router failed", { error });
    process.exitCode = 1;
  });
}
