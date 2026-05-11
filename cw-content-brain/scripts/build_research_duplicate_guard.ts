import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fromRoot, isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { Confidence, FalsePositiveRisk, NormalisedContentRecord, SnapshotTableName } from "../src/lib/types.js";
import { loadContentSnapshot } from "./load_content_snapshot.js";

type IdeaClassification =
  | "no_overlap"
  | "related_but_distinct"
  | "same_search_intent"
  | "near_duplicate"
  | "keyword_cannibalisation_risk"
  | "update_existing_page_instead"
  | "create_supporting_article"
  | "needs_research"
  | "blocked_until_evidence";

interface ResearchIdea {
  id: string;
  title: string;
  description?: string;
  targetKeyword?: string;
  secondaryKeywords: string[];
  proposedType?: string;
  notes?: string;
  sourceFile: string;
}

interface MatchedExistingPage {
  sourceTable: SnapshotTableName;
  id: string;
  slug: string;
  title?: string;
  url: string;
  category?: string;
  rating?: string;
  similarityScore: number;
  sharedTerms: string[];
  reason: string;
}

interface ResearchGuardItem {
  draft_only: true;
  needs_human_review: true;
  idea: ResearchIdea;
  classification: IdeaClassification;
  classifications: IdeaClassification[];
  matchedExistingPages: MatchedExistingPage[];
  similarityReason: string;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
  suggestedNextAction: string;
}

const inputDir = "data/research_queue/inputs";
const outputJson = "data/reports/research_duplicate_guard_report.json";
const outputMd = "data/reports/research_duplicate_guard_report.md";

const stopWords = new Set([
  "about",
  "after",
  "and",
  "are",
  "best",
  "crypto",
  "cryptowatchdog",
  "for",
  "from",
  "guide",
  "how",
  "into",
  "review",
  "safe",
  "safety",
  "scam",
  "scams",
  "the",
  "this",
  "what",
  "with",
  "your",
]);

const highRiskPattern = /\b(scam|fraud|stolen|criminal|guaranteed|guarantee|guarantees|proven|will recover|always safe|risk-free|best exchange|number one|#1)\b/i;
const evidenceWords = /\b(evidence|source|sources|court|regulator|filing|transaction|on-chain|screenshots?|complaints?|tested|verified)\b/i;

export async function buildResearchDuplicateGuard(): Promise<ResearchGuardItem[]> {
  const ideas = await loadIdeas();
  const records = await loadRecords();
  const items = ideas.map((idea) => evaluateIdea(idea, records));

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only Research & Duplicate Guard report for human review. This tool reads local idea inputs and local snapshots only. It does not perform live web verification, edit pages, publish content, or write to Supabase.",
    draft_only: true,
    needs_human_review: true,
    inputFolder: inputDir,
    ideaCount: ideas.length,
    existingPageCount: records.length,
    classificationCounts: countClassifications(items),
    items,
  });
  await writeText(outputMd, renderMarkdown(items, ideas.length, records.length));
  logger.info("Research duplicate guard report written", { ideas: ideas.length, existingPages: records.length, outputJson, outputMd });
  return items;
}

async function loadRecords(): Promise<NormalisedContentRecord[]> {
  try {
    return await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  } catch {
    return loadContentSnapshot();
  }
}

async function loadIdeas(): Promise<ResearchIdea[]> {
  const root = fromRoot(inputDir);
  if (!existsSync(root)) return [];

  const entries = (await readdir(root)).filter((name) => name.endsWith(".json") || name.endsWith(".csv"));
  const ideas: ResearchIdea[] = [];
  for (const file of entries) {
    const raw = await readFile(join(root, file), "utf8");
    const rows = file.endsWith(".json") ? recordsFromJson(raw) : recordsFromCsv(raw);
    rows.forEach((row, index) => {
      const idea = normaliseIdea(row, file, index);
      if (idea) ideas.push(idea);
    });
  }
  return ideas;
}

function evaluateIdea(idea: ResearchIdea, records: NormalisedContentRecord[]): ResearchGuardItem {
  const matches = records.map((record) => scoreMatch(idea, record))
    .filter((match) => match.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
  const classifications = classificationsFor(idea, matches);
  const classification = classifications[0] ?? "no_overlap";
  return {
    draft_only: true,
    needs_human_review: true,
    idea,
    classification,
    classifications,
    matchedExistingPages: matches,
    similarityReason: similarityReasonFor(classification, matches),
    confidence: confidenceFor(classification, matches),
    falsePositiveRisk: falsePositiveRiskFor(classification, matches),
    suggestedNextAction: nextActionFor(classification, matches),
  };
}

function scoreMatch(idea: ResearchIdea, record: NormalisedContentRecord): MatchedExistingPage {
  const ideaTerms = termsFor([idea.title, idea.description, idea.targetKeyword, ...idea.secondaryKeywords].filter(Boolean).join(" "));
  const recordTerms = termsFor(snapshotText(record));
  const sharedTerms = ideaTerms.filter((term) => recordTerms.includes(term));
  const exactTitle = normaliseComparable(idea.title) === normaliseComparable(record.title ?? record.slug);
  const keywordInTitle = idea.targetKeyword ? normaliseComparable(record.title ?? "").includes(normaliseComparable(idea.targetKeyword)) : false;
  const slugOverlap = ideaTerms.some((term) => record.slug.toLowerCase().includes(term));
  let similarityScore = sharedTerms.length * 12;
  if (exactTitle) similarityScore += 55;
  if (keywordInTitle) similarityScore += 28;
  if (slugOverlap) similarityScore += 12;
  if (idea.proposedType && tableMatchesType(record.sourceTable, idea.proposedType)) similarityScore += 8;

  return {
    sourceTable: record.sourceTable,
    id: record.id,
    slug: record.slug,
    title: record.title,
    url: record.url,
    category: record.category,
    rating: record.rating,
    similarityScore,
    sharedTerms: sharedTerms.slice(0, 12),
    reason: exactTitle
      ? "Proposed title is effectively the same as an existing page title."
      : keywordInTitle
        ? "Target keyword appears in an existing page title."
        : sharedTerms.length > 0
          ? `Shared terms: ${sharedTerms.slice(0, 8).join(", ")}.`
          : "Weak structural overlap only.",
  };
}

function classificationsFor(idea: ResearchIdea, matches: MatchedExistingPage[]): IdeaClassification[] {
  const classifications: IdeaClassification[] = [];
  const combinedText = `${idea.title} ${idea.description ?? ""} ${idea.notes ?? ""}`;
  const top = matches[0];
  const hasRiskClaim = highRiskPattern.test(combinedText);
  const hasEvidenceNote = evidenceWords.test(combinedText);

  if (hasRiskClaim && !hasEvidenceNote) classifications.push("blocked_until_evidence");
  if (!idea.description && !idea.targetKeyword && idea.secondaryKeywords.length === 0) classifications.push("needs_research");
  if (top && top.similarityScore >= 80) classifications.push("near_duplicate", "update_existing_page_instead");
  else if (top && top.similarityScore >= 58) classifications.push("same_search_intent", "keyword_cannibalisation_risk");
  else if (top && top.similarityScore >= 32) classifications.push("related_but_distinct", "create_supporting_article");
  if (classifications.length === 0) classifications.push("no_overlap");
  return Array.from(new Set(classifications));
}

function nextActionFor(classification: IdeaClassification, matches: MatchedExistingPage[]): string {
  if (classification === "blocked_until_evidence") return "Do not draft yet. Collect and review supporting evidence before using high-risk wording.";
  if (classification === "near_duplicate") return "Update or expand the matched existing page instead of creating a new draft.";
  if (classification === "same_search_intent" || classification === "keyword_cannibalisation_risk") return "Review the matched page intent and decide whether this should become a section, refresh, or distinctly positioned support article.";
  if (classification === "update_existing_page_instead") return "Use the idea as an update brief for the matched existing page.";
  if (classification === "related_but_distinct" || classification === "create_supporting_article") return "Draft only if the angle is clearly distinct and naturally supports the matched page.";
  if (classification === "needs_research") return "Add target keyword, search intent, evidence notes, and differentiation before drafting.";
  if (matches.length > 0) return "Review the weak overlap manually before drafting.";
  return "Safe to research as a new idea, but still verify evidence and search intent before drafting.";
}

function similarityReasonFor(classification: IdeaClassification, matches: MatchedExistingPage[]): string {
  if (matches.length === 0) return "No meaningful overlap with local content snapshots was detected.";
  return `${classification} based on top match ${matches[0].title ?? matches[0].slug} with score ${matches[0].similarityScore}. ${matches[0].reason}`;
}

function confidenceFor(classification: IdeaClassification, matches: MatchedExistingPage[]): Confidence {
  if (classification === "blocked_until_evidence" || matches[0]?.similarityScore >= 80) return "high";
  if (matches[0]?.similarityScore >= 32 || classification === "needs_research") return "medium";
  return "low";
}

function falsePositiveRiskFor(classification: IdeaClassification, matches: MatchedExistingPage[]): FalsePositiveRisk {
  if (classification === "blocked_until_evidence") return "medium";
  if (matches[0]?.similarityScore >= 80) return "low";
  if (matches[0]?.similarityScore >= 32) return "medium";
  return "high";
}

function recordsFromJson(raw: string): unknown[] {
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) return parsed;
  if (isRecord(parsed) && Array.isArray(parsed.ideas)) return parsed.ideas;
  if (isRecord(parsed) && Array.isArray(parsed.rows)) return parsed.rows;
  if (isRecord(parsed) && Array.isArray(parsed.data)) return parsed.data;
  return [];
}

function recordsFromCsv(raw: string): Record<string, string>[] {
  const rows = parseCsv(raw);
  if (rows.length < 2) return [];
  const headers = rows[0].map(normaliseHeader);
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function normaliseIdea(value: unknown, sourceFile: string, index: number): ResearchIdea | undefined {
  if (!isRecord(value)) return undefined;
  const title = stringValue(value, ["title", "idea", "topic", "proposed title"]);
  if (!title) return undefined;
  const secondary = stringValue(value, ["secondary keywords", "secondaryKeywords", "supporting keywords"]);
  return {
    id: stringValue(value, ["id"]) ?? `${sourceFile}-${index + 1}`,
    title,
    description: stringValue(value, ["description", "summary", "brief"]),
    targetKeyword: stringValue(value, ["target keyword", "targetKeyword", "keyword", "primary keyword"]),
    secondaryKeywords: secondary ? secondary.split(/[;,|]/).map((item) => item.trim()).filter(Boolean) : [],
    proposedType: stringValue(value, ["type", "content type", "proposed type"]),
    notes: stringValue(value, ["notes", "evidence notes", "research notes"]),
    sourceFile,
  };
}

function termsFor(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) ?? []))
    .filter((term) => !stopWords.has(term));
}

function snapshotText(record: NormalisedContentRecord): string {
  return [
    record.title,
    record.slug.replace(/-/g, " "),
    record.category,
    record.summary,
    record.body,
    record.verdict,
    ...(record.pros ?? []),
    ...(record.cons ?? []),
  ].filter(Boolean).join(" ");
}

function tableMatchesType(sourceTable: SnapshotTableName, proposedType: string): boolean {
  const value = proposedType.toLowerCase();
  return (sourceTable === "reviews" && value.includes("review"))
    || (sourceTable === "warnings" && (value.includes("warning") || value.includes("scam")))
    || (sourceTable === "blog_posts" && (value.includes("blog") || value.includes("article") || value.includes("guide")))
    || (sourceTable === "categories" && value.includes("category"));
}

function countClassifications(items: ResearchGuardItem[]): Record<IdeaClassification, number> {
  const keys: IdeaClassification[] = ["no_overlap", "related_but_distinct", "same_search_intent", "near_duplicate", "keyword_cannibalisation_risk", "update_existing_page_instead", "create_supporting_article", "needs_research", "blocked_until_evidence"];
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<IdeaClassification, number>;
  for (const item of items) {
    counts[item.classification] += 1;
  }
  return counts;
}

function normaliseComparable(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normaliseHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function stringValue(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key] ?? row[normaliseHeader(key)];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(items: ResearchGuardItem[], ideaCount: number, existingPageCount: number): string {
  return `# Research & Duplicate Guard Report

Generated: ${new Date().toISOString()}

Draft-only research and duplicate guard report for human review. This tool reads local idea inputs and local snapshots only. It does not perform live web verification, edit pages, publish content, or write to Supabase.

## Summary

- Input folder: ${inputDir}
- Ideas reviewed: ${ideaCount}
- Existing pages compared: ${existingPageCount}

## Ideas

${items.length > 0 ? items.map(renderItem).join("\n") : "No local research ideas found. Drop JSON or CSV files into the input folder and rerun the guard.\n"}`;
}

function renderItem(item: ResearchGuardItem): string {
  return `### ${item.idea.title}

- Draft only: yes
- Needs human review: yes
- Classification: ${item.classification}
- All classifications: ${item.classifications.join(", ")}
- Confidence: ${item.confidence}
- False-positive risk: ${item.falsePositiveRisk}
- Suggested next action: ${item.suggestedNextAction}
- Similarity reason: ${item.similarityReason}
- Matched pages: ${item.matchedExistingPages.length > 0 ? item.matchedExistingPages.map((page) => `${page.title ?? page.slug} (${page.url})`).join("; ") : "none"}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildResearchDuplicateGuard();
}
