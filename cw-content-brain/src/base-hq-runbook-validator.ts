import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/base_hq_runbook_report.json";

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

export async function validateBaseHqRunbook(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:base-runbook first.`);
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
    logger.error("Base HQ runbook validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReport(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const components = stringArray(report.completedBaseComponents);
  for (const component of ["Source Watchlist v1", "Agent Output Contract v1", "Department Inbox / Task Router v1", "Human Decision Log / Audit Trail v1", "Base HQ Runbook v1"]) {
    if (!components.includes(component)) errors.push(`completedBaseComponents must include ${component}.`);
  }

  const dailyFlow = arrayOfRecords(recordAt(report, "currentDailyFlow").requiredSafeChain).map((step) => stringAt(step, "command", ""));
  for (const command of ["content:daily-run", "content:daily-pack", "content:dashboard-export", "content:dashboard-validate", "dashboard:build", "dashboard:validate", "dashboard:smoke", "dashboard:ui-guard"]) {
    if (!dailyFlow.includes(command)) errors.push(`currentDailyFlow must include ${command}.`);
  }

  const lifecycle = recordAt(report, "agentLifecycleRules");
  const allowed = stringArray(lifecycle.allowedCurrentBaseStates);
  const blocked = stringArray(lifecycle.blockedCurrentBaseStates);
  if (allowed.includes("approved") || allowed.includes("applied")) errors.push("Allowed lifecycle states must exclude approved and applied.");
  for (const stage of ["approved", "applied"]) {
    if (!blocked.includes(stage)) errors.push(`Blocked lifecycle states must include ${stage}.`);
  }

  const blueprint = recordAt(report, "contentBlueprintPrinciples");
  const blueprintText = JSON.stringify(blueprint).toLowerCase();
  for (const phrase of ["evidence first", "opinion-led", "no random fluff", "contenttypeevidencerules"]) {
    if (!blueprintText.includes(phrase)) errors.push(`contentBlueprintPrinciples must include ${phrase}.`);
  }

  const connectorText = stringArray(report.futureConnectorRules).join(" ").toLowerCase();
  for (const phrase of ["read-only", "local/export-only", "no secrets", "no writes"]) {
    if (!connectorText.includes(phrase)) errors.push(`futureConnectorRules must include ${phrase}.`);
  }

  const safeApplyText = stringArray(report.futureSafeApplyRules).join(" ").toLowerCase();
  for (const phrase of ["preview", "diff", "approval", "rollback", "audit entry"]) {
    if (!safeApplyText.includes(phrase)) errors.push(`futureSafeApplyRules must include ${phrase}.`);
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const action of ["No publishing.", "No Supabase writes.", "No approval/apply workflow."]) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions must include "${action}"`);
  }

  if (!Array.isArray(report.recommendedNextBuildOrder) || report.recommendedNextBuildOrder.length === 0) {
    warnings.push("recommendedNextBuildOrder should include future build guidance.");
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
  validateBaseHqRunbook().catch((error) => {
    logger.error("Base HQ runbook validation crashed", { error });
    process.exitCode = 1;
  });
}
