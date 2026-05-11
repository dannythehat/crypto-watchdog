import { isDirectRun, readJson, writeJson, writeText } from "../src/lib/fs.js";
import { logger } from "../src/lib/logger.js";

type Department =
  | "Command"
  | "Content"
  | "SEO"
  | "Research"
  | "Affiliates"
  | "Backlinks"
  | "Analytics"
  | "Trust & Safety"
  | "Media"
  | "Social"
  | "Operations"
  | "Approvals";

type QueueSection =
  | "safeDraftsReady"
  | "needsDannyApproval"
  | "blockedRiskyItems"
  | "monitorOnly"
  | "performanceChanges"
  | "moneyOpportunities";

type Priority = "low" | "medium" | "high" | "urgent";
type RiskLevel = "low" | "medium" | "high";
type Confidence = "low" | "medium" | "high" | "unknown";
type FalsePositiveRisk = "low" | "medium" | "high" | "unknown";
type StatusStage = "detected" | "suspected" | "verified" | "recommended" | "approved" | "applied";

interface SourceReport {
  name: string;
  path: string;
}

interface QueueItem {
  id: string;
  title: string;
  sourceReport: string;
  section: QueueSection;
  department: Department;
  priority: Priority;
  riskLevel: RiskLevel;
  confidence: Confidence;
  falsePositiveRisk: FalsePositiveRisk;
  statusStage: StatusStage;
  needsHumanReview: boolean;
  needsDannyApproval: boolean;
  canAutoDraft: boolean;
  canAutoApply: false;
  suggestedNextAction: string;
  evidenceSummary: string;
  relatedUrl?: string;
  relatedPath?: string;
}

interface ManagerSummary {
  department: Department;
  managerAgentId: string;
  itemCount: number;
  urgentCount: number;
  highRiskCount: number;
  needsDannyApprovalCount: number;
  blockedCount: number;
  monitorCount: number;
  topSignals: string[];
  summary: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

const queueVersion = "1.0.0";
const outputJson = "data/reports/master_command_queue.json";
const outputMd = "data/reports/master_command_queue.md";
const topPriorityLimit = 10;

const departments: Department[] = [
  "Command",
  "Content",
  "SEO",
  "Research",
  "Affiliates",
  "Backlinks",
  "Analytics",
  "Trust & Safety",
  "Media",
  "Social",
  "Operations",
  "Approvals",
];

const sourceReports: SourceReport[] = [
  { name: "seo_intelligence_queue", path: "data/reports/seo_intelligence_queue.json" },
  { name: "agent_registry_report", path: "data/reports/agent_registry_report.json" },
  { name: "research_duplicate_guard_report", path: "data/reports/research_duplicate_guard_report.json" },
  { name: "metadata_suggestions", path: "data/reports/metadata_suggestions.json" },
  { name: "internal_link_placement_suggestions", path: "data/reports/internal_link_placement_suggestions.json" },
  { name: "affiliate_placement_suggestions", path: "data/reports/affiliate_placement_suggestions.json" },
  { name: "offer_tracker_report", path: "data/reports/offer_tracker_report.json" },
  { name: "search_console_report", path: "data/reports/search_console_report.json" },
  { name: "ga4_report", path: "data/reports/ga4_report.json" },
  { name: "rendered_page_verification", path: "data/reports/rendered_page_verification.json" },
  { name: "priority_action_queue", path: "data/reports/priority_action_queue.json" },
  { name: "audit_confidence_summary", path: "data/reports/audit_confidence_summary.json" },
];

const safetyNotes = [
  "Master Command Queue v1 is read-only and report-only.",
  "It never publishes, edits live pages, writes to Supabase, writes to Google, calls APIs, or stores secrets.",
  "Nothing in v1 is approved or applied.",
  "Every item keeps canAutoApply set to false.",
  "Affiliate placements, trust/rating-impacting work, scam/fraud wording, legal/policy wording, and high-risk claims require Danny approval.",
  "The queue separates detected, suspected, verified, recommended, approved, and applied stages so reports do not overclaim certainty.",
];

export async function buildMasterCommandQueue(): Promise<QueueItem[]> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const items = dedupeItems(loadedReports.flatMap((report) => itemsFromReport(report)));
  const visibleItems = items.sort(compareItems);

  const safeDraftsReady = visibleItems.filter((item) => item.section === "safeDraftsReady").slice(0, 40);
  const needsDannyApproval = visibleItems.filter((item) => item.needsDannyApproval || item.section === "needsDannyApproval").slice(0, 50);
  const blockedRiskyItems = visibleItems.filter((item) => item.section === "blockedRiskyItems").slice(0, 30);
  const monitorOnly = visibleItems.filter((item) => item.section === "monitorOnly").slice(0, 30);
  const performanceChanges = visibleItems.filter((item) => item.section === "performanceChanges" || item.department === "Analytics").slice(0, 30);
  const moneyOpportunities = visibleItems.filter((item) => item.section === "moneyOpportunities" || item.department === "Affiliates").slice(0, 30);
  const topPriorities = visibleItems
    .filter((item) => item.section !== "monitorOnly")
    .slice(0, topPriorityLimit);
  const managerSummaries = departments.map((department) => managerSummary(department, visibleItems));

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Master Command Queue v1 for Danny. This local report combines existing Content Brain reports into draft-only daily command sections. It never applies changes, approves work, publishes, edits live site files, writes to Supabase, writes to Google, calls APIs, or stores secrets.",
    queueVersion,
    sourceReportsRead,
    missingReports,
    summaryCounts: {
      uniqueItemCount: visibleItems.length,
      safeDraftsReadyCount: safeDraftsReady.length,
      needsDannyApprovalCount: needsDannyApproval.length,
      blockedRiskyItemCount: blockedRiskyItems.length,
      monitorOnlyCount: monitorOnly.length,
      performanceChangeCount: performanceChanges.length,
      moneyOpportunityCount: moneyOpportunities.length,
      topPriorityCount: topPriorities.length,
    },
    stageCounts: countBy(visibleItems, (item) => item.statusStage, ["detected", "suspected", "verified", "recommended", "approved", "applied"]),
    riskCounts: countBy(visibleItems, (item) => item.riskLevel, ["low", "medium", "high"]),
    approvalCounts: {
      needsHumanReviewCount: visibleItems.filter((item) => item.needsHumanReview).length,
      needsDannyApprovalCount: visibleItems.filter((item) => item.needsDannyApproval).length,
      canAutoDraftCount: visibleItems.filter((item) => item.canAutoDraft).length,
      canAutoApplyCount: 0,
      approvedCount: 0,
      appliedCount: 0,
    },
    safeDraftsReady,
    needsDannyApproval,
    blockedRiskyItems,
    monitorOnly,
    performanceChanges,
    moneyOpportunities,
    managerSummaries,
    topPriorities,
    safetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Master command queue written", {
    items: visibleItems.length,
    sourceReportsRead: sourceReportsRead.length,
    missingReports: missingReports.length,
    outputJson,
    outputMd,
  });
  return visibleItems;
}

async function loadReports(): Promise<{ loadedReports: LoadedReport[]; sourceReportsRead: string[]; missingReports: string[] }> {
  const loadedReports: LoadedReport[] = [];
  const sourceReportsRead: string[] = [];
  const missingReports: string[] = [];

  for (const source of sourceReports) {
    try {
      const data = await readJson<unknown>(source.path);
      loadedReports.push({ source, data });
      sourceReportsRead.push(source.name);
    } catch {
      missingReports.push(source.name);
    }
  }

  return { loadedReports, sourceReportsRead, missingReports };
}

function itemsFromReport(report: LoadedReport): QueueItem[] {
  switch (report.source.name) {
    case "seo_intelligence_queue":
      return seoItems(report.data);
    case "research_duplicate_guard_report":
      return researchItems(report.data);
    case "metadata_suggestions":
      return metadataItems(report.data);
    case "internal_link_placement_suggestions":
      return internalLinkItems(report.data);
    case "affiliate_placement_suggestions":
      return affiliateItems(report.data);
    case "offer_tracker_report":
      return offerItems(report.data);
    case "search_console_report":
      return searchConsoleItems(report.data);
    case "ga4_report":
      return ga4Items(report.data);
    case "rendered_page_verification":
      return renderedVerifierItems(report.data);
    case "priority_action_queue":
      return priorityQueueItems(report.data);
    case "audit_confidence_summary":
      return auditConfidenceItems(report.data);
    case "agent_registry_report":
      return agentRegistryItems(report.data);
    default:
      return [];
  }
}

function seoItems(report: unknown): QueueItem[] {
  const actionQueue = arrayAt(report, "actionQueue").concat(arrayAt(report, "items"));
  const blocked = arrayAt(report, "blockedItems");
  const monitor = arrayAt(report, "monitorItems");
  const seen = new Set<unknown>();
  const items: QueueItem[] = [];

  for (const item of actionQueue) {
    if (seen.has(item)) continue;
    seen.add(item);
    const type = stringAt(item, "opportunityType") ?? "seo_opportunity";
    const page = objectAt(item, "page");
    items.push(queueItem({
      id: idFor("seo", type, pageKey(page) ?? stringAt(item, "brandName") ?? arrayAt(item, "sourceSignals").length.toString()),
      title: titleFromPage(page) ?? titleCase(type),
      sourceReport: "seo_intelligence_queue",
      section: sectionForOpportunity(type, stringAt(item, "status")),
      department: departmentForOpportunity(type),
      priority: mapSeoPriority(stringAt(item, "priority")),
      riskLevel: riskFromItem(item, type),
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "recommended",
      needsHumanReview: true,
      needsDannyApproval: needsApprovalFor(type, riskFromItem(item, type), stringAt(item, "status")),
      canAutoDraft: stringAt(item, "status") === "safe_draft" && riskFromItem(item, type) !== "high",
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Review the SEO Intelligence Brain recommendation and prepare a draft-only follow-up if appropriate.",
      evidenceSummary: sourceSignalSummary(item) ?? `${titleCase(type)} signal from SEO Intelligence Brain.`,
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    }));
  }

  for (const item of blocked) {
    const type = stringAt(item, "opportunityType") ?? "blocked_risk";
    const page = objectAt(item, "page");
    items.push(queueItem({
      id: idFor("seo-blocked", type, pageKey(page) ?? stringAt(item, "brandName") ?? items.length.toString()),
      title: `Blocked risk control: ${titleFromPage(page) ?? stringAt(item, "brandName") ?? titleCase(type)}`,
      sourceReport: "seo_intelligence_queue",
      section: "blockedRiskyItems",
      department: departmentForOpportunity(type),
      priority: "urgent",
      riskLevel: "high",
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "detected",
      needsHumanReview: true,
      needsDannyApproval: true,
      canAutoDraft: false,
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Keep blocked until evidence, safety, or Danny approval conditions are met.",
      evidenceSummary: sourceSignalSummary(item) ?? "SEO Intelligence Brain separated this as a blocked/risk-control item.",
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    }));
  }

  for (const item of monitor) {
    const type = stringAt(item, "opportunityType") ?? "monitor";
    const page = objectAt(item, "page");
    items.push(queueItem({
      id: idFor("seo-monitor", type, pageKey(page) ?? stringAt(item, "brandName") ?? items.length.toString()),
      title: `Monitor: ${titleFromPage(page) ?? stringAt(item, "brandName") ?? titleCase(type)}`,
      sourceReport: "seo_intelligence_queue",
      section: "monitorOnly",
      department: departmentForOpportunity(type),
      priority: "low",
      riskLevel: "low",
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "detected",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: false,
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Monitor only; no action needed today.",
      evidenceSummary: sourceSignalSummary(item) ?? "SEO Intelligence Brain marked this as monitor-only.",
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    }));
  }

  return items;
}

function researchItems(report: unknown): QueueItem[] {
  return arrayAt(report, "items").map((item, index) => {
    const classification = stringAt(item, "classification") ?? "needs_research";
    const title = stringAt(item, "title") ?? stringAt(item, "ideaTitle") ?? `Research idea ${index + 1}`;
    const blocked = classification === "blocked_until_evidence";
    const updateExisting = classification === "update_existing_page_instead" || classification === "near_duplicate" || classification === "keyword_cannibalisation_risk";
    const risk = blocked ? "high" : updateExisting ? "medium" : "low";
    return queueItem({
      id: idFor("research", classification, title),
      title,
      sourceReport: "research_duplicate_guard_report",
      section: blocked ? "blockedRiskyItems" : updateExisting ? "needsDannyApproval" : "safeDraftsReady",
      department: "Research",
      priority: blocked ? "urgent" : updateExisting ? "high" : "medium",
      riskLevel: risk,
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: blocked ? "suspected" : "recommended",
      needsHumanReview: true,
      needsDannyApproval: blocked || updateExisting,
      canAutoDraft: !blocked && !updateExisting,
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Review the proposed idea before drafting.",
      evidenceSummary: stringAt(item, "similarityReason") ?? `Research Guard classification: ${classification}.`,
      relatedUrl: stringAt(item, "url"),
      relatedPath: stringAt(item, "slug") ?? stringAt(item, "path"),
    });
  });
}

function metadataItems(report: unknown): QueueItem[] {
  return arrayAt(report, "items").slice(0, 30).flatMap((item, index) => {
    const page = pageLike(item);
    const title = titleFromPage(page) ?? `Metadata suggestion ${index + 1}`;
    const outputs: QueueItem[] = [];
    if (stringAt(item, "seoTitleDraft") || stringAt(item, "metaDescriptionDraft")) {
      outputs.push(queueItem({
        id: idFor("metadata", "draft", pageKey(page) ?? title),
        title: `Draft metadata: ${title}`,
        sourceReport: "metadata_suggestions",
        section: "safeDraftsReady",
        department: "SEO",
        priority: "medium",
        riskLevel: "low",
        confidence: "medium",
        falsePositiveRisk: "medium",
        statusStage: "recommended",
        needsHumanReview: true,
        needsDannyApproval: false,
        canAutoDraft: true,
        suggestedNextAction: "Prepare metadata as a draft suggestion only, then review before applying anywhere.",
        evidenceSummary: "Metadata Engine produced local draft title/description/social metadata suggestions.",
        relatedUrl: stringAt(page, "url"),
        relatedPath: stringAt(page, "slug"),
      }));
    }
    if (arrayAt(item, "imageAltTextSuggestions").length > 0 || arrayAt(item, "imageFilenameSuggestions").length > 0) {
      outputs.push(queueItem({
        id: idFor("metadata-media", "draft", pageKey(page) ?? title),
        title: `Review image metadata: ${title}`,
        sourceReport: "metadata_suggestions",
        section: "safeDraftsReady",
        department: "Media",
        priority: "low",
        riskLevel: "low",
        confidence: "medium",
        falsePositiveRisk: "medium",
        statusStage: "recommended",
        needsHumanReview: true,
        needsDannyApproval: false,
        canAutoDraft: true,
        suggestedNextAction: "Review image alt text and filename suggestions as draft-only accessibility/media improvements.",
        evidenceSummary: "Metadata Engine found local image alt text or filename suggestions.",
        relatedUrl: stringAt(page, "url"),
        relatedPath: stringAt(page, "slug"),
      }));
    }
    return outputs;
  });
}

function internalLinkItems(report: unknown): QueueItem[] {
  const recommendations = arrayAt(report, "recommendations").slice(0, 40).map((item, index) => {
    const sourcePage = objectAt(item, "sourcePage");
    const targetTitle = stringAt(item, "targetPage", "title") ?? stringAt(item, "targetPage", "slug") ?? "related page";
    const confidence = confidenceAt(item, "confidence", "unknown");
    return queueItem({
      id: idFor("internal-link", pageKey(sourcePage) ?? index.toString(), targetTitle),
      title: `Internal link draft: ${titleFromPage(sourcePage) ?? "source page"} -> ${targetTitle}`,
      sourceReport: "internal_link_placement_suggestions",
      section: confidence === "low" ? "monitorOnly" : "safeDraftsReady",
      department: "SEO",
      priority: confidence === "high" ? "medium" : "low",
      riskLevel: confidence === "low" ? "medium" : "low",
      confidence,
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "recommended",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: confidence !== "low",
      suggestedNextAction: stringAt(item, "suggestedPlacementContext") ?? "Review the suggested in-content placement and anchor text before drafting.",
      evidenceSummary: stringAt(item, "reason") ?? "Internal Link Placement Brain found a local contextual link opportunity.",
      relatedUrl: stringAt(sourcePage, "url"),
      relatedPath: stringAt(sourcePage, "slug"),
    });
  });

  const orphanPages = arrayAt(report, "orphanOrThinlyLinkedPages").slice(0, 20).map((item, index) => {
    const page = pageLike(item);
    return queueItem({
      id: idFor("thin-linked", pageKey(page) ?? index.toString()),
      title: `Thin internal linking review: ${titleFromPage(page) ?? "page"}`,
      sourceReport: "internal_link_placement_suggestions",
      section: "safeDraftsReady",
      department: "SEO",
      priority: "medium",
      riskLevel: "medium",
      confidence: "medium",
      falsePositiveRisk: "medium",
      statusStage: "suspected",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: true,
      suggestedNextAction: "Review whether the page deserves natural in-content support from related pages.",
      evidenceSummary: "Internal Link Placement Brain marked this as orphaned or thinly linked.",
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    });
  });

  return recommendations.concat(orphanPages);
}

function affiliateItems(report: unknown): QueueItem[] {
  const recommendations = arrayAt(report, "recommendations").slice(0, 30).map((item, index) => {
    const page = objectAt(item, "sourcePage");
    const brand = stringAt(item, "affiliateBrand") ?? stringAt(item, "brandName") ?? "affiliate programme";
    return queueItem({
      id: idFor("affiliate", pageKey(page) ?? index.toString(), brand),
      title: `Affiliate placement review: ${brand}`,
      sourceReport: "affiliate_placement_suggestions",
      section: "moneyOpportunities",
      department: "Affiliates",
      priority: "high",
      riskLevel: "medium",
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "recommended",
      needsHumanReview: true,
      needsDannyApproval: true,
      canAutoDraft: false,
      suggestedNextAction: stringAt(item, "suggestedCtaText") ?? "Review placement, disclosure, page risk, and offer status before drafting any affiliate CTA.",
      evidenceSummary: stringAt(item, "reason") ?? "Affiliate Placement Brain found a possible revenue placement that needs approval.",
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    });
  });

  const blocked = arrayAt(report, "blockedPlacements").slice(0, 30).map((item, index) => {
    const page = objectAt(item, "sourcePage");
    const brand = stringAt(item, "affiliateBrand") ?? stringAt(item, "brandName") ?? "affiliate programme";
    return queueItem({
      id: idFor("affiliate-blocked", pageKey(page) ?? index.toString(), brand),
      title: `Blocked affiliate placement: ${brand}`,
      sourceReport: "affiliate_placement_suggestions",
      section: "blockedRiskyItems",
      department: "Affiliates",
      priority: "urgent",
      riskLevel: "high",
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "detected",
      needsHumanReview: true,
      needsDannyApproval: true,
      canAutoDraft: false,
      suggestedNextAction: "Do not draft this affiliate placement unless Danny manually approves after evidence and risk review.",
      evidenceSummary: arrayAt(item, "riskFlags").join(", ") || "Affiliate Placement Brain blocked this context.",
      relatedUrl: stringAt(page, "url"),
      relatedPath: stringAt(page, "slug"),
    });
  });

  return recommendations.concat(blocked);
}

function offerItems(report: unknown): QueueItem[] {
  return arrayAt(report, "items").slice(0, 40).map((item, index) => {
    const brand = stringAt(item, "brandName") ?? `offer ${index + 1}`;
    const classification = stringAt(item, "classification") ?? "needs_review";
    const useStatus = stringAt(item, "useStatus") ?? "needs_review";
    const blocked = useStatus === "blocked" || classification === "expired" || classification === "blocked";
    const review = blocked || useStatus === "needs_review" || classification === "expires_soon" || classification === "stale_check" || classification === "needs_review";
    return queueItem({
      id: idFor("offer", brand, classification),
      title: `Offer status review: ${brand}`,
      sourceReport: "offer_tracker_report",
      section: blocked ? "blockedRiskyItems" : "moneyOpportunities",
      department: "Affiliates",
      priority: blocked ? "urgent" : review ? "high" : "low",
      riskLevel: blocked ? "high" : review ? "medium" : "low",
      confidence: "high",
      falsePositiveRisk: blocked ? "low" : "medium",
      statusStage: review ? "recommended" : "detected",
      needsHumanReview: true,
      needsDannyApproval: review,
      canAutoDraft: false,
      suggestedNextAction: arrayAt(item, "recommendedActions").join(", ") || "Review offer terms before using in any CTA.",
      evidenceSummary: `Offer Tracker classified this record as ${classification} with use status ${useStatus}.`,
    });
  });
}

function searchConsoleItems(report: unknown): QueueItem[] {
  return arrayAt(report, "recommendations").slice(0, 40).map((item, index) => {
    const type = stringAt(item, "type") ?? "search_console_opportunity";
    return queueItem({
      id: idFor("gsc", type, stringAt(item, "page") ?? stringAt(item, "query") ?? index.toString()),
      title: `Search opportunity: ${stringAt(item, "query") ?? stringAt(item, "page") ?? titleCase(type)}`,
      sourceReport: "search_console_report",
      section: "performanceChanges",
      department: type.includes("metadata") || type.includes("ctr") ? "SEO" : "Analytics",
      priority: numberAt(item, "impressions") >= 1000 ? "high" : "medium",
      riskLevel: "medium",
      confidence: "medium",
      falsePositiveRisk: "medium",
      statusStage: "suspected",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: true,
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Review the local Search Console export signal before drafting metadata or content refresh ideas.",
      evidenceSummary: stringAt(item, "reason") ?? "Search Console import found an SEO performance opportunity.",
      relatedUrl: stringAt(item, "page"),
    });
  });
}

function ga4Items(report: unknown): QueueItem[] {
  return arrayAt(report, "recommendations").slice(0, 40).map((item, index) => {
    const type = stringAt(item, "type") ?? "ga4_opportunity";
    const affiliateRelated = type.includes("affiliate") || type.includes("conversion") || type.includes("cta");
    return queueItem({
      id: idFor("ga4", type, stringAt(item, "page") ?? index.toString()),
      title: `GA4 review: ${stringAt(item, "pageTitle") ?? stringAt(item, "page") ?? titleCase(type)}`,
      sourceReport: "ga4_report",
      section: affiliateRelated ? "moneyOpportunities" : "performanceChanges",
      department: affiliateRelated ? "Affiliates" : "Analytics",
      priority: numberAt(item, "sessions") >= 500 ? "high" : "medium",
      riskLevel: affiliateRelated ? "medium" : "low",
      confidence: "medium",
      falsePositiveRisk: "medium",
      statusStage: "suspected",
      needsHumanReview: true,
      needsDannyApproval: affiliateRelated,
      canAutoDraft: !affiliateRelated,
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "Review the local GA4 export signal before drafting content, CTA, or placement changes.",
      evidenceSummary: stringAt(item, "reason") ?? "GA4 import found a page performance or engagement signal.",
      relatedUrl: stringAt(item, "page"),
    });
  });
}

function renderedVerifierItems(report: unknown): QueueItem[] {
  return arrayAt(report, "results").slice(0, 50).flatMap((item, index) => {
    const page = pageLike(item);
    const facts = objectAt(item, "renderedFacts");
    const outputs: QueueItem[] = [];
    if (numberAt(facts, "imagesMissingAlt") > 0) {
      outputs.push(queueItem({
        id: idFor("rendered-alt", pageKey(page) ?? index.toString()),
        title: `Rendered image alt review: ${titleFromPage(page) ?? "page"}`,
        sourceReport: "rendered_page_verification",
        section: "safeDraftsReady",
        department: "Media",
        priority: "medium",
        riskLevel: "medium",
        confidence: "high",
        falsePositiveRisk: "medium",
        statusStage: "suspected",
        needsHumanReview: true,
        needsDannyApproval: false,
        canAutoDraft: true,
        suggestedNextAction: "Review rendered missing-alt evidence and draft accessibility/media improvements if confirmed.",
        evidenceSummary: `${numberAt(facts, "imagesMissingAlt")} rendered images appear to be missing alt text.`,
        relatedUrl: stringAt(page, "url"),
        relatedPath: stringAt(page, "slug"),
      }));
    }
    if (arrayAt(facts, "codeArtifactTokens").length > 0) {
      outputs.push(queueItem({
        id: idFor("rendered-code", pageKey(page) ?? index.toString()),
        title: `Rendered artefact review: ${titleFromPage(page) ?? "page"}`,
        sourceReport: "rendered_page_verification",
        section: "needsDannyApproval",
        department: "Trust & Safety",
        priority: "high",
        riskLevel: "medium",
        confidence: "high",
        falsePositiveRisk: "medium",
        statusStage: "suspected",
        needsHumanReview: true,
        needsDannyApproval: true,
        canAutoDraft: false,
        suggestedNextAction: "Review the rendered page before drafting any fix; do not assume the artefact is confirmed.",
        evidenceSummary: `Rendered verifier detected possible code artefact tokens: ${arrayAt(facts, "codeArtifactTokens").join(", ")}.`,
        relatedUrl: stringAt(page, "url"),
        relatedPath: stringAt(page, "slug"),
      }));
    }
    return outputs;
  });
}

function priorityQueueItems(report: unknown): QueueItem[] {
  return genericQueueItems(report, "priority_action_queue", "Operations", "needsDannyApproval");
}

function auditConfidenceItems(report: unknown): QueueItem[] {
  const highRiskCount = numberAt(report, "summary", "highFalsePositiveRiskCount") || numberAt(report, "highFalsePositiveRiskCount");
  const lowConfidenceCount = numberAt(report, "summary", "lowConfidenceCount") || numberAt(report, "lowConfidenceCount");
  if (highRiskCount === 0 && lowConfidenceCount === 0) {
    return [];
  }
  return [
    queueItem({
      id: "audit-confidence-review",
      title: "Audit confidence review",
      sourceReport: "audit_confidence_summary",
      section: "monitorOnly",
      department: "Trust & Safety",
      priority: highRiskCount > 0 ? "medium" : "low",
      riskLevel: highRiskCount > 0 ? "medium" : "low",
      confidence: "medium",
      falsePositiveRisk: highRiskCount > 0 ? "medium" : "unknown",
      statusStage: "detected",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: false,
      suggestedNextAction: "Use confidence and false-positive-risk summaries to triage local findings before drafting fixes.",
      evidenceSummary: `Audit confidence summary includes ${highRiskCount} high false-positive-risk and ${lowConfidenceCount} low-confidence signals.`,
    }),
  ];
}

function agentRegistryItems(report: unknown): QueueItem[] {
  const activeAgentCount = numberAt(report, "activeAgentCount");
  const plannedAgentCount = numberAt(report, "plannedAgentCount");
  if (activeAgentCount === 0 && plannedAgentCount === 0) {
    return [];
  }
  return [
    queueItem({
      id: "agent-registry-manager-map",
      title: "Watchdog HQ agent registry is available",
      sourceReport: "agent_registry_report",
      section: "monitorOnly",
      department: "Command",
      priority: "low",
      riskLevel: "low",
      confidence: "high",
      falsePositiveRisk: "low",
      statusStage: "detected",
      needsHumanReview: true,
      needsDannyApproval: false,
      canAutoDraft: false,
      suggestedNextAction: "Use department manager ownership when reviewing today's queue.",
      evidenceSummary: `Agent Registry reports ${activeAgentCount} active agents and ${plannedAgentCount} planned agents.`,
    }),
  ];
}

function genericQueueItems(report: unknown, sourceReport: string, department: Department, section: QueueSection): QueueItem[] {
  const records = firstArray(report, ["items", "queue", "actionQueue", "recommendations", "findings"]).slice(0, 30);
  return records.map((item, index) => {
    const title = stringAt(item, "title") ?? stringAt(item, "message") ?? stringAt(item, "recommendation") ?? `${sourceReport} item ${index + 1}`;
    const risk = riskAt(item, "riskLevel", "medium");
    return queueItem({
      id: idFor(sourceReport, title, index.toString()),
      title,
      sourceReport,
      section,
      department,
      priority: priorityAt(item, "priority", risk === "high" ? "high" : "medium"),
      riskLevel: risk,
      confidence: confidenceAt(item, "confidence", "unknown"),
      falsePositiveRisk: falsePositiveAt(item, "falsePositiveRisk", "unknown"),
      statusStage: "recommended",
      needsHumanReview: true,
      needsDannyApproval: risk === "high" || section === "needsDannyApproval",
      canAutoDraft: risk !== "high" && section !== "needsDannyApproval",
      suggestedNextAction: stringAt(item, "suggestedNextAction") ?? stringAt(item, "recommendation") ?? "Review the source report item before drafting any action.",
      evidenceSummary: stringAt(item, "evidenceSummary") ?? stringAt(item, "message") ?? "Imported from a local report.",
      relatedUrl: stringAt(item, "url") ?? stringAt(item, "relatedUrl"),
      relatedPath: stringAt(item, "path") ?? stringAt(item, "relatedPath") ?? stringAt(item, "slug"),
    });
  });
}

function queueItem(input: Omit<QueueItem, "canAutoApply">): QueueItem {
  return { ...input, canAutoApply: false };
}

function managerSummary(department: Department, items: QueueItem[]): ManagerSummary {
  const owned = items.filter((item) => item.department === department);
  const topSignals = owned.slice(0, 5).map((item) => `${item.priority}: ${item.title}`);
  return {
    department,
    managerAgentId: `${slugify(department)}-ai-manager`,
    itemCount: owned.length,
    urgentCount: owned.filter((item) => item.priority === "urgent").length,
    highRiskCount: owned.filter((item) => item.riskLevel === "high").length,
    needsDannyApprovalCount: owned.filter((item) => item.needsDannyApproval).length,
    blockedCount: owned.filter((item) => item.section === "blockedRiskyItems").length,
    monitorCount: owned.filter((item) => item.section === "monitorOnly").length,
    topSignals,
    summary: owned.length === 0
      ? `${department} has no command queue items from the available local reports.`
      : `${department} has ${owned.length} local report signal(s), including ${owned.filter((item) => item.needsDannyApproval).length} needing Danny approval and ${owned.filter((item) => item.section === "blockedRiskyItems").length} blocked/risk-control item(s).`,
  };
}

function renderMarkdown(report: {
  generatedAt: string;
  queueVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  summaryCounts: Record<string, number>;
  stageCounts: Record<string, number>;
  riskCounts: Record<string, number>;
  approvalCounts: Record<string, number>;
  safeDraftsReady: QueueItem[];
  needsDannyApproval: QueueItem[];
  blockedRiskyItems: QueueItem[];
  monitorOnly: QueueItem[];
  performanceChanges: QueueItem[];
  moneyOpportunities: QueueItem[];
  managerSummaries: ManagerSummary[];
  topPriorities: QueueItem[];
  safetyNotes: string[];
}): string {
  return [
    "# Master Command Queue v1",
    "",
    "## Morning Dashboard Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Queue version: ${report.queueVersion}`,
    `Reports read: ${report.sourceReportsRead.length}`,
    `Missing reports: ${report.missingReports.length}`,
    `Unique items: ${report.summaryCounts.uniqueItemCount}`,
    `Approved count: ${report.approvalCounts.approvedCount}`,
    `Applied count: ${report.approvalCounts.appliedCount}`,
    "",
    "## Top Priorities",
    "",
    renderItems(report.topPriorities),
    "",
    "## Safe Drafts Ready",
    "",
    renderItems(report.safeDraftsReady.slice(0, 15)),
    "",
    "## Needs Danny Approval",
    "",
    renderItems(report.needsDannyApproval.slice(0, 15)),
    "",
    "## Blocked / Risky Items",
    "",
    renderItems(report.blockedRiskyItems.slice(0, 15)),
    "",
    "## Monitor Only",
    "",
    renderItems(report.monitorOnly.slice(0, 15)),
    "",
    "## Performance Changes",
    "",
    renderItems(report.performanceChanges.slice(0, 15)),
    "",
    "## Money Opportunities",
    "",
    renderItems(report.moneyOpportunities.slice(0, 15)),
    "",
    "## Department Manager Summaries",
    "",
    ...report.managerSummaries.map((summary) => `- ${summary.department}: ${summary.summary}`),
    "",
    "## Missing Reports",
    "",
    report.missingReports.length ? report.missingReports.map((name) => `- ${name}`).join("\n") : "No configured reports were missing.",
    "",
    "## Safety Notes",
    "",
    report.safetyNotes.map((note) => `- ${note}`).join("\n"),
    "",
    "## Next Steps",
    "",
    "- Review top priorities first, then approval-required and blocked items.",
    "- Prepare only draft work from safe draft items.",
    "- Keep affiliate, trust, legal, and high-risk claim decisions behind Danny approval.",
    "- Do not treat detected or suspected items as verified without source evidence.",
  ].join("\n");
}

function renderItems(items: QueueItem[]): string {
  if (items.length === 0) {
    return "No items in this section from the available local reports.";
  }
  return items.map((item) => [
    `- ${item.title}`,
    `  - Source: ${item.sourceReport}`,
    `  - Department: ${item.department}`,
    `  - Priority/risk/stage: ${item.priority} / ${item.riskLevel} / ${item.statusStage}`,
    `  - Next action: ${item.suggestedNextAction}`,
  ].join("\n")).join("\n");
}

function compareItems(a: QueueItem, b: QueueItem): number {
  return priorityRank(b.priority) - priorityRank(a.priority)
    || riskRank(b.riskLevel) - riskRank(a.riskLevel)
    || Number(b.needsDannyApproval) - Number(a.needsDannyApproval)
    || confidenceRank(b.confidence) - confidenceRank(a.confidence)
    || a.title.localeCompare(b.title);
}

function dedupeItems(items: QueueItem[]): QueueItem[] {
  const seen = new Set<string>();
  const output: QueueItem[] = [];
  for (const item of items) {
    const key = item.id;
    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }
  return output;
}

function sectionForOpportunity(type: string, status?: string): QueueSection {
  if (status === "blocked") return "blockedRiskyItems";
  if (status === "monitor") return "monitorOnly";
  if (type.includes("affiliate") || type.includes("offer")) return "moneyOpportunities";
  if (type.includes("ctr") || type.includes("page_2") || type.includes("engagement")) return "performanceChanges";
  if (type.includes("trust") || type.includes("evidence")) return "needsDannyApproval";
  return "safeDraftsReady";
}

function departmentForOpportunity(type: string): Department {
  if (type.includes("affiliate") || type.includes("offer")) return "Affiliates";
  if (type.includes("ctr") || type.includes("page_2") || type.includes("engagement")) return "Analytics";
  if (type.includes("metadata") || type.includes("internal_link")) return "SEO";
  if (type.includes("content")) return "Content";
  if (type.includes("media")) return "Media";
  if (type.includes("trust") || type.includes("evidence")) return "Trust & Safety";
  return "Command";
}

function needsApprovalFor(type: string, risk: RiskLevel, status?: string): boolean {
  return risk === "high"
    || status === "blocked"
    || type.includes("affiliate")
    || type.includes("offer")
    || type.includes("trust")
    || type.includes("evidence")
    || type.includes("legal")
    || type.includes("claim");
}

function riskFromItem(item: unknown, type: string): RiskLevel {
  const direct = riskAt(item, "riskLevel", "low");
  if (direct !== "low") return direct;
  if (type.includes("affiliate") || type.includes("offer") || type.includes("trust") || type.includes("evidence")) return "medium";
  return "low";
}

function sourceSignalSummary(item: unknown): string | undefined {
  const signals = arrayAt(item, "sourceSignals");
  if (signals.length === 0) return undefined;
  return signals
    .slice(0, 3)
    .map((signal) => stringAt(signal, "detail") ?? stringAt(signal, "signalType"))
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

function pageLike(item: unknown): Record<string, unknown> {
  const page = objectAt(item, "page");
  if (Object.keys(page).length > 0) return page;
  return isRecord(item) ? item : {};
}

function pageKey(page: unknown): string | undefined {
  return stringAt(page, "url") ?? stringAt(page, "slug") ?? stringAt(page, "id") ?? stringAt(page, "path");
}

function titleFromPage(page: unknown): string | undefined {
  return stringAt(page, "title") ?? stringAt(page, "pageTitle") ?? stringAt(page, "slug") ?? stringAt(page, "url");
}

function firstArray(record: unknown, keys: string[]): unknown[] {
  for (const key of keys) {
    const found = arrayAt(record, key);
    if (found.length > 0) return found;
  }
  return [];
}

function arrayAt(record: unknown, ...path: string[]): unknown[] {
  const value = valueAt(record, path);
  return Array.isArray(value) ? value : [];
}

function objectAt(record: unknown, ...path: string[]): Record<string, unknown> {
  const value = valueAt(record, path);
  return isRecord(value) ? value : {};
}

function stringAt(record: unknown, ...path: string[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberAt(record: unknown, ...path: string[]): number {
  const value = valueAt(record, path);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function confidenceAt(record: unknown, key: string, fallback: Confidence): Confidence {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function falsePositiveAt(record: unknown, key: string, fallback: FalsePositiveRisk): FalsePositiveRisk {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function riskAt(record: unknown, key: string, fallback: RiskLevel): RiskLevel {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function priorityAt(record: unknown, key: string, fallback: Priority): Priority {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" || value === "urgent" ? value : fallback;
}

function mapSeoPriority(value?: string): Priority {
  if (value === "critical") return "urgent";
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function valueAt(record: unknown, path: string[]): unknown {
  let current = record;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function countBy<T, K extends string>(items: T[], getKey: (item: T) => K, keys: K[]): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
  for (const item of items) {
    counts[getKey(item)] += 1;
  }
  return counts;
}

function priorityRank(priority: Priority): number {
  return { urgent: 4, high: 3, medium: 2, low: 1 }[priority];
}

function riskRank(risk: RiskLevel): number {
  return { high: 3, medium: 2, low: 1 }[risk];
}

function confidenceRank(confidence: Confidence): number {
  return { high: 3, medium: 2, low: 1, unknown: 0 }[confidence];
}

function idFor(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 120);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  buildMasterCommandQueue().catch((error) => {
    logger.error("Master command queue failed", { error });
    process.exitCode = 1;
  });
}
