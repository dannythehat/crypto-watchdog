import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type DecisionStage =
  | "detected"
  | "suspected"
  | "verified"
  | "recommended"
  | "approved"
  | "applied"
  | "blocked"
  | "monitor_only"
  | "needs_more_evidence"
  | "escalated_to_qc"
  | "escalated_to_master_ai"
  | "recommended_for_danny_review";

type ExampleStatus = "report_only" | "recommended" | "blocked" | "monitor_only" | "needs_more_evidence";

interface ExampleAuditEntry {
  auditId: string;
  createdAt: string;
  sourceOutputId: string;
  sourceAgentId: string;
  sourceAgentName: string;
  sourceDepartment: string;
  lifecycleStage: Exclude<DecisionStage, "approved" | "applied">;
  findingType: string;
  title: string;
  summary: string;
  evidenceReference: string;
  evidenceStrength: "low" | "medium" | "high";
  confidenceLevel: "low" | "medium" | "high";
  routedToDepartment: string;
  routedToManager: string;
  managerDecision: string;
  managerDecisionReason: string;
  qcDecision: string;
  qcDecisionReason: string;
  masterAIRecommendation: string;
  dannyDecision: "future_only_not_recorded_in_v1";
  dannyDecisionReason: "future_only_not_recorded_in_v1";
  approvalStatus: "not_approved";
  applyStatus: "not_applied";
  blockedActions: string[];
  allowedActionsNow: string[];
  nextStep: string;
  immutableNote: string;
  status: ExampleStatus;
  canAutoApply: false;
}

const outputJson = "data/reports/human_decision_log_report.json";
const outputMd = "data/reports/human_decision_log_report.md";

const requiredAuditFields = [
  "auditId",
  "createdAt",
  "sourceOutputId",
  "sourceAgentId",
  "sourceAgentName",
  "sourceDepartment",
  "lifecycleStage",
  "findingType",
  "title",
  "summary",
  "evidenceReference",
  "evidenceStrength",
  "confidenceLevel",
  "routedToDepartment",
  "routedToManager",
  "managerDecision",
  "managerDecisionReason",
  "qcDecision",
  "qcDecisionReason",
  "masterAIRecommendation",
  "dannyDecision",
  "dannyDecisionReason",
  "approvalStatus",
  "applyStatus",
  "blockedActions",
  "allowedActionsNow",
  "nextStep",
  "immutableNote",
  "status",
];

const allowedDecisionStagesV1: Array<Exclude<DecisionStage, "approved" | "applied">> = [
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

const blockedDecisionStagesV1: Array<Extract<DecisionStage, "approved" | "applied">> = ["approved", "applied"];

const decisionTypes = [
  "request_more_evidence",
  "route_to_department",
  "route_to_another_manager",
  "mark_duplicate",
  "mark_monitor_only",
  "request_revision",
  "escalate_to_qc",
  "escalate_to_master_ai",
  "recommend_for_danny_review",
  "block_due_to_risk",
  "reject_recommendation",
  "future_human_approval_placeholder",
];

const blockedDecisionTypes = [
  "publish",
  "apply",
  "write_to_supabase",
  "change_rating",
  "insert_affiliate_link",
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
  "No live audit database in v1.",
  "No approved actions in v1.",
  "No applied actions in v1.",
];

const auditRules = [
  "All future agent recommendations must be traceable to an audit entry.",
  "Every manager decision must include a reason.",
  "Every Quality Control block must include a reason.",
  "Every future Danny decision must include a reason.",
  "No live change can happen without an audit trail.",
  "No rating change can happen without a human decision record.",
  "No affiliate insertion can happen without a human decision record.",
  "No scam/fraud/legal claim can happen without evidence and a human decision record.",
  "Future applied entries should be immutable, with corrections added as follow-up entries.",
  "v1 does not approve or apply anything.",
];

const managerReviewRecords = [
  {
    recordType: "department_manager_review",
    purpose: "Record the manager inbox, decision, reason, and next routing step before QC or Master AI escalation.",
    requiredFields: ["routedToDepartment", "routedToManager", "managerDecision", "managerDecisionReason", "nextStep"],
    allowedDecisions: decisionTypes.filter((type) => type !== "future_human_approval_placeholder"),
    canApprove: false,
    canApply: false,
  },
];

const qcReviewRecords = [
  {
    recordType: "quality_control_review",
    purpose: "Record safety, evidence, usefulness, duplication, and escalation checks before important work reaches the Master AI Manager or Danny.",
    requiredFields: ["qcDecision", "qcDecisionReason", "evidenceStrength", "confidenceLevel", "blockedActions"],
    allowedDecisions: ["request_more_evidence", "request_revision", "escalate_to_master_ai", "recommend_for_danny_review", "block_due_to_risk", "mark_monitor_only"],
    canApprove: false,
    canApply: false,
  },
];

const dannyDecisionRecordsFutureOnly = [
  {
    recordType: "danny_decision_future_only",
    purpose: "Reserve a future explicit human decision record for key approvals, rejections, and final judgement calls.",
    requiredFields: ["dannyDecision", "dannyDecisionReason", "approvalStatus", "applyStatus", "immutableNote"],
    availableInV1: false,
    v1Status: "documented_only",
    canApproveInV1: false,
    canApplyInV1: false,
  },
];

const retentionRules = [
  "Keep report-only audit entries local and reviewable.",
  "Future human decision records should preserve who decided, when, why, and what evidence was used.",
  "Future applied entries should not be overwritten; corrections should be appended as follow-up audit entries.",
  "Do not store secrets, private credentials, or live database payloads in audit entries.",
  "Generated reports remain local and ignored by Git.",
];

const exampleAuditEntries: ExampleAuditEntry[] = [
  exampleEntry({
    auditId: "audit-example-thin-page-001",
    sourceOutputId: "agent-output-content-001",
    sourceAgentId: "content-refresh-draft-agent",
    sourceAgentName: "Content Refresh Draft Agent",
    sourceDepartment: "Content",
    lifecycleStage: "detected",
    findingType: "page_thinness",
    title: "Thin page detected and routed to Content Manager",
    summary: "A local content report detected a page that may need a fuller answer and more evidence-led structure.",
    evidenceReference: "Local content quality report summary.",
    evidenceStrength: "medium",
    confidenceLevel: "medium",
    routedToDepartment: "Content",
    routedToManager: "Content AI Manager",
    managerDecision: "route_to_department",
    managerDecisionReason: "Content review is the right first stop before any draft outline is prepared.",
    qcDecision: "not_reviewed_yet",
    qcDecisionReason: "QC review is not needed until a draft recommendation exists.",
    masterAIRecommendation: "Keep in department queue unless risk or priority increases.",
    allowedActionsNow: ["draft_refresh_outline", "request_more_evidence"],
    nextStep: "Content AI Manager reviews whether the existing page should be refreshed.",
    status: "recommended",
  }),
  exampleEntry({
    auditId: "audit-example-unsupported-claim-001",
    sourceOutputId: "agent-output-qc-001",
    sourceAgentId: "tone-claims-guard-agent",
    sourceAgentName: "Tone & Claims Guard Agent",
    sourceDepartment: "Trust & Safety",
    lifecycleStage: "blocked",
    findingType: "unsupported_claim",
    title: "Unsupported claim blocked by QC",
    summary: "A claim-like wording pattern was detected without enough evidence to support it.",
    evidenceReference: "Local draft text plus missing evidence reference.",
    evidenceStrength: "low",
    confidenceLevel: "medium",
    routedToDepartment: "Quality Control",
    routedToManager: "Quality Control Manager",
    managerDecision: "escalate_to_qc",
    managerDecisionReason: "Unsupported claims require a safety gate before any wording is drafted.",
    qcDecision: "block_due_to_risk",
    qcDecisionReason: "The claim needs evidence review before it can become a recommendation.",
    masterAIRecommendation: "Block pending evidence and keep out of Danny's action queue unless important.",
    allowedActionsNow: ["create_evidence_checklist", "request_more_evidence"],
    nextStep: "Research gathers supporting sources or recommends removing the claim direction.",
    status: "blocked",
  }),
  exampleEntry({
    auditId: "audit-example-offer-001",
    sourceOutputId: "agent-output-offers-001",
    sourceAgentId: "offer-monitoring-agent",
    sourceAgentName: "Offer Monitoring Agent",
    sourceDepartment: "Offers / Deals",
    lifecycleStage: "detected",
    findingType: "affiliate_offer_detected",
    title: "Affiliate offer detected and routed to Offers / Deals Manager",
    summary: "A local offer record indicates a deal or commercial term may need review.",
    evidenceReference: "Local affiliate vault or offer tracker report.",
    evidenceStrength: "medium",
    confidenceLevel: "medium",
    routedToDepartment: "Offers / Deals",
    routedToManager: "Offers / Deals Manager",
    managerDecision: "route_to_department",
    managerDecisionReason: "Offer freshness and terms need review before any affiliate CTA draft exists.",
    qcDecision: "not_reviewed_yet",
    qcDecisionReason: "QC review becomes necessary if a CTA or disclosure wording is drafted.",
    masterAIRecommendation: "Keep as commercial review, not ready-to-apply.",
    allowedActionsNow: ["review_offer_terms", "flag_stale_offer"],
    nextStep: "Offers / Deals Manager checks expiry, status, disclosure, and risk before escalation.",
    status: "recommended",
  }),
  exampleEntry({
    auditId: "audit-example-scam-signal-001",
    sourceOutputId: "agent-output-trust-001",
    sourceAgentId: "scam-pattern-watch-agent",
    sourceAgentName: "Scam Pattern Watch Agent",
    sourceDepartment: "Trust & Safety",
    lifecycleStage: "suspected",
    findingType: "scam_or_fraud_signal",
    title: "Scam signal escalated to Trust & Safety and QC",
    summary: "A possible risk signal was detected, but it is not proof and must be reviewed carefully.",
    evidenceReference: "Future source watchlist signal placeholder.",
    evidenceStrength: "low",
    confidenceLevel: "low",
    routedToDepartment: "Trust & Safety",
    routedToManager: "Trust & Safety AI Manager",
    managerDecision: "escalate_to_qc",
    managerDecisionReason: "Sensitive risk language needs Trust & Safety and QC review before any recommendation.",
    qcDecision: "request_more_evidence",
    qcDecisionReason: "A signal alone is not enough for claims, rating changes, or public wording.",
    masterAIRecommendation: "Treat as suspected and evidence-gated.",
    allowedActionsNow: ["create_evidence_checklist", "mark_monitor_only"],
    nextStep: "Gather evidence and avoid claim wording until reviewed.",
    status: "needs_more_evidence",
  }),
  exampleEntry({
    auditId: "audit-example-video-001",
    sourceOutputId: "agent-output-video-001",
    sourceAgentId: "video-brief-agent",
    sourceAgentName: "Video Brief Agent",
    sourceDepartment: "Video",
    lifecycleStage: "detected",
    findingType: "video_needed",
    title: "Video needed routed to Video Manager",
    summary: "A content opportunity may benefit from a future short video brief.",
    evidenceReference: "Local department roadmap planning signal.",
    evidenceStrength: "low",
    confidenceLevel: "low",
    routedToDepartment: "Video",
    routedToManager: "Video Manager",
    managerDecision: "route_to_department",
    managerDecisionReason: "Video work should be reviewed by the Video Manager before any script draft.",
    qcDecision: "not_reviewed_yet",
    qcDecisionReason: "No sensitive claim or public wording has been drafted.",
    masterAIRecommendation: "Monitor unless it supports a top priority.",
    allowedActionsNow: ["draft_video_brief_outline"],
    nextStep: "Video Manager decides whether to create a draft-only brief.",
    status: "monitor_only",
  }),
  exampleEntry({
    auditId: "audit-example-safe-apply-001",
    sourceOutputId: "agent-output-apply-001",
    sourceAgentId: "safe-apply-engine-inbox",
    sourceAgentName: "Safe Apply Engine Inbox",
    sourceDepartment: "Operations",
    lifecycleStage: "blocked",
    findingType: "safe_apply_candidate",
    title: "Safe apply candidate blocked in v1",
    summary: "A future apply-style candidate is documented only to show that v1 blocks apply behavior.",
    evidenceReference: "Department router future-only inbox example.",
    evidenceStrength: "high",
    confidenceLevel: "high",
    routedToDepartment: "Operations",
    routedToManager: "Master AI Manager",
    managerDecision: "block_due_to_risk",
    managerDecisionReason: "Apply behavior is outside v1 and requires future human-approved infrastructure.",
    qcDecision: "block_due_to_risk",
    qcDecisionReason: "No apply system exists in v1, and report-only tools must not create one.",
    masterAIRecommendation: "Keep blocked until a future approved Safe Apply Engine exists.",
    allowedActionsNow: ["document_blocked_reason"],
    nextStep: "Do not execute. Keep as blocked future-only planning.",
    status: "blocked",
  }),
];

const exampleBlockedEntries = [
  {
    auditId: "blocked-example-real-approval",
    reason: "A real approval record is blocked in v1; only a future explicit human approval workflow may record one.",
    blockedStage: "approved",
  },
  {
    auditId: "blocked-example-real-application",
    reason: "A real application record is blocked in v1; only a future Safe Apply Engine may record one.",
    blockedStage: "applied",
  },
  {
    auditId: "blocked-example-rating-change",
    reason: "Trust rating changes require verified evidence and a future human decision record.",
    blockedAction: "change_rating",
  },
  {
    auditId: "blocked-example-affiliate-insertion",
    reason: "Affiliate insertion requires human decision records, disclosure checks, page-risk checks, and future apply controls.",
    blockedAction: "insert_affiliate_link",
  },
];

const nextRecommendedBuilds = [
  "Add local sample audit entry imports after real worker-agent outputs exist.",
  "Connect Department Router outputs to draft audit records.",
  "Feed Quality Control decisions into the audit trail once QC produces stable item identifiers.",
  "Add dashboard summaries for audit counts and blocked decision reasons.",
  "Design a future human decision capture workflow before any Safe Apply Engine work.",
];

export async function buildHumanDecisionLog(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Human Decision Log / Audit Trail v1",
    name: "Human Decision Log / Audit Trail v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    auditPurpose: {
      summary: "Define how future Watchdog HQ findings, manager reviews, QC blocks, Master AI summaries, and Danny decisions should be recorded before any future Safe Apply Engine exists.",
      reportOnly: true,
      localOnly: true,
      liveDecisionRecording: false,
    },
    auditEntrySchema: {
      description: "Future audit entries should capture source, lifecycle, evidence, routing, manager/QC/Master AI/Danny decisions, blocked actions, and immutable notes.",
      requiredFields: requiredAuditFields,
    },
    decisionLifecycle: [
      { stage: "detected", meaning: "A signal has been observed, but no conclusion is made.", allowedInV1: true },
      { stage: "suspected", meaning: "There may be an issue or opportunity, but it is not verified.", allowedInV1: true },
      { stage: "verified", meaning: "Evidence supports the finding, but action is still not approved.", allowedInV1: true },
      { stage: "recommended", meaning: "An agent or manager proposes a next step for review.", allowedInV1: true },
      { stage: "approved", meaning: "Future human-approved state only. Blocked in v1.", allowedInV1: false },
      { stage: "applied", meaning: "Future Safe Apply Engine state only. Blocked in v1.", allowedInV1: false },
    ],
    allowedDecisionStagesV1,
    blockedDecisionStagesV1,
    decisionTypes,
    blockedDecisionTypes,
    requiredAuditFields,
    auditRules,
    managerReviewRecords,
    qcReviewRecords,
    dannyDecisionRecordsFutureOnly,
    blockedActions,
    retentionRules,
    exampleAuditEntries,
    exampleBlockedEntries,
    nextRecommendedBuilds,
    safetyChecks: {
      reportOnly: true,
      planningOnly: true,
      noLiveDecisionRecording: true,
      noLiveAuditDatabase: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveWebsiteEdits: true,
      noApprovalApplyWorkflow: true,
      noApprovedState: true,
      noAppliedState: true,
      noLiveCrawling: true,
      noLiveFetching: true,
      noSecrets: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Human decision log report written", { outputJson, outputMd, examples: exampleAuditEntries.length });
  return report;
}

function exampleEntry(input: Omit<ExampleAuditEntry, "createdAt" | "dannyDecision" | "dannyDecisionReason" | "approvalStatus" | "applyStatus" | "blockedActions" | "immutableNote" | "canAutoApply">): ExampleAuditEntry {
  return {
    ...input,
    createdAt: "future-generated-at",
    dannyDecision: "future_only_not_recorded_in_v1",
    dannyDecisionReason: "future_only_not_recorded_in_v1",
    approvalStatus: "not_approved",
    applyStatus: "not_applied",
    blockedActions,
    immutableNote: "Future applied audit entries should not be overwritten; corrections should be appended as follow-up entries.",
    canAutoApply: false,
  };
}

function renderMarkdown(report: {
  generatedAt: string;
  allowedDecisionStagesV1: string[];
  blockedDecisionStagesV1: string[];
  decisionTypes: string[];
  requiredAuditFields: string[];
  auditRules: string[];
  managerReviewRecords: unknown[];
  qcReviewRecords: unknown[];
  dannyDecisionRecordsFutureOnly: unknown[];
  blockedActions: string[];
  retentionRules: string[];
  exampleAuditEntries: ExampleAuditEntry[];
  exampleBlockedEntries: Array<{ auditId: string; reason: string; blockedStage?: string; blockedAction?: string }>;
  nextRecommendedBuilds: string[];
}): string {
  const exampleRows = report.exampleAuditEntries
    .map((entry) => `| ${entry.auditId} | ${entry.findingType} | ${entry.lifecycleStage} | ${entry.routedToManager} | ${entry.status} | ${entry.approvalStatus} | ${entry.applyStatus} |`)
    .join("\n");

  return `# Human Decision Log / Audit Trail v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Purpose

Defines the future local audit trail for Watchdog HQ agent outputs, manager reviews, Quality Control decisions, Master AI recommendations, and future Danny decisions. This is planning/report-only and does not approve, apply, publish, edit live files, create a live audit database, or write to Supabase.

## Decision Lifecycle

Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied

Allowed in v1:

${report.allowedDecisionStagesV1.map((stage) => `- ${stage}`).join("\n")}

Blocked in v1:

${report.blockedDecisionStagesV1.map((stage) => `- ${stage}`).join("\n")}

## Required Audit Fields

${report.requiredAuditFields.map((field) => `- ${field}`).join("\n")}

## Decision Types

${report.decisionTypes.map((type) => `- ${type}`).join("\n")}

## Manager, QC, And Danny Records

- Manager review records: ${report.managerReviewRecords.length}
- Quality Control review records: ${report.qcReviewRecords.length}
- Danny decision records: future-only in v1 (${report.dannyDecisionRecordsFutureOnly.length})

## Required Audit Rules

${report.auditRules.map((rule) => `- ${rule}`).join("\n")}

## Example Audit Entries

| Audit ID | Finding Type | Stage | Routed To | Status | Approval Status | Apply Status |
| --- | --- | --- | --- | --- | --- | --- |
${exampleRows}

## Example Blocked Entries

${report.exampleBlockedEntries.map((entry) => `- ${entry.auditId}: ${entry.reason}`).join("\n")}

## Retention Rules

${report.retentionRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Next Recommended Builds

${report.nextRecommendedBuilds.map((build) => `- ${build}`).join("\n")}
`;
}

if (isDirectRun(import.meta.url)) {
  buildHumanDecisionLog().catch((error) => {
    logger.error("Human decision log build failed", { error });
    process.exitCode = 1;
  });
}
