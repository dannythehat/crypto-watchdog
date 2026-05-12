import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportPath = "data/reports/media_video_brief_agent_report.json";
const requiredTopLevelFields = ["generatedAt", "sourceInputs", "summary", "mediaBriefRecommendations", "validationStatus"];
const requiredRecommendationFields = [
  "inferredPageType",
  "sourcePriority",
  "recommendedMediaBriefType",
  "screenshotNeeds",
  "proofBlockNeeds",
  "imageNeeds",
  "diagramNeeds",
  "videoBriefNeeds",
  "comparisonVisualNeeds",
  "reviewCardVisualNeeds",
  "mobileMediaNotes",
  "evidenceRequirements",
  "riskAndComplianceNotes",
  "altTextGuidance",
  "recommendedNextOwner",
  "recommendedLifecycleState",
];

const allowedMediaBriefTypes = new Set([
  "review_media_brief",
  "category_hub_media_brief",
  "guide_media_brief",
  "warning_safety_media_brief",
  "comparison_media_brief",
  "full_rebuild_media_brief",
]);

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
  { label: "approved lifecycle state", pattern: /"recommendedLifecycleState"\s*:\s*"approved"/i },
  { label: "applied lifecycle state", pattern: /"recommendedLifecycleState"\s*:\s*"applied"/i },
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
  { label: "generate images", pattern: /\b(generate|create|produce)\s+(actual\s+)?images?\b/i },
  { label: "generate videos", pattern: /\b(generate|create|produce)\s+(actual\s+)?videos?\b/i },
  { label: "download external media", pattern: /(download external media now|external media download enabled|downloaded external media)/i },
  { label: "scrape media", pattern: /(scrape external media now|external media scraping enabled|scraped external media)/i },
  { label: "upload media", pattern: /(upload media now|media upload enabled|uploaded media)/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key", pattern: /API key/i },
];

export async function validateMediaVideoBriefAgent(): Promise<void> {
  const absolutePath = fromRoot(reportPath);
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];

  if (!existsSync(absolutePath)) {
    errors.push(`Missing report JSON: ${absolutePath}. Run npm run content:media-briefs first.`);
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
    logger.error("Media + video brief agent validation failed", summary);
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

  for (const input of arrayOfRecords(report.sourceInputs)) {
    if (input.required === true && input.found !== true) errors.push(`Required source input missing: ${stringAt(input, "path", "unknown")}.`);
  }

  const recommendations = arrayOfRecords(report.mediaBriefRecommendations);
  if (!Array.isArray(report.mediaBriefRecommendations)) errors.push("mediaBriefRecommendations must be an array.");
  for (const [index, recommendation] of recommendations.entries()) {
    const label = stringAt(recommendation, "pageId", `recommendation-${index + 1}`);
    for (const field of requiredRecommendationFields) {
      if (!(field in recommendation)) errors.push(`${label} missing required field ${field}.`);
    }
    const mediaBriefType = stringAt(recommendation, "recommendedMediaBriefType", "");
    if (!allowedMediaBriefTypes.has(mediaBriefType)) errors.push(`${label} has invalid recommendedMediaBriefType ${mediaBriefType}.`);
    const lifecycle = stringAt(recommendation, "recommendedLifecycleState", "");
    if (!allowedLifecycleStates.has(lifecycle)) errors.push(`${label} has invalid recommendedLifecycleState ${lifecycle}.`);
    if (lifecycle === "approved" || lifecycle === "applied") errors.push(`${label} must not use approved/applied lifecycle states.`);
    if (recommendation.canAutoApply !== false) errors.push(`${label} must have canAutoApply false.`);
    if (recommendation.needsHumanReview !== true) errors.push(`${label} must have needsHumanReview true.`);
    if (recommendation.draftOnly !== true) errors.push(`${label} must have draftOnly true.`);
    for (const arrayField of [
      "screenshotNeeds",
      "proofBlockNeeds",
      "imageNeeds",
      "diagramNeeds",
      "videoBriefNeeds",
      "comparisonVisualNeeds",
      "reviewCardVisualNeeds",
      "mobileMediaNotes",
      "evidenceRequirements",
      "riskAndComplianceNotes",
      "altTextGuidance",
    ]) {
      if (stringArray(recommendation[arrayField]).length === 0) errors.push(`${label} must include non-empty ${arrayField}.`);
    }
  }

  const summary = recordAt(report, "summary");
  for (const field of [
    "sourceQualityFindingCount",
    "sourceBlueprintRecommendationCount",
    "sourceClusterRecommendationCount",
    "snapshotRecordCount",
    "recommendationCount",
    "byMediaBriefType",
    "byLifecycleState",
    "byOwner",
  ]) {
    if (!(field in summary)) errors.push(`summary missing ${field}.`);
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const action of ["No publishing.", "No Supabase writes.", "No approval/apply workflow.", "No live crawling/fetching.", "No actual image/video generation in v1.", "No downloading external media."]) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions must include "${action}"`);
  }

  if (recommendations.length === 0) warnings.push("No media brief recommendations were generated. This is safe, but page quality/blueprint/cluster inputs may be missing or empty.");
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
  validateMediaVideoBriefAgent().catch((error) => {
    logger.error("Media + video brief agent validation crashed", { error });
    process.exitCode = 1;
  });
}
