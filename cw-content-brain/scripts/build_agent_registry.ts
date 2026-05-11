import { isDirectRun, writeJson, writeText } from "../src/lib/fs.js";
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

type AgentStatus = "active" | "planned" | "future";
type AgentMode = "rule_based" | "ai_assisted" | "api_powered" | "hybrid" | "future";
type RiskLevel = "low" | "medium" | "high";

interface AgentRegistryEntry {
  id: string;
  name: string;
  department: Department;
  currentStatus: AgentStatus;
  mode: AgentMode;
  riskLevel: RiskLevel;
  responsibilities: string[];
  inputReports: string[];
  outputReports: string[];
  relatedScripts: string[];
  allowedActions: string[];
  blockedActions: string[];
  canAutoDraft: boolean;
  canAutoApply: false;
  requiresHumanApproval: boolean;
}

const outputJson = "data/reports/agent_registry_report.json";
const outputMd = "data/reports/agent_registry_report.md";
const registryVersion = "1.0.0";

const globalSafetyRules = [
  "No publishing unless explicitly approved by a human.",
  "No Supabase writes unless a future approved workflow exists.",
  "No live site edits.",
  "No secrets in inputs, outputs, logs, or reports.",
  "No affiliate links on red, warning, scam-alert, legal, or high-risk pages unless manually approved.",
  "No trust rating changes without human approval.",
  "No scam or fraud accusations without evidence review.",
  "Every v1 agent has canAutoApply set to false.",
  "Risky or high-impact agents require human approval.",
];

export async function buildAgentRegistry(): Promise<AgentRegistryEntry[]> {
  const agents = registryAgents();
  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Agent Registry v1 for Watchdog HQ planning. This report maps existing and planned agents only. It does not execute agents, publish content, edit live pages, write to Supabase, call APIs, or store secrets.",
    registryVersion,
    agentCount: agents.length,
    activeAgentCount: agents.filter((agent) => agent.currentStatus === "active").length,
    plannedAgentCount: agents.filter((agent) => agent.currentStatus === "planned").length,
    futureAgentCount: agents.filter((agent) => agent.currentStatus === "future").length,
    departmentCounts: countBy(agents, (agent) => agent.department),
    riskCounts: countBy(agents, (agent) => agent.riskLevel),
    safetyRules: globalSafetyRules,
    agents,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(agents, report));
  logger.info("Agent registry report written", { agents: agents.length, outputJson, outputMd });
  return agents;
}

function registryAgents(): AgentRegistryEntry[] {
  return [
    activeAgent("content-quality-agent", "Content Quality Agent", "Content", "medium", ["Review local content snapshot quality signals.", "Identify thin, risky, or incomplete content fields."], ["data/content_snapshot/normalised_content.json"], ["data/reports/content_quality_report.json"], ["scripts/audit_content_quality.ts"]),
    activeAgent("affiliate-placement-agent", "Affiliate Placement Agent", "Affiliates", "high", ["Suggest safe, disclosed affiliate placements from local snapshots and vault records.", "Block red/warning/high-risk contexts."], ["data/content_snapshot/normalised_content.json", "config/affiliate_vault.example.json", "config/affiliate_vault.json"], ["data/reports/affiliate_placement_suggestions.json"], ["scripts/build_affiliate_placements.ts"]),
    activeAgent("internal-link-agent", "Internal Link Agent", "SEO", "medium", ["Suggest natural internal link placements.", "Identify orphan or thinly linked pages from local snapshots."], ["data/content_snapshot/normalised_content.json"], ["data/reports/internal_link_placement_suggestions.json"], ["scripts/build_internal_link_placements.ts"]),
    activeAgent("metadata-agent", "Metadata Agent", "SEO", "medium", ["Draft SEO, OG, Twitter, canonical, schema, keyword, and image metadata suggestions."], ["data/content_snapshot/normalised_content.json", "data/reports/rendered_page_verification.json"], ["data/reports/metadata_suggestions.json"], ["scripts/build_metadata_suggestions.ts"]),
    activeAgent("offer-expiry-agent", "Offer Expiry Agent", "Affiliates", "medium", ["Classify affiliate offers as current, expiring, expired, stale, paused, blocked, or needs review."], ["config/affiliate_vault.example.json", "config/affiliate_vault.json"], ["data/reports/offer_tracker_report.json"], ["scripts/build_offer_tracker.ts"]),
    activeAgent("search-console-import-agent", "Search Console Import Agent", "Analytics", "low", ["Import local Search Console CSV/JSON exports.", "Normalise query, page, click, impression, CTR, and position data."], ["data/search_console/exports/*.csv", "data/search_console/exports/*.json"], ["data/reports/search_console_report.json"], ["scripts/build_search_console_report.ts"]),
    activeAgent("ga4-import-agent", "GA4 Import Agent", "Analytics", "low", ["Import local GA4 CSV/JSON exports.", "Normalise page, source, engagement, event, and conversion data."], ["data/ga4/exports/*.csv", "data/ga4/exports/*.json"], ["data/reports/ga4_report.json"], ["scripts/build_ga4_report.ts"]),
    activeAgent("seo-intelligence-agent", "SEO Intelligence Agent", "Command", "medium", ["Combine local reports into an action queue.", "Separate actionable, blocked, and monitor items."], ["data/reports/*.json"], ["data/reports/seo_intelligence_queue.json"], ["scripts/build_seo_intelligence_brain.ts"]),
    activeAgent("rendered-page-verifier-agent", "Rendered Page Verifier Agent", "Trust & Safety", "medium", ["Verify rendered page facts against local queue findings.", "Reduce false positives from app-rendered content."], ["data/reports/priority_action_queue.json"], ["data/reports/rendered_page_verification.json"], ["scripts/verify_rendered_pages.ts"]),
    activeAgent("research-duplicate-guard-agent", "Research & Duplicate Guard Agent", "Research", "medium", ["Review proposed content ideas before drafting.", "Flag duplicate, cannibalisation, update-existing, and evidence risks."], ["data/research_queue/inputs/*.csv", "data/research_queue/inputs/*.json", "data/content_snapshot/normalised_content.json"], ["data/reports/research_duplicate_guard_report.json"], ["scripts/build_research_duplicate_guard.ts"]),
    activeAgent("priority-action-queue-agent", "Priority Action Queue Agent", "Operations", "medium", ["Rank local audit findings into a draft action queue."], ["data/reports/content_quality_report.json", "data/reports/affiliate_placement_report.json", "data/reports/content_linking_report.json"], ["data/reports/priority_action_queue.json"], ["scripts/build_priority_action_queue.ts"]),
    activeAgent("audit-confidence-agent", "Audit Confidence Agent", "Trust & Safety", "low", ["Summarise confidence and false-positive risk across audit findings."], ["data/reports/content_quality_report.json", "data/reports/affiliate_placement_report.json", "data/reports/content_linking_report.json"], ["data/reports/audit_confidence_summary.json"], ["scripts/summarise_audit_confidence.ts"]),
    activeAgent("supabase-snapshot-export-agent", "Supabase Snapshot Export Agent", "Operations", "high", ["Owner-controlled read-only export helper for local snapshots."], ["config/supabase_export.config.json", "local environment variables"], ["data/content_snapshot/*.json", "logs/supabase-export-run.json"], ["scripts/export_supabase_snapshot.ts"], ["Read configured Supabase tables only when explicitly enabled by owner."], ["Write to Supabase.", "Commit exported private data.", "Run without owner-provided local configuration."], false, true),
    activeAgent("local-content-snapshot-agent", "Local Content Snapshot Agent", "Content", "low", ["Normalise local JSON snapshot exports for downstream reports."], ["config/content_snapshot.config.json", "data/content_snapshot/*.json"], ["data/content_snapshot/normalised_content.json"], ["scripts/load_content_snapshot.ts"]),
    plannedAgent("master-ai-manager", "Master AI Manager", "Command", "hybrid", "high", ["Coordinate future Watchdog HQ agent workflows.", "Route tasks to specialist agents only after approval."], [], [], []),
    plannedAgent("agent-team-lead", "Agent Team Lead", "Command", "hybrid", "medium", ["Group recommendations by department.", "Prepare human-readable execution plans."], ["data/reports/agent_registry_report.json"], [], []),
    plannedAgent("approval-queue-agent", "Approval Queue Agent", "Approvals", "rule_based", "high", ["Collect draft changes needing human approval.", "Prevent unsafe auto-apply flows."], ["future approval queue"], [], []),
    plannedAgent("preview-diff-agent", "Preview Diff Agent", "Approvals", "rule_based", "medium", ["Generate before/after previews for proposed content changes."], ["future draft patches"], [], []),
    plannedAgent("fix-draft-agent", "Fix Draft Agent", "Content", "ai_assisted", "high", ["Draft proposed text fixes from approved queue items.", "Keep evidence-first, protection-first tone."], ["future approved queue items"], [], []),
    plannedAgent("safe-apply-agent", "Safe Apply Agent", "Operations", "future", "high", ["Future approved workflow for applying human-approved changes only."], ["future approval records"], [], []),
    plannedAgent("rollback-agent", "Rollback Agent", "Operations", "future", "high", ["Future rollback planning for approved applied changes."], ["future audit logs"], [], []),
    plannedAgent("audit-log-agent", "Audit Log Agent", "Operations", "rule_based", "medium", ["Record future decisions, approvals, and applied changes."], ["future approval and apply events"], [], []),
    plannedAgent("social-strategy-agent", "Social Strategy Agent", "Social", "ai_assisted", "medium", ["Suggest social content angles from approved posts.", "Avoid unsupported claims and hype."], ["future approved content briefs"], [], []),
    plannedAgent("social-moderation-agent", "Social Moderation Agent", "Social", "hybrid", "high", ["Flag high-risk claims, harassment, or unsafe replies before posting."], ["future social queues"], [], []),
    plannedAgent("backlink-profile-agent", "Backlink Profile Agent", "Backlinks", "api_powered", "medium", ["Future local/import backlink profile review.", "Detect toxic or high-value backlink signals when data exists."], ["future backlink exports"], [], []),
    plannedAgent("babylovegrowth-agent", "BabyLoveGrowth Agent", "Backlinks", "api_powered", "medium", ["Future integration placeholder for BabyLoveGrowth workflows.", "Keep backlink actions review-only until approved."], ["future BabyLoveGrowth exports"], [], []),
    plannedAgent("scam-claim-risk-agent", "Scam Claim Risk Agent", "Trust & Safety", "hybrid", "high", ["Review scam/fraud accusation wording for evidence risk.", "Block unsupported high-risk claims."], ["future claim drafts", "data/research_queue/inputs/*"], [], []),
    plannedAgent("trust-rating-agent", "Trust Rating Agent", "Trust & Safety", "hybrid", "high", ["Prepare trust rating review suggestions from evidence.", "Never change ratings without human approval."], ["future evidence packs"], [], []),
    plannedAgent("media-image-agent", "Media/Image Agent", "Media", "ai_assisted", "medium", ["Suggest safe image alt text, filenames, and future media tasks.", "Avoid misleading or invented visual claims."], ["data/reports/metadata_suggestions.json"], [], []),
  ];
}

function activeAgent(
  id: string,
  name: string,
  department: Department,
  riskLevel: RiskLevel,
  responsibilities: string[],
  inputReports: string[],
  outputReports: string[],
  relatedScripts: string[],
  allowedActions = ["Read local inputs.", "Generate local draft-only reports.", "Mark outputs for human review."],
  blockedActions = defaultBlockedActions(),
  canAutoDraft = false,
  requiresHumanApproval = riskLevel !== "low",
): AgentRegistryEntry {
  return agent(id, name, department, "active", "rule_based", riskLevel, responsibilities, inputReports, outputReports, relatedScripts, allowedActions, blockedActions, canAutoDraft, requiresHumanApproval);
}

function plannedAgent(id: string, name: string, department: Department, mode: AgentMode, riskLevel: RiskLevel, responsibilities: string[], inputReports: string[], outputReports: string[], relatedScripts: string[]): AgentRegistryEntry {
  const status: AgentStatus = mode === "future" ? "future" : "planned";
  return agent(id, name, department, status, mode, riskLevel, responsibilities, inputReports, outputReports, relatedScripts, ["Read approved local inputs when implemented.", "Generate draft-only suggestions when implemented.", "Route risky items to human approval."], defaultBlockedActions(), false, true);
}

function agent(id: string, name: string, department: Department, currentStatus: AgentStatus, mode: AgentMode, riskLevel: RiskLevel, responsibilities: string[], inputReports: string[], outputReports: string[], relatedScripts: string[], allowedActions: string[], blockedActions: string[], canAutoDraft: boolean, requiresHumanApproval: boolean): AgentRegistryEntry {
  return {
    id,
    name,
    department,
    currentStatus,
    mode,
    riskLevel,
    responsibilities,
    inputReports,
    outputReports,
    relatedScripts,
    allowedActions,
    blockedActions,
    canAutoDraft,
    canAutoApply: false,
    requiresHumanApproval,
  };
}

function defaultBlockedActions(): string[] {
  return [
    "Publish content without approval.",
    "Write to Supabase.",
    "Edit live site files.",
    "Store or expose secrets.",
    "Add affiliate links on red, warning, scam-alert, legal, or high-risk pages without manual approval.",
    "Change trust ratings without human approval.",
    "Make scam or fraud accusations without evidence review.",
    "Auto-apply changes in v1.",
  ];
}

function countBy<T extends string>(agents: AgentRegistryEntry[], pick: (agent: AgentRegistryEntry) => T): Record<T, number> {
  return agents.reduce((counts, agent) => {
    const key = pick(agent);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {} as Record<T, number>);
}

function renderMarkdown(agents: AgentRegistryEntry[], report: { agentCount: number; activeAgentCount: number; plannedAgentCount: number; futureAgentCount: number; departmentCounts: Record<string, number>; riskCounts: Record<string, number> }): string {
  const active = agents.filter((agent) => agent.currentStatus === "active");
  const plannedFuture = agents.filter((agent) => agent.currentStatus !== "active");
  return `# Agent Registry Report

Generated: ${new Date().toISOString()}

Read-only Agent Registry v1 for Watchdog HQ planning. This report maps existing and planned agents only. It does not execute agents, publish content, edit live pages, write to Supabase, call APIs, or store secrets.

## Summary

- Registry version: ${registryVersion}
- Total agents: ${report.agentCount}
- Active agents: ${report.activeAgentCount}
- Planned agents: ${report.plannedAgentCount}
- Future agents: ${report.futureAgentCount}

## Departments

${Object.entries(report.departmentCounts).map(([department, count]) => `- ${department}: ${count}`).join("\n")}

## Active Agents

${active.map(renderAgent).join("\n")}

## Planned/Future Agents

${plannedFuture.map(renderAgent).join("\n")}

## Safety Rules

${globalSafetyRules.map((rule) => `- ${rule}`).join("\n")}

## Next Steps

- Keep v1 report-only and read-only.
- Use this registry to decide ownership for future Watchdog HQ workflows.
- Add execution, approval, and audit-log capabilities only in future approved phases.
- Keep all auto-apply paths disabled until a human-approved workflow exists.
`;
}

function renderAgent(agent: AgentRegistryEntry): string {
  return `### ${agent.name}

- ID: ${agent.id}
- Department: ${agent.department}
- Status: ${agent.currentStatus}
- Mode: ${agent.mode}
- Risk: ${agent.riskLevel}
- Can auto draft: ${agent.canAutoDraft ? "yes" : "no"}
- Can auto apply: no
- Requires human approval: ${agent.requiresHumanApproval ? "yes" : "no"}
- Related scripts: ${agent.relatedScripts.length > 0 ? agent.relatedScripts.join(", ") : "none yet"}
- Outputs: ${agent.outputReports.length > 0 ? agent.outputReports.join(", ") : "none yet"}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildAgentRegistry();
}
