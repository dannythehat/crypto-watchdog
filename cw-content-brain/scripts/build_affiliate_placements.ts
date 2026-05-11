import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { Confidence, FalsePositiveRisk, NormalisedContentRecord, SnapshotTableName } from "../src/lib/types.js";
import { loadContentSnapshot } from "./load_content_snapshot.js";

type AffiliateStatus = "active" | "paused" | "expired" | "blocked" | "needs_review";
type ExpiryStatus = "current" | "expires_soon" | "expired" | "stale_check" | "needs_review";
type PlacementStatus = "suggested" | "manual_review_required" | "blocked";
type PlacementType = "in_content_after_relevant_section" | "contextual_further_reading_near_bottom";

interface AffiliateVaultConfig {
  readOnly: boolean;
  writeBackToSupabase: boolean;
  records: AffiliateVaultRecord[];
}

interface AffiliateVaultRecord {
  brandName: string;
  category: string;
  affiliateUrl: string;
  cleanDisplayUrl: string;
  network: string;
  commissionType: string;
  countriesAllowed: string[];
  approvedPageTypes: SnapshotTableName[];
  blockedPageTypes: SnapshotTableName[];
  allowedRiskRatings: string[];
  disclosureRequired: boolean;
  disclosureText: string;
  offerText: string;
  offerExpiryDate?: string;
  lastCheckedDate?: string;
  status: AffiliateStatus;
  notes?: string;
}

interface PageRef {
  sourceTable: SnapshotTableName;
  id: string;
  slug: string;
  title?: string;
  url: string;
  rating?: string;
  category?: string;
}

interface AffiliatePlacementSuggestion {
  draft_only: true;
  needs_human_review: true;
  placementStatus: PlacementStatus;
  sourcePage: PageRef;
  affiliateBrand: string;
  affiliateCategory: string;
  cleanDisplayUrl: string;
  network: string;
  commissionType: string;
  suggestedPlacementContext: string;
  placementType: PlacementType;
  suggestedCtaText: string;
  disclosureRequired: boolean;
  disclosureText?: string;
  reason: string;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
  expiryStatus: ExpiryStatus;
  offerText?: string;
  riskFlags: string[];
}

interface Candidate {
  record: NormalisedContentRecord;
  affiliate: AffiliateVaultRecord;
  sharedTerms: string[];
  score: number;
  riskFlags: string[];
  expiryStatus: ExpiryStatus;
  reasonParts: string[];
}

const outputJson = "data/reports/affiliate_placement_suggestions.json";
const outputMd = "data/reports/affiliate_placement_suggestions.md";
const vaultPath = "config/affiliate_vault.json";
const exampleVaultPath = "config/affiliate_vault.example.json";
const maxSuggestedPerPage = 1;
const minSuggestionScore = 38;
const minReviewScore = 24;

const genericTerms = new Set([
  "affiliate",
  "app",
  "apps",
  "before",
  "buy",
  "com",
  "crypto",
  "example",
  "for",
  "guide",
  "guides",
  "human",
  "local",
  "only",
  "platform",
  "review",
  "risk",
  "risks",
  "safety",
  "scam",
  "scams",
  "token",
  "tokens",
  "tooling",
  "users",
]);

const legalOrPolicyPattern = /(affiliate-disclosure|privacy-policy|terms|terms-of-use|accessibility|editorial-policy|methodology)/i;
const highRiskPattern = /(scam|warning|alert|fraud|recovery|complaint|blacklist|rug pull|phishing)/i;

export async function buildAffiliatePlacements(): Promise<AffiliatePlacementSuggestion[]> {
  const records = await loadRecords();
  const vault = await loadVault();
  const candidates = records.flatMap((record) => vault.records.map((affiliate) => buildCandidate(record, affiliate)));
  const suggestions = selectSuggestions(candidates);
  const blockedPlacements = candidates
    .filter((candidate) => placementStatusFor(candidate) === "blocked")
    .map((candidate) => toSuggestion(candidate));

  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only affiliate placement suggestions for human review. This report does not edit pages, publish content, write to Supabase, or verify live rendered content.",
    draft_only: true,
    needs_human_review: true,
    sourceCount: records.length,
    affiliateRecordCount: vault.records.length,
    recommendationCount: suggestions.length,
    blockedPlacementCount: blockedPlacements.length,
    trustRule: "Affiliate links are the money engine, but trust comes first. No aggressive buy-now spam, no affiliate links on warning/red pages unless manually approved, and every placement must make sense for the reader.",
    recommendations: suggestions,
    blockedPlacements,
  });
  await writeText(outputMd, renderMarkdown(suggestions, blockedPlacements));
  logger.info("Affiliate placement suggestions written", { recommendations: suggestions.length, blockedPlacements: blockedPlacements.length, outputJson, outputMd });
  return suggestions;
}

async function loadRecords(): Promise<NormalisedContentRecord[]> {
  try {
    return await readJson<NormalisedContentRecord[]>("data/content_snapshot/normalised_content.json");
  } catch {
    return loadContentSnapshot();
  }
}

async function loadVault(): Promise<AffiliateVaultConfig> {
  let vault: AffiliateVaultConfig;
  try {
    vault = await readJson<AffiliateVaultConfig>(vaultPath);
  } catch {
    vault = await readJson<AffiliateVaultConfig>(exampleVaultPath);
  }

  if (!vault.readOnly || vault.writeBackToSupabase) {
    throw new Error("Affiliate vault must remain read-only with writeBackToSupabase disabled");
  }

  return vault;
}

function buildCandidate(record: NormalisedContentRecord, affiliate: AffiliateVaultRecord): Candidate {
  const recordTerms = termsFromText(snapshotText(record));
  const affiliateTerms = termsFromText([
    affiliate.brandName,
    affiliate.category,
    affiliate.cleanDisplayUrl,
    affiliate.offerText,
    affiliate.notes,
  ].filter(Boolean).join(" "));
  const sharedTerms = affiliateTerms.filter((term) => recordTerms.includes(term) && !genericTerms.has(term)).slice(0, 8);
  const riskFlags = riskFlagsFor(record, affiliate);
  const expiryStatus = expiryStatusFor(affiliate);
  const reasonParts: string[] = [];
  let score = sharedTerms.length * 14;

  if (categoryMatches(record, affiliate)) {
    score += 18;
    reasonParts.push(`page category matches the approved ${affiliate.category} affiliate category`);
  }
  if (brandAppears(record, affiliate)) {
    score += 28;
    reasonParts.push("affiliate brand appears in the snapshot content or page title");
  }
  if (affiliate.approvedPageTypes.includes(record.sourceTable)) {
    score += 8;
    reasonParts.push(`${record.sourceTable} is an approved page type for this programme`);
  }
  if (record.sourceTable === "blog_posts" || record.sourceTable === "categories") {
    score += 4;
    reasonParts.push("page type can support a careful comparison or further-reading CTA after the useful content");
  }
  if (expiryStatus !== "current") {
    score -= 16;
    reasonParts.push(`offer status needs review: ${expiryStatus}`);
  }
  if (affiliate.status !== "active") {
    score -= 22;
    reasonParts.push(`affiliate record is ${affiliate.status}`);
  }
  if (riskFlags.length > 0) {
    score -= 40;
    reasonParts.push(`blocked or high-risk context: ${riskFlags.join(", ")}`);
  }
  if (sharedTerms.length > 0) {
    reasonParts.push(`specific shared terms: ${sharedTerms.join(", ")}`);
  }

  return { record, affiliate, sharedTerms, score, riskFlags, expiryStatus, reasonParts };
}

function selectSuggestions(candidates: Candidate[]): AffiliatePlacementSuggestion[] {
  const perPage = new Map<string, number>();
  const selected: AffiliatePlacementSuggestion[] = [];

  for (const candidate of candidates.sort((a, b) => b.score - a.score || a.affiliate.brandName.localeCompare(b.affiliate.brandName))) {
    const sourceKey = recordKey(candidate.record);
    const status = placementStatusFor(candidate);
    if (status === "blocked") continue;
    if (candidate.score < minReviewScore) continue;
    if ((perPage.get(sourceKey) ?? 0) >= maxSuggestedPerPage) continue;
    if (status === "suggested" && candidate.score < minSuggestionScore) continue;

    selected.push(toSuggestion(candidate));
    perPage.set(sourceKey, (perPage.get(sourceKey) ?? 0) + 1);
  }

  return selected;
}

function toSuggestion(candidate: Candidate): AffiliatePlacementSuggestion {
  const placementStatus = placementStatusFor(candidate);
  const placementType = placementTypeFor(candidate);
  return {
    draft_only: true,
    needs_human_review: true,
    placementStatus,
    sourcePage: pageRef(candidate.record),
    affiliateBrand: candidate.affiliate.brandName,
    affiliateCategory: candidate.affiliate.category,
    cleanDisplayUrl: candidate.affiliate.cleanDisplayUrl,
    network: candidate.affiliate.network,
    commissionType: candidate.affiliate.commissionType,
    suggestedPlacementContext: placementContextFor(candidate, placementType),
    placementType,
    suggestedCtaText: ctaTextFor(candidate),
    disclosureRequired: candidate.affiliate.disclosureRequired,
    disclosureText: candidate.affiliate.disclosureRequired ? candidate.affiliate.disclosureText : undefined,
    reason: candidate.reasonParts.length > 0 ? candidate.reasonParts.join("; ") : "possible affiliate fit found from local snapshot content",
    confidence: confidenceFor(candidate),
    falsePositiveRisk: falsePositiveRiskFor(candidate),
    expiryStatus: candidate.expiryStatus,
    offerText: candidate.affiliate.offerText,
    riskFlags: candidate.riskFlags,
  };
}

function placementStatusFor(candidate: Candidate): PlacementStatus {
  if (candidate.riskFlags.length > 0) return "blocked";
  if (candidate.affiliate.status !== "active" || candidate.expiryStatus !== "current") return "manual_review_required";
  return "suggested";
}

function riskFlagsFor(record: NormalisedContentRecord, affiliate: AffiliateVaultRecord): string[] {
  const flags: string[] = [];
  const text = snapshotText(record).toLowerCase();
  const rating = (record.rating ?? "not_applicable").toLowerCase();
  const urlAndSlug = `${record.url} ${record.slug}`.toLowerCase();

  if (affiliate.blockedPageTypes.includes(record.sourceTable)) flags.push("blocked_page_type");
  if (!affiliate.approvedPageTypes.includes(record.sourceTable)) flags.push("page_type_not_approved");
  if (record.sourceTable === "warnings") flags.push("warning_page");
  if (rating === "red") flags.push("red_rating");
  if (!affiliate.allowedRiskRatings.map((item) => item.toLowerCase()).includes(rating)) flags.push("risk_rating_not_allowed");
  if (legalOrPolicyPattern.test(urlAndSlug)) flags.push("legal_or_policy_page");
  if (highRiskPattern.test(`${record.title ?? ""} ${record.category ?? ""} ${record.slug}`) || highRiskPattern.test(text.slice(0, 1200))) flags.push("high_risk_scam_or_warning_context");
  if (affiliate.status === "blocked") flags.push("affiliate_record_blocked");

  return Array.from(new Set(flags));
}

function expiryStatusFor(affiliate: AffiliateVaultRecord): ExpiryStatus {
  if (affiliate.status === "expired") return "expired";
  if (!affiliate.offerExpiryDate || !affiliate.lastCheckedDate) return "needs_review";

  const today = new Date();
  const expiry = dateOnly(affiliate.offerExpiryDate);
  const lastChecked = dateOnly(affiliate.lastCheckedDate);
  if (!expiry || !lastChecked) return "needs_review";
  if (expiry.getTime() < startOfToday(today).getTime()) return "expired";

  const daysToExpiry = Math.ceil((expiry.getTime() - startOfToday(today).getTime()) / 86400000);
  const daysSinceCheck = Math.floor((startOfToday(today).getTime() - lastChecked.getTime()) / 86400000);
  if (daysSinceCheck > 90) return "stale_check";
  if (daysToExpiry <= 30) return "expires_soon";
  return "current";
}

function placementTypeFor(candidate: Candidate): PlacementType {
  if (candidate.score >= 52 && (brandAppears(candidate.record, candidate.affiliate) || categoryMatches(candidate.record, candidate.affiliate))) {
    return "in_content_after_relevant_section";
  }
  return "contextual_further_reading_near_bottom";
}

function placementContextFor(candidate: Candidate, placementType: PlacementType): string {
  const topic = candidate.sharedTerms[0] ?? candidate.affiliate.category;
  if (candidate.riskFlags.length > 0) {
    return "Do not place automatically. This page or affiliate record is blocked/high-risk and needs manual editorial approval before any affiliate CTA is considered.";
  }
  if (placementType === "in_content_after_relevant_section") {
    return `Place after a relevant section about ${topic}, only after the main answer and evidence context are clear. Keep it as one disclosed, helpful option rather than a top-of-page CTA.`;
  }
  return `Use near the bottom as a restrained Further reading or comparison CTA about ${topic}. Do not add this above the main answer or repeat it elsewhere on the page.`;
}

function ctaTextFor(candidate: Candidate): string {
  if (candidate.riskFlags.length > 0) return "Manual review required before considering any affiliate link";
  const brand = candidate.affiliate.brandName;
  if (candidate.affiliate.offerText) return candidate.affiliate.offerText;
  if (candidate.affiliate.category === "wallet") return `Compare ${brand} security details`;
  if (candidate.affiliate.category === "exchange") return `Review ${brand} fees and withdrawal terms`;
  return `Check ${brand} details before using this service`;
}

function confidenceFor(candidate: Candidate): Confidence {
  if (candidate.riskFlags.length > 0 || candidate.affiliate.status !== "active") return "low";
  if (candidate.score >= 64 && brandAppears(candidate.record, candidate.affiliate)) return "high";
  if (candidate.score >= minSuggestionScore && (categoryMatches(candidate.record, candidate.affiliate) || candidate.sharedTerms.length >= 2)) return "medium";
  return "low";
}

function falsePositiveRiskFor(candidate: Candidate): FalsePositiveRisk {
  if (candidate.riskFlags.length > 0) return "high";
  if (candidate.affiliate.status !== "active" || candidate.expiryStatus !== "current") return "high";
  if (brandAppears(candidate.record, candidate.affiliate) && categoryMatches(candidate.record, candidate.affiliate)) return "low";
  if (categoryMatches(candidate.record, candidate.affiliate) || candidate.sharedTerms.length >= 2) return "medium";
  return "high";
}

function categoryMatches(record: NormalisedContentRecord, affiliate: AffiliateVaultRecord): boolean {
  const category = `${record.category ?? ""} ${record.title ?? ""} ${record.slug}`.toLowerCase();
  return termsFromText(category).includes(affiliate.category.toLowerCase());
}

function brandAppears(record: NormalisedContentRecord, affiliate: AffiliateVaultRecord): boolean {
  return snapshotText(record).toLowerCase().includes(affiliate.brandName.toLowerCase());
}

function pageRef(record: NormalisedContentRecord): PageRef {
  return {
    sourceTable: record.sourceTable,
    id: record.id,
    slug: record.slug,
    title: record.title,
    url: record.url,
    rating: record.rating,
    category: record.category,
  };
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

function termsFromText(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) ?? []));
}

function recordKey(record: NormalisedContentRecord): string {
  return `${record.sourceTable}:${record.slug}`;
}

function dateOnly(value: string): Date | undefined {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfToday(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function renderMarkdown(suggestions: AffiliatePlacementSuggestion[], blockedPlacements: AffiliatePlacementSuggestion[]): string {
  return `# Affiliate Placement Suggestions

Generated: ${new Date().toISOString()}

Draft-only affiliate placement suggestions for human review. This report does not edit pages, publish content, write to Supabase, or verify live rendered content.

Trust rule: Affiliate links are the money engine, but trust comes first. No aggressive buy-now spam, no affiliate links on warning/red pages unless manually approved, and every placement must make sense for the reader.

## Recommendations

${suggestions.length > 0 ? suggestions.map(renderSuggestion).join("\n") : "No affiliate placement suggestions generated.\n"}

## Blocked Or High-Risk Placements

${blockedPlacements.length > 0 ? blockedPlacements.map(renderSuggestion).join("\n") : "No blocked affiliate placements detected.\n"}`;
}

function renderSuggestion(item: AffiliatePlacementSuggestion): string {
  return `### ${item.sourcePage.title ?? item.sourcePage.slug} -> ${item.affiliateBrand}

- Source: ${item.sourcePage.url}
- Draft only: yes
- Needs human review: yes
- Placement status: ${item.placementStatus}
- Suggested CTA: ${item.suggestedCtaText}
- Placement: ${item.suggestedPlacementContext}
- Disclosure required: ${item.disclosureRequired ? "yes" : "no"}
- Expiry status: ${item.expiryStatus}
- Confidence: ${item.confidence}
- False-positive risk: ${item.falsePositiveRisk}
- Risk flags: ${item.riskFlags.length > 0 ? item.riskFlags.join(", ") : "none"}
- Reason: ${item.reason}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildAffiliatePlacements();
}
