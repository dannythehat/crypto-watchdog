import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type DepartmentStatus = "not_started" | "partial" | "active" | "future_only";
type Priority = "high" | "medium" | "low";

interface SourceInput {
  name: string;
  path: string;
  required: boolean;
}

interface DepartmentRoadmap {
  departmentId: string;
  departmentName: string;
  currentStatus: DepartmentStatus;
  purpose: string;
  existingCapabilities: string[];
  missingCapabilities: string[];
  plannedManagerAgent: string;
  plannedWorkerAgents: string[];
  dashboardTabRequired: boolean;
  dashboardDataAvailable: boolean;
  requiresHumanApprovalFor: string[];
  neverAllowedToDo: string[];
  suggestedBuildPhase: string;
  priority: Priority;
  canAutoApply: false;
}

const outputJson = "data/reports/department_roadmap_and_agent_coverage.json";
const outputMd = "data/reports/department_roadmap_and_agent_coverage.md";

const inputs: SourceInput[] = [
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json", required: true },
  { name: "daily_report_pack", path: "data/reports/daily_report_pack.json", required: true },
  { name: "dashboard_contract_validation_report", path: "data/reports/dashboard_contract_validation_report.json", required: true },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json", required: false },
  { name: "quality_control_report", path: "data/reports/quality_control_report.json", required: false },
  { name: "manager_escalation_router_report", path: "data/reports/manager_escalation_router_report.json", required: false },
  { name: "dashboard_overview", path: "data/dashboard/overview.json", required: false },
  { name: "dashboard_agents", path: "data/dashboard/agents.json", required: false },
  { name: "dashboard_command", path: "data/dashboard/command.json", required: false },
];

const humanApprovalRules = [
  "Publishing, live edits, and apply workflows require Danny approval.",
  "Affiliate placements, offer claims, and revenue-impacting CTAs require Danny approval.",
  "Trust ratings, risk labels, scam/fraud wording, and legal/policy wording require human evidence review.",
  "High-risk recommendations must be reviewed by Trust & Safety or Quality Control before Danny sees them.",
  "Future safe-apply work must remain disabled until an explicit approval workflow exists.",
];

const neverAllowedRules = [
  "No Supabase writes from this planning layer.",
  "No publishing or live-site edits.",
  "No patch files or update payloads.",
  "No approved or applied states.",
  "No raw affiliate links or secrets in generated reports.",
  "No trust rating changes or scam/fraud accusations without evidence review.",
  "No canAutoApply true in v1 planning outputs.",
];

export async function buildDepartmentRoadmap(): Promise<unknown> {
  const loaded = await loadInputs();
  const departments = buildDepartments(loaded.reports);
  const coverageSummary = buildCoverageSummary(departments);
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "2U",
    name: "Watchdog HQ Department Roadmap & Agent Coverage Map v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputsRead: loaded.sourceInputsRead,
    missingOptionalInputs: loaded.missingOptionalInputs,
    missingRequiredInputs: loaded.missingRequiredInputs,
    departments,
    coverageSummary,
    nextRecommendedBuildOrder: nextBuildOrder(departments),
    humanApprovalRules,
    neverAllowedRules,
    safetyChecks: {
      reportOnly: true,
      planningOnly: true,
      noLiveWrites: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noPatchFiles: true,
      noUpdatePayloads: true,
      noApprovedState: true,
      noAppliedState: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Department roadmap and agent coverage report written", {
    departmentCount: departments.length,
    sourceInputsRead: loaded.sourceInputsRead.length,
    missingOptionalInputs: loaded.missingOptionalInputs.length,
    outputJson,
    outputMd,
  });
  return report;
}

async function loadInputs(): Promise<{
  reports: Map<string, unknown>;
  sourceInputsRead: string[];
  missingOptionalInputs: string[];
  missingRequiredInputs: string[];
}> {
  const reports = new Map<string, unknown>();
  const sourceInputsRead: string[] = [];
  const missingOptionalInputs: string[] = [];
  const missingRequiredInputs: string[] = [];
  for (const input of inputs) {
    const path = fromRoot(input.path);
    if (!existsSync(path)) {
      if (input.required) missingRequiredInputs.push(input.path);
      else missingOptionalInputs.push(input.path);
      continue;
    }
    reports.set(input.name, JSON.parse(await readFile(path, "utf8")) as unknown);
    sourceInputsRead.push(input.name);
  }
  return { reports, sourceInputsRead, missingOptionalInputs, missingRequiredInputs };
}

function buildDepartments(reports: Map<string, unknown>): DepartmentRoadmap[] {
  const agentText = JSON.stringify(reports.get("agent_registry_report") ?? {}).toLowerCase();
  const dashboardTabs = new Set(["overview", "agents", "command"].filter((name) => reports.has(`dashboard_${name}`)));
  const dashboardContractPassed = stringAt(reports.get("dashboard_contract_validation_report"), "validationStatus") === "passed";
  const hasReportPack = reports.has("daily_report_pack");
  const hasCommandQueue = reports.has("master_command_queue");
  const hasQc = reports.has("quality_control_report");
  const hasEscalations = reports.has("manager_escalation_router_report");

  const defs: Array<Omit<DepartmentRoadmap, "currentStatus" | "dashboardDataAvailable" | "canAutoApply"> & { signals: string[]; futureOnly?: boolean; dashboardTabId?: string }> = [
    {
      departmentId: "command",
      departmentName: "Command",
      purpose: "Turn manager and worker-agent outputs into Danny's daily command view.",
      existingCapabilities: ["Master Command Queue", "Daily Brief", "Daily Run Orchestrator", "Daily Report Pack"],
      missingCapabilities: ["Calendar-aware daily priority shaping", "Saved decision history", "Dashboard UI tab"],
      plannedManagerAgent: "Command AI Manager",
      plannedWorkerAgents: ["Master AI Manager", "Priority Action Queue Agent", "Human Decision Pack Agent"],
      dashboardTabRequired: true,
      dashboardTabId: "command",
      requiresHumanApprovalFor: ["Top priorities", "Publishing decisions", "High-risk action queue items"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3A",
      priority: "high",
      signals: ["command", "master ai manager", "priority action"],
    },
    {
      departmentId: "content",
      departmentName: "Content",
      purpose: "Improve existing reviews, warnings, guides, and page structure through draft-only suggestions.",
      existingCapabilities: ["Metadata drafts", "Fix drafts", "Preview diffs", "Content quality checks"],
      missingCapabilities: ["Section-specific refresh drafts", "Missing-section detection", "Full article brief workflow"],
      plannedManagerAgent: "Content AI Manager",
      plannedWorkerAgents: ["Content Refresh Draft Agent", "Review Update Agent", "Missing Section Agent", "Evidence Gap Agent", "Tone & Claims Guard Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Live content edits", "Claims changes", "Review page changes"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3B",
      priority: "high",
      signals: ["content", "metadata", "fix draft", "preview"],
    },
    {
      departmentId: "seo",
      departmentName: "SEO",
      purpose: "Find metadata, internal-link, schema, search-intent, and content-decay opportunities.",
      existingCapabilities: ["SEO Intelligence Brain", "Metadata Engine", "Internal Link Placement Brain", "Search Console local import"],
      missingCapabilities: ["Schema suggestions", "Search intent clustering", "Content decay analysis"],
      plannedManagerAgent: "SEO AI Manager",
      plannedWorkerAgents: ["Keyword Gap Agent", "Metadata Agent", "Internal Link Agent", "Schema Agent", "Content Decay Agent", "Search Intent Agent", "Cannibalisation Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Search-intent rewrites", "Canonical recommendations", "Metadata changes to sensitive pages"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3C",
      priority: "high",
      signals: ["seo", "metadata", "internal link", "search console"],
    },
    {
      departmentId: "affiliates",
      departmentName: "Affiliates",
      purpose: "Plan safe affiliate placements without harming trust or warning-page safety.",
      existingCapabilities: ["Affiliate Vault", "Affiliate Placement Brain", "Affiliate safety checks"],
      missingCapabilities: ["Commission opportunity scoring", "Manual approval exception records", "CTA performance feedback loop"],
      plannedManagerAgent: "Affiliates AI Manager",
      plannedWorkerAgents: ["Affiliate Placement Brain", "Commission Opportunity Agent", "Affiliate Safety Guard Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Affiliate CTA placement", "Warning-page exceptions", "Offer wording"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3D",
      priority: "high",
      signals: ["affiliate", "cta", "commission"],
    },
    {
      departmentId: "offers-deals",
      departmentName: "Offers / Deals",
      purpose: "Track offer status, expiry, freshness, and deal safety before any CTA is drafted.",
      existingCapabilities: ["Offer Expiry / Deal Tracker", "Stale offer checks"],
      missingCapabilities: ["Offer source verification", "Renewal reminders", "Deal calendar"],
      plannedManagerAgent: "Affiliates AI Manager",
      plannedWorkerAgents: ["Offer Monitoring Agent", "Deal Expiry Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Renewed offer claims", "Expired offer removal decisions", "Disclosure wording"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3D",
      priority: "high",
      signals: ["offer", "deal", "expiry"],
    },
    {
      departmentId: "backlinks",
      departmentName: "Backlinks",
      purpose: "Plan backlink prospecting, mentions, outreach drafts, and broken-link opportunities.",
      existingCapabilities: ["Planned in Agent Registry"],
      missingCapabilities: ["Backlink profile import", "Prospect scoring", "Outreach drafting", "Mention monitoring"],
      plannedManagerAgent: "Backlinks AI Manager",
      plannedWorkerAgents: ["Backlink Prospect Agent", "Outreach Draft Agent", "Mention Monitoring Agent", "Broken Link Opportunity Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Outreach messages", "Partnership claims", "Public-facing pitches"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 4A",
      priority: "medium",
      signals: ["backlink", "outreach", "mention"],
    },
    {
      departmentId: "analytics",
      departmentName: "Analytics",
      purpose: "Turn local GA4 and Search Console exports into performance review prompts.",
      existingCapabilities: ["GA4 local import", "Search Console local import", "Dashboard analytics export"],
      missingCapabilities: ["Trend baselines", "Revenue attribution", "Conversion quality scoring"],
      plannedManagerAgent: "Analytics AI Manager",
      plannedWorkerAgents: ["Traffic Change Agent", "Conversion Signal Agent", "Revenue Signal Agent", "Page Performance Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Conversion conclusions", "Revenue decisions", "Major content reprioritisation"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3E",
      priority: "high",
      signals: ["analytics", "ga4", "traffic", "conversion"],
    },
    {
      departmentId: "research",
      departmentName: "Research",
      purpose: "Prevent duplicate topics, weak evidence, unsupported claims, and cannibalisation before drafting.",
      existingCapabilities: ["Research & Duplicate Guard", "Evidence checklists", "Research briefs"],
      missingCapabilities: ["Live source watchlists", "Competitor research", "Entity profiles"],
      plannedManagerAgent: "Research AI Manager",
      plannedWorkerAgents: ["Source Watchlist Agent", "Duplicate Guard Agent", "Competitor Research Agent", "Claims Evidence Agent", "Entity Profile Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Evidence acceptance", "High-risk claims", "Create-vs-update decisions"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3F",
      priority: "high",
      signals: ["research", "duplicate", "evidence"],
    },
    {
      departmentId: "social",
      departmentName: "Social",
      purpose: "Plan social drafts, threads, monitoring, and comment triage while keeping sensitive replies safe.",
      existingCapabilities: ["Planned in Agent Registry"],
      missingCapabilities: ["Social post drafts", "Monitoring inbox", "Comment triage", "Trust & Safety escalation"],
      plannedManagerAgent: "Social AI Manager",
      plannedWorkerAgents: ["Social Post Draft Agent", "Thread Draft Agent", "Social Monitoring Agent", "Comment Triage Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Public posts", "Sensitive replies", "Scam-recovery language"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 4B",
      priority: "medium",
      signals: ["social", "thread", "comment"],
    },
    {
      departmentId: "media-images",
      departmentName: "Media / Images",
      purpose: "Plan image briefs, alt text, screenshots, thumbnails, and brand consistency checks.",
      existingCapabilities: ["Image alt text suggestions", "Media review opportunity type"],
      missingCapabilities: ["Screenshot proof workflow", "Thumbnail briefs", "Missing media detection"],
      plannedManagerAgent: "Media AI Manager",
      plannedWorkerAgents: ["Image Brief Agent", "Thumbnail Agent", "Screenshot Proof Agent", "Brand Consistency Agent", "Missing Media Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Final image choices", "Proof screenshots", "Brand-sensitive assets"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3G",
      priority: "medium",
      signals: ["media", "image", "alt text"],
    },
    {
      departmentId: "video",
      departmentName: "Video",
      purpose: "Plan short video scripts, hooks, captions, and content repurposing.",
      existingCapabilities: ["Not started"],
      missingCapabilities: ["Video briefs", "Short scripts", "Captions", "Repurposing workflow"],
      plannedManagerAgent: "Media AI Manager",
      plannedWorkerAgents: ["Short Video Script Agent", "Video Brief Agent", "Hook Agent", "Captions Agent", "Repurposing Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Published video scripts", "Claims in video", "Platform-specific posts"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 4C",
      priority: "medium",
      signals: ["video", "caption", "hook"],
    },
    {
      departmentId: "scam-monitoring",
      departmentName: "Scam Monitoring",
      purpose: "Watch for scam patterns, complaint signals, and emerging red flags without making unsupported accusations.",
      existingCapabilities: ["Risk language guard concepts", "Rendered verifier and research guard safety checks"],
      missingCapabilities: ["Scam pattern watch", "Complaint signal intake", "Evidence-led alert queue"],
      plannedManagerAgent: "Trust & Safety AI Manager",
      plannedWorkerAgents: ["Scam Pattern Watch Agent", "Red Flag Evidence Agent", "Complaint Signal Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Scam/fraud language", "Public warnings", "Risk escalation"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3H",
      priority: "high",
      signals: ["scam", "red flag", "complaint"],
    },
    {
      departmentId: "trust-safety",
      departmentName: "Trust & Safety",
      purpose: "Protect brand trust, user safety, claim quality, risk language, and sensitive monetisation decisions.",
      existingCapabilities: ["Quality Control Manager", "Manager Escalation Router", "Risk checks across reports"],
      missingCapabilities: ["Dedicated trust rating guard", "Evidence review queue", "Reputation risk scoring"],
      plannedManagerAgent: "Trust & Safety AI Manager",
      plannedWorkerAgents: ["Risk Language Guard Agent", "Reputation Risk Agent", "Red Flag Evidence Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Trust rating changes", "Legal/policy wording", "High-risk claims"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3H",
      priority: "high",
      signals: ["trust", "safety", "qc", "risk"],
    },
    {
      departmentId: "moderation",
      departmentName: "Moderation",
      purpose: "Plan safe handling for user comments, scam-recovery replies, and social moderation queues.",
      existingCapabilities: ["Planned in Agent Registry"],
      missingCapabilities: ["Moderation queue", "Sensitive reply classifier", "Escalation templates"],
      plannedManagerAgent: "Social AI Manager",
      plannedWorkerAgents: ["Social Moderation Agent", "Comment Triage Agent", "Risk Language Guard Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Sensitive user replies", "Legal or recovery advice", "Public moderation decisions"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 4B",
      priority: "medium",
      signals: ["moderation", "reply", "comment"],
    },
    {
      departmentId: "evidence-testing",
      departmentName: "Evidence / Testing",
      purpose: "Track evidence gaps, rendered verification, proof screenshots, tests, and confidence before changes move forward.",
      existingCapabilities: ["Rendered Page Verifier", "Audit confidence", "Evidence checklists", "Dashboard contract validator"],
      missingCapabilities: ["Proof screenshot archive", "Evidence source register per claim", "Regression test dashboard"],
      plannedManagerAgent: "Quality Control Manager",
      plannedWorkerAgents: ["Claims Evidence Agent", "Screenshot Proof Agent", "Audit Confidence Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Evidence acceptance", "Verification status changes", "Claims marked ready"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3I",
      priority: "high",
      signals: ["evidence", "testing", "verification", "confidence"],
    },
    {
      departmentId: "approvals",
      departmentName: "Approvals",
      purpose: "Plan Danny review, approval questions, blocked evidence, and draft-only decision states.",
      existingCapabilities: ["Approval Queue", "Preview Diff Engine", "Daily Brief approval snapshot"],
      missingCapabilities: ["Persistent decision log", "Approval source records", "Reject/defer reasons"],
      plannedManagerAgent: "Approvals AI Manager",
      plannedWorkerAgents: ["Approval Queue Agent", "Human Decision Pack Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Everything moving beyond draft/research", "Sensitive recommendations", "Approval-to-apply future steps"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3A",
      priority: "high",
      signals: ["approval", "decision", "review"],
    },
    {
      departmentId: "agents",
      departmentName: "Agents",
      purpose: "Show current and planned AI workforce, hierarchy, permissions, blocked actions, and coverage gaps.",
      existingCapabilities: ["Agent Registry", "Manager Escalation Router", "Dashboard agents data"],
      missingCapabilities: ["Agent capability health checks", "Owner-editable agent registry config", "Coverage gap dashboard"],
      plannedManagerAgent: "Master AI Manager",
      plannedWorkerAgents: ["Agent Team Lead", "Audit Log Agent", "Quality Control Manager"],
      dashboardTabRequired: true,
      dashboardTabId: "agents",
      requiresHumanApprovalFor: ["New execution permissions", "Future API-powered agents", "Any can-apply capability"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 3A",
      priority: "high",
      signals: ["agent", "registry", "manager"],
    },
    {
      departmentId: "settings",
      departmentName: "Settings",
      purpose: "Plan owner-controlled settings for local paths, report limits, safety gates, and future dashboard preferences.",
      existingCapabilities: ["Config files for local snapshots, verifier, and affiliate vault"],
      missingCapabilities: ["Dashboard settings schema", "Owner-editable safety limits", "Local environment health checks"],
      plannedManagerAgent: "Operations AI Manager",
      plannedWorkerAgents: ["Local Config Agent", "Environment Check Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Safety setting changes", "Connector enablement", "Any future write permissions"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Phase 4D",
      priority: "medium",
      signals: ["settings", "config", "operations"],
    },
    {
      departmentId: "safe-apply-engine",
      departmentName: "Safe Apply Engine - future only",
      purpose: "Future controlled apply workflow after explicit approvals, diffs, rollback plans, and audit logs exist.",
      existingCapabilities: ["None in v1; intentionally blocked"],
      missingCapabilities: ["Safe apply design", "Rollback plan", "Approval source validation", "Write lock controls"],
      plannedManagerAgent: "Safe Apply Agent",
      plannedWorkerAgents: ["Safe Apply Agent", "Rollback Planning Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Every apply operation", "Any write target", "Any rollback decision"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Future only",
      priority: "low",
      signals: ["safe apply", "rollback"],
      futureOnly: true,
    },
    {
      departmentId: "audit-log",
      departmentName: "Audit Log - future only",
      purpose: "Future immutable record of decisions, approvals, drafts, previews, applies, rollbacks, and safety checks.",
      existingCapabilities: ["Report timestamps and local generated reports"],
      missingCapabilities: ["Immutable audit log", "Decision provenance", "Approval source records", "Rollback history"],
      plannedManagerAgent: "Operations AI Manager",
      plannedWorkerAgents: ["Audit Log Agent", "Rollback Planning Agent"],
      dashboardTabRequired: true,
      requiresHumanApprovalFor: ["Audit record corrections", "Retention settings", "Any future write-backed audit workflow"],
      neverAllowedToDo: neverAllowedRules,
      suggestedBuildPhase: "Future only",
      priority: "low",
      signals: ["audit", "log", "rollback"],
      futureOnly: true,
    },
  ];

  return defs.map((def) => {
    const dashboardDataAvailable = Boolean(def.dashboardTabId ? dashboardTabs.has(def.dashboardTabId) : hasReportPack && dashboardContractPassed);
    const hasAgentSignal = def.signals.some((signal) => agentText.includes(signal));
    const currentStatus = def.futureOnly
      ? "future_only"
      : dashboardDataAvailable && hasAgentSignal && (hasCommandQueue || hasQc || hasEscalations)
        ? "active"
        : dashboardDataAvailable || hasAgentSignal
          ? "partial"
          : "not_started";
    return {
      ...def,
      currentStatus,
      dashboardDataAvailable,
      canAutoApply: false as const,
    };
  });
}

function buildCoverageSummary(departments: DepartmentRoadmap[]): Record<string, number> {
  return {
    totalDepartments: departments.length,
    activeDepartments: departments.filter((department) => department.currentStatus === "active").length,
    partialDepartments: departments.filter((department) => department.currentStatus === "partial").length,
    notStartedDepartments: departments.filter((department) => department.currentStatus === "not_started").length,
    futureOnlyDepartments: departments.filter((department) => department.currentStatus === "future_only").length,
    plannedWorkerAgentCount: departments.reduce((total, department) => total + department.plannedWorkerAgents.length, 0),
    dashboardTabsCovered: departments.filter((department) => department.dashboardTabRequired && department.dashboardDataAvailable).length,
    dashboardTabsMissing: departments.filter((department) => department.dashboardTabRequired && !department.dashboardDataAvailable).length,
  };
}

function nextBuildOrder(departments: DepartmentRoadmap[]): Array<Record<string, string>> {
  const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  const statusRank: Record<DepartmentStatus, number> = { partial: 0, not_started: 1, active: 2, future_only: 3 };
  return departments
    .filter((department) => department.currentStatus !== "active")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || statusRank[a.currentStatus] - statusRank[b.currentStatus])
    .slice(0, 12)
    .map((department, index) => ({
      order: String(index + 1),
      departmentId: department.departmentId,
      departmentName: department.departmentName,
      priority: department.priority,
      suggestedBuildPhase: department.suggestedBuildPhase,
      reason: department.currentStatus === "future_only" ? "Future-only safety-controlled capability." : department.missingCapabilities[0] ?? "Coverage gap remains.",
    }));
}

function stringAt(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const found = value[key];
  return typeof found === "string" ? found : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(report: {
  name: string;
  generatedAt: string;
  coverageSummary: Record<string, number>;
  departments: DepartmentRoadmap[];
  nextRecommendedBuildOrder: Array<Record<string, string>>;
  humanApprovalRules: string[];
  neverAllowedRules: string[];
  missingOptionalInputs: string[];
}): string {
  const gaps = report.departments.filter((department) => department.currentStatus === "not_started" || department.currentStatus === "partial");
  return [
    `# ${report.name}`,
    "",
    "## Safety Summary",
    "",
    "- Safety mode: READ_ONLY_REPORT_ONLY",
    "- This is planning-only. It does not create functional worker agents or dashboard UI.",
    "- It does not approve, apply, publish, edit live files, create patch files, create update payloads, write to Supabase, or call live connectors.",
    "",
    "## Coverage Summary",
    "",
    Object.entries(report.coverageSummary)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n"),
    "",
    "## Department Table",
    "",
    renderDepartmentTable(report.departments),
    "",
    "## Missing Departments / Gaps",
    "",
    gaps.length
      ? gaps.map((department) => `- ${department.departmentName}: ${department.missingCapabilities.slice(0, 3).join("; ")}`).join("\n")
      : "No partial or not-started department gaps were detected.",
    "",
    "## Planned AI Managers And Worker Agents",
    "",
    report.departments
      .map((department) => `- ${department.departmentName}: ${department.plannedManagerAgent} -> ${department.plannedWorkerAgents.join(", ")}`)
      .join("\n"),
    "",
    "## Next Recommended Build Order",
    "",
    report.nextRecommendedBuildOrder
      .map((item) => `${item.order}. ${item.departmentName} (${item.priority}) - ${item.reason}`)
      .join("\n"),
    "",
    "## Human Approval Rules",
    "",
    report.humanApprovalRules.map((rule) => `- ${rule}`).join("\n"),
    "",
    "## Never Allowed Rules",
    "",
    report.neverAllowedRules.map((rule) => `- ${rule}`).join("\n"),
    "",
    "## Missing Optional Inputs",
    "",
    report.missingOptionalInputs.length ? report.missingOptionalInputs.map((input) => `- ${input}`).join("\n") : "No optional roadmap inputs are missing.",
    "",
    "This roadmap is read-only and report-only. Nothing has been approved, applied, published, patched, or written to Supabase.",
  ].join("\n");
}

function renderDepartmentTable(departments: DepartmentRoadmap[]): string {
  return [
    "| Department | Status | Priority | Dashboard Data | Suggested Phase |",
    "|---|---|---|---:|---|",
    ...departments.map(
      (department) =>
        `| ${department.departmentName} | ${department.currentStatus} | ${department.priority} | ${department.dashboardDataAvailable} | ${department.suggestedBuildPhase} |`,
    ),
  ].join("\n");
}

if (isDirectRun(import.meta.url)) {
  buildDepartmentRoadmap().catch((error) => {
    logger.error("Department roadmap build failed", { error });
    process.exitCode = 1;
  });
}
