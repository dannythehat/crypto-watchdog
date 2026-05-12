import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type LifecycleStage = "detected" | "suspected" | "verified" | "recommended" | "approved" | "applied";
type ConfidenceLevel = "low" | "medium" | "high";
type EvidenceStrength = "none" | "weak" | "moderate" | "strong";
type RiskLevel = "low" | "medium" | "high";

interface ExampleOutput {
  outputId: string;
  generatedAt: string;
  agentId: string;
  agentName: string;
  department: string;
  manager: string;
  sourceType: string;
  sourceReference: string;
  lifecycleStage: Exclude<LifecycleStage, "approved" | "applied">;
  findingType: string;
  title: string;
  summary: string;
  detectedSignal: string;
  suspectedIssue: string;
  verifiedEvidence: string[];
  recommendation: string;
  confidenceLevel: ConfidenceLevel;
  confidenceReason: string;
  evidenceStrength: EvidenceStrength;
  evidenceGaps: string[];
  riskLevel: RiskLevel;
  requiresHumanApproval: boolean;
  recommendedReviewer: string;
  blockedActions: string[];
  allowedActionsNow: string[];
  nextStep: string;
  status: "planning_only" | "needs_review" | "blocked_pending_evidence";
}

const outputJson = "data/reports/agent_output_contract_report.json";
const outputMd = "data/reports/agent_output_contract_report.md";

const lifecycleModel = [
  {
    stage: "detected",
    definition: "A signal has been observed, but no conclusion is made.",
    allowedInV1: true,
  },
  {
    stage: "suspected",
    definition: "There may be an issue or opportunity, but it is not verified.",
    allowedInV1: true,
  },
  {
    stage: "verified",
    definition: "Evidence supports the finding, but action is still not approved.",
    allowedInV1: true,
  },
  {
    stage: "recommended",
    definition: "An agent or manager proposes a next step for review.",
    allowedInV1: true,
  },
  {
    stage: "approved",
    definition: "Human-approved only. Reserved for a future explicit approval workflow.",
    allowedInV1: false,
  },
  {
    stage: "applied",
    definition: "Safe Apply Engine only. Reserved for a future controlled apply system.",
    allowedInV1: false,
  },
] satisfies Array<{ stage: LifecycleStage; definition: string; allowedInV1: boolean }>;

const allowedStagesV1: Array<Exclude<LifecycleStage, "approved" | "applied">> = ["detected", "suspected", "verified", "recommended"];
const blockedStagesV1: Array<Extract<LifecycleStage, "approved" | "applied">> = ["approved", "applied"];

const requiredAgentOutputFields = [
  "outputId",
  "generatedAt",
  "agentId",
  "agentName",
  "department",
  "manager",
  "sourceType",
  "sourceReference",
  "lifecycleStage",
  "findingType",
  "title",
  "summary",
  "detectedSignal",
  "suspectedIssue",
  "verifiedEvidence",
  "recommendation",
  "confidenceLevel",
  "confidenceReason",
  "evidenceStrength",
  "evidenceGaps",
  "riskLevel",
  "requiresHumanApproval",
  "recommendedReviewer",
  "blockedActions",
  "allowedActionsNow",
  "nextStep",
  "status",
];

const confidenceRules = [
  "Confidence must be low, medium, or high.",
  "Low confidence cannot be escalated to Danny unless the item is high-risk.",
  "Medium confidence can go to the relevant department manager.",
  "High confidence can go to Quality Control or the Master AI Manager.",
  "High-risk claims still require human review even when confidence is high.",
  "User reviews, social posts, and community signals cannot be high confidence alone.",
  "Scam/fraud, legal, trust rating, or rating-impacting claims require verified evidence and human approval.",
];

const evidenceRules = [
  "Agents must distinguish possible signals from verified facts.",
  "User reviews and social posts are signals, not proof.",
  "Regulator, security, and blockchain evidence must be reviewed before claims.",
  "Affiliate and commercial claims require approval before CTA changes.",
  "No invented testing, evidence, rankings, partnerships, or user numbers.",
  "No financial advice.",
  "No unsupported scam/fraud claims.",
];

const escalationRules = [
  "SEO findings route to SEO AI Manager.",
  "Content refresh findings route to Content AI Manager.",
  "Affiliate or commercial findings route to Affiliates AI Manager.",
  "Regulator, security, or scam signals route to Trust & Safety AI Manager.",
  "Evidence/testing findings route to Evidence / Testing Manager.",
  "Analytics findings route to Analytics AI Manager.",
  "Unclear or sensitive findings route to Quality Control Manager.",
  "Major decisions route to Master AI Manager.",
  "Only key decisions route to Danny.",
];

const managerReviewRules = [
  "Department managers review specialist-agent outputs before escalation.",
  "Quality Control reviews unclear, generic, duplicated, sensitive, or safety-impacting outputs.",
  "Trust & Safety reviews regulator, security, scam/fraud, legal, rating, and reputation-risk outputs.",
  "Affiliates and Trust & Safety both review monetisation on warning, red-rated, or high-risk contexts.",
  "Master AI Manager receives cleaned, prioritised manager summaries before Danny.",
  "Danny receives only important decisions that need human judgement.",
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
  "No API calls required.",
  "No secrets required.",
  "No live crawling/fetching.",
  "No approved actions in v1.",
  "No applied actions in v1.",
];

const exampleValidOutputs: ExampleOutput[] = [
  {
    outputId: "example-detected-seo-001",
    generatedAt: "example_timestamp",
    agentId: "metadata-agent",
    agentName: "Metadata Agent",
    department: "SEO",
    manager: "SEO AI Manager",
    sourceType: "local_report",
    sourceReference: "metadata_suggestions.json",
    lifecycleStage: "detected",
    findingType: "metadata_improvement",
    title: "Possible missing meta description",
    summary: "A local report detected that a page may need a stronger meta description.",
    detectedSignal: "Meta description draft field is present in the local metadata report.",
    suspectedIssue: "The existing page metadata may be thin or missing.",
    verifiedEvidence: [],
    recommendation: "Send to SEO AI Manager for draft-only metadata review.",
    confidenceLevel: "medium",
    confidenceReason: "The signal comes from a local metadata report, but the live page has not been edited or approved.",
    evidenceStrength: "moderate",
    evidenceGaps: ["Human review of the page context is still needed."],
    riskLevel: "low",
    requiresHumanApproval: true,
    recommendedReviewer: "SEO AI Manager",
    blockedActions: ["No publishing.", "No live website edits.", "No applied action."],
    allowedActionsNow: ["Prepare draft-only review note.", "Escalate to department manager."],
    nextStep: "Review as draft-only metadata work.",
    status: "needs_review",
  },
  {
    outputId: "example-recommended-trust-001",
    generatedAt: "example_timestamp",
    agentId: "source-watchlist-agent",
    agentName: "Source Watchlist Agent",
    department: "Trust & Safety",
    manager: "Trust & Safety AI Manager",
    sourceType: "planning_contract",
    sourceReference: "source_watchlist_report.json",
    lifecycleStage: "recommended",
    findingType: "evidence_review",
    title: "Sensitive risk signal needs evidence review",
    summary: "A future source signal would require Trust & Safety review before any claim is drafted.",
    detectedSignal: "A high-risk source category could produce a sensitive signal.",
    suspectedIssue: "The signal may affect trust or risk wording if corroborated.",
    verifiedEvidence: ["The contract requires verified evidence before sensitive claims."],
    recommendation: "Route to Trust & Safety and Quality Control before Danny.",
    confidenceLevel: "high",
    confidenceReason: "The routing rule is contract-defined, but no real source claim is made.",
    evidenceStrength: "strong",
    evidenceGaps: ["Actual source evidence would be needed in a future connector."],
    riskLevel: "high",
    requiresHumanApproval: true,
    recommendedReviewer: "Trust & Safety AI Manager",
    blockedActions: ["No scam/fraud accusation.", "No trust rating change.", "No legal conclusion.", "No applied action."],
    allowedActionsNow: ["Create evidence checklist.", "Escalate for manager review."],
    nextStep: "Prepare a research task, not a public claim.",
    status: "blocked_pending_evidence",
  },
];

const exampleInvalidOutputs = [
  {
    id: "invalid-approved-stage",
    issue: "Uses an approved lifecycle stage in v1.",
    unsafeStage: "approved",
    whyInvalid: "Approved is reserved for future human approval systems.",
  },
  {
    id: "invalid-applied-stage",
    issue: "Uses an applied lifecycle stage in v1.",
    unsafeStage: "applied",
    whyInvalid: "Applied is reserved for a future Safe Apply Engine.",
  },
  {
    id: "invalid-social-proof",
    issue: "Treats user reviews or social posts as proof by themselves.",
    whyInvalid: "Community signals require corroboration before verified claims.",
  },
  {
    id: "invalid-sensitive-claim",
    issue: "Drafts scam/fraud, legal, or rating-impacting wording without verified evidence and human approval.",
    whyInvalid: "Sensitive claims require evidence review and human approval.",
  },
];

const nextRecommendedBuilds = [
  "Add a reusable TypeScript type for future agent outputs.",
  "Add a shared validator helper for all future agent reports.",
  "Wire this contract into Quality Control Manager once real worker-agent outputs exist.",
  "Add dashboard contract checks for agent output contract health.",
  "Create future approval-source integration only after Danny approves the workflow.",
];

export async function buildAgentOutputContract(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Agent Output Contract v1",
    name: "Agent Output Contract v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    disclaimer:
      "Local read-only/report-only contract for future Watchdog HQ agent outputs. V1 blocks approved and applied stages.",
    lifecycleModel,
    allowedStagesV1,
    blockedStagesV1,
    requiredAgentOutputFields,
    confidenceRules,
    evidenceRules,
    escalationRules,
    managerReviewRules,
    blockedActions,
    exampleValidOutputs,
    exampleInvalidOutputs,
    nextRecommendedBuilds,
    safetyChecks: {
      reportOnly: true,
      contractOnly: true,
      noLiveWrites: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noPatchFiles: true,
      noUpdatePayloads: true,
      noLiveCrawling: true,
      noLiveFetching: true,
      noApprovalApplyWorkflow: true,
      noAffiliateLinksInserted: true,
      noScamFraudAccusations: true,
      noTrustRatingChanges: true,
      noLegalConclusions: true,
      noSecretsRequired: true,
      noApprovedStageInV1: true,
      noAppliedStageInV1: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Agent output contract report written", { outputJson, outputMd, fields: requiredAgentOutputFields.length });
  return report;
}

function renderMarkdown(report: {
  generatedAt: string;
  lifecycleModel: Array<{ stage: LifecycleStage; definition: string; allowedInV1: boolean }>;
  allowedStagesV1: string[];
  blockedStagesV1: string[];
  requiredAgentOutputFields: string[];
  confidenceRules: string[];
  evidenceRules: string[];
  escalationRules: string[];
  managerReviewRules: string[];
  blockedActions: string[];
  exampleValidOutputs: ExampleOutput[];
  exampleInvalidOutputs: Array<{ id: string; issue: string; whyInvalid: string }>;
  nextRecommendedBuilds: string[];
}): string {
  const lifecycleRows = report.lifecycleModel
    .map((stage) => `| ${stage.stage} | ${stage.allowedInV1 ? "yes" : "blocked"} | ${stage.definition} |`)
    .join("\n");
  const fieldList = report.requiredAgentOutputFields.map((field) => `- \`${field}\``).join("\n");

  return `# Agent Output Contract v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Lifecycle Model

| Stage | V1 | Definition |
| --- | --- | --- |
${lifecycleRows}

Allowed stages in v1: ${report.allowedStagesV1.join(", ")}

Blocked stages in v1: ${report.blockedStagesV1.join(", ")}

## Required Agent Output Fields

${fieldList}

## Confidence Rules

${report.confidenceRules.map((rule) => `- ${rule}`).join("\n")}

## Evidence Rules

${report.evidenceRules.map((rule) => `- ${rule}`).join("\n")}

## Escalation Rules

${report.escalationRules.map((rule) => `- ${rule}`).join("\n")}

## Manager Review Rules

${report.managerReviewRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Example Valid Outputs

${report.exampleValidOutputs.map((output) => `- ${output.outputId}: ${output.lifecycleStage} / ${output.title}`).join("\n")}

## Example Invalid Outputs

${report.exampleInvalidOutputs.map((output) => `- ${output.id}: ${output.issue} ${output.whyInvalid}`).join("\n")}

## Next Recommended Builds

${report.nextRecommendedBuilds.map((build) => `- ${build}`).join("\n")}

## Safety Notes

This is a local read-only/report-only contract. It does not publish, apply, write to Supabase, edit live files, insert affiliate links, make scam/fraud accusations, change trust ratings, call APIs, crawl/fetch live sources, or create approval/apply behavior.
`;
}

if (isDirectRun(import.meta.url)) {
  buildAgentOutputContract().catch((error) => {
    logger.error("Agent output contract build failed", { error });
    process.exitCode = 1;
  });
}
