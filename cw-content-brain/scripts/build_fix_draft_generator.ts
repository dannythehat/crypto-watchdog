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

type DraftType =
  | "meta_title"
  | "meta_description"
  | "faq"
  | "internal_link"
  | "image_alt_text"
  | "refresh_outline"
  | "evidence_checklist"
  | "affiliate_cta"
  | "blocked_item_research"
  | "research_brief";

type RiskLevel = "low" | "medium" | "high";
type StatusStage = "detected" | "suspected" | "recommended";

interface SourceReport {
  name: string;
  path: string;
}

interface QueueItem {
  id: string;
  title: string;
  sourceReport: string;
  section: string;
  department: Department;
  priority: string;
  riskLevel: RiskLevel;
  statusStage: string;
  needsDannyApproval: boolean;
  suggestedNextAction: string;
  evidenceSummary: string;
  relatedUrl?: string;
  relatedPath?: string;
}

interface DraftSuggestion {
  id: string;
  sourceQueueItemId: string;
  sourceReport: string;
  relatedUrl?: string;
  relatedPath?: string;
  department: Department;
  draftType: DraftType;
  riskLevel: RiskLevel;
  statusStage: StatusStage;
  draftOnly: true;
  needsHumanReview: true;
  needsDannyApproval: boolean;
  canAutoApply: false;
  title: string;
  draftText: string;
  rationale: string;
  safetyNotes: string[];
  blockedReason?: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

const draftVersion = "1.0.0";
const outputJson = "data/reports/fix_draft_suggestions.json";
const outputMd = "data/reports/fix_draft_suggestions.md";
const maxDraftsTotal = 50;
const maxSafeDrafts = 20;
const maxApprovalDrafts = 15;
const maxBlockedDrafts = 15;

const sourceReports: SourceReport[] = [
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
  { name: "metadata_suggestions", path: "data/reports/metadata_suggestions.json" },
  { name: "internal_link_placement_suggestions", path: "data/reports/internal_link_placement_suggestions.json" },
  { name: "research_duplicate_guard_report", path: "data/reports/research_duplicate_guard_report.json" },
  { name: "rendered_page_verification", path: "data/reports/rendered_page_verification.json" },
  { name: "affiliate_placement_suggestions", path: "data/reports/affiliate_placement_suggestions.json" },
];

const safetyNotes = [
  "Fix Draft Generator v1 is draft-only and report-only.",
  "It never writes to Supabase, edits live site files, publishes, calls APIs, or stores secrets.",
  "Drafts are not final publishable article text and are not live content patches.",
  "Every draft has draftOnly true, needsHumanReview true, and canAutoApply false.",
  "Affiliate CTA drafts omit raw affiliate URLs and require Danny approval.",
  "Scam/fraud, trust/rating, legal/policy, high-risk, and blocked items are framed as evidence or research tasks, not final claims.",
];

export async function buildFixDraftGenerator(): Promise<DraftSuggestion[]> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const reportMap = new Map(loadedReports.map((report) => [report.source.name, report.data]));
  const context = buildContext(reportMap);
  const queue = reportMap.get("master_command_queue");
  const drafts = queue ? buildDraftsFromQueue(queue, context) : [];

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Fix Draft Generator v1. This local report turns Master Command Queue items into cautious draft-only suggestions for human review. It never edits content, writes to Supabase, publishes, calls APIs, modifies live website files, creates final legal/policy wording, or marks anything approved/applied.",
    draftVersion,
    sourceReportsRead,
    missingReports,
    summaryCounts: {
      draftCount: drafts.length,
      safeDraftCount: drafts.filter((draft) => !draft.needsDannyApproval && !draft.blockedReason).length,
      approvalDraftCount: drafts.filter((draft) => draft.needsDannyApproval && !draft.blockedReason).length,
      blockedOrResearchDraftCount: drafts.filter((draft) => Boolean(draft.blockedReason) || draft.draftType === "blocked_item_research").length,
      maxDraftsTotal,
      maxSafeDrafts,
      maxApprovalDrafts,
      maxBlockedDrafts,
    },
    riskCounts: countBy(drafts, (draft) => draft.riskLevel, ["low", "medium", "high"]),
    approvalCounts: {
      needsHumanReviewCount: drafts.length,
      needsDannyApprovalCount: drafts.filter((draft) => draft.needsDannyApproval).length,
      canAutoApplyCount: 0,
      approvedCount: 0,
      appliedCount: 0,
    },
    draftTypeCounts: countBy(drafts, (draft) => draft.draftType, [
      "meta_title",
      "meta_description",
      "faq",
      "internal_link",
      "image_alt_text",
      "refresh_outline",
      "evidence_checklist",
      "affiliate_cta",
      "blocked_item_research",
      "research_brief",
    ]),
    drafts,
    safetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Fix draft suggestions written", {
    drafts: drafts.length,
    sourceReportsRead: sourceReportsRead.length,
    missingReports: missingReports.length,
    outputJson,
    outputMd,
  });
  return drafts;
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

function buildContext(reportMap: Map<string, unknown>): {
  metadataByPage: Map<string, unknown>;
  affiliateByPageBrand: Map<string, unknown>;
  blockedAffiliateByPageBrand: Map<string, unknown>;
  internalLinkBySource: Map<string, unknown>;
  researchByPage: Map<string, unknown>;
  renderedByPage: Map<string, unknown>;
} {
  const metadataByPage = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("metadata_suggestions"), "items")) {
    for (const key of pageKeys(item)) metadataByPage.set(key, item);
  }

  const affiliateByPageBrand = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("affiliate_placement_suggestions"), "recommendations")) {
    const key = affiliateKey(objectAt(item, "sourcePage"), stringAt(item, "affiliateBrand"));
    if (key) affiliateByPageBrand.set(key, item);
  }

  const blockedAffiliateByPageBrand = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("affiliate_placement_suggestions"), "blockedPlacements")) {
    const key = affiliateKey(objectAt(item, "sourcePage"), stringAt(item, "affiliateBrand"));
    if (key) blockedAffiliateByPageBrand.set(key, item);
  }

  const internalLinkBySource = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("internal_link_placement_suggestions"), "recommendations")) {
    for (const key of pageKeys(objectAt(item, "sourcePage"))) internalLinkBySource.set(key, item);
  }

  const researchByPage = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("research_duplicate_guard_report"), "items")) {
    for (const key of pageKeys(item)) researchByPage.set(key, item);
  }

  const renderedByPage = new Map<string, unknown>();
  for (const item of arrayAt(reportMap.get("rendered_page_verification"), "results")) {
    for (const key of pageKeys(item)) renderedByPage.set(key, item);
  }

  return { metadataByPage, affiliateByPageBrand, blockedAffiliateByPageBrand, internalLinkBySource, researchByPage, renderedByPage };
}

function buildDraftsFromQueue(queue: unknown, context: ReturnType<typeof buildContext>): DraftSuggestion[] {
  const safe = dedupeQueueItems(arrayAt(queue, "safeDraftsReady")).slice(0, maxSafeDrafts);
  const approval = dedupeQueueItems(arrayAt(queue, "needsDannyApproval")).slice(0, maxApprovalDrafts);
  const blocked = dedupeQueueItems(arrayAt(queue, "blockedRiskyItems")).slice(0, maxBlockedDrafts);
  const money = dedupeQueueItems(arrayAt(queue, "moneyOpportunities")).slice(0, maxApprovalDrafts);

  const candidates = dedupeDrafts([
    ...safe.flatMap((item) => draftsForQueueItem(item, "safe", context)),
    ...approval.flatMap((item) => draftsForQueueItem(item, "approval", context)),
    ...blocked.flatMap((item) => draftsForQueueItem(item, "blocked", context)),
    ...money.flatMap((item) => draftsForQueueItem(item, "approval", context)),
  ]);

  const blockedDrafts = candidates.filter((draft) => Boolean(draft.blockedReason) || draft.draftType === "blocked_item_research").slice(0, maxBlockedDrafts);
  const approvalDrafts = candidates.filter((draft) => draft.needsDannyApproval && !blockedDrafts.some((blockedDraft) => blockedDraft.id === draft.id)).slice(0, maxApprovalDrafts);
  const safeDrafts = candidates.filter((draft) => !draft.needsDannyApproval && !blockedDrafts.some((blockedDraft) => blockedDraft.id === draft.id)).slice(0, maxSafeDrafts);

  return [...safeDrafts, ...approvalDrafts, ...blockedDrafts].slice(0, maxDraftsTotal);
}

function draftsForQueueItem(rawItem: unknown, lane: "safe" | "approval" | "blocked", context: ReturnType<typeof buildContext>): DraftSuggestion[] {
  const item = queueItemFrom(rawItem);
  if (!item || item.statusStage === "approved" || item.statusStage === "applied") {
    return [];
  }

  if (lane === "blocked" || item.section === "blockedRiskyItems") {
    return [blockedResearchDraft(item)];
  }

  if (item.department === "Affiliates" || item.section === "moneyOpportunities" || item.title.toLowerCase().includes("affiliate")) {
    return [affiliateCtaDraft(item, context)];
  }

  if (item.department === "Media" || item.title.toLowerCase().includes("image") || item.evidenceSummary.toLowerCase().includes("image")) {
    return [imageAltDraft(item, context)];
  }

  if (isMetadataQueueItem(item)) {
    return metadataDrafts(item, context);
  }

  if (item.sourceReport === "internal_link_placement_suggestions" || item.title.toLowerCase().includes("internal link") || item.title.toLowerCase().includes("linking")) {
    return [internalLinkDraft(item, context)];
  }

  if (item.department === "Research") {
    return [researchBriefDraft(item, context)];
  }

  if (isHighRiskText(item)) {
    return [evidenceChecklistDraft(item)];
  }

  return [refreshOutlineDraft(item)];
}

function metadataDrafts(item: QueueItem, context: ReturnType<typeof buildContext>): DraftSuggestion[] {
  const metadata = findByPage(context.metadataByPage, item);
  const titleDraft = stringAt(metadata, "seoTitleDraft", "draft");
  const descriptionDraft = stringAt(metadata, "metaDescriptionDraft", "draft");
  const drafts: DraftSuggestion[] = [];

  if (titleDraft) {
    drafts.push(baseDraft(item, "meta_title", {
      title: `Meta title draft: ${item.title}`,
      draftText: titleDraft,
      rationale: notesSummary(metadata, "seoTitleDraft") ?? "Metadata Engine provided a local SEO title draft.",
      riskLevel: "low",
      needsDannyApproval: item.needsDannyApproval,
    }));
  }

  if (descriptionDraft) {
    drafts.push(baseDraft(item, "meta_description", {
      title: `Meta description draft: ${item.title}`,
      draftText: descriptionDraft,
      rationale: notesSummary(metadata, "metaDescriptionDraft") ?? "Metadata Engine provided a local meta description draft.",
      riskLevel: "low",
      needsDannyApproval: item.needsDannyApproval,
    }));
  }

  return drafts.length > 0 ? drafts : [refreshOutlineDraft(item)];
}

function internalLinkDraft(item: QueueItem, context: ReturnType<typeof buildContext>): DraftSuggestion {
  const link = findByPage(context.internalLinkBySource, item);
  const target = stringAt(link, "targetPage", "title") ?? "a relevant supporting page";
  const anchor = stringAt(link, "suggestedAnchorText") ?? specificAnchorFromTitle(target);
  const placement = stringAt(link, "suggestedPlacementContext") ?? "Review a natural in-content placement after the relevant section, not at the top of the page.";

  return baseDraft(item, "internal_link", {
    title: `Internal link draft: ${item.title}`,
    draftText: `Suggested anchor: "${anchor}". Suggested placement: ${placement}`,
    rationale: stringAt(link, "reason") ?? "Queue item indicates this page may need natural internal link support.",
    riskLevel: item.riskLevel,
    needsDannyApproval: item.needsDannyApproval,
  });
}

function imageAltDraft(item: QueueItem, context: ReturnType<typeof buildContext>): DraftSuggestion {
  const metadata = findByPage(context.metadataByPage, item);
  const rendered = findByPage(context.renderedByPage, item);
  const altDraft = stringAt(arrayAt(metadata, "imageAltTextSuggestions")[0], "draft") ?? `${cleanTitle(item.title)} page context`;
  const renderedNote = numberAt(rendered, "renderedFacts", "imagesMissingAlt") > 0
    ? `Rendered verifier suggested ${numberAt(rendered, "renderedFacts", "imagesMissingAlt")} image(s) may need alt text.`
    : "Verify the actual image before using this alt text.";

  return baseDraft(item, "image_alt_text", {
    title: `Image alt text draft: ${item.title}`,
    draftText: altDraft,
    rationale: `${notesSummary(metadata, "imageAltTextSuggestions", 0) ?? "Metadata/queue signals suggest image metadata review."} ${renderedNote}`,
    riskLevel: item.riskLevel,
    needsDannyApproval: item.needsDannyApproval,
  });
}

function affiliateCtaDraft(item: QueueItem, context: ReturnType<typeof buildContext>): DraftSuggestion {
  const brand = brandFromTitle(item.title);
  const placement = findByPageAndBrand(context.affiliateByPageBrand, item, brand) ?? findByPageAndBrand(context.blockedAffiliateByPageBrand, item, brand);
  const ctaText = stringAt(placement, "suggestedCtaText") ?? stringAt(placement, "offerText") ?? "Review the current offer directly with the provider before taking action.";
  const riskFlags = arrayAt(placement, "riskFlags").map(String);
  const blocked = item.section === "blockedRiskyItems" || riskFlags.length > 0 || item.riskLevel === "high";

  return baseDraft(item, "affiliate_cta", {
    title: `Affiliate CTA draft requiring approval: ${brand ?? item.title}`,
    draftText: blocked
      ? "Approval-only CTA placeholder: do not add an affiliate CTA until Danny reviews the page risk, disclosure, offer status, and evidence."
      : `${ctaText} Disclosure needed: ${stringAt(placement, "disclosureText") ?? "Affiliate disclosure required before any CTA is considered."}`,
    rationale: stringAt(placement, "reason") ?? "Money opportunity requires human approval before any affiliate wording is drafted into content.",
    riskLevel: item.riskLevel === "low" ? "medium" : item.riskLevel,
    needsDannyApproval: true,
    blockedReason: blocked ? (riskFlags.join(", ") || "Affiliate placement is blocked or high-risk until Danny approves.") : undefined,
    extraSafetyNotes: ["No raw affiliate URL is included.", "This is not ready to apply and must not be placed on red/warning/high-risk pages without manual approval."],
  });
}

function blockedResearchDraft(item: QueueItem): DraftSuggestion {
  return baseDraft(item, "blocked_item_research", {
    title: `Evidence request: ${item.title}`,
    draftText: [
      "Research task:",
      "- Confirm the page context and risk rating from local evidence.",
      "- Identify what evidence would be needed before any draft can move forward.",
      "- Check whether the item involves affiliate, trust/rating, legal/policy, scam/fraud, or warning-page risk.",
      "- Keep this blocked until Danny reviews the evidence and approves a next step.",
    ].join("\n"),
    rationale: item.evidenceSummary || "Master Command Queue marked this as blocked or risky.",
    riskLevel: "high",
    needsDannyApproval: true,
    blockedReason: item.evidenceSummary || "Blocked/risk-control item from the Master Command Queue.",
  });
}

function researchBriefDraft(item: QueueItem, context: ReturnType<typeof buildContext>): DraftSuggestion {
  const research = findByPage(context.researchByPage, item);
  return baseDraft(item, "research_brief", {
    title: `Research brief draft: ${item.title}`,
    draftText: [
      `Research angle: ${cleanTitle(item.title)}`,
      `Current classification: ${stringAt(research, "classification") ?? "needs_research"}`,
      "Questions to answer before drafting:",
      "- Is this new search intent, an update to an existing page, or a duplicate?",
      "- What local evidence supports the topic?",
      "- Which claims must be avoided until evidence is reviewed?",
    ].join("\n"),
    rationale: stringAt(research, "similarityReason") ?? item.evidenceSummary ?? "Research Guard or Master Queue indicated a research review item.",
    riskLevel: item.riskLevel,
    needsDannyApproval: item.needsDannyApproval || item.riskLevel === "high",
  });
}

function evidenceChecklistDraft(item: QueueItem): DraftSuggestion {
  return baseDraft(item, "evidence_checklist", {
    title: `Evidence checklist: ${item.title}`,
    draftText: [
      "Evidence checklist:",
      "- Capture the exact claim being considered.",
      "- List the local evidence currently available.",
      "- Mark missing evidence before any wording is drafted.",
      "- Avoid scam/fraud, trust-rating, guarantee, legal, or safety conclusions until reviewed.",
      "- Escalate to Danny before drafting any high-risk wording.",
    ].join("\n"),
    rationale: item.evidenceSummary || "The queue item touches a risk area where evidence must lead the wording.",
    riskLevel: item.riskLevel === "low" ? "medium" : item.riskLevel,
    needsDannyApproval: true,
  });
}

function refreshOutlineDraft(item: QueueItem): DraftSuggestion {
  return baseDraft(item, "refresh_outline", {
    title: `Page refresh outline: ${item.title}`,
    draftText: [
      `Page/topic: ${cleanTitle(item.title)}`,
      "Draft outline:",
      "1. Re-check the main answer for clarity and plain English.",
      "2. Add or tighten evidence notes where the local report found gaps.",
      "3. Review metadata, internal links, and media only where relevant.",
      "4. Keep affiliate, rating, legal, and high-risk claim changes out of scope unless Danny approves.",
    ].join("\n"),
    rationale: item.evidenceSummary || "Master Command Queue marked this as a safe draft or reviewable content refresh item.",
    riskLevel: item.riskLevel,
    needsDannyApproval: item.needsDannyApproval || item.riskLevel === "high",
  });
}

function baseDraft(
  item: QueueItem,
  draftType: DraftType,
  options: {
    title: string;
    draftText: string;
    rationale: string;
    riskLevel: RiskLevel;
    needsDannyApproval: boolean;
    blockedReason?: string;
    extraSafetyNotes?: string[];
  },
): DraftSuggestion {
  const riskRequiresApproval = options.riskLevel === "high" || isHighRiskText(item) || draftType === "affiliate_cta" || draftType === "blocked_item_research";
  return {
    id: idFor("fix-draft", draftType, item.id),
    sourceQueueItemId: item.id,
    sourceReport: item.sourceReport,
    relatedUrl: item.relatedUrl,
    relatedPath: item.relatedPath,
    department: item.department,
    draftType,
    riskLevel: options.riskLevel,
    statusStage: safeStage(item.statusStage),
    draftOnly: true,
    needsHumanReview: true,
    needsDannyApproval: options.needsDannyApproval || riskRequiresApproval,
    canAutoApply: false,
    title: options.title,
    draftText: options.draftText,
    rationale: options.rationale,
    safetyNotes: [...safetyNotesForDraft(draftType, options.riskLevel), ...(options.extraSafetyNotes ?? [])],
    blockedReason: options.blockedReason,
  };
}

function queueItemFrom(item: unknown): QueueItem | undefined {
  const id = stringAt(item, "id");
  const title = stringAt(item, "title");
  const department = stringAt(item, "department");
  if (!id || !title || !isDepartment(department)) return undefined;
  return {
    id,
    title,
    sourceReport: stringAt(item, "sourceReport") ?? "master_command_queue",
    section: stringAt(item, "section") ?? "safeDraftsReady",
    department,
    priority: stringAt(item, "priority") ?? "medium",
    riskLevel: riskAt(item, "riskLevel", "medium"),
    statusStage: stringAt(item, "statusStage") ?? "detected",
    needsDannyApproval: booleanAt(item, "needsDannyApproval"),
    suggestedNextAction: stringAt(item, "suggestedNextAction") ?? "",
    evidenceSummary: stringAt(item, "evidenceSummary") ?? "",
    relatedUrl: stringAt(item, "relatedUrl"),
    relatedPath: stringAt(item, "relatedPath"),
  };
}

function dedupeQueueItems(items: unknown[]): unknown[] {
  const seen = new Set<string>();
  const output: unknown[] = [];
  for (const item of items) {
    const key = stringAt(item, "id") ?? JSON.stringify(item).slice(0, 120);
    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }
  return output;
}

function dedupeDrafts(drafts: DraftSuggestion[]): DraftSuggestion[] {
  const seen = new Set<string>();
  const output: DraftSuggestion[] = [];
  for (const draft of drafts) {
    if (!seen.has(draft.id)) {
      seen.add(draft.id);
      output.push(draft);
    }
  }
  return output;
}

function findByPage(map: Map<string, unknown>, item: QueueItem): unknown {
  const keys = [item.relatedUrl, item.relatedPath].filter((key): key is string => Boolean(key));
  for (const key of keys) {
    const exact = map.get(key);
    if (exact) return exact;
  }
  return undefined;
}

function findByPageAndBrand(map: Map<string, unknown>, item: QueueItem, brand?: string): unknown {
  const keys = [item.relatedUrl, item.relatedPath].filter((key): key is string => Boolean(key));
  for (const key of keys) {
    const exact = map.get(`${key}|${slugify(brand ?? "")}`);
    if (exact) return exact;
  }
  return undefined;
}

function affiliateKey(page: unknown, brand?: string): string | undefined {
  const key = pageKeys(page)[0];
  if (!key || !brand) return undefined;
  return `${key}|${slugify(brand)}`;
}

function pageKeys(record: unknown): string[] {
  return [stringAt(record, "url"), stringAt(record, "slug"), stringAt(record, "relatedUrl"), stringAt(record, "relatedPath")]
    .filter((key): key is string => Boolean(key));
}

function notesSummary(record: unknown, ...path: (string | number)[]): string | undefined {
  const target = valueAt(record, path);
  const notes = arrayAt(target, "notes");
  return notes.length > 0 ? notes.map(String).join(" ") : undefined;
}

function safetyNotesForDraft(draftType: DraftType, riskLevel: RiskLevel): string[] {
  const notes = [
    "Draft-only; do not apply directly.",
    "Human review required before any content work.",
    "No Supabase write, live edit, or publishing action is included.",
  ];
  if (riskLevel === "high") notes.push("High-risk item; Danny approval required.");
  if (draftType === "affiliate_cta") notes.push("Affiliate CTA wording requires Danny approval and contains no raw affiliate URL.");
  if (draftType === "evidence_checklist" || draftType === "blocked_item_research") notes.push("Frame as evidence review, not as a final claim or accusation.");
  return notes;
}

function isHighRiskText(item: QueueItem): boolean {
  const text = `${item.title} ${item.evidenceSummary} ${item.suggestedNextAction}`.toLowerCase();
  return item.riskLevel === "high"
    || text.includes("scam")
    || text.includes("fraud")
    || text.includes("trust rating")
    || text.includes("legal")
    || text.includes("policy")
    || text.includes("blocked")
    || text.includes("warning");
}

function isMetadataQueueItem(item: QueueItem): boolean {
  const text = `${item.id} ${item.title} ${item.evidenceSummary} ${item.suggestedNextAction}`.toLowerCase();
  return item.sourceReport === "metadata_suggestions"
    || text.includes("metadata")
    || text.includes("canonical")
    || text.includes("title/meta");
}

function brandFromTitle(title: string): string | undefined {
  return title.replace(/^Affiliate placement review:\s*/i, "")
    .replace(/^Affiliate CTA draft requiring approval:\s*/i, "")
    .replace(/^Blocked affiliate placement:\s*/i, "")
    .trim() || undefined;
}

function specificAnchorFromTitle(title: string): string {
  return title === "a relevant supporting page" ? "related CryptoWatchdog guidance" : title;
}

function cleanTitle(title: string): string {
  return title.replace(/^Draft metadata:\s*/i, "")
    .replace(/^Review image metadata:\s*/i, "")
    .replace(/^Thin internal linking review:\s*/i, "")
    .trim();
}

function safeStage(value: string): StatusStage {
  if (value === "suspected" || value === "recommended") return value;
  return "detected";
}

function renderMarkdown(report: {
  generatedAt: string;
  draftVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  summaryCounts: Record<string, number>;
  approvalCounts: Record<string, number>;
  drafts: DraftSuggestion[];
  safetyNotes: string[];
}): string {
  const ready = report.drafts.filter((draft) => !draft.needsDannyApproval && !draft.blockedReason);
  const approval = report.drafts.filter((draft) => draft.needsDannyApproval && !draft.blockedReason);
  const blocked = report.drafts.filter((draft) => draft.blockedReason || draft.draftType === "blocked_item_research");
  return [
    "# Fix Draft Generator v1",
    "",
    "## Fix Draft Generator Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Draft version: ${report.draftVersion}`,
    `Reports read: ${report.sourceReportsRead.length}`,
    `Missing reports: ${report.missingReports.length}`,
    `Drafts generated: ${report.summaryCounts.draftCount}`,
    `Can auto apply: ${report.approvalCounts.canAutoApplyCount}`,
    "",
    "## Drafts Ready for Review",
    "",
    renderDrafts(ready.slice(0, 20)),
    "",
    "## Needs Danny Approval",
    "",
    renderDrafts(approval.slice(0, 20)),
    "",
    "## Blocked / Research Required",
    "",
    renderDrafts(blocked.slice(0, 20)),
    "",
    "## Safety Notes",
    "",
    report.safetyNotes.map((note) => `- ${note}`).join("\n"),
    "",
    "## Missing Reports",
    "",
    report.missingReports.length ? report.missingReports.map((name) => `- ${name}`).join("\n") : "No configured reports were missing.",
    "",
    "## Next Steps",
    "",
    "- Review safe drafts first as local draft suggestions only.",
    "- Send affiliate, trust/rating, legal/policy, high-risk, and blocked items to Danny approval before any drafting moves forward.",
    "- Use blocked research drafts to gather evidence; do not turn them into accusations or final content.",
    "- Do not apply, publish, or write any generated draft to live systems.",
  ].join("\n");
}

function renderDrafts(drafts: DraftSuggestion[]): string {
  if (drafts.length === 0) {
    return "No drafts in this section from the available local reports.";
  }
  return drafts.map((draft) => [
    `- ${draft.title}`,
    `  - Type: ${draft.draftType}`,
    `  - Source: ${draft.sourceReport}`,
    `  - Risk/stage: ${draft.riskLevel} / ${draft.statusStage}`,
    `  - Danny approval: ${draft.needsDannyApproval}`,
    `  - Draft: ${firstLine(draft.draftText)}`,
  ].join("\n")).join("\n");
}

function firstLine(value: string): string {
  return value.split(/\r?\n/)[0].slice(0, 180);
}

function arrayAt(record: unknown, ...path: (string | number)[]): unknown[] {
  const value = valueAt(record, path);
  return Array.isArray(value) ? value : [];
}

function objectAt(record: unknown, ...path: (string | number)[]): Record<string, unknown> {
  const value = valueAt(record, path);
  return isRecord(value) ? value : {};
}

function stringAt(record: unknown, ...path: (string | number)[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberAt(record: unknown, ...path: (string | number)[]): number {
  const value = valueAt(record, path);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function booleanAt(record: unknown, ...path: (string | number)[]): boolean {
  const value = valueAt(record, path);
  return typeof value === "boolean" ? value : false;
}

function riskAt(record: unknown, key: string, fallback: RiskLevel): RiskLevel {
  const value = stringAt(record, key);
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function valueAt(record: unknown, path: (string | number)[]): unknown {
  let current = record;
  for (const key of path) {
    if (typeof key === "number") {
      if (!Array.isArray(current)) return undefined;
      current = current[key];
      continue;
    }
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

function idFor(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 140);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isDepartment(value: string | undefined): value is Department {
  return value === "Command"
    || value === "Content"
    || value === "SEO"
    || value === "Research"
    || value === "Affiliates"
    || value === "Backlinks"
    || value === "Analytics"
    || value === "Trust & Safety"
    || value === "Media"
    || value === "Social"
    || value === "Operations"
    || value === "Approvals";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

if (isDirectRun(import.meta.url)) {
  buildFixDraftGenerator().catch((error) => {
    logger.error("Fix draft generator failed", { error });
    process.exitCode = 1;
  });
}
