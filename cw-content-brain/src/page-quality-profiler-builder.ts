import { existsSync } from "node:fs";
import { readJson, fromRoot, isDirectRun, writeJson, writeText } from "./lib/fs.js";
import { logger } from "./lib/logger.js";
import type { NormalisedContentRecord, SnapshotTableName } from "./lib/types.js";

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

type Priority = "low" | "medium" | "high" | "urgent";

interface PageFinding {
  pageUrl?: string;
  pageId?: string;
  title?: string;
  slug?: string;
  sourceTable?: SnapshotTableName;
  inferredPageType: string;
  priority: Priority;
  weaknessCategories: string[];
  evidenceGaps: string[];
  recommendedNextOwner: string;
  recommendedBlueprintNeed: string;
  currentLifecycleState: LifecycleState;
  confidence: "low" | "medium" | "high";
  falsePositiveRisk: "low" | "medium" | "high";
  reason: string;
  needsHumanReview: true;
  draftOnly: true;
  canAutoApply: false;
}

const outputJson = "data/reports/page_quality_profiler_report.json";
const outputMd = "data/reports/page_quality_profiler_report.md";
const normalisedContentPath = "data/content_snapshot/normalised_content.json";

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

const allWeaknessCategories = [
  "paper-thin page",
  "weak page purpose",
  "bad or missing H1/H2/H3 structure",
  "weak intro/explanation",
  "missing how-it-works section",
  "missing why-people-use-it section",
  "missing CryptoWatchdog view",
  "missing evidence/proof for reviews",
  "missing screenshots",
  "missing videos",
  "missing related review cards",
  "missing related guides/blogs/news/promos/warnings",
  "missing comparison sections",
  "weak internal links",
  "poor CTA structure",
  "bad images",
  "fluff/generic AI wording",
  "stale content",
  "page needs full rebuild",
  "page needs category hub treatment",
  "page needs review treatment",
  "page needs guide treatment",
  "page needs warning/scam-risk treatment",
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
  "No approved actions in Page Quality Profiler v1.",
  "No applied actions in Page Quality Profiler v1.",
];

export async function buildPageQualityProfiler(): Promise<unknown> {
  const loaded = await loadLocalRecords();
  const pageFindings = loaded.records.map(profileRecord).filter((finding) => finding.weaknessCategories.length > 0);
  const summary = buildSummary(pageFindings, loaded.records.length);
  const report = {
    generatedAt: new Date().toISOString(),
    phase: "Page Quality Profiler Agent v1",
    name: "Page Quality Profiler Agent v1",
    safetyMode: "READ_ONLY_REPORT_ONLY",
    localOnly: true,
    readOnly: true,
    canAutoApply: false as const,
    approvedCount: 0 as const,
    appliedCount: 0 as const,
    sourceInputs: loaded.sourceInputs,
    validationStatus: "ready_for_validation",
    allowedLifecycleStates,
    blockedLifecycleStates,
    weaknessTaxonomy: allWeaknessCategories,
    summary,
    pageFindings,
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
      noScamFraudAccusations: true,
      noTrustRatingChanges: true,
      canAutoApply: false,
      approvedCount: 0,
      appliedCount: 0,
    },
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Page quality profiler report written", { outputJson, outputMd, pagesReviewed: loaded.records.length, findings: pageFindings.length });
  return report;
}

async function loadLocalRecords(): Promise<{ records: NormalisedContentRecord[]; sourceInputs: Array<{ path: string; found: boolean; recordCount: number; notes: string }> }> {
  const normalisedFound = existsSync(fromRoot(normalisedContentPath));
  if (!normalisedFound) {
    return {
      records: [],
      sourceInputs: [{
        path: normalisedContentPath,
        found: false,
        recordCount: 0,
        notes: "Normalised local content snapshot was not found. Run the snapshot/audit flow before using page-level quality findings.",
      }],
    };
  }

  const records = await readJson<NormalisedContentRecord[]>(normalisedContentPath);
  return {
    records,
    sourceInputs: [{
      path: normalisedContentPath,
      found: true,
      recordCount: records.length,
      notes: "Read local normalised content snapshot only. No live crawling, fetching, publishing, or Supabase writes.",
    }],
  };
}

function profileRecord(record: NormalisedContentRecord): PageFinding {
  const text = snapshotText(record);
  const lower = text.toLowerCase();
  const wordCount = countWords(text);
  const weaknessCategories: string[] = [];
  const evidenceGaps: string[] = [];

  addIf(wordCount < 180, "paper-thin page", "Snapshot has fewer than 180 words available for local analysis.", weaknessCategories, evidenceGaps);
  addIf(!record.summary || record.summary.trim().length < 80, "weak intro/explanation", "Summary/intro is missing or too short to explain the page clearly.", weaknessCategories, evidenceGaps);
  addIf(!record.verdict && record.sourceTable === "reviews", "missing CryptoWatchdog view", "Review has no local verdict field for the CryptoWatchdog view.", weaknessCategories, evidenceGaps);
  addIf(!hasAny(lower, ["how it works", "how-it-works", "how this works"]), "missing how-it-works section", "Local text does not show a how-it-works section marker.", weaknessCategories, evidenceGaps);
  addIf(!hasAny(lower, ["why people use", "why users use", "why use"]), "missing why-people-use-it section", "Local text does not show why people use it.", weaknessCategories, evidenceGaps);
  addIf(!hasHeadingSignals(text), "bad or missing H1/H2/H3 structure", "Snapshot body has weak heading-like structure signals.", weaknessCategories, evidenceGaps);
  addIf(hasGenericAiWording(lower), "fluff/generic AI wording", "Snapshot includes generic helper phrasing that may need a human rewrite.", weaknessCategories, evidenceGaps);
  addIf(isStale(record), "stale content", "Updated timestamp appears old for a quality review workflow.", weaknessCategories, evidenceGaps);

  if (record.sourceTable === "reviews") {
    addIf(!hasReviewEvidence(record, lower), "missing evidence/proof for reviews", "Review lacks local evidence, detailed audit, testing, proof, or screenshot evidence fields.", weaknessCategories, evidenceGaps);
    addIf(!hasAny(lower, ["screenshot", "screenshots", "proof image"]), "missing screenshots", "No screenshot/proof-image wording found in local text.", weaknessCategories, evidenceGaps);
    addIf(!record.video_url && !record.interview_url && !hasAny(lower, ["video", "youtube", "watch"]), "missing videos", "No video or interview URL/marker found locally.", weaknessCategories, evidenceGaps);
    addIf(!hasAny(lower, ["compare", "comparison", "versus", "alternative", "alternatives"]), "missing comparison sections", "No comparison/alternative section marker found.", weaknessCategories, evidenceGaps);
    addIf(!hasAny(lower, ["related review", "related platform", "related sites", "related tools"]), "missing related review cards", "No related review/card marker found.", weaknessCategories, evidenceGaps);
    addIf(weaknessCategories.length >= 8, "page needs full rebuild", "Multiple structural and evidence gaps were detected locally.", weaknessCategories, evidenceGaps);
    addIf(weaknessCategories.length >= 4, "page needs review treatment", "Review page needs a fuller review blueprint.", weaknessCategories, evidenceGaps);
  }

  if (record.sourceTable === "categories") {
    addIf(!hasAny(lower, ["related", "reviews", "guides", "warnings"]), "missing related guides/blogs/news/promos/warnings", "Category page lacks local related-content markers.", weaknessCategories, evidenceGaps);
    addIf(weaknessCategories.length >= 2, "page needs category hub treatment", "Category page needs hub-style structure and related sections.", weaknessCategories, evidenceGaps);
  }

  if (record.sourceTable === "blog_posts") {
    addIf(!hasAny(lower, ["example", "steps", "checklist", "faq", "warning"]), "page needs guide treatment", "Education/blog page lacks practical guide markers.", weaknessCategories, evidenceGaps);
  }

  if (record.sourceTable === "warnings") {
    addIf(!hasAny(lower, ["evidence", "source", "reported", "warning sign", "red flag"]), "page needs warning/scam-risk treatment", "Warning page needs stricter evidence and careful risk framing.", weaknessCategories, evidenceGaps);
  }

  addIf(!hasAny(lower, ["related", "internal link", "read next", "further reading"]), "weak internal links", "Local text does not show internal-link or further-reading markers.", weaknessCategories, evidenceGaps);
  addIf(!hasAny(lower, ["next step", "what to do", "check first", "compare", "review"]), "poor CTA structure", "No clear cautious next-step/CTA marker found locally.", weaknessCategories, evidenceGaps);
  addIf(!hasAny(lower, ["image", "screenshot", "chart", "logo", "alt text"]), "bad images", "No image planning, screenshot, or alt-text marker found locally.", weaknessCategories, evidenceGaps);

  const uniqueWeaknesses = Array.from(new Set(weaknessCategories));
  const priority = priorityFor(uniqueWeaknesses);
  return {
    pageUrl: record.url,
    pageId: record.id,
    title: record.title,
    slug: record.slug,
    sourceTable: record.sourceTable,
    inferredPageType: inferPageType(record),
    priority,
    weaknessCategories: uniqueWeaknesses,
    evidenceGaps: Array.from(new Set(evidenceGaps)),
    recommendedNextOwner: ownerFor(record, uniqueWeaknesses),
    recommendedBlueprintNeed: blueprintFor(record, uniqueWeaknesses),
    currentLifecycleState: lifecycleFor(priority, uniqueWeaknesses),
    confidence: confidenceFor(uniqueWeaknesses),
    falsePositiveRisk: falsePositiveRiskFor(record, uniqueWeaknesses),
    reason: reasonFor(record, wordCount, uniqueWeaknesses),
    needsHumanReview: true,
    draftOnly: true,
    canAutoApply: false,
  };
}

function buildSummary(findings: PageFinding[], pagesReviewed: number): Record<string, unknown> {
  return {
    pagesReviewed,
    findingCount: findings.length,
    highPriorityCount: findings.filter((finding) => finding.priority === "high" || finding.priority === "urgent").length,
    needsHumanReviewCount: findings.length,
    byPriority: countBy(findings, (finding) => finding.priority),
    byLifecycleState: countBy(findings, (finding) => finding.currentLifecycleState),
    byOwner: countBy(findings, (finding) => finding.recommendedNextOwner),
    byWeaknessCategory: countWeaknesses(findings),
  };
}

function addIf(condition: boolean, category: string, evidenceGap: string, categories: string[], gaps: string[]): void {
  if (!condition) return;
  categories.push(category);
  gaps.push(evidenceGap);
}

function inferPageType(record: NormalisedContentRecord): string {
  if (record.sourceTable === "reviews") return "review";
  if (record.sourceTable === "warnings") return "warning/scam-risk";
  if (record.sourceTable === "categories") return "category hub";
  return "guide/blog";
}

function ownerFor(record: NormalisedContentRecord, weaknesses: string[]): string {
  if (weaknesses.some((item) => item.includes("warning") || item.includes("scam"))) return "Trust & Safety AI Manager";
  if (weaknesses.some((item) => item.includes("evidence") || item.includes("proof"))) return "Evidence / Testing Manager";
  if (weaknesses.some((item) => item.includes("H1") || item.includes("internal links") || item.includes("comparison"))) return "SEO AI Manager";
  if (record.sourceTable === "reviews") return "Content AI Manager";
  if (record.sourceTable === "categories") return "SEO AI Manager";
  return "Content AI Manager";
}

function blueprintFor(record: NormalisedContentRecord, weaknesses: string[]): string {
  if (weaknesses.includes("page needs full rebuild")) return "full_rebuild_blueprint";
  if (record.sourceTable === "reviews") return "review_blueprint";
  if (record.sourceTable === "warnings") return "warning_scam_risk_blueprint";
  if (record.sourceTable === "categories") return "category_hub_blueprint";
  return "guide_blueprint";
}

function lifecycleFor(priority: Priority, weaknesses: string[]): LifecycleState {
  if (weaknesses.some((item) => item.includes("warning/scam-risk"))) return "needs_more_evidence";
  if (priority === "urgent") return "recommended_for_danny_review";
  if (priority === "high") return "recommended";
  if (priority === "medium") return "suspected";
  return "detected";
}

function priorityFor(weaknesses: string[]): Priority {
  if (weaknesses.includes("page needs full rebuild") || weaknesses.length >= 10) return "urgent";
  if (weaknesses.length >= 6 || weaknesses.includes("missing evidence/proof for reviews")) return "high";
  if (weaknesses.length >= 3) return "medium";
  return "low";
}

function confidenceFor(weaknesses: string[]): "low" | "medium" | "high" {
  if (weaknesses.length >= 6) return "high";
  if (weaknesses.length >= 3) return "medium";
  return "low";
}

function falsePositiveRiskFor(record: NormalisedContentRecord, weaknesses: string[]): "low" | "medium" | "high" {
  if (!record.body && weaknesses.length < 5) return "high";
  if (weaknesses.length >= 7) return "medium";
  return "medium";
}

function reasonFor(record: NormalisedContentRecord, wordCount: number, weaknesses: string[]): string {
  return `Local snapshot profile for ${record.sourceTable}:${record.slug} found ${weaknesses.length} possible weakness category/categories across ${wordCount} available words. Treat as draft-only triage until human review checks rendered page context.`;
}

function snapshotText(record: NormalisedContentRecord): string {
  return [
    record.title,
    record.slug?.replace(/-/g, " "),
    record.category,
    record.summary,
    record.verdict,
    record.body,
    record.deposit_info,
    record.withdrawal_info,
    record.fees_info,
    record.detailed_audit,
    ...(record.pros ?? []),
    ...(record.cons ?? []),
    ...(record.evidence ?? []),
  ].filter(Boolean).join(" ");
}

function countWords(value: string): number {
  return value.match(/\b[\w'-]+\b/g)?.length ?? 0;
}

function hasAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function hasHeadingSignals(value: string): boolean {
  return /(^|\n)#{1,3}\s+\S/.test(value) || /<h[1-3][\s>]/i.test(value) || /\n[A-Z][^\n]{8,80}\n/.test(value);
}

function hasGenericAiWording(value: string): boolean {
  return /\b(in today's (fast-paced|digital) world|it is important to note|whether you're a beginner|delve into|comprehensive guide|unlock the power)\b/i.test(value);
}

function isStale(record: NormalisedContentRecord): boolean {
  const updated = record.updated_at || record.created_at;
  if (!updated) return true;
  const timestamp = Date.parse(updated);
  if (Number.isNaN(timestamp)) return false;
  const ageDays = (Date.now() - timestamp) / 86_400_000;
  return ageDays > 365;
}

function hasReviewEvidence(record: NormalisedContentRecord, lower: string): boolean {
  if ((record.evidence ?? []).length > 0) return true;
  if (record.detailed_audit && record.detailed_audit !== "{}") return true;
  return hasAny(lower, ["tested", "screenshot", "evidence", "proof", "withdrawal", "deposit", "audit", "comparison"]);
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function countWeaknesses(findings: PageFinding[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const finding of findings) {
    for (const weakness of finding.weaknessCategories) {
      counts[weakness] = (counts[weakness] ?? 0) + 1;
    }
  }
  return counts;
}

function renderMarkdown(report: { generatedAt: string; summary: Record<string, unknown>; pageFindings: PageFinding[]; sourceInputs: unknown[] }): string {
  return `# Page Quality Profiler Agent v1

Generated: ${report.generatedAt}

Safety mode: READ_ONLY_REPORT_ONLY
localOnly: true
readOnly: true
canAutoApply: false
approvedCount: 0
appliedCount: 0

## Summary

- Pages reviewed: ${String(report.summary.pagesReviewed ?? 0)}
- Findings: ${String(report.summary.findingCount ?? 0)}
- High/urgent priority: ${String(report.summary.highPriorityCount ?? 0)}
- Needs human review: ${String(report.summary.needsHumanReviewCount ?? 0)}

## Source Inputs

${report.sourceInputs.map((input) => `- ${JSON.stringify(input)}`).join("\n")}

## Page Findings

${report.pageFindings.length > 0 ? report.pageFindings.map(renderFinding).join("\n") : "No page quality findings generated from local data.\n"}
`;
}

function renderFinding(finding: PageFinding): string {
  return `### ${finding.title ?? finding.slug ?? finding.pageId ?? "Untitled page"}

- Page: ${finding.pageUrl ?? finding.pageId ?? "unknown"}
- Inferred page type: ${finding.inferredPageType}
- Priority: ${finding.priority}
- Lifecycle: ${finding.currentLifecycleState}
- Owner: ${finding.recommendedNextOwner}
- Blueprint need: ${finding.recommendedBlueprintNeed}
- Weaknesses: ${finding.weaknessCategories.join(", ")}
- Evidence gaps: ${finding.evidenceGaps.join(" ")}
- Reason: ${finding.reason}
`;
}

if (isDirectRun(import.meta.url)) {
  buildPageQualityProfiler().catch((error) => {
    logger.error("Page quality profiler build failed", { error });
    process.exitCode = 1;
  });
}
