import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";
import type { Confidence, FalsePositiveRisk, SnapshotTableName } from "../src/lib/types.js";

type OpportunityType =
  | "metadata_improvement"
  | "internal_link_support"
  | "content_refresh"
  | "ctr_improvement"
  | "page_2_opportunity"
  | "weak_engagement"
  | "affiliate_review"
  | "offer_review"
  | "evidence_or_trust_review"
  | "media_review";

type Priority = "critical" | "high" | "medium" | "low" | "monitor";
type QueueStatus = "safe_draft" | "needs_human_review" | "blocked" | "monitor";

interface SourceSignal {
  report: string;
  signalType: string;
  detail: string;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
}

interface SeoQueueItem {
  draft_only: true;
  needs_human_review: boolean;
  status: QueueStatus;
  priority: Priority;
  opportunityType: OpportunityType;
  page?: PageRef;
  brandName?: string;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
  sourceSignals: SourceSignal[];
  suggestedNextAction: string;
}

interface SeoBrainOutput {
  actionQueue: SeoQueueItem[];
  blockedItems: SeoQueueItem[];
  monitorItems: SeoQueueItem[];
  allItems: SeoQueueItem[];
  statusCounts: Record<QueueStatus, number>;
  priorityCounts: Record<Priority, number>;
  opportunityTypeCounts: Record<OpportunityType, number>;
}

interface PageRef {
  sourceTable?: SnapshotTableName;
  id?: string;
  slug?: string;
  title?: string;
  url?: string;
}

interface SignalDraft {
  key: string;
  opportunityType: OpportunityType;
  page?: PageRef;
  brandName?: string;
  weight: number;
  statusHint?: QueueStatus;
  sourceSignal: SourceSignal;
}

const outputJson = "data/reports/seo_intelligence_queue.json";
const outputMd = "data/reports/seo_intelligence_queue.md";
const maxActionQueueItems = 80;
const maxBlockedItems = 10;
const maxMonitorItems = 30;
const maxActionItemsPerOpportunityType = 12;

const reportPaths = {
  metadata: "data/reports/metadata_suggestions.json",
  internalLinks: "data/reports/internal_link_placement_suggestions.json",
  affiliates: "data/reports/affiliate_placement_suggestions.json",
  offers: "data/reports/offer_tracker_report.json",
  searchConsole: "data/reports/search_console_report.json",
  ga4: "data/reports/ga4_report.json",
  rendered: "data/reports/rendered_page_verification.json",
};

export async function buildSeoIntelligenceBrain(): Promise<SeoQueueItem[]> {
  const loadedReports: string[] = [];
  const missingReports: string[] = [];
  const signals: SignalDraft[] = [];

  await collect("metadata_suggestions", reportPaths.metadata, loadedReports, missingReports, (report) => signals.push(...metadataSignals(report)));
  await collect("internal_link_placement_suggestions", reportPaths.internalLinks, loadedReports, missingReports, (report) => signals.push(...internalLinkSignals(report)));
  await collect("affiliate_placement_suggestions", reportPaths.affiliates, loadedReports, missingReports, (report) => signals.push(...affiliateSignals(report)));
  await collect("offer_tracker_report", reportPaths.offers, loadedReports, missingReports, (report) => signals.push(...offerSignals(report)));
  await collect("search_console_report", reportPaths.searchConsole, loadedReports, missingReports, (report) => signals.push(...searchConsoleSignals(report)));
  await collect("ga4_report", reportPaths.ga4, loadedReports, missingReports, (report) => signals.push(...ga4Signals(report)));
  await collect("rendered_page_verification", reportPaths.rendered, loadedReports, missingReports, (report) => signals.push(...renderedSignals(report)));

  const queue = buildQueue(signals);
  await writeJson(outputJson, {
    generatedAt: new Date().toISOString(),
    disclaimer: "Draft-only SEO Intelligence Brain queue for human review. This report combines local reports only and never applies changes, writes to Supabase, writes to Google, edits live pages, or publishes content.",
    draft_only: true,
    needs_human_review: true,
    loadedReports,
    missingReports,
    signalCount: signals.length,
    itemCount: queue.actionQueue.length,
    actionQueueCount: queue.actionQueue.length,
    blockedItemCount: queue.statusCounts.blocked,
    blockedItemsShown: queue.blockedItems.length,
    monitorItemCount: queue.statusCounts.monitor,
    monitorItemsShown: queue.monitorItems.length,
    statusCounts: queue.statusCounts,
    priorityCounts: queue.priorityCounts,
    opportunityTypeCounts: queue.opportunityTypeCounts,
    items: queue.actionQueue,
    actionQueue: queue.actionQueue,
    blockedItems: queue.blockedItems,
    monitorItems: queue.monitorItems,
  });
  await writeText(outputMd, renderMarkdown(queue, loadedReports, missingReports));
  logger.info("SEO intelligence queue written", { actionQueue: queue.actionQueue.length, blockedItems: queue.blockedItems.length, monitorItems: queue.monitorItems.length, signals: signals.length, outputJson, outputMd });
  return queue.actionQueue;
}

async function collect(name: string, path: string, loaded: string[], missing: string[], consume: (report: unknown) => void): Promise<void> {
  try {
    const report = await readJson<unknown>(path);
    loaded.push(name);
    consume(report);
  } catch {
    missing.push(name);
  }
}

function metadataSignals(report: unknown): SignalDraft[] {
  const items = arrayAt(report, "items");
  return items.flatMap((item) => {
    const page = pageFrom(item);
    const key = pageKey(page);
    const signals: SignalDraft[] = [];
    const canonicalStatus = stringAt(item, "canonicalCheck", "status");
    if (canonicalStatus && canonicalStatus !== "matches_suggested") {
      signals.push(signal(key, "metadata_improvement", page, undefined, 18, "needs_human_review", "metadata_suggestions", "canonical_or_rendered_metadata_gap", `Canonical/rendered metadata status: ${canonicalStatus}.`, "medium", canonicalStatus === "rendered_facts_unavailable" ? "medium" : "low"));
    }
    if (arrayAt(item, "imageAltTextSuggestions").length > 0 || arrayAt(item, "imageFilenameSuggestions").length > 0) {
      signals.push(signal(key, "media_review", page, undefined, 10, "safe_draft", "metadata_suggestions", "image_metadata_drafts", "Image alt text or filename draft suggestions are available.", "medium", "medium"));
    }
    return signals;
  });
}

function internalLinkSignals(report: unknown): SignalDraft[] {
  const recs = arrayAt(report, "recommendations");
  const reviewLater = arrayAt(report, "review_later");
  const orphanPages = arrayAt(report, "orphanOrThinlyLinkedPages");
  const signals = recs.concat(reviewLater).map((item) => {
    const page = pageFrom(objectAt(item, "sourcePage"));
    const confidence = confidenceAt(item, "confidence", "medium");
    const fp = falsePositiveAt(item, "falsePositiveRisk", "medium");
    return signal(pageKey(page), "internal_link_support", page, undefined, confidence === "high" ? 24 : 16, "safe_draft", "internal_link_placement_suggestions", "internal_link_recommendation", `Internal link opportunity toward ${stringAt(item, "targetPage", "title") ?? stringAt(item, "targetPage", "slug") ?? "a related page"}.`, confidence, fp);
  });
  for (const item of orphanPages) {
    const page = pageFrom(item);
    signals.push(signal(pageKey(page), "internal_link_support", page, undefined, 14, "needs_human_review", "internal_link_placement_suggestions", "orphan_or_thin_linked_page", "Page appears orphaned or thinly linked in snapshot text.", "medium", "medium"));
  }
  return signals;
}

function affiliateSignals(report: unknown): SignalDraft[] {
  const recs = arrayAt(report, "recommendations");
  const blocked = arrayAt(report, "blockedPlacements");
  const signals = recs.map((item) => {
    const page = pageFrom(objectAt(item, "sourcePage"));
    const status = stringAt(item, "placementStatus") === "suggested" ? "safe_draft" : "needs_human_review";
    return signal(pageKey(page), "affiliate_review", page, stringAt(item, "affiliateBrand"), status === "safe_draft" ? 14 : 20, status, "affiliate_placement_suggestions", "affiliate_placement", `Affiliate placement for ${stringAt(item, "affiliateBrand") ?? "an affiliate programme"} needs ${status === "safe_draft" ? "draft review" : "manual review"}.`, confidenceAt(item, "confidence", "low"), falsePositiveAt(item, "falsePositiveRisk", "high"));
  });
  for (const item of blocked) {
    const page = pageFrom(objectAt(item, "sourcePage"));
    signals.push(signal(pageKey(page), "affiliate_review", page, stringAt(item, "affiliateBrand"), 35, "blocked", "affiliate_placement_suggestions", "blocked_affiliate_context", `Blocked affiliate placement: ${arrayAt(item, "riskFlags").join(", ") || "high-risk context"}.`, "high", "low"));
  }
  return signals;
}

function offerSignals(report: unknown): SignalDraft[] {
  const all = arrayAt(report, "items");
  return all.map((item) => {
    const status = stringAt(item, "useStatus") === "blocked" ? "blocked" : stringAt(item, "useStatus") === "safe_to_use" ? "monitor" : "needs_human_review";
    const classification = stringAt(item, "classification") ?? "needs_review";
    const weight = status === "blocked" ? 36 : status === "needs_human_review" ? 22 : 8;
    return signal(`brand:${stringAt(item, "brandName") ?? "unknown-offer"}`, "offer_review", undefined, stringAt(item, "brandName"), weight, status, "offer_tracker_report", "offer_status", `Offer classified as ${classification}. Actions: ${arrayAt(item, "recommendedActions").join(", ") || "human review"}.`, status === "monitor" ? "medium" : "high", status === "blocked" ? "low" : "medium");
  });
}

function searchConsoleSignals(report: unknown): SignalDraft[] {
  return arrayAt(report, "recommendations").map((item) => {
    const page = { url: stringAt(item, "page"), title: stringAt(item, "query") };
    const type = stringAt(item, "type") === "metadata_review" ? "ctr_improvement" : stringAt(item, "type") === "content_refresh_review" ? "page_2_opportunity" : "content_refresh";
    return signal(pageKey(page), type as OpportunityType, page, undefined, numberAt(item, "impressions") >= 500 ? 28 : 18, "needs_human_review", "search_console_report", stringAt(item, "type") ?? "search_console_opportunity", stringAt(item, "reason") ?? "Search Console opportunity needs review.", "medium", "medium");
  });
}

function ga4Signals(report: unknown): SignalDraft[] {
  return arrayAt(report, "recommendations").map((item) => {
    const page = { url: stringAt(item, "page"), title: stringAt(item, "pageTitle") };
    const rawType = stringAt(item, "type");
    const type: OpportunityType = rawType === "weak_engagement" ? "weak_engagement" : rawType === "affiliate_placement_review" ? "affiliate_review" : rawType === "metadata_review" ? "metadata_improvement" : "content_refresh";
    return signal(pageKey(page), type, page, undefined, numberAt(item, "sessions") >= 100 ? 26 : 16, "needs_human_review", "ga4_report", rawType ?? "ga4_opportunity", stringAt(item, "reason") ?? "GA4 opportunity needs review.", "medium", "medium");
  });
}

function renderedSignals(report: unknown): SignalDraft[] {
  return arrayAt(report, "results").flatMap((item) => {
    const page = pageFrom(item);
    const facts = objectAt(item, "renderedFacts");
    const signals: SignalDraft[] = [];
    if (numberAt(facts, "imagesMissingAlt") > 0) {
      signals.push(signal(pageKey(page), "media_review", page, undefined, 20, "needs_human_review", "rendered_page_verification", "images_missing_alt", `${numberAt(facts, "imagesMissingAlt")} rendered images appear to be missing alt text.`, "high", "medium"));
    }
    if (arrayAt(facts, "codeArtifactTokens").length > 0) {
      signals.push(signal(pageKey(page), "evidence_or_trust_review", page, undefined, 30, "needs_human_review", "rendered_page_verification", "code_artifact_detected", `Rendered code artefact tokens detected: ${arrayAt(facts, "codeArtifactTokens").join(", ")}.`, "high", "medium"));
    }
    return signals;
  });
}

function buildQueue(signals: SignalDraft[]): SeoBrainOutput {
  const grouped = new Map<string, SignalDraft[]>();
  for (const draft of signals) {
    const brandKey = draft.brandName ? `|brand:${draft.brandName.toLowerCase()}` : "";
    const key = `${draft.key}|${draft.opportunityType}${brandKey}`;
    grouped.set(key, [...(grouped.get(key) ?? []), draft]);
  }

  const allItems = Array.from(grouped.values()).map(toQueueItem)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.sourceSignals.length - a.sourceSignals.length);
  const blocked = allItems.filter((item) => item.status === "blocked");
  const monitor = allItems.filter((item) => item.status === "monitor");
  const actionable = allItems.filter((item) => item.status !== "blocked" && item.status !== "monitor");

  return {
    actionQueue: balancedActionQueue(actionable),
    blockedItems: blocked.slice(0, maxBlockedItems),
    monitorItems: monitor.slice(0, maxMonitorItems),
    allItems,
    statusCounts: countBy(allItems, (item) => item.status, ["safe_draft", "needs_human_review", "blocked", "monitor"]),
    priorityCounts: countBy(allItems, (item) => item.priority, ["critical", "high", "medium", "low", "monitor"]),
    opportunityTypeCounts: countBy(allItems, (item) => item.opportunityType, [
      "metadata_improvement",
      "internal_link_support",
      "content_refresh",
      "ctr_improvement",
      "page_2_opportunity",
      "weak_engagement",
      "affiliate_review",
      "offer_review",
      "evidence_or_trust_review",
      "media_review",
    ]),
  };
}

function balancedActionQueue(items: SeoQueueItem[]): SeoQueueItem[] {
  const sorted = items.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.sourceSignals.length - a.sourceSignals.length);
  const selected: SeoQueueItem[] = [];
  const perType = new Map<OpportunityType, number>();

  for (const item of sorted) {
    if (selected.length >= maxActionQueueItems) break;
    const count = perType.get(item.opportunityType) ?? 0;
    if (count >= maxActionItemsPerOpportunityType) continue;
    selected.push(item);
    perType.set(item.opportunityType, count + 1);
  }

  if (selected.length < maxActionQueueItems) {
    for (const item of sorted) {
      if (selected.length >= maxActionQueueItems) break;
      if (selected.includes(item)) continue;
      selected.push(item);
    }
  }

  return selected;
}

function toQueueItem(group: SignalDraft[]): SeoQueueItem {
  const first = group[0];
  const weight = group.reduce((total, item) => total + item.weight, 0);
  const status = statusFor(group);
  const confidence = confidenceFor(group, weight);
  const falsePositiveRisk = falsePositiveFor(group);
  return {
    draft_only: true,
    needs_human_review: status !== "blocked",
    status,
    priority: priorityFor(weight, status),
    opportunityType: first.opportunityType,
    page: first.page,
    brandName: first.brandName,
    confidence,
    falsePositiveRisk,
    sourceSignals: group.map((item) => item.sourceSignal),
    suggestedNextAction: nextActionFor(first.opportunityType, status),
  };
}

function signal(key: string, opportunityType: OpportunityType, page: PageRef | undefined, brandName: string | undefined, weight: number, statusHint: QueueStatus, report: string, signalType: string, detail: string, confidence: Confidence, falsePositiveRisk: FalsePositiveRisk): SignalDraft {
  return {
    key,
    opportunityType,
    page,
    brandName,
    weight,
    statusHint,
    sourceSignal: { report, signalType, detail, confidence, falsePositiveRisk },
  };
}

function statusFor(group: SignalDraft[]): QueueStatus {
  if (group.some((item) => item.statusHint === "blocked")) return "blocked";
  if (group.some((item) => item.statusHint === "needs_human_review")) return "needs_human_review";
  if (group.some((item) => item.statusHint === "safe_draft")) return "safe_draft";
  return "monitor";
}

function priorityFor(weight: number, status: QueueStatus): Priority {
  if (status === "blocked") return "critical";
  if (weight >= 50) return "high";
  if (weight >= 28) return "medium";
  if (weight >= 12) return "low";
  return "monitor";
}

function priorityRank(priority: Priority): number {
  return { critical: 0, high: 1, medium: 2, low: 3, monitor: 4 }[priority];
}

function confidenceFor(group: SignalDraft[], weight: number): Confidence {
  if (group.some((item) => item.sourceSignal.confidence === "high") || weight >= 50) return "high";
  if (group.some((item) => item.sourceSignal.confidence === "medium") || weight >= 20) return "medium";
  return "low";
}

function falsePositiveFor(group: SignalDraft[]): FalsePositiveRisk {
  if (group.some((item) => item.sourceSignal.falsePositiveRisk === "high")) return "high";
  if (group.some((item) => item.sourceSignal.falsePositiveRisk === "medium")) return "medium";
  return "low";
}

function countBy<T extends string>(items: SeoQueueItem[], pick: (item: SeoQueueItem) => T, keys: T[]): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const item of items) {
    counts[pick(item)] += 1;
  }
  return counts;
}

function nextActionFor(type: OpportunityType, status: QueueStatus): string {
  if (status === "blocked") return "Block this action from drafting until a human clears the underlying risk signal.";
  const actions: Record<OpportunityType, string> = {
    metadata_improvement: "Review page intent, rendered metadata, and draft a cautious title/meta update if supported.",
    internal_link_support: "Review natural in-content internal link opportunities after the main answer and evidence context.",
    content_refresh: "Review whether the page needs updated evidence, clearer structure, or stronger reader next steps.",
    ctr_improvement: "Review Search Console query intent and draft metadata changes only if the page promise remains accurate.",
    page_2_opportunity: "Review content depth, internal links, and freshness for queries sitting near page 2.",
    weak_engagement: "Review GA4 engagement signals, opening clarity, page structure, and whether the page satisfies intent.",
    affiliate_review: "Review affiliate placement only if it helps the reader, is disclosed, and passes page risk rules.",
    offer_review: "Review offer status, expiry, disclosure, and placement eligibility before using this programme.",
    evidence_or_trust_review: "Review rendered trust signals, evidence, disclosures, and any possible artefacts before drafting changes.",
    media_review: "Review images, alt text, filenames, and visible media context before drafting media metadata changes.",
  };
  return actions[type];
}

function pageFrom(value: unknown): PageRef {
  const row = isRecord(value) ? value : {};
  return {
    sourceTable: stringAt(row, "sourceTable") as SnapshotTableName | undefined,
    id: stringAt(row, "id"),
    slug: stringAt(row, "slug"),
    title: stringAt(row, "title"),
    url: stringAt(row, "url") ?? stringAt(row, "finalUrl"),
  };
}

function pageKey(page: PageRef): string {
  if (page.url) return normaliseUrl(page.url);
  if (page.slug) return `slug:${page.slug}`;
  if (page.title) return `title:${page.title.toLowerCase()}`;
  return "unknown-page";
}

function normaliseUrl(value: string): string {
  try {
    const url = new URL(value, "https://cryptowatchdog.net");
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.toLowerCase().replace(/\/$/, "");
  }
}

function arrayAt(value: unknown, key: string): unknown[] {
  return isRecord(value) && Array.isArray(value[key]) ? value[key] : [];
}

function objectAt(value: unknown, key: string): unknown {
  return isRecord(value) && isRecord(value[key]) ? value[key] : {};
}

function stringAt(value: unknown, ...path: string[]): string | undefined {
  let current: unknown = value;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return typeof current === "string" && current.trim() ? current.trim() : undefined;
}

function numberAt(value: unknown, key: string): number {
  if (!isRecord(value)) return 0;
  const raw = value[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
}

function confidenceAt(value: unknown, key: string, fallback: Confidence): Confidence {
  const raw = stringAt(value, key);
  return raw === "low" || raw === "medium" || raw === "high" ? raw : fallback;
}

function falsePositiveAt(value: unknown, key: string, fallback: FalsePositiveRisk): FalsePositiveRisk {
  const raw = stringAt(value, key);
  return raw === "low" || raw === "medium" || raw === "high" ? raw : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderMarkdown(queue: SeoBrainOutput, loadedReports: string[], missingReports: string[]): string {
  return `# SEO Intelligence Queue

Generated: ${new Date().toISOString()}

Draft-only SEO Intelligence Brain queue for human review. This report combines local reports only and never applies changes, writes to Supabase, writes to Google, edits live pages, or publishes content.

## Report Inputs

- Loaded: ${loadedReports.length > 0 ? loadedReports.join(", ") : "none"}
- Missing: ${missingReports.length > 0 ? missingReports.join(", ") : "none"}
- Action queue items: ${queue.actionQueue.length}
- Blocked/risk-control items shown: ${queue.blockedItems.length}
- Monitor items: ${queue.monitorItems.length}

## Action Queue

${queue.actionQueue.length > 0 ? queue.actionQueue.map(renderItem).join("\n") : "No actionable SEO intelligence queue items generated.\n"}

## Blocked / Risk Controls

${queue.blockedItems.length > 0 ? queue.blockedItems.map(renderItem).join("\n") : "No blocked risk-control items generated.\n"}

## Monitor

${queue.monitorItems.length > 0 ? queue.monitorItems.map(renderItem).join("\n") : "No monitor-only items generated.\n"}`;
}

function renderItem(item: SeoQueueItem): string {
  return `### ${item.priority.toUpperCase()} - ${item.opportunityType}: ${item.page?.title ?? item.page?.url ?? item.brandName ?? "Unmapped item"}

- Draft only: yes
- Needs human review: ${item.needs_human_review ? "yes" : "no"}
- Status: ${item.status}
- Confidence: ${item.confidence}
- False-positive risk: ${item.falsePositiveRisk}
- Page: ${item.page?.url ?? item.page?.slug ?? "not mapped"}
- Brand: ${item.brandName ?? "not applicable"}
- Suggested next action: ${item.suggestedNextAction}
- Source signals: ${item.sourceSignals.map((signal) => `${signal.report}/${signal.signalType}`).join(", ")}
`;
}

if (isDirectRun(import.meta.url)) {
  await buildSeoIntelligenceBrain();
}
