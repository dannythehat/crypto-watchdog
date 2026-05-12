import { existsSync } from "node:fs";
import { fromRoot, isDirectRun, readJson, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";
import type { NormalisedContentRecord } from "./lib/types.js";

type ClusterType =
  | "review_related_cluster"
  | "category_hub_cluster"
  | "guide_support_cluster"
  | "warning_safety_cluster"
  | "comparison_cluster"
  | "full_rebuild_cluster";

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
  recommendedNextOwner?: string;
  currentLifecycleState?: string;
}

interface BlueprintRecommendation {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  inferredPageType?: string;
  sourcePriority?: string;
  recommendedBlueprintType?: string;
  recommendedNextOwner?: string;
  recommendedLifecycleState?: string;
  internalLinkingRequirements?: string[];
  affiliateDisclosureRequirements?: string[];
}

interface ClusterRecommendation {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  inferredPageType: string;
  sourcePriority: string;
  recommendedClusterType: ClusterType;
  relatedReviewNeeds: string[];
  relatedGuideNeeds: string[];
  relatedWarningNeeds: string[];
  relatedPromoOrNewsNeeds: string[];
  comparisonNeeds: string[];
  internalLinkingNeeds: string[];
  sidebarCardNeeds: string[];
  mobileStackingNotes: string[];
  anchorTextGuidance: string[];
  missingRelationshipGaps: string[];
  recommendedNextOwner: string;
  recommendedLifecycleState: LifecycleState;
  draftOnly: true;
  needsHumanReview: true;
  canAutoApply: false;
}

const qualityInput = "data/reports/page_quality_profiler_report.json";
const blueprintInput = "data/reports/page_blueprint_agent_report.json";
const snapshotInput = "data/content_snapshot/normalised_content.json";
const outputJson = "data/reports/content_cluster_agent_report.json";
const outputMd = "data/reports/content_cluster_agent_report.md";

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

const blockedActions = [
  "No publishing.",
  "No Supabase writes.",
  "No live website edits.",
  "No approval/apply workflow.",
  "No affiliate links inserted.",
  "No scam/fraud accusations generated.",
  "No trust rating changes.",
  "No live crawling/fetching.",
  "No approved cluster recommendations in v1.",
  "No applied cluster recommendations in v1.",
];

export async function buildContentClusterAgent(): Promise<unknown> {
  const quality = await loadQualityReport();
  const blueprints = await loadBlueprintReport();
  const snapshot = await loadSnapshot();
  const blueprintByKey = new Map(blueprints.items.map((item) => [pageKey(item), item]));
  const clusterRecommendations = quality.items.map((finding) => buildClusterRecommendation(finding, blueprintByKey.get(pageKey(finding)), snapshot.records));

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Content Cluster / Related Sections Agent v1",
    name: "Content Cluster / Related Sections Agent v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputs: [
      { path: qualityInput, found: quality.found, itemCount: quality.items.length, required: true },
      { path: blueprintInput, found: blueprints.found, itemCount: blueprints.items.length, required: true },
      { path: snapshotInput, found: snapshot.found, itemCount: snapshot.records.length, required: false },
    ],
    validationStatus: "ready_for_validation",
    allowedLifecycleStates,
    blockedLifecycleStates,
    clusterTypes: ["review_related_cluster", "category_hub_cluster", "guide_support_cluster", "warning_safety_cluster", "comparison_cluster", "full_rebuild_cluster"],
    summary: {
      sourceQualityFindingCount: quality.items.length,
      sourceBlueprintRecommendationCount: blueprints.items.length,
      snapshotRecordCount: snapshot.records.length,
      recommendationCount: clusterRecommendations.length,
      byClusterType: countBy(clusterRecommendations, (item) => item.recommendedClusterType),
      byLifecycleState: countBy(clusterRecommendations, (item) => item.recommendedLifecycleState),
      byOwner: countBy(clusterRecommendations, (item) => item.recommendedNextOwner),
    },
    clusterRecommendations,
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
  logger.info("Content cluster agent report written", { outputJson, outputMd, recommendations: clusterRecommendations.length });
  return report;
}

async function loadQualityReport(): Promise<{ found: boolean; items: PageQualityFinding[] }> {
  if (!existsSync(fromRoot(qualityInput))) return { found: false, items: [] };
  const report = await readJson<{ pageFindings?: PageQualityFinding[] }>(qualityInput);
  return { found: true, items: Array.isArray(report.pageFindings) ? report.pageFindings : [] };
}

async function loadBlueprintReport(): Promise<{ found: boolean; items: BlueprintRecommendation[] }> {
  if (!existsSync(fromRoot(blueprintInput))) return { found: false, items: [] };
  const report = await readJson<{ blueprintRecommendations?: BlueprintRecommendation[] }>(blueprintInput);
  return { found: true, items: Array.isArray(report.blueprintRecommendations) ? report.blueprintRecommendations : [] };
}

async function loadSnapshot(): Promise<{ found: boolean; records: NormalisedContentRecord[] }> {
  if (!existsSync(fromRoot(snapshotInput))) return { found: false, records: [] };
  return { found: true, records: await readJson<NormalisedContentRecord[]>(snapshotInput) };
}

function buildClusterRecommendation(finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined, records: NormalisedContentRecord[]): ClusterRecommendation {
  const clusterType = clusterTypeFor(finding, blueprint);
  const related = relatedRecordsFor(finding, records);
  return {
    pageUrl: finding.pageUrl ?? blueprint?.pageUrl,
    pageId: finding.pageId ?? blueprint?.pageId,
    title: finding.title ?? blueprint?.title,
    inferredPageType: finding.inferredPageType ?? blueprint?.inferredPageType ?? "unknown",
    sourcePriority: finding.priority ?? blueprint?.sourcePriority ?? "unknown",
    recommendedClusterType: clusterType,
    relatedReviewNeeds: relatedReviewNeedsFor(clusterType, related.reviews),
    relatedGuideNeeds: relatedGuideNeedsFor(clusterType, related.guides),
    relatedWarningNeeds: relatedWarningNeedsFor(clusterType, related.warnings),
    relatedPromoOrNewsNeeds: promoNewsNeedsFor(clusterType),
    comparisonNeeds: comparisonNeedsFor(clusterType, finding, blueprint),
    internalLinkingNeeds: internalLinkingNeedsFor(clusterType, blueprint),
    sidebarCardNeeds: sidebarCardNeedsFor(clusterType),
    mobileStackingNotes: mobileNotesFor(clusterType),
    anchorTextGuidance: anchorGuidanceFor(clusterType),
    missingRelationshipGaps: relationshipGapsFor(finding, blueprint, related),
    recommendedNextOwner: ownerFor(clusterType, finding, blueprint),
    recommendedLifecycleState: lifecycleFor(clusterType, finding, blueprint),
    draftOnly: true,
    needsHumanReview: true,
    canAutoApply: false,
  };
}

function clusterTypeFor(finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): ClusterType {
  const blueprintType = (blueprint?.recommendedBlueprintType ?? "").toLowerCase();
  const inferred = (finding.inferredPageType ?? blueprint?.inferredPageType ?? "").toLowerCase();
  const weaknesses = (finding.weaknessCategories ?? []).join(" ").toLowerCase();
  if (blueprintType.includes("full_rebuild") || weaknesses.includes("full rebuild")) return "full_rebuild_cluster";
  if (blueprintType.includes("warning") || inferred.includes("warning")) return "warning_safety_cluster";
  if (blueprintType.includes("category") || inferred.includes("category")) return "category_hub_cluster";
  if (blueprintType.includes("comparison") || weaknesses.includes("comparison")) return "comparison_cluster";
  if (blueprintType.includes("review") || inferred.includes("review")) return "review_related_cluster";
  return "guide_support_cluster";
}

function relatedRecordsFor(finding: PageQualityFinding, records: NormalisedContentRecord[]): { reviews: NormalisedContentRecord[]; guides: NormalisedContentRecord[]; warnings: NormalisedContentRecord[] } {
  const terms = termsFor([finding.title, finding.pageUrl, finding.pageId].filter(Boolean).join(" "));
  const scored = records
    .filter((record) => record.id !== finding.pageId && record.url !== finding.pageUrl)
    .map((record) => ({ record, score: scoreRecord(record, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.record);
  return {
    reviews: scored.filter((record) => record.sourceTable === "reviews").slice(0, 4),
    guides: scored.filter((record) => record.sourceTable === "blog_posts" || record.sourceTable === "categories").slice(0, 4),
    warnings: scored.filter((record) => record.sourceTable === "warnings").slice(0, 4),
  };
}

function relatedReviewNeedsFor(type: ClusterType, reviews: NormalisedContentRecord[]): string[] {
  const base = reviews.length > 0
    ? reviews.map((record) => `Review card candidate: ${record.title ?? record.slug}`)
    : ["Identify 2-4 relevant review cards from local content before drafting the section."];
  if (["review_related_cluster", "category_hub_cluster", "comparison_cluster", "full_rebuild_cluster"].includes(type)) return ["Add related review cards where contextually useful.", ...base];
  return ["Use related reviews only where they genuinely support the guide or safety explanation."];
}

function relatedGuideNeedsFor(type: ClusterType, guides: NormalisedContentRecord[]): string[] {
  const base = guides.length > 0
    ? guides.map((record) => `Guide/hub candidate: ${record.title ?? record.slug}`)
    : ["Identify supporting guides, hubs, or explainers from local content."];
  if (type === "warning_safety_cluster") return ["Add related safety guides near the bottom, after the evidence and user-action sections.", ...base];
  return ["Add related guides naturally after the main answer/evidence.", ...base];
}

function relatedWarningNeedsFor(type: ClusterType, warnings: NormalisedContentRecord[]): string[] {
  const base = warnings.length > 0
    ? warnings.map((record) => `Warning candidate: ${record.title ?? record.slug}`)
    : ["Identify related warnings only if they are evidence-relevant."];
  if (type === "warning_safety_cluster") return ["Prioritise related warnings with careful, non-accusatory wording.", ...base];
  return ["Include warnings only where they help the reader understand real risks without implying unsupported claims.", ...base];
}

function promoNewsNeedsFor(type: ClusterType): string[] {
  if (type === "warning_safety_cluster") return ["Promos should usually be blocked on warning/scam-risk pages unless manually approved.", "News/update links should be factual and evidence-led."];
  return ["Promo/deal/news sections are disclosure-review only and must not include raw affiliate URLs.", "Place promos/news near the bottom or in a clearly separated context section."];
}

function comparisonNeedsFor(type: ClusterType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string[] {
  const needs = ["Use comparison sections to help users choose, not to keyword-stuff."];
  if (type === "comparison_cluster" || type === "full_rebuild_cluster") needs.push("Add quick comparison table and related alternatives section.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("comparison")) || (blueprint?.recommendedBlueprintType ?? "").includes("comparison")) needs.push("Comparison need was already detected by upstream page quality/blueprint reports.");
  return needs;
}

function internalLinkingNeedsFor(type: ClusterType, blueprint: BlueprintRecommendation | undefined): string[] {
  const needs = ["Internal links should be natural, useful, and not keyword-stuffed.", "Main answer first; evidence second; helpful links naturally inside; related content near the end or contextually placed."];
  if (type === "category_hub_cluster") needs.push("Use hub links to reviews, guides, warnings, and comparison sections.");
  if (type === "warning_safety_cluster") needs.push("Avoid aggressive commercial links; prioritise evidence, support, and safer-alternative context.");
  if (blueprint?.internalLinkingRequirements?.length) needs.push(...blueprint.internalLinkingRequirements.slice(0, 4));
  return Array.from(new Set(needs));
}

function sidebarCardNeedsFor(type: ClusterType): string[] {
  if (type === "warning_safety_cluster") return ["Use cautious related-warning cards near the lower page area.", "Avoid promotional sidebar pressure on sensitive pages."];
  if (type === "category_hub_cluster") return ["Use scannable review/tool cards and guide cards.", "Keep cards grouped by reader task."];
  return ["Use related review/guide cards only after the main content has answered the user's core question."];
}

function mobileNotesFor(type: ClusterType): string[] {
  const notes = ["Related sections should stack cleanly on mobile rather than relying on desktop-only sidebars.", "Keep card groups short and scannable on small screens."];
  if (type === "category_hub_cluster") notes.push("Use stacked category sections with clear headings for reviews, guides, warnings, and comparisons.");
  if (type === "warning_safety_cluster") notes.push("Put safety summary and action guidance before related sections on mobile.");
  return notes;
}

function anchorGuidanceFor(type: ClusterType): string[] {
  const guidance = ["Prefer target page titles or specific shared entity/topic anchors.", "Avoid spammy exact-match anchors and generic crypto/safety anchors.", "Anchor text should read naturally in the sentence."];
  if (type === "warning_safety_cluster") guidance.push("Use careful wording such as related warning, safer alternative, or evidence guide only when supported.");
  return guidance;
}

function relationshipGapsFor(finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined, related: { reviews: NormalisedContentRecord[]; guides: NormalisedContentRecord[]; warnings: NormalisedContentRecord[] }): string[] {
  const gaps = new Set<string>();
  const weaknesses = finding.weaknessCategories ?? [];
  if (weaknesses.some((item) => item.includes("related review"))) gaps.add("Missing related review card plan.");
  if (weaknesses.some((item) => item.includes("related guides"))) gaps.add("Missing related guides/blogs/news/promos/warnings plan.");
  if (weaknesses.some((item) => item.includes("internal links"))) gaps.add("Missing natural internal-link plan.");
  if (blueprint?.recommendedBlueprintType?.includes("category") && related.reviews.length === 0) gaps.add("No local review candidates found for category hub relationship planning.");
  if (related.guides.length === 0) gaps.add("No local guide/hub candidates found from snapshot terms.");
  return Array.from(gaps);
}

function ownerFor(type: ClusterType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string {
  if (type === "warning_safety_cluster") return "Trust & Safety AI Manager";
  if (type === "category_hub_cluster" || type === "comparison_cluster") return "SEO AI Manager";
  return blueprint?.recommendedNextOwner ?? finding.recommendedNextOwner ?? "Content AI Manager";
}

function lifecycleFor(type: ClusterType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): LifecycleState {
  if (type === "warning_safety_cluster") return "needs_more_evidence";
  if (type === "full_rebuild_cluster") return "recommended";
  const sourceState = blueprint?.recommendedLifecycleState ?? finding.currentLifecycleState;
  return allowedLifecycleStates.includes(sourceState as LifecycleState) ? sourceState as LifecycleState : "detected";
}

function scoreRecord(record: NormalisedContentRecord, terms: string[]): number {
  const haystack = [record.title, record.slug, record.category, record.summary].filter(Boolean).join(" ").toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function termsFor(value: string): string[] {
  const stop = new Set(["crypto", "review", "guide", "safe", "safety", "warning", "best", "the", "and", "for", "with"]);
  return Array.from(new Set(value.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) ?? [])).filter((term) => !stop.has(term));
}

function pageKey(value: { pageUrl?: string; pageId?: string; title?: string }): string {
  return value.pageUrl ?? value.pageId ?? value.title ?? "";
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function renderMarkdown(report: { generatedAt: string; sourceInputs: unknown[]; summary: Record<string, unknown>; clusterRecommendations: ClusterRecommendation[] }): string {
  return `# Content Cluster / Related Sections Agent v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
localOnly: true
readOnly: true
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Summary

- Quality findings: ${String(report.summary.sourceQualityFindingCount ?? 0)}
- Blueprint recommendations: ${String(report.summary.sourceBlueprintRecommendationCount ?? 0)}
- Cluster recommendations: ${String(report.summary.recommendationCount ?? 0)}

## Source Inputs

${report.sourceInputs.map((input) => `- ${JSON.stringify(input)}`).join("\n")}

## Cluster Recommendations

${report.clusterRecommendations.length > 0 ? report.clusterRecommendations.map(renderRecommendation).join("\n") : "No cluster recommendations generated. Run the page quality and blueprint agents first.\n"}
`;
}

function renderRecommendation(item: ClusterRecommendation): string {
  return `### ${item.title ?? item.pageId ?? "Untitled page"}

- Page: ${item.pageUrl ?? item.pageId ?? "unknown"}
- Inferred page type: ${item.inferredPageType}
- Source priority: ${item.sourcePriority}
- Cluster type: ${item.recommendedClusterType}
- Lifecycle: ${item.recommendedLifecycleState}
- Owner: ${item.recommendedNextOwner}
- Related reviews: ${item.relatedReviewNeeds.join(" ")}
- Related guides: ${item.relatedGuideNeeds.join(" ")}
- Related warnings: ${item.relatedWarningNeeds.join(" ")}
- Promos/news: ${item.relatedPromoOrNewsNeeds.join(" ")}
- Comparisons: ${item.comparisonNeeds.join(" ")}
- Internal links: ${item.internalLinkingNeeds.join(" ")}
- Mobile notes: ${item.mobileStackingNotes.join(" ")}
- Anchor guidance: ${item.anchorTextGuidance.join(" ")}
- Relationship gaps: ${item.missingRelationshipGaps.join(" ") || "none detected"}
`;
}

if (isDirectRun(import.meta.url)) {
  buildContentClusterAgent().catch((error) => {
    logger.error("Content cluster agent build failed", { error });
    process.exitCode = 1;
  });
}
