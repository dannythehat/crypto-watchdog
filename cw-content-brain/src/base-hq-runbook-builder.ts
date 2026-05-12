import { isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

const outputJson = "data/reports/base_hq_runbook_report.json";
const outputMd = "data/reports/base_hq_runbook_report.md";

const completedBaseComponents = [
  "Phase 1 base cw-content-brain toolkit",
  "Sitemap-first crawler",
  "Read-only content snapshot",
  "Read-only Supabase export helper",
  "Finding confidence / false-positive guardrails",
  "Priority Action Queue",
  "Rendered Page Verifier",
  "Metadata Engine",
  "Internal Link Placement Brain",
  "Affiliate Vault Placement Brain",
  "Offer Expiry / Deal Tracker",
  "Search Console Import Connector",
  "GA4 Analytics Import Connector",
  "SEO Intelligence Brain",
  "Research & Duplicate Guard",
  "Agent Registry",
  "Master Command Queue",
  "Fix Draft Generator",
  "Preview Diff Engine",
  "Approval Queue",
  "Master AI Manager Daily Brief",
  "Quality Control Manager",
  "Manager Escalation Router",
  "Daily Run Orchestrator",
  "Daily Report Pack Builder",
  "Dashboard Data Export Layer",
  "Dashboard Contract Validator",
  "Department Roadmap & Agent Coverage Map",
  "Local Dashboard Shell",
  "Dashboard Launcher / Smoke Test",
  "Dashboard UI Contract Guard",
  "Source Watchlist v1",
  "Agent Output Contract v1",
  "Department Inbox / Task Router v1",
  "Human Decision Log / Audit Trail v1",
  "Base HQ Runbook v1",
];

const dailyFlow = [
  { command: "content:daily-run", purpose: "Runs the safe local planning/report builders in order." },
  { command: "content:daily-pack", purpose: "Collects core local reports into one Danny-ready daily pack." },
  { command: "content:dashboard-export", purpose: "Exports local dashboard JSON tab data from the daily pack." },
  { command: "content:dashboard-validate", purpose: "Validates dashboard JSON contracts before the local dashboard reads them." },
  { command: "content:department-roadmap", purpose: "Refreshes the department and agent coverage map." },
  { command: "dashboard:build", purpose: "Builds the local static dashboard shell." },
  { command: "dashboard:validate", purpose: "Validates the generated dashboard shell." },
  { command: "dashboard:smoke", purpose: "Checks key read-only dashboard markers." },
  { command: "dashboard:ui-guard", purpose: "Checks the local dashboard UI text contract and unsafe markers." },
];

const optionalGovernanceChecks = [
  "content:source-watchlist",
  "content:source-watchlist-validate",
  "content:agent-output-contract",
  "content:agent-output-contract-validate",
  "content:department-router",
  "content:department-router-validate",
  "content:decision-log",
  "content:decision-log-validate",
];

const dashboardFlow = [
  "Daily reports are generated locally first.",
  "Daily Report Pack summarises the current state without copying full raw reports.",
  "Dashboard Data Export Layer converts pack summaries into ignored local dashboard JSON.",
  "Dashboard Contract Validator checks shape, safety, and approval/apply boundaries.",
  "Local Dashboard Shell builds a static HTML viewer from dashboard JSON.",
  "Dashboard validators and smoke tests confirm safety wording and required sections.",
  "Danny reviews the local dashboard; it is not the live website.",
];

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

const agentLifecycleRules = {
  lifecycle: "Detected -> Suspected -> Verified -> Recommended -> Approved -> Applied",
  allowedCurrentBaseStates: allowedLifecycleStates,
  blockedCurrentBaseStates: blockedLifecycleStates,
  rules: [
    "Signals start as detected, not conclusions.",
    "Suspected items need evidence before stronger wording.",
    "Verified items can still only become recommendations in the current base.",
    "Recommended items remain draft/planning work until future explicit human approval exists.",
    "Approved and applied are blocked in the current base.",
  ],
};

const sourceWatchlistRules = [
  "Source Watchlist v1 is planning-only.",
  "No source monitoring is active in the current base.",
  "No live crawling/fetching happens without a future human-approved connector.",
  "Source signals must be treated as possible signals until evidence is reviewed.",
  "User reviews and social posts are signals, not proof.",
  "Sensitive regulator, security, scam-risk, trust, and legal signals require human review.",
];

const departmentRoutingRules = [
  "Future agent outputs must use the Agent Output Contract.",
  "Findings route to Department AI Managers before Danny wherever possible.",
  "Sensitive or unclear findings route to Quality Control and/or Master AI Manager.",
  "Only clean, important, decision-ready items should reach Danny.",
  "Safe Apply Engine routing remains future-only and blocked in the current base.",
];

const managerDecisionRules = [
  "Managers may request more evidence, route to another manager, mark duplicate, monitor, request revision, escalate, recommend Danny review, or block due to risk.",
  "Managers may not publish, apply, perform Supabase writes, change ratings, insert affiliate links, make unsupported scam/fraud claims, or finalise legal wording.",
  "Managers must include reasons for decisions and preserve lifecycle stage.",
];

const qualityControlRules = [
  "QC reviews safety, usefulness, evidence, brand fit, duplication, approval flags, lifecycle stage, and manager escalation.",
  "QC blocks unsupported claims, unsafe stages, missing approval flags, raw affiliate risks, and sensitive wording without evidence.",
  "QC may pass low-risk draft-only items, request revisions, route sideways, escalate to Master AI, or recommend Danny review.",
  "QC never approves, applies, publishes, edits live files, or writes to Supabase.",
];

const masterAIManagerRules = [
  "Master AI Manager receives department summaries and escalated items.",
  "It filters noise, balances priorities, separates draft/review/blocked/monitor work, and creates Danny's command view.",
  "It should identify what can be drafted, what needs Danny, what is blocked, and what is monitor-only.",
  "It never publishes, applies, edits live files, or records real approval in the current base.",
];

const dannyDecisionRules = [
  "Danny receives only key decisions after department, QC, or Master AI filtering.",
  "Danny approval is required for high-risk, rating, affiliate, legal, scam/fraud wording, publishing, live-site, and future apply decisions.",
  "The current base may recommend Danny review but cannot record a real approved/applied state.",
  "Future Danny decision records must include reasons and evidence references.",
];

const auditTrailRules = [
  "Future agent recommendations must be traceable to audit entries.",
  "Manager, QC, Master AI, and future Danny decisions need reasons.",
  "No live change can happen without an audit trail.",
  "Future applied entries should be immutable; corrections should be appended as follow-up entries.",
  "The current base has no live audit database and records no real approval/application.",
];

const contentBlueprintPrinciples = {
  identity: "CryptoWatchdog is not a generic AI content mill. It is evidence-led and opinion-led.",
  corePrinciple: "Evidence first. Opinion second. AI drafting third. SEO/media polish fourth. Human approval before anything important goes live.",
  globalRules: [
    "Every page should eventually follow a blueprint.",
    "No random fluff.",
    "No unsupported claims.",
    "No page should exist without a purpose.",
    "AI should generate from evidence, not invention.",
  ],
  contentTypeEvidenceRules: [
    "Reviews need proof/testing/screenshot/evidence status/comparisons/related guides.",
    "News/update posts need source verification and relevance.",
    "Promotions/offers need terms, expiry, disclosure, review attachment, and stale-offer monitoring.",
    "Guides need accuracy, practical examples, risk warnings, images/videos, FAQs, and internal links.",
    "Warnings/scam-risk pages need strict evidence, careful wording, and human review.",
  ],
  siteArchitectureDirection: [
    "Main pages should become hubs.",
    "Related sections should be strategic.",
    "Related blog posts should attach to relevant reviews/pages.",
    "Natural internal anchors should be used.",
    "Reviews should include related sites/tools/comparisons.",
    "Pages should use proper H1/H2/H3 SEO structure.",
    "Images, screenshots, proof blocks, and how-to videos should be planned.",
  ],
};

const futureWorkerAgentRules = [
  "Use Agent Output Contract.",
  "Route through Department Router.",
  "Create audit entries.",
  "Preserve lifecycle stage.",
  "State evidence gaps.",
  "Do not overclaim.",
  "Do not approve/apply.",
  "Do not publish.",
  "No Supabase writes.",
  "Do not change ratings.",
  "Do not add affiliate links.",
  "Do not make unsupported scam/fraud/legal claims.",
  "Escalate sensitive findings.",
];

const futureConnectorRules = [
  "Start read-only.",
  "Start local/export-only.",
  "No secrets committed.",
  "No writes.",
  "No publishing.",
  "No Supabase writes unless explicitly approved later.",
  "No user data collection unless clearly approved.",
  "No live monitoring without human approval.",
  "Validator required.",
];

const futureContentBlueprintRules = [
  "Build page blueprints before scaling drafting.",
  "Keep evidence requirements specific to content type.",
  "Separate source notes, opinion, draft copy, SEO metadata, and media requirements.",
  "Treat high-risk wording as an evidence checklist until reviewed.",
  "No final publishable copy without human review.",
];

const futureMediaVideoRules = [
  "Media and video agents draft briefs, not final public assets.",
  "Screenshots and proof blocks need source/evidence references.",
  "Sensitive visuals need Trust & Safety review.",
  "Video scripts must avoid unsupported claims and financial advice.",
  "Publishing remains blocked until a future approved workflow exists.",
];

const futureAffiliateRules = [
  "Affiliate opportunities remain planning-only until human review.",
  "Red/warning/high-risk contexts require explicit manual approval before any affiliate placement.",
  "Offers need terms, expiry, disclosure, review attachment, and stale-offer checks.",
  "No raw affiliate insertion by worker agents.",
  "Commercial recommendations must never outrank reader protection.",
];

const futureSafeApplyRules = [
  "Safe Apply Engine is future-only.",
  "Preview required.",
  "Diff required.",
  "Human approval required.",
  "Rollback plan required.",
  "Audit entry required.",
  "Restricted permissions required.",
  "No auto-apply by default.",
  "No rating changes without explicit Danny approval.",
  "No scam/fraud/legal wording without explicit Danny approval.",
  "No affiliate insertion without explicit approval.",
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
  "No credentials or secrets required.",
  "No live crawling/fetching unless specifically approved later.",
  "No approved actions in current base.",
  "No applied actions in current base.",
];

const operatingPrinciples = [
  "Trust comes before revenue.",
  "Evidence beats speed.",
  "Draft locally, review carefully, publish only through future approved human workflow.",
  "Keep noisy findings away from Danny until managers and QC have filtered them.",
  "Treat analytics, reviews, social signals, and watchlist items as planning signals until verified.",
  "Make safety and lifecycle stage visible in every report.",
];

const recommendedNextBuildOrder = [
  "Content blueprint schemas by page type.",
  "Evidence pack schema and local evidence checklist reports.",
  "Worker-agent sample output imports using Agent Output Contract.",
  "Department inbox summaries for dashboard data.",
  "Human decision capture design before any apply workflow.",
  "Read-only connector prototypes with validators.",
  "Safe Apply Engine design document only after preview/diff/audit rules are stable.",
];

export async function buildBaseHqRunbook(): Promise<unknown> {
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Base HQ Runbook v1",
    name: "Base HQ Runbook v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    runbookPurpose: "Operating manual for the completed Watchdog HQ base structure before real worker agents, live connectors, approval systems, or Safe Apply Engine work.",
    completedBaseComponents,
    currentDailyFlow: {
      requiredSafeChain: dailyFlow,
      optionalGovernanceChecks,
    },
    dashboardFlow,
    agentLifecycleRules,
    sourceWatchlistRules,
    departmentRoutingRules,
    managerDecisionRules,
    qualityControlRules,
    masterAIManagerRules,
    dannyDecisionRules,
    auditTrailRules,
    contentBlueprintPrinciples,
    blockedActions,
    futureWorkerAgentRules,
    futureConnectorRules,
    futureContentBlueprintRules,
    futureMediaVideoRules,
    futureAffiliateRules,
    futureSafeApplyRules,
    operatingPrinciples,
    recommendedNextBuildOrder,
    safetyChecks: {
      reportOnly: true,
      planningOnly: true,
      noTaskExecution: true,
      noLiveRoutingSystem: true,
      noApprovalSystem: true,
      noApprovedState: true,
      noAppliedState: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveWebsiteEdits: true,
      noLiveAuditDatabase: true,
      noLiveApiConnectorChanges: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Base HQ runbook report written", { outputJson, outputMd, components: completedBaseComponents.length });
  return report;
}

function renderMarkdown(report: {
  generatedAt: string;
  completedBaseComponents: string[];
  currentDailyFlow: { requiredSafeChain: Array<{ command: string; purpose: string }>; optionalGovernanceChecks: string[] };
  dashboardFlow: string[];
  agentLifecycleRules: { lifecycle: string; allowedCurrentBaseStates: string[]; blockedCurrentBaseStates: string[]; rules: string[] };
  sourceWatchlistRules: string[];
  departmentRoutingRules: string[];
  managerDecisionRules: string[];
  qualityControlRules: string[];
  masterAIManagerRules: string[];
  dannyDecisionRules: string[];
  auditTrailRules: string[];
  contentBlueprintPrinciples: typeof contentBlueprintPrinciples;
  blockedActions: string[];
  futureWorkerAgentRules: string[];
  futureConnectorRules: string[];
  futureContentBlueprintRules: string[];
  futureMediaVideoRules: string[];
  futureAffiliateRules: string[];
  futureSafeApplyRules: string[];
  operatingPrinciples: string[];
  recommendedNextBuildOrder: string[];
}): string {
  const dailyRows = report.currentDailyFlow.requiredSafeChain.map((step) => `| ${step.command} | ${step.purpose} |`).join("\n");
  return `# Base HQ Runbook v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Purpose

Operating manual for the completed Watchdog HQ base structure. This is planning/report-only and does not execute tasks, route live work, approve, apply, publish, edit live files, create a live audit database, change connectors, or perform Supabase writes.

## Completed Base Structure

${report.completedBaseComponents.map((component) => `- ${component}`).join("\n")}

## Daily Local Reporting Flow

| Command | Purpose |
| --- | --- |
${dailyRows}

Optional governance checks:

${report.currentDailyFlow.optionalGovernanceChecks.map((command) => `- ${command}`).join("\n")}

## Dashboard Flow

${report.dashboardFlow.map((rule) => `- ${rule}`).join("\n")}

## Agent Lifecycle

${report.agentLifecycleRules.lifecycle}

Allowed in current base:

${report.agentLifecycleRules.allowedCurrentBaseStates.map((stage) => `- ${stage}`).join("\n")}

Blocked in current base:

${report.agentLifecycleRules.blockedCurrentBaseStates.map((stage) => `- ${stage}`).join("\n")}

${report.agentLifecycleRules.rules.map((rule) => `- ${rule}`).join("\n")}

## Content Blueprint Principles

${report.contentBlueprintPrinciples.identity}

${report.contentBlueprintPrinciples.corePrinciple}

${report.contentBlueprintPrinciples.globalRules.map((rule) => `- ${rule}`).join("\n")}

Content-type evidence rules:

${report.contentBlueprintPrinciples.contentTypeEvidenceRules.map((rule) => `- ${rule}`).join("\n")}

Site architecture direction:

${report.contentBlueprintPrinciples.siteArchitectureDirection.map((rule) => `- ${rule}`).join("\n")}

## Routing And Review Rules

### Source Watchlist
${report.sourceWatchlistRules.map((rule) => `- ${rule}`).join("\n")}

### Department Routing
${report.departmentRoutingRules.map((rule) => `- ${rule}`).join("\n")}

### Manager Decisions
${report.managerDecisionRules.map((rule) => `- ${rule}`).join("\n")}

### Quality Control
${report.qualityControlRules.map((rule) => `- ${rule}`).join("\n")}

### Master AI Manager
${report.masterAIManagerRules.map((rule) => `- ${rule}`).join("\n")}

### Danny Decisions
${report.dannyDecisionRules.map((rule) => `- ${rule}`).join("\n")}

### Audit Trail
${report.auditTrailRules.map((rule) => `- ${rule}`).join("\n")}

## Future Rules

### Worker Agents
${report.futureWorkerAgentRules.map((rule) => `- ${rule}`).join("\n")}

### Connectors
${report.futureConnectorRules.map((rule) => `- ${rule}`).join("\n")}

### Content Blueprints
${report.futureContentBlueprintRules.map((rule) => `- ${rule}`).join("\n")}

### Media And Video
${report.futureMediaVideoRules.map((rule) => `- ${rule}`).join("\n")}

### Affiliates
${report.futureAffiliateRules.map((rule) => `- ${rule}`).join("\n")}

### Safe Apply
${report.futureSafeApplyRules.map((rule) => `- ${rule}`).join("\n")}

## Blocked Actions

${report.blockedActions.map((action) => `- ${action}`).join("\n")}

## Operating Principles

${report.operatingPrinciples.map((principle) => `- ${principle}`).join("\n")}

## Recommended Next Build Order

${report.recommendedNextBuildOrder.map((build) => `- ${build}`).join("\n")}
`;
}

if (isDirectRun(import.meta.url)) {
  buildBaseHqRunbook().catch((error) => {
    logger.error("Base HQ runbook build failed", { error });
    process.exitCode = 1;
  });
}
