import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/agent_capability_registry_v2_report.json";

const requiredTopLevelFields = [
  "generatedAt",
  "sourceInputs",
  "summary",
  "departments",
  "agents",
  "capabilityEndpoints",
  "escalationMap",
  "maturityRoadmap",
  "validationStatus",
];

const requiredDepartmentNames = [
  "Master AI Management",
  "Quality Control",
  "Audit Trail / Governance",
  "Content",
  "SEO",
  "Internal Linking",
  "Research / Evidence",
  "Affiliate / Offers",
  "Analytics",
  "Backlinks",
  "Social",
  "Media / Video",
  "Approvals",
  "Safe Apply Engine",
  "Settings / Admin",
];

const requiredAgentNames = [
  "The Gaffer",
  "Gatekeeper Grace",
  "Audit Alfie",
  "Routey Rachel",
  "Blueprint Bella",
  "Thin Page Theo",
  "Rewrite Rita",
  "Rankhound",
  "Keyword Kev",
  "Cluster Clara",
  "Linksmith",
  "Inspector Proof",
  "Screenshot Sam",
  "Red Flag Rita",
  "Claim Checker Colin",
  "Rating Guard Rachel",
  "Offer Owl",
  "Expiry Eddie",
  "Disclosure Daisy",
  "Pixel Pete",
  "Image Iris",
  "Storyboard Sam",
  "Social Sophie",
  "Metric Molly",
  "Backlink Barry",
  "Approval Ava",
  "Safe Apply Sam",
];

const requiredEndpointIds = [
  "qc.check_safety_boundaries",
  "qc.check_unsupported_claims",
  "qc.check_affiliate_disclosure",
  "qc.check_rating_change_risk",
  "content.profile_page_quality",
  "content.recommend_page_blueprint",
  "content.recommend_related_sections",
  "media.recommend_media_briefs",
  "seo.check_title_meta",
  "seo.check_keyword_fit",
  "links.recommend_internal_links",
  "evidence.check_source_quality",
  "affiliate.check_offer_expiry",
  "analytics.import_ga4_signals",
  "master.prioritise_tasks",
  "approvals.prepare_human_review_item",
  "safe_apply.block_until_approved",
];

const requiredBlockedActions = [
  "publish",
  "supabase_write",
  "live_content_edit",
  "affiliate_url_insert",
  "trust_rating_change",
  "approval_apply",
  "secret_access",
  "external_api_call",
  "live_crawl",
  "media_generation",
  "media_download",
];

const allowedLifecycleStates = new Set([
  "detected",
  "suspected",
  "verified",
  "recommended",
  "blocked",
  "monitor_only",
  "needs_more_evidence",
  "escalated_to_qc",
  "escalated_to_master_ai",
  "recommended_for_danny_review",
]);

const blockedLifecycleStates = new Set(["approved", "applied"]);
const allowedMaturityStatuses = new Set([
  "planned",
  "registered",
  "basic_report_only",
  "active_report_only",
  "ai_assisted",
  "manager_reviewed",
  "qc_reviewed",
  "approval_ready",
  "safe_apply_ready",
]);
const allowedCurrentMaturityStatuses = new Set(["planned", "registered", "basic_report_only", "active_report_only"]);

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "approved lifecycle state", pattern: /"(?:currentLifecycleState|recommendedLifecycleState|lifecycleStage|stage)"\s*:\s*"approved"/i },
  { label: "applied lifecycle state", pattern: /"(?:currentLifecycleState|recommendedLifecycleState|lifecycleStage|stage)"\s*:\s*"applied"/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "ready to publish", pattern: /ready to publish/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "live edit", pattern: /live edit/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "Supabase write enabled", pattern: /Supabase write (enabled|payload|operation)/i },
  { label: "live publishing enabled", pattern: /live publishing enabled/i },
  { label: "auto apply enabled", pattern: /auto apply enabled/i },
  { label: "insert affiliate", pattern: /insert affiliate/i },
  { label: "add affiliate link", pattern: /add affiliate link/i },
  { label: "change trust rating", pattern: /change trust rating/i },
  { label: "AI API enabled", pattern: /(ai api call enabled|actual ai call enabled|call openai now)/i },
  { label: "external API enabled", pattern: /(external api call enabled|call external api now|external api write enabled)/i },
  { label: "live crawling enabled", pattern: /(live crawling enabled|live crawl enabled|crawl live site now)/i },
  { label: "media generation enabled", pattern: /(media generation enabled|generate media now|image generation enabled|video generation enabled)/i },
  { label: "secret access enabled", pattern: /(secret access enabled|read secrets now|use api key now)/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function validateAgentCapabilityRegistryV2(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:agent-capabilities first.`);
  } else {
    const raw = await readFile(absolutePath, "utf8");
    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(raw)) unsafeMarkersFound.push(unsafe.label);
    }
    try {
      validateReport(JSON.parse(raw) as Record<string, unknown>, errors, warnings);
    } catch (error) {
      errors.push(`Report JSON did not parse: ${String(error)}`);
    }
  }

  const passed = errors.length === 0 && unsafeMarkersFound.length === 0;
  const summary = {
    status: passed ? "passed" : "failed",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    reportPath: absolutePath,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!passed) {
    logger.error("Agent Capability Registry v2 validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  for (const field of requiredTopLevelFields) {
    if (!(field in report)) errors.push(`Missing required top-level field: ${field}.`);
  }
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.localOnly !== true) errors.push("localOnly must be true.");
  if (report.readOnly !== true) errors.push("readOnly must be true.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const allowedStates = stringArray(report.allowedLifecycleStates);
  for (const state of allowedStates) {
    if (!allowedLifecycleStates.has(state)) errors.push(`Invalid allowed lifecycle state: ${state}.`);
  }
  if (allowedStates.includes("approved") || allowedStates.includes("applied")) errors.push("allowedLifecycleStates must exclude approved and applied.");
  const reportBlockedStates = stringArray(report.blockedLifecycleStates);
  for (const state of blockedLifecycleStates) {
    if (!reportBlockedStates.includes(state)) errors.push(`blockedLifecycleStates must include ${state}.`);
  }

  const reportBlockedActions = stringArray(report.blockedActions);
  for (const action of requiredBlockedActions) {
    if (!reportBlockedActions.includes(action)) errors.push(`blockedActions must include ${action}.`);
  }

  const departments = arrayOfRecords(report.departments);
  if (!Array.isArray(report.departments) || departments.length === 0) errors.push("departments must be a non-empty array.");
  const departmentNames = new Set(departments.map((item) => stringAt(item, "departmentName", "")));
  for (const departmentName of requiredDepartmentNames) {
    if (!departmentNames.has(departmentName)) errors.push(`Missing department: ${departmentName}.`);
  }
  for (const [index, department] of departments.entries()) {
    const label = stringAt(department, "departmentName", `department-${index + 1}`);
    for (const field of ["departmentId", "departmentName", "purpose", "managerAgent", "workerAgents", "capabilityEndpointIds", "currentMaturityStatus", "targetMaturityStatus", "escalationTargets", "blockedActions"]) {
      if (!(field in department)) errors.push(`${label} missing required field ${field}.`);
    }
    validateMaturity(label, department, errors);
    validateBlockedActions(`${label} department`, department, errors);
  }

  const endpoints = arrayOfRecords(report.capabilityEndpoints);
  if (!Array.isArray(report.capabilityEndpoints) || endpoints.length === 0) errors.push("capabilityEndpoints must be a non-empty array.");
  const endpointIds = new Set(endpoints.map((item) => stringAt(item, "endpointId", "")));
  for (const endpointId of requiredEndpointIds) {
    if (!endpointIds.has(endpointId)) errors.push(`Missing capability endpoint: ${endpointId}.`);
  }
  for (const [index, endpoint] of endpoints.entries()) {
    const label = stringAt(endpoint, "endpointId", `endpoint-${index + 1}`);
    for (const field of ["endpointId", "department", "purpose", "allowedInputs", "allowedOutputs", "lifecycleLimit", "maturityStatus", "blockedActions"]) {
      if (!(field in endpoint)) errors.push(`${label} missing required field ${field}.`);
    }
    const maturity = stringAt(endpoint, "maturityStatus", "");
    if (!allowedMaturityStatuses.has(maturity)) errors.push(`${label} has invalid maturityStatus ${maturity}.`);
    validateBlockedActions(`${label} endpoint`, endpoint, errors);
  }

  const agents = arrayOfRecords(report.agents);
  if (!Array.isArray(report.agents) || agents.length === 0) errors.push("agents must be a non-empty array.");
  const agentNames = new Set(agents.map((item) => stringAt(item, "agentName", "")));
  for (const agentName of requiredAgentNames) {
    if (!agentNames.has(agentName)) errors.push(`Missing agent: ${agentName}.`);
  }
  for (const [index, agent] of agents.entries()) {
    const label = stringAt(agent, "agentName", `agent-${index + 1}`);
    for (const field of [
      "agentId",
      "agentName",
      "department",
      "roleType",
      "purpose",
      "currentMaturityStatus",
      "targetMaturityStatus",
      "allowedModes",
      "blockedActions",
      "allowedInputs",
      "allowedOutputs",
      "capabilityEndpoints",
      "escalationTargets",
      "checkedBy",
      "priorityTier",
      "implementationNotes",
    ]) {
      if (!(field in agent)) errors.push(`${label} missing required field ${field}.`);
    }
    validateMaturity(label, agent, errors);
    validateBlockedActions(`${label} agent`, agent, errors);
    if (stringArray(agent.capabilityEndpoints).some((endpointId) => !endpointIds.has(endpointId))) errors.push(`${label} references an unknown capability endpoint.`);
  }

  const summary = recordAt(report, "summary");
  for (const field of ["departmentCount", "agentCount", "capabilityEndpointCount", "byCurrentMaturity", "byPriorityTier", "byDepartment"]) {
    if (!(field in summary)) errors.push(`summary missing ${field}.`);
  }
  if (Number(summary.departmentCount ?? 0) < requiredDepartmentNames.length) errors.push("summary.departmentCount is lower than required department count.");
  if (Number(summary.agentCount ?? 0) < requiredAgentNames.length) errors.push("summary.agentCount is lower than required agent count.");
  if (Number(summary.capabilityEndpointCount ?? 0) < requiredEndpointIds.length) errors.push("summary.capabilityEndpointCount is lower than required endpoint count.");

  if (!Array.isArray(report.escalationMap) || report.escalationMap.length === 0) errors.push("escalationMap must be a non-empty array.");
  if (!Array.isArray(report.maturityRoadmap) || report.maturityRoadmap.length === 0) errors.push("maturityRoadmap must be a non-empty array.");
  if (agents.length > 0 && agents.every((agent) => stringAt(agent, "currentMaturityStatus", "") === "planned")) warnings.push("All agents are planned; expected some registered or active report-only agents.");
}

function validateMaturity(label: string, value: Record<string, unknown>, errors: string[]): void {
  const current = stringAt(value, "currentMaturityStatus", "");
  const target = stringAt(value, "targetMaturityStatus", "");
  if (!allowedMaturityStatuses.has(current)) errors.push(`${label} has invalid currentMaturityStatus ${current}.`);
  if (!allowedMaturityStatuses.has(target)) errors.push(`${label} has invalid targetMaturityStatus ${target}.`);
  if (!allowedCurrentMaturityStatuses.has(current)) errors.push(`${label} currentMaturityStatus must not exceed active_report_only in v2.`);
}

function validateBlockedActions(label: string, value: Record<string, unknown>, errors: string[]): void {
  const actions = stringArray(value.blockedActions);
  for (const action of requiredBlockedActions) {
    if (!actions.includes(action)) errors.push(`${label} blockedActions missing ${action}.`);
  }
}

function recordAt(value: Record<string, unknown>, key: string): Record<string, unknown> {
  const child = value[key];
  return typeof child === "object" && child !== null && !Array.isArray(child) ? (child as Record<string, unknown>) : {};
}

function arrayOfRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)) : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function stringAt(value: Record<string, unknown>, key: string, fallback: string): string {
  const child = value[key];
  return typeof child === "string" && child.trim() ? child : fallback;
}

if (isDirectRun(import.meta.url)) {
  validateAgentCapabilityRegistryV2().catch((error) => {
    logger.error("Agent Capability Registry v2 validation crashed", { error });
    process.exitCode = 1;
  });
}
