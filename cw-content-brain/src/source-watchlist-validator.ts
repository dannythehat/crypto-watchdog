import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/source_watchlist_report.json";

const requiredBlockedActions = ["No publishing", "No Supabase writes", "No approval/apply workflow"];

const unsafeMarkers = [
  { label: "canAutoApply true", pattern: /canAutoApply["\s:]+true/i },
  { label: "approved true", pattern: /"approved"\s*:\s*true/i },
  { label: "applied true", pattern: /"applied"\s*:\s*true/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /write to Supabase/i },
  { label: "live monitoring enabled", pattern: /live monitoring enabled/i },
  { label: "live crawling enabled", pattern: /live crawling enabled/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function validateSourceWatchlist(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];
  let watchlistItemCount = 0;
  let sourceCategoryCount = 0;

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:source-watchlist first.`);
  } else {
    const raw = await readFile(absolutePath, "utf8");
    for (const unsafe of unsafeMarkers) {
      if (unsafe.pattern.test(raw)) unsafeMarkersFound.push(unsafe.label);
    }

    try {
      const report = JSON.parse(raw) as Record<string, unknown>;
      validateReportShape(report, errors, warnings);
      watchlistItemCount = Array.isArray(report.watchlistItems) ? report.watchlistItems.length : 0;
      sourceCategoryCount = Array.isArray(report.sourceCategories) ? report.sourceCategories.length : 0;
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
    sourceCategoryCount,
    watchlistItemCount,
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!passed) {
    logger.error("Source watchlist validation failed", summary);
    process.exitCode = 1;
  }
}

function validateReportShape(report: Record<string, unknown>, errors: string[], warnings: string[]): void {
  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");

  const watchlistItems = arrayOfRecords(report.watchlistItems);
  const categories = arrayOfRecords(report.sourceCategories);
  const blockedActions = Array.isArray(report.blockedActions) ? report.blockedActions.map((action) => String(action)) : [];

  if (categories.length === 0) errors.push("sourceCategories must include at least one category.");
  if (watchlistItems.length === 0) errors.push("watchlistItems must include at least one item.");

  for (const required of requiredBlockedActions) {
    if (!blockedActions.some((action) => action.toLowerCase().includes(required.toLowerCase()))) {
      errors.push(`blockedActions must include: ${required}.`);
    }
  }

  for (const item of watchlistItems) {
    const id = stringAt(item, "id", "unknown-item");
    if (item.allowedNow === "live_monitoring" || item.allowedNow === "live_fetching") {
      errors.push(`${id} has unsafe allowedNow: ${String(item.allowedNow)}.`);
    }
    const status = String(item.status ?? item.currentStage ?? item.statusStage ?? item.stage ?? "").toLowerCase();
    if (status === "approved" || status === "applied") {
      errors.push(`${id} has unsafe approved/applied status stage.`);
    }
    if (item.canAutoApply === true) {
      errors.push(`${id} has canAutoApply true.`);
    }
    if (item.requiresHumanApproval !== true && item.riskLevel === "high") {
      warnings.push(`${id} is high risk and should require human approval.`);
    }
  }

  const safetyChecks = recordAt(report, "safetyChecks");
  if (safetyChecks.noLiveCrawling !== true) errors.push("safetyChecks.noLiveCrawling must be true.");
  if (safetyChecks.noLiveFetching !== true) errors.push("safetyChecks.noLiveFetching must be true.");
  if (safetyChecks.noSupabaseWrites !== true) errors.push("safetyChecks.noSupabaseWrites must be true.");
  if (safetyChecks.noPublishing !== true) errors.push("safetyChecks.noPublishing must be true.");
  if (safetyChecks.humanApprovalBeforeFutureConnectors !== true) {
    errors.push("safetyChecks.humanApprovalBeforeFutureConnectors must be true.");
  }
}

function arrayOfRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item)) : [];
}

function recordAt(value: Record<string, unknown>, key: string): Record<string, unknown> {
  const child = value[key];
  return typeof child === "object" && child !== null && !Array.isArray(child) ? (child as Record<string, unknown>) : {};
}

function stringAt(value: Record<string, unknown>, key: string, fallback: string): string {
  const child = value[key];
  return typeof child === "string" && child.trim() ? child : fallback;
}

if (isDirectRun(import.meta.url)) {
  validateSourceWatchlist().catch((error) => {
    logger.error("Source watchlist validation crashed", { error });
    process.exitCode = 1;
  });
}
