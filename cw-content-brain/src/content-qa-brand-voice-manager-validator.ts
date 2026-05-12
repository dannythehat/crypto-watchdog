import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fromRoot, isDirectRun } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const reportJson = "data/reports/content_qa_brand_voice_manager_report.json";
const reportMd = "data/reports/content_qa_brand_voice_manager_report.md";
const readmePath = "README.md";
const roadmapPath = "docs/WATCHDOG_HQ_BUILD_ROADMAP_STATUS.md";

const expectedQaCheckGroups = [
  "brand_voice",
  "evidence_first_language",
  "plain_english",
  "sceptical_not_cynical",
  "no_fluff",
  "unsupported_claims",
  "fake_testing_claims",
  "scam_wording_risk",
  "financial_advice_risk",
  "review_structure",
  "article_formatting",
  "heading_quality",
  "faq_quality",
  "intro_and_conclusion_quality",
  "internal_linking_quality",
  "external_source_support",
  "related_card_placement",
  "image_placement_notes",
  "video_placement_notes",
  "affiliate_disclosure",
  "mobile_readability",
  "human_review_needed",
  "qc_escalation_needed",
];

const expectedBrandVoiceRuleIds = [
  "evidence_first",
  "protection_first",
  "plain_english",
  "sceptical_not_cynical",
  "no_fluff",
  "no_hype",
  "no_fake_guarantees",
  "no_invented_testing",
  "no_unsupported_scam_fraud_claims",
  "no_buy_this_now",
  "commercial_but_trust_led",
];

const expectedArticleFormattingRuleIds = [
  "clear_h1_h2_h3",
  "useful_intro",
  "short_readable_paragraphs",
  "logical_review_order",
  "pros_cons_relevant",
  "fees_risks_features",
  "evidence_gap_section",
  "related_sections",
  "faqs",
  "clear_editorial_view",
  "mobile_readability",
];

const expectedReviewStructureRuleIds = [
  "what_was_tested",
  "what_was_not_tested",
  "screenshot_placeholder",
  "deposit_notes",
  "withdrawal_notes",
  "support_notes",
  "kyc_notes",
  "fee_notes",
  "risks_red_flags",
  "trust_rating_explanation",
  "who_should_use",
  "who_should_avoid",
  "alternatives_comparisons",
  "related_pages",
  "review_faqs",
  "evidence_gaps",
];

const expectedEvidenceLanguageRuleIds = [
  "tested_deposits_evidence",
  "tested_withdrawals_evidence",
  "screenshots_show_evidence",
  "safe_final_guarantee",
  "scam_fraud_final_accusation",
  "invented_rankings_users_partnerships",
  "fake_guarantees",
  "unsupported_rating_changes",
  "unsupported_financial_advice",
];

const expectedLinkRuleIds = [
  "natural_internal_links",
  "related_review_cards",
  "category_topic_connections",
  "new_blog_distribution",
  "evidence_supporting_external_links",
  "no_affiliate_url_insertion",
];

const expectedMediaRuleIds = [
  "image_placement_notes",
  "screenshot_placement_notes",
  "video_placement_notes",
  "comparison_visual_notes",
  "proof_block_notes",
  "mobile_stacking_notes",
  "no_media_generation_download_upload",
];

const expectedAffiliateRuleIds = [
  "disclosure_needed",
  "warning_red_risk_caution",
  "no_affiliate_cta_without_danny",
  "trust_before_commercial",
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
  "fake_testing_claim",
  "media_generation",
  "media_download_or_upload",
  "patch_file_creation",
  "update_payload_creation",
  "final_legal_or_policy_wording",
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
  { label: "final legal wording", pattern: /(final legal wording ready|final policy wording ready|legal wording approved)/i },
  { label: "service_role", pattern: /service_role/i },
  { label: "SUPABASE_SERVICE_ROLE", pattern: /SUPABASE_SERVICE_ROLE/i },
  { label: "API key exposure", pattern: /(api key exposed|api key value|use api key now)/i },
];

export async function validateContentQaBrandVoiceManager(): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsafeMarkersFound: string[] = [];
  const absoluteJsonPath = fromRoot(reportJson);
  const absoluteMdPath = fromRoot(reportMd);

  if (!existsSync(absoluteJsonPath)) errors.push(`Missing report JSON: ${absoluteJsonPath}. Run npm run content:qa-brand first.`);
  if (!existsSync(absoluteMdPath)) errors.push(`Missing report Markdown: ${absoluteMdPath}. Run npm run content:qa-brand first.`);

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
    qaCheckGroupsChecked: expectedQaCheckGroups.length,
    brandVoiceRulesChecked: expectedBrandVoiceRuleIds.length,
    articleFormattingRulesChecked: expectedArticleFormattingRuleIds.length,
    reviewStructureRulesChecked: expectedReviewStructureRuleIds.length,
    evidenceLanguageRulesChecked: expectedEvidenceLanguageRuleIds.length,
    blockedActionsChecked: expectedBlockedActions.length,
    unsafeMarkersChecked: unsafeMarkers.length,
    unsafeMarkersFound,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!passed) {
    logger.error("Content QA & Brand Voice Manager validation failed", summary);
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
    "qaCheckGroups",
    "brandVoiceRules",
    "articleFormattingRules",
    "reviewStructureRules",
    "evidenceLanguageRules",
    "seoReadabilityRules",
    "linkPlacementRules",
    "mediaPlacementRules",
    "affiliateDisclosureRules",
    "humanReviewRules",
    "qcEscalationRules",
    "contentRiskFlags",
    "allowedStates",
    "blockedStates",
    "blockedActions",
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
  if (report.departmentName !== "Content QA & Brand Voice Manager v1") errors.push("departmentName must be Content QA & Brand Voice Manager v1.");
  if (report.managerName !== "Gatekeeper Grace" || report.managerCodename !== "Gatekeeper Grace") errors.push("Gatekeeper Grace must manage Content QA & Brand Voice Manager v1.");

  const reportAllowedStates = stringArray(report.allowedStates);
  for (const state of reportAllowedStates) {
    if (!allowedStates.has(state)) errors.push(`Invalid allowed state: ${state}.`);
  }
  if (reportAllowedStates.includes("approved") || reportAllowedStates.includes("applied")) errors.push("approved/applied must not appear in allowedStates.");

  const blockedStates = stringArray(report.blockedStates);
  if (!blockedStates.includes("approved") || !blockedStates.includes("applied")) errors.push("blockedStates must include approved and applied.");

  checkMissingStrings("qaCheckGroups", stringArray(report.qaCheckGroups), expectedQaCheckGroups, errors);
  checkMissingRuleIds("brandVoiceRules", report.brandVoiceRules, expectedBrandVoiceRuleIds, errors);
  checkMissingRuleIds("articleFormattingRules", report.articleFormattingRules, expectedArticleFormattingRuleIds, errors);
  checkMissingRuleIds("reviewStructureRules", report.reviewStructureRules, expectedReviewStructureRuleIds, errors);
  checkMissingRuleIds("evidenceLanguageRules", report.evidenceLanguageRules, expectedEvidenceLanguageRuleIds, errors);
  checkMissingRuleIds("linkPlacementRules", report.linkPlacementRules, expectedLinkRuleIds, errors);
  checkMissingRuleIds("mediaPlacementRules", report.mediaPlacementRules, expectedMediaRuleIds, errors);
  checkMissingRuleIds("affiliateDisclosureRules", report.affiliateDisclosureRules, expectedAffiliateRuleIds, errors);

  const blockedActions = stringArray(report.blockedActions);
  for (const action of expectedBlockedActions) {
    if (!blockedActions.includes(action)) errors.push(`blockedActions missing ${action}.`);
  }

  if (arrayOfRecords(report.inputReportsChecked).length === 0) errors.push("inputReportsChecked must be non-empty.");
  if (stringArray(report.humanReviewRules).length === 0) errors.push("humanReviewRules must be non-empty.");
  if (stringArray(report.qcEscalationRules).length === 0) errors.push("qcEscalationRules must be non-empty.");
  if (stringArray(report.contentRiskFlags).length === 0) errors.push("contentRiskFlags must be non-empty.");

  const reportErrors = stringArray(report.errors);
  if (reportErrors.length > 0) errors.push(`Report contains internal errors: ${reportErrors.join("; ")}`);
  const reportWarnings = stringArray(report.warnings);
  if (reportWarnings.length > 0) warnings.push(...reportWarnings);
}

async function validateReadmeAndRoadmap(errors: string[]): Promise<void> {
  const readme = await readRequiredText(readmePath, errors);
  const roadmap = await readRequiredText(roadmapPath, errors);

  if (readme && !readme.includes("Content QA & Brand Voice Manager")) errors.push("README must mention Content QA & Brand Voice Manager.");
  if (roadmap && !roadmap.includes("Build #51")) errors.push("Roadmap must include Build #51.");
  if (roadmap && !roadmap.includes("Content QA & Brand Voice Manager v1")) errors.push("Roadmap must mention Content QA & Brand Voice Manager v1.");
}

async function readRequiredText(path: string, errors: string[]): Promise<string> {
  const absolutePath = fromRoot(path);
  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${absolutePath}.`);
    return "";
  }
  return readFile(absolutePath, "utf8");
}

function checkMissingStrings(label: string, actual: string[], expected: string[], errors: string[]): void {
  for (const item of expected) {
    if (!actual.includes(item)) errors.push(`${label} missing ${item}.`);
  }
}

function checkMissingRuleIds(label: string, value: unknown, expected: string[], errors: string[]): void {
  const ids = new Set(arrayOfRecords(value).map((item) => stringAt(item, "ruleId", "")));
  for (const item of expected) {
    if (!ids.has(item)) errors.push(`${label} missing ${item}.`);
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
  validateContentQaBrandVoiceManager().catch((error) => {
    logger.error("Content QA & Brand Voice Manager validation crashed", { error });
    process.exitCode = 1;
  });
}
