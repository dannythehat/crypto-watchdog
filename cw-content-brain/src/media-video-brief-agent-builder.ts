import { existsSync } from "node:fs";
import { fromRoot, isDirectRun, readJson, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";
import type { NormalisedContentRecord } from "./lib/types.js";

type MediaBriefType =
  | "review_media_brief"
  | "category_hub_media_brief"
  | "guide_media_brief"
  | "warning_safety_media_brief"
  | "comparison_media_brief"
  | "full_rebuild_media_brief";

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
  inferredPageType?: string;
  priority?: string;
  weaknessCategories?: string[];
  evidenceGaps?: string[];
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
  mediaRequirements?: string[];
  evidenceRequirements?: string[];
  riskAndComplianceNotes?: string[];
  recommendedNextOwner?: string;
  recommendedLifecycleState?: string;
}

interface ClusterRecommendation {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  inferredPageType?: string;
  sourcePriority?: string;
  recommendedClusterType?: string;
  sidebarCardNeeds?: string[];
  mobileStackingNotes?: string[];
  recommendedNextOwner?: string;
  recommendedLifecycleState?: string;
}

interface MediaBriefRecommendation {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  inferredPageType: string;
  sourcePriority: string;
  recommendedMediaBriefType: MediaBriefType;
  screenshotNeeds: string[];
  proofBlockNeeds: string[];
  imageNeeds: string[];
  diagramNeeds: string[];
  videoBriefNeeds: string[];
  comparisonVisualNeeds: string[];
  reviewCardVisualNeeds: string[];
  mobileMediaNotes: string[];
  evidenceRequirements: string[];
  riskAndComplianceNotes: string[];
  altTextGuidance: string[];
  recommendedNextOwner: string;
  recommendedLifecycleState: LifecycleState;
  draftOnly: true;
  needsHumanReview: true;
  canAutoApply: false;
}

const qualityInput = "data/reports/page_quality_profiler_report.json";
const blueprintInput = "data/reports/page_blueprint_agent_report.json";
const clusterInput = "data/reports/content_cluster_agent_report.json";
const snapshotInput = "data/content_snapshot/normalised_content.json";
const outputJson = "data/reports/media_video_brief_agent_report.json";
const outputMd = "data/reports/media_video_brief_agent_report.md";

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

const mediaBriefTypes: MediaBriefType[] = [
  "review_media_brief",
  "category_hub_media_brief",
  "guide_media_brief",
  "warning_safety_media_brief",
  "comparison_media_brief",
  "full_rebuild_media_brief",
];

const blockedActions = [
  "No publishing.",
  "No Supabase writes.",
  "No live website edits.",
  "No approval/apply workflow.",
  "No affiliate links inserted.",
  "No scam/fraud accusations generated.",
  "No trust rating changes.",
  "No live crawling/fetching.",
  "No actual image/video generation in v1.",
  "No downloading external media.",
  "No media uploads or publishing.",
  "No approved media recommendations in v1.",
  "No applied media recommendations in v1.",
];

export async function buildMediaVideoBriefAgent(): Promise<unknown> {
  const quality = await loadQualityReport();
  const blueprints = await loadBlueprintReport();
  const clusters = await loadClusterReport();
  const snapshot = await loadSnapshot();
  const blueprintByKey = new Map(blueprints.items.map((item) => [pageKey(item), item]));
  const clusterByKey = new Map(clusters.items.map((item) => [pageKey(item), item]));
  const mediaBriefRecommendations = quality.items.map((finding) =>
    buildMediaBriefRecommendation(finding, blueprintByKey.get(pageKey(finding)), clusterByKey.get(pageKey(finding)), snapshot.records),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Media + Video Brief Agent v1",
    name: "Media + Video Brief Agent v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputs: [
      { path: qualityInput, found: quality.found, itemCount: quality.items.length, required: true },
      { path: blueprintInput, found: blueprints.found, itemCount: blueprints.items.length, required: true },
      { path: clusterInput, found: clusters.found, itemCount: clusters.items.length, required: true },
      { path: snapshotInput, found: snapshot.found, itemCount: snapshot.records.length, required: false },
    ],
    validationStatus: "ready_for_validation",
    allowedLifecycleStates,
    blockedLifecycleStates,
    mediaBriefTypes,
    summary: {
      sourceQualityFindingCount: quality.items.length,
      sourceBlueprintRecommendationCount: blueprints.items.length,
      sourceClusterRecommendationCount: clusters.items.length,
      snapshotRecordCount: snapshot.records.length,
      recommendationCount: mediaBriefRecommendations.length,
      byMediaBriefType: countBy(mediaBriefRecommendations, (item) => item.recommendedMediaBriefType),
      byLifecycleState: countBy(mediaBriefRecommendations, (item) => item.recommendedLifecycleState),
      byOwner: countBy(mediaBriefRecommendations, (item) => item.recommendedNextOwner),
    },
    mediaBriefRecommendations,
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
      noActualImageVideoGeneration: true,
      noExternalMediaDownloads: true,
      noMediaUploads: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Media + video brief agent report written", { outputJson, outputMd, recommendations: mediaBriefRecommendations.length });
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

async function loadClusterReport(): Promise<{ found: boolean; items: ClusterRecommendation[] }> {
  if (!existsSync(fromRoot(clusterInput))) return { found: false, items: [] };
  const report = await readJson<{ clusterRecommendations?: ClusterRecommendation[] }>(clusterInput);
  return { found: true, items: Array.isArray(report.clusterRecommendations) ? report.clusterRecommendations : [] };
}

async function loadSnapshot(): Promise<{ found: boolean; records: NormalisedContentRecord[] }> {
  if (!existsSync(fromRoot(snapshotInput))) return { found: false, records: [] };
  return { found: true, records: await readJson<NormalisedContentRecord[]>(snapshotInput) };
}

function buildMediaBriefRecommendation(
  finding: PageQualityFinding,
  blueprint: BlueprintRecommendation | undefined,
  cluster: ClusterRecommendation | undefined,
  records: NormalisedContentRecord[],
): MediaBriefRecommendation {
  const mediaType = mediaBriefTypeFor(finding, blueprint, cluster);
  const related = relatedRecordTitles(finding, records);
  return {
    pageUrl: finding.pageUrl ?? blueprint?.pageUrl ?? cluster?.pageUrl,
    pageId: finding.pageId ?? blueprint?.pageId ?? cluster?.pageId,
    title: finding.title ?? blueprint?.title ?? cluster?.title,
    inferredPageType: finding.inferredPageType ?? blueprint?.inferredPageType ?? cluster?.inferredPageType ?? "unknown",
    sourcePriority: finding.priority ?? blueprint?.sourcePriority ?? cluster?.sourcePriority ?? "unknown",
    recommendedMediaBriefType: mediaType,
    screenshotNeeds: screenshotNeedsFor(mediaType, finding, blueprint),
    proofBlockNeeds: proofBlockNeedsFor(mediaType, finding, blueprint),
    imageNeeds: imageNeedsFor(mediaType, finding),
    diagramNeeds: diagramNeedsFor(mediaType),
    videoBriefNeeds: videoBriefNeedsFor(mediaType),
    comparisonVisualNeeds: comparisonVisualNeedsFor(mediaType, finding, blueprint),
    reviewCardVisualNeeds: reviewCardVisualNeedsFor(mediaType, cluster, related),
    mobileMediaNotes: mobileMediaNotesFor(mediaType),
    evidenceRequirements: evidenceRequirementsFor(mediaType, finding, blueprint),
    riskAndComplianceNotes: riskNotesFor(mediaType, blueprint),
    altTextGuidance: altTextGuidanceFor(mediaType),
    recommendedNextOwner: ownerFor(mediaType, finding, blueprint, cluster),
    recommendedLifecycleState: lifecycleFor(mediaType, finding, blueprint, cluster),
    draftOnly: true,
    needsHumanReview: true,
    canAutoApply: false,
  };
}

function mediaBriefTypeFor(finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined, cluster: ClusterRecommendation | undefined): MediaBriefType {
  const blueprintType = (blueprint?.recommendedBlueprintType ?? "").toLowerCase();
  const clusterType = (cluster?.recommendedClusterType ?? "").toLowerCase();
  const inferred = (finding.inferredPageType ?? blueprint?.inferredPageType ?? cluster?.inferredPageType ?? "").toLowerCase();
  const weaknesses = (finding.weaknessCategories ?? []).join(" ").toLowerCase();
  if (blueprintType.includes("full_rebuild") || clusterType.includes("full_rebuild") || weaknesses.includes("full rebuild")) return "full_rebuild_media_brief";
  if (blueprintType.includes("warning") || clusterType.includes("warning") || inferred.includes("warning")) return "warning_safety_media_brief";
  if (blueprintType.includes("comparison") || clusterType.includes("comparison") || weaknesses.includes("comparison")) return "comparison_media_brief";
  if (blueprintType.includes("category") || clusterType.includes("category") || inferred.includes("category")) return "category_hub_media_brief";
  if (blueprintType.includes("review") || clusterType.includes("review") || inferred.includes("review")) return "review_media_brief";
  return "guide_media_brief";
}

function screenshotNeedsFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string[] {
  const needs = ["Plan screenshots only from owner-controlled or properly permissioned evidence sources; do not download external media in v1."];
  if (type === "review_media_brief" || type === "full_rebuild_media_brief") needs.push("Recommend proof/testing screenshots where relevant, but label them as needed evidence unless existing proof is present.");
  if (type === "warning_safety_media_brief") needs.push("Use screenshots only as evidence references after human review; do not create defamatory visual claims.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("screenshot"))) needs.push("Upstream page quality report detected missing screenshots.");
  if (blueprint?.mediaRequirements?.some((item) => item.toLowerCase().includes("screenshot"))) needs.push(...blueprint.mediaRequirements.filter((item) => item.toLowerCase().includes("screenshot")).slice(0, 3));
  return Array.from(new Set(needs));
}

function proofBlockNeedsFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string[] {
  const needs = ["Use proof blocks to separate observed evidence from opinion and draft recommendations."];
  if (type === "review_media_brief" || type === "full_rebuild_media_brief") needs.push("Plan evidence/proof/testing status blocks for review pages without claiming tests happened.");
  if (type === "warning_safety_media_brief") needs.push("Plan verified-vs-suspected evidence blocks and source-list support before any warning language.");
  const evidenceGaps = finding.evidenceGaps ?? [];
  if (evidenceGaps.length > 0) needs.push(...evidenceGaps.slice(0, 3).map((gap) => `Evidence gap to support with proof block: ${gap}`));
  if (blueprint?.evidenceRequirements?.length) needs.push(...blueprint.evidenceRequirements.slice(0, 4));
  return Array.from(new Set(needs));
}

function imageNeedsFor(type: MediaBriefType, finding: PageQualityFinding): string[] {
  const needs = ["Plan original or owner-approved images only; do not generate, download, upload, or publish media in v1."];
  if (type === "category_hub_media_brief") needs.push("Plan category explainer images that help users compare tools and risks.");
  if (type === "guide_media_brief") needs.push("Plan plain-English step visuals or annotated examples where they reduce confusion.");
  if (type === "warning_safety_media_brief") needs.push("Use restrained safety visuals; avoid sensational imagery or unsupported accusations.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("bad images") || item.includes("missing videos"))) needs.push("Upstream page quality report detected weak or missing media.");
  return needs;
}

function diagramNeedsFor(type: MediaBriefType): string[] {
  if (type === "comparison_media_brief") return ["Plan simple comparison visuals for fees/features/safety differences after evidence review.", "Keep diagrams factual and easy to scan."];
  if (type === "guide_media_brief") return ["Plan step-by-step diagrams where the workflow is hard to explain in text.", "Use diagrams to clarify process, not to decorate."];
  if (type === "warning_safety_media_brief") return ["Plan risk-flow diagrams only when evidence supports the sequence.", "Avoid diagrams that imply unverified wrongdoing."];
  return ["Plan simple diagrams only where they clarify how the product, category, or evidence works."];
}

function videoBriefNeedsFor(type: MediaBriefType): string[] {
  const needs = ["Video briefs are outline-only in v1; no video generation, recording, upload, or publishing."];
  if (type === "review_media_brief") needs.push("Outline a short review walkthrough covering what it is, how it works, evidence status, concerns, and CryptoWatchdog view.");
  if (type === "category_hub_media_brief") needs.push("Outline a category explainer video with user-fit, risks, and safer comparison points.");
  if (type === "guide_media_brief") needs.push("Outline a practical how-to video with steps, mistakes to avoid, and risk warnings.");
  if (type === "warning_safety_media_brief") needs.push("Outline a cautious safety explainer focused on evidence, user actions, and what not to do.");
  if (type === "comparison_media_brief") needs.push("Outline a comparison video using verified criteria and balanced pros/cons.");
  if (type === "full_rebuild_media_brief") needs.push("Outline media/video work after the page purpose and evidence plan are rebuilt.");
  return needs;
}

function comparisonVisualNeedsFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string[] {
  const needs = ["Comparison visuals should help users decide, not create unsupported ranking claims."];
  if (type === "comparison_media_brief" || type === "category_hub_media_brief" || type === "full_rebuild_media_brief") needs.push("Plan tables/cards for alternatives, related reviews, pros/cons, and evidence status.");
  if ((finding.weaknessCategories ?? []).some((item) => item.includes("comparison")) || (blueprint?.recommendedBlueprintType ?? "").includes("comparison")) needs.push("Upstream reports detected a comparison-section need.");
  return needs;
}

function reviewCardVisualNeedsFor(type: MediaBriefType, cluster: ClusterRecommendation | undefined, relatedTitles: string[]): string[] {
  const needs = ["Review cards should be visually consistent, scannable, and placed after the main answer/evidence."];
  if (["review_media_brief", "category_hub_media_brief", "comparison_media_brief", "full_rebuild_media_brief"].includes(type)) needs.push("Plan related review cards where they genuinely help the reader choose next steps.");
  if (cluster?.sidebarCardNeeds?.length) needs.push(...cluster.sidebarCardNeeds.slice(0, 3));
  if (relatedTitles.length > 0) needs.push(...relatedTitles.slice(0, 4).map((title) => `Possible local review/card visual candidate: ${title}`));
  return Array.from(new Set(needs));
}

function mobileMediaNotesFor(type: MediaBriefType): string[] {
  const notes = ["Use stacked, clean media layouts on mobile; avoid desktop-only sidebars.", "Keep images, cards, and video briefs near the section they support."];
  if (type === "warning_safety_media_brief") notes.push("On mobile, show safety summary and evidence context before related media/card sections.");
  if (type === "category_hub_media_brief") notes.push("Stack category cards by task so users can scan reviews, guides, warnings, and comparisons.");
  return notes;
}

function evidenceRequirementsFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined): string[] {
  const requirements = ["Do not claim testing, screenshots, rankings, partnerships, user numbers, or evidence that is not present in local reports or human-provided proof."];
  if (type === "review_media_brief") requirements.push("Review media needs evidence/proof/testing status before final use.");
  if (type === "warning_safety_media_brief") requirements.push("Warning media needs verified evidence and human review before any claim-bearing visual is used.");
  const evidenceGaps = finding.evidenceGaps ?? [];
  if (evidenceGaps.length) requirements.push(...evidenceGaps.slice(0, 4));
  if (blueprint?.evidenceRequirements?.length) requirements.push(...blueprint.evidenceRequirements.slice(0, 4));
  return Array.from(new Set(requirements));
}

function riskNotesFor(type: MediaBriefType, blueprint: BlueprintRecommendation | undefined): string[] {
  const notes = ["Media planning is draft-only and needs human review before any production or publishing step."];
  if (type === "warning_safety_media_brief") notes.push("Avoid defamatory visuals, unsupported scam/fraud implications, and sensational design.");
  if (type === "review_media_brief") notes.push("Do not imply a trust rating change or completed test without human-approved evidence.");
  notes.push("Affiliate/promotional media is disclosure-review only and must not include raw affiliate URLs.");
  if (blueprint?.riskAndComplianceNotes?.length) notes.push(...blueprint.riskAndComplianceNotes.slice(0, 4));
  return Array.from(new Set(notes));
}

function altTextGuidanceFor(type: MediaBriefType): string[] {
  const guidance = ["Alt text should describe the actual image purpose in plain English.", "Avoid keyword-stuffed alt text or unsupported claims.", "Do not include affiliate CTAs in alt text."];
  if (type === "warning_safety_media_brief") guidance.push("For warning pages, alt text should stay factual and avoid accusatory wording unless evidence is verified and approved.");
  return guidance;
}

function ownerFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined, cluster: ClusterRecommendation | undefined): string {
  if (type === "warning_safety_media_brief") return "Trust & Safety AI Manager";
  if (type === "comparison_media_brief" || type === "category_hub_media_brief") return "Media / Images Manager";
  return blueprint?.recommendedNextOwner ?? cluster?.recommendedNextOwner ?? finding.recommendedNextOwner ?? "Media / Images Manager";
}

function lifecycleFor(type: MediaBriefType, finding: PageQualityFinding, blueprint: BlueprintRecommendation | undefined, cluster: ClusterRecommendation | undefined): LifecycleState {
  if (type === "warning_safety_media_brief") return "needs_more_evidence";
  if (type === "full_rebuild_media_brief") return "recommended";
  const sourceState = blueprint?.recommendedLifecycleState ?? cluster?.recommendedLifecycleState ?? finding.currentLifecycleState;
  return allowedLifecycleStates.includes(sourceState as LifecycleState) ? sourceState as LifecycleState : "detected";
}

function relatedRecordTitles(finding: PageQualityFinding, records: NormalisedContentRecord[]): string[] {
  const terms = termsFor([finding.title, finding.pageUrl, finding.pageId].filter(Boolean).join(" "));
  return records
    .filter((record) => record.id !== finding.pageId && record.url !== finding.pageUrl)
    .map((record) => ({ record, score: scoreRecord(record, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.record.title ?? item.record.slug ?? item.record.url ?? item.record.id)
    .filter((title): title is string => Boolean(title));
}

function scoreRecord(record: NormalisedContentRecord, terms: string[]): number {
  const haystack = [record.title, record.slug, record.category, record.summary].filter(Boolean).join(" ").toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function termsFor(value: string): string[] {
  const stop = new Set(["crypto", "review", "guide", "safe", "safety", "warning", "best", "the", "and", "for", "with", "media", "video"]);
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

function renderMarkdown(report: { generatedAt: string; sourceInputs: unknown[]; summary: Record<string, unknown>; mediaBriefRecommendations: MediaBriefRecommendation[] }): string {
  return `# Media + Video Brief Agent v1

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
- Cluster recommendations: ${String(report.summary.sourceClusterRecommendationCount ?? 0)}
- Media brief recommendations: ${String(report.summary.recommendationCount ?? 0)}

## Source Inputs

${report.sourceInputs.map((input) => `- ${JSON.stringify(input)}`).join("\n")}

## Media Brief Recommendations

${report.mediaBriefRecommendations.length > 0 ? report.mediaBriefRecommendations.map(renderRecommendation).join("\n") : "No media brief recommendations generated. Run the page quality, blueprint, and cluster agents first.\n"}
`;
}

function renderRecommendation(item: MediaBriefRecommendation): string {
  return `### ${item.title ?? item.pageId ?? "Untitled page"}

- Page: ${item.pageUrl ?? item.pageId ?? "unknown"}
- Inferred page type: ${item.inferredPageType}
- Source priority: ${item.sourcePriority}
- Media brief type: ${item.recommendedMediaBriefType}
- Lifecycle: ${item.recommendedLifecycleState}
- Owner: ${item.recommendedNextOwner}
- Screenshots: ${item.screenshotNeeds.join(" ")}
- Proof blocks: ${item.proofBlockNeeds.join(" ")}
- Images: ${item.imageNeeds.join(" ")}
- Diagrams: ${item.diagramNeeds.join(" ")}
- Video brief: ${item.videoBriefNeeds.join(" ")}
- Comparison visuals: ${item.comparisonVisualNeeds.join(" ")}
- Review cards: ${item.reviewCardVisualNeeds.join(" ")}
- Mobile notes: ${item.mobileMediaNotes.join(" ")}
- Evidence requirements: ${item.evidenceRequirements.join(" ")}
- Risk/compliance notes: ${item.riskAndComplianceNotes.join(" ")}
- Alt text guidance: ${item.altTextGuidance.join(" ")}
`;
}

if (isDirectRun(import.meta.url)) {
  buildMediaVideoBriefAgent().catch((error) => {
    logger.error("Media + video brief agent build failed", { error });
    process.exitCode = 1;
  });
}
