import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type RoleType = "manager" | "specialist" | "worker" | "guard" | "engine";
type MaturityStatus =
  | "planned"
  | "registered"
  | "basic_report_only"
  | "active_report_only"
  | "ai_assisted"
  | "manager_reviewed"
  | "qc_reviewed"
  | "approval_ready"
  | "safe_apply_ready";

interface Department {
  departmentId: string;
  departmentName: string;
  purpose: string;
  managerAgent: string;
  workerAgents: string[];
  capabilityEndpointIds: string[];
  currentMaturityStatus: MaturityStatus;
  targetMaturityStatus: MaturityStatus;
  escalationTargets: string[];
  blockedActions: string[];
}

interface CapabilityEndpoint {
  endpointId: string;
  department: string;
  purpose: string;
  allowedInputs: string[];
  allowedOutputs: string[];
  lifecycleLimit: string;
  maturityStatus: MaturityStatus;
  blockedActions: string[];
}

interface Agent {
  agentId: string;
  agentName: string;
  department: string;
  roleType: RoleType;
  purpose: string;
  currentMaturityStatus: MaturityStatus;
  targetMaturityStatus: MaturityStatus;
  allowedModes: string[];
  blockedActions: string[];
  allowedInputs: string[];
  allowedOutputs: string[];
  capabilityEndpoints: string[];
  escalationTargets: string[];
  checkedBy: string[];
  priorityTier: "high" | "medium" | "low";
  implementationNotes: string[];
}

const outputJson = "data/reports/agent_capability_registry_v2_report.json";
const outputMd = "data/reports/agent_capability_registry_v2_report.md";

const allowedLifecycleStates = [
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

const blockedLifecycleStates = ["approved", "applied"];

const blockedActions = [
  "publish",
  "supabase_write",
  "live_content_edit",
  "affiliate_url_insert",
  "trust_rating_change",
  "approval_apply",
  "secret_access",
  "external_api_call",
  "live_crawl",
  "media_generation",
  "media_download",
];

const sourceInputs = [
  { path: "data/reports/agent_registry_report.json", required: false, usage: "Previous hierarchy reference when available." },
  { path: "data/reports/department_roadmap_and_agent_coverage.json", required: false, usage: "Department coverage reference when available." },
  { path: "data/reports/base_hq_runbook_report.json", required: false, usage: "Safety and operating model reference when available." },
];

const capabilityEndpoints: CapabilityEndpoint[] = [
  endpoint("master.prioritise_tasks", "Master AI Management", "Prioritise report-only work for Danny's queue.", ["local command/report summaries"], ["ranked planning queue"]),
  endpoint("qc.check_safety_boundaries", "Quality Control", "Check whether a recommendation stays inside safety limits.", ["local draft/report item"], ["qc finding"]),
  endpoint("qc.check_unsupported_claims", "Quality Control", "Flag unsupported claim, scam/fraud, legal, and rating risk.", ["local draft/report item"], ["evidence gap or block"]),
  endpoint("qc.check_affiliate_disclosure", "Quality Control", "Check disclosure and monetisation risk in draft-only recommendations.", ["affiliate report item"], ["disclosure review note"]),
  endpoint("qc.check_rating_change_risk", "Quality Control", "Flag rating-impacting recommendations for human review.", ["trust/rating report item"], ["rating risk note"]),
  endpoint("governance.record_decision_trail", "Audit Trail / Governance", "Define future audit trail records without writing live decisions.", ["local lifecycle item"], ["audit planning entry"]),
  endpoint("routing.route_to_manager", "Audit Trail / Governance", "Route future agent outputs to department managers.", ["agent output contract item"], ["manager routing recommendation"]),
  endpoint("content.profile_page_quality", "Content", "Detect weak, thin, underdeveloped, or unclear pages from local snapshots.", ["normalised content snapshot"], ["page quality finding"], "active_report_only"),
  endpoint("content.recommend_page_blueprint", "Content", "Translate page weaknesses into page structure requirements.", ["page quality report"], ["page blueprint recommendation"], "active_report_only"),
  endpoint("content.recommend_related_sections", "Content", "Plan related reviews, guides, warnings, promos/news, and comparisons.", ["page quality report", "blueprint report"], ["content cluster recommendation"], "active_report_only"),
  endpoint("content.prepare_refresh_outline", "Content", "Prepare future draft-only refresh outlines.", ["command queue item"], ["draft outline"]),
  endpoint("seo.check_title_meta", "SEO", "Review title and metadata opportunities.", ["metadata report"], ["metadata improvement item"], "active_report_only"),
  endpoint("seo.check_keyword_fit", "SEO", "Check keyword/search intent fit without live SERP calls.", ["local content report"], ["keyword fit note"]),
  endpoint("links.recommend_internal_links", "Internal Linking", "Recommend natural internal-link placements.", ["normalised content snapshot"], ["internal link suggestion"], "active_report_only"),
  endpoint("evidence.check_source_quality", "Research / Evidence", "Check whether evidence is sufficient for future claims.", ["local evidence notes"], ["evidence quality note"]),
  endpoint("evidence.check_proof_gap", "Research / Evidence", "Identify missing proof/testing/screenshot evidence.", ["page quality or media report"], ["proof gap item"]),
  endpoint("affiliate.check_offer_expiry", "Affiliate / Offers", "Classify local affiliate offers by expiry/staleness.", ["affiliate vault"], ["offer status item"], "active_report_only"),
  endpoint("affiliate.check_disclosure_need", "Affiliate / Offers", "Flag disclosure review needs without inserting links.", ["affiliate placement report"], ["disclosure requirement"]),
  endpoint("analytics.import_ga4_signals", "Analytics", "Import local GA4 export signals when present.", ["local GA4 export"], ["analytics signal"], "active_report_only"),
  endpoint("analytics.import_gsc_signals", "Analytics", "Import local Search Console export signals when present.", ["local GSC export"], ["search performance signal"], "active_report_only"),
  endpoint("backlinks.plan_outreach", "Backlinks", "Plan future outreach opportunities without contacting anyone.", ["local content/topic report"], ["outreach planning item"]),
  endpoint("social.plan_post_draft", "Social", "Plan future social post ideas from approved local report items.", ["local planning item"], ["social draft brief"]),
  endpoint("media.recommend_media_briefs", "Media / Video", "Plan screenshots, proof blocks, diagrams, images, and video briefs.", ["page quality report", "blueprint report", "cluster report"], ["media brief recommendation"], "active_report_only"),
  endpoint("media.check_alt_text_fit", "Media / Video", "Check draft alt text for plain-English usefulness.", ["media brief item"], ["alt text note"]),
  endpoint("approvals.prepare_human_review_item", "Approvals", "Prepare a decision item for human review without approving it.", ["draft/preview/qc item"], ["approval planning item"], "active_report_only"),
  endpoint("safe_apply.block_until_approved", "Safe Apply Engine", "Block apply candidates until future explicit approval exists.", ["apply candidate"], ["blocked apply note"], "registered"),
  endpoint("settings.register_capability", "Settings / Admin", "Register future capabilities in local planning reports only.", ["registry entry"], ["registry note"]),
];

const departments: Department[] = [
  department("master-ai-management", "Master AI Management", "Prioritise cross-department work and report clean decisions to Danny.", "The Gaffer", ["The Gaffer"], ["master.prioritise_tasks"], "registered", "manager_reviewed", ["Danny", "Quality Control"]),
  department("quality-control", "Quality Control", "Guard safety, usefulness, evidence, and escalation quality.", "Gatekeeper Grace", ["Gatekeeper Grace", "Claim Checker Colin", "Rating Guard Rachel"], ["qc.check_safety_boundaries", "qc.check_unsupported_claims", "qc.check_affiliate_disclosure", "qc.check_rating_change_risk"], "active_report_only", "qc_reviewed", ["The Gaffer", "Danny"]),
  department("audit-trail-governance", "Audit Trail / Governance", "Keep lifecycle, routing, and future decision records traceable.", "Audit Alfie", ["Audit Alfie", "Routey Rachel"], ["governance.record_decision_trail", "routing.route_to_manager"], "registered", "manager_reviewed", ["Gatekeeper Grace", "The Gaffer"]),
  department("content", "Content", "Profile page quality and plan structure-first content improvements.", "Blueprint Bella", ["Blueprint Bella", "Thin Page Theo", "Rewrite Rita"], ["content.profile_page_quality", "content.recommend_page_blueprint", "content.prepare_refresh_outline"], "active_report_only", "manager_reviewed", ["Gatekeeper Grace", "The Gaffer"]),
  department("seo", "SEO", "Plan metadata, search intent, and keyword-fit improvements.", "Rankhound", ["Rankhound", "Keyword Kev"], ["seo.check_title_meta", "seo.check_keyword_fit"], "active_report_only", "manager_reviewed", ["Gatekeeper Grace"]),
  department("internal-linking", "Internal Linking", "Plan natural related sections and internal link support.", "Cluster Clara", ["Cluster Clara", "Linksmith"], ["content.recommend_related_sections", "links.recommend_internal_links"], "active_report_only", "manager_reviewed", ["SEO", "Gatekeeper Grace"]),
  department("research-evidence", "Research / Evidence", "Review source quality, proof gaps, and claim support.", "Inspector Proof", ["Inspector Proof", "Screenshot Sam", "Red Flag Rita"], ["evidence.check_source_quality", "evidence.check_proof_gap"], "registered", "manager_reviewed", ["Gatekeeper Grace", "The Gaffer"]),
  department("affiliate-offers", "Affiliate / Offers", "Plan disclosure-first affiliate and offer review work.", "Offer Owl", ["Offer Owl", "Expiry Eddie", "Disclosure Daisy"], ["affiliate.check_offer_expiry", "affiliate.check_disclosure_need"], "active_report_only", "manager_reviewed", ["Gatekeeper Grace", "Danny"]),
  department("analytics", "Analytics", "Import local performance signals and flag review opportunities.", "Metric Molly", ["Metric Molly"], ["analytics.import_ga4_signals", "analytics.import_gsc_signals"], "active_report_only", "manager_reviewed", ["SEO", "The Gaffer"]),
  department("backlinks", "Backlinks", "Plan future backlink and outreach opportunities without live contact.", "Backlink Barry", ["Backlink Barry"], ["backlinks.plan_outreach"], "planned", "basic_report_only", ["Gatekeeper Grace"]),
  department("social", "Social", "Plan future social drafts and moderation routing from approved report items.", "Social Sophie", ["Social Sophie"], ["social.plan_post_draft"], "planned", "basic_report_only", ["Gatekeeper Grace"]),
  department("media-video", "Media / Video", "Plan media, proof visuals, alt text, and video outlines.", "Pixel Pete", ["Pixel Pete", "Image Iris", "Storyboard Sam"], ["media.recommend_media_briefs", "media.check_alt_text_fit"], "active_report_only", "manager_reviewed", ["Gatekeeper Grace", "Content"]),
  department("approvals", "Approvals", "Prepare human review items without granting approval.", "Approval Ava", ["Approval Ava"], ["approvals.prepare_human_review_item"], "active_report_only", "approval_ready", ["Danny", "The Gaffer"]),
  department("safe-apply-engine", "Safe Apply Engine", "Future-only apply blocker until preview, audit, rollback, and human approval exist.", "Safe Apply Sam", ["Safe Apply Sam"], ["safe_apply.block_until_approved"], "registered", "safe_apply_ready", ["Danny", "Gatekeeper Grace"]),
  department("settings-admin", "Settings / Admin", "Maintain local registry and capability configuration boundaries.", "Audit Alfie", ["Audit Alfie"], ["settings.register_capability"], "registered", "manager_reviewed", ["The Gaffer"]),
];

const agents: Agent[] = [
  agent("the-gaffer", "The Gaffer", "Master AI Management", "manager", "Top-level manager for prioritised report-only command queues.", "registered", "manager_reviewed", ["master.prioritise_tasks"], ["Gatekeeper Grace", "Danny"], ["Gatekeeper Grace"], "high"),
  agent("gatekeeper-grace", "Gatekeeper Grace", "Quality Control", "guard", "Cross-department safety and usefulness gatekeeper.", "active_report_only", "qc_reviewed", ["qc.check_safety_boundaries", "qc.check_unsupported_claims"], ["The Gaffer"], ["Audit Alfie"], "high"),
  agent("audit-alfie", "Audit Alfie", "Audit Trail / Governance", "guard", "Governance and audit trail planner.", "registered", "manager_reviewed", ["governance.record_decision_trail", "settings.register_capability"], ["The Gaffer"], ["Gatekeeper Grace"], "high"),
  agent("routey-rachel", "Routey Rachel", "Audit Trail / Governance", "specialist", "Department inbox and escalation router.", "registered", "manager_reviewed", ["routing.route_to_manager"], ["Gatekeeper Grace"], ["Audit Alfie"], "high"),
  agent("blueprint-bella", "Blueprint Bella", "Content", "manager", "Turns weak page findings into page blueprint requirements.", "active_report_only", "manager_reviewed", ["content.recommend_page_blueprint"], ["Gatekeeper Grace"], ["Gatekeeper Grace"], "high"),
  agent("thin-page-theo", "Thin Page Theo", "Content", "worker", "Profiles weak, thin, underdeveloped, and unclear pages.", "active_report_only", "manager_reviewed", ["content.profile_page_quality"], ["Blueprint Bella"], ["Gatekeeper Grace"], "high"),
  agent("rewrite-rita", "Rewrite Rita", "Content", "worker", "Future draft-outline worker for refresh and rebuild plans.", "planned", "ai_assisted", ["content.prepare_refresh_outline"], ["Blueprint Bella"], ["Gatekeeper Grace"], "medium"),
  agent("rankhound", "Rankhound", "SEO", "manager", "SEO manager for metadata and search-intent fit.", "active_report_only", "manager_reviewed", ["seo.check_title_meta", "seo.check_keyword_fit"], ["Gatekeeper Grace"], ["Gatekeeper Grace"], "high"),
  agent("keyword-kev", "Keyword Kev", "SEO", "specialist", "Future keyword-fit and search-intent planner.", "registered", "manager_reviewed", ["seo.check_keyword_fit"], ["Rankhound"], ["Gatekeeper Grace"], "medium"),
  agent("cluster-clara", "Cluster Clara", "Internal Linking", "manager", "Plans related sections and content cluster needs.", "active_report_only", "manager_reviewed", ["content.recommend_related_sections"], ["Rankhound"], ["Gatekeeper Grace"], "high"),
  agent("linksmith", "Linksmith", "Internal Linking", "worker", "Recommends natural internal-link placements.", "active_report_only", "manager_reviewed", ["links.recommend_internal_links"], ["Cluster Clara"], ["Gatekeeper Grace"], "high"),
  agent("inspector-proof", "Inspector Proof", "Research / Evidence", "manager", "Reviews evidence quality before claims move forward.", "registered", "manager_reviewed", ["evidence.check_source_quality"], ["Gatekeeper Grace"], ["Audit Alfie"], "high"),
  agent("screenshot-sam", "Screenshot Sam", "Research / Evidence", "worker", "Plans screenshot/proof evidence requirements without downloading media.", "registered", "manager_reviewed", ["evidence.check_proof_gap"], ["Inspector Proof"], ["Gatekeeper Grace"], "medium"),
  agent("red-flag-rita", "Red Flag Rita", "Research / Evidence", "guard", "Flags sensitive warning/scam-risk signals for evidence review.", "registered", "qc_reviewed", ["evidence.check_source_quality"], ["Gatekeeper Grace"], ["Inspector Proof", "Gatekeeper Grace"], "high"),
  agent("claim-checker-colin", "Claim Checker Colin", "Quality Control", "guard", "Checks unsupported claim, scam/fraud, legal, and evidence risk.", "registered", "qc_reviewed", ["qc.check_unsupported_claims"], ["Gatekeeper Grace"], ["Audit Alfie"], "high"),
  agent("rating-guard-rachel", "Rating Guard Rachel", "Quality Control", "guard", "Blocks trust-rating-impacting recommendations until human review.", "registered", "qc_reviewed", ["qc.check_rating_change_risk"], ["Gatekeeper Grace", "Danny"], ["Audit Alfie"], "high"),
  agent("offer-owl", "Offer Owl", "Affiliate / Offers", "manager", "Affiliate and offer manager focused on disclosure and safety.", "active_report_only", "manager_reviewed", ["affiliate.check_offer_expiry", "affiliate.check_disclosure_need"], ["Gatekeeper Grace", "Danny"], ["Gatekeeper Grace"], "high"),
  agent("expiry-eddie", "Expiry Eddie", "Affiliate / Offers", "worker", "Tracks local offer expiry and stale terms.", "active_report_only", "manager_reviewed", ["affiliate.check_offer_expiry"], ["Offer Owl"], ["Gatekeeper Grace"], "high"),
  agent("disclosure-daisy", "Disclosure Daisy", "Affiliate / Offers", "guard", "Checks disclosure needs without inserting affiliate links.", "registered", "qc_reviewed", ["affiliate.check_disclosure_need", "qc.check_affiliate_disclosure"], ["Offer Owl", "Gatekeeper Grace"], ["Gatekeeper Grace"], "high"),
  agent("pixel-pete", "Pixel Pete", "Media / Video", "manager", "Media and visual planning manager.", "active_report_only", "manager_reviewed", ["media.recommend_media_briefs"], ["Gatekeeper Grace"], ["Gatekeeper Grace"], "high"),
  agent("image-iris", "Image Iris", "Media / Video", "worker", "Plans image and alt text needs without generating or downloading media.", "registered", "manager_reviewed", ["media.check_alt_text_fit"], ["Pixel Pete"], ["Gatekeeper Grace"], "medium"),
  agent("storyboard-sam", "Storyboard Sam", "Media / Video", "worker", "Plans outline-only video briefs.", "registered", "manager_reviewed", ["media.recommend_media_briefs"], ["Pixel Pete"], ["Gatekeeper Grace"], "medium"),
  agent("social-sophie", "Social Sophie", "Social", "manager", "Future social planning and moderation routing manager.", "planned", "basic_report_only", ["social.plan_post_draft"], ["Gatekeeper Grace"], ["Gatekeeper Grace"], "low"),
  agent("metric-molly", "Metric Molly", "Analytics", "manager", "Imports and summarises local analytics/search signals.", "active_report_only", "manager_reviewed", ["analytics.import_ga4_signals", "analytics.import_gsc_signals"], ["The Gaffer"], ["Gatekeeper Grace"], "medium"),
  agent("backlink-barry", "Backlink Barry", "Backlinks", "manager", "Future backlink opportunity planner without live outreach.", "planned", "basic_report_only", ["backlinks.plan_outreach"], ["Gatekeeper Grace"], ["Gatekeeper Grace"], "low"),
  agent("approval-ava", "Approval Ava", "Approvals", "manager", "Prepares approval planning items but never approves.", "active_report_only", "approval_ready", ["approvals.prepare_human_review_item"], ["Danny", "The Gaffer"], ["Gatekeeper Grace"], "high"),
  agent("safe-apply-sam", "Safe Apply Sam", "Safe Apply Engine", "engine", "Future-only apply blocker until explicit approval workflow exists.", "registered", "safe_apply_ready", ["safe_apply.block_until_approved"], ["Danny", "Gatekeeper Grace"], ["Audit Alfie", "Gatekeeper Grace"], "high"),
];

export async function buildAgentCapabilityRegistryV2(): Promise<unknown> {
  const escalationMap = [
    { from: "worker agents", to: "department manager", reason: "Workers do not report directly to Danny." },
    { from: "department manager", to: "Gatekeeper Grace", reason: "Safety, evidence, affiliate, rating, legal, or claim risk." },
    { from: "Gatekeeper Grace", to: "The Gaffer", reason: "Cross-department priority or unresolved risk." },
    { from: "The Gaffer", to: "Danny", reason: "Only clean, important, human decision items." },
    { from: "Safe Apply Sam", to: "Danny", reason: "Future-only apply candidates stay blocked until explicit approval exists." },
  ];
  const maturityRoadmap = [
    { status: "planned", meaning: "Named in the workforce plan only.", nextStep: "Define report-only inputs and outputs." },
    { status: "registered", meaning: "Registered with purpose, blocked actions, and endpoint mapping.", nextStep: "Add local report-only builder or validator." },
    { status: "basic_report_only", meaning: "Can produce or support simple local planning reports.", nextStep: "Add stricter validators and manager routing." },
    { status: "active_report_only", meaning: "Implemented as local report-only tooling.", nextStep: "Route through QC and governance reports." },
    { status: "ai_assisted", meaning: "Future AI assistance after contracts and safety checks exist.", nextStep: "Human approval required before any real AI/API use." },
    { status: "manager_reviewed", meaning: "Future manager review stage.", nextStep: "QC review for sensitive items." },
    { status: "qc_reviewed", meaning: "Future QC-reviewed stage.", nextStep: "Danny review if high impact." },
    { status: "approval_ready", meaning: "Future human review package stage; not approved.", nextStep: "Explicit human decision required." },
    { status: "safe_apply_ready", meaning: "Future-only safe apply readiness concept.", nextStep: "Requires preview, diff, rollback, audit, and approval." },
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Agent Capability Registry v2",
    name: "Agent Capability Registry v2",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputs,
    validationStatus: "ready_for_validation",
    allowedLifecycleStates,
    blockedLifecycleStates,
    allowedMaturityStatuses: ["planned", "registered", "basic_report_only", "active_report_only", "ai_assisted", "manager_reviewed", "qc_reviewed", "approval_ready", "safe_apply_ready"],
    blockedActions,
    summary: {
      departmentCount: departments.length,
      agentCount: agents.length,
      capabilityEndpointCount: capabilityEndpoints.length,
      managerCount: agents.filter((agentItem) => agentItem.roleType === "manager").length,
      workerOrSpecialistCount: agents.filter((agentItem) => ["worker", "specialist"].includes(agentItem.roleType)).length,
      guardOrEngineCount: agents.filter((agentItem) => ["guard", "engine"].includes(agentItem.roleType)).length,
      byCurrentMaturity: countBy(agents, (agentItem) => agentItem.currentMaturityStatus),
      byPriorityTier: countBy(agents, (agentItem) => agentItem.priorityTier),
      byDepartment: countBy(agents, (agentItem) => agentItem.department),
    },
    departments,
    agents,
    capabilityEndpoints,
    escalationMap,
    maturityRoadmap,
    safetyChecks: {
      reportOnly: true,
      localOnly: true,
      readOnly: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveContentEdits: true,
      noAffiliateUrlInsertion: true,
      noApprovalApplyWorkflow: true,
      noSecrets: true,
      noExternalApiCalls: true,
      noAiApiCalls: true,
      noLiveCrawling: true,
      noTrustRatingChanges: true,
      noScamFraudAccusations: true,
      noMediaGeneration: true,
      noMediaDownloads: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Agent Capability Registry v2 report written", { outputJson, outputMd, agents: agents.length, endpoints: capabilityEndpoints.length });
  return report;
}

function department(
  departmentId: string,
  departmentName: string,
  purpose: string,
  managerAgent: string,
  workerAgents: string[],
  capabilityEndpointIds: string[],
  currentMaturityStatus: MaturityStatus,
  targetMaturityStatus: MaturityStatus,
  escalationTargets: string[],
): Department {
  return { departmentId, departmentName, purpose, managerAgent, workerAgents, capabilityEndpointIds, currentMaturityStatus, targetMaturityStatus, escalationTargets, blockedActions };
}

function endpoint(endpointId: string, departmentName: string, purpose: string, allowedInputs: string[], allowedOutputs: string[], maturityStatus: MaturityStatus = "registered"): CapabilityEndpoint {
  return {
    endpointId,
    department: departmentName,
    purpose,
    allowedInputs,
    allowedOutputs,
    lifecycleLimit: "detected/suspected/verified/recommended/report-only states only; approved and applied are blocked",
    maturityStatus,
    blockedActions,
  };
}

function agent(
  agentId: string,
  agentName: string,
  departmentName: string,
  roleType: RoleType,
  purpose: string,
  currentMaturityStatus: MaturityStatus,
  targetMaturityStatus: MaturityStatus,
  capabilityEndpointIds: string[],
  escalationTargets: string[],
  checkedBy: string[],
  priorityTier: "high" | "medium" | "low",
): Agent {
  return {
    agentId,
    agentName,
    department: departmentName,
    roleType,
    purpose,
    currentMaturityStatus,
    targetMaturityStatus,
    allowedModes: ["READ_ONLY_REPORT_ONLY", "local_report_only", "draft_planning_only"],
    blockedActions,
    allowedInputs: ["local reports", "local content snapshots", "local exported analytics/search files", "future human-provided evidence"],
    allowedOutputs: ["local JSON reports", "local Markdown reports", "draft-only recommendations", "manager review notes", "QC escalation notes"],
    capabilityEndpoints: capabilityEndpointIds,
    escalationTargets,
    checkedBy,
    priorityTier,
    implementationNotes: [
      "No live execution in v2.",
      "No actual AI calls yet.",
      "No external API calls.",
      "Must preserve non-apply lifecycle states.",
    ],
  };
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function renderMarkdown(report: { generatedAt: string; summary: Record<string, unknown>; departments: Department[]; agents: Agent[]; capabilityEndpoints: CapabilityEndpoint[]; escalationMap: Array<Record<string, string>>; maturityRoadmap: Array<Record<string, string>> }): string {
  return `# Agent Capability Registry v2

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
localOnly: true
readOnly: true
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Summary

- Departments: ${String(report.summary.departmentCount ?? 0)}
- Agents: ${String(report.summary.agentCount ?? 0)}
- Capability endpoints: ${String(report.summary.capabilityEndpointCount ?? 0)}

## Departments

${report.departments.map((item) => `- **${item.departmentName}** (${item.currentMaturityStatus}): ${item.purpose} Manager: ${item.managerAgent}.`).join("\n")}

## Agents

${report.agents.map((item) => `- **${item.agentName}** (${item.roleType}, ${item.currentMaturityStatus}): ${item.purpose}`).join("\n")}

## Capability Endpoints

${report.capabilityEndpoints.map((item) => `- \`${item.endpointId}\` (${item.department}): ${item.purpose}`).join("\n")}

## Escalation Map

${report.escalationMap.map((item) => `- ${item.from} -> ${item.to}: ${item.reason}`).join("\n")}

## Maturity Roadmap

${report.maturityRoadmap.map((item) => `- **${item.status}**: ${item.meaning} Next: ${item.nextStep}`).join("\n")}

## Safety

This registry is local-only and report-only. It does not call AI APIs, call external APIs, crawl live sites, publish, write to Supabase, edit live content, insert affiliate URLs, change trust ratings, generate media, download media, approve, or apply anything.
`;
}

if (isDirectRun(import.meta.url)) {
  buildAgentCapabilityRegistryV2().catch((error) => {
    logger.error("Agent Capability Registry v2 build failed", { error });
    process.exitCode = 1;
  });
}
