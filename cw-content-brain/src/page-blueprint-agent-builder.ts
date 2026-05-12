import { existsSync } from "node:fs";
import { fromRoot, isDirectRun, readJson, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";

type BlueprintType =
  | "review_blueprint"
  | "category_hub_blueprint"
  | "guide_blueprint"
  | "warning_scam_risk_blueprint"
  | "comparison_blueprint"
  | "full_rebuild_blueprint";

type LifecycleState =
  | "detected"
  | "suspected"
  | "verified"
  | "recommended"
  | "blocked"
  | "monitor_only"
  | "needs_more_evidence"
  | "escalated_to_qc"
  | "escalated_to_master_ai"
  | "recommended_for_danny_review";

interface PageQualityFinding {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  slug?: string;
  inferredPageType?: string;
  priority?: string;
  weaknessCategories?: string[];
  evidenceGaps?: string[];
  recommendedNextOwner?: string;
  recommendedBlueprintNeed?: string;
  currentLifecycleState?: string;
}

interface BlueprintRecommendation {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  inferredPageType: string;
  sourcePriority: string;
  recommendedBlueprintType: BlueprintType;
  recommendedStructureSections: string[];
  missingCriticalSections: string[];
  optionalEnhancementSections: string[];
  evidenceRequirements: string[];
  mediaRequirements: string[];
  internalLinkingRequirements: string[];
  affiliateDisclosureRequirements: string[];
  riskAndComplianceNotes: string[];
  recommendedNextOwner: string;
  recommendedLifecycleState: LifecycleState;
  draftOnly: true;
  needsHumanReview: true;
  canAutoApply: false;
}

const inputJson = "data/reports/page_quality_profiler_report.json";
const outputJson = "data/reports/page_blueprint_agent_report.json";
const outputMd = "data/reports/page_blueprint_agent_report.md";

const allowedLifecycleStates: LifecycleState[] = [
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

const blueprintStructures: Record<BlueprintType, string[]> = {
  review_blueprint: [
    "H1: Is [Brand] safe? Full CryptoWatchdog review",
    "Quick verdict",
    "Trust rating explanation",
    "What [Brand] is",
    "How it works",
    "Who uses it",
    "Fees/features/limits",
    "Deposit/withdrawal notes where relevant",
    "Evidence/proof/testing status",
    "Screenshots/proof media",
    "Pros and cons",
    "Red flags or concerns",
    "Alternatives/comparisons",
    "Related review cards",
    "FAQs",
    "CryptoWatchdog view",
    "Affiliate disclosure where relevant",
    "Last updated / evidence status",
  ],
  category_hub_blueprint: [
    "H1: Best/Safest [Category] platforms/tools",
    "What this category is",
    "How it works",
    "Why people use it",
    "Who it suits",
    "Who should be careful",
    "Common scams/red flags",
    "Beginner/dummies guide section",
    "Reviewed companies/tools comparison",
    "Related review cards",
    "Related guides/news/promos/warnings",
    "Screenshots/images/video briefs",
    "CryptoWatchdog view",
    "FAQs",
    "Last updated",
  ],
  guide_blueprint: [
    "H1: Practical guide title",
    "Plain-English explanation",
    "Step-by-step guidance",
    "Common mistakes",
    "Scam/risk warnings",
    "Examples",
    "Related reviews/tools",
    "Related guides",
    "FAQs",
    "CryptoWatchdog view",
    "Last updated",
  ],
  warning_scam_risk_blueprint: [
    "H1: [Entity/topic] warning / risk report",
    "Clear safety summary",
    "Verified vs suspected split",
    "Evidence timeline",
    "Source list",
    "What users report",
    "Red flags",
    "What to do if affected",
    "What not to do",
    "Related warnings",
    "Related safer alternatives",
    "FAQs",
    "Human review required",
    "Last updated / evidence status",
  ],
  comparison_blueprint: [
    "H1: [A] vs [B] / best alternatives",
    "Quick comparison table",
    "Safety/trust comparison",
    "Fees/features comparison",
    "Pros/cons by option",
    "Who should choose which",
    "Evidence/proof status",
    "Related reviews",
    "FAQs",
    "CryptoWatchdog view",
    "Last updated",
  ],
  full_rebuild_blueprint: [
    "Use the relevant page-type blueprint",
    "Page purpose rewrite required",
    "Heading rebuild required",
    "Intro rebuild required",
    "Evidence gap review required",
    "Media plan required",
    "Internal linking plan required",
    "Related card plan required",
    "Compliance review required",
  ],
};

const blockedActions = [
  "No publishing.",
  "No Supabase writes.",
  "No live website edits.",
  "No approval/apply workflow.",
  "No affiliate links inserted.",
  "No scam/fraud accusations generated.",
  "No trust rating changes.",
  "No live crawling/fetching.",
  "No approved blueprint recommendations in v1.",
  "No applied blueprint recommendations in v1.",
];

export async function buildPageBlueprintAgent(): Promise<unknown> {
  const sourceInput = await loadProfilerReport();
  const blueprintRecommendations = sourceInput.findings.map(buildRecommendation);
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Page Blueprint Agent v1",
    name: "Page Blueprint Agent v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputs: [{
      path: inputJson,
      found: sourceInput.found,
      findingCount: sourceInput.findings.length,
      notes: sourceInput.found
        ? "Read local Page Quality Profiler report only."
        : "Page Quality Profiler report was missing; run npm run content:page-quality first.",
    }],
    validationStatus: "ready_for_validation",
    allowedLifecycleStates,
    blockedLifecycleStates,
    blueprintTypes: Object.keys(blueprintStructures),
    summary: {
      sourceFindingCount: sourceInput.findings.length,
      recommendationCount: blueprintRecommendations.length,
      byBlueprintType: countBy(blueprintRecommendations, (item) => item.recommendedBlueprintType),
      byLifecycleState: countBy(blueprintRecommendations, (item) => item.recommendedLifecycleState),
      byOwner: countBy(blueprintRecommendations, (item) => item.recommendedNextOwner),
    },
    blueprintRecommendations,
    blockedActions,
    safetyChecks: {
      reportOnly: true,
      localDataOnly: true,
      noLiveCrawling: true,
      noLiveFetching: true,
      noSupabaseWrites: true,
      noPublishing: true,
      noLiveContentEdits: true,
      noApprovalApplyWorkflow: true,
      noAffiliateUrlInsertion: true,
      noTrustRatingChanges: true,
      noScamFraudAccusations: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Page blueprint agent report written", { outputJson, outputMd, recommendations: blueprintRecommendations.length });
  return report;
}

async function loadProfilerReport(): Promise<{ found: boolean; findings: PageQualityFinding[] }> {
  if (!existsSync(fromRoot(inputJson))) return { found: false, findings: [] };
  const report = await readJson<{ pageFindings?: PageQualityFinding[] }>(inputJson);
  return { found: true, findings: Array.isArray(report.pageFindings) ? report.pageFindings : [] };
}

function buildRecommendation(finding: PageQualityFinding): BlueprintRecommendation {
  const blueprintType = blueprintTypeFor(finding);
  const structure = structureFor(blueprintType, finding);
  return {
    pageUrl: finding.pageUrl,
    pageId: finding.pageId,
    title: finding.title ?? finding.slug,
    inferredPageType: finding.inferredPageType ?? "unknown",
    sourcePriority: finding.priority ?? "unknown",
    recommendedBlueprintType: blueprintType,
    recommendedStructureSections: structure,
    missingCriticalSections: missingCriticalSectionsFor(finding, blueprintType),
    optionalEnhancementSections: optionalSectionsFor(blueprintType),
    evidenceRequirements: evidenceRequirementsFor(blueprintType, finding),
    mediaRequirements: mediaRequirementsFor(blueprintType, finding),
    internalLinkingRequirements: internalLinkingRequirementsFor(blueprintType, finding),
    affiliateDisclosureRequirements: affiliateDisclosureRequirementsFor(blueprintType),
    riskAndComplianceNotes: riskNotesFor(blueprintType, finding),
    recommendedNextOwner: ownerFor(blueprintType, finding),
    recommendedLifecycleState: lifecycleFor(blueprintType, finding),
    draftOnly: true,
    needsHumanReview: true,
    canAutoApply: false,
  };
}

function blueprintTypeFor(finding: PageQualityFinding): BlueprintType {
  const weakness = (finding.weaknessCategories ?? []).join(" ").toLowerCase();
  const inferred = (finding.inferredPageType ?? "").toLowerCase();
  const need = (finding.recommendedBlueprintNeed ?? "").toLowerCase();
  if (need.includes("full_rebuild") || weakness.includes("full rebuild")) return "full_rebuild_blueprint";
  if (need.includes("warning") || inferred.includes("warning") || weakness.includes("warning/scam-risk")) return "warning_scam_risk_blueprint";
  if (need.includes("category") || inferred.includes("category")) return "category_hub_blueprint";
  if (weakness.includes("comparison") || need.includes("comparison")) return "comparison_blueprint";
  if (need.includes("review") || inferred.includes("review")) return "review_blueprint";
  return "guide_blueprint";
}

function structureFor(type: BlueprintType, finding: PageQualityFinding): string[] {
  if (type !== "full_rebuild_blueprint") return blueprintStructures[type];
  const baseType = baseTypeForFullRebuild(finding);
  return [...blueprintStructures.full_rebuild_blueprint, ...blueprintStructures[baseType]];
}

function baseTypeForFullRebuild(finding: PageQualityFinding): Exclude<BlueprintType, "full_rebuild_blueprint"> {
  const inferred = (finding.inferredPageType ?? "").toLowerCase();
  if (inferred.includes("warning")) return "warning_scam_risk_blueprint";
  if (inferred.includes("category")) return "category_hub_blueprint";
  if (inferred.includes("review")) return "review_blueprint";
  return "guide_blueprint";
}

function missingCriticalSectionsFor(finding: PageQualityFinding, type: BlueprintType): string[] {
  const weaknesses = finding.weaknessCategories ?? [];
  const sections = new Set<string>();
  if (weaknesses.some((item) => item.includes("H1") || item.includes("H2") || item.includes("H3"))) sections.add("Heading rebuild required");
  if (weaknesses.some((item) => item.includes("intro") || item.includes("purpose"))) sections.add("Intro and page purpose");
  if (weaknesses.some((item) => item.includes("how-it-works"))) sections.add("How it works");
  if (weaknesses.some((item) => item.includes("why-people-use-it"))) sections.add("Why people use it");
  if (weaknesses.some((item) => item.includes("CryptoWatchdog view"))) sections.add("CryptoWatchdog view");
  if (weaknesses.some((item) => item.includes("evidence") || item.includes("proof"))) sections.add("Evidence/proof/testing status");
  if (weaknesses.some((item) => item.includes("screenshots"))) sections.add("Screenshots/proof media");
  if (weaknesses.some((item) => item.includes("comparison"))) sections.add("Alternatives/comparisons");
  if (weaknesses.some((item) => item.includes("internal links") || item.includes("related"))) sections.add("Related content and internal links");
  if (type === "warning_scam_risk_blueprint") sections.add("Verified vs suspected split");
  if (type === "full_rebuild_blueprint") sections.add("Full page structure rebuild");
  return Array.from(sections);
}

function optionalSectionsFor(type: BlueprintType): string[] {
  if (type === "review_blueprint") return ["Video brief", "Proof block", "Comparison table", "Related guides"];
  if (type === "category_hub_blueprint") return ["Beginner explainer", "Top reviewed tools", "Warning list", "Promo/deal review area"];
  if (type === "warning_scam_risk_blueprint") return ["Recovery resources", "Safer alternatives", "Timeline table"];
  if (type === "comparison_blueprint") return ["Decision matrix", "Best for / avoid if blocks", "Related alternatives"];
  if (type === "full_rebuild_blueprint") return ["Content outline", "Media plan", "Internal-link map", "QC checklist"];
  return ["Worked examples", "Checklist", "Screenshots", "Short video brief"];
}

function evidenceRequirementsFor(type: BlueprintType, finding: PageQualityFinding): string[] {
  const requirements = ["Use local evidence notes where available.", "State evidence gaps before drafting.", "Do not invent tests, rankings, partnerships, user numbers, or guarantees."];
  if (type === "review_blueprint" || type === "full_rebuild_blueprint") requirements.push("Review proof/testing/screenshot/evidence status before recommending review copy.");
  if (type === "warning_scam_risk_blueprint") requirements.push("Separate verified evidence from suspected signals and require human review before sensitive wording.");
  if ((finding.evidenceGaps ?? []).length > 0) requirements.push(...(finding.evidenceGaps ?? []).slice(0, 5));
  return Array.from(new Set(requirements));
}

function mediaRequirementsFor(type: BlueprintType, finding: PageQualityFinding): string[] {
  const requirements = ["Plan images only; do not upload or edit live assets.", "Use descriptive alt-text drafts only after image context is known."];
  if (type === "review_blueprint" || type === "full_rebuild_blueprint") requirements.push("Plan screenshots/proof media for evidence-led review sections.");
  if (type === "category_hub_blueprint") requirements.push("Plan hub visuals, comparison imagery, and video briefs where useful.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("videos"))) requirements.push("Create a video brief requirement for later review.");
  return requirements;
}

function internalLinkingRequirementsFor(type: BlueprintType, finding: PageQualityFinding): string[] {
  const requirements = ["Use natural in-content links after the main answer and evidence.", "Add related content near the end or where contextually useful.", "Avoid spammy exact-match anchors."];
  if (type === "review_blueprint") requirements.push("Add related review cards and relevant guides.");
  if (type === "category_hub_blueprint") requirements.push("Connect reviewed companies/tools, guides, news, promos, and warnings.");
  if (type === "warning_scam_risk_blueprint") requirements.push("Link related warnings and safer alternatives only with careful context.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("internal links"))) requirements.push("Internal-link plan is a critical missing section.");
  return requirements;
}

function affiliateDisclosureRequirementsFor(type: BlueprintType): string[] {
  if (type === "warning_scam_risk_blueprint") return ["Affiliate placements should stay blocked unless manually approved after safety review.", "Disclosure review required if any commercial mention exists."];
  if (type === "review_blueprint" || type === "comparison_blueprint" || type === "full_rebuild_blueprint") return ["Disclosure section required where commercial relationships are relevant.", "Affiliate CTA wording remains approval-only and must not include raw affiliate URLs in this report."];
  return ["Disclosure review required only if commercial or affiliate context is later added."];
}

function riskNotesFor(type: BlueprintType, finding: PageQualityFinding): string[] {
  const notes = ["Draft-only blueprint recommendation.", "Needs human review before any content change.", "No approval/apply state is created."];
  if (type === "warning_scam_risk_blueprint") notes.push("No scam/fraud accusation should be drafted without verified evidence and human approval.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("trust") || item.includes("evidence"))) notes.push("Do not change trust ratings from this blueprint recommendation.");
  return notes;
}

function ownerFor(type: BlueprintType, finding: PageQualityFinding): string {
  if (type === "warning_scam_risk_blueprint") return "Trust & Safety AI Manager";
  if (type === "comparison_blueprint" || type === "category_hub_blueprint") return "SEO AI Manager";
  if (type === "full_rebuild_blueprint") return "Content AI Manager";
  return finding.recommendedNextOwner ?? "Content AI Manager";
}

function lifecycleFor(type: BlueprintType, finding: PageQualityFinding): LifecycleState {
  if (type === "warning_scam_risk_blueprint") return "needs_more_evidence";
  if (type === "full_rebuild_blueprint") return "recommended";
  const sourceState = finding.currentLifecycleState;
  return allowedLifecycleStates.includes(sourceState as LifecycleState) ? sourceState as LifecycleState : "detected";
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function renderMarkdown(report: { generatedAt: string; sourceInputs: unknown[]; summary: Record<string, unknown>; blueprintRecommendations: BlueprintRecommendation[] }): string {
  return `# Page Blueprint Agent v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
localOnly: true
readOnly: true
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Summary

- Source findings: ${String(report.summary.sourceFindingCount ?? 0)}
- Blueprint recommendations: ${String(report.summary.recommendationCount ?? 0)}

## Source Inputs

${report.sourceInputs.map((input) => `- ${JSON.stringify(input)}`).join("\n")}

## Blueprint Recommendations

${report.blueprintRecommendations.length > 0 ? report.blueprintRecommendations.map(renderRecommendation).join("\n") : "No blueprint recommendations generated. Run the Page Quality Profiler first.\n"}
`;
}

function renderRecommendation(item: BlueprintRecommendation): string {
  return `### ${item.title ?? item.pageId ?? "Untitled page"}

- Page: ${item.pageUrl ?? item.pageId ?? "unknown"}
- Inferred page type: ${item.inferredPageType}
- Source priority: ${item.sourcePriority}
- Blueprint: ${item.recommendedBlueprintType}
- Lifecycle: ${item.recommendedLifecycleState}
- Owner: ${item.recommendedNextOwner}
- Missing critical sections: ${item.missingCriticalSections.join(", ") || "none detected"}
- Evidence requirements: ${item.evidenceRequirements.join(" ")}
- Media requirements: ${item.mediaRequirements.join(" ")}
- Internal linking requirements: ${item.internalLinkingRequirements.join(" ")}
- Affiliate/disclosure requirements: ${item.affiliateDisclosureRequirements.join(" ")}
- Risk notes: ${item.riskAndComplianceNotes.join(" ")}
`;
}

if (isDirectRun(import.meta.url)) {
  buildPageBlueprintAgent().catch((error) => {
    logger.error("Page blueprint agent build failed", { error });
    process.exitCode = 1;
  });
}
