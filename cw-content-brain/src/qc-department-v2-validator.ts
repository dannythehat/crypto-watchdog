import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/qc_department_v2_report.json";

const expectedEndpoints = [
  "qc.check_safety_boundaries",
  "qc.check_unsupported_claims",
  "qc.check_affiliate_disclosure",
  "qc.check_rating_change_risk",
  "qc.check_scam_wording_risk",
  "qc.check_human_approval_needed",
  "qc.block_unsafe_recommendation",
];

const hardBlockedActions = [
  "supabase_write",
  "publishing",
  "live_content_edit",
  "affiliate_url_insertion",
  "approval_apply_workflow",
  "secret_or_api_key_access",
  "live_crawling_or_fetching",
  "ai_or_external_api_call",
  "generated_output_commit",
  "unsupported_scam_or_fraud_accusation",
  "trust_rating_change",
];

const allowedStates = new Set([
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

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "ready to publish", pattern: /ready to publish/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "live edit", pattern: /live edit/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "Supabase write enabled", pattern: /Supabase write (enabled|payload|operation)/i },
  { label: "insert affiliate URL", pattern: /(insert affiliate url|affiliate url insertion enabled|add affiliate url now)/i },
  { label: "trust rating change enabled", pattern: /(change trust rating now|trust rating change enabled|apply trust rating)/i },
  { label: "approval/apply enabled", pattern: /(approval apply enabled|auto apply enabled|approval workflow enabled)/i },
  { label: "AI/API call enabled", pattern: /(ai api call enabled|external api call enabled|call openai now|call external api now)/i },
  { label: "live crawl enabled", pattern: /(live crawling enabled|live fetching enabled|crawl live site now)/i },
  { label: "scam accusation without approval", pattern: /(confirmed scam without approval|fraud accusation final|scam accusation final)/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key exposure", pattern: /(api key exposed|api key value|use api key now)/i },
];

export async function validateQcDepartmentV2(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:qc-v2 first.`);
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
    logger.error("QC Department v2 validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  for (const field of [
    "status",
    "safetyMode",
    "canAutoApply",
    "approvedCount",
    "appliedCount",
    "departmentName",
    "managerName",
    "managerCodename",
    "qcEndpoints",
    "blockedActions",
    "allowedStates",
    "blockedStates",
    "escalationRoutes",
    "humanApprovalRules",
    "errors",
    "warnings",
  ]) {
    if (!(field in report)) errors.push(`Missing required field: ${field}.`);
  }

  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");
  if (report.managerName !== "Gatekeeper Grace" || report.managerCodename !== "Gatekeeper Grace") errors.push("Gatekeeper Grace must be the QC v2 manager.");

  const reportAllowedStates = stringArray(report.allowedStates);
  for (const state of reportAllowedStates) {
    if (!allowedStates.has(state)) errors.push(`Invalid allowed state: ${state}.`);
  }
  if (reportAllowedStates.includes("approved") || reportAllowedStates.includes("applied")) errors.push("approved/applied must not appear in allowedStates.");

  const blockedStates = stringArray(report.blockedStates);
  if (!blockedStates.includes("approved") || !blockedStates.includes("applied")) errors.push("blockedStates must include approved and applied.");

  const endpoints = arrayOfRecords(report.qcEndpoints);
  if (endpoints.length === 0) errors.push("qcEndpoints must be a non-empty array.");
  const endpointIds = new Set(endpoints.map((endpoint) => stringAt(endpoint, "endpointId", "")));
  for (const endpointId of expectedEndpoints) {
    if (!endpointIds.has(endpointId)) errors.push(`Missing QC endpoint: ${endpointId}.`);
  }
  for (const [index, endpoint] of endpoints.entries()) {
    const label = stringAt(endpoint, "endpointId", `endpoint-${index + 1}`);
    for (const field of ["endpointId", "name", "purpose", "checksFor", "allowedInputs", "allowedOutputs", "possibleRoutes", "humanApprovalTriggers"]) {
      if (!(field in endpoint)) errors.push(`${label} missing ${field}.`);
    }
    for (const arrayField of ["checksFor", "allowedInputs", "allowedOutputs", "possibleRoutes", "humanApprovalTriggers"]) {
      if (stringArray(endpoint[arrayField]).length === 0) errors.push(`${label} must include non-empty ${arrayField}.`);
    }
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const action of hardBlockedActions) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions missing ${action}.`);
  }

  const routes = arrayOfRecords(report.escalationRoutes);
  if (routes.length === 0) errors.push("escalationRoutes must be a non-empty array.");
  const routeTargets = new Set(routes.map((route) => stringAt(route, "to", "")));
  for (const target of ["The Gaffer", "Danny", "Inspector Proof"]) {
    if (!routeTargets.has(target)) errors.push(`Missing escalation route to ${target}.`);
  }

  const approvalRules = stringArray(report.humanApprovalRules);
  if (approvalRules.length === 0) errors.push("humanApprovalRules must be non-empty.");
  if (!approvalRules.some((rule) => rule.toLowerCase().includes("trust rating"))) errors.push("humanApprovalRules must mention trust rating review.");
  if (!approvalRules.some((rule) => rule.toLowerCase().includes("affiliate"))) errors.push("humanApprovalRules must mention affiliate review.");
  if (!approvalRules.some((rule) => rule.toLowerCase().includes("scam") || rule.toLowerCase().includes("fraud"))) errors.push("humanApprovalRules must mention scam/fraud/legal review.");

  const reportErrors = stringArray(report.errors);
  if (reportErrors.length > 0) errors.push(`Report contains internal errors: ${reportErrors.join("; ")}`);
  const reportWarnings = stringArray(report.warnings);
  if (reportWarnings.length > 0) warnings.push(...reportWarnings);
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
  validateQcDepartmentV2().catch((error) => {
    logger.error("QC Department v2 validation crashed", { error });
    process.exitCode = 1;
  });
}
