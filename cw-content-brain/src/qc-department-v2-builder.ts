import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

interface QcEndpoint {
  endpointId: string;
  name: string;
  purpose: string;
  checksFor: string[];
  allowedInputs: string[];
  allowedOutputs: string[];
  possibleRoutes: string[];
  humanApprovalTriggers: string[];
}

const outputJson = "data/reports/qc_department_v2_report.json";
const outputMd = "data/reports/qc_department_v2_report.md";

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
  "unsupported_scam_or_fraud_accusation",
  "trust_rating_change",
];

const escalationRoutes = [
  {
    routeId: "qc_to_master_ai",
    from: "Gatekeeper Grace",
    to: "The Gaffer",
    allowedStates: ["escalated_to_master_ai", "blocked", "needs_more_evidence"],
    reason: "Cross-department risk, unclear ownership, or high-impact prioritisation.",
  },
  {
    routeId: "qc_to_danny_review",
    from: "Gatekeeper Grace",
    to: "Danny",
    allowedStates: ["recommended_for_danny_review", "blocked"],
    reason: "Human judgement required for affiliate, rating, legal, scam/fraud, publishing, or high-risk content decisions.",
  },
  {
    routeId: "qc_to_evidence",
    from: "Gatekeeper Grace",
    to: "Inspector Proof",
    allowedStates: ["needs_more_evidence", "escalated_to_qc"],
    reason: "Claim, proof, screenshot, testing, or source support is incomplete.",
  },
  {
    routeId: "qc_to_affiliates",
    from: "Gatekeeper Grace",
    to: "Offer Owl / Disclosure Daisy",
    allowedStates: ["needs_more_evidence", "escalated_to_qc"],
    reason: "Affiliate or commercial disclosure risk needs department review.",
  },
];

const humanApprovalRules = [
  "Danny review is required before any publishing or live content action exists.",
  "Danny review is required before any trust rating change is drafted as a final decision.",
  "Danny review is required before any scam/fraud/legal claim progresses beyond evidence review.",
  "Danny review is required before any affiliate URL placement or commercial CTA is treated as ready.",
  "Danny review is required before any future approval/apply workflow can move from planning to execution.",
];

const qcEndpoints: QcEndpoint[] = [
  endpoint(
    "qc.check_safety_boundaries",
    "Safety Boundary Check",
    "Checks whether an agent output leaks unsafe actions before it reaches Danny.",
    [
      "Supabase writes",
      "publishing",
      "live content edits",
      "approval/apply workflow",
      "affiliate URL insertion",
      "secrets/API keys",
      "live crawling/fetching",
      "AI/API calls",
      "generated output committed",
      "scam/fraud accusation risk",
      "trust rating change risk",
    ],
    ["blocked", "escalated_to_qc", "escalated_to_master_ai"],
    ["Any unsafe action marker", "Any output that claims readiness for live execution"],
  ),
  endpoint(
    "qc.check_unsupported_claims",
    "Unsupported Claims Check",
    "Checks whether claims need evidence before being used in a draft or review queue.",
    [
      "scam/fraud allegations",
      "safety claims",
      "tested by us claims",
      "user count claims",
      "guarantee claims",
      "ranking/best claims",
      "fee claims",
      "partnership claims",
      "trust rating claims",
    ],
    ["needs_more_evidence", "blocked", "recommended_for_danny_review"],
    ["Any high-risk claim without source support", "Any claim that could affect reputation or user decisions"],
  ),
  endpoint(
    "qc.check_affiliate_disclosure",
    "Affiliate Disclosure Check",
    "Checks whether commercial content needs disclosure and whether affiliate placement risk is hidden.",
    ["affiliate/commercial intent", "missing disclosure", "undisclosed placement risk", "red/warning page monetisation risk"],
    ["needs_more_evidence", "escalated_to_qc", "recommended_for_danny_review"],
    ["Any affiliate placement recommendation", "Any commercial CTA near warning or high-risk content"],
  ),
  endpoint(
    "qc.check_rating_change_risk",
    "Trust Rating Change Risk Check",
    "Checks whether output attempts to change, imply, recommend, or apply Green/Orange/Red rating changes without approval.",
    ["Green rating language", "Orange rating language", "Red rating language", "rating change implication", "rating application wording"],
    ["blocked", "recommended_for_danny_review", "needs_more_evidence"],
    ["Any rating-impacting recommendation", "Any output that treats a rating as final"],
  ),
  endpoint(
    "qc.check_scam_wording_risk",
    "Scam Wording Risk Check",
    "Checks whether fraud/scam wording overstates evidence where the lifecycle is only detected, suspected, or incomplete.",
    ["fraud wording", "scam wording", "accusatory wording", "unsupported red-flag escalation", "defamatory visual/text risk"],
    ["needs_more_evidence", "blocked", "escalated_to_master_ai"],
    ["Any scam/fraud wording without verified evidence and human review"],
  ),
  endpoint(
    "qc.check_human_approval_needed",
    "Human Approval Classification",
    "Classifies whether Danny review is required before a recommendation can progress.",
    ["affiliate change", "trust/rating impact", "legal/policy risk", "scam/fraud wording", "publishing or apply request", "high-risk content"],
    ["recommended_for_danny_review", "blocked", "monitor_only"],
    ["Any high-risk or human-impacting recommendation"],
  ),
  endpoint(
    "qc.block_unsafe_recommendation",
    "Unsafe Recommendation Block",
    "Blocks unsafe recommendations and routes them to non-apply lifecycle states.",
    ["unsafe action leakage", "unsupported high-risk claim", "unapproved rating change", "undisclosed commercial placement", "execution request"],
    ["blocked", "needs_more_evidence", "escalated_to_qc", "escalated_to_master_ai", "recommended_for_danny_review"],
    ["Any recommendation that cannot safely move forward as report-only planning"],
  ),
];

export async function buildQcDepartmentV2(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    status: "ready_for_validation",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    departmentName: "Quality Control Department v2",
    managerName: "Gatekeeper Grace",
    managerCodename: "Gatekeeper Grace",
    purpose: "Check major agent outputs before they reach Danny, keeping safety, evidence, disclosure, rating, and approval boundaries explicit.",
    qcEndpoints,
    blockedActions,
    allowedStates,
    blockedStates,
    escalationRoutes,
    humanApprovalRules,
    summary: {
      endpointCount: qcEndpoints.length,
      blockedActionCount: blockedActions.length,
      escalationRouteCount: escalationRoutes.length,
      humanApprovalRuleCount: humanApprovalRules.length,
      allowedStateCount: allowedStates.length,
      blockedStateCount: blockedStates.length,
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
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
    errors: [] as string[],
    warnings: [] as string[],
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("QC Department v2 report written", { outputJson, outputMd, endpoints: qcEndpoints.length });
  return report;
}

function endpoint(endpointId: string, name: string, purpose: string, checksFor: string[], possibleRoutes: string[], humanApprovalTriggers: string[]): QcEndpoint {
  return {
    endpointId,
    name,
    purpose,
    checksFor,
    allowedInputs: ["local agent reports", "local draft-only recommendations", "local manager summaries", "local preview/planning items"],
    allowedOutputs: ["qc finding", "blocked recommendation", "evidence gap", "human review requirement", "manager escalation route"],
    possibleRoutes,
    humanApprovalTriggers,
  };
}

function renderMarkdown(report: { generatedAt: string; departmentName: string; managerName: string; purpose: string; qcEndpoints: QcEndpoint[]; blockedActions: string[]; escalationRoutes: typeof escalationRoutes; humanApprovalRules: string[] }): string {
  return `# QC Department v2 / Gatekeeper Grace Expansion v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Summary

${report.departmentName} is managed by ${report.managerName}. ${report.purpose}

QC v2 exists before stronger agents are added so unsafe actions, weak evidence, unsupported claims, affiliate disclosure risk, and rating-change risk are stopped before they reach Danny as decision items.

## Gatekeeper Grace Checks

${report.qcEndpoints.map((endpointItem) => `- **${endpointItem.endpointId}**: ${endpointItem.purpose}`).join("\n")}

## What Gets Blocked

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## What Gets Escalated

${report.escalationRoutes.map((route) => `- ${route.from} -> ${route.to}: ${route.reason}`).join("\n")}

## What Requires Danny Approval

${report.humanApprovalRules.map((rule) => `- ${rule}`).join("\n")}

## Safety Note

This report defines QC checks only. It does not approve, apply, publish, write to Supabase, edit live content, insert affiliate URLs, call AI/APIs, crawl live sources, change trust ratings, or make scam/fraud accusations.
`;
}

if (isDirectRun(import.meta.url)) {
  buildQcDepartmentV2().catch((error) => {
    logger.error("QC Department v2 build failed", { error });
    process.exitCode = 1;
  });
}
