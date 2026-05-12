import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type LifecycleStage = "detected" | "suspected" | "verified" | "recommended" | "approved" | "applied";
type Confidence = "low" | "medium" | "high";

interface DepartmentInbox {
  inboxId: string;
  department: string;
  manager: string;
  purpose: string;
  acceptsFindingTypes: string[];
  acceptedLifecycleStages: Array<Exclude<LifecycleStage, "approved" | "applied">>;
  blockedLifecycleStages: Array<Extract<LifecycleStage, "approved" | "applied">>;
  canApprove: false;
  canApply: false;
  requiresHumanApprovalFor: string[];
  escalationTarget: string;
  futureOnly?: boolean;
  keyDecisionsOnly?: boolean;
  notes: string;
}

interface RoutingRule {
  ruleId: string;
  findingType: string;
  primaryInbox: string;
  secondaryInboxes: string[];
  requiredLifecycleStage: Exclude<LifecycleStage, "approved" | "applied">;
  minimumConfidence: Confidence;
  evidenceRequirement: string;
  sensitive: boolean;
  routeToDanny: boolean;
  routeToMasterAI: boolean;
  routeToQC: boolean;
  blockedInV1: boolean;
  reason: string;
}

const outputJson = "data/reports/department_task_router_report.json";
const outputMd = "data/reports/department_task_router_report.md";

const allowedRoutedStages: Array<Exclude<LifecycleStage, "approved" | "applied">> = ["detected", "suspected", "verified", "recommended"];
const blockedRoutedStages: Array<Extract<LifecycleStage, "approved" | "applied">> = ["approved", "applied"];

const managerDecisionOptions = [
  "request_more_evidence",
  "route_to_another_manager",
  "mark_duplicate",
  "mark_monitor_only",
  "request_revision",
  "escalate_to_qc",
  "escalate_to_master_ai",
  "recommend_for_danny_review",
  "block_due_to_risk",
];

const managerBlockedDecisions = [
  "publish",
  "apply",
  "write_to_supabase",
  "change_ratings",
  "add_affiliate_links",
  "make_scam_fraud_accusations",
  "finalise_legal_wording",
  "approve_final_action",
  "execute_safe_apply",
];

const blockedActions = [
  "No publishing.",
  "No Supabase writes.",
  "No live website edits.",
  "No approval/apply workflow.",
  "No affiliate links inserted.",
  "No scam/fraud accusations generated.",
  "No trust rating changes.",
  "No legal conclusions.",
  "No live crawling/fetching.",
  "No approved routed items in v1.",
  "No applied routed items in v1.",
];

const departmentInboxes: DepartmentInbox[] = [
  inbox("master-ai-manager", "Command", "Master AI Manager", "Receives escalated, cleaned, cross-department decisions and creates a prioritised command view.", ["major_decision", "unclear_ownership", "legal_or_policy_risk", "rating_change"], "Danny Approval Inbox - key decisions only", ["major decisions", "rating changes", "legal/policy risk"], "Only escalated items; never approves or applies."),
  inbox("quality-control-manager", "Quality Control", "Quality Control Manager", "Reviews unsupported, generic, duplicated, sensitive, or unsafe findings before escalation.", ["unsupported_claim", "affiliate_disclosure_missing", "legal_or_policy_risk", "duplicate_content_risk"], "Master AI Manager", ["unsafe claims", "legal/policy risk", "affiliate disclosure issues"], "Cross-department safety gate."),
  inbox("content-ai-manager", "Content", "Content AI Manager", "Reviews draft content quality, stale reviews, page thinness, and refresh work.", ["page_thinness", "stale_review", "content_refresh", "review_update"], "Quality Control Manager", ["live content edits", "claims changes"], "Draft planning only."),
  inbox("seo-ai-manager", "SEO", "SEO AI Manager", "Reviews metadata, heading, keyword, internal-link, and search-intent findings.", ["missing_heading_structure", "missing_internal_links", "keyword_opportunity", "duplicate_content_risk"], "Quality Control Manager", ["canonical changes", "sensitive metadata changes"], "SEO review only."),
  inbox("affiliates-ai-manager", "Affiliates", "Affiliates AI Manager", "Reviews affiliate, disclosure, CTA, and monetisation findings.", ["affiliate_offer_detected", "affiliate_disclosure_missing", "affiliate_monetisation_risk"], "Quality Control Manager", ["affiliate CTAs", "warning-page monetisation"], "No affiliate links inserted."),
  inbox("research-ai-manager", "Research", "Research AI Manager", "Reviews duplicate, cannibalisation, source, and evidence-gap research tasks.", ["duplicate_content_risk", "unsupported_claim", "research_gap", "source_signal"], "Quality Control Manager", ["new article decisions", "sensitive research claims"], "Research routing only."),
  inbox("analytics-ai-manager", "Analytics", "Analytics AI Manager", "Reviews traffic, engagement, conversion, and performance findings.", ["analytics_drop", "conversion_signal", "traffic_change"], "SEO AI Manager", ["major performance decisions"], "Local analytics report review only."),
  inbox("trust-safety-ai-manager", "Trust & Safety", "Trust & Safety AI Manager", "Reviews regulator, security, scam/fraud, trust, legal, and reputation-risk signals.", ["scam_or_fraud_signal", "regulator_notice", "security_signal", "legal_or_policy_risk"], "Quality Control Manager", ["scam/fraud wording", "rating changes", "legal risk"], "Sensitive signals require evidence and human review."),
  inbox("evidence-testing-manager", "Evidence / Testing", "Evidence / Testing Manager", "Reviews evidence, testing, blockchain, and verification requirements.", ["blockchain_evidence_signal", "stale_review", "evidence_gap"], "Trust & Safety AI Manager", ["testing claims", "blockchain evidence interpretation"], "No invented tests or evidence."),
  inbox("media-images-manager", "Media / Images", "Media / Images Manager", "Reviews image, alt text, screenshot, thumbnail, and media gap tasks.", ["image_needed", "missing_media", "image_alt_text"], "Content AI Manager", ["brand-sensitive media", "evidence screenshots"], "Media planning only."),
  inbox("video-manager", "Video", "Video Manager", "Reviews video brief, short script, hook, caption, and repurposing opportunities.", ["video_needed", "short_video_opportunity"], "Social Media Manager", ["public video scripts"], "No publishing."),
  inbox("social-media-manager", "Social", "Social Media Manager", "Reviews social post, thread, monitoring, and comment triage opportunities.", ["social_post_opportunity", "social_signal", "comment_theme"], "Trust & Safety AI Manager", ["sensitive replies", "scam recovery topics"], "No live social posting."),
  inbox("backlinks-manager", "Backlinks", "Backlinks Manager", "Reviews backlink, outreach, mention, and broken-link opportunities.", ["backlink_opportunity", "mention_opportunity", "broken_link_opportunity"], "SEO AI Manager", ["outreach text", "partnership claims"], "No outreach sent."),
  inbox("offers-deals-manager", "Offers / Deals", "Offers / Deals Manager", "Reviews offer expiry, stale deal, commission, and promotion risk findings.", ["promotion_expiry_risk", "affiliate_offer_detected", "offer_terms_change"], "Affiliates AI Manager", ["offer wording", "expired CTA decisions"], "No offer claims applied."),
  inbox("safe-apply-engine-inbox", "Safe Apply Engine", "Safe Apply Engine Inbox - future only", "Future inbox for safe apply candidates. Blocked in v1.", ["safe_apply_candidate"], "Master AI Manager", ["all apply requests"], "Future-only and blocked in v1.", true),
  inbox("danny-approval-inbox", "Approvals", "Danny Approval Inbox - key decisions only", "Reserved for key human decisions after manager and Master AI review.", ["key_decision", "rating_change", "legal_or_policy_risk", "affiliate_sensitive_decision"], "Danny", ["all final decisions"], "Review-only; cannot approve/apply inside this report.", false, true),
];

const routingRules: RoutingRule[] = [
  rule("route-page-thinness", "page_thinness", "content-ai-manager", [], "detected", "medium", "Local content report or draft evidence.", false, false, false, false, false, "Thin pages route to Content for draft-only refresh review."),
  rule("route-heading-structure", "missing_heading_structure", "seo-ai-manager", [], "detected", "medium", "Local SEO/content report.", false, false, false, false, false, "Heading issues are SEO review tasks."),
  rule("route-internal-links", "missing_internal_links", "seo-ai-manager", [], "detected", "medium", "Internal link report or local snapshot evidence.", false, false, false, false, false, "Internal links route to SEO before drafting."),
  rule("route-stale-review", "stale_review", "content-ai-manager", ["evidence-testing-manager"], "suspected", "medium", "Freshness signal plus evidence gap.", false, false, false, false, false, "Stale reviews need content and evidence/testing review."),
  rule("route-unsupported-claim", "unsupported_claim", "quality-control-manager", ["research-ai-manager"], "suspected", "low", "Claim text plus missing support.", true, false, false, true, false, "Unsupported claims need QC before escalation."),
  rule("route-scam-signal", "scam_or_fraud_signal", "trust-safety-ai-manager", ["quality-control-manager"], "suspected", "medium", "Corroborated evidence required before claims.", true, false, true, true, false, "Scam/fraud signals require Trust & Safety and QC."),
  rule("route-regulator-notice", "regulator_notice", "trust-safety-ai-manager", ["quality-control-manager"], "verified", "high", "Regulator source evidence and human review.", true, false, true, true, false, "Regulator notices are high-risk sensitive items."),
  rule("route-blockchain-evidence", "blockchain_evidence_signal", "evidence-testing-manager", ["trust-safety-ai-manager"], "suspected", "medium", "Explorer or contract evidence requiring interpretation.", true, false, false, true, false, "Blockchain signals require evidence/testing review."),
  rule("route-affiliate-offer", "affiliate_offer_detected", "offers-deals-manager", ["affiliates-ai-manager"], "detected", "medium", "Affiliate vault or offer tracker signal.", true, false, false, false, false, "Offer changes route to Offers and Affiliates."),
  rule("route-affiliate-disclosure", "affiliate_disclosure_missing", "affiliates-ai-manager", ["quality-control-manager"], "suspected", "medium", "Disclosure signal and content context.", true, false, false, true, false, "Disclosure issues require Affiliates and QC."),
  rule("route-promotion-expiry", "promotion_expiry_risk", "offers-deals-manager", [], "detected", "medium", "Offer tracker expiry/stale signal.", false, false, false, false, false, "Promotion expiry routes to Offers / Deals."),
  rule("route-analytics-drop", "analytics_drop", "analytics-ai-manager", [], "detected", "medium", "Local GA4/Search Console import.", false, false, false, false, false, "Analytics changes route to Analytics."),
  rule("route-keyword-opportunity", "keyword_opportunity", "seo-ai-manager", [], "detected", "medium", "Local SEO report or search export.", false, false, false, false, false, "Keyword opportunities route to SEO."),
  rule("route-backlink-opportunity", "backlink_opportunity", "backlinks-manager", ["seo-ai-manager"], "detected", "low", "Local planning signal.", false, false, false, false, false, "Backlink opportunities route to Backlinks."),
  rule("route-social-post", "social_post_opportunity", "social-media-manager", [], "detected", "low", "Local planning signal or future social signal.", false, false, false, false, false, "Social opportunities route to Social."),
  rule("route-video-needed", "video_needed", "video-manager", [], "detected", "low", "Content/media gap signal.", false, false, false, false, false, "Video opportunities route to Video."),
  rule("route-image-needed", "image_needed", "media-images-manager", [], "detected", "low", "Media gap or alt-text signal.", false, false, false, false, false, "Image needs route to Media / Images."),
  rule("route-duplicate-content", "duplicate_content_risk", "research-ai-manager", ["seo-ai-manager"], "suspected", "medium", "Research guard or SEO cannibalisation evidence.", false, false, false, false, false, "Duplicate/cannibalisation routes to Research and SEO."),
  rule("route-legal-policy", "legal_or_policy_risk", "quality-control-manager", ["master-ai-manager"], "suspected", "medium", "Policy/legal wording needs expert human review.", true, false, true, true, false, "Legal/policy risks escalate to QC and Master AI."),
  rule("route-safe-apply-candidate", "safe_apply_candidate", "safe-apply-engine-inbox", ["master-ai-manager"], "recommended", "high", "Only future approved workflow may consider apply.", true, false, true, true, true, "Safe apply candidates are blocked in v1."),
];

const escalationRules = [
  "High-risk trust/safety items route to Trust & Safety and Quality Control.",
  "Unsupported claims route to Quality Control.",
  "Legal/policy risk routes to Quality Control and Master AI Manager.",
  "Rating changes route to Master AI Manager and Danny.",
  "Affiliate monetisation changes route to Affiliates and Quality Control, then Danny if sensitive.",
  "Publishing/apply requests are blocked in v1.",
  "Unclear ownership routes to Master AI Manager.",
  "Only key decisions route to Danny.",
];

const exampleRoutedTasks = [
  { taskId: "example-seo-001", findingType: "missing_internal_links", lifecycleStage: "detected", routedTo: "seo-ai-manager", confidence: "medium", status: "review_only" },
  { taskId: "example-trust-001", findingType: "regulator_notice", lifecycleStage: "verified", routedTo: "trust-safety-ai-manager", secondary: ["quality-control-manager"], confidence: "high", status: "review_only" },
  { taskId: "example-affiliate-001", findingType: "promotion_expiry_risk", lifecycleStage: "detected", routedTo: "offers-deals-manager", confidence: "medium", status: "review_only" },
];

const exampleBlockedRoutes = [
  { routeId: "blocked-approved-task", reason: "approved lifecycle stage is blocked in v1.", blockedStage: "approved" },
  { routeId: "blocked-applied-task", reason: "applied lifecycle stage is blocked in v1.", blockedStage: "applied" },
  { routeId: "blocked-safe-apply", reason: "Safe Apply Engine Inbox is future-only and cannot execute in v1.", findingType: "safe_apply_candidate" },
];

const nextRecommendedBuilds = [
  "Add local sample agent-output imports once worker agents exist.",
  "Connect Agent Output Contract validation to router validation.",
  "Add task deduplication and per-manager queue caps.",
  "Feed router summaries into Quality Control and Master AI Manager reports.",
  "Create dashboard data for department inboxes after the router stabilises.",
];

export async function buildDepartmentTaskRouter(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Department Inbox / Task Router v1",
    name: "Department Inbox / Task Router v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    routingModel: {
      purpose: "Route future Agent Output Contract findings to department managers before QC, Master AI, or Danny.",
      allowedRoutedStages,
      blockedRoutedStages,
      routeOnly: true,
      approvalOrApplyAllowed: false,
    },
    departmentInboxes,
    routingRules,
    escalationRules,
    blockedActions,
    exampleRoutedTasks,
    exampleBlockedRoutes,
    managerDecisionOptions,
    managerBlockedDecisions,
    nextRecommendedBuilds,
    safetyChecks: {
      reportOnly: true,
      planningOnly: true,
      noLiveRoutingSystem: true,
      noTaskExecution: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveWebsiteEdits: true,
      noApprovalApplyWorkflow: true,
      noApprovedState: true,
      noAppliedState: true,
      noLiveCrawling: true,
      noLiveFetching: true,
      canAutoApply: false,
      canApprove: false,
      canApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Department task router report written", { outputJson, outputMd, inboxes: departmentInboxes.length, rules: routingRules.length });
  return report;
}

function inbox(
  inboxId: string,
  department: string,
  manager: string,
  purpose: string,
  acceptsFindingTypes: string[],
  escalationTarget: string,
  requiresHumanApprovalFor: string[],
  notes: string,
  futureOnly = false,
  keyDecisionsOnly = false,
): DepartmentInbox {
  return {
    inboxId,
    department,
    manager,
    purpose,
    acceptsFindingTypes,
    acceptedLifecycleStages: allowedRoutedStages,
    blockedLifecycleStages: blockedRoutedStages,
    canApprove: false,
    canApply: false,
    requiresHumanApprovalFor,
    escalationTarget,
    futureOnly,
    keyDecisionsOnly,
    notes,
  };
}

function rule(
  ruleId: string,
  findingType: string,
  primaryInbox: string,
  secondaryInboxes: string[],
  requiredLifecycleStage: Exclude<LifecycleStage, "approved" | "applied">,
  minimumConfidence: Confidence,
  evidenceRequirement: string,
  sensitive: boolean,
  routeToDanny: boolean,
  routeToMasterAI: boolean,
  routeToQC: boolean,
  blockedInV1: boolean,
  reason: string,
): RoutingRule {
  return { ruleId, findingType, primaryInbox, secondaryInboxes, requiredLifecycleStage, minimumConfidence, evidenceRequirement, sensitive, routeToDanny, routeToMasterAI, routeToQC, blockedInV1, reason };
}

function renderMarkdown(report: {
  generatedAt: string;
  departmentInboxes: DepartmentInbox[];
  routingRules: RoutingRule[];
  escalationRules: string[];
  blockedActions: string[];
  managerDecisionOptions: string[];
  managerBlockedDecisions: string[];
  nextRecommendedBuilds: string[];
}): string {
  const inboxRows = report.departmentInboxes
    .map((inbox) => `| ${inbox.manager} | ${inbox.department} | ${inbox.futureOnly ? "future only" : "active planning"} | ${inbox.escalationTarget} |`)
    .join("\n");
  const ruleRows = report.routingRules
    .map((rule) => `| ${rule.findingType} | ${rule.primaryInbox} | ${rule.secondaryInboxes.join(", ") || "none"} | ${rule.blockedInV1 ? "blocked" : "review"} |`)
    .join("\n");
  return `# Department Inbox / Task Router v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Purpose

Routes future Agent Output Contract findings to department manager inboxes for review. This is planning/report-only and does not execute tasks, approve, apply, publish, edit live files, or write to Supabase.

## Department Inboxes

| Manager | Department | Status | Escalation Target |
| --- | --- | --- | --- |
${inboxRows}

## Routing Rules

| Finding Type | Primary Inbox | Secondary Inboxes | V1 Status |
| --- | --- | --- | --- |
${ruleRows}

## Manager Decision Options

${report.managerDecisionOptions.map((option) => `- ${option}`).join("\n")}

## Managers May Not

${report.managerBlockedDecisions.map((option) => `- ${option}`).join("\n")}

## Escalation Rules

${report.escalationRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Next Recommended Builds

${report.nextRecommendedBuilds.map((build) => `- ${build}`).join("\n")}
`;
}

if (isDirectRun(import.meta.url)) {
  buildDepartmentTaskRouter().catch((error) => {
    logger.error("Department task router build failed", { error });
    process.exitCode = 1;
  });
}
