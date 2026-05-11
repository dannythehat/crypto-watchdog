import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { NormalisedContentRecord, SnapshotTableName } from "../src/lib/types.js";
import { loadContentSnapshot } from "./load_content_snapshot.js";

type SchemaSuggestionType = "Review" | "Article" | "CollectionPage";
type CanonicalStatus = "matches_suggested" | "missing_rendered_canonical" | "mismatch" | "rendered_facts_unavailable";

interface RenderedVerificationReport {
  results?: RenderedVerificationResult[];
}

interface RenderedVerificationResult {
  url: string;
  finalUrl?: string;
  sourceTable: SnapshotTableName;
  slug: string;
  renderedFacts?: RenderedFacts;
}

interface RenderedFacts {
  url: string;
  titleTag?: string;
  metaDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  h1s: string[];
  h2s: string[];
  images: number;
  imagesMissingAlt: number;
}

interface DraftField {
  draft: string;
  notes: string[];
}

interface CanonicalSuggestion {
  status: CanonicalStatus;
  renderedCanonical?: string;
  suggestedCanonical: string;
  notes: string[];
}

interface MetadataSuggestionItem {
  draft_only: true;
  needs_human_review: true;
  sourceTable: SnapshotTableName;
  id: string;
  slug: string;
  url: string;
  title?: string;
  renderedFactsAvailable: boolean;
  seoTitleDraft: DraftField;
  metaDescriptionDraft: DraftField;
  canonicalCheck: CanonicalSuggestion;
  ogTitleDraft: DraftField;
  ogDescriptionDraft: DraftField;
  twitterTitleDraft: DraftField;
  twitterDescriptionDraft: DraftField;
  schemaSuggestionType: DraftField;
  imageAltTextSuggestions: DraftField[];
  imageFilenameSuggestions: DraftField[];
  targetKeywordSuggestion: DraftField;
  secondaryKeywordSuggestions: DraftField[];
  safetyNotes: string[];
}

const outputJson = "data/reports/metadata_suggestions.json";
const outputMd = "data/reports/metadata_suggestions.md";
const siteName = "CryptoWatchdog";

export async function buildMetadataSuggestions(): Promise<MetadataSuggestionItem[]> {
  const records = await loadRecords();
  const renderedFacts = await loadRenderedFacts();
  const items = records.map((record) => buildItem(record, renderedFacts.get(recordKey(record))));

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only metadata suggestions for human review. This report does not publish, edit live content, write to Supabase, or verify claims.",
    draft_only: true,
    needs_human_review: true,
    itemCount: items.length,
    items,
  });
  await writeText(outputMd, renderMarkdown(items));
  logger.info("Metadata suggestions written", { items: items.length, outputJson, outputMd });
  return items;
}

async function loadRecords(): Promise<NormalisedContentRecord[]> {
  try {
    return await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  } catch {
    return loadContentSnapshot();
  }
}

async function loadRenderedFacts(): Promise<Map<string, RenderedFacts>> {
  const rendered = new Map<string, RenderedFacts>();

  try {
    const report = await readJson<RenderedVerificationReport>("data/reports/rendered_page_verification.json");
    for (const result of report.results ?? []) {
      if (result.renderedFacts) {
        rendered.set(`${result.sourceTable}:${result.slug}`, result.renderedFacts);
      }
    }
  } catch {
    // Rendered verifier output is optional. Metadata drafts can still be built from snapshots.
  }

  return rendered;
}

function buildItem(record: NormalisedContentRecord, renderedFacts: RenderedFacts | undefined): MetadataSuggestionItem {
  const baseTitle = cleanPlainText(record.title ?? titleFromSlug(record.slug));
  const summary = cleanPlainText(record.summary ?? record.verdict ?? firstSentence(record.body) ?? "");
  const keyword = keywordFor(record, baseTitle);
  const secondaryKeywords = secondaryKeywordsFor(record, keyword);
  const seoTitle = fitLength(titleFor(record, baseTitle), 60);
  const metaDescription = fitLength(descriptionFor(record, baseTitle, summary), 155);
  const imageBase = slugify(baseTitle || record.slug);

  return {
    draft_only: true,
    needs_human_review: true,
    sourceTable: record.sourceTable,
    id: record.id,
    slug: record.slug,
    url: record.url,
    title: record.title,
    renderedFactsAvailable: Boolean(renderedFacts),
    seoTitleDraft: field(seoTitle, [
      noteFromExisting("SEO title", renderedFacts?.titleTag),
      "Draft uses the snapshot title and cautious CryptoWatchdog context without adding rankings, guarantees, user numbers, or unverified claims.",
    ]),
    metaDescriptionDraft: field(metaDescription, [
      noteFromExisting("Meta description", renderedFacts?.metaDescription),
      "Draft is based on the snapshot summary/verdict/body excerpt and keeps the tone protection-first and evidence-aware.",
    ]),
    canonicalCheck: canonicalFor(record, renderedFacts),
    ogTitleDraft: field(seoTitle, [
      noteFromExisting("OG title", renderedFacts?.ogTitle),
      "OG title mirrors the SEO title so social previews stay consistent until a human approves page-specific wording.",
    ]),
    ogDescriptionDraft: field(metaDescription, [
      noteFromExisting("OG description", renderedFacts?.ogDescription),
      "OG description mirrors the meta description to avoid introducing unsupported claims in social previews.",
    ]),
    twitterTitleDraft: field(seoTitle, [
      noteFromExisting("Twitter title", renderedFacts?.twitterTitle),
      "Twitter title mirrors the SEO title for consistent draft metadata.",
    ]),
    twitterDescriptionDraft: field(metaDescription, [
      noteFromExisting("Twitter description", renderedFacts?.twitterDescription),
      "Twitter description mirrors the meta description and should be reviewed before use.",
    ]),
    schemaSuggestionType: field(schemaTypeFor(record.sourceTable), [
      `Schema type is suggested from the source table (${record.sourceTable}), not from external validation.`,
      "Human review must confirm the final schema fields before implementation.",
    ]),
    imageAltTextSuggestions: imageAltSuggestions(record, baseTitle, renderedFacts),
    imageFilenameSuggestions: imageFilenameSuggestions(record, imageBase),
    targetKeywordSuggestion: field(keyword, [
      "Target keyword is derived from the snapshot title, category, or slug only.",
      "It is not a ranking claim and should be checked against real search intent before use.",
    ]),
    secondaryKeywordSuggestions: secondaryKeywords.map((keywordDraft) => field(keywordDraft, [
      "Secondary keyword is derived from visible snapshot fields and generic user-protection language.",
      "Do not treat this as keyword research or ranking evidence.",
    ])),
    safetyNotes: [
      "Draft-only: do not publish or write to Supabase from this report.",
      "Needs human review: verify facts, legal risk, page intent, and rendered output before applying any suggestion.",
      "Suggestions must not be used to imply tests, ratings, user numbers, partnerships, rankings, or guarantees that are not already supported by approved evidence.",
    ],
  };
}

function field(draft: string, notes: string[]): DraftField {
  return { draft, notes };
}

function canonicalFor(record: NormalisedContentRecord, renderedFacts: RenderedFacts | undefined): CanonicalSuggestion {
  const suggestedCanonical = record.url;

  if (!renderedFacts) {
    return {
      status: "rendered_facts_unavailable",
      suggestedCanonical,
      notes: ["Rendered verifier facts were not available, so the canonical suggestion uses the normalized snapshot URL."],
    };
  }

  if (!renderedFacts.canonical) {
    return {
      status: "missing_rendered_canonical",
      suggestedCanonical,
      notes: ["Rendered facts did not include a canonical tag. Human review should confirm whether this is a real page issue or a rendering/reporting gap."],
    };
  }

  const renderedCanonical = normaliseComparableUrl(renderedFacts.canonical);
  const suggested = normaliseComparableUrl(suggestedCanonical);
  return {
    status: renderedCanonical === suggested ? "matches_suggested" : "mismatch",
    renderedCanonical: renderedFacts.canonical,
    suggestedCanonical,
    notes: renderedCanonical === suggested
      ? ["Rendered canonical matches the normalized snapshot URL."]
      : ["Rendered canonical differs from the normalized snapshot URL. Review routing, redirects, and intended canonical before changing anything."],
  };
}

function imageAltSuggestions(record: NormalisedContentRecord, baseTitle: string, renderedFacts: RenderedFacts | undefined): DraftField[] {
  const context = contextLabel(record);
  const renderedNote = renderedFacts
    ? `Rendered facts reported ${renderedFacts.images} image(s), with ${renderedFacts.imagesMissingAlt} missing alt text.`
    : "Rendered image details were not available; verify actual images before using alt text.";

  return [
    field(`${baseTitle} ${context}`, [
      renderedNote,
      "Draft describes the page subject plainly without adding performance, safety, or partnership claims.",
    ]),
    field(`${baseTitle} risk review context`, [
      renderedNote,
      "Use only if the actual image supports this context; otherwise write image-specific alt text during human review.",
    ]),
  ];
}

function imageFilenameSuggestions(record: NormalisedContentRecord, imageBase: string): DraftField[] {
  const suffix = record.sourceTable === "reviews" ? "review" : record.sourceTable === "warnings" ? "warning" : "guide";
  return [
    field(`${imageBase}-${suffix}.webp`, [
      "Filename draft uses the page title/slug and page type only.",
      "Confirm the actual image content and asset format before renaming or uploading anything.",
    ]),
    field(`${imageBase}-cryptowatchdog.webp`, [
      "Filename draft keeps branding descriptive without implying endorsement or verified status.",
      "Use only if it matches the final approved asset.",
    ]),
  ];
}

function titleFor(record: NormalisedContentRecord, baseTitle: string): string {
  if (record.sourceTable === "reviews") return `${stripTrailingWord(baseTitle, "review")} Review | ${siteName} Risk Notes`;
  if (record.sourceTable === "warnings") return `${stripTrailingWord(baseTitle, "warning")} Warning | ${siteName} Checks`;
  if (record.sourceTable === "categories") return `${baseTitle}: Safer Crypto Research | ${siteName}`;
  return `${baseTitle}: Plain-English Crypto Safety | ${siteName}`;
}

function descriptionFor(record: NormalisedContentRecord, baseTitle: string, summary: string): string {
  const fallback: Record<SnapshotTableName, string> = {
    reviews: `Review ${baseTitle} with evidence-first risk notes, user-protection checks, and questions to verify before trusting a crypto platform.`,
    blog_posts: `Learn plain-English crypto safety checks for ${baseTitle}, with a sceptical, evidence-first approach to protecting users.`,
    warnings: `Review ${baseTitle} with cautious warning signals, evidence notes, and steps users should verify before taking action.`,
    categories: `Browse ${baseTitle} resources with CryptoWatchdog's protection-first approach to crypto research and risk review.`,
  };

  return summary || fallback[record.sourceTable];
}

function keywordFor(record: NormalisedContentRecord, baseTitle: string): string {
  if (record.sourceTable === "reviews") return `${stripTrailingWord(baseTitle, "review")} review`.toLowerCase();
  if (record.sourceTable === "warnings") return `${stripTrailingWord(baseTitle, "warning")} warning`.toLowerCase();
  if (record.category) return `${record.category} crypto safety`.toLowerCase();
  return titleFromSlug(record.slug).toLowerCase();
}

function secondaryKeywordsFor(record: NormalisedContentRecord, targetKeyword: string): string[] {
  const candidates = [
    record.category ? `${record.category} risk checks` : undefined,
    record.sourceTable === "reviews" ? "crypto platform review" : undefined,
    record.sourceTable === "warnings" ? "crypto warning signs" : undefined,
    record.sourceTable === "blog_posts" ? "crypto safety guide" : undefined,
    record.sourceTable === "categories" ? "crypto research resources" : undefined,
    "crypto user protection",
  ];

  return Array.from(new Set(candidates.filter((candidate): candidate is string => Boolean(candidate))))
    .filter((candidate) => candidate.toLowerCase() !== targetKeyword)
    .slice(0, 5);
}

function schemaTypeFor(sourceTable: SnapshotTableName): SchemaSuggestionType {
  if (sourceTable === "reviews") return "Review";
  if (sourceTable === "categories") return "CollectionPage";
  return "Article";
}

function contextLabel(record: NormalisedContentRecord): string {
  if (record.sourceTable === "reviews") return "review page";
  if (record.sourceTable === "warnings") return "warning page";
  if (record.sourceTable === "categories") return "category page";
  return "education page";
}

function noteFromExisting(label: string, existingValue: string | undefined): string {
  return existingValue
    ? `${label} exists in rendered facts and should be compared against this draft before any change.`
    : `${label} was not available in rendered facts, so this is a snapshot-based draft.`;
}

function firstSentence(value: string | undefined): string | undefined {
  return value?.split(/[.!?]\s+/).find((sentence) => sentence.trim().length > 0)?.trim();
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function cleanPlainText(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[<>]/g, "").trim();
}

function stripTrailingWord(value: string, word: string): string {
  return value.replace(new RegExp(`\\s+${word}$`, "i"), "").trim() || value;
}

function fitLength(value: string, maxLength: number): string {
  const cleaned = cleanPlainText(value);
  if (cleaned.length <= maxLength) return cleaned;
  const clipped = cleaned.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : maxLength - 1).trim()}...`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "cryptowatchdog-metadata-draft";
}

function normaliseComparableUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.href;
  } catch {
    return value.trim();
  }
}

function recordKey(record: NormalisedContentRecord): string {
  return `${record.sourceTable}:${record.slug}`;
}

function renderMarkdown(items: MetadataSuggestionItem[]): string {
  return `# Metadata Suggestions

Generated: ${new Date().toISOString()}

Draft-only metadata suggestions for human review. This report does not edit live content, publish content, write to Supabase, or verify claims.

${items.length > 0 ? items.map(renderItem).join("\n") : "No metadata suggestions generated.\n"}`;
}

function renderItem(item: MetadataSuggestionItem): string {
  return `## ${item.title ?? item.slug}

- Page: ${item.url}
- Source table: ${item.sourceTable}
- Draft only: yes
- Needs human review: yes
- Rendered facts available: ${item.renderedFactsAvailable ? "yes" : "no"}
- SEO title draft: ${item.seoTitleDraft.draft}
- Meta description draft: ${item.metaDescriptionDraft.draft}
- Canonical status: ${item.canonicalCheck.status}
- Suggested canonical: ${item.canonicalCheck.suggestedCanonical}
- Schema suggestion: ${item.schemaSuggestionType.draft}
- Target keyword draft: ${item.targetKeywordSuggestion.draft}
- Secondary keyword drafts: ${item.secondaryKeywordSuggestions.map((keyword) => keyword.draft).join(", ") || "none"}
- Image alt draft: ${item.imageAltTextSuggestions.map((suggestion) => suggestion.draft).join(" | ")}
- Image filename draft: ${item.imageFilenameSuggestions.map((suggestion) => suggestion.draft).join(" | ")}
- Notes: ${item.safetyNotes.join(" ")}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildMetadataSuggestions();
}
