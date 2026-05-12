import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/agent_output_contract_report.json";

const requiredFields = ["lifecycleStage", "confidenceLevel", "evidenceStrength", "requiresHumanApproval", "recommendedReviewer", "blockedActions"];

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
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

export async function validateAgentOutputContract(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:agent-output-contract first.`);
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
    logger.error("Agent output contract validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const allowedStages = stringArray(report.allowedStagesV1);
  const blockedStages = stringArray(report.blockedStagesV1);
  if (allowedStages.includes("approved") || allowedStages.includes("applied")) {
    errors.push("allowedStagesV1 must exclude approved and applied.");
  }
  for (const stage of ["approved", "applied"]) {
    if (!blockedStages.includes(stage)) errors.push(`blockedStagesV1 must include ${stage}.`);
  }

  const outputFields = stringArray(report.requiredAgentOutputFields);
  for (const field of requiredFields) {
    if (!outputFields.includes(field)) errors.push(`requiredAgentOutputFields must include ${field}.`);
  }

  const validOutputs = arrayOfRecords(report.exampleValidOutputs);
  if (validOutputs.length === 0) errors.push("exampleValidOutputs must include examples.");
  for (const output of validOutputs) {
    const id = stringAt(output, "outputId", "unknown-valid-output");
    const stage = stringAt(output, "lifecycleStage", "").toLowerCase();
    const status = stringAt(output, "status", "").toLowerCase();
    if (stage === "approved" || stage === "applied") errors.push(`${id} has unsafe lifecycleStage ${stage}.`);
    if (status === "approved" || status === "applied") errors.push(`${id} has unsafe status ${status}.`);
    if (output.canAutoApply === true) errors.push(`${id} has canAutoApply true.`);
  }

  const invalidOutputs = arrayOfRecords(report.exampleInvalidOutputs);
  if (invalidOutputs.length === 0) errors.push("exampleInvalidOutputs must identify unsafe examples.");
  const invalidText = JSON.stringify(invalidOutputs).toLowerCase();
  if (!invalidText.includes("approved") || !invalidText.includes("applied")) {
    errors.push("exampleInvalidOutputs must identify approved and applied as unsafe examples.");
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const expected of ["No publishing.", "No Supabase writes.", "No approval/apply workflow.", "No approved actions in v1.", "No applied actions in v1."]) {
    if (!blockedActions.includes(expected)) warnings.push(`blockedActions should include: ${expected}`);
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function arrayOfRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)) : [];
}

function stringAt(value: Record<string, unknown>, key: string, fallback: string): string {
  const child = value[key];
  return typeof child === "string" && child.trim() ? child : fallback;
}

if (isDirectRun(import.meta.url)) {
  validateAgentOutputContract().catch((error) => {
    logger.error("Agent output contract validation crashed", { error });
    process.exitCode = 1;
  });
}
