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

type PreviewType =
  | "meta_title_preview"
  | "meta_description_preview"
  | "internal_link_preview"
  | "image_alt_text_preview"
  | "refresh_outline_preview"
  | "evidence_checklist_preview"
  | "affiliate_cta_preview"
  | "blocked_research_preview"
  | "research_brief_preview";

type RiskLevel = "low" | "medium" | "high";
type StatusStage = "detected" | "suspected" | "recommended";

interface SourceReport {
  name: string;
  path: string;
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
  statusStage: string;
  draftOnly: boolean;
  needsHumanReview: boolean;
  needsDannyApproval: boolean;
  canAutoApply: boolean;
  title: string;
  draftText: string;
  rationale: string;
  safetyNotes: string[];
  blockedReason?: string;
}

interface PreviewItem {
  id: string;
  sourceDraftId: string;
  sourceQueueItemId: string;
  sourceReport: string;
  previewType: PreviewType;
  relatedUrl?: string;
  relatedPath?: string;
  department: Department;
  riskLevel: RiskLevel;
  statusStage: StatusStage;
  previewOnly: true;
  draftOnly: true;
  needsHumanReview: true;
  needsDannyApproval: boolean;
  canAutoApply: false;
  title: string;
  currentValueSummary: string;
  proposedValueSummary: string;
  previewDiffText: string;
  rationale: string;
  safetyNotes: string[];
  blockedReason?: string;
}

interface LoadedReport {
  source: SourceReport;
  data: unknown;
}

const previewVersion = "1.0.0";
const outputJson = "data/reports/preview_diff_report.json";
const outputMd = "data/reports/preview_diff_report.md";
const maxPreviewsTotal = 50;
const maxSafePreviews = 20;
const maxApprovalPreviews = 15;
const maxBlockedPreviews = 15;

const sourceReports: SourceReport[] = [
  { name: "fix_draft_suggestions", path: "data/reports/fix_draft_suggestions.json" },
  { name: "normalised_content", path: "data/content_snapshot/normalised_content.json" },
  { name: "master_command_queue", path: "data/reports/master_command_queue.json" },
];

const globalSafetyNotes = [
  "Preview Diff Engine v1 is preview-only and report-only.",
  "It never writes to Supabase, edits content snapshots, edits live site files, publishes, calls APIs, or stores secrets.",
  "It creates simulated textual previews only, not executable patch files or update payloads.",
  "Every preview has previewOnly true, draftOnly true, needsHumanReview true, and canAutoApply false.",
  "High-risk, affiliate, scam/fraud, trust/rating, legal/policy, and blocked previews require Danny approval.",
  "Blocked items are shown as research/evidence previews only, not ready-to-apply wording.",
];

export async function buildPreviewDiffEngine(): Promise<PreviewItem[]> {
  const { loadedReports, sourceReportsRead, missingReports } = await loadReports();
  const reportMap = new Map(loadedReports.map((report) => [report.source.name, report.data]));
  const drafts = arrayAt(reportMap.get("fix_draft_suggestions"), "drafts")
    .map(draftFrom)
    .filter((draft): draft is DraftSuggestion => Boolean(draft));
  const snapshots = snapshotMap(reportMap.get("normalised_content"));
  const queue = queueMap(reportMap.get("master_command_queue"));
  const previews = buildPreviews(drafts, snapshots, queue);

  const report = {
    generatedAt: new Date().toISOString(),
    disclaimer: "Read-only Preview Diff Engine v1. This local report simulates what draft suggestions could look like before approval. It never creates patches, update payloads, Supabase writes, live edits, publishing actions, API calls, or final legal/policy/trust-rating changes.",
    previewVersion,
    sourceReportsRead,
    missingReports,
    summaryCounts: {
      previewCount: previews.length,
      safePreviewCount: previews.filter((preview) => !preview.needsDannyApproval && !preview.blockedReason).length,
      approvalPreviewCount: previews.filter((preview) => preview.needsDannyApproval && !preview.blockedReason).length,
      blockedOrResearchPreviewCount: previews.filter((preview) => Boolean(preview.blockedReason) || preview.previewType === "blocked_research_preview").length,
      maxPreviewsTotal,
      maxSafePreviews,
      maxApprovalPreviews,
      maxBlockedPreviews,
    },
    riskCounts: countBy(previews, (preview) => preview.riskLevel, ["low", "medium", "high"]),
    approvalCounts: {
      needsHumanReviewCount: previews.length,
      needsDannyApprovalCount: previews.filter((preview) => preview.needsDannyApproval).length,
      canAutoApplyCount: 0,
      approvedCount: 0,
      appliedCount: 0,
    },
    previewTypeCounts: countBy(previews, (preview) => preview.previewType, [
      "meta_title_preview",
      "meta_description_preview",
      "internal_link_preview",
      "image_alt_text_preview",
      "refresh_outline_preview",
      "evidence_checklist_preview",
      "affiliate_cta_preview",
      "blocked_research_preview",
      "research_brief_preview",
    ]),
    previews,
    safetyNotes: globalSafetyNotes,
  };

  await writeJson(outputJson, report);
  await writeText(outputMd, renderMarkdown(report));
  logger.info("Preview diff report written", {
    previews: previews.length,
    sourceReportsRead: sourceReportsRead.length,
    missingReports: missingReports.length,
    outputJson,
    outputMd,
  });
  return previews;
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

function buildPreviews(drafts: DraftSuggestion[], snapshots: Map<string, unknown>, queue: Map<string, unknown>): PreviewItem[] {
  const candidates = dedupePreviews(drafts.flatMap((draft) => previewFromDraft(draft, snapshots, queue)));
  const blocked = candidates.filter((preview) => Boolean(preview.blockedReason) || preview.previewType === "blocked_research_preview").slice(0, maxBlockedPreviews);
  const approval = candidates.filter((preview) => preview.needsDannyApproval && !blocked.some((blockedPreview) => blockedPreview.id === preview.id)).slice(0, maxApprovalPreviews);
  const safe = candidates.filter((preview) => !preview.needsDannyApproval && !blocked.some((blockedPreview) => blockedPreview.id === preview.id)).slice(0, maxSafePreviews);
  return [...safe, ...approval, ...blocked].slice(0, maxPreviewsTotal);
}

function previewFromDraft(draft: DraftSuggestion, snapshots: Map<string, unknown>, queue: Map<string, unknown>): PreviewItem[] {
  if (draft.statusStage === "approved" || draft.statusStage === "applied") {
    return [];
  }
  const snapshot = findSnapshot(snapshots, draft);
  const queueItem = queue.get(draft.sourceQueueItemId);
  const previewType = previewTypeForDraft(draft.draftType);
  const currentValueSummary = currentSummaryFor(draft, snapshot, queueItem);
  const proposedValueSummary = proposedSummaryFor(draft);
  const blockedReason = blockedReasonFor(draft, queueItem);
  const needsDannyApproval = draft.needsDannyApproval || draft.riskLevel === "high" || isApprovalSensitive(draft) || Boolean(blockedReason);

  return [
    {
      id: idFor("preview", previewType, draft.id),
      sourceDraftId: draft.id,
      sourceQueueItemId: draft.sourceQueueItemId,
      sourceReport: draft.sourceReport,
      previewType,
      relatedUrl: draft.relatedUrl,
      relatedPath: draft.relatedPath,
      department: draft.department,
      riskLevel: blockedReason ? "high" : draft.riskLevel,
      statusStage: safeStage(draft.statusStage),
      previewOnly: true,
      draftOnly: true,
      needsHumanReview: true,
      needsDannyApproval,
      canAutoApply: false,
      title: titleForPreview(draft),
      currentValueSummary,
      proposedValueSummary,
      previewDiffText: renderPreviewDiff(currentValueSummary, proposedValueSummary, blockedReason),
      rationale: draft.rationale,
      safetyNotes: previewSafetyNotes(draft, blockedReason),
      blockedReason,
    },
  ];
}

function currentSummaryFor(draft: DraftSuggestion, snapshot: unknown, queueItem: unknown): string {
  switch (draft.draftType) {
    case "meta_title":
      return stringAt(snapshot, "title") ? `Current snapshot title: ${stringAt(snapshot, "title")}` : "Current title is not available in local snapshot.";
    case "meta_description":
      return stringAt(snapshot, "summary") ? `Current snapshot summary: ${stringAt(snapshot, "summary")}` : "Current meta description is not available in local snapshot.";
    case "internal_link":
      return "Current link placement is not modified. Snapshot body is used only for local context.";
    case "image_alt_text":
      return "Current image alt text is not available in the local snapshot; verify rendered assets before use.";
    case "refresh_outline":
      return bodySummary(snapshot);
    case "evidence_checklist":
    case "blocked_item_research":
      return stringAt(queueItem, "evidenceSummary") ?? "Current evidence status comes from the local command queue and still needs review.";
    case "affiliate_cta":
      return "Current affiliate placement is not changed. No raw affiliate URL is included in this preview.";
    case "research_brief":
    case "faq":
      return stringAt(snapshot, "summary") ?? "Current page context is limited or unavailable in local snapshot.";
  }
}

function proposedSummaryFor(draft: DraftSuggestion): string {
  const text = sanitizeAffiliateUrls(draft.draftText);
  if (draft.draftType === "blocked_item_research") {
    return "Research/evidence task only. This is not ready-to-apply wording.";
  }
  if (draft.draftType === "evidence_checklist") {
    return "Evidence checklist preview only. This is not an accusation or final claim.";
  }
  if (draft.draftType === "affiliate_cta") {
    return `Approval-only affiliate CTA preview: ${text}`;
  }
  return text;
}

function renderPreviewDiff(currentValueSummary: string, proposedValueSummary: string, blockedReason?: string): string {
  const lines = [
    "Preview only - no files, snapshots, Supabase rows, or live pages are changed.",
    `- Current: ${currentValueSummary}`,
    `+ Proposed draft preview: ${proposedValueSummary}`,
  ];
  if (blockedReason) {
    lines.push(`! Blocked/research condition: ${blockedReason}`);
  }
  return lines.join("\n");
}

function blockedReasonFor(draft: DraftSuggestion, queueItem: unknown): string | undefined {
  if (draft.blockedReason) return draft.blockedReason;
  const queueSection = stringAt(queueItem, "section");
  if (queueSection === "blockedRiskyItems") return stringAt(queueItem, "evidenceSummary") ?? "Blocked in Master Command Queue.";
  if (draft.draftType === "blocked_item_research") return "Blocked item must remain research/evidence-only until Danny approval.";
  return undefined;
}

function previewTypeForDraft(draftType: DraftType): PreviewType {
  switch (draftType) {
    case "meta_title":
      return "meta_title_preview";
    case "meta_description":
      return "meta_description_preview";
    case "internal_link":
      return "internal_link_preview";
    case "image_alt_text":
      return "image_alt_text_preview";
    case "refresh_outline":
      return "refresh_outline_preview";
    case "evidence_checklist":
      return "evidence_checklist_preview";
    case "affiliate_cta":
      return "affiliate_cta_preview";
    case "blocked_item_research":
      return "blocked_research_preview";
    case "research_brief":
      return "research_brief_preview";
    case "faq":
      return "refresh_outline_preview";
  }
}

function titleForPreview(draft: DraftSuggestion): string {
  return draft.title.replace(/\bdraft\b/i, "preview");
}

function previewSafetyNotes(draft: DraftSuggestion, blockedReason?: string): string[] {
  const notes = [
    "Preview-only; do not apply directly.",
    "Draft-only; human review is required.",
    "No executable patch, Supabase payload, live edit, API call, or publishing action is created.",
  ];
  if (draft.needsDannyApproval || draft.riskLevel === "high") notes.push("Danny approval required before any next step.");
  if (draft.draftType === "affiliate_cta") notes.push("Affiliate preview contains no raw affiliate URL and is not ready to place.");
  if (draft.draftType === "blocked_item_research" || blockedReason) notes.push("Blocked item remains evidence/research-only, not ready-to-apply wording.");
  if (isApprovalSensitive(draft)) notes.push("Sensitive wording must not become final legal, trust/rating, scam/fraud, or policy text in v1.");
  return notes;
}

function isApprovalSensitive(draft: DraftSuggestion): boolean {
  const text = `${draft.title} ${draft.draftText} ${draft.rationale} ${draft.blockedReason ?? ""}`.toLowerCase();
  return draft.draftType === "affiliate_cta"
    || text.includes("scam")
    || text.includes("fraud")
    || text.includes("trust rating")
    || text.includes("legal")
    || text.includes("policy")
    || text.includes("blocked")
    || draft.department === "Trust & Safety";
}

function bodySummary(snapshot: unknown): string {
  const body = stringAt(snapshot, "body");
  if (body) return `Current snapshot body excerpt: ${body.slice(0, 220)}`;
  const summary = stringAt(snapshot, "summary");
  if (summary) return `Current snapshot summary: ${summary}`;
  return "Current body content is not available in the local snapshot.";
}

function snapshotMap(report: unknown): Map<string, unknown> {
  const map = new Map<string, unknown>();
  const records = Array.isArray(report) ? report : arrayAt(report, "items");
  for (const record of records) {
    for (const key of pageKeys(record)) map.set(key, record);
  }
  return map;
}

function queueMap(report: unknown): Map<string, unknown> {
  const map = new Map<string, unknown>();
  const sections = ["safeDraftsReady", "needsDannyApproval", "blockedRiskyItems", "monitorOnly", "performanceChanges", "moneyOpportunities", "topPriorities"];
  for (const section of sections) {
    for (const item of arrayAt(report, section)) {
      const id = stringAt(item, "id");
      if (id) map.set(id, item);
    }
  }
  return map;
}

function findSnapshot(snapshots: Map<string, unknown>, draft: DraftSuggestion): unknown {
  for (const key of [draft.relatedUrl, draft.relatedPath]) {
    if (!key) continue;
    const snapshot = snapshots.get(key);
    if (snapshot) return snapshot;
  }
  return undefined;
}

function draftFrom(record: unknown): DraftSuggestion | undefined {
  const id = stringAt(record, "id");
  const sourceQueueItemId = stringAt(record, "sourceQueueItemId");
  const sourceReport = stringAt(record, "sourceReport");
  const department = stringAt(record, "department");
  const draftType = stringAt(record, "draftType");
  const title = stringAt(record, "title");
  const draftText = stringAt(record, "draftText");
  if (!id || !sourceQueueItemId || !sourceReport || !isDepartment(department) || !isDraftType(draftType) || !title || !draftText) {
    return undefined;
  }
  return {
    id,
    sourceQueueItemId,
    sourceReport,
    relatedUrl: stringAt(record, "relatedUrl"),
    relatedPath: stringAt(record, "relatedPath"),
    department,
    draftType,
    riskLevel: riskAt(record, "riskLevel", "medium"),
    statusStage: stringAt(record, "statusStage") ?? "detected",
    draftOnly: booleanAt(record, "draftOnly"),
    needsHumanReview: booleanAt(record, "needsHumanReview"),
    needsDannyApproval: booleanAt(record, "needsDannyApproval"),
    canAutoApply: booleanAt(record, "canAutoApply"),
    title,
    draftText,
    rationale: stringAt(record, "rationale") ?? "Preview generated from local draft suggestion.",
    safetyNotes: arrayAt(record, "safetyNotes").map(String),
    blockedReason: stringAt(record, "blockedReason"),
  };
}

function dedupePreviews(previews: PreviewItem[]): PreviewItem[] {
  const seen = new Set<string>();
  const output: PreviewItem[] = [];
  for (const preview of previews) {
    if (!seen.has(preview.id)) {
      seen.add(preview.id);
      output.push(preview);
    }
  }
  return output;
}

function renderMarkdown(report: {
  generatedAt: string;
  previewVersion: string;
  sourceReportsRead: string[];
  missingReports: string[];
  summaryCounts: Record<string, number>;
  approvalCounts: Record<string, number>;
  previews: PreviewItem[];
  safetyNotes: string[];
}): string {
  const ready = report.previews.filter((preview) => !preview.needsDannyApproval && !preview.blockedReason);
  const approval = report.previews.filter((preview) => preview.needsDannyApproval && !preview.blockedReason);
  const blocked = report.previews.filter((preview) => preview.blockedReason || preview.previewType === "blocked_research_preview");
  return [
    "# Preview Diff Engine v1",
    "",
    "## Preview Diff Engine Summary",
    "",
    `Generated: ${report.generatedAt}`,
    `Preview version: ${report.previewVersion}`,
    `Reports read: ${report.sourceReportsRead.length}`,
    `Missing reports: ${report.missingReports.length}`,
    `Previews generated: ${report.summaryCounts.previewCount}`,
    `Can auto apply: ${report.approvalCounts.canAutoApplyCount}`,
    "",
    "## Preview Diffs Ready for Review",
    "",
    renderPreviewItems(ready.slice(0, 20)),
    "",
    "## Needs Danny Approval",
    "",
    renderPreviewItems(approval.slice(0, 20)),
    "",
    "## Blocked / Research Preview",
    "",
    renderPreviewItems(blocked.slice(0, 20)),
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
    "- Review preview diffs as local simulated previews only.",
    "- Send affiliate, blocked, high-risk, trust/rating, scam/fraud, legal, or policy previews to Danny approval.",
    "- Use blocked previews for evidence gathering, not final wording.",
    "- Do not create patch files, update payloads, live edits, Supabase writes, or publishing actions from this report.",
  ].join("\n");
}

function renderPreviewItems(previews: PreviewItem[]): string {
  if (previews.length === 0) {
    return "No previews in this section from the available local reports.";
  }
  return previews.map((preview) => [
    `- ${preview.title}`,
    `  - Type: ${preview.previewType}`,
    `  - Source draft: ${preview.sourceDraftId}`,
    `  - Risk/stage: ${preview.riskLevel} / ${preview.statusStage}`,
    `  - Danny approval: ${preview.needsDannyApproval}`,
    `  - Preview: ${firstLine(preview.previewDiffText)}`,
  ].join("\n")).join("\n");
}

function sanitizeAffiliateUrls(value: string): string {
  return value.replace(/https?:\/\/\S+/gi, "[affiliate-url-omitted]");
}

function safeStage(value: string): StatusStage {
  if (value === "suspected" || value === "recommended") return value;
  return "detected";
}

function firstLine(value: string): string {
  return value.split(/\r?\n/)[0].slice(0, 180);
}

function pageKeys(record: unknown): string[] {
  return [stringAt(record, "url"), stringAt(record, "slug"), stringAt(record, "relatedUrl"), stringAt(record, "relatedPath")]
    .filter((key): key is string => Boolean(key));
}

function arrayAt(record: unknown, ...path: (string | number)[]): unknown[] {
  const value = valueAt(record, path);
  return Array.isArray(value) ? value : [];
}

function stringAt(record: unknown, ...path: (string | number)[]): string | undefined {
  const value = valueAt(record, path);
  return typeof value === "string" && value.trim() ? value : undefined;
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
  return parts.map(slugify).filter(Boolean).join("-").slice(0, 150);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isDraftType(value: string | undefined): value is DraftType {
  return value === "meta_title"
    || value === "meta_description"
    || value === "faq"
    || value === "internal_link"
    || value === "image_alt_text"
    || value === "refresh_outline"
    || value === "evidence_checklist"
    || value === "affiliate_cta"
    || value === "blocked_item_research"
    || value === "research_brief";
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
  buildPreviewDiffEngine().catch((error) => {
    logger.error("Preview diff engine failed", { error });
    process.exitCode = 1;
  });
}
