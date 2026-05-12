import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/human_decision_log_report.json";

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "approvalStatus approved", pattern: /"approvalStatus"\s*:\s*"approved"/i },
  { label: "applyStatus applied", pattern: /"applyStatus"\s*:\s*"applied"/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "live publishing enabled", pattern: /live publishing enabled/i },
  { label: "auto apply enabled", pattern: /auto apply enabled/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

const requiredFields = ["managerDecisionReason", "qcDecisionReason", "dannyDecisionReason", "approvalStatus", "applyStatus", "immutableNote"];

export async function validateHumanDecisionLog(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:decision-log first.`);
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
    logger.error("Human decision log validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const requiredAuditFields = stringArray(report.requiredAuditFields);
  for (const field of requiredFields) {
    if (!requiredAuditFields.includes(field)) errors.push(`requiredAuditFields must include ${field}.`);
  }

  const allowedStages = stringArray(report.allowedDecisionStagesV1);
  const blockedStages = stringArray(report.blockedDecisionStagesV1);
  if (allowedStages.includes("approved") || allowedStages.includes("applied")) {
    errors.push("allowedDecisionStagesV1 must exclude approved and applied.");
  }
  for (const stage of ["approved", "applied"]) {
    if (!blockedStages.includes(stage)) errors.push(`blockedDecisionStagesV1 must include ${stage}.`);
  }

  const decisionTypes = stringArray(report.decisionTypes);
  for (const requiredType of ["request_more_evidence", "route_to_department", "escalate_to_qc", "recommend_for_danny_review", "block_due_to_risk"]) {
    if (!decisionTypes.includes(requiredType)) warnings.push(`decisionTypes should include ${requiredType}.`);
  }

  const blockedDecisionTypes = stringArray(report.blockedDecisionTypes);
  for (const blockedType of ["publish", "apply", "write_to_supabase", "change_rating", "insert_affiliate_link", "execute_safe_apply"]) {
    if (!blockedDecisionTypes.includes(blockedType)) errors.push(`blockedDecisionTypes must include ${blockedType}.`);
  }

  const examples = arrayOfRecords(report.exampleAuditEntries);
  if (examples.length < 6) errors.push("exampleAuditEntries must include the requested audit examples.");
  for (const example of examples) {
    const id = stringAt(example, "auditId", "unknown-example");
    const lifecycleStage = stringAt(example, "lifecycleStage", "");
    const status = stringAt(example, "status", "");
    if (lifecycleStage === "approved" || lifecycleStage === "applied") errors.push(`${id} must not use approved/applied lifecycleStage.`);
    if (status === "approved" || status === "applied") errors.push(`${id} must not use approved/applied status.`);
    if (example.canAutoApply !== false) errors.push(`${id} must have canAutoApply false.`);
    if (example.approvalStatus === "approved") errors.push(`${id} must not have approvalStatus approved.`);
    if (example.applyStatus === "applied") errors.push(`${id} must not have applyStatus applied.`);
    if (example.approvalStatus !== "not_approved") errors.push(`${id} must have approvalStatus not_approved.`);
    if (example.applyStatus !== "not_applied") errors.push(`${id} must have applyStatus not_applied.`);
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const requiredAction of ["No publishing.", "No Supabase writes.", "No approval/apply workflow."]) {
    if (!blockedActions.includes(requiredAction)) errors.push(`blockedActions must include "${requiredAction}"`);
  }

  const dannyRecords = arrayOfRecords(report.dannyDecisionRecordsFutureOnly);
  if (dannyRecords.length === 0) errors.push("dannyDecisionRecordsFutureOnly must document future Danny decision records.");
  for (const record of dannyRecords) {
    if (record.availableInV1 !== false) errors.push("Danny decision records must be future-only in v1.");
    if (record.canApproveInV1 !== false || record.canApplyInV1 !== false) errors.push("Danny decision records cannot approve or apply in v1.");
  }
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
  validateHumanDecisionLog().catch((error) => {
    logger.error("Human decision log validation crashed", { error });
    process.exitCode = 1;
  });
}
