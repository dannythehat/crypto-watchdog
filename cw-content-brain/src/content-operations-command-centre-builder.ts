import { existsSync } from "node:fs";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

interface InputReportStatus {
  reportName: string;
  path: string;
  available: boolean;
  signalType: string;
}

interface ContentOperationType {
  operationType: string;
  purpose: string;
  defaultPriorityBucket: string;
  defaultManager: string;
  supportAgents: string[];
  requiresQcReview: boolean;
  requiresDannyDecision: boolean;
}

interface PriorityBucket {
  bucketId: string;
  purpose: string;
  owner: string;
  allowedStates: string[];
}

interface DepartmentRoute {
  routeId: string;
  operationTypes: string[];
  primaryManager: string;
  supportingAgents: string[];
  escalationTarget: string;
  reason: string;
}

const outputJson = "data/reports/content_operations_command_centre_report.json";
const outputMd = "data/reports/content_operations_command_centre_report.md";

const allowedStates = [
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
];

const blockedStates = ["approved", "applied"];

const blockedActions = [
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

const inputReports = [
  report("page_quality_profiler_report.json", "data/reports/page_quality_profiler_report.json", "page quality weaknesses"),
  report("page_blueprint_agent_report.json", "data/reports/page_blueprint_agent_report.json", "page blueprint needs"),
  report("content_cluster_agent_report.json", "data/reports/content_cluster_agent_report.json", "related section and cluster needs"),
  report("media_video_brief_agent_report.json", "data/reports/media_video_brief_agent_report.json", "media and video brief needs"),
  report("seo_intelligence_report.json", "data/reports/seo_intelligence_report.json", "SEO queue signals"),
  report("metadata_suggestions_report.json", "data/reports/metadata_suggestions_report.json", "metadata suggestions"),
  report("internal_link_placements_report.json", "data/reports/internal_link_placements_report.json", "internal link suggestions"),
  report("affiliate_placements_report.json", "data/reports/affiliate_placements_report.json", "affiliate placement suggestions"),
  report("offer_tracker_report.json", "data/reports/offer_tracker_report.json", "offer expiry and stale offer checks"),
  report("qc_department_v2_report.json", "data/reports/qc_department_v2_report.json", "QC safety boundaries"),
  report("agent_capability_registry_v2_report.json", "data/reports/agent_capability_registry_v2_report.json", "agent capability map"),
  report("base_hq_runbook_report.json", "data/reports/base_hq_runbook_report.json", "base operating rules"),
];

const priorityBuckets: PriorityBucket[] = [
  bucket("do_next_safe_planning", "Low-risk planning items that can be prepared as local drafts or briefs.", "The Gaffer"),
  bucket("content_manager_review", "Content structure, purpose, rebuild, and refresh items.", "Rewrite Rita"),
  bucket("seo_manager_review", "SEO refresh, metadata, headings, and search opportunity items.", "Rankhound"),
  bucket("keyword_manager_review", "Keyword gap, intent, and cannibalisation review items.", "Keyword Kev"),
  bucket("link_manager_review", "Internal links, related cards, external/source support, and comparison placement items.", "Linksmith"),
  bucket("media_manager_review", "Screenshots, images, proof blocks, visuals, and video brief planning.", "Pixel Pete"),
  bucket("social_manager_review", "Social post and content distribution planning items.", "Social Sophie"),
  bucket("qa_brand_voice_review", "Tone, formatting, evidence-first language, and article polish items.", "Gatekeeper Grace"),
  bucket("evidence_manager_review", "Evidence gaps, source support, proof status, and testing placeholders.", "Inspector Proof"),
  bucket("affiliate_manager_review", "Affiliate disclosure, offer, CTA, and commercial review items.", "Disclosure Daisy"),
  bucket("needs_qc_review", "Sensitive or high-impact items that need Gatekeeper Grace before escalation.", "Gatekeeper Grace"),
  bucket("recommended_for_danny_review", "Key decisions that should be prepared for Danny after manager and QC filtering.", "The Gaffer"),
  bucket("blocked_risk", "Items blocked until evidence, safety, disclosure, or human approval conditions are met.", "Gatekeeper Grace"),
  bucket("monitor_only", "Signals to watch without action today.", "Metric Molly"),
];

const contentOperationTypes: ContentOperationType[] = [
  op("new_article_needed", "Plan a new article idea only after research and duplicate checks.", "content_manager_review", "Rewrite Rita", ["Routey Rachel", "Inspector Proof"], false, false),
  op("review_rebuild_needed", "Plan review rebuild structure and evidence placeholders.", "content_manager_review", "Blueprint Bella", ["Thin Page Theo", "Rewrite Rita", "Inspector Proof"], true, true),
  op("old_content_update_needed", "Plan refreshes for stale or underdeveloped existing pages.", "content_manager_review", "Rewrite Rita", ["Thin Page Theo", "Rankhound"], false, false),
  op("blog_post_needed", "Plan blog posts that support existing authority and user protection.", "content_manager_review", "Rewrite Rita", ["Keyword Kev", "Cluster Clara"], false, false),
  op("category_authority_page_needed", "Plan category or topic hub treatment.", "content_manager_review", "Blueprint Bella", ["Rankhound", "Cluster Clara"], false, false),
  op("warning_page_review_needed", "Review warning/scam-risk page structure with cautious evidence rules.", "needs_qc_review", "Gatekeeper Grace", ["Red Flag Rita", "Claim Checker Colin", "Inspector Proof"], true, true),
  op("seo_refresh_needed", "Plan SEO refreshes without keyword stuffing or unsupported claims.", "seo_manager_review", "Rankhound", ["Keyword Kev", "Gatekeeper Grace"], false, false),
  op("keyword_gap_review_needed", "Review keyword gaps and search intent before drafting.", "keyword_manager_review", "Keyword Kev", ["Rankhound"], false, false),
  op("heading_structure_fix", "Plan H1/H2/H3 improvements for clarity and scanability.", "seo_manager_review", "Rankhound", ["Blueprint Bella"], false, false),
  op("metadata_update_needed", "Plan title and meta description updates.", "seo_manager_review", "Rankhound", ["Gatekeeper Grace"], false, false),
  op("internal_links_needed", "Plan natural internal links and avoid spammy anchors.", "link_manager_review", "Linksmith", ["Cluster Clara"], false, false),
  op("external_sources_needed", "Plan external/source support requirements without live fetching.", "evidence_manager_review", "Inspector Proof", ["Claim Checker Colin"], true, false),
  op("related_cards_needed", "Plan related review, guide, warning, and comparison cards.", "link_manager_review", "Cluster Clara", ["Linksmith"], false, false),
  op("comparison_section_needed", "Plan comparison sections and alternatives.", "content_manager_review", "Blueprint Bella", ["Rankhound", "Cluster Clara"], false, false),
  op("faq_section_needed", "Plan FAQ sections based on page purpose and evidence.", "content_manager_review", "Rewrite Rita", ["Rankhound"], false, false),
  op("screenshot_plan_needed", "Plan screenshot/proof needs without generating or downloading media.", "media_manager_review", "Screenshot Sam", ["Inspector Proof", "Pixel Pete"], true, false),
  op("image_placement_needed", "Plan image placement and alt text guidance.", "media_manager_review", "Image Iris", ["Pixel Pete"], false, false),
  op("video_placement_needed", "Plan outline-only video placements and briefs.", "media_manager_review", "Storyboard Sam", ["Pixel Pete"], false, false),
  op("social_post_needed", "Plan future social distribution from reviewed content opportunities.", "social_manager_review", "Social Sophie", ["Gatekeeper Grace"], true, false),
  op("brand_voice_review_needed", "Review tone for evidence-first, plain-English, protective language.", "qa_brand_voice_review", "Gatekeeper Grace", ["Claim Checker Colin"], true, false),
  op("formatting_review_needed", "Plan article formatting and section readability improvements.", "qa_brand_voice_review", "Gatekeeper Grace", ["Blueprint Bella"], false, false),
  op("evidence_needed", "Identify evidence gaps and proof requirements.", "evidence_manager_review", "Inspector Proof", ["Screenshot Sam", "Claim Checker Colin"], true, false),
  op("affiliate_disclosure_review_needed", "Review affiliate disclosure and commercial safety before any CTA work.", "affiliate_manager_review", "Disclosure Daisy", ["Offer Owl", "Expiry Eddie", "Gatekeeper Grace"], true, true),
  op("manager_escalation_needed", "Route unclear or cross-department work through manager escalation.", "recommended_for_danny_review", "Routey Rachel", ["The Gaffer", "Gatekeeper Grace"], true, false),
  op("qc_review_needed", "Send sensitive claims, affiliate, rating, warning, or legal-adjacent items to QC.", "needs_qc_review", "Gatekeeper Grace", ["Claim Checker Colin", "Rating Guard Rachel"], true, false),
  op("danny_decision_needed", "Prepare key decision items for Danny after manager and QC filtering.", "recommended_for_danny_review", "The Gaffer", ["Approval Ava", "Audit Alfie"], true, true),
];

const departmentRouting: DepartmentRoute[] = [
  route("route_content_structure", ["new_article_needed", "review_rebuild_needed", "old_content_update_needed", "blog_post_needed", "category_authority_page_needed", "comparison_section_needed", "faq_section_needed"], "Blueprint Bella", ["Thin Page Theo", "Rewrite Rita", "Cluster Clara"], "Gatekeeper Grace", "Content structure and rebuild work needs blueprint, quality, and QC review when sensitive."),
  route("route_seo_keyword", ["seo_refresh_needed", "keyword_gap_review_needed", "heading_structure_fix", "metadata_update_needed"], "Rankhound", ["Keyword Kev", "Gatekeeper Grace"], "The Gaffer", "SEO and keyword work should improve usefulness without over-optimising or making unsupported claims."),
  route("route_links_clusters", ["internal_links_needed", "external_sources_needed", "related_cards_needed"], "Linksmith", ["Cluster Clara", "Inspector Proof", "Backlink Barry"], "Gatekeeper Grace", "Link and source work should stay natural, useful, and evidence-led."),
  route("route_media_video", ["screenshot_plan_needed", "image_placement_needed", "video_placement_needed"], "Pixel Pete", ["Screenshot Sam", "Image Iris", "Storyboard Sam"], "Gatekeeper Grace", "Media work is planning-only and must not imply evidence that does not exist."),
  route("route_social_distribution", ["social_post_needed"], "Social Sophie", ["Gatekeeper Grace", "The Gaffer"], "Gatekeeper Grace", "Social work must remain cautious and review-only until content is approved in a future workflow."),
  route("route_qa_evidence", ["brand_voice_review_needed", "formatting_review_needed", "evidence_needed", "warning_page_review_needed"], "Gatekeeper Grace", ["Inspector Proof", "Claim Checker Colin", "Rating Guard Rachel"], "The Gaffer", "Claims, evidence gaps, warning pages, and brand voice risks need QC before Danny sees them."),
  route("route_affiliates", ["affiliate_disclosure_review_needed"], "Disclosure Daisy", ["Offer Owl", "Expiry Eddie", "Gatekeeper Grace"], "Danny", "Affiliate and commercial work requires disclosure review and Danny approval when sensitive."),
  route("route_command_decisions", ["manager_escalation_needed", "qc_review_needed", "danny_decision_needed"], "The Gaffer", ["Routey Rachel", "Approval Ava", "Audit Alfie"], "Danny", "Command-layer decisions should be filtered before Danny receives only important items."),
];

const qcEscalationRules = [
  "Warning/scam-risk wording, unsupported claims, trust/rating impact, legal-adjacent language, and affiliate disclosure risk must route to Gatekeeper Grace.",
  "Evidence gaps and source support needs must route to Inspector Proof before claims become recommendations.",
  "Commercial/affiliate items must route to Disclosure Daisy, Offer Owl, Expiry Eddie, and Gatekeeper Grace before Danny sees them.",
  "Media, screenshot, and video items must remain planning-only and must not imply tests, screenshots, or proof that Danny has not provided.",
  "Any item that asks for live edits, publishing, API calls, Supabase writes, media generation/download/upload, patches, update payloads, approval, or apply must be blocked.",
];

const dannyDecisionRules = [
  "Danny only sees key decisions after department manager, QC, and The Gaffer filtering.",
  "Danny review is required for high-risk warnings, trust/rating impact, affiliate placements, legal/policy-sensitive wording, and final review judgement.",
  "Danny-added evidence can unlock later drafting, but this command centre does not collect, apply, publish, or store live evidence.",
  "No recommendation from this report is approval. Every item remains local planning unless a future approved workflow exists.",
];

export async function buildContentOperationsCommandCentre(): Promise<unknown> {
  const inputReportsChecked = inputReports.map((item) => ({
    ...item,
    available: existsSync(fromRoot(item.path)),
  }));
  const availableSignals = inputReportsChecked.filter((item) => item.available).map((item) => item.signalType);
  const warnings = inputReportsChecked.filter((item) => !item.available).map((item) => `Optional input report unavailable: ${item.path}.`);

  const report = {
    generatedAt: new Date().toISOString(),
    status: "ready_for_validation",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    departmentName: "Content Operations Command Centre v1",
    managerName: "The Gaffer",
    managerCodename: "The Gaffer",
    purpose: "Combine local content, SEO, media, affiliate, evidence, QC, and manager-routing signals into one read-only content operations command layer.",
    inputReportsChecked,
    availableSignals,
    contentOperationTypes,
    priorityBuckets,
    departmentRouting,
    qcEscalationRules,
    dannyDecisionRules,
    blockedActions,
    allowedStates,
    blockedStates,
    nextRecommendedBuild: "Build #51 — Content QA & Brand Voice Manager v1",
    summary: {
      inputReportsChecked: inputReportsChecked.length,
      availableInputReports: inputReportsChecked.filter((item) => item.available).length,
      missingOptionalInputReports: inputReportsChecked.filter((item) => !item.available).length,
      contentOperationTypeCount: contentOperationTypes.length,
      priorityBucketCount: priorityBuckets.length,
      departmentRouteCount: departmentRouting.length,
    },
    validation: {
      expectedOperationTypesPresent: contentOperationTypes.length,
      expectedPriorityBucketsPresent: priorityBuckets.length,
      expectedBlockedActionsPresent: blockedActions.length,
      allowedStatesExcludeApprovedApplied: true,
      blockedStatesIncludeApprovedApplied: true,
    },
    safetyChecks: {
      reportOnly: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveContentEdits: true,
      noAffiliateUrlInsertion: true,
      noApprovalApplyWorkflow: true,
      noAiOrExternalApiCalls: true,
      noLiveCrawlingOrFetching: true,
      noGeneratedOutputCommitted: true,
      noTrustRatingChanges: true,
      noUnsupportedScamFraudAccusations: true,
      noMediaGenerationDownloadUpload: true,
      noPatchFiles: true,
      noUpdatePayloads: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
    errors: [] as string[],
    warnings,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Content Operations Command Centre report written", {
    outputJson,
    outputMd,
    operationTypes: contentOperationTypes.length,
    availableInputs: report.summary.availableInputReports,
  });
  return report;
}

function report(reportName: string, path: string, signalType: string): InputReportStatus {
  return { reportName, path, available: false, signalType };
}

function op(
  operationType: string,
  purpose: string,
  defaultPriorityBucket: string,
  defaultManager: string,
  supportAgents: string[],
  requiresQcReview: boolean,
  requiresDannyDecision: boolean,
): ContentOperationType {
  return { operationType, purpose, defaultPriorityBucket, defaultManager, supportAgents, requiresQcReview, requiresDannyDecision };
}

function bucket(bucketId: string, purpose: string, owner: string): PriorityBucket {
  return { bucketId, purpose, owner, allowedStates };
}

function route(routeId: string, operationTypes: string[], primaryManager: string, supportingAgents: string[], escalationTarget: string, reason: string): DepartmentRoute {
  return { routeId, operationTypes, primaryManager, supportingAgents, escalationTarget, reason };
}

function renderMarkdown(report: {
  generatedAt: string;
  safetyMode: string;
  departmentName: string;
  managerName: string;
  purpose: string;
  inputReportsChecked: InputReportStatus[];
  contentOperationTypes: ContentOperationType[];
  priorityBuckets: PriorityBucket[];
  departmentRouting: DepartmentRoute[];
  qcEscalationRules: string[];
  dannyDecisionRules: string[];
  blockedActions: string[];
  nextRecommendedBuild: string;
}): string {
  const available = report.inputReportsChecked.filter((item) => item.available);
  const missing = report.inputReportsChecked.filter((item) => !item.available);

  return `# Content Operations Command Centre v1

Generated: ${report.generatedAt}

Safety mode: ${report.safetyMode}
canAutoApply: false
approvedCount: 0
appliedCount: 0

## What This Is

${report.departmentName} is managed by ${report.managerName}. ${report.purpose}

This is the first real hub command layer after the Watchdog HQ Master Blueprint Lock because it pulls content, SEO, evidence, media, affiliate, manager-routing, and QC signals into one local planning report. It does not execute work. It gives the future content machine a controlled command map.

## Signals It Combines

Available local signals:

${available.length > 0 ? available.map((item) => `- ${item.reportName}: ${item.signalType}`).join("\n") : "- No optional signal reports are currently available."}

Unavailable optional signals:

${missing.length > 0 ? missing.map((item) => `- ${item.reportName}`).join("\n") : "- None"}

## Content Operation Types

${report.contentOperationTypes.map((item) => `- **${item.operationType}**: ${item.purpose} Owner: ${item.defaultManager}.`).join("\n")}

## Priority Buckets

${report.priorityBuckets.map((item) => `- **${item.bucketId}**: ${item.purpose} Owner: ${item.owner}.`).join("\n")}

## Manager And Agent Routing

${report.departmentRouting.map((routeItem) => `- **${routeItem.routeId}**: ${routeItem.primaryManager} handles ${routeItem.operationTypes.join(", ")} with ${routeItem.supportingAgents.join(", ")}. Escalation target: ${routeItem.escalationTarget}.`).join("\n")}

## QC Escalation

${report.qcEscalationRules.map((rule) => `- ${rule}`).join("\n")}

## Danny Decisions

${report.dannyDecisionRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Next Recommended Build

${report.nextRecommendedBuild}

## Safety Note

This command centre is READ_ONLY_REPORT_ONLY. It does not publish, apply, edit live content, write to Supabase, insert affiliate URLs, call AI/APIs, crawl live sources, generate/download/upload media, create patch files, create update payloads, change trust ratings, or make final scam/fraud accusations.
`;
}

if (isDirectRun(import.meta.url)) {
  buildContentOperationsCommandCentre().catch((error) => {
    logger.error("Content Operations Command Centre build failed", { error });
    process.exitCode = 1;
  });
}
