import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { Confidence, FalsePositiveRisk, NormalisedContentRecord, SnapshotTableName } from "../src/lib/types.js";
import { loadContentSnapshot } from "./load_content_snapshot.js";

type PlacementType = "in_content_after_relevant_section" | "contextual_further_reading_near_bottom";

interface InternalLinkRecommendation {
  draft_only: true;
  needs_human_review: true;
  sourcePage: PageRef;
  targetPage: PageRef;
  suggestedAnchorText: string;
  suggestedPlacementContext: string;
  placementType: PlacementType;
  reason: string;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
  targetLinkStatus: "orphan_possible" | "thinly_linked_possible" | "existing_snapshot_links_detected";
}

interface PageRef {
  sourceTable: SnapshotTableName;
  id: string;
  slug: string;
  title?: string;
  url: string;
}

interface Candidate {
  source: NormalisedContentRecord;
  target: NormalisedContentRecord;
  score: number;
  sharedTerms: string[];
  reasonParts: string[];
}

const outputJson = "data/reports/internal_link_placement_suggestions.json";
const outputMd = "data/reports/internal_link_placement_suggestions.md";
const maxLinksPerSource = 4;
const maxFurtherReadingPerSource = 1;
const minScore = 18;

const stopWords = new Set([
  "about",
  "after",
  "also",
  "and",
  "before",
  "being",
  "claim",
  "claims",
  "content",
  "copy",
  "crypto",
  "cryptowatchdog",
  "evidence",
  "example",
  "fake",
  "for",
  "from",
  "has",
  "have",
  "been",
  "human",
  "into",
  "local",
  "must",
  "not",
  "only",
  "page",
  "placeholder",
  "platform",
  "real",
  "review",
  "should",
  "source",
  "snapshot",
  "testing",
  "that",
  "their",
  "there",
  "this",
  "tooling",
  "users",
  "verdict",
  "warning",
  "where",
  "with",
  "publication",
  "requiring",
]);

export async function buildInternalLinkPlacements(): Promise<InternalLinkRecommendation[]> {
  const records = await loadRecords();
  const inboundCounts = countSnapshotInternalLinks(records);
  const candidates = buildCandidates(records, inboundCounts);
  const recommendations = selectRecommendations(candidates, inboundCounts);

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only internal link placement suggestions for human review. This report does not edit pages, publish content, write to Supabase, or verify live rendered content.",
    draft_only: true,
    needs_human_review: true,
    sourceCount: records.length,
    recommendationCount: recommendations.length,
    orphanOrThinlyLinkedPages: orphanOrThinPages(records, inboundCounts),
    placementRule: "Main answer first. Evidence second. Helpful links naturally inside. Related content near the end or contextually placed. Affiliate links only where they genuinely help.",
    recommendations,
  });
  await writeText(outputMd, renderMarkdown(recommendations, records, inboundCounts));
  logger.info("Internal link placement suggestions written", { recommendations: recommendations.length, outputJson, outputMd });
  return recommendations;
}

async function loadRecords(): Promise<NormalisedContentRecord[]> {
  try {
    return await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  } catch {
    return loadContentSnapshot();
  }
}

function buildCandidates(records: NormalisedContentRecord[], inboundCounts: Map<string, number>): Candidate[] {
  const candidates: Candidate[] = [];

  for (const source of records) {
    for (const target of records) {
      if (source.id === target.id || source.url === target.url) continue;
      if (snapshotText(source).includes(target.url)) continue;

      const candidate = scoreCandidate(source, target, inboundCounts.get(recordKey(target)) ?? 0);
      if (candidate.score >= minScore) {
        candidates.push(candidate);
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score || titleFor(a.target).localeCompare(titleFor(b.target)));
}

function scoreCandidate(source: NormalisedContentRecord, target: NormalisedContentRecord, inboundCount: number): Candidate {
  const sourceTerms = termsFor(source);
  const targetTerms = termsFor(target);
  const sharedTerms = targetTerms.filter((term) => sourceTerms.includes(term)).slice(0, 6);
  const reasonParts: string[] = [];
  let score = sharedTerms.length * 8;

  if (source.category && target.category && source.category === target.category) {
    score += 16;
    reasonParts.push(`both pages share the ${source.category} category`);
  }

  if (source.sourceTable === "blog_posts" && ["reviews", "warnings", "categories"].includes(target.sourceTable)) {
    score += 12;
    reasonParts.push("education content can naturally point readers to a practical review, warning, or category page after the main explanation");
  }

  if (source.sourceTable === "warnings" && ["reviews", "blog_posts"].includes(target.sourceTable)) {
    score += 10;
    reasonParts.push("warning content can support readers with a relevant review or explainer after evidence context");
  }

  if (source.sourceTable === "reviews" && ["warnings", "blog_posts", "categories"].includes(target.sourceTable)) {
    score += 8;
    reasonParts.push("review content can link to relevant safety context without interrupting the verdict");
  }

  if (inboundCount === 0) {
    score += 8;
    reasonParts.push("target appears orphaned in snapshot text");
  } else if (inboundCount < 2) {
    score += 4;
    reasonParts.push("target appears thinly linked in snapshot text");
  }

  if (sharedTerms.length > 0) {
    reasonParts.push(`shared terms: ${sharedTerms.join(", ")}`);
  }

  return { source, target, score, sharedTerms, reasonParts };
}

function selectRecommendations(candidates: Candidate[], inboundCounts: Map<string, number>): InternalLinkRecommendation[] {
  const selected: InternalLinkRecommendation[] = [];
  const perSource = new Map<string, number>();
  const furtherReadingPerSource = new Map<string, number>();
  const seenPairs = new Set<string>();

  for (const candidate of candidates) {
    const sourceKey = recordKey(candidate.source);
    const pairKey = `${sourceKey}->${recordKey(candidate.target)}`;
    if (seenPairs.has(pairKey)) continue;
    if ((perSource.get(sourceKey) ?? 0) >= maxLinksPerSource) continue;

    const placementType = placementTypeFor(candidate);
    if (placementType === "contextual_further_reading_near_bottom" && (furtherReadingPerSource.get(sourceKey) ?? 0) >= maxFurtherReadingPerSource) {
      continue;
    }

    selected.push(toRecommendation(candidate, inboundCounts));
    seenPairs.add(pairKey);
    perSource.set(sourceKey, (perSource.get(sourceKey) ?? 0) + 1);
    if (placementType === "contextual_further_reading_near_bottom") {
      furtherReadingPerSource.set(sourceKey, (furtherReadingPerSource.get(sourceKey) ?? 0) + 1);
    }
  }

  return selected;
}

function toRecommendation(candidate: Candidate, inboundCounts: Map<string, number>): InternalLinkRecommendation {
  const inboundCount = inboundCounts.get(recordKey(candidate.target)) ?? 0;
  const placementType = placementTypeFor(candidate);

  return {
    draft_only: true,
    needs_human_review: true,
    sourcePage: pageRef(candidate.source),
    targetPage: pageRef(candidate.target),
    suggestedAnchorText: anchorFor(candidate),
    suggestedPlacementContext: placementContextFor(candidate, placementType),
    placementType,
    reason: candidate.reasonParts.length > 0
      ? candidate.reasonParts.join("; ")
      : "pages have related snapshot language and should be reviewed for a natural in-content link opportunity",
    confidence: confidenceFor(candidate),
    falsePositiveRisk: falsePositiveRiskFor(candidate),
    targetLinkStatus: inboundCount === 0 ? "orphan_possible" : inboundCount < 2 ? "thinly_linked_possible" : "existing_snapshot_links_detected",
  };
}

function placementTypeFor(candidate: Candidate): PlacementType {
  if (candidate.score >= 34 && candidate.sharedTerms.length >= 2) return "in_content_after_relevant_section";
  return "contextual_further_reading_near_bottom";
}

function placementContextFor(candidate: Candidate, placementType: PlacementType): string {
  const targetType = pageTypeLabel(candidate.target);
  const shared = candidate.sharedTerms[0] ?? candidate.target.category ?? "the same risk topic";

  if (placementType === "in_content_after_relevant_section") {
    return `Place after the first section or paragraph that discusses ${shared}, once the main answer and any evidence context are already clear. Link to the ${targetType} only if it helps the reader continue naturally.`;
  }

  return `Use near the bottom as a short Further reading item, or in a later contextual section about ${shared}. Do not add this as a related-post block at the top of the page.`;
}

function anchorFor(candidate: Candidate): string {
  const targetTitle = titleFor(candidate.target);
  const shared = candidate.sharedTerms.find((term) => !targetTitle.toLowerCase().includes(term)) ?? candidate.sharedTerms[0];

  if (candidate.target.sourceTable === "warnings") return shared ? `warning signs around ${shared}` : "related warning signs";
  if (candidate.target.sourceTable === "reviews") return shared ? `the related ${shared} review context` : "the related review context";
  if (candidate.target.sourceTable === "categories") return shared ? `${shared} research resources` : "related research resources";
  return shared ? `plain-English guidance on ${shared}` : "related safety guidance";
}

function confidenceFor(candidate: Candidate): Confidence {
  if (candidate.score >= 42 && candidate.sharedTerms.length >= 2) return "high";
  if (candidate.score >= 28) return "medium";
  return "low";
}

function falsePositiveRiskFor(candidate: Candidate): FalsePositiveRisk {
  if (candidate.sharedTerms.length >= 3 && candidate.source.category && candidate.source.category === candidate.target.category) return "low";
  if (candidate.sharedTerms.length >= 2 || candidate.score >= 32) return "medium";
  return "high";
}

function countSnapshotInternalLinks(records: NormalisedContentRecord[]): Map<string, number> {
  const counts = new Map(records.map((record) => [recordKey(record), 0]));

  for (const source of records) {
    const text = snapshotText(source);
    for (const target of records) {
      if (source.id === target.id) continue;
      if (text.includes(target.url) || text.includes(target.slug)) {
        counts.set(recordKey(target), (counts.get(recordKey(target)) ?? 0) + 1);
      }
    }
  }

  return counts;
}

function orphanOrThinPages(records: NormalisedContentRecord[], inboundCounts: Map<string, number>): PageRef[] {
  return records
    .filter((record) => (inboundCounts.get(recordKey(record)) ?? 0) < 2)
    .map(pageRef);
}

function termsFor(record: NormalisedContentRecord): string[] {
  return Array.from(new Set(snapshotText(record).toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) ?? []))
    .filter((term) => !stopWords.has(term))
    .slice(0, 40);
}

function snapshotText(record: NormalisedContentRecord): string {
  return [
    record.title,
    record.slug.replace(/-/g, " "),
    record.category,
    record.rating,
    record.summary,
    record.body,
    record.verdict,
    ...(record.pros ?? []),
    ...(record.cons ?? []),
    record.deposit_info,
    record.withdrawal_info,
    record.fees_info,
    record.detailed_audit,
    ...(record.evidence ?? []),
  ].filter(Boolean).join(" ");
}

function pageRef(record: NormalisedContentRecord): PageRef {
  return {
    sourceTable: record.sourceTable,
    id: record.id,
    slug: record.slug,
    title: record.title,
    url: record.url,
  };
}

function pageTypeLabel(record: NormalisedContentRecord): string {
  if (record.sourceTable === "reviews") return "review";
  if (record.sourceTable === "warnings") return "warning";
  if (record.sourceTable === "categories") return "category page";
  return "education post";
}

function titleFor(record: NormalisedContentRecord): string {
  return record.title ?? record.slug.replace(/-/g, " ");
}

function recordKey(record: NormalisedContentRecord): string {
  return `${record.sourceTable}:${record.slug}`;
}

function renderMarkdown(recommendations: InternalLinkRecommendation[], records: NormalisedContentRecord[], inboundCounts: Map<string, number>): string {
  return `# Internal Link Placement Suggestions

Generated: ${new Date().toISOString()}

Draft-only internal link placement suggestions for human review. This report does not edit pages, publish content, write to Supabase, or verify live rendered content.

Placement rule: Main answer first. Evidence second. Helpful links naturally inside. Related content near the end or contextually placed. Affiliate links only where they genuinely help.

## Orphan or Thinly Linked Pages

${orphanOrThinPages(records, inboundCounts).map((page) => `- ${page.title ?? page.slug}: ${page.url}`).join("\n") || "No orphan or thinly linked pages detected from snapshot text."}

## Recommendations

${recommendations.length > 0 ? recommendations.map(renderRecommendation).join("\n") : "No internal link placement suggestions generated.\n"}`;
}

function renderRecommendation(recommendation: InternalLinkRecommendation): string {
  return `### ${recommendation.sourcePage.title ?? recommendation.sourcePage.slug} -> ${recommendation.targetPage.title ?? recommendation.targetPage.slug}

- Source: ${recommendation.sourcePage.url}
- Target: ${recommendation.targetPage.url}
- Draft only: yes
- Needs human review: yes
- Suggested anchor: ${recommendation.suggestedAnchorText}
- Placement: ${recommendation.suggestedPlacementContext}
- Reason: ${recommendation.reason}
- Confidence: ${recommendation.confidence}
- False-positive risk: ${recommendation.falsePositiveRisk}
- Target link status: ${recommendation.targetLinkStatus}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildInternalLinkPlacements();
}
