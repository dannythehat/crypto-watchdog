import { existsSync } from "node:fs";
import { fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

interface InputReportStatus {
  reportName: string;
  path: string;
  available: boolean;
  signalType: string;
}

interface Rule {
  ruleId: string;
  rule: string;
  reviewAction: string;
  escalationTarget: string;
}

const outputJson = "data/reports/content_qa_brand_voice_manager_report.json";
const outputMd = "data/reports/content_qa_brand_voice_manager_report.md";

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
  "fake_testing_claim",
  "media_generation",
  "media_download_or_upload",
  "patch_file_creation",
  "update_payload_creation",
  "final_legal_or_policy_wording",
];

const qaCheckGroups = [
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

const inputReports = [
  report("content_operations_command_centre_report.json", "data/reports/content_operations_command_centre_report.json", "content operations command routing"),
  report("page_quality_profiler_report.json", "data/reports/page_quality_profiler_report.json", "page quality weaknesses"),
  report("page_blueprint_agent_report.json", "data/reports/page_blueprint_agent_report.json", "page blueprint requirements"),
  report("content_cluster_agent_report.json", "data/reports/content_cluster_agent_report.json", "related section requirements"),
  report("media_video_brief_agent_report.json", "data/reports/media_video_brief_agent_report.json", "media and video placement needs"),
  report("qc_department_v2_report.json", "data/reports/qc_department_v2_report.json", "QC safety boundaries"),
  report("agent_capability_registry_v2_report.json", "data/reports/agent_capability_registry_v2_report.json", "agent capability map"),
  report("base_hq_runbook_report.json", "data/reports/base_hq_runbook_report.json", "base operating rules"),
];

const brandVoiceRules: Rule[] = [
  rule("evidence_first", "CryptoWatchdog tone must be evidence-first.", "Flag unsupported certainty and ask for evidence wording.", "Gatekeeper Grace"),
  rule("protection_first", "CryptoWatchdog tone must be protection-first.", "Prioritise reader safety over conversion pressure.", "Gatekeeper Grace"),
  rule("plain_english", "Use plain English that normal readers can scan.", "Flag jargon, hype, vague wording, and dense paragraphs.", "Rewrite Rita"),
  rule("sceptical_not_cynical", "Be sceptical but not cynical.", "Flag sneering, overconfident, or unfair phrasing.", "Gatekeeper Grace"),
  rule("no_fluff", "Remove generic filler and empty AI-sounding claims.", "Request revision for low-value paragraphs.", "Rewrite Rita"),
  rule("no_hype", "Avoid hype and exaggerated urgency.", "Route hype-heavy wording to QA review.", "Gatekeeper Grace"),
  rule("no_fake_guarantees", "Do not promise safety, profit, recovery, or outcomes.", "Block guarantee-style wording.", "Claim Checker Colin"),
  rule("no_invented_testing", "Do not imply tests happened unless Danny supplied evidence.", "Block fake testing language.", "Inspector Proof"),
  rule("no_unsupported_scam_fraud_claims", "Do not make unsupported scam/fraud claims.", "Escalate sensitive wording for evidence review.", "Gatekeeper Grace"),
  rule("no_buy_this_now", "Avoid buy this now style recommendations.", "Flag aggressive commercial CTAs.", "Disclosure Daisy"),
  rule("commercial_but_trust_led", "Commercial content may exist, but it must stay trust-led.", "Require disclosure and human review where commercial risk appears.", "Disclosure Daisy"),
];

const articleFormattingRules: Rule[] = [
  rule("clear_h1_h2_h3", "Check for clear H1/H2/H3 structure.", "Flag weak or confusing heading hierarchy.", "Rankhound"),
  rule("useful_intro", "Check for a useful intro that answers what the page is about.", "Request intro rewrite planning when unclear.", "Rewrite Rita"),
  rule("short_readable_paragraphs", "Check for short readable paragraphs.", "Flag dense blocks and mobile readability risk.", "Rewrite Rita"),
  rule("logical_review_order", "Check review sections are in a logical order.", "Route rebuild needs to Blueprint Bella.", "Blueprint Bella"),
  rule("pros_cons_relevant", "Check pros and cons where relevant.", "Flag missing balanced summary sections.", "Rewrite Rita"),
  rule("fees_risks_features", "Check fees, risks, and features sections where relevant.", "Route missing practical info to content review.", "Blueprint Bella"),
  rule("evidence_gap_section", "Check for evidence gap section where relevant.", "Route missing proof notes to Inspector Proof.", "Inspector Proof"),
  rule("related_sections", "Check related reviews, guides, and warnings sections.", "Route relationship gaps to Cluster Clara.", "Cluster Clara"),
  rule("faqs", "Check FAQ quality and usefulness.", "Flag thin or repetitive FAQs.", "Rankhound"),
  rule("clear_editorial_view", "Check conclusion/editorial view is clear and cautious.", "Route overclaiming to Gatekeeper Grace.", "Gatekeeper Grace"),
  rule("mobile_readability", "Check mobile readability and stacking.", "Flag cramped, sidebar-only, or overlong sections.", "Pixel Pete"),
];

const reviewStructureRules: Rule[] = [
  rule("what_was_tested", "Review must state what was tested.", "Flag missing or vague testing status.", "Inspector Proof"),
  rule("what_was_not_tested", "Review must state what was not tested.", "Flag missing limitations.", "Inspector Proof"),
  rule("screenshot_placeholder", "Review should include screenshot/proof placeholders where evidence is needed.", "Route to Screenshot Sam.", "Screenshot Sam"),
  rule("deposit_notes", "Check deposit notes where relevant.", "Flag missing evidence placeholder.", "Inspector Proof"),
  rule("withdrawal_notes", "Check withdrawal notes where relevant.", "Flag missing evidence placeholder.", "Inspector Proof"),
  rule("support_notes", "Check support notes where relevant.", "Flag missing evidence placeholder.", "Inspector Proof"),
  rule("kyc_notes", "Check KYC/verification notes where relevant.", "Flag missing evidence placeholder.", "Inspector Proof"),
  rule("fee_notes", "Check fee notes where relevant.", "Flag unsupported fee claims.", "Claim Checker Colin"),
  rule("risks_red_flags", "Check risks and red flags with careful wording.", "Escalate sensitive claims to QC.", "Gatekeeper Grace"),
  rule("trust_rating_explanation", "Check trust rating explanation without changing ratings.", "Escalate rating-impacting wording.", "Rating Guard Rachel"),
  rule("who_should_use", "Check who should use it.", "Flag overbroad recommendations.", "Gatekeeper Grace"),
  rule("who_should_avoid", "Check who should avoid it.", "Flag missing caution sections.", "Gatekeeper Grace"),
  rule("alternatives_comparisons", "Check alternatives and comparisons.", "Route gaps to Cluster Clara.", "Cluster Clara"),
  rule("related_pages", "Check related pages.", "Route gaps to Linksmith.", "Linksmith"),
  rule("review_faqs", "Check review FAQs.", "Flag thin FAQs.", "Rankhound"),
  rule("evidence_gaps", "Check evidence gaps.", "Route to Inspector Proof.", "Inspector Proof"),
];

const evidenceLanguageRules: Rule[] = [
  rule("tested_deposits_evidence", "Block 'we tested deposits' without verified deposit evidence.", "Mark needs_more_evidence.", "Inspector Proof"),
  rule("tested_withdrawals_evidence", "Block 'we tested withdrawals' without verified withdrawal evidence.", "Mark needs_more_evidence.", "Inspector Proof"),
  rule("screenshots_show_evidence", "Block 'screenshots show' without screenshot evidence.", "Route to Screenshot Sam.", "Screenshot Sam"),
  rule("safe_final_guarantee", "Flag safe as a final guarantee.", "Escalate to QC.", "Gatekeeper Grace"),
  rule("scam_fraud_final_accusation", "Block scam or fraud as a final accusation without verified evidence and Danny approval.", "Escalate to QC and Danny review.", "Gatekeeper Grace"),
  rule("invented_rankings_users_partnerships", "Block invented rankings, user numbers, and partnerships.", "Route to Claim Checker Colin.", "Claim Checker Colin"),
  rule("fake_guarantees", "Block fake guarantees.", "Route to Claim Checker Colin.", "Claim Checker Colin"),
  rule("unsupported_rating_changes", "Block unsupported trust rating changes.", "Route to Rating Guard Rachel.", "Rating Guard Rachel"),
  rule("unsupported_financial_advice", "Flag unsupported financial advice.", "Escalate to QC.", "Gatekeeper Grace"),
];

const seoReadabilityRules: Rule[] = [
  rule("readable_headings", "Headings should help scanning without keyword stuffing.", "Route heading issues to Rankhound.", "Rankhound"),
  rule("metadata_consistency", "Metadata wording should match page evidence and intent.", "Flag mismatch for SEO review.", "Rankhound"),
  rule("intent_clarity", "Content should make the page purpose clear quickly.", "Route unclear intent to Keyword Kev.", "Keyword Kev"),
  rule("faq_search_usefulness", "FAQs should answer real reader questions.", "Flag generic or repetitive FAQs.", "Rankhound"),
];

const linkPlacementRules: Rule[] = [
  rule("natural_internal_links", "Internal links must be useful and natural.", "Flag keyword-stuffed anchors.", "Linksmith"),
  rule("related_review_cards", "Related review cards should be recommended where relevant.", "Route placement gaps to Cluster Clara.", "Cluster Clara"),
  rule("category_topic_connections", "Category and topic pages should be connected.", "Route gaps to Linksmith.", "Linksmith"),
  rule("new_blog_distribution", "New blog posts should be distributed to relevant older pages.", "Route update planning to Cluster Clara.", "Cluster Clara"),
  rule("evidence_supporting_external_links", "External/source links should support evidence, not decoration.", "Route source gaps to Inspector Proof.", "Inspector Proof"),
  rule("no_affiliate_url_insertion", "No affiliate URL insertion is allowed.", "Block commercial link insertion requests.", "Disclosure Daisy"),
];

const mediaPlacementRules: Rule[] = [
  rule("image_placement_notes", "Check image placement notes.", "Route visual gaps to Image Iris.", "Image Iris"),
  rule("screenshot_placement_notes", "Check screenshot placement notes.", "Route proof gaps to Screenshot Sam.", "Screenshot Sam"),
  rule("video_placement_notes", "Check video placement notes.", "Route outline-only video needs to Storyboard Sam.", "Storyboard Sam"),
  rule("comparison_visual_notes", "Check comparison visual notes.", "Route visual comparison gaps to Pixel Pete.", "Pixel Pete"),
  rule("proof_block_notes", "Check proof block notes.", "Route evidence visual gaps to Inspector Proof.", "Inspector Proof"),
  rule("mobile_stacking_notes", "Check mobile stacking notes.", "Flag desktop-only media layouts.", "Pixel Pete"),
  rule("no_media_generation_download_upload", "No media generation, download, or upload is allowed.", "Block media execution requests.", "Pixel Pete"),
];

const affiliateDisclosureRules: Rule[] = [
  rule("disclosure_needed", "Disclosure is needed where commercial or affiliate content appears.", "Route disclosure gaps to Disclosure Daisy.", "Disclosure Daisy"),
  rule("warning_red_risk_caution", "Warning/red-risk pages require extra caution.", "Escalate to Gatekeeper Grace.", "Gatekeeper Grace"),
  rule("no_affiliate_cta_without_danny", "No affiliate CTA should be treated as ready without Danny approval.", "Route to Danny review when sensitive.", "Disclosure Daisy"),
  rule("trust_before_commercial", "Affiliate opportunity must not damage trust.", "Escalate commercial pressure to QC.", "Gatekeeper Grace"),
];

const humanReviewRules = [
  "Danny review is needed before any high-risk review judgement, affiliate CTA, warning/scam-risk wording, trust/rating impact, legal/policy-sensitive wording, or final content decision.",
  "Department managers may request revisions, evidence, or QC review, but they do not approve or apply final actions.",
  "Evidence gaps are allowed when clearly labelled; fake evidence is blocked.",
];

const qcEscalationRules = [
  "Unsupported claims, fake testing, final scam/fraud wording, financial advice risk, and trust/rating impact escalate to Gatekeeper Grace.",
  "Evidence language issues route to Inspector Proof before claims are treated as verified.",
  "Affiliate disclosure and commercial pressure route to Disclosure Daisy and Gatekeeper Grace.",
  "Media wording that implies missing screenshots, proof, or testing routes to Screenshot Sam and Gatekeeper Grace.",
];

const contentRiskFlags = [
  "unsupported_claim",
  "fake_testing_claim",
  "scam_wording_risk",
  "financial_advice_risk",
  "trust_rating_risk",
  "affiliate_disclosure_gap",
  "commercial_pressure",
  "thin_or_generic_language",
  "formatting_or_mobile_readability_gap",
  "missing_evidence_or_source_support",
  "final_legal_or_policy_wording_risk",
];

export async function buildContentQaBrandVoiceManager(): Promise<unknown> {
  const inputReportsChecked = inputReports.map((item) => ({
    ...item,
    available: existsSync(fromRoot(item.path)),
  }));
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
    departmentName: "Content QA & Brand Voice Manager v1",
    managerName: "Gatekeeper Grace",
    managerCodename: "Gatekeeper Grace",
    purpose: "Define how Watchdog HQ checks CryptoWatchdog tone, content quality, article structure, evidence-first wording, review completeness, links, media notes, affiliate disclosure, and human review needs.",
    inputReportsChecked,
    qaCheckGroups,
    brandVoiceRules,
    articleFormattingRules,
    reviewStructureRules,
    evidenceLanguageRules,
    seoReadabilityRules,
    linkPlacementRules,
    mediaPlacementRules,
    affiliateDisclosureRules,
    humanReviewRules,
    qcEscalationRules,
    contentRiskFlags,
    allowedStates,
    blockedStates,
    blockedActions,
    nextRecommendedBuild: "Build #52 — Content Distribution & Update Planner v1",
    summary: {
      inputReportsChecked: inputReportsChecked.length,
      availableInputReports: inputReportsChecked.filter((item) => item.available).length,
      missingOptionalInputReports: inputReportsChecked.filter((item) => !item.available).length,
      qaCheckGroupCount: qaCheckGroups.length,
      brandVoiceRuleCount: brandVoiceRules.length,
      articleFormattingRuleCount: articleFormattingRules.length,
      reviewStructureRuleCount: reviewStructureRules.length,
      evidenceLanguageRuleCount: evidenceLanguageRules.length,
      contentRiskFlagCount: contentRiskFlags.length,
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
      noFinalLegalPolicyWording: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
    errors: [] as string[],
    warnings,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Content QA & Brand Voice Manager report written", {
    outputJson,
    outputMd,
    qaCheckGroups: qaCheckGroups.length,
    availableInputs: report.summary.availableInputReports,
  });
  return report;
}

function report(reportName: string, path: string, signalType: string): InputReportStatus {
  return { reportName, path, available: false, signalType };
}

function rule(ruleId: string, ruleText: string, reviewAction: string, escalationTarget: string): Rule {
  return { ruleId, rule: ruleText, reviewAction, escalationTarget };
}

function renderRuleList(rules: Rule[]): string {
  return rules.map((item) => `- **${item.ruleId}**: ${item.rule} Review action: ${item.reviewAction}`).join("\n");
}

function renderMarkdown(report: {
  generatedAt: string;
  safetyMode: string;
  departmentName: string;
  managerName: string;
  purpose: string;
  inputReportsChecked: InputReportStatus[];
  qaCheckGroups: string[];
  brandVoiceRules: Rule[];
  articleFormattingRules: Rule[];
  reviewStructureRules: Rule[];
  evidenceLanguageRules: Rule[];
  seoReadabilityRules: Rule[];
  linkPlacementRules: Rule[];
  mediaPlacementRules: Rule[];
  affiliateDisclosureRules: Rule[];
  humanReviewRules: string[];
  qcEscalationRules: string[];
  contentRiskFlags: string[];
  blockedActions: string[];
  nextRecommendedBuild: string;
}): string {
  const available = report.inputReportsChecked.filter((item) => item.available);
  const missing = report.inputReportsChecked.filter((item) => !item.available);

  return `# Content QA & Brand Voice Manager v1

Generated: ${report.generatedAt}

Safety mode: ${report.safetyMode}
canAutoApply: false
approvedCount: 0
appliedCount: 0

## What This Is

${report.departmentName} is managed by ${report.managerName}. ${report.purpose}

This comes after Content Operations Command Centre because the command centre says what kind of content work exists, while this manager defines how that work should be checked before it reaches stronger drafting, QC, or Danny.

## Signals It Checks

Available local inputs:

${available.length > 0 ? available.map((item) => `- ${item.reportName}: ${item.signalType}`).join("\n") : "- No optional signal reports are currently available."}

Unavailable optional inputs:

${missing.length > 0 ? missing.map((item) => `- ${item.reportName}`).join("\n") : "- None"}

## QA Check Groups

${report.qaCheckGroups.map((group) => `- ${group}`).join("\n")}

## CryptoWatchdog Tone

${renderRuleList(report.brandVoiceRules)}

## Article And Review Formatting

${renderRuleList(report.articleFormattingRules)}

## Review Structure

${renderRuleList(report.reviewStructureRules)}

## Evidence Language

${renderRuleList(report.evidenceLanguageRules)}

## SEO Readability

${renderRuleList(report.seoReadabilityRules)}

## Links, Related Cards, And Sources

${renderRuleList(report.linkPlacementRules)}

## Images, Videos, FAQs, And Related Cards

${renderRuleList(report.mediaPlacementRules)}

## Affiliate Disclosure

${renderRuleList(report.affiliateDisclosureRules)}

## QC Escalation

${report.qcEscalationRules.map((item) => `- ${item}`).join("\n")}

## Danny Review

${report.humanReviewRules.map((item) => `- ${item}`).join("\n")}

## Blocked / Risk Flags

${report.contentRiskFlags.map((item) => `- ${item}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Next Recommended Build

${report.nextRecommendedBuild}

## Safety Note

This manager is READ_ONLY_REPORT_ONLY. It does not publish, apply, edit live content, write to Supabase, insert affiliate URLs, call AI/APIs, crawl live sources, generate/download/upload media, create patch files, create update payloads, change trust ratings, produce final legal/policy wording, or make final scam/fraud accusations.
`;
}

if (isDirectRun(import.meta.url)) {
  buildContentQaBrandVoiceManager().catch((error) => {
    logger.error("Content QA & Brand Voice Manager build failed", { error });
    process.exitCode = 1;
  });
}
