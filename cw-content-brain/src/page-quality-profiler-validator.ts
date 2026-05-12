import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/page_quality_profiler_report.json";
const requiredTopLevelFields = ["generatedAt", "sourceInputs", "summary", "pageFindings", "validationStatus"];
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

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "approved lifecycle state", pattern: /"currentLifecycleState"\s*:\s*"approved"/i },
  { label: "applied lifecycle state", pattern: /"currentLifecycleState"\s*:\s*"applied"/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "live publishing enabled", pattern: /live publishing enabled/i },
  { label: "auto apply enabled", pattern: /auto apply enabled/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function validatePageQualityProfiler(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:page-quality first.`);
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
    logger.error("Page quality profiler validation failed", summary);
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

  const blockedStates = stringArray(report.blockedLifecycleStates);
  if (!blockedStates.includes("approved") || !blockedStates.includes("applied")) errors.push("blockedLifecycleStates must include approved and applied.");
  const allowedStates = stringArray(report.allowedLifecycleStates);
  if (allowedStates.includes("approved") || allowedStates.includes("applied")) errors.push("allowedLifecycleStates must exclude approved and applied.");

  const findings = arrayOfRecords(report.pageFindings);
  for (const [index, finding] of findings.entries()) {
    const label = stringAt(finding, "pageId", `finding-${index + 1}`);
    for (const field of ["inferredPageType", "priority", "weaknessCategories", "evidenceGaps", "recommendedNextOwner", "recommendedBlueprintNeed", "currentLifecycleState"]) {
      if (!(field in finding)) errors.push(`${label} missing required field ${field}.`);
    }
    const lifecycle = stringAt(finding, "currentLifecycleState", "");
    if (!allowedLifecycleStates.has(lifecycle)) errors.push(`${label} has invalid currentLifecycleState ${lifecycle}.`);
    if (lifecycle === "approved" || lifecycle === "applied") errors.push(`${label} must not use approved/applied lifecycle states.`);
    if (finding.canAutoApply !== false) errors.push(`${label} must have canAutoApply false.`);
    if (finding.needsHumanReview !== true) errors.push(`${label} must have needsHumanReview true.`);
    if (finding.draftOnly !== true) errors.push(`${label} must have draftOnly true.`);
    if (stringArray(finding.weaknessCategories).length === 0) warnings.push(`${label} has no weakness categories.`);
  }

  const summary = recordAt(report, "summary");
  for (const field of ["pagesReviewed", "findingCount", "byPriority", "byLifecycleState", "byWeaknessCategory"]) {
    if (!(field in summary)) errors.push(`summary missing ${field}.`);
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const action of ["No publishing.", "No Supabase writes.", "No approval/apply workflow.", "No live crawling/fetching."]) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions must include "${action}"`);
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
  validatePageQualityProfiler().catch((error) => {
    logger.error("Page quality profiler validation crashed", { error });
    process.exitCode = 1;
  });
}
