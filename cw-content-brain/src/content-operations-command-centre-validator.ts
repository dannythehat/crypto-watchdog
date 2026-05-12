import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportJson = "data/reports/content_operations_command_centre_report.json";
const reportMd = "data/reports/content_operations_command_centre_report.md";
const readmePath = "README.md";
const roadmapPath = "docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md";

const expectedOperationTypes = [
  "new_article_needed",
  "review_rebuild_needed",
  "old_content_update_needed",
  "blog_post_needed",
  "category_authority_page_needed",
  "warning_page_review_needed",
  "seo_refresh_needed",
  "keyword_gap_review_needed",
  "heading_structure_fix",
  "metadata_update_needed",
  "internal_links_needed",
  "external_sources_needed",
  "related_cards_needed",
  "comparison_section_needed",
  "faq_section_needed",
  "screenshot_plan_needed",
  "image_placement_needed",
  "video_placement_needed",
  "social_post_needed",
  "brand_voice_review_needed",
  "formatting_review_needed",
  "evidence_needed",
  "affiliate_disclosure_review_needed",
  "manager_escalation_needed",
  "qc_review_needed",
  "danny_decision_needed",
];

const expectedPriorityBuckets = [
  "do_next_safe_planning",
  "content_manager_review",
  "seo_manager_review",
  "keyword_manager_review",
  "link_manager_review",
  "media_manager_review",
  "social_manager_review",
  "qa_brand_voice_review",
  "evidence_manager_review",
  "affiliate_manager_review",
  "needs_qc_review",
  "recommended_for_danny_review",
  "blocked_risk",
  "monitor_only",
];

const expectedManagersAndAgents = [
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
];

const expectedBlockedActions = [
  "supabase_write",
  "publishing",
  "live_content_edit",
  "affiliate_url_insertion",
  "approval_apply_workflow",
  "secret_or_api_key_access",
  "live_crawling_or_fetching",
  "ai_or_external_api_call",
  "generated_output_commit",
  "trust_rating_change",
  "unsupported_scam_or_fraud_accusation",
  "media_generation",
  "media_download_or_upload",
  "patch_file_creation",
  "update_payload_creation",
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
  { label: "approved operational stage", pattern: /"(?:currentStage|statusStage|stage|lifecycleStage)"\s*:\s*"approved"/i },
  { label: "applied operational stage", pattern: /"(?:currentStage|statusStage|stage|lifecycleStage)"\s*:\s*"applied"/i },
  { label: "publish now", pattern: /publish now/i },
  { label: "ready to publish", pattern: /ready to publish/i },
  { label: "apply live", pattern: /apply live/i },
  { label: "write to Supabase", pattern: /(write to Supabase now|ready to write to Supabase|should write to Supabase)/i },
  { label: "Supabase write enabled", pattern: /Supabase write (enabled|payload|operation)/i },
  { label: "insert affiliate URL", pattern: /(insert affiliate url now|affiliate url insertion enabled|add affiliate url now)/i },
  { label: "trust rating change enabled", pattern: /(change trust rating now|trust rating change enabled|apply trust rating)/i },
  { label: "approval/apply enabled", pattern: /(approval apply enabled|auto apply enabled|approval workflow enabled)/i },
  { label: "AI/API call enabled", pattern: /(ai api call enabled|external api call enabled|call openai now|call external api now)/i },
  { label: "live crawl enabled", pattern: /(live crawling enabled|live fetching enabled|crawl live site now)/i },
  { label: "media generation enabled", pattern: /(generate images now|generate video now|media generation enabled|download media now|upload media now)/i },
  { label: "patch/update payload", pattern: /(create patch file now|create update payload now|patch file ready|update payload ready)/i },
  { label: "final scam/fraud accusation", pattern: /(confirmed scam without approval|fraud accusation final|scam accusation final)/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key exposure", pattern: /(api key exposed|api key value|use api key now)/i },
];

export async function validateContentOperationsCommandCentre(): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];
  const absoluteJsonPath = fromRoot(reportJson);
  const absoluteMdPath = fromRoot(reportMd);

  if (!existsSync(absoluteJsonPath)) {
    errors.push(`Missing report JSON: ${absoluteJsonPath}. Run npm run content:ops-command first.`);
  }
  if (!existsSync(absoluteMdPath)) {
    errors.push(`Missing report Markdown: ${absoluteMdPath}. Run npm run content:ops-command first.`);
  }

  const rawJson = existsSync(absoluteJsonPath) ? await readFile(absoluteJsonPath, "utf8") : "";
  const rawMd = existsSync(absoluteMdPath) ? await readFile(absoluteMdPath, "utf8") : "";
  const combinedRaw = `${rawJson}\n${rawMd}`;
  for (const unsafe of unsafeMarkers) {
    if (unsafe.pattern.test(combinedRaw)) unsafeMarkersFound.push(unsafe.label);
  }

  if (rawJson) {
    try {
      validateReport(JSON.parse(rawJson) as Record<string, unknown>, errors, warnings);
    } catch (error) {
      errors.push(`Report JSON did not parse: ${String(error)}`);
    }
  }

  await validateReadmeAndRoadmap(errors);

  const passed = errors.length === 0 && unsafeMarkersFound.length === 0;
  const summary = {
    status: passed ? "passed" : "failed",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    reportJson: absoluteJsonPath,
    reportMd: absoluteMdPath,
    canAutoApply: false,
    approvedCount: 0,
    appliedCount: 0,
    operationTypesChecked: expectedOperationTypes.length,
    priorityBucketsChecked: expectedPriorityBuckets.length,
    managersChecked: expectedManagersAndAgents.length,
    blockedActionsChecked: expectedBlockedActions.length,
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!passed) {
    logger.error("Content Operations Command Centre validation failed", summary);
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
    "purpose",
    "inputReportsChecked",
    "availableSignals",
    "contentOperationTypes",
    "priorityBuckets",
    "departmentRouting",
    "qcEscalationRules",
    "dannyDecisionRules",
    "blockedActions",
    "allowedStates",
    "blockedStates",
    "nextRecommendedBuild",
    "errors",
    "warnings",
  ]) {
    if (!(field in report)) errors.push(`Missing required field: ${field}.`);
  }

  if (report.safetyMode !== "READ_ONLY_REPORT_ONLY") errors.push("safetyMode must be READ_ONLY_REPORT_ONLY.");
  if (report.canAutoApply !== false) errors.push("canAutoApply must be false.");
  if (report.approvedCount !== 0) errors.push("approvedCount must be 0.");
  if (report.appliedCount !== 0) errors.push("appliedCount must be 0.");
  if (report.departmentName !== "Content Operations Command Centre v1") errors.push("departmentName must be Content Operations Command Centre v1.");
  if (report.managerName !== "The Gaffer" || report.managerCodename !== "The Gaffer") errors.push("The Gaffer must manage the Content Operations Command Centre.");

  const reportAllowedStates = stringArray(report.allowedStates);
  for (const state of reportAllowedStates) {
    if (!allowedStates.has(state)) errors.push(`Invalid allowed state: ${state}.`);
  }
  if (reportAllowedStates.includes("approved") || reportAllowedStates.includes("applied")) errors.push("approved/applied must not appear in allowedStates.");

  const blockedStates = stringArray(report.blockedStates);
  if (!blockedStates.includes("approved") || !blockedStates.includes("applied")) errors.push("blockedStates must include approved and applied.");

  const operationTypes = arrayOfRecords(report.contentOperationTypes);
  const operationTypeIds = new Set(operationTypes.map((item) => stringAt(item, "operationType", "")));
  for (const operationType of expectedOperationTypes) {
    if (!operationTypeIds.has(operationType)) errors.push(`Missing operation type: ${operationType}.`);
  }
  for (const [index, item] of operationTypes.entries()) {
    const label = stringAt(item, "operationType", `operation-${index + 1}`);
    for (const field of ["operationType", "purpose", "defaultPriorityBucket", "defaultManager", "supportAgents", "requiresQcReview", "requiresDannyDecision"]) {
      if (!(field in item)) errors.push(`${label} missing ${field}.`);
    }
  }

  const priorityBuckets = arrayOfRecords(report.priorityBuckets);
  const bucketIds = new Set(priorityBuckets.map((item) => stringAt(item, "bucketId", "")));
  for (const bucket of expectedPriorityBuckets) {
    if (!bucketIds.has(bucket)) errors.push(`Missing priority bucket: ${bucket}.`);
  }

  const blockedActions = stringArray(report.blockedActions);
  for (const action of expectedBlockedActions) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions missing ${action}.`);
  }

  const routing = arrayOfRecords(report.departmentRouting);
  if (routing.length === 0) errors.push("departmentRouting must be a non-empty array.");
  const routingRaw = JSON.stringify(routing);
  for (const manager of expectedManagersAndAgents) {
    if (!routingRaw.includes(manager) && !JSON.stringify(report).includes(manager)) errors.push(`Missing expected manager/agent: ${manager}.`);
  }

  if (arrayOfRecords(report.inputReportsChecked).length === 0) errors.push("inputReportsChecked must be non-empty.");
  if (stringArray(report.qcEscalationRules).length === 0) errors.push("qcEscalationRules must be non-empty.");
  if (stringArray(report.dannyDecisionRules).length === 0) errors.push("dannyDecisionRules must be non-empty.");

  const reportErrors = stringArray(report.errors);
  if (reportErrors.length > 0) errors.push(`Report contains internal errors: ${reportErrors.join("; ")}`);
  const reportWarnings = stringArray(report.warnings);
  if (reportWarnings.length > 0) warnings.push(...reportWarnings);
}

async function validateReadmeAndRoadmap(errors: string[]): Promise<void> {
  const readme = await readRequiredText(readmePath, errors);
  const roadmap = await readRequiredText(roadmapPath, errors);

  if (readme && !readme.includes("Content Operations Command Centre")) errors.push("README must mention Content Operations Command Centre.");
  if (roadmap && !roadmap.includes("Build #50")) errors.push("Roadmap must include Build #50.");
  if (roadmap && !roadmap.includes("Content Operations Command Centre v1")) errors.push("Roadmap must mention Content Operations Command Centre v1.");
}

async function readRequiredText(path: string, errors: string[]): Promise<string> {
  const absolutePath = fromRoot(path);
  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${absolutePath}.`);
    return "";
  }
  return readFile(absolutePath, "utf8");
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
  validateContentOperationsCommandCentre().catch((error) => {
    logger.error("Content Operations Command Centre validation crashed", { error });
    process.exitCode = 1;
  });
}
