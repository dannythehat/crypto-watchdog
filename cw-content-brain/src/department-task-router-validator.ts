import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/department_task_router_report.json";
const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "canApprove true", pattern: /canApprove["\s:]+true/i },
  { label: "canApply true", pattern: /canApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "live publishing enabled", pattern: /live publishing enabled/i },
  { label: "auto apply enabled", pattern: /auto apply enabled/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function validateDepartmentTaskRouter(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:department-router first.`);
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
    logger.error("Department task router validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const routingModel = recordAt(report, "routingModel");
  const allowed = stringArray(routingModel.allowedRoutedStages);
  const blocked = stringArray(routingModel.blockedRoutedStages);
  if (allowed.includes("approved") || allowed.includes("applied")) errors.push("allowed routed stages must exclude approved and applied.");
  for (const stage of ["approved", "applied"]) {
    if (!blocked.includes(stage)) errors.push(`blocked routed stages must include ${stage}.`);
  }

  const inboxes = arrayOfRecords(report.departmentInboxes);
  if (inboxes.length < 16) errors.push("departmentInboxes must include all required manager inboxes.");
  for (const inbox of inboxes) {
    const id = stringAt(inbox, "inboxId", "unknown-inbox");
    if (inbox.canApprove !== false) errors.push(`${id} must have canApprove false.`);
    if (inbox.canApply !== false) errors.push(`${id} must have canApply false.`);
    const blockedStages = stringArray(inbox.blockedLifecycleStages);
    if (!blockedStages.includes("approved") || !blockedStages.includes("applied")) errors.push(`${id} must block approved and applied stages.`);
  }

  const safeApply = inboxes.find((inbox) => inbox.inboxId === "safe-apply-engine-inbox");
  if (!safeApply || safeApply.futureOnly !== true) errors.push("Safe Apply Engine Inbox must exist and be future-only.");
  const danny = inboxes.find((inbox) => inbox.inboxId === "danny-approval-inbox");
  if (!danny || danny.keyDecisionsOnly !== true || danny.canApply !== false) errors.push("Danny Approval Inbox must be key-decisions-only and cannot apply.");

  const routingRules = arrayOfRecords(report.routingRules);
  if (routingRules.length === 0) errors.push("routingRules must include route definitions.");
  for (const route of routingRules) {
    const id = stringAt(route, "ruleId", "unknown-rule");
    if (!stringAt(route, "primaryInbox", "")) errors.push(`${id} must include primaryInbox.`);
    if (route.routeToDanny === true && route.sensitive !== true) {
      errors.push(`${id} routes to Danny without being clearly sensitive/key review-only.`);
    }
    const stage = stringAt(route, "requiredLifecycleStage", "");
    if (stage === "approved" || stage === "applied") errors.push(`${id} uses blocked lifecycle stage ${stage}.`);
  }

  const managerDecisionOptions = stringArray(report.managerDecisionOptions);
  for (const blockedAction of ["publish", "apply", "write_to_supabase"]) {
    if (managerDecisionOptions.includes(blockedAction)) errors.push(`managerDecisionOptions must exclude ${blockedAction}.`);
  }
  if (!managerDecisionOptions.includes("request_more_evidence") || !managerDecisionOptions.includes("block_due_to_risk")) {
    warnings.push("managerDecisionOptions should include evidence and risk-blocking options.");
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
  validateDepartmentTaskRouter().catch((error) => {
    logger.error("Department task router validation crashed", { error });
    process.exitCode = 1;
  });
}
